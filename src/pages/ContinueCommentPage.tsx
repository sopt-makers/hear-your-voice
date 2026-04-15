import { PeerCommentStepTemplate } from '@components';
import { CONTINUE_COMMENT_STEP_CONTENT } from '../constant/peerCommentStepContents';

function ContinueCommentPage() {
  return (
    <PeerCommentStepTemplate
      content={CONTINUE_COMMENT_STEP_CONTENT}
      currentStep={4}
      nextPath="/next"
    />
  );
}

export default ContinueCommentPage;
