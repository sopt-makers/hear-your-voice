import PeerMemberPicker, { type PeerOption } from './PeerMemberPicker';
import * as styles from './PeerCommentRecipientBlock.css';

interface PeerCommentRecipientBlockProps {
  sectionTitle: string;
  memberIds: string[];
  peerOptions: PeerOption[];
  onAddMember: (userId: string) => void;
  onRemoveMember: (userId: string) => void;
}

function PeerCommentRecipientBlock({
  sectionTitle,
  memberIds,
  peerOptions,
  onAddMember,
  onRemoveMember,
}: PeerCommentRecipientBlockProps) {
  return (
    <div className={styles.pickerBlock}>
      <p className={styles.sectionTitle}>{sectionTitle}</p>
      <PeerMemberPicker
        memberIds={memberIds}
        peerOptions={peerOptions}
        onAddMember={onAddMember}
        onRemoveMember={onRemoveMember}
      />
    </div>
  );
}

export default PeerCommentRecipientBlock;
