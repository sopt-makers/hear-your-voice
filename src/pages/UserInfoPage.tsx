import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import StepLayout from '../components/StepLayout';
import { ContentHeading, SelectField } from '../components';
import * as styles from './UserInfoPage.css';
import { TextField, useToast } from '@sopt-makers/ui';
import { getChapterCodes, getTeamCodes } from '../lib/api/chapter';
import { isValidUser } from '../lib/api/user';
import { useSubmission } from '../context/SubmissionContext';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { callApi } from '../lib/apiClient';

function UserInfoPage() {
  const [name, setName] = useState('');
  const [chapterCode, setChapterCode] = useState('');
  const [teamCode, setTeamCode] = useState('');
  const [isError, setIsError] = useState(false);
  const [chapterOptions, setChapterOptions] = useState<{ label: string; value: string }[]>([]);
  const [teamOptions, setTeamOptions] = useState<{ label: string; value: string }[]>([]);
  const navigate = useNavigate();
  const toast = useToast();
  const { update } = useSubmission();
  const { handleError } = useErrorHandler();

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
        toast.open({ icon: 'error', content: '존재하지 않는 회원이에요. 다시 확인해주세요.' });
        return;
      }

      update({ user_name: name, user_team: teamCode, user_chapter: chapterCode });
      navigate('/next'); // TODO: 다음 페이지 경로로 변경
    } catch (error) {
      handleError(error);
    }
  }, [name, teamCode, chapterCode, toast, update, navigate, handleError]);

  return (
    <StepLayout
      onNext={handleNext}
      isNextDisabled={!isAllFilled}
      showProgressBar={true}
      currentStep={1}
      totalSteps={7}
    >
      <ContentHeading title="작성자 정보" description="피드백을 작성하는 본인은 누구신가요?" />
      <div className={styles.body}>
        <p>
          본인의 이름은 너목들의 관리자만 확인할 수 있으며,
          <br />
          모든 코멘트는 무기명으로 전달되어요.
        </p>

        <div className={styles.inputWrapper}>
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
          <SelectField
            labelText="챕터"
            descriptionText="본인의 챕터를 선택하세요."
            placeholder="챕터를 선택하세요."
            options={chapterOptions}
            required
            isError={isError}
            onChange={(value) => {
              setChapterCode(value);
              setIsError(false);
            }}
          />
          <SelectField
            labelText="팀"
            descriptionText="본인의 팀을 선택하세요."
            placeholder="팀을 선택하세요."
            options={teamOptions}
            required
            isError={isError}
            onChange={(value) => {
              setTeamCode(value);
              setIsError(false);
            }}
          />
        </div>
      </div>
    </StepLayout>
  );
}

export default UserInfoPage;
