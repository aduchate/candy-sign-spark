import { supabase } from '@/integrations/supabase/client';

/**
 * Fetch all video URLs for a given word from word_signs.
 * Returns an array of video URLs (may be empty if no match).
 */
export async function fetchVideoUrlsForWord(
  word: string,
  matchMode: 'ilike' | 'eq' = 'ilike'
): Promise<string[]> {
  let query = supabase
    .from('word_signs')
    .select('video_url')

  if (matchMode === 'ilike') {
    query = query.ilike('word', word);
  } else {
    query = query.eq('word', word);
  }

  const { data } = await query;
  return (data ?? []).map(row => row.video_url).filter(Boolean);
}
