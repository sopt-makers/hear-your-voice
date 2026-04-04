import type { ReactNode } from 'react';
import { Button } from '@sopt-makers/ui';
import { fontsObject } from '@sopt-makers/fonts';
import { colors } from '@sopt-makers/colors';
import { IconChevronRight } from '@sopt-makers/icons';
import headerImg from '../assets/header_img.png';
import ProgressBar from './ProgressBar';
import PageLayout from './PageLayout';
import styles from './StepLayout.module.css';

interface StepLayoutProps {
  children: ReactNode;
  nextLabel?: string;
  onNext?: () => void;
  isNextDisabled?: boolean;
  backgroundColor?: string;
  showProgressBar?: boolean;
  currentStep?: number;
  totalSteps?: number;
}

function StepLayout({
  children,
  nextLabel = '다음으로',
  onNext,
  isNextDisabled = false,
  backgroundColor = colors.gray950,
  showProgressBar = false,
  currentStep,
  totalSteps,
}: StepLayoutProps) {
  return (
    <PageLayout className={styles.container} style={{ backgroundColor }}>
      <div className={styles.headerSection} style={{ backgroundColor: colors.secondary }}>
        <img src={headerImg} alt="안내사항" className={styles.headerImage} />
      </div>

      {showProgressBar && currentStep !== undefined && totalSteps !== undefined && (
        <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
      )}

      <div className={styles.contentSection}>{children}</div>

      <div className={styles.buttonSection}>
        <Button
          rounded="md"
          size="lg"
          theme="white"
          variant="fill"
          style={fontsObject.LABEL_1_18_SB}
          RightIcon={IconChevronRight}
          onClick={onNext}
          disabled={isNextDisabled}
        >
          {nextLabel}
        </Button>
      </div>
    </PageLayout>
  );
}

export default StepLayout;
