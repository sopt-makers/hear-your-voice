import PeerMemberPicker from './PeerMemberPicker';
import type { PeerMember } from '@types';
import * as styles from './PeerCommentRecipientBlock.css';

interface PeerCommentRecipientBlockProps {
  sectionTitle: string;
  memberIds: string[];
  peerMembers: PeerMember[];
  onAddMember: (userId: string) => void;
  onRemoveMember: (userId: string) => void;
}

function PeerCommentRecipientBlock({
  sectionTitle,
  memberIds,
  peerMembers,
  onAddMember,
  onRemoveMember,
}: PeerCommentRecipientBlockProps) {
  return (
    <div className={styles.pickerBlock}>
      <p className={styles.sectionTitle}>{sectionTitle}</p>
      <PeerMemberPicker
        memberIds={memberIds}
        peerMembers={peerMembers}
        onAddMember={onAddMember}
        onRemoveMember={onRemoveMember}
      />
    </div>
  );
}

export default PeerCommentRecipientBlock;
