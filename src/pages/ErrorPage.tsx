import { StepLayout } from '@components';

function ErrorPage() {
  return (
    <StepLayout showProgressBar={false}>
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h1>오류가 발생했습니다.</h1>
        <p>죄송합니다. 페이지를 불러오는 중에 문제가 발생했습니다.</p>
        <p>잠시 후 다시 시도해 주세요.</p>
      </div>
    </StepLayout>
  );
}

export default ErrorPage;
