# 4. External Integration

## 개요

외부 연동은 프론트엔드에서 직접 호출하지 않고, Supabase Edge Function이 서버 측에서 수행한다.

현재 운영 중인 외부 연동은 두 가지다.

- `sync-sprint-to-notion`: 스프린트 피드백을 Notion DB에 동기화
- `send-sprint-dm`: 스프린트 피드백을 Slack DM으로 발송

두 작업은 서로 독립적으로 실행된다.

- Notion 실패가 Slack DM 실행을 막지 않는다.
- Slack 일부 실패가 Notion 완료 상태를 되돌리지 않는다.
- 상태 저장도 `sprints`와 `sprint_dm_deliveries`로 분리되어 있다.

## 전체 플로우

```text
GitHub Actions
  ├─ sync-sprint-to-notion.yml
  │   └─ POST /functions/v1/sync-sprint-to-notion
  │       ├─ 대상 스프린트 조회
  │       ├─ Notion 업로드
  │       └─ sprints notion 상태 갱신
  │
  └─ send-sprint-dm.yml
      └─ POST /functions/v1/send-sprint-dm
          ├─ stale delivery 복구 / 만료 처리
          ├─ 신규 DM 대상 enqueue
          ├─ 오늘 발송 대상 delivery 조회
          ├─ Slack DM 발송
          └─ sprint_dm_deliveries 상태 갱신
```

## 실행 주기

### Notion Sync

- Workflow: `.github/workflows/sync-sprint-to-notion.yml`
- 실행 시각: 매일 `00:00 KST`
- cron: `0 15 * * *` (UTC 기준)
- 수동 실행: `workflow_dispatch` 지원

### Slack DM

- Workflow: `.github/workflows/send-sprint-dm.yml`
- 실행 시각: 매일 `00:10 KST`
- cron: `10 15 * * *` (UTC 기준)
- 수동 실행: `workflow_dispatch` 지원

Slack DM이 Notion보다 10분 뒤에 실행되도록 분리되어 있어, 두 배치가 서로 다른 책임으로 독립 동작한다.

## GitHub Actions 기반 주기 작업

두 워크플로우는 모두 같은 방식으로 Supabase Edge Function을 트리거한다.

1. GitHub Actions가 스케줄 또는 수동 실행으로 시작된다.
2. `SUPABASE_URL`과 `CRON_SECRET`을 GitHub Secrets에서 읽는다.
3. `curl`로 Supabase Edge Function endpoint에 `POST` 요청을 보낸다.
4. `Authorization: Bearer ${CRON_SECRET}` 헤더로 배치 호출을 인증한다.
5. HTTP status가 `200`이 아니거나 응답 body의 `failed`(`send-sprint-dm`는 `enqueue_failed`도 함께)가 `0`이 아니면 workflow를 실패 처리한다.

즉, GitHub Actions는 실제 비즈니스 로직을 수행하지 않고, 안전하게 Edge Function을 깨우는 스케줄러 역할을 맡는다.

## Notion Sync

구현 위치:

- `supabase/functions/sync-sprint-to-notion/index.ts`
- `supabase/functions/sync-sprint-to-notion/notion.ts`

### 목적

- 스프린트 종료 후 Start / Continue / MVP 피드백을 Notion 데이터베이스에 적재한다.

### 인증

- `NOTION_TOKEN`
- `NOTION_COMMENTS_DB_ID`
- `NOTION_MVP_DB_ID`
- `CRON_SECRET`
- `SLACK_BOT_TOKEN`, `SLACK_ALERT_CHANNEL_ID` (실패 알림용, 선택 — 없으면 알림만 건너뛰고 동기화는 정상 수행)

### 실행 조건

- GitHub Actions가 `POST /functions/v1/sync-sprint-to-notion` 호출
- Edge Function은 `Authorization` 헤더와 `CRON_SECRET` 일치 여부를 먼저 검증

### 구현 흐름

