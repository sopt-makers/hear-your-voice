import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ContentHeading, ImageSection, StepLayout } from '../../components';
import PeerCommentRepeater from './PeerCommentRepeater';
import type { PeerOption } from './PeerMemberPicker';
import { useSubmission } from '../../context/SubmissionContext';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import { callApi } from '../../lib/apiClient';
import { getUsersBySprint } from '../../lib/api/sprintPeers';
import {
  createEmptyPeerCommentRow,
  expandPeerRowsToComments,
  hasAtLeastOneCompletePeerRow,
  isPeerRowValid,
} from '../../utils/peerCommentUtils';
import type { Comment } from '../../types/submission';
import type { PeerCommentKind, PeerCommentRowState } from '../../types/peerComment';
import * as styles from './PeerCommentStepTemplate.css';

type CommentsKey = 'stop_comments' | 'continue_comments' | 'start_comments';

export interface PeerCommentStepTemplateProps {
  kind: PeerCommentKind;
  commentsKey: CommentsKey;
  title: string;
  description: string;
  currentStep: number;
  totalSteps?: number;
  nextPath: string;
  /** 설명·예시 등 안내 이미지 2장 (순서대로 세로 배치). */
  guideImages?: readonly [string, string];
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
  kind,
  commentsKey,
  title,
  description,
  currentStep,
  totalSteps = 7,
  nextPath,
  guideImages,
}: PeerCommentStepTemplateProps) {
  const navigate = useNavigate();
  const { data, update } = useSubmission();
  const { handleError } = useErrorHandler();
  const [rows, setRows] = useState<PeerCommentRowState[]>(() => [createEmptyPeerCommentRow()]);
  const [peerOptions, setPeerOptions] = useState<PeerOption[]>([]);

  const { p_sprint_auth_code, user_name, user_team, user_chapter } = data;

  useEffect(() => {
    if (!p_sprint_auth_code || !user_name || !user_team || !user_chapter) {
      return;
    }
    callApi(() =>
      getUsersBySprint({
        p_auth_code: p_sprint_auth_code,
        p_name: user_name,
        p_team_code: user_team,
        p_chapter_code: user_chapter,
      }),
    )
      .then((peers) => {
        setPeerOptions(peers.map((p) => ({ label: p.name, value: p.user_id })));
      })
      .catch(handleError);
  }, [p_sprint_auth_code, user_name, user_team, user_chapter, handleError]);

  const isNextEnabled = rows.every(isPeerRowValid) && hasAtLeastOneCompletePeerRow(rows);

  const handleNext = useCallback(() => {
    const comments = expandPeerRowsToComments(rows);
    update(submissionPatch(commentsKey, comments));
    navigate(nextPath);
  }, [rows, update, navigate, nextPath, commentsKey]);

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
            <ImageSection.Image src={guideImages[0]} alt="" />
            <ImageSection.Image src={guideImages[1]} alt="" />
          </ImageSection>
        ) : null}
        <PeerCommentRepeater kind={kind} rows={rows} onRowsChange={setRows} peerOptions={peerOptions} />
      </div>
    </StepLayout>
  );
}

export default PeerCommentStepTemplate;
