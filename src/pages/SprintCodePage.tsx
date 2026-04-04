import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
import { fontsObject } from '@sopt-makers/fonts';
import { colors } from '@sopt-makers/colors';
import CodeInput, { SPRINT_CODE_LENGTH } from '../components/CodeInput';
import StepLayout from '../components/StepLayout';
import styles from './SprintCodePage.module.css';

function SprintCodePage() {
  const [code, setCode] = useState('');
  const [showError, setShowError] = useState(false);
  // const navigate = useNavigate();

  const handleNext = () => {
    if (code.length !== SPRINT_CODE_LENGTH) {
      return;
    }

    // TODO: Supabase RPC 등으로 스프린트 코드 유효성 검증 (성공 시에만 다음 단계로 이동)
    // const { data, error } = await supabase.rpc('validate_sprint_code', { code });
    // if (error || !data?.valid) { setShowError(true); return; }

    /** 연동 전 UI 확인용: 서버 응답을 대신하는 임시 분기 — Supabase 연동 후 삭제 */
    const isValidTemp = code === '123456';
    if (!isValidTemp) {
      setShowError(true);
      return;
    }

    console.log('Sprint code:', code);
    // TODO: 다음 화면으로 이동
    // navigate('/next-screen');
  };

  return (
    <StepLayout
      onNext={handleNext}
      isNextDisabled={code.length !== SPRINT_CODE_LENGTH || showError}
      showProgressBar={true}
      currentStep={0}
      totalSteps={7}
    >
      <div className={styles.labelSection}>
        <h1 className={styles.title} style={{ color: colors.white, ...fontsObject.HEADING_5_20_B }}>
          스프린트 코드 입력
        </h1>
        <p
          className={styles.description}
          style={{ color: colors.white, ...fontsObject.TITLE_7_14_SB }}
        >
          스프린트 확인을 위해 코드를 입력해주세요.
        </p>
      </div>

      <CodeInput
        value={code}
        onChange={(next) => {
          setCode(next);
          setShowError(false);
        }}
        showError={showError}
      />
    </StepLayout>
  );
}

export default SprintCodePage;
