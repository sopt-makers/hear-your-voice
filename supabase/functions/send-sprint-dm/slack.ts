const SLACK_API = 'https://slack.com/api';

export async function slackSendDm(token: string, slackUserName: string, blocks: unknown[]) {
  const openRes = await fetch(`${SLACK_API}/conversations.open`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ users: slackUserName }),
  });
  const openJson = await openRes.json();
  if (!openJson.ok) throw new Error(`Slack open error: ${openJson.error}`);

  const postRes = await fetch(`${SLACK_API}/chat.postMessage`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      channel: openJson.channel.id,
      text: '스프린트 피드백이 도착했어요! 🐮',
      blocks,
    }),
  });
  const postJson = await postRes.json();
  if (!postJson.ok) throw new Error(`Slack post error: ${postJson.error}`);
}
