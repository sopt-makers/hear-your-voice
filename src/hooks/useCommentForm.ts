import { useContext } from 'react';
import { CommentFormContext } from '@context/CommentFormContext';

export function useCommentForm() {
  const ctx = useContext(CommentFormContext);
  if (!ctx) throw new Error('useCommentForm must be used within CommentFormProvider');
  return ctx;
}
