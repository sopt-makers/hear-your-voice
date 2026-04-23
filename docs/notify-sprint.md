# 스프린트 종료 후 노션 자동 동기화

스프린트가 끝난 다음 날 자정(KST), GitHub Actions가 Supabase Edge Function을 호출해 해당 스프린트의 피드백 코멘트를 Notion DB에 자동으로 옮깁니다.

---

## 아키텍처

```
GitHub Actions (매일 자정 KST)
  └─ POST /functions/v1/notify-sprint  →  Supabase Edge Function
       ├─ sprints 테이블에서 어제 종료된 스프린트 조회
       ├─ comments 테이블에서 해당 스프린트 코멘트 조회
       ├─ Notion 코멘트 DB에 start/continue 행 삽입
       ├─ Notion MVP DB에 mvp 행 삽입
       └─ sprints.notion_synced_at 갱신 (중복 방지)
```

**stop 코멘트는 Notion에 저장하지 않습니다.** Notion DB 스펙에 stop 컬럼이 없기 때문입니다.

---

## 관련 파일

| 파일 | 역할 |
|------|------|
| `supabase/functions/notify-sprint/index.ts` | Edge Function 본체 |
| `.github/workflows/notify-after-sprint.yml` | GitHub Actions 스케줄러 |

---

## 사전 준비

### 1. Supabase DB — `notion_synced_at` 컬럼

`sprints` 테이블에 중복 동기화 방지용 컬럼이 필요합니다.

```sql
ALTER TABLE sprints ADD COLUMN notion_synced_at timestamptz;
```

동기화 완료 후 현재 시각으로 갱신되며, `IS NULL` 조건으로 미처리 스프린트만 선별합니다.

### 2. Notion DB 구조

**코멘트 DB** (`NOTION_COMMENTS_DB_ID`)

| 속성명 | 타입 | 설명 |
|--------|------|------|
| `receiver` | 다중 선택 | 코멘트 수신자 이름(들) |
| `스프린트 종류` | 선택 | `sprints.name` 값 |
| `start comment` | 텍스트 | start 타입 코멘트 내용 |
| `continue comment` | 텍스트 | continue 타입 코멘트 내용 |

> start와 continue는 별도 행으로 삽입됩니다. 같은 발신자가 같은 내용을 여러 명에게 보낸 경우 `receiver`에 여러 이름이 들어갑니다.

**MVP DB** (`NOTION_MVP_DB_ID`)

| 속성명 | 타입 | 설명 |
|--------|------|------|
| `이름` | 제목 | MVP로 선정된 멤버 이름 |
| `자세한 내용` | 텍스트 | MVP 선정 이유 |
| `스프린트 종류` | 선택 | `sprints.name` 값 |

### 3. GitHub Secrets 등록

GitHub 저장소 → Settings → Secrets and variables → Actions → New repository secret

| Secret 이름 | 값 출처 |
|-------------|---------|
| `SUPABASE_URL` | Supabase 프로젝트 Settings → API → Project URL |
| `SUPABASE_ANON_KEY` | Supabase 프로젝트 Settings → API → `anon` `public` 키 |

> Notion 관련 키(`NOTION_TOKEN`, `NOTION_COMMENTS_DB_ID`, `NOTION_MVP_DB_ID`)는 GitHub Secrets가 아닌 **Supabase Edge Function 환경 변수**로 관리합니다. 아래 4번을 참고하세요.

### 4. Supabase Edge Function 환경 변수 등록

Notion 관련 값은 Edge Function 내부에서만 읽히도록 Supabase secrets로 등록합니다. 이렇게 하면 외부 호출자가 request body로 Notion 목적지를 임의로 바꿔 회고 데이터를 탈취하는 것을 방지할 수 있습니다.

```bash
supabase secrets set \
  NOTION_TOKEN=<값> \
  NOTION_COMMENTS_DB_ID=<값> \
  NOTION_MVP_DB_ID=<값>
```

| 환경 변수 | 값 출처 |
|-----------|---------|
| `NOTION_TOKEN` | Notion → Settings → Connections → Develop or manage integrations → Internal Integration Secret |
| `NOTION_COMMENTS_DB_ID` | 코멘트 Notion DB URL의 마지막 32자리 ID |
| `NOTION_MVP_DB_ID` | MVP Notion DB URL의 마지막 32자리 ID |

> Notion DB에 Integration 연결 필요: DB 우상단 `...` → Connections → 해당 Integration 추가

---

## Edge Function 배포

```bash
supabase functions deploy notify-sprint
```

> Supabase CLI가 설치·로그인되어 있어야 합니다 (`supabase login`).  
> `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`는 Edge Function 런타임에 자동 주입되므로 별도 설정 불필요.

---

## 동작 방식

### 스케줄

`.github/workflows/notify-after-sprint.yml`에 정의된 cron(`0 15 * * *` UTC = 자정 KST)으로 매일 실행됩니다.

수동 실행(테스트)은 GitHub Actions → `Notify after sprint ends` → Run workflow로 가능합니다.

### 대상 스프린트 선별

```
end_date = 어제(KST 기준) AND notion_synced_at IS NULL
```

### start/continue 그룹핑

같은 발신자가 동일한 내용을 여러 명에게 보낸 경우 Notion에 한 행으로 묶어 `receiver` 다중 선택에 수신자들을 나열합니다.

그룹핑 키: `(sender_id, type, content)` — 발신자 정보는 Notion에 저장하지 않습니다(모든 타입 무기명).

### 중복 방지

Notion 삽입이 모두 완료된 후 `notion_synced_at`을 현재 시각으로 갱신합니다. 갱신 실패 시 에러를 전파해 다음 실행에서 재시도할 수 있도록 합니다. 코멘트가 없는 스프린트도 `notion_synced_at`이 갱신되어 재처리되지 않습니다.

---

## 트러블슈팅

**GitHub Actions 실패 — HTTP 4xx**

- Edge Function이 배포되어 있는지 확인: Supabase 대시보드 → Edge Functions
- `SUPABASE_URL` 끝에 슬래시(`/`) 없는지 확인
- `SUPABASE_ANON_KEY`가 `anon` 키인지 확인 (`service_role` 키 아님)

**GitHub Actions 실패 — timeout**

- curl `--connect-timeout 10`, `--max-time 60` 제한 내에 응답이 없는 경우
- Supabase 대시보드 → Edge Functions → Logs에서 함수 실행 여부 확인

**Notion에 행이 안 생김**

- `supabase secrets set`으로 `NOTION_TOKEN`, `NOTION_COMMENTS_DB_ID`, `NOTION_MVP_DB_ID`가 등록되어 있는지 확인
- `NOTION_TOKEN`이 만료되지 않았는지 확인
- 해당 Integration이 Notion DB에 연결되어 있는지 확인
- DB ID가 올바른지 확인 (32자리 UUID, 하이픈 제거 형태도 허용)

**같은 스프린트가 중복 삽입됨**

- `sprints` 테이블에 `notion_synced_at` 컬럼이 존재하는지 확인
- Edge Function이 정상 종료되었는지 Supabase 대시보드 → Edge Functions → Logs에서 확인
