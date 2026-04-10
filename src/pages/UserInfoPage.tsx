import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StepLayout from '../components/StepLayout';
import { ContentHeading, SelectField } from '../components';
import * as styles from './UserInfoPage.css';
import { TextField } from '@sopt-makers/ui';

const PART_OPTIONS = [
  { label: 'iOS', value: 'iOS' },
  { label: 'Android', value: 'Android' },
  { label: 'Web', value: 'Web' },
  { label: 'Server', value: 'Server' },
  { label: 'Design', value: 'Design' },
  { label: 'PM', value: 'PM' },
];

function UserInfoPage() {
  const [isValidUser, setIsValidUser] = useState(false);
  const navigate = useNavigate();

  const handleNext = async () => {
    if (!isValidUser) {
      return;
    }
  };

  return (
    <StepLayout
      onNext={handleNext}
      isNextDisabled={!isValidUser}
      showProgressBar={true}
      currentStep={1}
      totalSteps={7}
    >
      <ContentHeading title="작성자 정보" description="피드백을 작성하는 본인은 누구신가요?" />
      <div className={styles.body}>
        <p>
          본인의 이름은 너목들의 관리자만 확인할 수 있으며,
          <br />
          모든 코멘트는 무기명으로 전달되어요.
        </p>

        <div className={styles.inputWrapper}>
          <TextField
            labelText="이름"
            descriptionText="본명을 입력하세요."
            placeholder="본인의 이름"
            required
          />
          <SelectField
            labelText="챕터"
            descriptionText="본인의 챕터를 선택하세요."
            placeholder="챕터를 선택하세요."
            options={PART_OPTIONS}
            required
          />
          <SelectField
            labelText="팀"
            descriptionText="본인의 팀을 선택하세요."
            placeholder="팀을 선택하세요."
            options={PART_OPTIONS}
            required
          />
        </div>
      </div>
    </StepLayout>
  );
}

export default UserInfoPage;
