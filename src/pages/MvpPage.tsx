import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { FieldBox } from '@sopt-makers/ui';
import { colors } from '@sopt-makers/colors';
import { IconUser, IconXCircle } from '@sopt-makers/icons';
import { StepLayout, ContentHeading, MemberChip, InputField } from '@components';
import { usePeerMembers, useCommentForm } from '@hooks';
import type { PeerMember } from '@types';
import * as styles from './MvpPage.css';

function MvpPage() {
  const navigate = useNavigate();
  const { update } = useCommentForm();
  const peerMembers = usePeerMembers();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<PeerMember | null>(null);
  const [reason, setReason] = useState('');

  const filteredMembers = searchQuery
    ? peerMembers.filter((m) => m.name.includes(searchQuery))
    : [];

  const isAllFilled = selectedMember !== null && reason.trim().length > 0;

  const handleSelectMember = (member: PeerMember) => {
    setSelectedMember(member);
    setSearchQuery('');
  };

  const handleSubmit = () => {
    if (!selectedMember) return;
    update({ mvp: { target_user_id: selectedMember.userId, comment_text: reason } });
    navigate('/closing');
  };

  return (
    <StepLayout
      showProgressBar
      currentStep={6}
      totalSteps={7}
      nextLabel="제출하기"
      showNextRightIcon={false}
      onNext={handleSubmit}
      isNextDisabled={!isAllFilled}
    >
      <div className={styles.body}>
        <ContentHeading
          title="MVP 선정"
          description={
            <>
              마지막이에요!
              <br />
              이번 스프린트에서 뛰어난 모습을 보여주었던 동료가 있다면
              <br />
              이름과 이유를 작성해주세요.
            </>
          }
        />

        <div className={styles.fields}>
          <div className={styles.fieldGroup}>
            <FieldBox.Label
              label="MVP로 선정하고 싶은 동료"
              description="MVP는 한 명만 선택할 수 있어요."
              required
            />

            <div className={styles.searchContainer}>
              <div className={styles.inputWrapper}>
                <input
                  className={styles.searchInput}
                  placeholder="멤버 검색"
                  value={searchQuery}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setSearchQuery(e.target.value)
                  }
                />
                {searchQuery && (
                  <button
                    type="button"
                    className={styles.clearButton}
                    onClick={() => setSearchQuery('')}
                    aria-label="검색어 지우기"
                  >
                    <IconXCircle style={{ width: 20, height: 20, color: colors.gray50 }} />
                  </button>
                )}
              </div>

              {searchQuery && filteredMembers.length > 0 && (
                <ul className={styles.dropdown}>
                  {filteredMembers.map((member) => (
                    <li key={member.userId}>
                      <button
                        type="button"
                        className={styles.dropdownItem}
                        onClick={() => handleSelectMember(member)}
                      >
                        <span className={styles.avatarIcon} aria-hidden>
                          <IconUser style={{ width: 20, height: 20 }} />
                        </span>
                        <span>{member.name}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {selectedMember && (
              <ul className={styles.chipList}>
                <MemberChip label={selectedMember.name} showRemoveButton={false} />
              </ul>
            )}
          </div>

          <InputField
            labelText="MVP 선정 이유를 작성해주세요."
            required
            placeholder="선정하는 이유"
            value={reason}
            onChange={setReason}
          />
        </div>
      </div>
    </StepLayout>
  );
}

export default MvpPage;
