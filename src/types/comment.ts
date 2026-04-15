export interface Comment {
  target_user_id: string;
  comment_text: string;
}

export type Mvp = Comment;

export interface CommentFormState {
  p_sprint_auth_code: string;
  user_name: string;
  user_team: string;
  user_chapter: string;
  stop_comments: Comment[];
  start_comments: Comment[];
  continue_comments: Comment[];
  /** 단계 입력 중에는 비어 있을 수 있음. 최종 제출 시에는 반드시 채워야 함. */
  mvp: Mvp | null;
}

/** `submit_comments` RPC 등 최종 제출용 — `mvp` 필수. */
export type CommentSubmissionPayload = Omit<CommentFormState, 'mvp'> & { mvp: Mvp };

export type CommentsKey = Extract<keyof CommentFormState, `${string}_comments`>;


export interface CommentSubmitResult {
  success: boolean;
  code: 'SUCCESS' | 'INVALID_SPRINT' | 'USER_NOT_FOUND' | 'UNKNOWN_ERROR';
  message: string;
}

export type PeerCommentKind = 'stop' | 'continue' | 'start';

export interface PeerCommentRowState {
  id: string;
  memberIds: string[];
  text: string;
}
