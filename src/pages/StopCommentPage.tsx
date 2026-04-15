import { PeerCommentStepTemplate } from '@components';
import { STOP_COMMENT_STEP_CONTENT } from '../constant/peerCommentStepContents';

function StopCommentPage() {
  return (
    <PeerCommentStepTemplate
      content={STOP_COMMENT_STEP_CONTENT}
      currentStep={2}
      nextPath="/start-comment"
    />
  );
}

export default StopCommentPage;
