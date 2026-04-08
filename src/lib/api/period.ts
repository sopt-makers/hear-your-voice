import { supabase } from '../supabase';

export async function hasActiveSprint(): Promise<boolean> {
  const { data, error } = await supabase.rpc('has_active_sprint');

  if (error) throw error;

  return data as boolean;
}
