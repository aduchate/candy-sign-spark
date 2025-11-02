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
    const sarewUrl = 'http://www.sarew.be/accompagnement-vers-lemploi-et-dans-lemploi/recherche-demploi/'
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
  // This is a placeholder function
  // You'll need to adjust this based on the actual HTML structure of the SAREW website
  const jobs: any[] = []

  // Example parsing logic - adjust based on actual HTML structure
  const titleRegex = /<h3[^>]*>(.*?)<\/h3>/gi
  const matches = html.matchAll(titleRegex)

  for (const match of matches) {
    const title = match[1].replace(/<[^>]*>/g, '').trim()
    
    if (title) {
      jobs.push({
        title: title,
        description: 'Description à compléter',
        category: 'Recherche d\'emploi',
        source_url: baseUrl,
        location: 'Belgique',
        company: 'SAREW',
        published_at: new Date().toISOString()
      })
    }
  }

  // If no jobs found with simple regex, add a default entry
  if (jobs.length === 0) {
    jobs.push({
      title: 'Accompagnement vers l\'emploi - SAREW',
      description: 'Services d\'accompagnement et de recherche d\'emploi pour personnes sourdes et malentendantes',
      category: 'Accompagnement',
      source_url: baseUrl,
      location: 'Bruxelles, Belgique',
      company: 'SAREW asbl',
      contact_info: 'Contact via le site SAREW',
      published_at: new Date().toISOString()
    })
  }

  return jobs
}