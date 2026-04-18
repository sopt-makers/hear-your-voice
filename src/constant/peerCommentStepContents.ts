import stopCommentExample from '@assets/stop_comment_example.svg';
import stopCommentExplanation from '@assets/stop_comment_explanation.svg';
import startCommentExample from '@assets/start_comment_example.svg';
import startCommentExplanation from '@assets/start_comment_explanation.svg';
import continueCommentExample from '@assets/continue_comment_example.svg';
import continueCommentExplanation from '@assets/continue_comment_explanation.svg';
import type { PeerCommentStepContent } from '@types';

export const STOP_COMMENT_STEP_CONTENT: PeerCommentStepContent = {
  commentKey: 'stop_comments',
  title: 'Stop 코멘트 작성',
  description: '이번 스프린트에서 협업하며 그만했으면 하는 점에 대해 전달해요.',
  guideImages: [stopCommentExplanation, stopCommentExample],
  sectionTitle: 'Stop Comment를 전달하고 싶은 동료',
  questionLabel: '해당 동료가 그만했으면 하는 점은 무엇인가요?',
  textPlaceholder: '그만했으면 하는 점',
};

export const START_COMMENT_STEP_CONTENT: PeerCommentStepContent = {
  commentKey: 'start_comments',
  title: 'Start 코멘트 작성',
  description: '이번 스프린트에서 협업하며 시작했으면 하는 점에 대해 전달해요.',
  guideImages: [startCommentExplanation, startCommentExample],
  sectionTitle: 'Start Comment를 전달하고 싶은 동료',
  questionLabel: '해당 동료가 시작했으면 하는 점은 무엇인가요?',
  textPlaceholder: '시작했으면 하는 점',
};

export const CONTINUE_COMMENT_STEP_CONTENT: PeerCommentStepContent = {
  commentKey: 'continue_comments',
  title: 'Continue 코멘트 작성',
  description: '이번 스프린트에서 협업하며 계속했으면 하는 점에 대해 전달해요.',
  guideImages: [continueCommentExplanation, continueCommentExample],
  sectionTitle: 'Continue Comment를 전달하고 싶은 동료',
  questionLabel: '해당 동료가 계속했으면 하는 점은 무엇인가요?',
  textPlaceholder: '계속했으면 하는 점',
};
