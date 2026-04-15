import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { CommentFormState } from '../types';

export type { CommentFormState };

interface CommentFormContextType {
  data: CommentFormState;
  update: (partial: Partial<CommentFormState>) => void;
}

const CommentFormContext = createContext<CommentFormContextType | null>(null);

const initialData: CommentFormState = {
  p_sprint_auth_code: '',
  user_name: '',
  user_team: '',
  user_chapter: '',
  stop_comments: [],
  start_comments: [],
  continue_comments: [],
  mvp: null,
};

export function CommentFormProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<CommentFormState>(initialData);

  const update = (partial: Partial<CommentFormState>) => {
    setData((prev) => ({ ...prev, ...partial }));
  };

  return <CommentFormContext.Provider value={{ data, update }}>{children}</CommentFormContext.Provider>;
}

export function useCommentForm() {
  const ctx = useContext(CommentFormContext);
  if (!ctx) throw new Error('useCommentForm must be used within CommentFormProvider');
  return ctx;
}
