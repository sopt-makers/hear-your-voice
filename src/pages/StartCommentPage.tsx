import { PeerCommentStepTemplate } from '@components';
import { START_COMMENT_STEP_CONTENT } from '../constant/peerCommentStepContents';

function StartCommentPage() {
  return (
    <PeerCommentStepTemplate
      content={START_COMMENT_STEP_CONTENT}
      currentStep={3}
      nextPath="/continue-comment"
    />
  );
}

export default StartCommentPage;
