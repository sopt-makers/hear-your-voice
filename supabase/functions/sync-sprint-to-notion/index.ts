import { createClient } from '@supabase/supabase-js';
import { getKstDateString } from '../_shared/dates.ts';
import { notionPost, NOTION_PROPS, NOTION_GENERATION } from './notion.ts';

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
    const logs: string[] = [`runDate=${runDate}`];

    const { data: sprints, error: sprintError } = await supabase
      .rpc('get_sprints_for_notion_delivery', { p_run_date: runDate });
    if (sprintError) throw sprintError;

    logs.push(`sprints found: ${(sprints ?? []).length} → ${JSON.stringify(sprints)}`);

    const stats = { processed: 0, synced: 0, failed: 0 };

    for (const sprint of (sprints ?? []) as SprintRow[]) {
      stats.processed++;
      logs.push(`processing sprint id=${sprint.id} name=${sprint.name}`);

      try {
        const { data: comments, error: commentError } = await supabase
          .rpc('get_comments_for_sprint', { p_sprint_id: sprint.id });
        if (commentError) throw commentError;

        const rows = (comments ?? []) as CommentRow[];
        logs.push(`sprint ${sprint.id}: comments fetched=${rows.length} → ${JSON.stringify(rows)}`);

        const groupMap = new Map<string, { type: string; content: string; targets: string[] }>();
        for (const c of rows) {
          if (c.type !== 'start' && c.type !== 'continue') continue;
          const key = `${c.sender_id}__${c.type}__${c.content}`;
          if (!groupMap.has(key)) groupMap.set(key, { type: c.type, content: c.content, targets: [] });
          groupMap.get(key)!.targets.push(c.target_name);
        }

        logs.push(`sprint ${sprint.id}: comment groups=${groupMap.size}, mvps=${rows.filter((c) => c.type === 'mvp').length}`);

        for (const group of groupMap.values()) {
          const P = NOTION_PROPS.COMMENTS;
          const properties: Record<string, unknown> = {
            [P.RECEIVER]: { multi_select: group.targets.map((name) => ({ name })) },
            [P.GENERATION]: { select: { name: NOTION_GENERATION } },
            [P.SPRINT_TYPE]: { select: { name: sprint.name } },
          };
          if (group.type === 'start') {
            properties[P.START] = { rich_text: [{ text: { content: group.content } }] };
          } else {
            properties[P.CONTINUE] = { rich_text: [{ text: { content: group.content } }] };
          }
          logs.push(`posting comment group: type=${group.type} targets=${group.targets}`);
          const commentResult = await notionPost(notion_token, '/pages', {
            parent: { database_id: notion_comments_db_id },
            properties,
          });
          logs.push(`comment group posted OK → id=${commentResult.id} url=${commentResult.url}`);
        }

        for (const mvp of rows.filter((c) => c.type === 'mvp')) {
          const P = NOTION_PROPS.MVP;
          logs.push(`posting MVP: target=${mvp.target_name}`);
          const mvpResult = await notionPost(notion_token, '/pages', {
            parent: { database_id: notion_mvp_db_id },
            properties: {
              [P.NAME]: { title: [{ text: { content: mvp.target_name } }] },
              [P.DETAIL]: { rich_text: [{ text: { content: mvp.content } }] },
              [P.GENERATION]: { select: { name: NOTION_GENERATION } },
              [P.SPRINT_TYPE]: { select: { name: sprint.name } },
            },
          });
          logs.push(`MVP posted OK → id=${mvpResult.id} url=${mvpResult.url}`);
        }

        logs.push(`sprint ${sprint.id}: marking synced`);
        const { error: syncError } = await supabase.rpc('mark_sprint_notion_synced', { p_sprint_id: sprint.id });
        if (syncError) throw syncError;
        stats.synced++;
      } catch (err) {
        const message = (err as any)?.message ?? JSON.stringify(err);
        logs.push(`ERROR for sprint ${sprint.id}: ${message}`);
        await supabase.rpc('mark_sprint_notion_failed', {
          p_sprint_id: sprint.id,
          p_error: message,
          p_run_date: runDate,
        });
        stats.failed++;
      }
    }

    return new Response(JSON.stringify({ ...stats, logs }), { status: 200 });
  } catch (err) {
    const message = (err as any)?.message ?? JSON.stringify(err);
    console.error(message);
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
});
