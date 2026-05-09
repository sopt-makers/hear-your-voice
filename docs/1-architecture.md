# 1. Architecture

## 개요

`hear-your-voice`는 스프린트 회고 설문을 수집하는 프론트엔드와, Supabase RPC/Edge Function 기반 백엔드 자동화로 구성되어 있다.

## 전체 구조도

```text
Client (React + Vite)
  ├─ Router / Pages
  ├─ CommentFormContext
  ├─ Hooks
  └─ Supabase RPC Client
           │
           ▼
Supabase
  ├─ Postgres Tables
  ├─ RPC Functions
  └─ Edge Functions
       ├─ sync-sprint-to-notion
       └─ send-sprint-dm
           │
           ├─ Notion API
           └─ Slack API

GitHub Actions
  └─ release workflow
```

## 데이터 흐름

1. 사용자가 `StartPage`에 진입하면 `has_active_sprint` RPC로 활성 스프린트 여부를 확인한다.
2. `SprintCodePage`에서 인증 코드를 입력하면 `get_sprint_info_by_code` RPC로 유효성을 검증한다.
3. `UserInfoPage`에서 이름, 챕터, 팀을 입력하고 `is_valid_user` RPC로 작성자 존재 여부를 검증한다.
4. `usePeerMembers` 훅이 `get_users_by_sprint` RPC를 호출해 피드백 대상자 목록을 조회한다.
5. Stop, Start, Continue, MVP 입력값은 `CommentFormContext`에 누적된다.
6. 최종 제출 시 `submit_comments` RPC로 전체 payload를 한 번에 저장한다.
7. 스프린트 종료 후에는 Supabase Edge Function이 Notion 동기화와 Slack DM 발송을 처리한다.

## 런타임 구성

- Frontend: React 18, TypeScript, Vite, React Router v7
- Styling: vanilla-extract
- Backend/Data: Supabase Postgres + RPC
- Automation: Supabase Edge Functions
- Release Automation: GitHub Actions

## 주요 설계 원칙

- 클라이언트는 테이블 직접 조회보다 RPC 호출을 우선 사용한다.
- 설문 입력은 페이지별 로컬 상태와 `CommentFormContext`를 조합해 관리한다.
- 외부 서비스 연동은 프론트가 아닌 Edge Function에서 수행한다.
- 배치성 작업은 개별 스프린트 또는 개별 delivery 단위로 실패를 격리한다.
