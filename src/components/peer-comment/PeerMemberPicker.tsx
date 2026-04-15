import { useState } from 'react';
import { BottomSheetContent, BottomSheetRoot, Button } from '@sopt-makers/ui';
import { IconCheck, IconChevronLeft, IconUser } from '@sopt-makers/icons';
import * as styles from './PeerMemberPicker.css';
import MemberChip from '../common/ui/MemberChip';
import type { PeerMember } from '@types';

interface PeerOption {
  label: string;
  value: string;
}

interface PeerMemberPickerProps {
  memberIds: string[];
  peerMembers: PeerMember[];
  onAddMember: (userId: string) => void;
  onRemoveMember: (userId: string) => void;
  showRemoveButton?: boolean;
}

function PeerMemberPicker({
  memberIds,
  peerMembers,
  onAddMember,
  onRemoveMember,
  showRemoveButton = true,
}: PeerMemberPickerProps) {
  const [open, setOpen] = useState(false);
  const selectedSet = new Set(memberIds);
  const peerOptions: PeerOption[] = peerMembers.map((m) => ({ label: m.name, value: m.userId }));
  const labelById = new Map(peerOptions.map((o) => [o.value, o.label]));

  const isConfirmDisabled = memberIds.length === 0;

  return (
    <div className={styles.pickerRoot}>
      <Button
        type="button"
        variant="fill"
        theme="black"
        size="sm"
        rounded="md"
        className={styles.pickerTriggerButton}
        onClick={() => setOpen(true)}
      >
        누구에게 전달할까?
      </Button>
      <BottomSheetRoot open={open} onOpenChange={setOpen}>
        <BottomSheetContent>
          <div className={styles.sheetDialogSurface}>
            <div className={styles.sheetHeader}>
              <button
                type="button"
                className={styles.sheetBackButton}
                aria-label="멤버 선택 닫기"
                onClick={() => setOpen(false)}
              >
                <IconChevronLeft style={{ width: 24, height: 24 }} />
              </button>
              <span>멤버 선택</span>
            </div>
            <div className={styles.sheetBody}>
              {peerOptions.length === 0 ? (
                <p className={styles.sheetEmpty}>선택할 수 있는 멤버가 없어요.</p>
              ) : (
                peerOptions.map((o) => {
                  const isSelected = selectedSet.has(o.value);
                  return (
                    <button
                      key={o.value}
                      type="button"
                      className={styles.sheetMemberButton}
                      onClick={() => {
                        if (isSelected) {
                          onRemoveMember(o.value);
                          return;
                        }
                        onAddMember(o.value);
                      }}
                    >
                      <span className={styles.memberAvatar} aria-hidden>
                        <IconUser />
                      </span>
                      <span className={styles.memberName}>{o.label}</span>
                      {isSelected ? (
                        <span className={styles.memberCheckSelected} aria-hidden>
                          <IconCheck />
                        </span>
                      ) : null}
                    </button>
                  );
                })
              )}
            </div>
            <div className={styles.sheetConfirmArea}>
              <Button
                type="button"
                variant="fill"
                theme="white"
                size="md"
                rounded="md"
                className={styles.sheetConfirmButton}
                disabled={isConfirmDisabled}
                onClick={() => setOpen(false)}
              >
                선택 완료
              </Button>
            </div>
          </div>
        </BottomSheetContent>
      </BottomSheetRoot>
      {memberIds.length > 0 ? (
        <ul className={styles.chipList}>
          {memberIds.map((id) => (
            <MemberChip
              key={id}
              label={labelById.get(id) ?? id}
              showRemoveButton={showRemoveButton}
              onRemove={() => onRemoveMember(id)}
            />
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export default PeerMemberPicker;
