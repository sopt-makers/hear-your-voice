import { supabase } from '../supabase';
import type { SubmissionPayload } from '../../types/comment';
import type { CommentSubmitResult } from '../../types/comment';

export async function submitComment(data: SubmissionPayload): Promise<CommentSubmitResult> {
  const { data: result, error } = await supabase.rpc('submit_comments', { p_payload: data });

  if (error) throw error;

  return result as CommentSubmitResult;
}
