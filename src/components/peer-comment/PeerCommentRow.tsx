import { IconTrash } from '@sopt-makers/icons';
import type { PeerCommentRowState } from '../../types/comment';
import type { PeerCommentStepContent } from '../peer-comment/PeerCommentStepTemplate';
import { type PeerOption } from './PeerMemberPicker';
import PeerCommentRecipientBlock from './PeerCommentRecipientBlock';
import InputField from '../common/form/InputField';
import * as styles from './PeerCommentRow.css';

interface PeerCommentRowProps {
  row: PeerCommentRowState;
  content: PeerCommentStepContent;
  peerOptions: PeerOption[];
  onChange: (next: PeerCommentRowState) => void;
  /** 코멘트 블록이 하나뿐일 때 — 휴지통은 행 삭제 대신 입력 초기화 */
  isOnlySection: boolean;
  onRemoveRow: () => void;
}

function PeerCommentRow({ row, content, peerOptions, onChange, isOnlySection, onRemoveRow }: PeerCommentRowProps) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <button
          type="button"
          className={styles.trashButton}
          aria-label={isOnlySection ? '입력 내용 비우기' : '이 항목 삭제'}
          onClick={onRemoveRow}
        >
          <IconTrash style={{ height: 24, width: 24 }} />
        </button>
      </div>
      <div className={styles.commentSection}>
        <PeerCommentRecipientBlock
          sectionTitle={content.sectionTitle}
          memberIds={row.memberIds}
          peerOptions={peerOptions}
          onAddMember={(userId) => onChange({ ...row, memberIds: [...row.memberIds, userId] })}
          onRemoveMember={(userId) => {
            onChange({
              ...row,
              memberIds: row.memberIds.filter((id) => id !== userId),
            });
          }}
        />
        <InputField
          labelText={content.questionLabel}
          required={false}
          placeholder={content.textPlaceholder}
          value={row.text}
          onChange={(value) => onChange({ ...row, text: value })}
        />
      </div>
    </div>
  );
}

export default PeerCommentRow;
