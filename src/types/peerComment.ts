export type PeerCommentKind = 'stop' | 'continue' | 'start';

export interface PeerCommentRowState {
  id: string;
  memberIds: string[];
  text: string;
}

