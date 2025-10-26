import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { text } = await req.json();
    console.log('Translating text:', text);

    if (!text || typeof text !== 'string') {
      throw new Error('Text is required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Utiliser Lovable AI pour corriger et normaliser le texte
    const correctionResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `Tu es un correcteur orthographique français. Corrige le texte en respectant ces règles:
1. Corrige uniquement les fautes d'orthographe
2. Conserve la structure de la phrase
3. Retourne SEULEMENT le texte corrigé, rien d'autre
4. Ne change pas le sens de la phrase
5. Mets les mots au singulier quand c'est possible pour faciliter la traduction`
          },
          {
            role: 'user',
            content: text
          }
        ],
      }),
    });

    if (!correctionResponse.ok) {
      console.error('AI correction error:', correctionResponse.status);
      throw new Error('Failed to correct text');
    }

    const correctionData = await correctionResponse.json();
    const correctedText = correctionData.choices[0].message.content.trim();
    console.log('Corrected text:', correctedText);

    // Découper le texte en mots
    const words = correctedText
      .toLowerCase()
      .replace(/[.,!?;:]/g, '')
      .split(/\s+/)
      .filter((w: string) => w.length > 0);

    console.log('Words to translate:', words);

    // Mapper chaque mot à sa vidéo depuis la base de données
    const translations: Array<{ word: string; videoUrl: string | null; found: boolean }> = [];
    
    for (const word of words) {
      // Vérifier d'abord dans la base de données
      const { data: existingData } = await supabase
        .from('word_signs')
        .select('video_url')
        .ilike('word', word)
        .single();

      if (existingData?.video_url) {
        // Vidéo déjà en base
        translations.push({
          word,
          videoUrl: existingData.video_url,
          found: true
        });
        console.log(`Found existing video for: ${word}`);
      } else {
        // Essayer de télécharger la vidéo
        console.log(`Fetching video for: ${word}`);
        try {
          const fetchResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/fetch-and-store-lsfb-video`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ word, type: 'word' }),
          });

          if (fetchResponse.ok) {
            const fetchData = await fetchResponse.json();
            if (fetchData.success && fetchData.video_url) {
              translations.push({
                word,
                videoUrl: fetchData.video_url,
                found: true
              });
              console.log(`Successfully fetched and stored video for: ${word}`);
            } else {
              translations.push({ word, videoUrl: null, found: false });
              console.log(`Video not found for: ${word}`);
            }
          } else {
            translations.push({ word, videoUrl: null, found: false });
            console.log(`Failed to fetch video for: ${word}`);
          }
        } catch (error) {
          console.error(`Error fetching video for ${word}:`, error);
          translations.push({ word, videoUrl: null, found: false });
        }
      }
    }

    const foundCount = translations.filter(t => t.found).length;
    const totalCount = translations.length;

    console.log(`Translation result: ${foundCount}/${totalCount} words found`);

    return new Response(
      JSON.stringify({
        success: true,
        originalText: text,
        correctedText,
        translations,
        stats: {
          total: totalCount,
          found: foundCount,
          missing: totalCount - foundCount
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error in translate-sentence-lsfb:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
