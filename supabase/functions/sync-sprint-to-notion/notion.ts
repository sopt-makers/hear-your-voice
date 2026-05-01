const NOTION_API = 'https://api.notion.com/v1';
const NOTION_VERSION = '2022-06-28';

export const NOTION_GENERATION = '38'; // 매 기수마다 업데이트

export const NOTION_PROPS = {
  COMMENTS: {
    RECEIVER: 'receiver',
    GENERATION: '기수',
    SPRINT_TYPE: '스프린트 종류',
    START: 'start comment',
    CONTINUE: 'continue comment',
  },
  MVP: {
    NAME: '이름',
    DETAIL: '자세한 내용',
    GENERATION: '기수',
    SPRINT_TYPE: '스프린트 종류',
  },
} as const;

export async function notionPost(token: string, path: string, body: unknown): Promise<{ id: string; url: string }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const res = await fetch(`${NOTION_API}${path}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Notion-Version': NOTION_VERSION,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(`Notion API error: ${res.status} ${JSON.stringify(json)}`);
    }
    return { id: json.id, url: json.url };
  } finally {
    clearTimeout(timeout);
  }
}
