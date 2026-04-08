import { supabase } from '../supabase';

export async function hasActiveSprint(): Promise<boolean> {
  const { data, error } = await supabase.rpc('has_active_sprint');

  if (error) throw error;
  if (typeof data !== 'boolean') throw new Error('Unexpected response from server');

  return data;
}
