import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { StepLayout, ContentHeading, FieldSection, SelectField } from '@components';
import * as styles from './UserInfoPage.css';
import { TextField, useToast } from '@sopt-makers/ui';
import { getChapterCodes, getTeamCodes } from '@lib/api/chapter';
import { isValidUser } from '@lib/api/user';
import { useCommentForm, useErrorHandler } from '@hooks';
import { callApi } from '@lib/apiClient';

function UserInfoPage() {
  const { data, update, resetCommentDrafts } = useCommentForm();
  const [name, setName] = useState(() => data.user_name);
  const [chapterCode, setChapterCode] = useState(() => data.user_chapter);
  const [teamCode, setTeamCode] = useState(() => data.user_team);
  const [isError, setIsError] = useState(false);
  const [chapterOptions, setChapterOptions] = useState<{ label: string; value: string }[]>([]);
  const [teamOptions, setTeamOptions] = useState<{ label: string; value: string }[]>([]);
  const navigate = useNavigate();
  const toast = useToast();
  const toastRef = useRef(toast);
  const { handleError } = useErrorHandler();

  // useToast() 반환값은 렌더마다 바뀌므로 ref로 최신 참조만 유지 (deps에 직접 넣지 않음)
  useEffect(() => {
    toastRef.current = toast;
  }, [toast]);

  useEffect(() => {
    callApi(() => Promise.all([getChapterCodes(), getTeamCodes()]))
      .then(([chapters, teams]) => {
        setChapterOptions(chapters.map((c) => ({ label: c.name, value: c.code })));
        setTeamOptions(teams.map((t) => ({ label: t.name, value: t.code })));
      })
      .catch(handleError);
  }, [handleError]);

  const isAllFilled = name.trim() !== '' && chapterCode !== '' && teamCode !== '';

  const handleNext = useCallback(async () => {
    try {
      const valid = await callApi(() => isValidUser(name, teamCode, chapterCode));

      if (!valid) {
        setIsError(true);
        toastRef.current.open({
          icon: 'error',
          content: '존재하지 않는 회원이에요. 다시 확인해주세요.',
        });
        return;
      }

      // 작성자가 바뀌면 조회되는 멤버 목록도 달라지므로 이전 코멘트·MVP 입력은 무효
      const hasUserChanged =
        data.user_name !== '' &&
        (data.user_name !== name ||
          data.user_team !== teamCode ||
          data.user_chapter !== chapterCode);
      if (hasUserChanged) {
        resetCommentDrafts();
      }
      update({ user_name: name, user_team: teamCode, user_chapter: chapterCode });
      navigate('/stop-comment');
    } catch (error) {
      handleError(error);
    }
  }, [name, teamCode, chapterCode, data, update, resetCommentDrafts, navigate, handleError]);

  return (
    <StepLayout
      onNext={handleNext}
      isNextDisabled={!isAllFilled}
      showProgressBar={true}
      currentStep={1}
      totalSteps={6}
    >
      <FieldSection>
        <ContentHeading title="작성자 정보" description="피드백을 작성하는 본인은 누구신가요?" />
        <p className={styles.noticeText}>
          본인의 이름은 너목들의 관리자만 확인할 수 있으며,
          <br />
          모든 코멘트는 무기명으로 전달되어요.
        </p>
      </FieldSection>

      <FieldSection>
        <TextField
          labelText="이름"
          descriptionText="본명을 입력하세요."
          placeholder="본인의 이름"
          required
          value={name}
          isError={isError}
          className={styles.nameWidth}
          onChange={(e) => {
            setName(e.target.value);
            setIsError(false);
          }}
        />
      </FieldSection>

      <FieldSection>
        {/* SelectV2는 uncontrolled — 옵션 로딩 완료 시 key로 리마운트해 저장값을 defaultValue로 복원 */}
        <SelectField
          key={chapterOptions.length === 0 ? 'chapter-loading' : 'chapter-ready'}
          labelText="챕터"
          descriptionText="본인의 챕터를 선택하세요."
          placeholder="챕터를 선택하세요."
          options={chapterOptions}
          defaultValue={chapterOptions.find((o) => o.value === chapterCode) ?? null}
          required
          isError={isError}
          onChange={(value) => {
            setChapterCode(value);
            setIsError(false);
          }}
        />
      </FieldSection>

      <FieldSection>
        <SelectField
          key={teamOptions.length === 0 ? 'team-loading' : 'team-ready'}
          labelText="팀"
          descriptionText="본인의 팀을 선택하세요."
          placeholder="팀을 선택하세요."
          options={teamOptions}
          defaultValue={teamOptions.find((o) => o.value === teamCode) ?? null}
          required
          isError={isError}
          onChange={(value) => {
            setTeamCode(value);
            setIsError(false);
          }}
        />
      </FieldSection>
    </StepLayout>
  );
}

export default UserInfoPage;
