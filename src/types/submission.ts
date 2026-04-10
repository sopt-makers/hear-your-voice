export interface Comment {
  target_user_id: string;
  comment_text: string;
}

export type Mvp = Comment;

export interface SubmissionData {
  p_sprint_auth_code: string;
  user_name: string;
  user_team: string;
  user_chapter: string;
  stop_comments: Comment[];
  start_comments: Comment[];
  continue_comments: Comment[];
  mvp: Mvp;
}
