import { createClient } from '@supabase/supabase-js';
import { getKstDateString, addDays } from '../_shared/dates.ts';
import { slackPostToChannel, slackSendDm } from './slack.ts';
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

async function notifySlackFailure(text: string) {
  const slack_bot_token = Deno.env.get('SLACK_BOT_TOKEN');
  const slack_alert_channel_id = Deno.env.get('SLACK_ALERT_CHANNEL_ID');
  if (!slack_bot_token || !slack_alert_channel_id) {
    console.error('[dm] Slack alert skipped: missing SLACK_BOT_TOKEN or SLACK_ALERT_CHANNEL_ID');
    return;
  }
  try {
    await slackPostToChannel(slack_bot_token, slack_alert_channel_id, text);
  } catch (err) {
    console.error(`[dm] Slack alert failed: ${(err as any)?.message ?? JSON.stringify(err)}`);
  }
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
    console.log(`[dm] runDate=${runDate}`);

    const { error: recoverError } = await supabase.rpc('recover_stale_processing_deliveries');
    if (recoverError) console.error(`[dm] recover_stale failed: ${recoverError.message}`);

    const { data: expiredCount, error: expireError } = await supabase.rpc(
      'expire_sprint_dm_deliveries',
      { p_run_date: runDate },
    );
    if (expireError) console.error(`[dm] expire failed: ${expireError.message}`);

    const { data: sprints, error: sprintError } = await supabase.rpc('get_sprints_for_dm_enqueue', {
      p_run_date: runDate,
    });
    if (sprintError) throw sprintError;

    console.log(`[dm] sprints to enqueue=${(sprints ?? []).length}`);

    let enqueued = 0;
    let enqueueFailed = 0;
    const enqueueFailures: { sprintId: number; userId: number; error: string }[] = [];

    for (const sprint of (sprints ?? []) as SprintForEnqueue[]) {
      const { data: commentRows, error: commentError } = await supabase.rpc(
        'get_sprint_comment_rows',
        { p_sprint_id: sprint.id },
      );
      if (commentError) {
        console.error(
          `[dm] get_sprint_comment_rows failed sprint=${sprint.id}: ${commentError.message}`,
        );
        continue;
      }

      const rows = (commentRows ?? []) as CommentRow[];

      const userMap = new Map<number, CommentRow[]>();
      for (const row of rows) {
        if (!userMap.has(row.target_user_id)) userMap.set(row.target_user_id, []);
        userMap.get(row.target_user_id)!.push(row);
      }

      console.log(`[dm] sprint=${sprint.id} rows=${rows.length} users=${userMap.size}`);

      for (const [userId, userRows] of userMap) {
        const { target_name, slack_user_name } = userRows[0];
        const messageText = JSON.stringify(
          buildSlackMessage(target_name, sprint.name, userRows, slack_user_name),
        );

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
          console.error(
            `[dm] enqueue failed user=${userId} sprint=${sprint.id}: ${enqueueError.message}`,
          );
          enqueueFailed++;
          enqueueFailures.push({ sprintId: sprint.id, userId, error: enqueueError.message });
          continue;
        }
        enqueued++;
      }
    }

    const { data: deliveries, error: deliveryError } = await supabase.rpc(
      'get_due_sprint_dm_deliveries',
      { p_run_date: runDate },
    );
    if (deliveryError) throw deliveryError;

    console.log(`[dm] deliveries due=${(deliveries ?? []).length}`);

    const stats = {
      enqueued,
      enqueue_failed: enqueueFailed,
      processed: 0,
      sent: 0,
      failed: 0,
      skipped: 0,
      expired: expiredCount ?? 0,
    };

    const sendFailures: { deliveryId: number; targetName: string; error: string }[] = [];

    for (const delivery of (deliveries ?? []) as DeliveryRow[]) {
      stats.processed++;

      if (!delivery.slack_user_name) {
        stats.skipped++;
        continue;
      }

      try {
        const ts = await slackSendDm(
          slack_bot_token,
          delivery.slack_user_name,
          JSON.parse(delivery.message_text),
        );

        let markError;
        for (let attempt = 0; attempt < 3; attempt++) {
          const { error } = await supabase.rpc('mark_sprint_dm_sent', {
            p_delivery_id: delivery.id,
            p_slack_message_ts: ts,
          });
          if (!error) {
            markError = undefined;
            break;
          }
          markError = error;
          await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
        }
        if (markError)
          console.error(`[dm] mark_sent failed delivery=${delivery.id}: ${markError.message}`);

        stats.sent++;
      } catch (err) {
        const message = (err as any)?.message ?? JSON.stringify(err);
        console.error(`[dm] send failed delivery=${delivery.id}: ${message}`);
        await supabase.rpc('mark_sprint_dm_failed', {
          p_delivery_id: delivery.id,
          p_error: message,
          p_next_retry_date: tomorrow,
        });
        stats.failed++;
        sendFailures.push({
          deliveryId: delivery.id,
          targetName: delivery.target_name,
          error: message,
        });
      }
    }

    console.log(`[dm] done`, stats);

    if (stats.failed > 0 || enqueueFailed > 0) {
      const enqueueDetail = enqueueFailures
        .map((f) => `• enqueue sprint=${f.sprintId} user=${f.userId}: ${f.error}`)
        .join('\n');
      const sendDetail = sendFailures
        .map((f) => `• delivery ${f.deliveryId} (${f.targetName}): ${f.error}`)
        .join('\n');
      await notifySlackFailure(
        `🚨 [너목들] Slack DM 발송 실패 (${runDate})\nenqueued=${enqueued} enqueue_failed=${enqueueFailed} sent=${stats.sent} failed=${stats.failed}\n${[enqueueDetail, sendDetail].filter(Boolean).join('\n')}`,
      );
    }

    return new Response(JSON.stringify(stats), { status: 200 });
  } catch (err) {
    const message = (err as any)?.message ?? JSON.stringify(err);
    console.error(message);
    await notifySlackFailure(
      `🚨 [너목들] Slack DM 발송 함수 실행 자체가 실패했습니다.\n${message}`,
    );
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
});
