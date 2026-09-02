# 5. Operations

## 매 기수 시작 전 데이터 수정

새 기수가 시작되기 전에는 운영 데이터와 외부 연동 설정을 함께 점검해야 한다.  
특히 멤버 정보, 스프린트 메타데이터, Notion 업로드용 기수값은 수동 관리 항목이므로 사전 업데이트가 필요하다.

### 이전 기수 데이터 삭제
새 기수 시작 전 이전 기수 데이터는 모두 삭제한다.

### users 테이블 업데이트

새 기수 멤버 정보를 수집하여 `users` 테이블을 먼저 최신 상태로 맞춘다.

- 해당 기수 멤버 추가
- `slack_user_name` 값 등록

필수 컬럼:

- `name`
- `team_code`
- `chapter_code`
- `slack_user_name`

유의사항:

- `slack_user_name`은 Slack DM 발송 대상 식별에 사용된다.
- 이 값이 비어 있으면 `send-sprint-dm`에서 해당 유저는 DM 발송 대상에서 제외된다.
- 팀/챕터 코드는 `codes` 테이블의 값과 일치해야 한다.

누락 시 영향:

- 사용자 검증(`is_valid_user`) 실패
- 피드백 대상자 조회(`get_users_by_sprint`) 누락 또는 오동작
- Slack DM 미발송

예시 확인 쿼리:

```sql
SELECT id, name, team_code, chapter_code, slack_user_name
FROM users
ORDER BY id;
```

### sprints 정보 업데이트

새 기수 스프린트가 시작되기 전에 `sprints` 테이블에 운영할 스프린트 정보를 등록해야 한다.

주요 입력 항목:

- `type`
- `name`
- `start_date`
- `end_date`
- `auth_code`
- `notion_retry_deadline`

운영 메모:

- `auth_code`는 프론트에서 스프린트 진입 검증에 사용된다.
- `type`은 `team` 또는 `chapter`이며, 피드백 대상 범위를 결정한다.
- `notion_retry_deadline`은 Notion 재시도 정책에 사용된다.
- 스프린트 종료 후 DM 재시도 마감일은 별도 RPC에서 `end_date + 3일` 기준으로 계산된다.

누락 시 영향:

- 활성 스프린트가 열리지 않음
- 인증 코드 검증 실패
- Notion 동기화 대상에서 제외될 수 있음

예시 확인 쿼리:

```sql
SELECT id, type, name, start_date, end_date, auth_code, notion_retry_deadline
FROM sprints
ORDER BY start_date DESC;
```

### notion.ts에서 활동 기수 업데이트

Notion 업로드 시 `기수` 속성에 들어가는 값은 코드 상수로 관리되고 있다.

대상 파일:

- /supabase/functions/sync-sprint-to-notion/notion.ts

코드:

```ts
export const NOTION_GENERATION = '38'; // 매 기수마다 업데이트
```

의미:

- `sync-sprint-to-notion` Edge Function이 Notion Comments DB와 MVP DB에 데이터를 업로드할 때
- `기수` select 속성 값으로 `NOTION_GENERATION`을 사용한다.

작업 방법:

1. 새 기수 시작 전 `NOTION_GENERATION` 값을 현재 운영 기수로 변경한다.
2. main 브랜치에 변경사항이 반영되면, Edge Function이 다시 배포된다.

누락 시 영향:

- Notion에 업로드되는 모든 데이터가 이전 기수 값으로 기록된다.
- 기수별 필터링이나 집계가 잘못될 수 있다.

운영 체크:

- Notion DB의 `기수` select 옵션에 새 기수 값이 존재하는지 확인
- 수동 실행 또는 다음 배치 실행 후 샘플 row 1건 검증

### 권장 체크리스트

기수 시작 전 아래 순서로 점검하는 것을 권장한다.

1. `codes` 테이블에 팀/챕터 코드가 최신인지 확인
2. `users` 테이블에 멤버 정보와 `slack_user_name` 반영
3. `sprints` 테이블에 신규 스프린트 등록
4. `supabase/functions/sync-sprint-to-notion/notion.ts`의 `NOTION_GENERATION` 업데이트
5. main 브랜치에 변경사항 반영 후 `sync-sprint-to-notion` Edge Function 재배포를 확인
6. 필요 시 preview 환경에서 기본 입력 플로우와 배치 수동 실행 검증


## 환경 변수

### Frontend

| Key | 용도 |
|---|---|
| `VITE_SUPABASE_URL` | Supabase 프로젝트 URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase public key |

### Edge Functions

| Key | 용도 |
|---|---|
| `SUPABASE_URL` | Supabase 연결 URL |
| `SUPABASE_SERVICE_ROLE_KEY` | 서비스 롤 권한 |
| `CRON_SECRET` | 배치 호출 인증 |
| `NOTION_TOKEN` | Notion API 인증 |
| `NOTION_COMMENTS_DB_ID` | 코멘트 DB ID |
| `NOTION_MVP_DB_ID` | MVP DB ID |
| `SLACK_BOT_TOKEN` | Slack Bot 인증 |
| `SLACK_ALERT_CHANNEL_ID` | Notion 아카이빙 실패 시 알림을 보낼 Slack 채널 ID |

## 배포

### Frontend

- Frontend는 **Cloudflare Pages**에서 배포한다.
- 배포 대상은 Vite로 빌드된 정적 산출물이다.
- 환경 변수는 Cloudflare 배포 환경에 맞게 주입되어야 한다.

배포 환경:

- `production`: `main` 브랜치
- `preview`: `develop` 브랜치

운영 규칙:

- `main` 브랜치는 실제 운영 환경으로 사용한다.
- `develop` 브랜치는 preview URL이 제공되는 검수 환경으로 사용한다.
- preview와 production은 Cloudflare Pages에서 분리된 환경으로 관리한다.

현재 문서에 확인된 범위:

- 빌드 명령: `npm run build`
- 배포 시 필수 환경 변수:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_PUBLISHABLE_KEY`

추가로 정리하면 좋은 항목:

- 수동 배포 여부 또는 Git 연동 자동 배포 여부
- 커스텀 도메인 연결 여부
- preview/prod별 환경 변수 차이

### Supabase Edge Functions

```bash
supabase functions deploy sync-sprint-to-notion
supabase functions deploy send-sprint-dm
```

### GitHub Actions

- `main` 브랜치 push 시 release workflow가 실행된다.
- workflow는 `develop` fast-forward sync, tag 생성, GitHub Release 발행을 수행한다.

## 에러 처리

### Frontend

- 네트워크 오류는 toast로 사용자에게 안내한다.
- 서비스 오류는 `/error` 페이지로 이동한다.

### Batch / Integration

- 개별 스프린트 또는 개별 delivery 단위로 실패를 기록한다.
- 실패 시 재시도 가능하도록 상태와 에러 메시지를 남긴다.

## 모니터링

- Supabase Edge Function 로그
- GitHub Actions 실행 로그
- `sprints` 동기화 상태 컬럼
- `sprint_dm_deliveries` 발송 상태 컬럼
