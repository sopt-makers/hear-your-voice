import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { StepLayout } from '@components';
import * as styles from './SprintIntroPage.css';
import sprintCodeVerifiedImg from '@assets/sprint_code_verified.svg';
import type { SprintType } from '@types';

function SprintIntroPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const sprintName: string = location.state?.sprintName ?? '챕터별 스프린트';
  const sprintType: SprintType = location.state?.sprintType ?? 'chapter';

  const handleStart = useCallback(() => {
    navigate('/user-info', { state: { sprintType } });
  }, [navigate, sprintType]);

  return (
    <StepLayout
      nextLabel="시작하기"
      showNextRightIcon={false}
      onNext={handleStart}
      showProgressBar={true}
      currentStep={0}
      totalSteps={7}
    >
      <div className={styles.content}>
        <img src={sprintCodeVerifiedImg} alt="" className={styles.characterImage} />
        <p className={styles.introLine}>
          {sprintName}에 대한
          <br /> 너목들을 시작할까요?
        </p>
      </div>
    </StepLayout>
  );
}

export default SprintIntroPage;
