import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CORPUS_API = 'https://dico.corpus-lsfb.be/api';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { word } = await req.json();
    if (!word) {
      return new Response(
        JSON.stringify({ success: false, error: 'Word is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`Fetching LSFB corpus variants for: ${word}`);

    // Use the official LSFB corpus API to search for sign variants
    const response = await fetch(`${CORPUS_API}/annotation/signs/${encodeURIComponent(word.toLowerCase())}`);
    if (!response.ok) {
      return new Response(
        JSON.stringify({ success: false, error: `Corpus API returned ${response.status}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    const signs = await response.json();
    console.log(`Found ${signs.length} sign variants for "${word}"`);

    if (!signs || signs.length === 0) {
      return new Response(
        JSON.stringify({ success: true, word, variants: [], message: 'No signs found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const storedVariants = [];

    for (let i = 0; i < signs.length; i++) {
      const sign = signs[i];
      const gifFilename = sign._url; // e.g. "signe_xxx.gif"
      const gloss = sign._gloss; // e.g. "BONJOUR"
      const keywords = sign._keywords; // e.g. "bonjour, salut, hey"

      // Check if this variant already exists in DB (by source_url)
      const sourceUrl = `${CORPUS_API}/annotation/gloss/${encodeURIComponent(gloss)}`;
      const { data: existing } = await supabase
        .from('word_signs')
        .select('id')
        .eq('source_url', sourceUrl)
        .maybeSingle();

      if (existing) {
        console.log(`Variant "${gloss}" already exists, skipping`);
        storedVariants.push({ word: word.toLowerCase(), gloss, existing: true });
        continue;
      }

      // Fetch the GIF from the gloss endpoint to get the actual gif data
      try {
        const gifResponse = await fetch(`${CORPUS_API}/annotation/gloss/${encodeURIComponent(gloss)}`);
        if (!gifResponse.ok) {
          console.log(`Failed to fetch gloss gif for ${gloss}`);
          continue;
        }

        const gifData = await gifResponse.json();
        const gifUrl = gifData._url; // relative gif filename

        // Try to download the GIF from various possible base URLs
        let gifBinary = null;
        const possibleBases = [
          `https://dico.corpus-lsfb.be/${gifUrl}`,
          `https://dico.corpus-lsfb.be/api/${gifUrl}`,
          `https://dico.corpus-lsfb.be/static/${gifUrl}`,
          `https://dico.corpus-lsfb.be/media/${gifUrl}`,
        ];

        for (const url of possibleBases) {
          try {
            const dl = await fetch(url);
            const contentType = dl.headers.get('content-type') || '';
            if (dl.ok && (contentType.includes('image') || contentType.includes('gif'))) {
              gifBinary = await dl.arrayBuffer();
              console.log(`Downloaded GIF from: ${url}`);
              break;
            }
          } catch (e) {
            // try next
          }
        }

        if (!gifBinary) {
          console.log(`Could not download GIF for ${gloss}, storing with API reference`);
          // Store with the API endpoint as the video URL (the gif is accessible via the API)
          const { error: dbError } = await supabase
            .from('word_signs')
            .insert({
              word: word.toLowerCase(),
              video_url: sourceUrl, // Store the API URL as reference
              source_url: sourceUrl,
              signed_grammar: `${gloss} (${keywords})`,
            });

          if (!dbError) {
            storedVariants.push({ word: word.toLowerCase(), gloss, stored: true });
          }
          continue;
        }

        // Upload GIF to storage
        const fileName = `words/${word.toLowerCase()}-corpus-${i + 1}.gif`;
        const { error: uploadError } = await supabase.storage
          .from('lsfb-videos')
          .upload(fileName, gifBinary, { contentType: 'image/gif', upsert: true });

        if (uploadError) {
          console.error(`Upload error for ${gloss}:`, uploadError);
          continue;
        }

        const { data: urlData } = supabase.storage
          .from('lsfb-videos')
          .getPublicUrl(fileName);

        // Insert into word_signs
        const { error: dbError } = await supabase
          .from('word_signs')
          .insert({
            word: word.toLowerCase(),
            video_url: urlData.publicUrl,
            source_url: sourceUrl,
            signed_grammar: `${gloss} (${keywords})`,
          });

        if (!dbError) {
          storedVariants.push({ word: word.toLowerCase(), gloss, video_url: urlData.publicUrl });
          console.log(`Stored variant ${gloss} for "${word}"`);
        }
      } catch (err) {
        console.error(`Error processing variant ${gloss}:`, err);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        word,
        variants: storedVariants,
        total_found: signs.length,
        total_stored: storedVariants.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
