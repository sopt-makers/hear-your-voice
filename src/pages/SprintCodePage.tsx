import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SprintCodeInput, SPRINT_CODE_LENGTH, StepLayout, ContentHeading } from '../components';
import { getSprintInfoByCode } from '../lib/api/sprint';
import { useCommentForm } from '../context/CommentFormContext';
import { useErrorHandler } from '../hooks';
import { callApi } from '../lib/apiClient';

function SprintCodePage() {
  const [code, setCode] = useState('');
  const [showError, setShowError] = useState(false);
  const navigate = useNavigate();
  const { update } = useCommentForm();
  const { handleError } = useErrorHandler();

  const handleNext = useCallback(async () => {
    if (code.length !== SPRINT_CODE_LENGTH) {
      return;
    }

    try {
      const data = await callApi(() => getSprintInfoByCode(code));

      if (!data.is_valid) {
        setShowError(true);
        return;
      }

      update({ p_sprint_auth_code: code });
      navigate('/sprint-intro', { state: { sprintName: data.sprint_name, sprintType: data.sprint_type } });
    } catch (error) {
      handleError(error);
    }
  }, [code, update, navigate, handleError]);

  return (
    <StepLayout
      onNext={handleNext}
      isNextDisabled={code.length !== SPRINT_CODE_LENGTH || showError}
      showProgressBar={true}
      currentStep={0}
      totalSteps={7}
    >
      <ContentHeading title="스프린트 코드 입력" description="스프린트 확인을 위해 코드를 입력해주세요." />

      <SprintCodeInput
        value={code}
        onChange={(next) => {
          setCode(next);
          setShowError(false);
        }}
        showError={showError}
      />
    </StepLayout>
  );
}

export default SprintCodePage;