1. `CRON_SECRET` 인증 검사를 통과한다.
2. `NOTION_TOKEN`, `NOTION_COMMENTS_DB_ID`, `NOTION_MVP_DB_ID` 존재 여부를 검증한다.
3. `SUPABASE_SERVICE_ROLE_KEY`로 Supabase 클라이언트를 생성한다.
4. `getKstDateString()`으로 KST 기준 실행일을 구한다.
5. `get_sprints_for_notion_delivery(p_run_date)` RPC로 오늘 처리 가능한 스프린트를 조회한다.
6. 각 스프린트마다 `get_comments_for_sprint(p_sprint_id)` RPC로 코멘트 원본을 조회한다.
7. `start`, `continue` 코멘트만 발신자 ID + 타입 + 본문 기준으로 그룹핑한다.
8. 그룹핑된 코멘트를 Notion Comments DB에 업로드한다.
9. `mvp` 코멘트는 Notion MVP DB에 별도로 업로드한다.
10. 스프린트 단위 성공 시 `mark_sprint_notion_synced(p_sprint_id)`를 호출한다.
11. 스프린트 단위 실패 시 `mark_sprint_notion_failed(p_sprint_id, p_error, p_run_date)`를 호출한다.
12. 실행 전체에서 실패가 하나라도 있으면 `SLACK_ALERT_CHANNEL_ID` 채널로 실패 요약(스프린트별 에러 메시지 포함)을 Slack으로 알린다. 함수 자체가 예외로 죽는 경우에도 동일하게 알린다.

### 구현 상세

#### 그룹핑 규칙

Notion에는 `start`와 `continue`만 업로드된다.

- 그룹핑 키: `(sender_id, type, content)`
- 같은 발신자가 같은 본문을 여러 명에게 보낸 경우
  - Notion에는 한 row로 저장하고
  - `receiver` multi-select에 수신자 이름들을 모아 넣는다.

`stop`은 Notion DB 스펙상 저장하지 않는다.

#### Notion 업로드 방식

`notionPost()` 헬퍼가 Notion API `/pages` endpoint를 직접 호출한다.

- API base: `https://api.notion.com/v1`
- Version header: `2022-06-28`
- timeout: 10초
- 실패 시 HTTP status와 응답 body를 포함한 에러를 throw 한다.

#### Notion 속성 매핑

Comments DB:

- `receiver`
- `기수`
- `스프린트 종류`
- `start comment`
- `continue comment`

MVP DB:

- `이름`
- `자세한 내용`
- `기수`
- `스프린트 종류`

### 상태 관리

Notion 동기화 상태는 `sprints` 테이블에 기록한다.

- 성공: `mark_sprint_notion_synced`
- 실패: `mark_sprint_notion_failed`

관련 컬럼:

