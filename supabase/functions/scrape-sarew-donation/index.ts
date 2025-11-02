import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting SAREW donation page scraping...");

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const donationUrl = "https://www.sarew.be/nous-soutenir";
    
    console.log(`Fetching donation page: ${donationUrl}`);
    const response = await fetch(donationUrl);
    const html = await response.text();

    // Extract content from HTML
    const content = extractPageContent(html);
    
    // Extract image if available
    const imageUrl = extractImageUrl(html);

    console.log("Content extracted, updating database...");

    // Check if SAREW donation page already exists
    const { data: existing } = await supabase
      .from('donation_pages')
      .select('id')
      .eq('organization', 'SAREW')
      .single();

    if (existing) {
      // Update existing record
      const { error: updateError } = await supabase
        .from('donation_pages')
        .update({
          title: 'Nous soutenir',
          content: content,
          source_url: donationUrl,
          image_url: imageUrl,
          updated_at: new Date().toISOString(),
          scraped_at: new Date().toISOString()
        })
        .eq('id', existing.id);

      if (updateError) {
        console.error("Error updating donation page:", updateError);
        throw updateError;
      }
      console.log("Donation page updated successfully");
    } else {
      // Insert new record
      const { error: insertError } = await supabase
        .from('donation_pages')
        .insert({
          organization: 'SAREW',
          title: 'Nous soutenir',
          content: content,
          source_url: donationUrl,
          image_url: imageUrl
        });

      if (insertError) {
        console.error("Error inserting donation page:", insertError);
        throw insertError;
      }
      console.log("Donation page inserted successfully");
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Donation page scraped and stored successfully"
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error("Error in scrape-sarew-donation:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

function extractPageContent(html: string): string {
  // Remove scripts, styles, and other non-content elements
  let content = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, '')
    .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, '')
    .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, '');

  // Try to extract main content area
  const mainMatch = content.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  if (mainMatch) {
    content = mainMatch[1];
  } else {
    const articleMatch = content.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
    if (articleMatch) {
      content = articleMatch[1];
    } else {
      const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      if (bodyMatch) {
        content = bodyMatch[1];
      }
    }
  }

  return content.trim();
}

function extractImageUrl(html: string): string | null {
  // Try to find the main image
  const ogImageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
  if (ogImageMatch) {
    return ogImageMatch[1];
  }

  const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
  if (imgMatch) {
    return imgMatch[1];
  }

  return null;
}
