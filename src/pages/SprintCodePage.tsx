import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CodeInput, { SPRINT_CODE_LENGTH } from '../components/CodeInput';
import StepLayout from '../components/StepLayout';
import { ContentHeading } from '../components';
import { getSprintInfoByCode } from '../lib/api/sprint';

function SprintCodePage() {
  const [code, setCode] = useState('');
  const [showError, setShowError] = useState(false);
  const navigate = useNavigate();

  const handleNext = async () => {
    if (code.length !== SPRINT_CODE_LENGTH) {
      return;
    }

    try {
      const data = await getSprintInfoByCode(code);

      if (!data.is_valid) {
        setShowError(true);
        return;
      }

      navigate('/sprint-intro', { state: { sprintName: data.sprint_name, sprintType: data.sprint_type } });
    } catch {
      setShowError(true);
    }
  };

  return (
    <StepLayout
      onNext={handleNext}
      isNextDisabled={code.length !== SPRINT_CODE_LENGTH || showError}
      showProgressBar={true}
      currentStep={0}
      totalSteps={7}
    >
      <ContentHeading title="스프린트 코드 입력" description="스프린트 확인을 위해 코드를 입력해주세요." />

      <CodeInput
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
