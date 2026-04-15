import startCommentExample from '@assets/start_comment_example.svg';
import startCommentExplanation from '@assets/start_comment_explanation.svg';
import { PeerCommentStepTemplate } from '@components';

function StartCommentPage() {
  return (
    <PeerCommentStepTemplate
      content={{
        commentKey: 'start_comments',
        title: 'Start 코멘트 작성',
        description: '이번 스프린트에서 협업하며 시작했으면 하는 점에 대해 전달해요.',
        guideImages: [startCommentExplanation, startCommentExample],
        sectionTitle: 'Start Comment를 전달하고 싶은 동료',
        questionLabel: '해당 동료가 시작했으면 하는 점은 무엇인가요?',
        textPlaceholder: '시작했으면 하는 점',
      }}
      currentStep={3}
      nextPath="/continue-comment"
    />
  );
}

export default StartCommentPage;
