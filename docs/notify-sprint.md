# 스프린트 종료 후 자동 알림 (Notion + Slack)

스프린트가 끝난 다음 날 자정(KST), GitHub Actions가 Supabase Edge Function을 호출해 피드백 코멘트를 Notion DB에 동기화하고 각 멤버에게 Slack DM을 발송합니다.

---

## 아키텍처

```
GitHub Actions (매일 자정 KST)
  └─ POST /functions/v1/notify-sprint  →  Supabase Edge Function
       ├─ sprints 테이블에서 어제 종료된 스프린트 조회
       ├─ [Notion] start/continue 코멘트 → 코멘트 DB 저장
       ├─ [Notion] mvp → MVP DB 저장
       ├─ [Slack] target user별 DM 발송 (무무 봇)
       └─ sprints.notion_synced_at 갱신 (중복 처리 방지)
```

- Notion과 Slack은 **독립적으로 실행**됩니다. 하나가 실패해도 나머지는 계속 진행합니다.
- stop 코멘트는 Notion에 저장하지 않습니다. Notion DB 스펙에 stop 컬럼이 없기 때문입니다.

---

## 관련 파일

| 파일 | 역할 |
|------|------|
| `supabase/functions/notify-sprint/index.ts` | Edge Function 본체 |
| `.github/workflows/notify-after-sprint.yml` | GitHub Actions 스케줄러 |
| `docs/notify-sprint.md` | 이 문서 |

---

## 사전 준비

### 1. Supabase DB

**`sprints` 테이블 — `notion_synced_at` 컬럼**

```sql
ALTER TABLE sprints ADD COLUMN notion_synced_at timestamptz;
```

Notion·Slack 처리 완료 후 현재 시각으로 갱신됩니다. `IS NULL` 조건으로 미처리 스프린트만 선별하며, 중복 동기화를 방지하는 역할을 합니다.

**`users` 테이블 — `slack_user_name` 컬럼**

```sql
ALTER TABLE users ADD COLUMN slack_user_name varchar;
```

Slack Member ID (`U1234567` 형태)를 저장합니다. Slack 프로필 클릭 → `Copy member ID`로 확인 가능합니다. 값이 없는 유저는 DM 발송 대상에서 자동 제외됩니다.

**RPC 함수 (Supabase SQL Editor에서 등록, 실제 코드는 Supabase 대시보드에서 확인)**

| 함수명 | 역할 |
|--------|------|
| `get_sprints_for_notion_sync(target_date)` | 어제 종료된 미동기화 스프린트 조회 |
| `get_comments_for_sprint(p_sprint_id)` | 스프린트 코멘트 조회 (Notion 동기화용) |
| `mark_sprint_notion_synced(p_sprint_id)` | 처리 완료 표시 — `notion_synced_at` 갱신 |
| `get_slack_dm_data(p_sprint_id)` | Slack DM용 target user별 코멘트 조회 |

### 2. Notion 설정

**Notion Integration 생성**
- notion.so → 프로필 → Settings → Connections → Develop or manage integrations → New integration
- Internal Integration Secret을 복사

**Notion DB 구조**

코멘트 DB (`NOTION_COMMENTS_DB_ID`)

| 속성명 | 타입 | 설명 |
|--------|------|------|
| `receiver` | 다중 선택 | 코멘트 수신자 이름(들) |
| `스프린트 종류` | 선택 | `sprints.name` 값 |
| `start comment` | 텍스트 | start 타입 코멘트 내용 |
| `continue comment` | 텍스트 | continue 타입 코멘트 내용 |

MVP DB (`NOTION_MVP_DB_ID`)

| 속성명 | 타입 | 설명 |
|--------|------|------|
| `이름` | 제목 | MVP로 선정된 멤버 이름 |
| `자세한 내용` | 텍스트 | MVP 선정 이유 |
| `스프린트 종류` | 선택 | `sprints.name` 값 |

**Notion DB에 Integration 연결**

코멘트 DB와 MVP DB 각각 아래 과정을 반복합니다.
1. Notion DB 페이지 열기
2. 우상단 `...` → Connections
3. 생성한 Integration 검색 후 추가

### 3. Slack 설정

**Slack App 생성 / 권한 설정**
- api.slack.com → Your Apps → 앱 선택 → OAuth & Permissions → Bot Token Scopes
- `chat:write`, `im:write` 추가 후 Reinstall to Workspace
- Bot User OAuth Token (`xoxb-...`) 복사

### 4. GitHub Secrets 등록

GitHub 저장소 → Settings → Secrets and variables → Actions

