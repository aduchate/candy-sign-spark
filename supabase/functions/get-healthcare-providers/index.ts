import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Returns the list of "pro" profiles a patient can pick as their healthcare
// provider (prestataire de soins). Emails live in auth.users (not the profiles
// table), so we use the admin client to join them in. Any authenticated user
// may call this — the response is intentionally limited to id / username /
// email of pros, nothing more.
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

    // Require an authenticated caller (any logged-in user is allowed).
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

    // Only "pro" profiles are eligible healthcare providers.
    const { data: pros, error: prosError } = await supabaseAdmin
      .from('profiles')
      .select('id, username')
      .eq('account_type', 'pro')

    if (prosError) {
      throw prosError
    }

    // Attach emails from auth.users so pros without a username are still
    // identifiable in the dropdown.
    const { data: { users: authUsers }, error: authError } = await supabaseAdmin.auth.admin.listUsers()

    if (authError) {
      throw authError
    }

    const providers = (pros ?? []).map(pro => {
      const authUser = authUsers.find(au => au.id === pro.id)
      return {
        id: pro.id,
        username: pro.username,
        email: authUser?.email ?? null,
      }
    })

    return new Response(
      JSON.stringify({ providers }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in get-healthcare-providers:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
