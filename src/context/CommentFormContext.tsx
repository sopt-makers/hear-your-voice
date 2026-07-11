import { createContext, useCallback, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { CommentFormState, CommentsKey, MvpDraft, PeerCommentRowState } from '@types';
import { createEmptyPeerCommentRow } from '@utils/peerCommentUtils';

interface CommentFormContextType {
  data: CommentFormState;
  update: (partial: Partial<CommentFormState>) => void;
  peerRows: Record<CommentsKey, PeerCommentRowState[]>;
  updatePeerRows: (key: CommentsKey, rows: PeerCommentRowState[]) => void;
  mvpDraft: MvpDraft;
  updateMvpDraft: (partial: Partial<MvpDraft>) => void;
  /** 제출 완료 후 모든 입력 상태를 초기값으로 되돌립니다. */
  reset: () => void;
  /** 스프린트 코드·작성자 정보가 바뀌면 이전 멤버 목록 기준의 코멘트·MVP 입력을 초기화합니다. */
  resetCommentDrafts: () => void;
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

function createInitialPeerRows(): Record<CommentsKey, PeerCommentRowState[]> {
  return {
    stop_comments: [createEmptyPeerCommentRow()],
    start_comments: [createEmptyPeerCommentRow()],
    continue_comments: [createEmptyPeerCommentRow()],
  };
}

const initialMvpDraft: MvpDraft = { memberId: null, reason: '' };

export function CommentFormProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<CommentFormState>(initialData);
  const [peerRows, setPeerRows] = useState<Record<CommentsKey, PeerCommentRowState[]>>(
    createInitialPeerRows,
  );
  const [mvpDraft, setMvpDraft] = useState<MvpDraft>(initialMvpDraft);

  const update = useCallback((partial: Partial<CommentFormState>) => {
    setData((prev) => ({ ...prev, ...partial }));
  }, []);

  const updatePeerRows = useCallback((key: CommentsKey, rows: PeerCommentRowState[]) => {
    setPeerRows((prev) => ({ ...prev, [key]: rows }));
  }, []);

  const updateMvpDraft = useCallback((partial: Partial<MvpDraft>) => {
    setMvpDraft((prev) => ({ ...prev, ...partial }));
  }, []);

  const reset = useCallback(() => {
    setData(initialData);
    setPeerRows(createInitialPeerRows());
    setMvpDraft(initialMvpDraft);
  }, []);

  const resetCommentDrafts = useCallback(() => {
    setData((prev) => ({
      ...prev,
      stop_comments: [],
      start_comments: [],
      continue_comments: [],
      mvp: null,
    }));
    setPeerRows(createInitialPeerRows());
    setMvpDraft(initialMvpDraft);
  }, []);

  const value = useMemo(
    () => ({ data, update, peerRows, updatePeerRows, mvpDraft, updateMvpDraft, reset, resetCommentDrafts }),
    [data, update, peerRows, updatePeerRows, mvpDraft, updateMvpDraft, reset, resetCommentDrafts],
  );

  return <CommentFormContext.Provider value={value}>{children}</CommentFormContext.Provider>;
}

export { CommentFormContext };
