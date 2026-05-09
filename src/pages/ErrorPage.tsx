import { StepLayout } from '@components';
import ErrorImg from '@assets/error.svg';
import * as styles from './ErrorPage.css';

function ErrorPage() {
  return (
    <StepLayout showProgressBar={false}>
      <div className={styles.content}>
        <img src={ErrorImg} alt="" className={styles.characterImage} />
        <div className={styles.body}>
          <p className={styles.title}>일시적으로 서비스를 이용할 수 없어요.</p>
          <p className={styles.description}>
            이용에 불편을 드려 죄송합니다. <br />
            메이커분들의 너른 양해 부탁드려요 🐮
          </p>
        </div>
      </div>
    </StepLayout>
  );
}

export default ErrorPage;
