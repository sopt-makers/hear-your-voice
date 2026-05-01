import { createClient } from '@supabase/supabase-js';
import { getKstDateString } from '../_shared/dates.ts';
import { notionPost } from './notion.ts';

interface SprintRow {
  id: number;
  name: string;
}

interface CommentRow {
  type: string;
  content: string;
  sender_id: number;
  target_name: string;
}

Deno.serve(async (req) => {
  const cronSecret = Deno.env.get('CRON_SECRET');
  const authHeader = req.headers.get('Authorization');
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const notion_token = Deno.env.get('NOTION_TOKEN');
    const notion_comments_db_id = Deno.env.get('NOTION_COMMENTS_DB_ID');
    const notion_mvp_db_id = Deno.env.get('NOTION_MVP_DB_ID');

    if (!notion_token || !notion_comments_db_id || !notion_mvp_db_id) {
      return new Response(JSON.stringify({ error: 'Missing env vars' }), { status: 500 });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const runDate = getKstDateString();

    const { data: sprints, error: sprintError } = await supabase
      .rpc('get_sprints_for_notion_delivery', { p_run_date: runDate });
    if (sprintError) throw sprintError;

    const stats = { processed: 0, synced: 0, failed: 0 };

    for (const sprint of (sprints ?? []) as SprintRow[]) {
      stats.processed++;

      try {
        const { data: comments, error: commentError } = await supabase
          .rpc('get_comments_for_sprint', { p_sprint_id: sprint.id });
        if (commentError) throw commentError;

        const rows = (comments ?? []) as CommentRow[];
        const groupMap = new Map<string, { type: string; content: string; targets: string[] }>();
        for (const c of rows) {
          if (c.type !== 'start' && c.type !== 'continue') continue;
          const key = `${c.sender_id}__${c.type}__${c.content}`;
          if (!groupMap.has(key)) groupMap.set(key, { type: c.type, content: c.content, targets: [] });
          groupMap.get(key)!.targets.push(c.target_name);
        }

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

        for (const mvp of rows.filter((c) => c.type === 'mvp')) {
          await notionPost(notion_token, '/pages', {
            parent: { database_id: notion_mvp_db_id },
            properties: {
              이름: { title: [{ text: { content: mvp.target_name } }] },
              '자세한 내용': { rich_text: [{ text: { content: mvp.content } }] },
              '스프린트 종류': { select: { name: sprint.name } },
            },
          });
        }

        await supabase.rpc('mark_sprint_notion_synced', { p_sprint_id: sprint.id });
        stats.synced++;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`Notion sync failed for sprint ${sprint.id}: ${message}`);
        await supabase.rpc('mark_sprint_notion_failed', {
          p_sprint_id: sprint.id,
          p_error: message,
          p_run_date: runDate,
        });
        stats.failed++;
      }
    }

    return new Response(JSON.stringify(stats), { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(message);
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
});
