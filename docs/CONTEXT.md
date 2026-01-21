# Travel Helper v2.0 - 프로젝트 컨텍스트

> 이 문서는 v2.0 리뉴얼 과정에서 논의된 핵심 결정사항과 배경을 정리한 것입니다.
> 새 세션에서 작업을 이어갈 때 참고하세요.

---

## 프로젝트 개요

**Travel Helper**는 여행 중 지출을 관리하는 가계부 앱입니다.

- **플랫폼**: React Native + Expo
- **상태관리**: Zustand
- **DB**: expo-sqlite
- **현재 버전**: v1.0 (단일 국가/통화)
- **목표 버전**: v2.0 (다중 국가/통화 + 환전 지갑)

---

## v1.0의 한계점

1. **Trip = 1개 국가/통화**: "유럽여행"처럼 여러 나라 방문 불가
2. **원화 중심 표시**: 여행 중엔 현지 통화가 더 체감됨
3. **환전 관리 없음**: 미리 환전한 금액 추적 불가
4. **캘린더가 모달**: 토글로 상세 보기가 더 편함

---

## v2.0 핵심 변경사항

### 1. 데이터 구조 변경

**AS-IS**
```
Trip (여행 = 1국가)
├── country: "일본"
├── currency: "JPY"
└── Expenses[]
```

**TO-BE**
```
Trip (여행 일정)
├── name: "유럽 배낭여행"
├── Destinations[] (방문지)
│   ├── country: "프랑스", city: "파리", currency: "EUR"
│   ├── country: "독일", city: "베를린", currency: "EUR"
│   └── country: "체코", city: "프라하", currency: "CZK"
├── Wallets[] (환전 지갑)
│   ├── currency: "EUR", balance: €450
│   └── currency: "CZK", balance: Kč2,500
└── Expenses[]
    ├── destinationId (어느 나라에서)
    ├── walletId (어느 지갑에서 - optional)
    └── paymentMethod: "wallet" | "card" | "cash"
```

### 2. 환전 지갑 기능 & 지출 계산 로직

**핵심 원칙: 환전 = 지출**
- 지갑에 돈을 넣는 순간, 그 원화는 이미 "쓴 돈"으로 간주

**계산 공식**:
```
총 지출 = 환전 총액(원화) + 카드 결제액(원화)
남은 지갑 = 환전 총액 - 지갑 사용액
실제 소비 = 지갑 사용액 + 카드 결제액
```

**기능**:
- 여행 전/중 환전 금액 등록 (추가 환전 가능)
- 잔액 수동 조정 가능
- 지출 시 지갑/카드 선택
- 환전 내역도 해당 날짜에 표시
- 지갑 결제 시 잔액 변화 표시 (전 → 후)

### 3. 원화/현지통화 토글

```
[원화▼] 클릭 시 전환 가능:

원화 모드:     현지통화 모드:
₩182,000      €125.50
              ≈ ₩182,000
```

- 모든 화면에서 토글로 전환 가능
- 사용자가 원하는 방식으로 볼 수 있음

### 4. 캘린더 토글 리스트

- 날짜 클릭 → 모달 (AS-IS)
- 날짜 토글 → 펼치기/접기 (TO-BE)

### 5. 영수증 OCR (준비중)

- 버튼만 배치, 기능은 v2.1에서
- Google Cloud Vision 또는 on-device ML 검토 예정

---

## 디자인 결정사항

### 스타일 선택 과정

1. **초기 제안**: Swiss Minimal (토스/애플 지갑 느낌)
2. **문제점**: 너무 차갑고 금융앱 느낌, 여행 감성 부족
3. **대안 검토**:
   - Option 1: Coral + Sky Blue ✅ 선택
   - Option 2: Warm Orange + Deep Blue
   - Option 3: Coral Pink + Purple
4. **제외**: 연두/틸(Teal) 계열 - 기존 앱과 유사해서 피함

### 최종 컬러 시스템

