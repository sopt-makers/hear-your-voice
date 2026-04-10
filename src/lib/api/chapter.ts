import { supabase } from '../supabase';

export interface ChapterCode {
  code: string;
  name: string;
}

export async function getChapterCodes(): Promise<ChapterCode[]> {
  const { data, error } = await supabase.rpc('get_chapter_codes');

  if (error) throw error;

  return data as ChapterCode[];
}

export async function getTeamCodes(): Promise<ChapterCode[]> {
  const { data, error } = await supabase.rpc('get_team_codes');

  if (error) throw error;

  return data as ChapterCode[];
}
