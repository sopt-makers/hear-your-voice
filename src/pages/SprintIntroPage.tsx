import { StepLayout } from '../components';
import * as styles from './SprintIntroPage.css';
import sprintCodeVerifiedImg from '../assets/sprint_code_verified.png';

function SprintIntroPage() {
  const handleStart = () => {
    // TODO: 다음 온보딩/챕터 화면으로 이동 (예: navigate('/chapter-…'))
  };

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
        <img src={sprintCodeVerifiedImg} alt="..." className={styles.characterImage} />
        <p className={styles.introLine}>
          챕터별 스프린트에 대한
          <br /> 너목들을 시작할까요?
        </p>
      </div>
    </StepLayout>
  );
}

export default SprintIntroPage;
