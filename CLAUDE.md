# CLAUDE.md

## 프로젝트 개요

**hear-your-voice (너목들)**는 SOPT 스프린트 회고 설문 웹 애플리케이션입니다.
멤버들이 스프린트 인증 코드를 입력한 뒤 Stop / Start / Continue 방식의 회고 피드백과 MVP를 제출하는 플로우로 구성됩니다.

### 페이지 플로우

```
StartPage (활성 스프린트 여부 분기)
  └─ NoticePage (안내)
       └─ SprintCodePage (인증 코드 입력)
            └─ SprintIntroPage (스프린트 소개)
                 └─ UserInfoPage (사용자 정보 입력)
                      └─ (회고 설문 스텝들 — 추후 구현 예정)
```

---

## 프로젝트 구조

```
src/
├── assets/          # 정적 이미지 리소스
├── components/      # 공통 재사용 컴포넌트
│   ├── CodeInput       # 인증 코드 입력 필드
│   ├── ContentHeading  # 페이지 제목 영역
│   ├── ImageSection    # 이미지 섹션
│   ├── PageLayout      # 전체 페이지 래퍼
│   ├── ProgressBar     # 스텝 진행 바
│   ├── SelectField     # 셀렉트 폼 필드
│   └── StepLayout      # 스텝 기반 레이아웃 (하단 버튼 포함)
├── context/
│   └── SubmissionContext.tsx  # 설문 제출 데이터 전역 상태
├── hooks/
│   └── useErrorHandler.ts     # 에러 핸들링 커스텀 훅
├── lib/
│   ├── api/
│   │   ├── chapter.ts   # 챕터 API
│   │   ├── comment.ts   # 댓글(회고) API
│   │   ├── sprint.ts    # 스프린트 API
│   │   └── user.ts      # 유저 API
│   ├── apiClient.ts     # Supabase 호출 래퍼 (에러 분류)
│   ├── errors.ts        # 커스텀 에러 클래스
│   └── supabase.ts      # Supabase 클라이언트 초기화
├── pages/           # 라우트 단위 페이지 컴포넌트
├── types/           # TypeScript 타입 정의
├── App.tsx          # 라우터 설정 진입점
└── main.tsx         # 앱 마운트
```

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| 프레임워크 | React 18 + TypeScript |
| 빌드 | Vite |
| 라우팅 | React Router v7 |
| 상태 관리 | React Context (`SubmissionContext`) + Zustand (필요 시) |
| 백엔드/DB | Supabase (RPC 기반 쿼리) |
| 스타일링 | vanilla-extract (`*.css.ts`) |
| 디자인 시스템 | `@sopt-makers/ui`, `@sopt-makers/colors`, `@sopt-makers/fonts`, `@sopt-makers/icons` |
| 린트/포맷 | ESLint + Prettier |

---

## 금지 사항

- `.pen` 파일 절대 수정 금지
- 하드코딩된 color / font 값 사용 금지 → 반드시 `@sopt-makers/colors`, `@sopt-makers/fonts` 사용
- Supabase `service_role` key 사용 금지
- 민감 데이터 클라이언트에서 직접 조회 금지 → RPC 또는 서버 로직 사용

---

## 디자인 시스템

- 색상 → `@sopt-makers/colors`
- 폰트 → `@sopt-makers/fonts`
- UI 컴포넌트 → 항상 `@sopt-makers/ui` 먼저 확인, 없을 때만 `src/components/`에 커스텀 구현

---

## 스타일링 규칙

- 스타일은 반드시 **vanilla-extract** (`*.css.ts`) 파일로 분리
- 인라인 스타일 또는 CSS 모듈(`.module.css`) 혼용 금지
- 새 컴포넌트/페이지 추가 시 같은 경로에 `*.css.ts` 파일 함께 생성

---

## API 규칙

- 모든 Supabase 호출은 `callApi()` 래퍼(`src/lib/apiClient.ts`)로 감싸야 함
- DB 직접 쿼리 대신 RPC(`supabase.rpc(...)`) 사용 원칙
- API 함수는 `src/lib/api/` 하위 도메인별 파일에 위치

---

## 상태 관리 규칙

- 설문 제출 데이터는 `SubmissionContext` (`src/context/SubmissionContext.tsx`)를 통해 관리
- 페이지 간 데이터 전달은 `location.state` 또는 `SubmissionContext` 사용
- Zustand는 SubmissionContext로 처리하기 어려운 전역 상태에만 도입

---

## AI Agent 작업 지침

### 코드 수정 전

- 수정 전 반드시 관련 파일을 먼저 읽고 기존 패턴·구조를 파악한 뒤 작업
- 기존 코드 스타일과 일관성을 유지 (네이밍, 파일 구성 방식 등)

### 컴포넌트 추가 시

1. `@sopt-makers/ui`에 적합한 컴포넌트가 있는지 먼저 확인
2. 없으면 `src/components/`에 `.tsx` + `.css.ts` 쌍으로 생성
3. `src/components/index.ts`에 export 추가

### 페이지 추가 시

1. `src/pages/` 아래 `XxxPage.tsx` + `XxxPage.css.ts` 생성
2. `src/App.tsx` 라우터에 경로 등록
3. 필요한 경우 `SubmissionContext` 타입 확장

### 에러 처리

- 네트워크 오류 → `NetworkError` (toast 표시)
- 서비스 오류 → `ServiceError` → `/error` 페이지로 이동
- `useErrorHandler` 훅 활용

### 하지 말아야 할 것

- 요청 범위를 벗어난 리팩토링, 기능 추가, 코드 정리
- 불필요한 주석·타입 어노테이션 추가
- 투기적 추상화 (미래 요구사항 대비 구조 설계)
- 단순 버그 수정인데 주변 코드까지 개선
