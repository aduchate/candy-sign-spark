import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FilterRequest {
  ageGroup: 'enfant' | 'adulte';
  level: 'A1' | 'A2' | 'B1' | 'B2';
  userId?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { ageGroup, level, userId }: FilterRequest = await req.json();

    // Get lessons filtered by age group and level
    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('*, exercises(*)')
      .eq('age_group', ageGroup)
      .eq('level', level)
      .order('order_index');

    if (lessonsError) {
      throw lessonsError;
    }

    // If userId provided, get user progress
    let progressMap: Record<string, any> = {};
    if (userId) {
      const { data: progress } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId);

      if (progress) {
        progressMap = progress.reduce((acc, p) => {
          acc[p.lesson_id] = p;
          return acc;
        }, {} as Record<string, any>);
      }
    }

    // Enrich lessons with progress data
    const enrichedLessons = lessons?.map(lesson => ({
      ...lesson,
      progress: progressMap[lesson.id] || null,
    }));

    return new Response(
      JSON.stringify({ lessons: enrichedLessons }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in get-filtered-lessons:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
