# 스프린트 종료 알림 V2 구현 문서

이 문서는 현재 운영 중인 [`docs/notify-sprint.md`](./notify-sprint.md)와 별개로, `notify-sprint` 흐름을 재설계하기 위한 구현 계획서다.

핵심 목표는 다음 3가지다.

1. Notion 업로드와 Slack DM 발송을 서로 독립된 작업으로 분리한다.
2. Notion은 스프린트 단위, Slack DM은 유저 단위로 상태를 저장한다.
3. 외부 연동 실패 시 KST 기준 최대 3일간만 재시도한다.

---

## 1. 현재 구조의 문제

현재 구현은 하나의 Edge Function(`supabase/functions/notify-sprint/index.ts`) 안에서 아래 작업을 순차 처리한다.

1. 어제 종료된 스프린트 조회
2. Notion 업로드
3. Slack DM 발송
4. `sprints.notion_synced_at` 갱신

이 구조의 문제는 명확하다.

- `notion_synced_at` 하나만으로 전체 처리를 완료 처리하고 있다.
- Notion은 성공했지만 일부 유저 DM이 실패한 경우를 구분해서 추적할 수 없다.
- DM 실패 유저만 다시 보내는 재처리가 어렵다.
- 수동 재실행 시 같은 스프린트 전체를 다시 훑게 되어 운영 판단이 불명확하다.
- 현재 구조는 "Notion 선행 여부"가 사실상 Slack 발송의 게이트처럼 동작한다.

즉, 지금 상태값은 "스프린트가 완전히 처리되었는가"를 표현하지 못하고, "한 번은 돌았는가" 정도만 표현하고 있다.

---

## 2. 목표 상태

V2에서는 작업 책임을 아래처럼 분리한다.

### 2-1. Notion 동기화 작업

- 책임: 스프린트 단위로 Notion DB 업로드
- 상태 저장 위치: `sprints`
- 성공 기준: 해당 스프린트의 Notion 업로드 완료

### 2-2. Slack DM 발송 작업

- 책임: 유저별 DM 발송
- 상태 저장 위치: 신규 테이블 `sprint_dm_deliveries`
- 성공 기준: `(sprint_id, target_user_id)` 단위 DM 발송 완료

두 작업은 독립적으로 실행된다.

- Notion 실패가 Slack DM 실행을 막지 않는다.
- Slack 일부 실패가 Notion 완료 상태를 되돌리지 않는다.
- 운영자는 "어떤 스프린트가 Notion에 올라갔는지"와 "어떤 유저가 DM을 아직 못 받았는지"를 따로 볼 수 있어야 한다.

---

## 3. 재시도 정책

재시도는 "같은 날 여러 번"이 아니라 "하루에 한 번"만 허용한다.

- 1차 시도: 스프린트 종료 다음 날 00:00 KST
- 2차 시도: 1차 실패 시 그 다음 날 00:00 KST
- 3차 시도: 2차 실패 시 그 다음 날 00:00 KST
- 이후: 더 이상 자동 재시도하지 않고 `expired` 처리

예시:

- 스프린트 종료일이 `2026-04-10`이면
- 1차 시도일은 `2026-04-11`
- 2차 시도일은 `2026-04-12`
- 3차 시도일은 `2026-04-13`
- `2026-04-14`부터는 자동 재시도 대상에서 제외

수동 실행(`workflow_dispatch`)도 이 정책을 깨면 안 된다.
즉, 같은 KST 날짜에 이미 실패 이력이 있으면 같은 날 다시 자동/수동으로 재발송하지 않는다.

---

## 4. 제안 아키텍처

```text
GitHub Actions
  ├─ sync-sprint-to-notion.yml
  │   └─ POST /functions/v1/sync-sprint-to-notion
  │       ├─ 대상 스프린트 조회
  │       ├─ Notion 업로드
  │       └─ sprints의 notion 상태 갱신
  │
  └─ send-sprint-dm.yml
      └─ POST /functions/v1/send-sprint-dm
          ├─ 신규 DM 발송 대상 enqueue
          ├─ 오늘 재시도 가능한 delivery 조회
          ├─ 유저별 DM 발송
          └─ sprint_dm_deliveries 상태 갱신
```

핵심은 "스프린트 단위 작업"과 "유저 단위 작업"을 다른 상태 모델로 관리하는 것이다.

---

## 5. 데이터 모델 제안

## 5-1. `sprints` 테이블 확장

