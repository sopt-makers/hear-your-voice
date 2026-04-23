import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const NOTION_API = 'https://api.notion.com/v1';
const NOTION_VERSION = '2022-06-28';
const SLACK_API = 'https://slack.com/api';

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

interface SlackDmRow {
  target_user_id: number;
  slack_member_id: string;
  target_name: string;
  type: string;
  content: string;
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

async function slackPost(token: string, channel: string, text: string) {
  const res = await fetch(`${SLACK_API}/chat.postMessage`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ channel, text }),
  });
  const json = await res.json();
  if (!json.ok) {
    throw new Error(`Slack API error: ${json.error}`);
  }
}

function buildSlackMessage(name: string, sprintName: string, rows: SlackDmRow[]): string {
  const starts = rows.filter((r) => r.type === 'start').map((r) => `- ${r.content}`);
  const continues = rows.filter((r) => r.type === 'continue').map((r) => `- ${r.content}`);
  const stops = rows.filter((r) => r.type === 'stop').map((r) => `- ${r.content}`);
  const mvps = rows.filter((r) => r.type === 'mvp');

  const lines: string[] = [];
  lines.push(`무우~ 🐮 ${name}님에게 ${sprintName} 동료들의 메세지가 도착했어요!`);

  if (starts.length > 0) {
    lines.push('');
    lines.push(`🐣 ${name}님의 성장을 위해 제안하고 싶어요.`);
    lines.push(...starts);
  }

  if (continues.length > 0) {
    lines.push('');
    lines.push(`👍 ${name}님이 잘하고 있는 부분이에요. 앞으로도 이렇게만 해주세요!`);
    lines.push(...continues);
  }

  if (stops.length > 0) {
    lines.push('');
    lines.push(`✋ ${name}님! 충분히 잘하고 있지만, 이 부분은 더 노력해주시면 좋겠어요.`);
    lines.push(...stops);
  }

  if (mvps.length > 0) {
    lines.push('');
    lines.push(`❤️ 동료 ${mvps.length}명이 ${name}님을 MVP로 선택했어요.`);
    lines.push(...mvps.map((r) => `- ${r.content}`));
  }

  lines.push('');
  lines.push('이번 스프린트도 수고 많았어요! - 무무가 🐮');

  return lines.join('\n');
}

Deno.serve(async () => {
  try {
    const notion_token = Deno.env.get('NOTION_TOKEN');
    const notion_comments_db_id = Deno.env.get('NOTION_COMMENTS_DB_ID');
    const notion_mvp_db_id = Deno.env.get('NOTION_MVP_DB_ID');
    const slack_bot_token = Deno.env.get('SLACK_BOT_TOKEN');

    if (!notion_token || !notion_comments_db_id || !notion_mvp_db_id || !slack_bot_token) {
      console.error('Missing required environment variables');
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

      // Notion 동기화 — 실패해도 Slack 발송은 계속 진행
      try {
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
      } catch (err) {
        console.error(`Notion sync failed for sprint ${sprint.id}: ${err instanceof Error ? err.message : String(err)}`);
      }

      // Slack DM 발송 — 실패해도 처리 완료 표시는 계속 진행
      try {
        const { data: dmData, error: dmError } = await supabase
          .rpc('get_slack_dm_data', { p_sprint_id: sprint.id });

        if (dmError) throw dmError;

        const dmRows = (dmData ?? []) as SlackDmRow[];

        // target user별로 그룹핑
        const userMap = new Map<number, SlackDmRow[]>();
        for (const row of dmRows) {
          if (!userMap.has(row.target_user_id)) {
            userMap.set(row.target_user_id, []);
          }
          userMap.get(row.target_user_id)!.push(row);
        }

        for (const userRows of userMap.values()) {
          const { slack_member_id, target_name } = userRows[0];
          const message = buildSlackMessage(target_name, sprint.name, userRows);
          await slackPost(slack_bot_token, slack_member_id, message);
        }
      } catch (err) {
        console.error(`Slack DM failed for sprint ${sprint.id}: ${err instanceof Error ? err.message : String(err)}`);
      }

      // 처리 완료 표시 — 코멘트 없는 sprint도 갱신해 재처리 방지
      const { error: updateError } = await supabase
        .rpc('mark_sprint_notion_synced', { p_sprint_id: sprint.id });
      if (updateError) throw updateError;
    }

    return new Response(JSON.stringify({ message: 'Done' }), { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
});
