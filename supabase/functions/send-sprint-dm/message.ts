export interface CommentRow {
  target_user_id: number;
  slack_user_name: string | null;
  target_name: string;
  type: string;
  content: string;
}

export function buildSlackMessage(name: string, sprintName: string, rows: CommentRow[]): unknown[] {
  const starts = rows.filter((r) => r.type === 'start').map((r) => `• ${r.content}`);
  const continues = rows.filter((r) => r.type === 'continue').map((r) => `• ${r.content}`);
  const stops = rows.filter((r) => r.type === 'stop').map((r) => `• ${r.content}`);
  const mvps = rows.filter((r) => r.type === 'mvp');

  const blocks: unknown[] = [];

  blocks.push({
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `무우~ 🐮 *${name}*님에게 *${sprintName}* 동료들의 메세지가 도착했어요!`,
    },
  });

  blocks.push({ type: 'divider' });

  if (starts.length > 0) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `🐣 *${name}님의 성장을 위해 제안하고 싶어요.*\n${starts.join('\n')}`,
      },
    });
  }

  if (continues.length > 0) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `👍 *${name}님이 잘하고 있는 부분이에요. 앞으로도 이렇게만 해주세요!*\n${continues.join('\n')}`,
      },
    });
  }

  if (stops.length > 0) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `✋ *${name}님! 충분히 잘하고 있지만, 이 부분은 더 노력해주시면 좋겠어요.*\n${stops.join('\n')}`,
      },
    });
  }

  if (mvps.length > 0) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `❤️ *동료 ${mvps.length}명이 ${name}님을 MVP로 선택했어요.*`,
      },
    });
  }

  blocks.push({ type: 'divider' });

  blocks.push({
    type: 'context',
    elements: [{ type: 'mrkdwn', text: '이번 스프린트도 수고 많았어요! - 무무가 🐮' }],
  });

  return blocks;
}
