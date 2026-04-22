import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { StepLayout } from '../components';
import endingImg from '../assets/ending.svg';
import * as styles from './ClosingPage.css';

function ClosingPage() {
  const navigate = useNavigate();

  const handleClose = useCallback(() => {
    navigate('/');
  }, [navigate]);

  return (
    <StepLayout
      showProgressBar
      currentStep={6}
      totalSteps={6}
      nextLabel="종료하기"
      showNextRightIcon={false}
      onNext={handleClose}
    >
      <img src={endingImg} alt="엔딩 이미지" className={styles.imageArea} />

      <div className={styles.textArea}>
        <p className={styles.textContent}>
          이번 스프린트도 고생하셨어요
          <br />
          마지막까지 화이팅!
        </p>
      </div>
    </StepLayout>
  );
}

export default ClosingPage;