기존 `notion_synced_at`은 유지하되, 더 이상 Slack 처리 여부를 뜻하면 안 된다.

권장 컬럼:

```sql
ALTER TABLE sprints
  ADD COLUMN notion_sync_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN notion_sync_attempt_count integer NOT NULL DEFAULT 0,
  ADD COLUMN notion_last_attempted_at timestamptz,
  ADD COLUMN notion_last_error text,
  ADD COLUMN notion_retry_deadline date;
```

상태값 권장안:

- `pending`: 아직 시도 전
- `synced`: 업로드 성공
- `failed`: 실패했지만 재시도 가능
- `expired`: 재시도 기간 만료
- `skipped`: 업로드 대상 없음 또는 정책상 제외

정책:

- `notion_synced_at`은 실제 성공 시각만 기록한다.
- `notion_sync_status`가 상태 판정의 기준이다.
- `notion_retry_deadline`은 `end_date + 3일`로 고정한다.

## 5-2. `sprint_dm_deliveries` 신규 테이블

Slack DM은 유저별로 상태를 관리해야 하므로 별도 테이블을 둔다.

```sql
CREATE TABLE sprint_dm_deliveries (
  id bigserial PRIMARY KEY,
  sprint_id bigint NOT NULL REFERENCES sprints(id) ON DELETE CASCADE,
  target_user_id bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_name text NOT NULL,
  slack_member_id text,
  status text NOT NULL DEFAULT 'pending',
  attempt_count integer NOT NULL DEFAULT 0,
  first_attempted_at timestamptz,
  last_attempted_at timestamptz,
  sent_at timestamptz,
  last_error text,
  next_retry_date date NOT NULL,
  retry_deadline_date date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (sprint_id, target_user_id)
);
```

상태값 권장안:

- `pending`: 아직 발송 전
- `processing`: 현재 실행에서 점유한 상태
- `sent`: 발송 완료
- `failed`: 실패했지만 다음 날 재시도 가능
- `expired`: 3일 초과로 재시도 종료
- `skipped`: Slack Member ID 없음 등으로 발송 대상 제외

추가 원칙:

- `UNIQUE (sprint_id, target_user_id)`로 중복 row 생성을 막는다.
- `slack_member_id`는 발송 시점 스냅샷을 저장한다.
- `next_retry_date`로 "같은 날 재실행 금지" 정책을 구현한다.

---

## 6. DM 큐 생성 방식

DM 발송 대상은 스프린트 종료 다음 날 처음 생성한다.

### 규칙

1. `end_date = 어제(KST)`인 스프린트를 찾는다.
2. 해당 스프린트에서 피드백 수신자 기준으로 유니크한 유저 목록을 만든다.
3. `(sprint_id, target_user_id)`별 `sprint_dm_deliveries` row를 `ON CONFLICT DO NOTHING`으로 적재한다.

### 왜 큐 테이블이 필요한가

- 유저별 성공/실패를 영속적으로 남길 수 있다.
- 일부 유저만 실패한 경우 그 유저만 재시도할 수 있다.
- 수동 실행이나 중복 실행에도 상태 기준으로 안전하게 동작시킬 수 있다.

---

## 7. 작업별 조회 조건

## 7-1. Notion 작업 대상

권장 조회 조건:

```sql
end_date <= run_date_kst - interval '1 day'
AND notion_sync_status IN ('pending', 'failed')
AND notion_sync_attempt_count < 3
AND run_date_kst <= notion_retry_deadline
AND (
  notion_last_attempted_at IS NULL
  OR timezone('Asia/Seoul', notion_last_attempted_at)::date < run_date_kst
)
```

의미:

- 아직 성공하지 않았고
- 오늘 시도 가능한 스프린트만 고른다.

## 7-2. Slack DM 작업 대상

권장 조회 조건:

```sql
status IN ('pending', 'failed')
AND sent_at IS NULL
AND next_retry_date <= run_date_kst
AND run_date_kst <= retry_deadline_date
AND attempt_count < 3
```

의미:

- 오늘 발송할 차례가 된 유저만 고른다.
- 이미 오늘 한 번 실패한 건 같은 날 다시 잡히지 않는다.

---

## 8. 상태 전이 규칙

## 8-1. Notion

### 성공

- `notion_sync_status = 'synced'`
- `notion_synced_at = now()`
- `notion_last_error = NULL`
- `notion_sync_attempt_count += 1`
- `notion_last_attempted_at = now()`

