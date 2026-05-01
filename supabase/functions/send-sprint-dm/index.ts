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

Deno.serve(async () => {
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

    const { error: recoverError } = await supabase
      .rpc('recover_stale_processing_deliveries');
    if (recoverError) console.error(`recover_stale_processing_deliveries failed: ${recoverError.message}`);

    const { data: expiredCount, error: expireError } = await supabase
      .rpc('expire_sprint_dm_deliveries', { p_run_date: runDate });
    if (expireError) console.error(`expire_sprint_dm_deliveries failed: ${expireError.message}`);

    const { data: sprints, error: sprintError } = await supabase
      .rpc('get_sprints_for_dm_enqueue', { p_run_date: runDate });
    if (sprintError) throw sprintError;

    let enqueued = 0;
    let enqueueFailed = 0;

    for (const sprint of (sprints ?? []) as SprintForEnqueue[]) {
      const { data: commentRows, error: commentError } = await supabase
        .rpc('get_sprint_comment_rows', { p_sprint_id: sprint.id });
      if (commentError) {
        console.error(`get_sprint_comment_rows failed for sprint ${sprint.id}: ${commentError.message}`);
        continue;
      }

      const rows = (commentRows ?? []) as CommentRow[];

      const userMap = new Map<number, CommentRow[]>();
      for (const row of rows) {
        if (!userMap.has(row.target_user_id)) userMap.set(row.target_user_id, []);
        userMap.get(row.target_user_id)!.push(row);
      }

      for (const [userId, userRows] of userMap) {
        const { target_name, slack_user_name } = userRows[0];
        const messageText = JSON.stringify(buildSlackMessage(target_name, sprint.name, userRows));

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
          console.error(`enqueue failed for user ${userId} in sprint ${sprint.id}: ${enqueueError.message}`);
          enqueueFailed++;
          continue;
        }
        enqueued++;
      }
    }

    const { data: deliveries, error: deliveryError } = await supabase
      .rpc('get_due_sprint_dm_deliveries', { p_run_date: runDate });
    if (deliveryError) throw deliveryError;

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

      if (!delivery.slack_user_name) {
        stats.skipped++;
        continue;
      }

      try {
        await slackSendDm(slack_bot_token, delivery.slack_user_name, JSON.parse(delivery.message_text));
        await supabase.rpc('mark_sprint_dm_sent', { p_delivery_id: delivery.id });
        stats.sent++;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`DM failed for delivery ${delivery.id}: ${message}`);
        await supabase.rpc('mark_sprint_dm_failed', {
          p_delivery_id: delivery.id,
          p_error: message,
          p_next_retry_date: tomorrow,
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
