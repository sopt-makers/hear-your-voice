# CLAUDE.md

## 🚫 Must Not

- `.pen` 파일 절대 수정 금지
- 하드코딩된 color / font 사용 금지

## 🎨 Design System

- color → `@sopt-makers/colors`
- font → `@sopt-makers/fonts`

## 🧩 UI Rules

- 항상 `@sopt-makers/ui` 먼저 사용
- 없을 때만 `/components`에 커스텀 구현

## 📦 패키지 구조

```text
src/
├── components/
│   ├── common/                  → 도메인 무관한 범용 컴포넌트
│   │   ├── layout/              (PageLayout, StepLayout)
│   │   ├── form/                (SelectField, InputField)
│   │   └── ui/                  (ContentHeading, ImageSection, ProgressBar, MemberChip)
│   ├── sprint-code/             → 스프린트 코드 도메인
│   │   └── SprintCodeInput
│   ├── peer-comment/            → 피어 코멘트 도메인
│   │   ├── PeerCommentStepTemplate  ← index.ts 외부 노출
│   │   ├── PeerCommentRepeater      ← index.ts 외부 노출
│   │   ├── PeerCommentBlock
│   │   ├── PeerCommentRecipientBlock
│   │   └── PeerMemberPicker
│   └── index.ts                 → barrel export
├── pages/                       → 라우터에 직접 연결되는 단위
│   ├── StartPage
│   ├── NoticePage
│   ├── SprintCodePage
│   ├── SprintIntroPage
│   ├── UserInfoPage
│   ├── StopCommentPage
│   └── ErrorPage
├── types/                       → 도메인 타입 정의
│   ├── comment.ts               (Comment, Mvp, CommentFormState, CommentSubmissionPayload, CommentsKey, PeerCommentKind, PeerCommentRowState, CommentSubmitResult)
│   ├── peer.ts                  (PeerMember)
│   ├── chapter.ts
│   └── sprint.ts
├── utils/                       → 순수 비즈니스 로직 유틸
│   └── peerCommentUtils
├── context/                     → React Context (Provider 컴포넌트만)
│   └── CommentFormContext        (CommentFormProvider, CommentFormContext)
├── hooks/                       → 커스텀 훅
│   ├── useCommentForm           (CommentFormContext 접근)
│   ├── usePeerMembers
│   └── useErrorHandler
└── lib/                         → 외부 서비스 연동 (Supabase, API)
    ├── api/                     (comment, sprint, sprintPeers, chapter, user)
    ├── apiClient.ts
    ├── errors.ts
    └── supabase.ts
```

## 🏷️ 네이밍 규칙

| Postfix | 의미 | 예시 |
|---|---|---|
| `Page` | 라우터에 직접 연결되는 화면 단위 | `StopCommentPage` |
| `Template` | 여러 Page가 공유하는 로직+구조 묶음 | `PeerCommentStepTemplate` |
| `Layout` | 도메인 로직 없는 순수 레이아웃 껍데기 | `PageLayout`, `StepLayout` |
| `Input` | 단일 값을 입력받는 폼 요소 | `SprintCodeInput` |
| `Field` | 라벨·설명 포함한 폼 필드 묶음 | `SelectField`, `InputField` |
| `Picker` | 목록에서 항목을 선택하는 UI | `PeerMemberPicker` |
| `Chip` | 선택된 항목을 표시하는 태그 UI | `MemberChip` |
| `Repeater` | 동일한 입력 블록을 반복·관리 | `PeerCommentRepeater` |
| `Block` / `Section` | 여러 요소를 묶은 영역 단위 | `PeerCommentRecipientBlock` |

## 🗂️ Import Aliases

| Alias | 실제 경로 |
|---|---|
| `@components` | `src/components` |
| `@pages` | `src/pages` |
| `@hooks` | `src/hooks` |
| `@context` | `src/context` |
| `@types` | `src/types` |
| `@utils` | `src/utils` |
| `@lib` | `src/lib` |
| `@assets` | `src/assets` |

- 도메인 경계를 넘는 참조는 alias 사용 (예: `@hooks`, `@lib`, `@types`)
- `src/components/` 내부 간 참조는 상대 경로 유지 (순환참조 방지)
- 같은 폴더 내 참조는 `./`, 상위·형제 폴더 참조는 `../` 사용

## 📌 구조 원칙

- 최상위 기준: `common/` (범용) vs 도메인 폴더 (특화)
- 범용 컴포넌트는 역할에 따라 `common/layout/` · `common/form/` · `common/ui/` 에 추가
- 도메인 특화 컴포넌트는 도메인명 폴더로 분리 (예: `peer-comment/`)
- 외부에서는 항상 `@components` (= `components/index.ts` barrel) 를 통해 import
- `Page`는 `pages/`에, 나머지는 `components/` 하위에 위치
- `context/`는 Provider 컴포넌트와 Context 객체만 export — 훅은 반드시 `hooks/`에 분리, 타입은 반드시 `types/`에 분리
- 타입은 항상 `@types`에서 import — `@context` 등 다른 경로에서 타입을 re-export하지 않음

## 🔐 Supabase

- service_role key 절대 사용 금지
- 민감 데이터 직접 조회 금지
- 검증은 RPC 또는 서버 로직 사용

## 📌 General

- 기존 코드 스타일/구조를 반드시 따를 것
