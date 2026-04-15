import { supabase } from '@lib/supabase';

export async function isValidUser(name: string, teamCode: string, chapterCode: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('is_valid_user', {
    p_name: name,
    p_team_code: teamCode,
    p_chapter_code: chapterCode,
  });

  if (error) throw error;

  return data as boolean;
}