### 실패, 재시도 가능

- `notion_sync_status = 'failed'`
- `notion_sync_attempt_count += 1`
- `notion_last_attempted_at = now()`
- `notion_last_error` 기록

### 실패, 재시도 종료

- 3번째 시도도 실패했거나
- 오늘 날짜가 `notion_retry_deadline`을 초과한 경우
- `notion_sync_status = 'expired'`

## 8-2. Slack DM

### 성공

- `status = 'sent'`
- `sent_at = now()`
- `last_error = NULL`
- `attempt_count += 1`
- `last_attempted_at = now()`

### 실패, 다음 날 재시도

- `status = 'failed'`
- `attempt_count += 1`
- `last_attempted_at = now()`
- `last_error` 기록
- `next_retry_date = 오늘 + 1일`

### 실패, 재시도 종료

- `attempt_count = 3`이 되었거나
- `next_retry_date > retry_deadline_date`
- `status = 'expired'`

### 발송 불가

아래 케이스는 재시도보다 `skipped`가 맞다.

- `slack_member_id`가 없음
- 발송 대상 메시지 본문이 비어 있음
- 정책상 봇이 보내지 않아야 하는 유저

---

## 9. Edge Function 분리 제안

현재 `notify-sprint` 하나로 합쳐진 로직을 아래처럼 분리한다.

### 9-1. `sync-sprint-to-notion`

역할:

- 오늘 처리 가능한 스프린트 조회
- 코멘트/MVP를 Notion에 업로드
- `sprints`의 notion 상태 갱신

입력:

- 별도 payload 없이 스케줄 실행

출력 예시:

```json
{
  "processed": 3,
  "synced": 2,
  "failed": 1,
  "expired": 0
}
```

### 9-2. `send-sprint-dm`

역할:

- 어제 종료된 스프린트의 DM 대상 enqueue
- 오늘 발송할 `sprint_dm_deliveries` 조회
- 유저별 메시지 생성 후 Slack DM 발송
- delivery 상태 갱신

출력 예시:

```json
{
  "enqueued": 14,
  "processed": 10,
  "sent": 8,
  "failed": 2,
  "skipped": 0,
  "expired": 0
}
```

### 9-3. 공통 모듈화

현재 함수에서 바로 구현한 로직은 분리하는 편이 낫다.

- Notion API 클라이언트
- Slack API 클라이언트
- 메시지 빌더
- KST 날짜 계산 유틸
- 상태 갱신용 Supabase RPC 호출

권장 디렉터리 예시:

```text
supabase/functions/_shared/notify-sprint/
  ├─ notion.ts
  ├─ slack.ts
  ├─ dates.ts
  └─ message.ts

supabase/functions/sync-sprint-to-notion/index.ts
supabase/functions/send-sprint-dm/index.ts
```

---

## 10. GitHub Actions 분리 제안

워크플로우도 나누는 편이 운영상 명확하다.

### 10-1. `.github/workflows/sync-sprint-to-notion.yml`

- 목적: Notion 업로드 전용
- 스케줄: 매일 `00:00 KST`
- 수동 실행 허용

### 10-2. `.github/workflows/send-sprint-dm.yml`

- 목적: Slack DM 전용
- 스케줄: 매일 `00:10 KST`
- 수동 실행 허용

10분 차이를 두는 이유는 필수는 아니지만 다음 장점이 있다.

- 외부 API 호출 부하를 분산할 수 있다.
- 새벽 장애 대응 시 어떤 작업이 실패했는지 로그가 더 분명하다.

중요한 점은, 시간 차이는 운영 편의일 뿐이고 의존성은 아니라는 것이다.

---

## 11. RPC / SQL 작업 제안

현재 RPC 이름은 `notion_sync` 중심이라 역할이 섞여 있다. V2에서는 책임을 기준으로 나누는 것이 낫다.

권장 후보:

- `get_sprints_for_notion_delivery(p_run_date date)`
- `mark_sprint_notion_synced(p_sprint_id bigint)`
- `mark_sprint_notion_failed(p_sprint_id bigint, p_error text, p_run_date date)`
- `enqueue_sprint_dm_deliveries(p_run_date date)`
- `get_due_sprint_dm_deliveries(p_run_date date)`
- `get_sprint_dm_payload(p_sprint_id bigint, p_target_user_id bigint)`
- `mark_sprint_dm_sent(p_delivery_id bigint)`
- `mark_sprint_dm_failed(p_delivery_id bigint, p_error text, p_next_retry_date date)`
- `expire_sprint_dm_deliveries(p_run_date date)`

