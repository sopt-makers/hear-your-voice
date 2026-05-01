const SLACK_API = 'https://slack.com/api';

async function slackFetch(url: string, token: string, body: unknown): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    return res;
  } finally {
    clearTimeout(timeout);
  }
}

export async function slackSendDm(token: string, slackUserName: string, blocks: unknown[]): Promise<string> {
  const openRes = await slackFetch(`${SLACK_API}/conversations.open`, token, { users: slackUserName });
  const openJson = await openRes.json();
  if (!openJson.ok) throw new Error(`Slack open error: ${openJson.error}`);

  const postRes = await slackFetch(`${SLACK_API}/chat.postMessage`, token, {
    channel: openJson.channel.id,
    text: '스프린트 피드백이 도착했어요! 🐮',
    blocks,
  });
  const postJson = await postRes.json();
  if (!postJson.ok) throw new Error(`Slack post error: ${postJson.error}`);

  return postJson.ts as string;
}
