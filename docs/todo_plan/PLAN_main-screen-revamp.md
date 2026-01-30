# Task Plan: Main Screen Revamp (메인 화면 개편)

> **Generated from**: docs/prd/PRD_main-screen-revamp.md
> **Created**: 2026-01-30
> **Status**: pending

## Execution Config

| Option | Value | Description |
|--------|-------|-------------|
| `auto_commit` | true | 완료 시 자동 커밋 |
| `commit_per_phase` | true | Phase별 중간 커밋 |
| `quality_gate` | true | /auto-commit 품질 검사 |

## Phases

### Phase 1: 글로벌 홈 화면 + 자동 전환

- [ ] `react-native-maps` 패키지 설치 및 Expo 설정
- [ ] Destination 모델에 `latitude`, `longitude` 필드 추가 (types.ts)
- [ ] SQLite 마이그레이션 - destinations 테이블에 좌표 컬럼 추가
- [ ] 도시명 → 좌표 매핑 유틸 생성 (주요 여행지 정적 좌표 데이터)
- [ ] `TripMapView` 컴포넌트 구현 (react-native-maps 기반)
- [ ] `TripMarker` 컴포넌트 구현 (상태별 핀 색상)
- [ ] `getTripStatus()` 헬퍼 함수 구현 (upcoming/active/past)
- [ ] `(tabs)/index.tsx` → 글로벌 홈 화면으로 교체
- [ ] 여행 리스트 상태별 섹션 (현재 > 예정 > 과거) 구현
- [ ] `TripCard` 컴포넌트 (상태 배지 포함) 구현
- [ ] 자동 여행 모드 전환 로직 (앱 실행 시 activeTrip 감지 → 자동 이동)
- [ ] 글로벌 홈 ↔ 여행 메인 네비게이션 연결

### Phase 2: 여행 메인 화면 개편

- [ ] `trip/[id]/main.tsx` 파일 생성 (기존 홈 화면 로직 이동)
- [ ] `BudgetSummaryCard` 컴포넌트 구현 (예산/총지출/잔여)
- [ ] 예산 미설정 시 조건부 렌더링 (총 지출만 표시)
- [ ] `TodayExpenseTable` 컴포넌트 구현 (테이블 형식)
- [ ] 테이블 행: 카테고리 아이콘 | 메모/설명 | 금액 컬럼
- [ ] 테이블 하단: 합계 행 + KRW 환산
- [ ] Expense 모델에 `receiptId`, `inputMethod` 필드 추가
- [ ] 영수증 입력 항목에 📷 아이콘 버튼 표시
- [ ] `expense/[id]/receipt.tsx` 영수증 상세 페이지 생성
- [ ] 영수증 버튼 → 상세 페이지 네비게이션 연결
- [ ] 테이블 행 탭 → 지출 수정 화면 연결

### Phase 3: 계산기 기능

- [ ] `calculator.tsx` 모달 화면 생성
- [ ] 계산기 UI 구현 (숫자 패드 + 연산 버튼 레이아웃)
- [ ] 사칙연산 로직 구현 (+, -, ×, ÷)
- [ ] AC (전체 초기화), DEL (마지막 삭제) 기능
- [ ] 소수점 입력 지원
- [ ] `CurrencyPicker` 컴포넌트 구현 (여행 국가 통화 기반)
- [ ] 단일 국가 여행: 자동 통화 선택 로직
- [ ] 다중 국가 여행: 현재 방문 국가 기본 선택 + 수동 전환
- [ ] 결과의 KRW 환산 표시 (캐시된 환율 사용)
- [ ] FAB 영역에 계산기 버튼 (🔢) 배치
- [ ] 계산기 버튼 → 모달 오픈 연결

### Phase 4: 마무리

- [ ] 신규 화면 다크모드 대응
- [ ] 오프라인 동작 검증 (지도 제외)
- [ ] 화면 전환 애니메이션 적용
- [ ] 접근성 (VoiceOver 라벨) 확인
- [ ] 기존 테스트 코드 업데이트

## Progress

| Metric | Value |
|--------|-------|
| Total Tasks | 0/38 |
| Current Phase | - |
| Status | pending |

## Execution Log

| Timestamp | Phase | Task | Status |
|-----------|-------|------|--------|
| - | - | - | - |
