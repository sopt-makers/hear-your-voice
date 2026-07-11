import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { FieldBox, useToast } from '@sopt-makers/ui';
import { IconUser, IconXCircle } from '@sopt-makers/icons';
import { StepLayout, ContentHeading, FieldSection, MemberChip, TextAreaField } from '@components';
import { usePeerMembers, useCommentForm, useErrorHandler } from '@hooks';
import { submitComment } from '@lib/api/comment';
import { callApi } from '@lib/apiClient';
import type { PeerMember } from '@types';
import * as styles from './MvpPage.css';

function MvpPage() {
  const navigate = useNavigate();
  const { data, mvpDraft, updateMvpDraft, reset } = useCommentForm();
  const peerMembers = usePeerMembers();
  const toast = useToast();
  const { handleError } = useErrorHandler();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedMember = peerMembers.find((m) => m.userId === mvpDraft.memberId) ?? null;
  const reason = mvpDraft.reason;

  const filteredMembers = searchQuery
    ? peerMembers.filter((m) => m.name.includes(searchQuery))
    : [];

  const isAllFilled = selectedMember !== null && reason.trim().length > 0;

  const handleSelectMember = (member: PeerMember) => {
    updateMvpDraft({ memberId: member.userId });
    setSearchQuery('');
  };

  const handleSubmit = async () => {
    if (!selectedMember || isSubmitting) return;

    setIsSubmitting(true);
    const mvp = { target_user_id: selectedMember.userId, comment_text: reason };
    const payload = { ...data, mvp };

    try {
      const result = await callApi(() => submitComment(payload));

      if (result.code === 'SUCCESS') {
        reset();
        navigate('/closing');
        return;
      }

      if (result.code === 'USER_NOT_FOUND' || result.code === 'INVALID_SPRINT') {
        toast.open({ icon: 'error', content: result.message });
        return;
      }

      navigate('/error');
    } catch (error) {
      handleError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <StepLayout
      showProgressBar
      currentStep={5}
      totalSteps={6}
      nextLabel="제출하기"
      showNextRightIcon={false}
      onNext={() => { void handleSubmit(); }}
      isNextDisabled={!isAllFilled || isSubmitting}
    >
      <FieldSection>
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
      </FieldSection>

      <FieldSection>
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
                  <IconXCircle className={styles.clearIcon} />
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
                        <IconUser className={styles.avatarIconSvg} />
                      </span>
                      <span>{member.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {selectedMember && (
            <div className={styles.chipWrapper}>
              <MemberChip label={selectedMember.name} showRemoveButton={false} />
            </div>
          )}
        </div>
      </FieldSection>

      <FieldSection>
        <TextAreaField
          labelText="MVP 선정 이유를 작성해주세요."
          required
          placeholder="선정하는 이유"
          value={reason}
          onChange={(value) => updateMvpDraft({ reason: value })}
        />
      </FieldSection>
    </StepLayout>
  );
}

export default MvpPage;
