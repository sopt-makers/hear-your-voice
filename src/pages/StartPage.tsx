import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@sopt-makers/ui';
import { fontsObject } from '@sopt-makers/fonts';
import { colors } from '@sopt-makers/colors';
import styles from './StartPage.module.css';
import backgroundImg from '../assets/background.png';
import titleImg from '../assets/title.png';

// 하드코딩된 참여 기간 설정 (추후 Supabase에서 불러올 예정)
const PARTICIPATION_START_DATE = new Date('2026-04-01T00:00:00');
const PARTICIPATION_END_DATE = new Date('2026-04-30T23:59:59');

function StartPage() {
  const navigate = useNavigate();

  // 현재 날짜가 참여 기간 내인지 체크
  const [isActive, setIsActive] = useState(() => {
    const now = new Date();
    return now >= PARTICIPATION_START_DATE && now <= PARTICIPATION_END_DATE;
  });

  useEffect(() => {
    // 1분마다 참여 기간 체크
    const interval = setInterval(() => {
      const now = new Date();
      const newIsActive = now >= PARTICIPATION_START_DATE && now <= PARTICIPATION_END_DATE;
      setIsActive(newIsActive);
    }, 60000); // 60초

    return () => clearInterval(interval);
  }, []);
  return (
    <div className={styles.container}>
      {/* Background Image */}
      <img src={backgroundImg} alt="" className={styles.backgroundImage} />

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
        <div className={styles.overlay} style={{ backgroundColor: colors.backgroundDimmed }}>
          <div className={styles.disableContent}>
            <h2
              className={styles.disableTitle}
              style={{ color: colors.white, ...fontsObject.HEADING_4_24_B }}
            >
              작성할 수 있는 기간이 아니에요
            </h2>
            <p
              className={styles.disableDescription}
              style={{ color: colors.white, ...fontsObject.BODY_2_16_M }}
            >
              너목들 노션 페이지에 기재된 기간을 확인해주세요
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default StartPage;
