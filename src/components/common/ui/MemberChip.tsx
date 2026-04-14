import { IconUser, IconXClose } from '@sopt-makers/icons';
import * as styles from './MemberChip.css';

interface MemberChipProps {
  label: string;
  showRemoveButton?: boolean;
  onRemove?: () => void;
}

function MemberChip({ label, showRemoveButton = true, onRemove }: MemberChipProps) {
  return (
    <li className={styles.chipRow}>
      <span className={styles.avatar} aria-hidden>
        <IconUser style={{ width: 24, height: 24 }} />
      </span>
      <span className={styles.chipName}>{label}</span>
      {showRemoveButton ? (
        <button
          type="button"
          className={styles.removeMember}
          aria-label={`${label} 선택 해제`}
          onClick={onRemove}
        >
          <IconXClose />
        </button>
      ) : null}
    </li>
  );
}

export default MemberChip;
