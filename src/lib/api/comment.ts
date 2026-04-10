import { supabase } from '../supabase';
import type { SubmissionData } from '../../types/submission';
import type { SubmitResult } from '../../types/comment';

export async function submitComment(data: SubmissionData): Promise<SubmitResult> {
  const { data: result, error } = await supabase.rpc('submit_comments', { p_payload: data });

  if (error) throw error;

  return result as SubmitResult;
}
