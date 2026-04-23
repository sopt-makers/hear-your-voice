import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const NOTION_API = 'https://api.notion.com/v1';
const NOTION_VERSION = '2022-06-28';

interface CommentRow {
  type: 'start' | 'stop' | 'continue' | 'mvp';
  content: string;
  sender: { id: number; name: string };
  target: { id: number; name: string };
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
      .from('sprints')
      .select('id, name')
      .eq('end_date', yesterdayStr)
      .is('notion_synced_at', null);

    if (sprintError) throw sprintError;
    if (!sprints?.length) {
      return new Response(JSON.stringify({ message: 'No sprints to process' }), { status: 200 });
    }

    for (const sprint of sprints) {
      const { data: comments, error: commentError } = await supabase
        .from('comments')
        .select(`
          type, content,
          sender:users!fk_comments_sender(id, name),
          target:users!fk_comments_target(id, name)
        `)
        .eq('sprint_id', sprint.id);

      if (commentError) throw commentError;

      const rows = (comments ?? []) as CommentRow[];

      // start/continue: (sender_id, type, content) 기준으로 그룹핑 → receiver 여러 명 가능
      // 발신자는 Notion에 저장하지 않음 (모든 타입 비공개)
      const groupMap = new Map<string, { type: string; content: string; targets: string[] }>();
      for (const c of rows) {
        if (c.type !== 'start' && c.type !== 'continue') continue;
        const key = `${c.sender.id}__${c.type}__${c.content}`;
        if (!groupMap.has(key)) {
          groupMap.set(key, { type: c.type, content: c.content, targets: [] });
        }
        groupMap.get(key)!.targets.push(c.target.name);
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
            이름: { title: [{ text: { content: mvp.target.name } }] },
            '자세한 내용': { rich_text: [{ text: { content: mvp.content } }] },
            '스프린트 종류': { select: { name: sprint.name } },
          },
        });
      }

      // 처리 완료 표시 — 코멘트 없는 sprint도 갱신해 재처리 방지
      const { error: updateError } = await supabase
        .from('sprints')
        .update({ notion_synced_at: new Date().toISOString() })
        .eq('id', sprint.id);
      if (updateError) throw updateError;
    }

    return new Response(JSON.stringify({ message: 'Done' }), { status: 200 });
  } catch (err) {
    console.error(err instanceof Error ? err.message : 'Unknown notify-sprint error');
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
});
