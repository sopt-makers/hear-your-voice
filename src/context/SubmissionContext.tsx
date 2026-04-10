import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface Comment {
  target_user_id: number;
  comment_text: string;
}

interface Mvp {
  target_user_id: number;
  comment_text: string;
}

export interface SubmissionData {
  p_sprint_auth_code: string;
  user_name: string;
  user_team: string;
  user_chapter: string;
  stop_comments: Comment[];
  start_comments: Comment[];
  continue_comments: Comment[];
  mvp: Mvp | null;
}

interface SubmissionContextType {
  data: SubmissionData;
  update: (partial: Partial<SubmissionData>) => void;
}

const SubmissionContext = createContext<SubmissionContextType | null>(null);

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

export function SubmissionProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<SubmissionData>(initialData);

  const update = (partial: Partial<SubmissionData>) => {
    setData((prev) => ({ ...prev, ...partial }));
  };

  return <SubmissionContext.Provider value={{ data, update }}>{children}</SubmissionContext.Provider>;
}

export function useSubmission() {
  const ctx = useContext(SubmissionContext);
  if (!ctx) throw new Error('useSubmission must be used within SubmissionProvider');
  return ctx;
}
