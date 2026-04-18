import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ContentHeading from '../common/ui/ContentHeading';
import ImageSection from '../common/ui/ImageSection';
import StepLayout from '../common/layout/StepLayout';
import PeerCommentRepeater from './PeerCommentRepeater';
import { useCommentForm, usePeerMembers } from '@hooks';
import {
  createEmptyPeerCommentRow,
  expandPeerRowsToComments,
  isPeerRowValid,
} from '@utils/peerCommentUtils';
import type { Comment, PeerCommentRowState, CommentsKey, PeerCommentStepContent } from '@types';
import * as styles from './PeerCommentStepTemplate.css';

interface PeerCommentStepTemplateProps {
  content: PeerCommentStepContent;
  currentStep: number;
  totalSteps?: number;
  nextPath: string;
}

function submissionPatch<K extends CommentsKey>(
  commentsKey: K,
  comments: Comment[],
): Record<K, Comment[]> {
  return { [commentsKey]: comments } as Record<K, Comment[]>;
}

function PeerCommentStepTemplate({
  content,
  currentStep,
  totalSteps = 7,
  nextPath,
}: PeerCommentStepTemplateProps) {
  const { title, description, guideImages } = content;
  const navigate = useNavigate();
  const { update } = useCommentForm();
  const peerMembers = usePeerMembers();
  const [rows, setRows] = useState<PeerCommentRowState[]>(() => [createEmptyPeerCommentRow()]);

  const isNextEnabled = rows.every(isPeerRowValid);

  const handleNext = useCallback(() => {
    if (!isNextEnabled) {
      return;
    }
    const comments = expandPeerRowsToComments(rows);
    update(submissionPatch(content.commentKey, comments));
    navigate(nextPath);
  }, [isNextEnabled, rows, update, navigate, nextPath, content.commentKey]);

  return (
    <StepLayout
      onNext={handleNext}
      isNextDisabled={!isNextEnabled}
      showProgressBar={true}
      currentStep={currentStep}
      totalSteps={totalSteps}
    >
      <div className={styles.stepContent}>
        <div className={styles.headingBlock}>
          <ContentHeading title={title} description={description} />
          <p>해당 코멘트는 무기명으로 전달되어요.</p>
        </div>
        {guideImages ? (
          <ImageSection>
            <ImageSection.Image src={guideImages[0]} alt="comment 작성 설명 이미지" />
            <ImageSection.Image src={guideImages[1]} alt="comment 작성 예시 이미지" />
          </ImageSection>
        ) : null}
        <PeerCommentRepeater
          content={content}
          rows={rows}
          onRowsChange={setRows}
          peerMembers={peerMembers}
        />
      </div>
    </StepLayout>
  );
}

export default PeerCommentStepTemplate;
