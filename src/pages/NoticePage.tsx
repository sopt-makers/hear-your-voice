import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { StepLayout, ContentHeading, ImageSection } from '@components';
import noticeExplainImg from '@assets/notice_explain.svg';
import * as styles from './NoticePage.css';

function NoticePage() {
  const navigate = useNavigate();

  const handleNext = useCallback(() => {
    navigate('/sprint-code');
  }, [navigate]);

  return (
    <StepLayout onNext={handleNext}>
      <div className={styles.contentSection}>
        <ContentHeading title="안내사항" />

        <div className={styles.body}>
          <p>너의 목소리가 들려에서 작성하는 모든 코멘트는 무기명으로 이루어져요.</p>
          <ul className={styles.indentSection}>
            <li>
              Start 및 Continue 코멘트는 makers 노션의 '너의 목소리가 들려 DB'에서 확인할 수 있어요.
            </li>
            <li>Stop 코멘트는 '무무봇'이 Slack 개인 디엠으로 전달해드려요.</li>
          </ul>
          <p>
            또한 모든 코멘트에 대해 작성하실 필요는 없어요.
            <br />
            Stop, Start, Continue 중 필요한 코멘트만 골라 남겨주시면 돼요.
          </p>
          <p>위의 내용에 대해 숙지하셨다면, 다음으로 넘어가 주세요. 🔥</p>
        </div>

        <ImageSection>
          <ImageSection.Image src={noticeExplainImg} alt="너의 목소리가 들려 설명 이미지" />
        </ImageSection>
      </div>
    </StepLayout>
  );
}

export default NoticePage;
