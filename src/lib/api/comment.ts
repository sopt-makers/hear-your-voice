import { supabase } from '@lib/supabase';
import type { CommentSubmissionPayload, CommentSubmitResult } from '@types';

export async function submitComment(data: CommentSubmissionPayload): Promise<CommentSubmitResult> {
  const { data: result, error } = await supabase.rpc('submit_comments', { p_payload: data });

  if (error) throw error;

  return result as CommentSubmitResult;
}
