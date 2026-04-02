import { Button } from '@sopt-makers/ui';
import { fontsObject } from '@sopt-makers/fonts';
import { colors } from '@sopt-makers/colors';
import { IconChevronRight } from '@sopt-makers/icons';
import styles from './NoticeScreen.module.css';
import { Header } from '../components';
import noticeExampleImg from '../assets/notice_example_img.png';

function NoticeScreen() {
  return (
    <div className={styles.container} style={{ backgroundColor: colors.gray950 }}>
      <Header />

      <div className={styles.contentSection}>
        <div className={styles.labelSection}>
          <p className={styles.labelText} style={{ ...fontsObject.HEADING_5_20_B, color: colors.white }}>
            안내사항
          </p>
        </div>

        <div className={styles.descriptionSection} style={{ ...fontsObject.BODY_3_14_M, color: colors.white }}>
          <p>
            너의 목소리가 들려에서 작성하는 모든 코멘트는 무기명으로 이루어져요.
          </p>
          <p className={styles.indentSection}>
            <li>Start 및 Continue 코멘트는 makers 노션의 '너의 목소리가 들려 DB'에서 확인할 수 있어요.</li>
            <li>Stop 코멘트는 '무무봇'이 Slack 개인 디엠으로 전달해드려요.</li>
          </p>
          <p>
            또한 모든 코멘트에 대해 작성하실 필요는 없어요.<br />
            Stop, Start, Continue 중 필요한 코멘트만 골라 남겨주시면 돼요.
          </p>
          <p>
            위의 내용에 대해 숙지하셨다면, 다음으로 넘어가 주세요. 🔥
          </p>
        </div>

        <div className={styles.noticeExampleSection}>
          <img 
            src={noticeExampleImg} 
            alt="Notice Example" 
            className={styles.noticeExampleImage} 
          />
        </div>
      </div>

      <div className={styles.buttonSection}>
        <Button
          rounded="md"
          size="lg"
          theme="white"
          variant="fill"
          style={fontsObject.LABEL_1_18_SB}
          RightIcon={IconChevronRight}
        >
          다음으로
        </Button>
      </div>
    </div>
  );
}

export default NoticeScreen;
