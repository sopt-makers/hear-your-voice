import type { Comment } from '../types/comment';
import type { PeerCommentRowState } from '../types/comment';

function newRowId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `row-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createEmptyPeerCommentRow(): PeerCommentRowState {
  return { id: newRowId(), memberIds: [], text: '' };
}

export function isPeerRowEmpty(row: PeerCommentRowState): boolean {
  return row.memberIds.length === 0 && row.text.trim() === '';
}

export function isPeerRowValid(row: PeerCommentRowState): boolean {
  if (isPeerRowEmpty(row)) {
    return true;
  }
  return row.memberIds.length > 0 && row.text.trim() !== '';
}

export function hasAtLeastOneCompletePeerRow(rows: PeerCommentRowState[]): boolean {
  return rows.some((row) => row.memberIds.length > 0 && row.text.trim() !== '');
}

/** 한 행의 동일한 본문을 각 memberId마다 `Comment` 한 건으로 펼칩니다. */
export function expandPeerRowsToComments(rows: PeerCommentRowState[]): Comment[] {
  const result: Comment[] = [];
  for (const row of rows) {
    const text = row.text.trim();
    if (!text) {
      continue;
    }
    for (const memberId of row.memberIds) {
      result.push({ target_user_id: memberId, comment_text: text });
    }
  }
  return result;
}
