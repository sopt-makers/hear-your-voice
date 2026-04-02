import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
import { fontsObject } from '@sopt-makers/fonts';
import { colors } from '@sopt-makers/colors';
import { Button } from '@sopt-makers/ui';
import StepLayout from '../components/StepLayout';
import styles from './ChooseSprintScreen.module.css';

// TODO: 스프린트 목록 조회 필요
const sprints = [
  '(챕터별) 스프린트 0',
  '(팀별) 스프린트 1',
  '(팀별) 스프린트 2',
  '(팀별) 스프린트 3',
  '(팀별) 스프린트 4',
];

function ChooseSprintScreen() {
  const [selectedSprint, setSelectedSprint] = useState<number | null>(null);
  // const navigate = useNavigate();

  const handleNext = () => {
    if (selectedSprint !== null) {
      console.log('Selected sprint:', selectedSprint);
      // TODO: 다음 화면으로 이동
      // navigate('/next-screen');
    }
  };

  return (
    <StepLayout
      onNext={handleNext}
      isNextDisabled={selectedSprint === null}
      showProgressBar={true}
      currentStep={0}
      totalSteps={7}
    >
      <div className={styles.labelSection}>
        <h1 className={styles.title} style={{ color: colors.white, ...fontsObject.HEADING_5_20_B }}>
          스프린트 선택
        </h1>
        <p
          className={styles.description}
          style={{ color: colors.white, ...fontsObject.TITLE_7_14_SB }}
        >
          어떤 스프린트였는지 선택해주세요.
        </p>
      </div>

      <div className={styles.sprintButtons}>
        {sprints.map((sprint, index) => (
          <Button
            key={index}
            rounded="md"
            size="lg"
            theme="white" // todo: theme 추가되면 변경 필요
            variant={selectedSprint === index ? 'fill' : 'outlined'}
            style={fontsObject.LABEL_1_18_SB}
            onClick={() => setSelectedSprint(index)}
          >
            {sprint}
          </Button>
        ))}
      </div>
    </StepLayout>
  );
}

export default ChooseSprintScreen;
