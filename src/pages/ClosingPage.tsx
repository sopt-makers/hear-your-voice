import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@sopt-makers/ui';
import { fontsObject } from '@sopt-makers/fonts';
import { colors } from '@sopt-makers/colors';
import { ProgressBar, PageLayout } from '../components';
import headerImg from '../assets/header_img.png';
import endingImg from '../assets/ending.svg';
import * as styles from './ClosingPage.css';

function ClosingPage() {
  const navigate = useNavigate();

  const handleClose = useCallback(() => {
    navigate('/');
  }, [navigate]);

  return (
    <PageLayout className={styles.container}>
      <div className={styles.banner}>
        <img src={headerImg} alt="속닥속닥" className={styles.bannerImage} />
      </div>

      <div className={styles.progressSection}>
        <ProgressBar currentStep={7} totalSteps={7} />
      </div>

      <div className={styles.content}>
        <img src={endingImg} alt="엔딩 이미지" className={styles.imageArea} />

        <div className={styles.textArea}>
          <p className={styles.textContent}>
            이번 스프린트도 고생하셨어요
            <br />
            마지막까지 화이팅!
          </p>
        </div>
      </div>

      <div className={styles.buttonSection}>
        <Button
          size="lg"
          theme="white"
          variant="fill"
          style={{
            ...fontsObject.LABEL_1_18_SB,
            backgroundColor: colors.gray50,
            color: colors.gray950,
          }}
          onClick={handleClose}
        >
          종료하기
        </Button>
      </div>
    </PageLayout>
  );
}

export default ClosingPage;
