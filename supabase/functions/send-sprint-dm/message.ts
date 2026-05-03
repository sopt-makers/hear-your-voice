type Block = { type: string; [key: string]: unknown };

export interface CommentRow {
  target_user_id: number;
  slack_user_name: string | null;
  target_name: string;
  type: string;
  content: string;
}

export function buildSlackMessage(
  name: string,
  sprintName: string,
  rows: CommentRow[],
  slackUserName: string | null,
): Block[] {
  const starts = rows.filter((r) => r.type === 'start').map((r) => `• ${r.content}`);
  const continues = rows.filter((r) => r.type === 'continue').map((r) => `• ${r.content}`);
  const stops = rows.filter((r) => r.type === 'stop').map((r) => `• ${r.content}`);
  const mvps = rows.filter((r) => r.type === 'mvp').map((r) => `• ${r.content}`);
  const nameDisplay = slackUserName ? `<@${slackUserName}>` : `*${name}*`;
  const blocks: Block[] = [];

  blocks.push({
    type: 'header',
    text: {
      type: 'plain_text',
      text: `🐮 너목들 메시지가 도착했어요!`,
    },
  });

  blocks.push({
    type: 'context',
    elements: [
      {
        type: 'mrkdwn',
        text: `<@${slackUserName}>님에게 *${sprintName}* 피드백이 도착했어요!`,
      },
    ],
  });

  blocks.push({ type: 'divider' });

  const formatList = (arr: string[]) => arr.map((v) => `• ${v.replace(/^[-•]\s*/, '')}`).join('\n');

  // 🐣 START
  if (starts.length > 0) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*👉 ${name}님의 성장을 위해 제안하고 싶어요.*\n\n${formatList(starts)}`,
      },
    });
  }

  // 👍 CONTINUE
  if (continues.length > 0) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*👉 ${name}님이 잘하고 있는 부분이에요. 앞으로도 이렇게만 해주세요!*\n\n${formatList(continues)}`,
      },
    });
  }

  // ✋ STOP
  if (stops.length > 0) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*👉 ${name}님! 충분히 잘하고 있지만, 이 부분은 더 노력해주시면 좋겠어요.*\n\n${formatList(stops)}`,
      },
    });
  }

  // ❤️ MVP
  if (mvps.length > 0) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*👉 동료 ${mvps.length}명이 ${name}님을 MVP로 선택했어요.*\n\n${formatList(mvps)}`,
      },
    });
  }

  blocks.push({ type: 'divider' });

  // 🐮 푸터
  blocks.push({
    type: 'context',
    elements: [
      {
        type: 'mrkdwn',
        text: `이번 스프린트도 수고 많았어요! - 무무가 🐮`,
      },
    ],
  });

  return blocks;
}
