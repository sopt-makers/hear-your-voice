import { createClient } from '@supabase/supabase-js';
import { getKstDateString } from '../_shared/dates.ts';
import { notionPost, NOTION_PROPS, NOTION_GENERATION } from './notion.ts';
import { slackPostToChannel } from './slack.ts';

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

async function notifySlackFailure(text: string) {
  const slack_bot_token = Deno.env.get('SLACK_BOT_TOKEN');
  const slack_alert_channel_id = Deno.env.get('SLACK_ALERT_CHANNEL_ID');
  if (!slack_bot_token || !slack_alert_channel_id) {
    console.error('[notion-sync] Slack alert skipped: missing SLACK_BOT_TOKEN or SLACK_ALERT_CHANNEL_ID');
    return;
  }
  try {
    await slackPostToChannel(slack_bot_token, slack_alert_channel_id, text);
  } catch (err) {
    console.error(`[notion-sync] Slack alert failed: ${(err as any)?.message ?? JSON.stringify(err)}`);
  }
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
    console.log(`[notion-sync] runDate=${runDate}`);

    const { data: sprints, error: sprintError } = await supabase
      .rpc('get_sprints_for_notion_delivery', { p_run_date: runDate });
    if (sprintError) throw sprintError;

    console.log(`[notion-sync] sprints=${(sprints ?? []).length}`);

    const stats = { processed: 0, synced: 0, failed: 0 };
    const failures: { id: number; name: string; error: string }[] = [];

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

        const mvpRows = rows.filter((c) => c.type === 'mvp');
        console.log(`[notion-sync] sprint=${sprint.id} comments=${rows.length} groups=${groupMap.size} mvps=${mvpRows.length}`);

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
          await notionPost(notion_token, '/pages', {
            parent: { database_id: notion_comments_db_id },
            properties,
          });
        }

        for (const mvp of mvpRows) {
          const P = NOTION_PROPS.MVP;
          await notionPost(notion_token, '/pages', {
            parent: { database_id: notion_mvp_db_id },
            properties: {
              [P.NAME]: { title: [{ text: { content: mvp.target_name } }] },
              [P.DETAIL]: { rich_text: [{ text: { content: mvp.content } }] },
              [P.GENERATION]: { select: { name: NOTION_GENERATION } },
              [P.SPRINT_TYPE]: { select: { name: sprint.name } },
            },
          });
        }

        const { error: syncError } = await supabase.rpc('mark_sprint_notion_synced', { p_sprint_id: sprint.id });
        if (syncError) throw syncError;
        stats.synced++;
      } catch (err) {
        const message = (err as any)?.message ?? JSON.stringify(err);
        console.error(`[notion-sync] sprint=${sprint.id} error: ${message}`);
        await supabase.rpc('mark_sprint_notion_failed', {
          p_sprint_id: sprint.id,
          p_error: message,
          p_run_date: runDate,
        });
        stats.failed++;
        failures.push({ id: sprint.id, name: sprint.name, error: message });
      }
    }

    console.log(`[notion-sync] done`, stats);

    if (stats.failed > 0) {
      const detail = failures.map((f) => `• sprint ${f.id} (${f.name}): ${f.error}`).join('\n');
      await notifySlackFailure(
        `🚨 [너목들] Notion 아카이빙 실패 (${runDate})\nprocessed=${stats.processed} synced=${stats.synced} failed=${stats.failed}\n${detail}`,
      );
    }

    return new Response(JSON.stringify(stats), { status: 200 });
  } catch (err) {
    const message = (err as any)?.message ?? JSON.stringify(err);
    console.error(message);
    await notifySlackFailure(`🚨 [너목들] Notion 아카이빙 함수 실행 자체가 실패했습니다.\n${message}`);
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
});
