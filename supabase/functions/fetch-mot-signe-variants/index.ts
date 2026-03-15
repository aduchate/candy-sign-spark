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
    if (!word) {
      return new Response(
        JSON.stringify({ success: false, error: 'Word is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`Fetching mot-signe.be variants for: ${word}`);

    // Fetch the search page from mot-signe.be
    const searchUrl = `https://www.mot-signe.be/lexicons?search=${encodeURIComponent(word)}&sign-status=all`;
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

    // Extract video URLs from the HTML
    // mot-signe.be uses video.js players with source tags
    const videoPatterns = [
      /<source[^>]*src="([^"]*\.(?:mp4|webm))"[^>]*/gi,
      /<video[^>]*src="([^"]*\.(?:mp4|webm))"[^>]*/gi,
      /src:\s*["']([^"']*\.(?:mp4|webm))["']/gi,
    ];

    const videoUrls: string[] = [];
    for (const pattern of videoPatterns) {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        let url = match[1];
        if (!url.startsWith('http')) {
          url = new URL(url, 'https://www.mot-signe.be').href;
        }
        if (!videoUrls.includes(url)) {
          videoUrls.push(url);
        }
      }
    }

    // Also look for data attributes or JSON embedded data
    const dataPattern = /data-src="([^"]*\.(?:mp4|webm))"/gi;
    let match;
    while ((match = dataPattern.exec(html)) !== null) {
      let url = match[1];
      if (!url.startsWith('http')) {
        url = new URL(url, 'https://www.mot-signe.be').href;
      }
      if (!videoUrls.includes(url)) {
        videoUrls.push(url);
      }
    }

    // Look for SvelteKit embedded data in script tags
    const scriptDataPattern = /"video_url":\s*"([^"]+)"/gi;
    while ((match = scriptDataPattern.exec(html)) !== null) {
      let url = match[1];
      if (!url.startsWith('http')) {
        url = new URL(url, 'https://www.mot-signe.be').href;
      }
      if (!videoUrls.includes(url)) {
        videoUrls.push(url);
      }
    }

    // Also look for any URL patterns that look like video files
    const generalVideoPattern = /["'](https?:\/\/[^"']*\.(?:mp4|webm))['"]/gi;
    while ((match = generalVideoPattern.exec(html)) !== null) {
      const url = match[1];
      if (!videoUrls.includes(url)) {
        videoUrls.push(url);
      }
    }

    console.log(`Found ${videoUrls.length} video URLs for "${word}"`);

    if (videoUrls.length === 0) {
      return new Response(
        JSON.stringify({ success: true, word, variants: [], message: 'No videos found on mot-signe.be' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Store each variant in the database
    const storedVariants = [];
    for (let i = 0; i < videoUrls.length; i++) {
      const videoUrl = videoUrls[i];

      // Check if this exact video URL already exists
      const { data: existing } = await supabase
        .from('word_signs')
        .select('id')
        .eq('video_url', videoUrl)
        .maybeSingle();

      if (existing) {
        console.log(`Video URL already exists: ${videoUrl}`);
        storedVariants.push({ word, video_url: videoUrl, source: 'mot-signe.be', existing: true });
        continue;
      }

      // Download and upload the video
      try {
        const videoResponse = await fetch(videoUrl);
        if (!videoResponse.ok) {
          console.log(`Failed to download video: ${videoUrl}`);
          continue;
        }

        const videoBlob = await videoResponse.blob();
        const videoArrayBuffer = await videoBlob.arrayBuffer();
        const contentType = videoResponse.headers.get('content-type') || 'video/mp4';
        const ext = contentType.includes('webm') ? 'webm' : 'mp4';
        const fileName = `words/${word.toLowerCase().replace(/\s+/g, '-')}-variant-${i + 1}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from('lsfb-videos')
          .upload(fileName, videoArrayBuffer, { contentType, upsert: true });

        if (uploadError) {
          console.error(`Upload error for variant ${i + 1}:`, uploadError);
          continue;
        }

        const { data: urlData } = supabase.storage
          .from('lsfb-videos')
          .getPublicUrl(fileName);

        const publicUrl = urlData.publicUrl;

        // Insert as a new variant
        const { error: dbError } = await supabase
          .from('word_signs')
          .insert({
            word: word.toLowerCase(),
            video_url: publicUrl,
            source_url: searchUrl,
          });

        if (dbError) {
          console.error(`DB error for variant ${i + 1}:`, dbError);
          continue;
        }

        storedVariants.push({ word, video_url: publicUrl, source: 'mot-signe.be', existing: false });
        console.log(`Stored variant ${i + 1} for "${word}"`);
      } catch (err) {
        console.error(`Error processing variant ${i + 1}:`, err);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        word,
        variants: storedVariants,
        total_found: videoUrls.length,
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
