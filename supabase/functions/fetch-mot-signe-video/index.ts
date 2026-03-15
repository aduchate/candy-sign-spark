import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
    console.log(`Fetching mot-signe.be video for: ${word}`);

    // First check if we already have a variant for this word
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
      .eq('source', 'mot-signe')
      .maybeSingle();

    if (existingVariant) {
      console.log(`Variant already exists for ${word}`);
      return new Response(
        JSON.stringify({ success: true, video_url: existingVariant.video_url, already_exists: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch search page from mot-signe.be
    const searchUrl = `https://www.mot-signe.be/lexicons?search=${encodeURIComponent(word)}&sign-status=all`;
    console.log(`Fetching: ${searchUrl}`);
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
      },
    });

    if (!response.ok) {
      console.log(`mot-signe.be returned ${response.status}`);
      return new Response(
        JSON.stringify({ success: false, error: `mot-signe.be returned ${response.status}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    const html = await response.text();
    console.log(`Got HTML (${html.length} chars)`);

    // Extract video URLs from the HTML
    // mot-signe.be uses video.js with <source> tags
    const videoPatterns = [
      // Standard source tags with mp4/webm
      /<source[^>]*src="([^"]*\.(?:mp4|webm))"[^>]*>/gi,
      // Video tags with src attribute
      /<video[^>]*src="([^"]*\.(?:mp4|webm))"[^>]*>/gi,
      // Data attributes
      /data-src="([^"]*\.(?:mp4|webm))"/gi,
      // JSON embedded data with video URLs
      /"(?:video_?[Uu]rl|url|src)"\s*:\s*"([^"]*\.(?:mp4|webm))"/gi,
      // Any URL ending in mp4 or webm
      /https?:\/\/[^\s"'<>]*\.(?:mp4|webm)/gi,
    ];

    const foundUrls: string[] = [];
    for (const pattern of videoPatterns) {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        const url = match[1] || match[0];
        if (url && url.startsWith('http') && !foundUrls.includes(url)) {
          foundUrls.push(url);
        }
      }
    }

    console.log(`Found ${foundUrls.length} video URLs`);

    if (foundUrls.length === 0) {
      // Try to find GIF/WEBP animated images as fallback
      const gifPatterns = [
        /https?:\/\/[^\s"'<>]*\.(?:gif|webp)/gi,
        /<img[^>]*src="([^"]*\.(?:gif|webp))"[^>]*>/gi,
      ];
      
      for (const pattern of gifPatterns) {
        let match;
        while ((match = pattern.exec(html)) !== null) {
          const url = match[1] || match[0];
          if (url && url.startsWith('http') && !foundUrls.includes(url)) {
            foundUrls.push(url);
          }
        }
      }
      
      console.log(`Found ${foundUrls.length} image URLs as fallback`);
    }

    if (foundUrls.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'No video found on mot-signe.be', html_length: html.length }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Take the first video URL found
    const videoUrl = foundUrls[0];
    console.log(`Using video URL: ${videoUrl}`);

    // Try to download and re-upload to our storage
    try {
      const videoResponse = await fetch(videoUrl);
      if (videoResponse.ok) {
        const videoBlob = await videoResponse.blob();
        const videoArrayBuffer = await videoBlob.arrayBuffer();
        
        const contentType = videoResponse.headers.get('content-type') || 'video/mp4';
        const ext = videoUrl.includes('.webm') ? 'webm' : videoUrl.includes('.gif') ? 'gif' : videoUrl.includes('.webp') ? 'webp' : 'mp4';
        
        const fileName = `mot-signe/${word.toLowerCase().replace(/\s+/g, '-')}.${ext}`;
        
        const { error: uploadError } = await supabase.storage
          .from('lsfb-videos')
          .upload(fileName, videoArrayBuffer, {
            contentType,
            upsert: true,
          });

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from('lsfb-videos')
            .getPublicUrl(fileName);

          const storedUrl = urlData.publicUrl;

          // Extract tags from HTML context around the video
          const tags: string[] = [];
          const tagPattern = new RegExp(`(?:${word}[^<]*?)(?:<[^>]+class="[^"]*badge[^"]*"[^>]*>([^<]+)<)`, 'gi');
          let tagMatch;
          while ((tagMatch = tagPattern.exec(html)) !== null) {
            if (tagMatch[1]) tags.push(tagMatch[1].trim());
          }

          // Save variant to database
          const { error: dbError } = await supabase
            .from('word_sign_variants')
            .insert({
              word_sign_id: existingWord.id,
              video_url: storedUrl,
              source: 'mot-signe',
              source_url: searchUrl,
              tags: tags.length > 0 ? tags : [word],
            });

          if (dbError) {
            console.error('DB error:', dbError);
          }

          return new Response(
            JSON.stringify({ success: true, video_url: storedUrl, source_url: searchUrl, tags }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
    } catch (downloadError) {
      console.error('Download/upload error:', downloadError);
    }

    // Fallback: store the direct URL without re-uploading
    const { error: dbError } = await supabase
      .from('word_sign_variants')
      .insert({
        word_sign_id: existingWord.id,
        video_url: videoUrl,
        source: 'mot-signe',
        source_url: searchUrl,
        tags: [word],
      });

    if (dbError) {
      console.error('DB error:', dbError);
    }

    return new Response(
      JSON.stringify({ success: true, video_url: videoUrl, source_url: searchUrl }),
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