```
Primary:   #FF6B6B (Coral) - 따뜻함, 설렘, CTA
Secondary: #4DABF7 (Sky Blue) - 하늘, 여행, 정보
Accent:    #FF922B (Orange) - 강조, 포인트
```

### 국기 아이콘

- 이모지 대신 SVG 아이콘 라이브러리 사용
- 선택: `react-native-svg-circle-country-flags`
- 이유: React Native 전용, 원형 디자인, 400+ 국가

### 접근성

- WCAG AA 준수 (4.5:1 대비)
- 최소 터치 영역 44x44px
- `prefers-reduced-motion` 지원

---

## 구현 우선순위

### Phase 1: 핵심 구조 변경
1. DB 스키마 변경 (destinations, wallets, wallet_transactions 테이블)
2. 기존 데이터 마이그레이션
3. Destination CRUD
4. 여행 생성/편집 UI 변경
5. 지출 입력에 방문지 선택 추가

### Phase 2: 환전 지갑
1. Wallet, WalletTransaction 모델
2. 지갑 CRUD + 환전 추가/수정
3. 지출 시 지갑 연동 (차감)
4. 홈 화면에 지갑 잔액 표시

### Phase 3: UI 개선
1. 현지 통화 우선 표시 (전체 화면)
2. 캘린더 토글 리스트
3. 통계 화면 국가별/통화별 추가
4. 디자인 시스템 적용 (새 컬러, 컴포넌트)

### Phase 4: 부가 기능
1. OCR 버튼 (준비중 상태)
2. 데이터 백업/복원
3. 공유 기능

---

## 검토했지만 제외한 것들

| 항목 | 제외 이유 |
|------|----------|
| 다중 사용자/공유 | v3.0에서 고려 |
| 실시간 환율 알림 | 복잡도 증가, 낮은 우선순위 |
| 예산 카테고리별 설정 | v2.0은 총 예산만 |
| 여행 템플릿 | 나중에 추가 가능 |

---

## 관련 문서

- `docs/PRD-v2.md` - 상세 기능 요구사항, 화면 구성
- `docs/DESIGN-GUIDE.md` - 디자인 시스템 (컬러, 타이포, 컴포넌트)

---

## 기술 스택 (유지)

```json
{
  "expo": "~54.0.31",
  "expo-router": "~6.0.21",
  "expo-sqlite": "~16.0.10",
  "zustand": "^5.0.10",
  "react-native-chart-kit": "^6.12.0",
  "@react-native-community/datetimepicker": "8.4.4"
}
```

### 추가 예정

```bash
npm install react-native-svg-circle-country-flags react-native-svg
```

---

## 새 세션에서 시작하기

```
"docs/PRD-v2.md, docs/DESIGN-GUIDE.md, docs/CONTEXT.md 읽어봐.
Travel Helper v2.0 구현 이어서 할거야. Phase 1부터 시작하자."
```

---

## 주요 파일 위치

```
travel-helper/
├── docs/
│   ├── PRD-v2.md           # 기능 요구사항
│   ├── DESIGN-GUIDE.md     # 디자인 시스템
│   └── CONTEXT.md          # 이 문서
├── lib/
│   ├── db/
│   │   ├── schema.ts       # DB 스키마 (수정 필요)
│   │   └── queries.ts      # 쿼리 함수
│   ├── stores/
│   │   ├── tripStore.ts    # 여행 상태
│   │   ├── expenseStore.ts # 지출 상태
│   │   └── exchangeRateStore.ts
│   └── types.ts            # 타입 정의 (수정 필요)
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx       # 홈
│   │   ├── calendar.tsx    # 캘린더
│   │   ├── stats.tsx       # 통계
│   │   └── settings.tsx    # 설정
│   ├── trip/
│   │   └── new.tsx         # 여행 생성
│   └── expense/
│       └── new.tsx         # 지출 입력
└── components/
    └── ui/                 # UI 컴포넌트
```

---

*마지막 업데이트: 2025-01-21*
