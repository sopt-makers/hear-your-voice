import { createClient } from '@supabase/supabase-js';
import { getKstDateString, addDays } from '../_shared/dates.ts';
import { slackSendDm } from './slack.ts';
import { buildSlackMessage, CommentRow } from './message.ts';

interface SprintForEnqueue {
  id: number;
  name: string;
  retry_deadline_date: string;
}

interface DeliveryRow {
  id: number;
  sprint_id: number;
  target_user_id: number;
  target_name: string;
  slack_user_name: string | null;
  message_text: string;
}

Deno.serve(async (req) => {
  const cronSecret = Deno.env.get('CRON_SECRET');
  const authHeader = req.headers.get('Authorization');
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const slack_bot_token = Deno.env.get('SLACK_BOT_TOKEN');
    if (!slack_bot_token) {
      return new Response(JSON.stringify({ error: 'Missing SLACK_BOT_TOKEN' }), { status: 500 });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const runDate = getKstDateString();
    const tomorrow = addDays(runDate, 1);
    const logs: string[] = [`runDate=${runDate}`];

    const { error: recoverError } = await supabase
      .rpc('recover_stale_processing_deliveries');
    if (recoverError) logs.push(`recover_stale_processing_deliveries failed: ${recoverError.message}`);

    const { data: expiredCount, error: expireError } = await supabase
      .rpc('expire_sprint_dm_deliveries', { p_run_date: runDate });
    if (expireError) logs.push(`expire_sprint_dm_deliveries failed: ${expireError.message}`);
    else logs.push(`expired deliveries: ${expiredCount ?? 0}`);

    const { data: sprints, error: sprintError } = await supabase
      .rpc('get_sprints_for_dm_enqueue', { p_run_date: runDate });
    if (sprintError) throw sprintError;

    logs.push(`sprints to enqueue: ${(sprints ?? []).length} → ${JSON.stringify(sprints)}`);

    let enqueued = 0;
    let enqueueFailed = 0;

    for (const sprint of (sprints ?? []) as SprintForEnqueue[]) {
      const { data: commentRows, error: commentError } = await supabase
        .rpc('get_sprint_comment_rows', { p_sprint_id: sprint.id });
      if (commentError) {
        logs.push(`get_sprint_comment_rows failed for sprint ${sprint.id}: ${commentError.message}`);
        continue;
      }

      const rows = (commentRows ?? []) as CommentRow[];
      logs.push(`sprint ${sprint.id}: comment rows fetched=${rows.length}`);

      const userMap = new Map<number, CommentRow[]>();
      for (const row of rows) {
        if (!userMap.has(row.target_user_id)) userMap.set(row.target_user_id, []);
        userMap.get(row.target_user_id)!.push(row);
      }

      for (const [userId, userRows] of userMap) {
        const { target_name, slack_user_name } = userRows[0];
        const messageText = JSON.stringify(buildSlackMessage(target_name, sprint.name, userRows, slack_user_name));

        const { error: enqueueError } = await supabase.rpc('enqueue_sprint_dm_delivery', {
          p_sprint_id: sprint.id,
          p_target_user_id: userId,
          p_target_name: target_name,
          p_slack_user_name: slack_user_name ?? null,
          p_message_text: messageText,
          p_next_retry_date: runDate,
          p_retry_deadline_date: sprint.retry_deadline_date,
        });
        if (enqueueError) {
          logs.push(`enqueue failed for user ${userId} (${target_name}) in sprint ${sprint.id}: ${enqueueError.message}`);
          enqueueFailed++;
          continue;
        }
        logs.push(`enqueued user ${userId} (${target_name}) slack_user_name=${slack_user_name}`);
        enqueued++;
      }
    }

    const { data: deliveries, error: deliveryError } = await supabase
      .rpc('get_due_sprint_dm_deliveries', { p_run_date: runDate });
    if (deliveryError) throw deliveryError;

    logs.push(`deliveries due today: ${(deliveries ?? []).length}`);

    const stats = {
      enqueued,
      enqueue_failed: enqueueFailed,
      processed: 0,
      sent: 0,
      failed: 0,
      skipped: 0,
      expired: expiredCount ?? 0,
    };

    for (const delivery of (deliveries ?? []) as DeliveryRow[]) {
      stats.processed++;
      logs.push(`processing delivery id=${delivery.id} target=${delivery.target_name} slack_user_name=${delivery.slack_user_name}`);

      if (!delivery.slack_user_name) {
        logs.push(`skipped: no slack_user_name`);
        stats.skipped++;
        continue;
      }

      try {
        const ts = await slackSendDm(slack_bot_token, delivery.slack_user_name, JSON.parse(delivery.message_text));
        logs.push(`DM sent OK ts=${ts}`);

        let markError;
        for (let attempt = 0; attempt < 3; attempt++) {
          const { error } = await supabase.rpc('mark_sprint_dm_sent', {
            p_delivery_id: delivery.id,
            p_slack_message_ts: ts,
          });
          if (!error) { markError = undefined; break; }
          markError = error;
          await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
        }
        if (markError) logs.push(`mark_sprint_dm_sent failed for delivery ${delivery.id}: ${markError.message}`);

        stats.sent++;
      } catch (err) {
        const message = (err as any)?.message ?? JSON.stringify(err);
        logs.push(`DM failed for delivery ${delivery.id}: ${message}`);
        await supabase.rpc('mark_sprint_dm_failed', {
          p_delivery_id: delivery.id,
          p_error: message,
          p_next_retry_date: tomorrow,
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
