import * as styles from './ProgressBar.css';

interface ProgressBarProps {
  currentStep?: number;
  totalSteps?: number;
}

function ProgressBar({ currentStep = 1, totalSteps = 5 }: ProgressBarProps) {
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className={styles.container}>
      <div className={styles.track}>
        <div className={styles.fill} style={{ width: `${progressPercentage}%` }} />
      </div>
    </div>
  );
}

export default ProgressBar;
