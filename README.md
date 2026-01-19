# Travel Helper

해외 여행 중 지출을 쉽게 기록하고 관리하는 모바일 앱입니다.

## 주요 기능

### 여행 관리
- 여행별 지출 분리 관리
- 10개 주요 통화 지원 (USD, EUR, JPY, CNY 등)
- 여행 기간 및 예산 설정

### 지출 기록
- 실시간 환율 자동 환산 (외화 → 원화)
- 6가지 카테고리 분류 (식비, 교통, 쇼핑, 숙박, 관광, 기타)
- 날짜별 메모 기록

### 통계 & 분석
- 카테고리별 파이차트 시각화
- 예산 대비 지출 비율
- 일평균 지출액, 가장 많이 쓴 날/카테고리

### 캘린더 뷰
- 월별 지출 현황 한눈에 보기
- 날짜 클릭 시 상세 내역 확인

## 기술 스택

| 구분 | 기술 |
|------|------|
| Framework | React Native (Expo) |
| Language | TypeScript |
| State | Zustand |
| Database | SQLite (expo-sqlite) |
| UI | React Native Chart Kit, Expo Vector Icons |

## 시작하기

### 요구사항
- Node.js 18+
- npm 또는 yarn
- Expo CLI

### 설치

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm start
```

### 실행

```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

## 프로젝트 구조

```
travel-helper/
├── app/                    # 페이지 및 라우트
│   ├── (tabs)/            # 탭 네비게이션
│   │   ├── index.tsx      # 홈
│   │   ├── calendar.tsx   # 캘린더
│   │   ├── stats.tsx      # 통계
│   │   └── settings.tsx   # 설정
│   ├── trip/              # 여행 관련
│   └── expense/           # 지출 관련
├── components/            # UI 컴포넌트
├── lib/
│   ├── stores/           # Zustand 스토어
│   ├── db/               # SQLite 쿼리
│   ├── api/              # 외부 API (환율)
│   ├── hooks/            # 커스텀 훅
│   └── utils/            # 유틸리티
└── assets/               # 이미지, 폰트
```

## 주요 특징

- **오프라인 지원**: SQLite 로컬 저장 + 환율 캐싱
- **다크모드**: 시스템 설정 자동 감지
- **햅틱 피드백**: 터치 반응성 향상
- **실시간 환전**: 금액 입력 시 즉시 원화 환산

## 라이선스

MIT License