| Secret 이름 | 값 출처 |
|-------------|---------|
| `SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `SUPABASE_ANON_KEY` | Supabase → Settings → API → `anon public` 키 |

### 5. Supabase Edge Function 환경 변수 등록

Notion/Slack 관련 값은 외부 호출자가 접근할 수 없도록 Edge Function 환경변수로 관리합니다.

```bash
supabase secrets set \
  NOTION_TOKEN=<값> \
  NOTION_COMMENTS_DB_ID=<값> \
  NOTION_MVP_DB_ID=<값> \
  SLACK_BOT_TOKEN=<값>
```

---

## Edge Function 배포

```bash
supabase functions deploy notify-sprint
```

> Supabase CLI가 설치·로그인되어 있어야 합니다 (`supabase login`).

**⚠️ Edge Function 코드를 수정한 경우 반드시 재배포해야 합니다.** 코드를 git에 push하는 것만으로는 반영되지 않습니다.

---

## 동작 방식

### 스케줄

매일 15:00 UTC (자정 KST) 자동 실행됩니다. GitHub Actions → `Notify after sprint ends` → Run workflow로 수동 실행도 가능합니다.

> workflow_dispatch(수동 실행)는 default 브랜치에 워크플로우 파일이 있을 때만 Actions 탭에 표시됩니다.

### 대상 스프린트 선별

```
end_date = 어제(KST 기준) AND notion_synced_at IS NULL
```

### Notion — start/continue 그룹핑

같은 발신자가 동일한 내용을 여러 명에게 보낸 경우 Notion에 한 행으로 묶어 `receiver` 다중 선택에 수신자들을 나열합니다.

그룹핑 키: `(sender_id, type, content)` — 발신자 정보는 Notion에 저장하지 않습니다(모든 타입 무기명).

### Slack DM 메시지 형식

```
무우~ 🐮 {이름}님에게 {스프린트명} 동료들의 메세지가 도착했어요!

🐣 {이름}님의 성장을 위해 제안하고 싶어요.   ← start 코멘트
- ...

👍 {이름}님이 잘하고 있는 부분이에요.         ← continue 코멘트
- ...

✋ {이름}님! 이 부분은 더 노력해주시면 좋겠어요. ← stop 코멘트
- ...

❤️ 동료 N명이 {이름}님을 MVP로 선택했어요.    ← mvp
- ...

이번 스프린트도 수고 많았어요! - 무무가 🐮
```

코멘트가 없는 섹션은 자동으로 생략됩니다. `users.slack_user_name`이 비어있는 유저는 DM 발송 대상에서 제외됩니다.

### 중복 방지

Notion·Slack 처리가 모두 완료된 후 `notion_synced_at`을 갱신합니다. 갱신 실패 시 에러를 전파해 다음 실행에서 재시도할 수 있습니다. 코멘트가 없는 스프린트도 갱신되어 재처리되지 않습니다.

---

## 유지보수 가이드

### Edge Function 코드 수정 후

```bash
# 1. 코드 수정
# 2. 반드시 재배포
supabase functions deploy notify-sprint
# 3. git commit & push (코드 형상 관리용)
```

### 환경 변수 변경 후

```bash
supabase secrets set KEY=새값
supabase functions deploy notify-sprint  # 재배포 필요
```

### 새 스프린트 시즌 시작 전

- `users.slack_user_name`에 새 멤버의 Slack Member ID 등록
- Notion DB에 새 스프린트 `스프린트 종류` select 옵션이 자동 생성됨 (별도 작업 불필요)

### 테스트 방법

```sql
-- 특정 스프린트를 미처리 상태로 초기화
UPDATE sprints SET notion_synced_at = NULL WHERE id = <sprint_id>;
```

GitHub Actions → Run workflow로 수동 실행 후 결과 확인.

---

## 트러블슈팅

**GitHub Actions 실패 — HTTP 4xx**
- `SUPABASE_URL` 끝에 슬래시 없는지, `SUPABASE_ANON_KEY`가 `anon` 키인지 확인

**Notion에 행이 안 생김**
- `NOTION_TOKEN`, DB ID가 `supabase secrets list`에 있는지 확인
- Notion DB에 Integration이 연결되어 있는지 확인 (DB 페이지 `...` → Connections)
- Notion DB URL에서 `?v=` 앞의 ID를 사용했는지 확인

**Slack DM이 안 옴**
- `SLACK_BOT_TOKEN`이 `supabase secrets list`에 있는지 확인
- Slack App에 `chat:write`, `im:write` scope가 있는지 확인
- Reinstall 후 새 토큰으로 재등록했는지 확인
- `users.slack_user_name`에 올바른 Member ID가 입력되어 있는지 확인

**같은 스프린트가 중복 처리됨**
- `sprints.notion_synced_at` 컬럼이 존재하는지 확인
- Edge Function 로그에서 `mark_sprint_notion_synced` RPC 오류 확인

**코드 수정 후 반영이 안 됨**
- `supabase functions deploy notify-sprint` 재배포 여부 확인
