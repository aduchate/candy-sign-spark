import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LSFBVideo {
  word: string;
  videoUrl: string;
  pageUrl: string;
}

async function fetchVideoFromPage(word: string, pageUrl: string): Promise<LSFBVideo | null> {
  try {
    console.log(`Fetching video for word: ${word} from ${pageUrl}`);
    
    const response = await fetch(pageUrl);
    if (!response.ok) {
      console.error(`Failed to fetch page: ${response.status}`);
      return null;
    }

    const html = await response.text();
    
    // Extract video URL from the HTML
    // Look for video tags or specific patterns in the LSFB site
    const videoMatch = html.match(/<video[^>]*src=["']([^"']+)["']/i) ||
                      html.match(/videoUrl["']?\s*:\s*["']([^"']+)["']/i) ||
                      html.match(/data-video-src=["']([^"']+)["']/i);
    
    if (videoMatch && videoMatch[1]) {
      let videoUrl = videoMatch[1];
      
      // Make URL absolute if it's relative
      if (videoUrl.startsWith('/')) {
        videoUrl = `https://dico.lsfb.be${videoUrl}`;
      } else if (!videoUrl.startsWith('http')) {
        videoUrl = `https://dico.lsfb.be/${videoUrl}`;
      }
      
      console.log(`Found video URL: ${videoUrl}`);
      
      return {
        word,
        videoUrl,
        pageUrl
      };
    }
    
    console.log(`No video found for ${word}`);
    return null;
  } catch (error) {
    console.error(`Error fetching video for ${word}:`, error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, query } = await req.json();
    
    let results: LSFBVideo[] = [];
    
    if (type === 'alphabet') {
      // Fetch alphabet videos
      const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
      
      for (const letter of alphabet) {
        // Try different URL patterns for LSFB site
        const possibleUrls = [
          `https://dico.lsfb.be/signs/${letter.toLowerCase()}/`,
          `https://dico.lsfb.be/dico_adulte/sign/${letter.toLowerCase()}/`,
          `https://dico.lsfb.be/signs/lettre-${letter.toLowerCase()}/`
        ];
        
        let found = false;
        for (const url of possibleUrls) {
          const video = await fetchVideoFromPage(letter, url);
          if (video) {
            results.push(video);
            found = true;
            break;
          }
        }
        
        if (!found) {
          console.log(`Could not find video for letter: ${letter}`);
        }
      }
    } else if (type === 'search' && query) {
      // Search for specific words
      const searchUrl = `https://dico.lsfb.be/signs/${query.toLowerCase()}/`;
      const video = await fetchVideoFromPage(query, searchUrl);
      if (video) {
        results.push(video);
      }
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        results,
        count: results.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in fetch-lsfb-videos function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        results: []
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
