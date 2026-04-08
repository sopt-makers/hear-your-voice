import { useNavigate, useLoaderData } from 'react-router-dom';
import { Button } from '@sopt-makers/ui';
import { fontsObject } from '@sopt-makers/fonts';
import PageLayout from '../components/PageLayout';
import * as styles from './StartPage.css';
import backgroundImg from '../assets/background.png';
import titleImg from '../assets/title.png';

function StartPage() {
  const navigate = useNavigate();
  const isActive = useLoaderData() as boolean;

  return (
    <PageLayout>
      {/* Background Image */}
      <img src={backgroundImg} className={styles.backgroundImage} />

      {/* Main Content */}
      <div className={styles.mainContent}>
        <img src={titleImg} alt="너의 목소리가 들려" className={styles.titleImage} />

        {isActive && (
          <Button
            rounded="lg"
            size="lg"
            theme="white"
            variant="fill"
            style={fontsObject.LABEL_1_18_SB}
            onClick={() => navigate('/notice')}
          >
            너목들 시작하기
          </Button>
        )}
      </div>

      {/* Overlay for disabled state */}
      {!isActive && (
        <div className={styles.overlay}>
          <div className={styles.disableContent}>
            <h2 className={styles.disableTitle}>작성할 수 있는 기간이 아니에요</h2>
            <p className={styles.disableDescription}>
              너목들 노션 페이지에 기재된 기간을 확인해주세요
            </p>
          </div>
        </div>
      )}
    </PageLayout>
  );
}

export default StartPage;