원칙:

- 조회와 상태 갱신 RPC를 분리한다.
- 가능하면 "한 row를 점유해서 반환"하는 방식으로 중복 실행을 방지한다.
- `FOR UPDATE SKIP LOCKED` 또는 상태 전이를 이용해 동시 실행 안정성을 확보한다.

---

## 12. 중복 방지와 멱등성

### Notion

- 같은 스프린트가 다시 실행되어도 `notion_sync_status = 'synced'`면 재처리하지 않는다.
- 필요하면 Notion 페이지 생성 전 내부 dedupe key를 둘 수 있지만, 1차적으로는 DB 상태가 기준이다.

### Slack DM

- 같은 유저에 대한 delivery row는 하나만 존재한다.
- `status = 'sent'`인 row는 재발송하지 않는다.
- `processing` 상태를 두면 같은 시각의 중복 실행을 줄일 수 있다.

이 정책이 있어야 GitHub Actions 수동 재실행과 자동 실행이 겹쳐도 안전하다.

---

## 13. 운영 시나리오

### 시나리오 A. Notion 성공, DM 일부 실패

- 스프린트 A의 Notion 업로드 성공
- 유저 10명 중 8명 `sent`, 2명 `failed`
- 다음 날에는 실패한 2명만 재시도
- 스프린트 A의 notion 상태는 그대로 `synced`

### 시나리오 B. Slack Member ID 누락

- delivery 생성은 되지만 `slack_member_id`가 비어 있음
- 해당 row는 즉시 `skipped`
- 운영자는 누가 빠졌는지 DB에서 확인 가능

### 시나리오 C. 3일 모두 Slack API 실패

- D+1 실패
- D+2 실패
- D+3 실패
- 상태를 `expired`로 전환
- D+4부터 자동 재시도 없음

---

## 14. 마이그레이션 순서

권장 순서는 아래와 같다.

1. `sprints`에 notion 상태 컬럼 추가
2. `sprint_dm_deliveries` 생성
3. 신규 RPC 추가
4. `sync-sprint-to-notion` Edge Function 배포
5. `send-sprint-dm` Edge Function 배포
6. GitHub Actions를 신규 워크플로우로 교체
7. 기존 `notify-after-sprint.yml` 비활성화 또는 삭제

운영 전환 시점에는 최근 3일 내 종료된 스프린트에 대해 아래 백필 전략이 필요하다.

- Notion은 `notion_synced_at` 기준으로 `synced/pending` 초기화
- DM은 최근 종료 스프린트의 대상 유저를 `sprint_dm_deliveries`에 백필

---

## 15. 테스트 포인트

반드시 확인해야 할 케이스는 아래다.

1. Notion 성공, DM 성공
2. Notion 실패, DM 성공
3. Notion 성공, 일부 유저 DM 실패
4. 같은 날 수동 재실행 시 실패 유저가 재발송되지 않는지
5. D+3 실패 후 D+4에 자동 재시도되지 않는지
6. `slack_member_id` 누락 유저가 `skipped` 처리되는지
7. 코멘트가 없는 스프린트가 잘 종료 처리되는지

---

## 16. 최종 결론

V2에서 가장 중요한 변화는 "스프린트 전체 처리" 관점에서 "외부 연동별, 유저별 처리" 관점으로 상태 모델을 바꾸는 것이다.

정리하면:

- Notion 업로드와 Slack DM 발송은 다른 워크플로우와 다른 Edge Function으로 분리한다.
- Notion 상태는 `sprints`에 유지한다.
- Slack DM 상태는 `sprint_dm_deliveries`에서 `(sprint_id, target_user_id)` 단위로 관리한다.
- 재시도는 KST 기준 하루 한 번, 최대 3일까지만 허용한다.
- 같은 날 재실행 금지와 유저별 멱등성을 데이터 모델로 보장한다.

이 구조로 바꾸면 운영자가 실제로 알고 싶은 질문에 바로 답할 수 있다.

- "이 스프린트는 Notion에 올라갔는가?"
- "어떤 유저가 아직 DM을 못 받았는가?"
- "이 실패는 오늘 다시 보내야 하는가, 내일 다시 보내야 하는가, 아니면 종료되었는가?"

웹 preview 확인을 위한 테스트 커밋