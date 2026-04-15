import { Button } from '@sopt-makers/ui';
import { IconPlus } from '@sopt-makers/icons';
import type { PeerCommentRowState } from '@types';
import type { PeerCommentStepContent } from './PeerCommentStepTemplate';
import { createEmptyPeerCommentRow } from '@utils/peerCommentUtils';
import PeerCommentBlock from './PeerCommentBlock';
import type { PeerMember } from '@types';
import * as styles from './PeerCommentRepeater.css';

interface PeerCommentRepeaterProps {
  content: PeerCommentStepContent;
  rows: PeerCommentRowState[];
  onRowsChange: (rows: PeerCommentRowState[]) => void;
  peerMembers: PeerMember[];
}

function PeerCommentRepeater({ content, rows, onRowsChange, peerMembers }: PeerCommentRepeaterProps) {

  const updateRow = (index: number, next: PeerCommentRowState) => {
    onRowsChange(rows.map((r, i) => (i === index ? next : r)));
  };

  /** 행이 여러 개면 해당 행 제거, 하나뿐이면 같은 자리에서 빈 섹션으로 초기화 */
  const removeOrResetRow = (index: number) => {
    if (rows.length > 1) {
      onRowsChange(rows.filter((_, i) => i !== index));
      return;
    }
    const only = rows[0];
    onRowsChange([{ id: only.id, memberIds: [], text: '' }]);
  };

  const isAddDisabled = rows.some((row) => row.memberIds.length === 0 || row.text.length === 0);

  return (
    <div className={styles.repeaterRoot}>
      <div className={styles.list}>
        {rows.map((row, index) => (
          <PeerCommentBlock
            key={row.id}
            row={row}
            content={content}
            peerMembers={peerMembers}
            onChange={(next) => updateRow(index, next)}
            isOnlySection={rows.length === 1}
            onRemoveRow={() => removeOrResetRow(index)}
          />
        ))}
      </div>
      <div className={styles.addRow}>
        <Button
          type="button"
          variant="fill"
          rounded="lg"
          size="md"
          theme="white"
          LeftIcon={IconPlus}
          disabled={isAddDisabled}
          onClick={() => onRowsChange([...rows, createEmptyPeerCommentRow()])}
        >
          추가
        </Button>
      </div>
    </div>
  );
}

export default PeerCommentRepeater;
