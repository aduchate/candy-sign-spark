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

    // Extract video URL from the HTML
    // Look for video tags or specific patterns in the LSFB website
    const videoMatch = html.match(/<video[^>]*src=["']([^"']+)["']/i) || 
                       html.match(/data-video-src=["']([^"']+)["']/i) ||
                       html.match(/file:\s*["']([^"']+\.mp4)["']/i);
    
    const videoUrl = videoMatch ? videoMatch[1] : null;

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
