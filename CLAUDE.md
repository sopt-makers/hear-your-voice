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

## 🔐 Supabase

- service_role key 절대 사용 금지
- 민감 데이터 직접 조회 금지
- 검증은 RPC 또는 서버 로직 사용

## 📌 General

- 기존 코드 스타일/구조를 반드시 따를 것
