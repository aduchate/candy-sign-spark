import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Verify the user is an admin
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user is admin
    const { data: roles } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)

    const isAdmin = roles?.some(r => r.role === 'admin')
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Starting to scrape SAREW website...')

    // Fetch the SAREW job page
    const sarewUrl = 'http://www.sarew.be/offres-demploi/'
    const response = await fetch(sarewUrl)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch SAREW website: ${response.status}`)
    }

    const html = await response.text()
    
    // Parse HTML to extract job listings
    // This is a simple example - you may need to adjust based on actual HTML structure
    const jobListings = parseJobListings(html, sarewUrl)

    console.log(`Found ${jobListings.length} job listings`)

    // Insert or update job listings in database
    let insertedCount = 0
    for (const job of jobListings) {
      const { error } = await supabaseAdmin
        .from('job_listings')
        .upsert(job, { 
          onConflict: 'source_url',
          ignoreDuplicates: false 
        })

      if (!error) {
        insertedCount++
      } else {
        console.error('Error inserting job:', error)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        count: insertedCount,
        total: jobListings.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error scraping SAREW jobs:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function parseJobListings(html: string, baseUrl: string): any[] {
  const jobs: any[] = []

  // Extract H2 titles for job postings
  const titleRegex = /<h2[^>]*class="elementor-heading-title[^>]*>(.*?)<\/h2>/gi
  const titles = Array.from(html.matchAll(titleRegex)).map(match => 
    match[1].replace(/<[^>]*>/g, '').trim()
  )

  // Extract all image URLs
  const imageRegex = /<img[^>]*src="(http:\/\/www\.sarew\.be\/wp-content\/uploads\/[^"]+)"[^>]*>/gi
  const images = Array.from(html.matchAll(imageRegex)).map(match => match[1])

  // Parse each job title and associate with images
  titles.forEach((title, index) => {
    // Determine job category based on title
    let category = 'Offre d\'emploi'
    if (title.toLowerCase().includes('cdd')) category = 'CDD'
    else if (title.toLowerCase().includes('cdr')) category = 'CDR'
    else if (title.toLowerCase().includes('cdi')) category = 'CDI'
    
    // Extract contract type and position from title
    const parts = title.split(' - ')
    const position = parts[0]?.trim() || title
    const contractType = parts[1]?.trim() || category

    // Create a unique source URL for each job using the title as identifier
    const jobSourceUrl = `${baseUrl}#${encodeURIComponent(title)}`

    jobs.push({
      title: title,
      description: `${position}${contractType ? ' - ' + contractType : ''}\n\nConsultez les détails complets sur le site SAREW.`,
      category: category,
      source_url: jobSourceUrl,
      location: 'Wallonie, Belgique',
      company: 'SAREW asbl',
      contact_info: 'info@sarew.be',
      published_at: new Date().toISOString()
    })
  })

  console.log(`Parsed ${jobs.length} job listings`)
  return jobs
}