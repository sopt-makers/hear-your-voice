import { colors } from '@sopt-makers/colors';
import styles from './ProgressBar.module.css';

interface ProgressBarProps {
  currentStep?: number;
  totalSteps?: number;
}

function ProgressBar({ currentStep = 1, totalSteps = 5 }: ProgressBarProps) {
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className={styles.container}>
      <div className={styles.track} style={{ backgroundColor: colors.white }}>
        <div
          className={styles.fill}
          style={{ width: `${progressPercentage}%`, backgroundColor: colors.orange400 }}
        />
      </div>
    </div>
  );
}

export default ProgressBar;
