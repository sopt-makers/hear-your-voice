import continueCommentExample from '@assets/continue_comment_example.svg';
import continueCommentExplanation from '@assets/continue_comment_explanation.svg';
import { PeerCommentStepTemplate } from '@components';

function ContinueCommentPage() {
  return (
    <PeerCommentStepTemplate
      content={{
        commentKey: 'continue_comments',
        title: 'Continue 코멘트 작성',
        description: '이번 스프린트에서 협업하며 계속했으면 하는 점에 대해 전달해요.',
        guideImages: [continueCommentExplanation, continueCommentExample],
        sectionTitle: 'Continue Comment를 전달하고 싶은 동료',
        questionLabel: '해당 동료가 계속했으면 하는 점은 무엇인가요?',
        textPlaceholder: '계속했으면 하는 점',
      }}
      currentStep={4}
      nextPath="/next"
    />
  );
}

export default ContinueCommentPage;
