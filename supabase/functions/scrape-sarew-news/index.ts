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

    console.log('Starting to scrape SAREW articles...')

    const sarewUrl = 'http://www.sarew.be'
    let allArticles: any[] = []

    // Scrape main page for recent articles
    const mainResponse = await fetch(sarewUrl)
    if (mainResponse.ok) {
      const mainHtml = await mainResponse.text()
      allArticles = allArticles.concat(parseNewsArticles(mainHtml, sarewUrl))
    }

    // Scrape specific category pages
    const categories = [
      { url: 'http://www.sarew.be/category/atelier/', name: 'Atelier' },
      { url: 'http://www.sarew.be/category/evenements/', name: 'Événements' },
      { url: 'http://www.sarew.be/category/formations-accessibles/', name: 'Formations accessibles' },
      { url: 'http://www.sarew.be/category/projets/', name: 'Projets' },
    ]

    for (const category of categories) {
      try {
        const categoryResponse = await fetch(category.url)
        if (categoryResponse.ok) {
          const categoryHtml = await categoryResponse.text()
          const categoryArticles = parseNewsArticles(categoryHtml, sarewUrl)
          // Ensure category is set
          categoryArticles.forEach(article => {
            if (!article.category || article.category === 'Actualités') {
              article.category = category.name
            }
          })
          allArticles = allArticles.concat(categoryArticles)
        }
      } catch (error) {
        console.error(`Error fetching category ${category.name}:`, error)
      }
    }

    // Remove duplicates based on source_url
    const uniqueArticles = Array.from(
      new Map(allArticles.map(article => [article.source_url, article])).values()
    )

    console.log(`Found ${uniqueArticles.length} unique articles`)

    let insertedCount = 0
    let updatedCount = 0
    
    for (const article of uniqueArticles) {
      const { data: existing } = await supabaseAdmin
        .from('news_articles')
        .select('id')
        .eq('source_url', article.source_url)
        .single()

      if (existing) {
        const { error } = await supabaseAdmin
          .from('news_articles')
          .update({ 
            ...article,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id)

        if (!error) {
          updatedCount++
        } else {
          console.error('Error updating article:', error)
        }
      } else {
        const { error } = await supabaseAdmin
          .from('news_articles')
          .insert(article)

        if (!error) {
          insertedCount++
        } else {
          console.error('Error inserting article:', error)
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        inserted: insertedCount,
        updated: updatedCount,
        total: uniqueArticles.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error scraping SAREW news:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function parseNewsArticles(html: string, baseUrl: string): any[] {
  const articles: any[] = []

  // Extract article entries
  const articleRegex = /<article[^>]*class="[^"]*entry[^"]*"[^>]*>([\s\S]*?)<\/article>/gi
  const articleMatches = Array.from(html.matchAll(articleRegex))

  for (const articleMatch of articleMatches) {
    const articleHtml = articleMatch[1]

    // Extract title
    const titleMatch = articleHtml.match(/<h2[^>]*class="entry-title"[^>]*>[\s\S]*?<a[^>]*href="([^"]+)"[^>]*title="([^"]+)"[^>]*>/i)
    const title = titleMatch ? titleMatch[2].trim() : null
    const articleUrl = titleMatch ? titleMatch[1].trim() : null

    if (!title || !articleUrl) continue

    // Extract image
    const imgMatch = articleHtml.match(/<img[^>]*src="([^"]+)"[^>]*>/i)
    const imageUrl = imgMatch ? imgMatch[1].trim() : null

    // Extract date
    const dateMatch = articleHtml.match(/<time[^>]*datetime="([^"]+)"[^>]*>/i)
    const publishedAt = dateMatch ? dateMatch[1].trim() : new Date().toISOString()

    // Extract category
    const categoryMatch = articleHtml.match(/<a[^>]*rel="category tag"[^>]*>([^<]+)<\/a>/i)
    const category = categoryMatch ? categoryMatch[1].trim() : 'Actualités'

    // Extract excerpt
    const excerptMatch = articleHtml.match(/<div[^>]*class="entry-excerpt"[^>]*>([\s\S]*?)<\/div>/i)
    let excerpt = ''
    if (excerptMatch) {
      excerpt = excerptMatch[1]
        .replace(/<[^>]*>/g, '')
        .replace(/\s+/g, ' ')
        .trim()
    }

    articles.push({
      title: title,
      excerpt: excerpt || null,
      image_url: imageUrl,
      source_url: articleUrl,
      category: category,
      published_at: publishedAt
    })
  }

  console.log(`Parsed ${articles.length} articles`)
  return articles
}
