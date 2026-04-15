import type { ReactNode } from 'react';
import { Button } from '@sopt-makers/ui';
import { fontsObject } from '@sopt-makers/fonts';
import { IconChevronRight } from '@sopt-makers/icons';
import headerTitle from '@assets/header_title.svg';
import ProgressBar from '../ui/ProgressBar';
import PageLayout from './PageLayout';
import * as styles from './StepLayout.css';

interface StepLayoutProps {
  children: ReactNode;
  nextLabel?: string;
  onNext?: () => void;
  isNextDisabled?: boolean;
  /** false면 하단 버튼에서 오른쪽(다음) 화살표 아이콘을 숨깁니다. */
  showNextRightIcon?: boolean;
  showProgressBar?: boolean;
  currentStep?: number;
  totalSteps?: number;
}

function StepLayout({
  children,
  nextLabel = '다음으로',
  onNext,
  isNextDisabled = false,
  showNextRightIcon = true,
  showProgressBar = false,
  currentStep,
  totalSteps,
}: StepLayoutProps) {
  const contentSectionClassName = showProgressBar
    ? `${styles.contentSection} ${styles.contentSectionWithProgress}`
    : `${styles.contentSection} ${styles.contentSectionWithoutProgress}`;

  return (
    <PageLayout className={styles.container}>
      <div className={styles.headerSection}>
        <img src={headerTitle} alt="" className={styles.headerImage} />
      </div>

      {showProgressBar && currentStep !== undefined && totalSteps !== undefined && (
        <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
      )}

      <div className={contentSectionClassName}>
        {children}
      </div>

      <div className={styles.buttonSection}>
        <Button
          rounded="md"
          size="lg"
          theme="white"
          variant="fill"
          style={fontsObject.LABEL_1_18_SB}
          {...(showNextRightIcon ? { RightIcon: IconChevronRight } : {})}
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
