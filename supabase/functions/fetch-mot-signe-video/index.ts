import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

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
    console.log(`Fetching corpus-lsfb.be variant for: ${word}`);

    // Find the word in word_signs
    const { data: existingWord } = await supabase
      .from('word_signs')
      .select('id')
      .ilike('word', word)
      .single();

    if (!existingWord) {
      return new Response(
        JSON.stringify({ success: false, error: 'Word not found in word_signs' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Check if variant already exists
    const { data: existingVariant } = await supabase
      .from('word_sign_variants')
      .select('id, video_url')
      .eq('word_sign_id', existingWord.id)
      .eq('source', 'corpus-lsfb')
      .maybeSingle();

    if (existingVariant) {
      return new Response(
        JSON.stringify({ success: true, video_url: existingVariant.video_url, already_exists: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 1: Search for the sign on corpus-lsfb.be using search.php
    const searchWord = word.toUpperCase().replace(/[éèê]/gi, 'E').replace(/[àâ]/gi, 'A').replace(/[ùû]/gi, 'U').replace(/[ôö]/gi, 'O').replace(/[îï]/gi, 'I').replace(/[ç]/gi, 'C');
    
    console.log(`Searching corpus-lsfb.be for: ${searchWord}`);
    const searchResponse = await fetch('https://www.corpus-lsfb.be/search.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `searching=${encodeURIComponent(searchWord)}`,
    });

    if (!searchResponse.ok) {
      console.log(`search.php returned ${searchResponse.status}`);
      return new Response(
        JSON.stringify({ success: false, error: 'corpus-lsfb.be search failed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    const searchHtml = await searchResponse.text();
    console.log(`Search returned ${searchHtml.length} chars`);
    console.log(`Search HTML preview: ${searchHtml.substring(0, 500)}`);

    // Extract sign IDs from the search results HTML
    // Try multiple patterns
    const patterns = [
      /id="(\d+)"[^>]*>[\s]*<td>([^<]+)<\/td>/gi,
      /id="(\d+)".*?<td>([^<]+)<\/td>/gi,
      /id=["'](\d+)["'][^>]*>.*?<td>\s*([^<]+?)\s*<\/td>/gis,
    ];
    
    let signId = '';
    let signName = '';

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(searchHtml)) !== null) {
        const candidateName = match[2].trim().toUpperCase();
        const candidateId = match[1];
        console.log(`Found candidate: ${candidateName} (id: ${candidateId})`);
        if (candidateName === searchWord || candidateName.startsWith(searchWord + '.') || candidateName.startsWith(searchWord + '-') || searchWord.includes(candidateName)) {
          signId = candidateId;
          signName = candidateName;
          if (candidateName === searchWord) break;
        }
      }
      if (signId) break;
    }

    if (!signId) {
      console.log(`No matching sign found for ${searchWord}`);
      return new Response(
        JSON.stringify({ success: false, error: `No sign found on corpus-lsfb.be for "${word}"` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    console.log(`Found sign: ${signName} (id: ${signId})`);

    // Step 2: Get the vocabulary data (includes GIF URL)
    const vocabResponse = await fetch(`https://www.corpus-lsfb.be/getVocabulaire.php?mot=${signId}`);
    if (!vocabResponse.ok) {
      return new Response(
        JSON.stringify({ success: false, error: 'getVocabulaire.php failed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    const vocabData = await vocabResponse.json();
    console.log(`Vocab data:`, JSON.stringify(vocabData));

    const gifPath = vocabData.url;
    if (!gifPath) {
      return new Response(
        JSON.stringify({ success: false, error: 'No GIF URL in vocabulary data' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Step 3: Download the GIF
    const gifUrl = `https://www.corpus-lsfb.be/img/pictures/${gifPath}`;
    console.log(`Downloading GIF: ${gifUrl}`);

    const gifResponse = await fetch(gifUrl);
    if (!gifResponse.ok) {
      console.log(`GIF download failed: ${gifResponse.status}`);
      // Store direct URL as fallback
      const { error: dbError } = await supabase
        .from('word_sign_variants')
        .insert({
          word_sign_id: existingWord.id,
          video_url: gifUrl,
          source: 'corpus-lsfb',
          source_url: `https://www.corpus-lsfb.be/lexique.php`,
          tags: [word, signName],
        });
      
      return new Response(
        JSON.stringify({ success: true, video_url: gifUrl, source: 'corpus-lsfb' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Upload to our storage
    const gifBlob = await gifResponse.blob();
    const gifArrayBuffer = await gifBlob.arrayBuffer();
    const contentType = gifResponse.headers.get('content-type') || 'image/gif';
    const ext = gifPath.split('.').pop() || 'gif';
    const fileName = `corpus-lsfb/${word.toLowerCase().replace(/\s+/g, '-')}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('lsfb-videos')
      .upload(fileName, gifArrayBuffer, { contentType, upsert: true });

    let storedUrl = gifUrl;
    if (!uploadError) {
      const { data: urlData } = supabase.storage.from('lsfb-videos').getPublicUrl(fileName);
      storedUrl = urlData.publicUrl;
    } else {
      console.error('Upload error:', uploadError);
    }

    // Save variant
    const { error: dbError } = await supabase
      .from('word_sign_variants')
      .insert({
        word_sign_id: existingWord.id,
        video_url: storedUrl,
        source: 'corpus-lsfb',
        source_url: `https://www.corpus-lsfb.be/lexique.php`,
        tags: [word, signName],
      });

    if (dbError) console.error('DB error:', dbError);

    return new Response(
      JSON.stringify({ success: true, video_url: storedUrl, sign_name: signName, source: 'corpus-lsfb' }),
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
