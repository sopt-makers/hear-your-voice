# 6. Convention

## 네이밍

| Suffix | 의미 | 예시 |
|---|---|---|
| `Page` | 라우트에 직접 연결되는 화면 단위 | `StopCommentPage` |
| `Template` | 여러 화면이 공유하는 로직과 구조 | `PeerCommentStepTemplate` |
| `Layout` | 도메인 로직 없는 레이아웃 껍데기 | `PageLayout`, `StepLayout` |
| `Input` | 단일 값 입력 컴포넌트 | `SprintCodeInput` |
| `Field` | 라벨과 설명을 포함한 입력 묶음 | `SelectField`, `TextAreaField` |
| `Picker` | 목록 선택 UI | `PeerMemberPicker` |
| `Chip` | 선택된 항목 표시 UI | `MemberChip` |
| `Repeater` | 반복 입력 블록 관리자 | `PeerCommentRepeater` |
| `Block` / `Section` | 영역 단위 묶음 | `PeerCommentBlock`, `FieldSection` |

## 폴더 구조

```text
src/
├── assets/
├── components/
│   ├── common/
│   ├── peer-comment/
│   └── sprint-code/
├── constant/
├── context/
├── hooks/
├── lib/
│   ├── api/
│   └── ...
├── pages/
├── types/
└── utils/

supabase/
└── functions/
```

## 코드 스타일

- 스타일은 `*.css.ts`로 분리하고 vanilla-extract를 사용한다.
- 디자인 토큰은 `@sopt-makers/colors`, `@sopt-makers/fonts`를 우선 사용한다.
- Supabase 호출은 `src/lib/api/` 하위 도메인 함수로 감싼다.
- API 호출은 `callApi()`를 통해 에러 분류와 후처리를 통일한다.
- 페이지는 `pages/`, 재사용 컴포넌트는 `components/` 하위에 둔다.
- 도메인 경계를 넘는 참조는 alias import를 우선 사용한다.