- `notion_synced_at`
- `notion_sync_status`
- `notion_sync_attempt_count`
- `notion_last_attempted_at`
- `notion_last_error`
- `notion_retry_deadline` (레거시 컬럼, 더 이상 조회 조건에 사용되지 않음 — [이슈 #52](https://github.com/sopt-makers/hear-your-voice/issues/52) 참고)

### 반환값

Edge Function은 아래 형태의 집계 결과를 반환한다.

```json
{
  "processed": 3,
  "synced": 2,
  "failed": 1
}
```

## Slack DM

구현 위치:

- `supabase/functions/send-sprint-dm/index.ts`
- `supabase/functions/send-sprint-dm/slack.ts`
- `supabase/functions/send-sprint-dm/message.ts`

### 목적

- 스프린트 종료 후 각 멤버에게 자신이 받은 피드백을 Slack DM으로 전달한다.

### 인증

- `SLACK_BOT_TOKEN`
- `CRON_SECRET`
- `SLACK_ALERT_CHANNEL_ID` (실패 알림용, 선택 — 없으면 알림만 건너뛰고 발송은 정상 수행)

### 실행 조건

- GitHub Actions가 `POST /functions/v1/send-sprint-dm` 호출
- Edge Function은 `Authorization` 헤더와 `CRON_SECRET` 일치 여부를 먼저 검증

### 구현 흐름

1. `CRON_SECRET` 인증 검사를 통과한다.
2. `SLACK_BOT_TOKEN` 존재 여부를 검증한다.
3. `SUPABASE_SERVICE_ROLE_KEY`로 Supabase 클라이언트를 생성한다.
4. `getKstDateString()`으로 실행일, `addDays()`로 다음 재시도 날짜를 계산한다.
5. `recover_stale_processing_deliveries()` RPC로 오래된 `processing` 상태를 복구한다.
6. `expire_sprint_dm_deliveries(p_run_date)` RPC로 재시도 기한이 지난 delivery를 `expired` 처리한다.
7. `get_sprints_for_dm_enqueue(p_run_date)` RPC로 오늘 enqueue 해야 하는 스프린트를 조회한다.
8. 각 스프린트마다 `get_sprint_comment_rows(p_sprint_id)` RPC로 수신자 기준 코멘트 row를 가져온다.
9. 수신자별로 그룹핑한 뒤 `buildSlackMessage()`로 Slack Block Kit 메시지를 만든다.
10. `(sprint_id, target_user_id)` 단위로 `enqueue_sprint_dm_delivery(...)` RPC를 호출해 큐 row를 생성한다.
11. `get_due_sprint_dm_deliveries(p_run_date)` RPC로 오늘 실제 발송해야 할 delivery를 조회하며 동시에 `processing`으로 점유한다.
12. 각 delivery마다 Slack DM을 발송한다.
13. 성공 시 `mark_sprint_dm_sent(...)`, 실패 시 `mark_sprint_dm_failed(...)`를 호출한다.
14. enqueue 실패 또는 발송 실패가 하나라도 있으면 `SLACK_ALERT_CHANNEL_ID` 채널로 실패 요약(대상별 에러 메시지 포함)을 Slack으로 알린다. 함수 자체가 예외로 죽는 경우에도 동일하게 알린다.

### 구현 상세

#### 큐 기반 처리

Slack DM은 바로 발송하지 않고 `sprint_dm_deliveries` 큐를 거친다.

이 구조의 장점:

- 유저별 성공/실패 상태를 저장할 수 있다.
- 일부 유저만 실패했을 때 해당 유저만 재시도할 수 있다.
- 중복 실행 시에도 `(sprint_id, target_user_id)` 기준으로 안전하게 enqueue 할 수 있다.

#### 메시지 생성 방식

`buildSlackMessage()`는 수신자 한 명 기준으로 코멘트를 타입별로 분리한다.

- `start`
- `continue`
- `stop`
- `mvp`

각 섹션은 코멘트가 있을 때만 메시지에 포함된다.

메시지 구조:

1. 헤더
2. 컨텍스트 문구
3. Start 섹션
4. Continue 섹션
5. Stop 섹션
6. MVP 섹션
7. 푸터

#### Slack API 호출 방식

`slackSendDm()`는 2단계로 Slack API를 호출한다.

1. `conversations.open`
   - 대상 Slack Member ID로 DM 채널을 연다.
2. `chat.postMessage`
   - 채널 ID에 Block Kit 메시지를 보낸다.

공통 fetch 헬퍼 `slackFetch()`는 10초 timeout을 적용한다.

#### 실패 처리

- 발송 자체 실패 시 `mark_sprint_dm_failed(...)`로 상태를 `failed` 또는 `expired`로 갱신한다.
- 발송은 성공했지만 DB 상태 갱신이 일시적으로 실패할 수 있어, `mark_sprint_dm_sent(...)`는 최대 3회 재시도한다.
- Slack Member ID가 없는 delivery는 `skipped` 집계로 처리하고 발송하지 않는다.

### 상태 관리

Slack DM 상태는 `sprint_dm_deliveries` 테이블에 기록한다.

주요 상태:

- `pending`
- `processing`
- `sent`
- `failed`
- `expired`

관련 컬럼:

- `attempt_count`
- `first_attempted_at`
- `last_attempted_at`
- `sent_at`
- `last_error`
- `next_retry_date`
- `retry_deadline_date`
- `slack_message_ts`

### 반환값

Edge Function은 아래 형태의 집계 결과를 반환한다.

```json
{
  "enqueued": 10,
  "enqueue_failed": 0,
  "processed": 10,
  "sent": 8,
  "failed": 1,
  "skipped": 1,
  "expired": 0
}
```

## 인증 방식

이 프로젝트의 외부 연동은 서버 간 비공개 인증을 사용한다.

- Notion: Internal Integration Token
- Slack: Bot Token
- GitHub Actions → Edge Function: `CRON_SECRET` Bearer 인증

## 관련 파일

### Edge Functions

- `supabase/functions/sync-sprint-to-notion/index.ts`
- `supabase/functions/sync-sprint-to-notion/notion.ts`
- `supabase/functions/send-sprint-dm/index.ts`
- `supabase/functions/send-sprint-dm/slack.ts`
- `supabase/functions/send-sprint-dm/message.ts`

### GitHub Workflows

- `.github/workflows/sync-sprint-to-notion.yml`
- `.github/workflows/send-sprint-dm.yml`
