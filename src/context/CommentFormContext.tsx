import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { SubmissionData } from '../types';

export type { SubmissionData };

interface CommentFormContextType {
  data: SubmissionData;
  update: (partial: Partial<SubmissionData>) => void;
}

const CommentFormContext = createContext<CommentFormContextType | null>(null);

const initialData: SubmissionData = {
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
  const [data, setData] = useState<SubmissionData>(initialData);

  const update = (partial: Partial<SubmissionData>) => {
    setData((prev) => ({ ...prev, ...partial }));
  };

  return <CommentFormContext.Provider value={{ data, update }}>{children}</CommentFormContext.Provider>;
}

export function useCommentForm() {
  const ctx = useContext(CommentFormContext);
  if (!ctx) throw new Error('useCommentForm must be used within CommentFormProvider');
  return ctx;
}
