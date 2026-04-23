import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const NOTION_API = 'https://api.notion.com/v1';
const NOTION_VERSION = '2022-06-28';

interface SprintRow {
  id: number;
  name: string;
}

interface CommentRow {
  type: string;
  content: string;
  sender_id: number;
  sender_name: string;
  target_name: string;
}

async function notionPost(token: string, path: string, body: unknown) {
  const res = await fetch(`${NOTION_API}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Notion API error: ${res.status}`);
  }
}

Deno.serve(async () => {
  try {
    const notion_token = Deno.env.get('NOTION_TOKEN');
    const notion_comments_db_id = Deno.env.get('NOTION_COMMENTS_DB_ID');
    const notion_mvp_db_id = Deno.env.get('NOTION_MVP_DB_ID');

    if (!notion_token || !notion_comments_db_id || !notion_mvp_db_id) {
      console.error('Missing Notion environment variables');
      return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // 어제 날짜 계산 (KST = UTC+9)
    const kstNow = new Date(Date.now() + 9 * 60 * 60 * 1000);
    const yesterday = new Date(kstNow);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const { data: sprints, error: sprintError } = await supabase
      .rpc('get_sprints_for_notion_sync', { target_date: yesterdayStr });

    if (sprintError) throw sprintError;
    if (!(sprints as SprintRow[])?.length) {
      return new Response(JSON.stringify({ message: 'No sprints to process' }), { status: 200 });
    }

    for (const sprint of sprints as SprintRow[]) {
      const { data: comments, error: commentError } = await supabase
        .rpc('get_comments_for_sprint', { p_sprint_id: sprint.id });

      if (commentError) throw commentError;

      const rows = (comments ?? []) as CommentRow[];

      // start/continue: (sender_id, type, content) 기준으로 그룹핑 → receiver 여러 명 가능
      // 발신자는 Notion에 저장하지 않음 (모든 타입 비공개)
      const groupMap = new Map<string, { type: string; content: string; targets: string[] }>();
      for (const c of rows) {
        if (c.type !== 'start' && c.type !== 'continue') continue;
        const key = `${c.sender_id}__${c.type}__${c.content}`;
        if (!groupMap.has(key)) {
          groupMap.set(key, { type: c.type, content: c.content, targets: [] });
        }
        groupMap.get(key)!.targets.push(c.target_name);
      }

      // Notion 코멘트 DB에 저장
      for (const group of groupMap.values()) {
        const properties: Record<string, unknown> = {
          receiver: { multi_select: group.targets.map((name) => ({ name })) },
          '스프린트 종류': { select: { name: sprint.name } },
        };
        if (group.type === 'start') {
          properties['start comment'] = { rich_text: [{ text: { content: group.content } }] };
        } else {
          properties['continue comment'] = { rich_text: [{ text: { content: group.content } }] };
        }

        await notionPost(notion_token, '/pages', {
          parent: { database_id: notion_comments_db_id },
          properties,
        });
      }

      // Notion MVP DB에 저장
      const mvps = rows.filter((c) => c.type === 'mvp');
      for (const mvp of mvps) {
        await notionPost(notion_token, '/pages', {
          parent: { database_id: notion_mvp_db_id },
          properties: {
            이름: { title: [{ text: { content: mvp.target_name } }] },
            '자세한 내용': { rich_text: [{ text: { content: mvp.content } }] },
            '스프린트 종류': { select: { name: sprint.name } },
          },
        });
      }

      // 처리 완료 표시 — 코멘트 없는 sprint도 갱신해 재처리 방지
      const { error: updateError } = await supabase
        .rpc('mark_sprint_notion_synced', { p_sprint_id: sprint.id });
      if (updateError) throw updateError;
    }

    return new Response(JSON.stringify({ message: 'Done' }), { status: 200 });
  } catch (err) {
    console.error(err instanceof Error ? err.message : 'Unknown notify-sprint error');
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
});
