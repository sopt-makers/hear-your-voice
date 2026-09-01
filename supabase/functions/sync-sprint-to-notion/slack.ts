const SLACK_API = 'https://slack.com/api';

export async function slackPostToChannel(
  token: string,
  channel: string,
  text: string,
): Promise<void> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const res = await fetch(`${SLACK_API}/chat.postMessage`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel, text }),
      signal: controller.signal,
    });
    const json = await res.json();
    if (!json.ok) throw new Error(`Slack post error: ${json.error}`);
  } finally {
    clearTimeout(timeout);
  }
}
