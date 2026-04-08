import { supabase } from '../supabase';
import type { SprintType } from '../../types/sprint';

export type { SprintType } from '../../types/sprint';

export async function hasActiveSprint(): Promise<boolean> {
  const { data, error } = await supabase.rpc('has_active_sprint');

  if (error) throw error;
  if (typeof data !== 'boolean') throw new Error('Unexpected response from server');

  return data;
}

export interface SprintInfo {
  is_valid: boolean;
  sprint_type: SprintType;
  sprint_name: string | null;
}

export async function getSprintInfoByCode(authCode: string): Promise<SprintInfo> {
  const { data, error } = await supabase.rpc('get_sprint_info_by_code', { p_auth_code: authCode });

  if (error) throw error;

  return data as SprintInfo;
}
