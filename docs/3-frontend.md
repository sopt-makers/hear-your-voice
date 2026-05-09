# 3. Frontend

## 기술 스택

- React 18
- TypeScript
- Vite
- React Router v7
- vanilla-extract
- `@sopt-makers/ui`

## View 목록

| Route | View | 역할 |
|---|---|---|
| `/` | `StartPage` | 활성 스프린트 여부에 따라 시작 가능 상태 분기 |
| `/notice` | `NoticePage` | 작성 전 안내 |
| `/sprint-code` | `SprintCodePage` | 인증 코드 입력 |
| `/sprint-intro` | `SprintIntroPage` | 스프린트 소개 |
| `/user-info` | `UserInfoPage` | 작성자 정보 입력 |
| `/stop-comment` | `StopCommentPage` | Stop 코멘트 작성 |
| `/start-comment` | `StartCommentPage` | Start 코멘트 작성 |
| `/continue-comment` | `ContinueCommentPage` | Continue 코멘트 작성 |
| `/mvp` | `MvpPage` | MVP 선정 및 최종 제출 |
| `/closing` | `ClosingPage` | 제출 완료 |
| `/error` | `ErrorPage` | 서비스 오류 안내 |

## Component 구조

이 문서에서의 "컴포넌트 구조"는 React 렌더 트리가 아니라, `CLAUDE.md`와 동일하게 **역할과 폴더 기준으로 프론트 컴포넌트를 어떻게 나누고 있는지**를 설명한다.

```text
src/
├── components/
│   ├── common/                  # 도메인 무관 공용 컴포넌트
│   │   ├── layout/
│   │   │   ├── PageLayout
│   │   │   └── StepLayout
│   │   ├── form/
│   │   │   ├── SelectField
│   │   │   └── TextAreaField
│   │   └── ui/
│   │       ├── ContentHeading
│   │       ├── FieldSection
│   │       ├── ImageSection
│   │       ├── MemberChip
│   │       └── ProgressBar
│   ├── sprint-code/             # 스프린트 코드 입력 도메인
│   │   └── SprintCodeInput
│   ├── peer-comment/            # Stop / Start / Continue 코멘트 도메인
│   │   ├── PeerCommentStepTemplate
│   │   ├── PeerCommentRepeater
│   │   ├── PeerCommentBlock
│   │   ├── PeerCommentRecipientBlock
│   │   └── PeerMemberPicker
│   └── index.ts                 # 외부 노출용 barrel export
├── pages/                       # 라우트 단위 페이지
│   ├── StartPage
│   ├── NoticePage
│   ├── SprintCodePage
│   ├── SprintIntroPage
│   ├── UserInfoPage
│   ├── StopCommentPage
│   ├── StartCommentPage
│   ├── ContinueCommentPage
│   ├── MvpPage
│   ├── ClosingPage
│   └── ErrorPage
├── context/                     # 전역 폼 상태 Provider
│   └── CommentFormContext
└── hooks/                       # Context 접근/비동기 처리 훅
    ├── useCommentForm
    ├── usePeerMembers
    └── useErrorHandler
```

### 컴포넌트 분류 기준

- `pages/`: 라우터에 직접 연결되는 화면 단위
- `components/common/`: 도메인에 종속되지 않는 범용 UI
- `components/sprint-code/`: 스프린트 코드 입력 전용 UI
- `components/peer-comment/`: Stop / Start / Continue 작성 플로우 전용 UI
- `context/`: 전역 상태 Provider와 Context 객체
- `hooks/`: Context 접근, API 호출, 에러 처리 같은 로직성 훅

### 주요 조합 관계

- `StartPage`는 `PageLayout`을 사용한다.
- 대부분의 입력 페이지는 `StepLayout`을 공통 레이아웃으로 사용한다.
- `StopCommentPage`, `StartCommentPage`, `ContinueCommentPage`는 모두 `PeerCommentStepTemplate`을 공유한다.
- `PeerCommentStepTemplate` 내부에서 `PeerCommentRepeater`, `PeerCommentBlock`, `PeerCommentRecipientBlock`, `PeerMemberPicker`가 단계적으로 조합된다.
- `MvpPage`는 `peer-comment` 도메인 컴포넌트를 재사용하지 않고 별도 검색/선택 UI와 `MemberChip`, `TextAreaField`를 조합한다.

