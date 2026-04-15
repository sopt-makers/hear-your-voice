import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ContentHeading from '../common/ui/ContentHeading';
import ImageSection from '../common/ui/ImageSection';
import StepLayout from '../common/layout/StepLayout';
import PeerCommentRepeater from './PeerCommentRepeater';
import { useCommentForm } from '../../context/CommentFormContext';
import { usePeerMembers } from '../../hooks';
import {
  createEmptyPeerCommentRow,
  expandPeerRowsToComments,
  hasAtLeastOneCompletePeerRow,
  isPeerRowValid,
} from '../../utils/peerCommentUtils';
import type { Comment, PeerCommentRowState } from '../../types';
import * as styles from './PeerCommentStepTemplate.css';

type CommentsKey = 'stop_comments' | 'continue_comments' | 'start_comments';

export interface PeerCommentStepContent {
  commentKey: CommentsKey;
  title: string;
  description: string;
  /** 설명·예시 등 안내 이미지 2장 (순서대로 세로 배치). */
  guideImages?: readonly [string, string];
  /** 블록 상단 제목 (예: Stop Comment를 전달하고 싶은 동료) */
  sectionTitle: string;
  questionLabel: string;
  textPlaceholder: string;
}

export interface PeerCommentStepTemplateProps {
  content: PeerCommentStepContent;
  currentStep: number;
  totalSteps?: number;
  nextPath: string;
}

function submissionPatch(commentsKey: CommentsKey, comments: Comment[]) {
  switch (commentsKey) {
    case 'stop_comments':
      return { stop_comments: comments };
    case 'continue_comments':
      return { continue_comments: comments };
    case 'start_comments':
      return { start_comments: comments };
    default: {
      const _exhaustive: never = commentsKey;
      return _exhaustive;
    }
  }
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

  const isNextEnabled = rows.every(isPeerRowValid) && hasAtLeastOneCompletePeerRow(rows);

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
            <ImageSection.Image src={guideImages[0]} alt="comment 작성 설명 이미지"/>
            <ImageSection.Image src={guideImages[1]} alt="comment 작성 예시 이미지"/>
          </ImageSection>
        ) : null}
        <PeerCommentRepeater content={content} rows={rows} onRowsChange={setRows} peerMembers={peerMembers} />
      </div>
    </StepLayout>
  );
}

export default PeerCommentStepTemplate;
