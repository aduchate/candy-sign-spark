import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { signUrl } = await req.json();
    
    if (!signUrl) {
      throw new Error('Sign URL is required');
    }

    console.log('Fetching sign from:', signUrl);

    // Fetch the page content
    const response = await fetch(signUrl);
    const html = await response.text();

    // Extract video URL from the HTML - try multiple patterns
    let videoUrl: string | null = null;
    
    // Pattern 1: Video tag with src
    const videoSrcMatch = html.match(/<video[^>]*src=["']([^"']+)["']/i);
    if (videoSrcMatch) videoUrl = videoSrcMatch[1];
    
    // Pattern 2: Source tag inside video
    if (!videoUrl) {
      const sourceMatch = html.match(/<source[^>]*src=["']([^"']+)["']/i);
      if (sourceMatch) videoUrl = sourceMatch[1];
    }
    
    // Pattern 3: data-video-src attribute
    if (!videoUrl) {
      const dataVideoMatch = html.match(/data-video-src=["']([^"']+)["']/i);
      if (dataVideoMatch) videoUrl = dataVideoMatch[1];
    }
    
    // Pattern 4: JavaScript file property
    if (!videoUrl) {
      const fileMatch = html.match(/file:\s*["']([^"']+\.mp4[^"']*)["']/i);
      if (fileMatch) videoUrl = fileMatch[1];
    }
    
    // Pattern 5: Direct .mp4 URLs in the HTML
    if (!videoUrl) {
      const mp4Match = html.match(/(https?:\/\/[^"'\s]+\.mp4[^"'\s]*)/i);
      if (mp4Match) videoUrl = mp4Match[1];
    }
    
    // Pattern 6: WordPress video shortcode
    if (!videoUrl) {
      const wpVideoMatch = html.match(/\[video[^\]]*src=["']([^"']+)["']/i);
      if (wpVideoMatch) videoUrl = wpVideoMatch[1];
    }
    
    // Make URL absolute if it's relative
    if (videoUrl && !videoUrl.startsWith('http')) {
      const baseUrl = new URL(signUrl);
      if (videoUrl.startsWith('/')) {
        videoUrl = `${baseUrl.origin}${videoUrl}`;
      } else {
        videoUrl = `${baseUrl.origin}/${videoUrl}`;
      }
    }

    // Extract the title
    const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/i) ||
                       html.match(/<title>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].replace(/\s*[-|].*$/, '').trim() : 'Unknown';

    // Extract description if available
    const descMatch = html.match(/<div[^>]*class="[^"]*description[^"]*"[^>]*>([^<]+)<\/div>/i) ||
                      html.match(/<p[^>]*class="[^"]*entry-content[^"]*"[^>]*>([^<]+)<\/p>/i);
    const description = descMatch ? descMatch[1].trim() : '';

    console.log('Extracted data:', { title, videoUrl, description });

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          title,
          videoUrl,
          description,
          sourceUrl: signUrl
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error fetching LSFB sign:', error);
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