### 컴포넌트별 역할

#### Common Layout

- `PageLayout`: 모든 페이지의 최상위 화면 컨테이너 역할을 한다.
- `StepLayout`: 헤더, 프로그레스바, 하단 CTA 버튼을 포함한 단계형 화면 레이아웃을 제공한다.

#### Common Form

- `SelectField`: 라벨/설명과 함께 사용하는 공통 선택 입력 필드다.
- `TextAreaField`: 라벨이 포함된 공통 멀티라인 입력 필드다.

#### Common UI

- `ContentHeading`: 페이지 또는 섹션의 제목과 설명 문구를 렌더링한다.
- `FieldSection`: 각 입력 블록을 일정한 간격과 패딩으로 묶어주는 섹션 래퍼다.
- `ImageSection`: 설명 이미지나 예시 이미지를 세로로 배치하는 영역이다.
- `MemberChip`: 선택된 멤버를 이름 태그 형태로 표시한다.
- `ProgressBar`: 현재 단계 진행률을 시각적으로 보여준다.

#### Sprint Code Domain

- `SprintCodeInput`: 6자리 스프린트 인증 코드를 입력받는 전용 입력 컴포넌트다.

#### Peer Comment Domain

- `PeerCommentStepTemplate`: Stop / Start / Continue 페이지가 공통으로 사용하는 상위 템플릿이다.
- `PeerCommentRepeater`: 코멘트 입력 블록을 여러 개 추가하거나 제거할 수 있게 관리한다.
- `PeerCommentBlock`: 한 개의 코멘트 입력 단위를 나타내며, 수신자 선택과 코멘트 본문 입력을 함께 가진다.
- `PeerCommentRecipientBlock`: 코멘트 수신자 선택 영역만 분리한 하위 블록이다.
- `PeerMemberPicker`: 바텀시트에서 피드백 대상 멤버를 선택하는 UI다.

#### Context / Hooks

- `CommentFormContext`: 설문 전체 입력값을 페이지 간에 유지하는 전역 상태 컨텍스트다.
- `useCommentForm`: `CommentFormContext`에 접근하는 전용 훅이다.
- `usePeerMembers`: 현재 스프린트, 작성자 정보 기준으로 피드백 대상 멤버 목록을 조회한다.
- `useErrorHandler`: 네트워크 오류와 서비스 오류를 공통 규칙으로 처리한다.

### Barrel export 기준

`src/components/index.ts`를 통해 외부에 노출되는 컴포넌트는 다음과 같다.

- `PageLayout`
- `StepLayout`
- `ProgressBar`
- `MemberChip`
- `ContentHeading`
- `FieldSection`
- `ImageSection`
- `SelectField`
- `TextAreaField`
- `SprintCodeInput`
- `PeerCommentRepeater`
- `PeerCommentStepTemplate`

아래 컴포넌트는 `peer-comment` 내부 조합용이며 외부 barrel export 대상이 아니다.

- `PeerCommentBlock`
- `PeerCommentRecipientBlock`
- `PeerMemberPicker`

## 상태 관리

- 전역 설문 상태: `CommentFormContext`
- 화면별 임시 입력 상태: `useState`
- 데이터 조회:
  - 라우터 loader: 활성 스프린트 여부
  - `useEffect`: 코드 목록, 피어 멤버 목록
- 에러 처리:
  - `callApi()`
  - `useErrorHandler()`

## 입력 데이터 모델

```ts
{
  p_sprint_auth_code: string;
  user_name: string;
  user_team: string;
  user_chapter: string;
  stop_comments: Comment[];
  start_comments: Comment[];
  continue_comments: Comment[];
  mvp: Mvp | null;
}
```

## 주요 UX 흐름

- 인증 코드 입력 후 유효한 스프린트일 때만 다음 단계로 이동한다.
- 작성자 정보는 이름, 챕터, 팀 조합으로 검증한다.
- Stop, Start, Continue는 동일한 `PeerCommentStepTemplate`을 공유한다.
- 하나의 코멘트를 여러 명에게 동시에 보낼 수 있다.
- 최종 제출은 `MvpPage`에서 수행된다.
