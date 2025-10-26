import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Dictionnaire étendu de mots LSFB avec leurs vidéos
const lsfbDictionary: Record<string, string> = {
  // Salutations
  "bonjour": "https://media.spreadthesign.com/video/mp4/13/47860.mp4",
  "bonsoir": "https://media.spreadthesign.com/video/mp4/13/47861.mp4",
  "salut": "https://media.spreadthesign.com/video/mp4/13/47862.mp4",
  "au revoir": "https://media.spreadthesign.com/video/mp4/13/47863.mp4",
  
  // Politesse
  "merci": "https://media.spreadthesign.com/video/mp4/13/47892.mp4",
  "s'il vous plaît": "https://media.spreadthesign.com/video/mp4/13/47893.mp4",
  "pardon": "https://media.spreadthesign.com/video/mp4/13/47894.mp4",
  "excusez-moi": "https://media.spreadthesign.com/video/mp4/13/47895.mp4",
  
  // Réponses
  "oui": "https://media.spreadthesign.com/video/mp4/13/48015.mp4",
  "non": "https://media.spreadthesign.com/video/mp4/13/48016.mp4",
  "peut-être": "https://media.spreadthesign.com/video/mp4/13/48017.mp4",
  
  // Famille
  "famille": "https://media.spreadthesign.com/video/mp4/13/47950.mp4",
  "maman": "https://media.spreadthesign.com/video/mp4/13/47951.mp4",
  "papa": "https://media.spreadthesign.com/video/mp4/13/47952.mp4",
  "frère": "https://media.spreadthesign.com/video/mp4/13/47953.mp4",
  "sœur": "https://media.spreadthesign.com/video/mp4/13/47954.mp4",
  "enfant": "https://media.spreadthesign.com/video/mp4/13/47955.mp4",
  
  // Actions quotidiennes
  "manger": "https://media.spreadthesign.com/video/mp4/13/47995.mp4",
  "boire": "https://media.spreadthesign.com/video/mp4/13/47996.mp4",
  "dormir": "https://media.spreadthesign.com/video/mp4/13/48050.mp4",
  "travailler": "https://media.spreadthesign.com/video/mp4/13/48100.mp4",
  "jouer": "https://media.spreadthesign.com/video/mp4/13/48101.mp4",
  "étudier": "https://media.spreadthesign.com/video/mp4/13/48102.mp4",
  "lire": "https://media.spreadthesign.com/video/mp4/13/48103.mp4",
  "écrire": "https://media.spreadthesign.com/video/mp4/13/48104.mp4",
  
  // Lieux
  "maison": "https://media.spreadthesign.com/video/mp4/13/48200.mp4",
  "école": "https://media.spreadthesign.com/video/mp4/13/48150.mp4",
  "hôpital": "https://media.spreadthesign.com/video/mp4/13/48151.mp4",
  "magasin": "https://media.spreadthesign.com/video/mp4/13/48152.mp4",
  "restaurant": "https://media.spreadthesign.com/video/mp4/13/48153.mp4",
  
  // Pronoms et personnes
  "je": "https://media.spreadthesign.com/video/mp4/13/48250.mp4",
  "tu": "https://media.spreadthesign.com/video/mp4/13/48251.mp4",
  "il": "https://media.spreadthesign.com/video/mp4/13/48252.mp4",
  "elle": "https://media.spreadthesign.com/video/mp4/13/48253.mp4",
  "nous": "https://media.spreadthesign.com/video/mp4/13/48254.mp4",
  "vous": "https://media.spreadthesign.com/video/mp4/13/48255.mp4",
  "ils": "https://media.spreadthesign.com/video/mp4/13/48256.mp4",
  "ami": "https://media.spreadthesign.com/video/mp4/13/47890.mp4",
  
  // Temps
  "aujourd'hui": "https://media.spreadthesign.com/video/mp4/13/48300.mp4",
  "demain": "https://media.spreadthesign.com/video/mp4/13/48301.mp4",
  "hier": "https://media.spreadthesign.com/video/mp4/13/48302.mp4",
  "maintenant": "https://media.spreadthesign.com/video/mp4/13/48303.mp4",
  
  // Verbes auxiliaires
  "être": "https://media.spreadthesign.com/video/mp4/13/48400.mp4",
  "avoir": "https://media.spreadthesign.com/video/mp4/13/48401.mp4",
  "aller": "https://media.spreadthesign.com/video/mp4/13/48402.mp4",
  "faire": "https://media.spreadthesign.com/video/mp4/13/48403.mp4",
  "vouloir": "https://media.spreadthesign.com/video/mp4/13/48404.mp4",
  "pouvoir": "https://media.spreadthesign.com/video/mp4/13/48405.mp4",
  
  // Émotions
  "heureux": "https://media.spreadthesign.com/video/mp4/13/48500.mp4",
  "triste": "https://media.spreadthesign.com/video/mp4/13/48501.mp4",
  "content": "https://media.spreadthesign.com/video/mp4/13/48502.mp4",
  "fatigué": "https://media.spreadthesign.com/video/mp4/13/48503.mp4",
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    // Mapper chaque mot à sa vidéo
    const translations: Array<{ word: string; videoUrl: string | null; found: boolean }> = [];
    
    for (const word of words) {
      const videoUrl = lsfbDictionary[word];
      translations.push({
        word,
        videoUrl: videoUrl || null,
        found: !!videoUrl
      });
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
