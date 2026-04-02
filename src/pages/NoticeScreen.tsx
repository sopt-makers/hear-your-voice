import { fontsObject } from '@sopt-makers/fonts';
import styles from './NoticeScreen.module.css';
import { StepLayout } from '../components';
import noticeExampleImg from '../assets/notice_example_img.png';

function NoticeScreen() {
  return (
    <StepLayout>
      <div className={styles.contentSection}>
        <div className={styles.labelSection}>
          <p className={styles.labelText} style={fontsObject.HEADING_5_20_B}>
            안내사항
          </p>
        </div>

        <div className={styles.descriptionSection} style={fontsObject.BODY_3_14_M}>
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

        <div className={styles.noticeExampleSection}>
          <img
            src={noticeExampleImg}
            alt="너의 목소리가 들려 예시 이미지"
            className={styles.noticeExampleImage}
          />
        </div>
      </div>
    </StepLayout>
  );
}

export default NoticeScreen;
