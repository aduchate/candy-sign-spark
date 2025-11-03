import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FetchRequest {
  word: string;
  type: 'alphabet' | 'word';
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { word, type }: FetchRequest = await req.json();
    console.log(`Fetching LSFB video for: ${word} (type: ${type})`);

    // Check if video already exists in DB
    if (type === 'alphabet') {
      const { data: existing } = await supabase
        .from('alphabet_signs')
        .select('video_url, source_url')
        .eq('letter', word.toUpperCase())
        .single();
      
      if (existing) {
        console.log(`Video already exists for letter ${word}`);
        return new Response(
          JSON.stringify({ success: true, video_url: existing.video_url, source_url: existing.source_url }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      const { data: existing } = await supabase
        .from('word_signs')
        .select('video_url, source_url, signed_grammar')
        .ilike('word', word)
        .single();
      
      if (existing) {
        console.log(`Video already exists for word ${word}`);
        return new Response(
          JSON.stringify({ success: true, video_url: existing.video_url, source_url: existing.source_url, signed_grammar: existing.signed_grammar }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Search for the sign on dico.lsfb.be
    const searchWord = word.toLowerCase().trim();
    
    // Function to remove accents and special characters
    const normalizeWord = (w: string) => {
      return w.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    };
    
    const wordVariants = [
      searchWord,
      normalizeWord(searchWord),
      searchWord.replace(/'/g, ''),
      searchWord.replace(/ /g, '-'),
    ].filter((v, i, arr) => arr.indexOf(v) === i); // unique variants
    
    let pageUrl = '';
    let response: Response | null = null;
    
    // Try each variant
    for (const variant of wordVariants) {
      const testUrl = `https://dico.lsfb.be/signs/${variant}`;
      console.log(`Trying URL: ${testUrl}`);
      const testResponse = await fetch(testUrl);
      
      if (testResponse.ok) {
        pageUrl = testUrl;
        response = testResponse;
        console.log(`Found page at: ${testUrl}`);
        break;
      }
    }
    
    // If not found, try alternative patterns for alphabet
    if (!response?.ok && type === 'alphabet') {
      const alternatives = [
        `https://dico.lsfb.be/signs/lettre-${searchWord}`,
        `https://dico.lsfb.be/signs/${searchWord}-lettre`,
      ];
      
      for (const altUrl of alternatives) {
        console.log(`Trying alternative URL: ${altUrl}`);
        const altResponse = await fetch(altUrl);
        if (altResponse.ok) {
          pageUrl = altUrl;
          response = altResponse;
          break;
        }
      }
    }

    if (!response || !response.ok) {
      console.log(`Page not found for ${word} (tried ${wordVariants.join(', ')})`);
      return new Response(
        JSON.stringify({ success: false, error: 'Sign not found on dico.lsfb.be' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    const html = await response.text();

    // Extract video URL
    const videoPatterns = [
      /<video[^>]*src="([^"]+)"/i,
      /<source[^>]*src="([^"]+)"/i,
      /data-video-src="([^"]+)"/i,
      /videoUrl["\s:]+["']([^"']+)["']/i,
    ];

    let videoUrl = '';
    for (const pattern of videoPatterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        videoUrl = match[1];
        if (!videoUrl.startsWith('http')) {
          videoUrl = new URL(videoUrl, 'https://dico.lsfb.be').href;
        }
        break;
      }
    }

    if (!videoUrl) {
      console.log(`No video URL found in page for ${word}`);
      return new Response(
        JSON.stringify({ success: false, error: 'Video URL not found on page' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    console.log(`Found video URL: ${videoUrl}`);

    // Download video
    const videoResponse = await fetch(videoUrl);
    if (!videoResponse.ok) {
      console.log(`Failed to download video from ${videoUrl}`);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to download video' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const videoBlob = await videoResponse.blob();
    const videoArrayBuffer = await videoBlob.arrayBuffer();
    
    // Determine file extension
    const contentType = videoResponse.headers.get('content-type') || 'video/mp4';
    const ext = contentType.includes('webm') ? 'webm' : contentType.includes('ogg') ? 'ogg' : 'mp4';
    
    // Upload to storage bucket
    const fileName = type === 'alphabet' 
      ? `alphabet/${word.toUpperCase()}.${ext}`
      : `words/${searchWord.replace(/\s+/g, '-')}.${ext}`;

    console.log(`Uploading to storage: ${fileName}`);
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('lsfb-videos')
      .upload(fileName, videoArrayBuffer, {
        contentType,
        upsert: true,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return new Response(
        JSON.stringify({ success: false, error: `Upload failed: ${uploadError.message}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('lsfb-videos')
      .getPublicUrl(fileName);

    const publicUrl = urlData.publicUrl;
    console.log(`Video uploaded successfully: ${publicUrl}`);

    // Extract grammar info if available (could be used for signed_grammar field)
    let signedGrammar = '';
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    if (descMatch && descMatch[1]) {
      signedGrammar = descMatch[1];
    }

    // Save to database
    if (type === 'alphabet') {
      const { error: dbError } = await supabase
        .from('alphabet_signs')
        .upsert({
          letter: word.toUpperCase(),
          video_url: publicUrl,
          source_url: pageUrl,
        }, { onConflict: 'letter' });

      if (dbError) {
        console.error('Database error:', dbError);
        return new Response(
          JSON.stringify({ success: false, error: `Database error: ${dbError.message}` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
    } else {
      const { error: dbError } = await supabase
        .from('word_signs')
        .insert({
          word: searchWord,
          video_url: publicUrl,
          source_url: pageUrl,
          signed_grammar: signedGrammar || null,
        });

      if (dbError) {
        console.error('Database error:', dbError);
        return new Response(
          JSON.stringify({ success: false, error: `Database error: ${dbError.message}` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        video_url: publicUrl,
        source_url: pageUrl,
        signed_grammar: signedGrammar || undefined,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
