import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Dictionnaire LSFB étendu avec les URLs des vidéos du site officiel
const lsfbDictionary: Record<string, string> = {
  // Pronoms
  "je": "https://dico.lsfb.be/signs/je-2/",
  "moi": "https://dico.lsfb.be/signs/moi/",
  "tu": "https://dico.lsfb.be/signs/tu/",
  "toi": "https://dico.lsfb.be/signs/toi/",
  "il": "https://dico.lsfb.be/signs/il-1/",
  "elle": "https://dico.lsfb.be/signs/elle-1/",
  "nous": "https://dico.lsfb.be/signs/nous/",
  "vous": "https://dico.lsfb.be/signs/vous/",
  "ils": "https://dico.lsfb.be/signs/ils/",
  "elles": "https://dico.lsfb.be/signs/elles/",
  "on": "https://dico.lsfb.be/signs/on/",
  "qui": "https://dico.lsfb.be/signs/qui/",
  "que": "https://dico.lsfb.be/signs/que/",
  "quoi": "https://dico.lsfb.be/signs/quoi/",
  "où": "https://dico.lsfb.be/signs/ou/",
  "quand": "https://dico.lsfb.be/signs/quand/",
  "comment": "https://dico.lsfb.be/signs/comment/",
  "pourquoi": "https://dico.lsfb.be/signs/pourquoi/",
  
  // Verbes essentiels
  "être": "https://dico.lsfb.be/signs/etre/",
  "avoir": "https://dico.lsfb.be/signs/avoir/",
  "aller": "https://dico.lsfb.be/signs/aller/",
  "venir": "https://dico.lsfb.be/signs/venir/",
  "faire": "https://dico.lsfb.be/signs/faire/",
  "dire": "https://dico.lsfb.be/signs/dire/",
  "pouvoir": "https://dico.lsfb.be/signs/pouvoir/",
  "vouloir": "https://dico.lsfb.be/signs/vouloir/",
  "devoir": "https://dico.lsfb.be/signs/devoir/",
  "voir": "https://dico.lsfb.be/signs/voir/",
  "savoir": "https://dico.lsfb.be/signs/savoir/",
  "aimer": "https://dico.lsfb.be/signs/aimer/",
  "manger": "https://dico.lsfb.be/signs/manger/",
  "boire": "https://dico.lsfb.be/signs/boire/",
  "dormir": "https://dico.lsfb.be/signs/dormir/",
  "parler": "https://dico.lsfb.be/signs/parler/",
  "entendre": "https://dico.lsfb.be/signs/entendre/",
  "travailler": "https://dico.lsfb.be/signs/travailler/",
  "étudier": "https://dico.lsfb.be/signs/etudier/",
  "comprendre": "https://dico.lsfb.be/signs/comprendre/",
  "apprendre": "https://dico.lsfb.be/signs/apprendre/",
  "enseigner": "https://dico.lsfb.be/signs/enseigner/",
  "regarder": "https://dico.lsfb.be/signs/regarder/",
  "écouter": "https://dico.lsfb.be/signs/ecouter/",
  "lire": "https://dico.lsfb.be/signs/lire/",
  "écrire": "https://dico.lsfb.be/signs/ecrire/",
  "jouer": "https://dico.lsfb.be/signs/jouer/",
  
  // Salutations et politesse
  "bonjour": "https://dico.lsfb.be/signs/bonjour/",
  "bonsoir": "https://dico.lsfb.be/signs/bonsoir/",
  "bonne": "https://dico.lsfb.be/signs/bon/",
  "nuit": "https://dico.lsfb.be/signs/nuit/",
  "salut": "https://dico.lsfb.be/signs/salut/",
  "au": "https://dico.lsfb.be/signs/a/",
  "revoir": "https://dico.lsfb.be/signs/revoir/",
  "merci": "https://dico.lsfb.be/signs/merci/",
  "pardon": "https://dico.lsfb.be/signs/pardon/",
  "excuse": "https://dico.lsfb.be/signs/excuse/",
  "désolé": "https://dico.lsfb.be/signs/desole/",
  "s'il": "https://dico.lsfb.be/signs/sil-vous-plait/",
  "plaît": "https://dico.lsfb.be/signs/sil-vous-plait/",
  "plait": "https://dico.lsfb.be/signs/sil-vous-plait/",
  
  // Réponses courantes
  "oui": "https://dico.lsfb.be/signs/oui/",
  "non": "https://dico.lsfb.be/signs/non/",
  "peut-être": "https://dico.lsfb.be/signs/peut-etre/",
  "d'accord": "https://dico.lsfb.be/signs/daccord/",
  "accord": "https://dico.lsfb.be/signs/daccord/",
  "bien": "https://dico.lsfb.be/signs/bien/",
  "mal": "https://dico.lsfb.be/signs/mal/",
  
  // Émotions et sentiments
  "content": "https://dico.lsfb.be/signs/content/",
  "heureux": "https://dico.lsfb.be/signs/heureux/",
  "joyeux": "https://dico.lsfb.be/signs/joyeux/",
  "triste": "https://dico.lsfb.be/signs/triste/",
  "fatigué": "https://dico.lsfb.be/signs/fatigue/",
  "malade": "https://dico.lsfb.be/signs/malade/",
  
  // Famille
  "famille": "https://dico.lsfb.be/signs/famille/",
  "parent": "https://dico.lsfb.be/signs/parent/",
  "parents": "https://dico.lsfb.be/signs/parents/",
  "père": "https://dico.lsfb.be/signs/pere/",
  "papa": "https://dico.lsfb.be/signs/papa/",
  "mère": "https://dico.lsfb.be/signs/mere/",
  "maman": "https://dico.lsfb.be/signs/maman/",
  "enfant": "https://dico.lsfb.be/signs/enfant/",
  "enfants": "https://dico.lsfb.be/signs/enfants/",
  "fils": "https://dico.lsfb.be/signs/fils/",
  "fille": "https://dico.lsfb.be/signs/fille/",
  "frère": "https://dico.lsfb.be/signs/frere/",
  "sœur": "https://dico.lsfb.be/signs/soeur/",
  
  // Relations
  "ami": "https://dico.lsfb.be/signs/ami/",
  "amie": "https://dico.lsfb.be/signs/ami/",
  "amis": "https://dico.lsfb.be/signs/amis/",
  
  // Lieux
  "maison": "https://dico.lsfb.be/signs/maison/",
  "école": "https://dico.lsfb.be/signs/ecole/",
  "travail": "https://dico.lsfb.be/signs/travail/",
  "hôpital": "https://dico.lsfb.be/signs/hopital/",
  "magasin": "https://dico.lsfb.be/signs/magasin/",
  "restaurant": "https://dico.lsfb.be/signs/restaurant/",
  
  // Nombres
  "un": "https://dico.lsfb.be/signs/un/",
  "une": "https://dico.lsfb.be/signs/un/",
  "deux": "https://dico.lsfb.be/signs/deux/",
  "trois": "https://dico.lsfb.be/signs/trois/",
  "quatre": "https://dico.lsfb.be/signs/quatre/",
  "cinq": "https://dico.lsfb.be/signs/cinq/",
  "six": "https://dico.lsfb.be/signs/six/",
  "sept": "https://dico.lsfb.be/signs/sept/",
  "huit": "https://dico.lsfb.be/signs/huit/",
  "neuf": "https://dico.lsfb.be/signs/neuf/",
  "dix": "https://dico.lsfb.be/signs/dix/",
  
  // Temps
  "aujourd'hui": "https://dico.lsfb.be/signs/aujourdhui/",
  "hier": "https://dico.lsfb.be/signs/hier/",
  "demain": "https://dico.lsfb.be/signs/demain/",
  "maintenant": "https://dico.lsfb.be/signs/maintenant/",
  
  // Mots de liaison
  "et": "https://dico.lsfb.be/signs/et/",
  "ou": "https://dico.lsfb.be/signs/ou/",
  "mais": "https://dico.lsfb.be/signs/mais/",
  "avec": "https://dico.lsfb.be/signs/avec/",
  "sans": "https://dico.lsfb.be/signs/sans/",
  "pour": "https://dico.lsfb.be/signs/pour/",
  "dans": "https://dico.lsfb.be/signs/dans/",
  "sur": "https://dico.lsfb.be/signs/sur/",
  
  // Articles et déterminants
  "le": "https://dico.lsfb.be/signs/le/",
  "la": "https://dico.lsfb.be/signs/la/",
  "les": "https://dico.lsfb.be/signs/les/",
  "de": "https://dico.lsfb.be/signs/de/",
  "mon": "https://dico.lsfb.be/signs/mon/",
  "ma": "https://dico.lsfb.be/signs/ma/",
  "mes": "https://dico.lsfb.be/signs/mes/",
  "ton": "https://dico.lsfb.be/signs/ton/",
  "ta": "https://dico.lsfb.be/signs/ta/",
  "son": "https://dico.lsfb.be/signs/son/",
  "sa": "https://dico.lsfb.be/signs/sa/",
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
