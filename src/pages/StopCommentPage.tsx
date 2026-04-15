import stopCommentExample from '@assets/stop_comment_example.svg';
import stopCommentExplanation from '@assets/stop_comment_explanation.svg';
import { PeerCommentStepTemplate } from '@components';

function StopCommentPage() {
  return (
    <PeerCommentStepTemplate
      content={{
        commentKey: 'stop_comments',
        title: 'Stop 코멘트 작성',
        description: '이번 스프린트에서 협업하며 그만했으면 하는 점에 대해 전달해요.',
        guideImages: [stopCommentExplanation, stopCommentExample],
        sectionTitle: 'Stop Comment를 전달하고 싶은 동료',
        questionLabel: '해당 동료가 그만했으면 하는 점은 무엇인가요?',
        textPlaceholder: '그만했으면 하는 점',
      }}
      currentStep={2}
      nextPath="/start-comment"
    />
  );
}

export default StopCommentPage;
