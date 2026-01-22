# Travel Helper v2.0 - System Architecture

> 해외 여행 지출 관리 + AI 영수증 분석 앱

**작성일**: 2025-01-22
**버전**: 2.0
**상태**: Draft

---

## 1. Overview

### 1.1 시스템 목표

해외 여행 중 지출을 쉽게 기록하고 관리하는 모바일 앱으로, AI 기반 영수증 자동 인식과 대화형 챗봇을 통해 사용자 경험을 향상시킨다.

### 1.2 핵심 기능

| 기능 | 설명 |
|------|------|
| 여행 관리 | 다중 방문지, 통화, 예산 관리 |
| 지출 기록 | 현지 통화 입력, 자동 원화 환산 |
| **AI 영수증 OCR** | 사진/촬영으로 영수증 자동 분석 및 등록 |
| **AI 챗봇** | 지출 분석, 여행 팁, 예산 조언 |
| 통계 분석 | 카테고리별/통화별/방문지별 분석 |
| 오프라인 지원 | 로컬 DB + 환율 캐싱 |

### 1.3 대상 사용자

- 해외 여행을 자주 가는 20-40대 한국인
- 환율 계산 없이 빠르게 지출을 기록하고 싶은 사용자
- 영수증 관리가 번거로운 사용자

---

## 2. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Client Layer                                  │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │              Mobile App (React Native / Expo)                  │  │
│  │                      TypeScript                                │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────┬───────────────────────────────────┘
                                  │ HTTPS (REST API)
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       Application Layer                              │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                   NestJS Backend                               │  │
│  │                      TypeScript                                │  │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐  │  │
│  │  │  Auth   │ │  User   │ │  Trip   │ │ Expense │ │   AI    │  │  │
│  │  │ Module  │ │ Module  │ │ Module  │ │ Module  │ │ Module  │  │  │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └────┬────┘  │  │
│  │                                                        │       │  │
│  │                                          ┌─────────────┴─────┐ │  │
│  │                                          │   AI Provider     │ │  │
│  │                                          │   (Abstraction)   │ │  │
│  │                                          └─────────────┬─────┘ │  │
│  └────────────────────────────────────────────────────────┼──────┘  │
└───────────────────────────┬───────────────────────────────┼─────────┘
                            │                               │
              ┌─────────────┴─────────────┐                 │
              ▼                           ▼                 ▼
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│    Data Layer       │    │    Cache Layer      │    │    AI Layer         │
│  ┌───────────────┐  │    │  ┌───────────────┐  │    │  ┌───────────────┐  │
│  │  PostgreSQL   │  │    │  │     Redis     │  │    │  │ Self-hosted   │  │
│  │               │  │    │  │               │  │    │  │ (FastAPI)     │  │
│  │  - Users      │  │    │  │  - Sessions   │  │    │  ├───────────────┤  │
│  │  - Trips      │  │    │  │  - Rate Cache │  │    │  │ OpenAI API    │  │
│  │  - Expenses   │  │    │  │  - AI Cache   │  │    │  ├───────────────┤  │
│  │  - Wallets    │  │    │  │               │  │    │  │ Groq API      │  │
│  └───────────────┘  │    │  └───────────────┘  │    │  └───────────────┘  │
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘
```

---

## 3. Technology Stack

### 3.1 Frontend (Mobile)

| Category | Technology | Version | Rationale |
|----------|------------|---------|-----------|
| Framework | React Native (Expo) | SDK 54 | Cross-platform, 기존 코드 유지 |
| Language | TypeScript | 5.x | 타입 안정성 |
| State | Zustand | 5.x | 경량, 간단한 API |
| Navigation | Expo Router | 6.x | 파일 기반 라우팅 |
| Local DB | expo-sqlite | 16.x | 오프라인 지원 |
| UI | Custom Components | - | 디자인 시스템 구축됨 |

### 3.2 Backend (API)

| Category | Technology | Version | Rationale |
|----------|------------|---------|-----------|
| Framework | NestJS | 10.x | TypeScript, 모듈화, DI |
| Language | TypeScript | 5.x | 프론트와 타입 공유 |
| ORM | Prisma | 5.x | 타입 안정성, 마이그레이션 |
| Validation | class-validator | - | DTO 검증 |
| API Docs | Swagger | - | OpenAPI 스펙 |

### 3.3 AI Service

| Category | Technology | Rationale |
|----------|------------|-----------|
| Framework | FastAPI (Python) | AI 생태계 최적 |
| VLM (자체) | Qwen2-VL-7B | 영수증 OCR |
| LLM (자체) | Qwen2.5-7B-Instruct | 챗봇 |
| VLM (외부) | OpenAI GPT-4o Vision | 고정확도 폴백 |
| LLM (외부) | Groq Llama 3.3 | 빠른 속도 |

### 3.4 Infrastructure

| Category | Technology | Rationale |
|----------|------------|-----------|
| Database | PostgreSQL 16 | 안정성, JSON 지원 |
| Cache | Redis 7 | 세션, 캐시 |
| Container | Docker | 일관된 환경 |
| Orchestration | Docker Compose | 로컬/소규모 배포 |
| Cloud | Railway / Render | 초기 배포 |

---

## 4. Module Architecture

### 4.1 NestJS Modules

```
┌─────────────────────────────────────────────────────────────────┐
│                         AppModule                                │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                      Core Modules                           ││
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────┐ ││
│  │  │ConfigMod │  │DatabaseMod│  │ CacheMod │  │ HealthMod   │ ││
│  │  └──────────┘  └──────────┘  └──────────┘  └─────────────┘ ││
│  └─────────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                     Feature Modules                         ││
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────┐ ││
│  │  │ AuthMod  │  │ UserMod  │  │ TripMod  │  │ ExpenseMod  │ ││
│  │  └──────────┘  └──────────┘  └──────────┘  └─────────────┘ ││
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐                  ││
│  │  │ WalletMod│  │ExRateMod │  │   AIMod  │                  ││
│  │  └──────────┘  └──────────┘  └──────────┘                  ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Module Responsibilities

| Module | Responsibility |
|--------|----------------|
| **AuthModule** | JWT 인증, 소셜 로그인 (Apple, Google) |
| **UserModule** | 사용자 프로필, 설정 |
| **TripModule** | 여행 CRUD, 방문지 관리 |
| **ExpenseModule** | 지출 CRUD, 통계 집계 |
| **WalletModule** | 환전 지갑, 잔액 추적 |
| **ExchangeRateModule** | 환율 API 연동, 캐싱 |
| **AIModule** | 영수증 OCR, 챗봇, Provider 추상화 |

---

## 5. AI Module Design

### 5.1 Provider Abstraction Pattern

AI Provider를 추상화하여 자체 호스팅 ↔ 외부 API 간 전환을 용이하게 한다.

```typescript
// 전환 전략
// Phase 1 (MVP): 자체 호스팅 (비용 절감, 학습)
// Phase 2 (성장기): 외부 API (안정성, 스케일)
// Phase 3 (확장기): 자체 호스팅 (비용 최적화)

interface AIProvider {
  analyzeReceipt(image: Buffer, mimeType: string): Promise<ReceiptAnalysis>;
  chat(messages: ChatMessage[], context?: UserContext): Promise<string>;
  chatStream?(messages: ChatMessage[], context?: UserContext): AsyncIterable<string>;
}
```

### 5.2 Provider Implementations

```
┌─────────────────────────────────────────────────────────────────┐
│                        AIModule                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    AIService                                ││
│  │         (Business Logic + Provider Selection)               ││
│  └──────────────────────────┬──────────────────────────────────┘│
│                             │                                    │
│  ┌──────────────────────────┴──────────────────────────────────┐│
│  │                   AIProvider Interface                      ││
│  └─────────────────────────────────────────────────────────────┘│
│         │                   │                    │               │
│         ▼                   ▼                    ▼               │
│  ┌─────────────┐    ┌─────────────┐     ┌─────────────┐        │
│  │SelfHosted   │    │  OpenAI     │     │   Groq      │        │
│  │Provider     │    │  Provider   │     │  Provider   │        │
│  │             │    │             │     │             │        │
│  │ FastAPI     │    │ GPT-4o      │     │ Llama 3.2   │        │
│  │ Qwen2-VL    │    │ Vision      │     │ Vision      │        │
│  └─────────────┘    └─────────────┘     └─────────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

### 5.3 Receipt Analysis Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Mobile  │────▶│   API    │────▶│    AI    │────▶│   VLM    │
│   App    │     │  Server  │     │  Module  │     │ Provider │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
     │                │                 │                │
     │ 1. Upload      │                 │                │
     │    Image       │                 │                │
     │───────────────▶│                 │                │
     │                │ 2. Validate &   │                │
     │                │    Process      │                │
     │                │────────────────▶│                │
     │                │                 │ 3. Analyze     │
     │                │                 │────────────────▶
     │                │                 │                │
     │                │                 │◀───────────────│
     │                │                 │ 4. ReceiptData │
     │                │◀────────────────│                │
     │                │ 5. Create       │                │
     │                │    Expense      │                │
     │◀───────────────│                 │                │
     │ 6. Success +   │                 │                │
     │    ExpenseData │                 │                │
```

### 5.4 Chatbot Features

| Feature | Description | Implementation |
|---------|-------------|----------------|
| 지출 질문 | "오늘 얼마 썼어?" | RAG (사용자 데이터 컨텍스트) |
| 예산 조언 | "남은 예산으로 며칠?" | 계산 + LLM 응답 |
| 여행 팁 | "일본 팁 문화 어때?" | LLM 일반 지식 |
| 환율 정보 | "지금 엔화 환율?" | API 데이터 + LLM 포맷팅 |

---

## 6. Data Architecture

### 6.1 Database Schema (PostgreSQL)

```sql
-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    name VARCHAR(100),
    provider VARCHAR(20), -- 'local', 'apple', 'google'
    provider_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Trips
CREATE TABLE trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    budget DECIMAL(15, 2),
    budget_currency VARCHAR(3) DEFAULT 'KRW',
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'completed', 'cancelled'
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Destinations
CREATE TABLE destinations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    country VARCHAR(100) NOT NULL,
    city VARCHAR(100),
    currency VARCHAR(3) NOT NULL,
    start_date DATE,
    end_date DATE,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Expenses
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    destination_id UUID REFERENCES destinations(id),
    wallet_id UUID REFERENCES wallets(id),
    amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    amount_krw DECIMAL(15, 2) NOT NULL,
    exchange_rate DECIMAL(15, 6),
    category VARCHAR(20) NOT NULL,
    payment_method VARCHAR(20) DEFAULT 'card',
    description TEXT,
    memo TEXT,
    expense_date DATE NOT NULL,
    expense_time TIME,
    receipt_image_url TEXT,
    ocr_processed BOOLEAN DEFAULT FALSE,
    ocr_confidence DECIMAL(3, 2),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Wallets (환전 지갑)
CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    currency VARCHAR(3) NOT NULL,
    name VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Wallet Transactions
CREATE TABLE wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID REFERENCES wallets(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL, -- 'deposit', 'withdraw', 'adjust'
    amount DECIMAL(15, 2) NOT NULL,
    exchange_rate DECIMAL(15, 6),
    amount_krw DECIMAL(15, 2),
    memo TEXT,
    transaction_date TIMESTAMP DEFAULT NOW()
);

-- Exchange Rates Cache
CREATE TABLE exchange_rates (
    id SERIAL PRIMARY KEY,
    base_currency VARCHAR(3) DEFAULT 'KRW',
    rates JSONB NOT NULL,
    source VARCHAR(50),
    fetched_at TIMESTAMP DEFAULT NOW()
);

-- Chat History
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    trip_id UUID REFERENCES trips(id),
    role VARCHAR(20) NOT NULL, -- 'user', 'assistant'
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_trips_user_id ON trips(user_id);
CREATE INDEX idx_expenses_trip_id ON expenses(trip_id);
CREATE INDEX idx_expenses_date ON expenses(expense_date);
CREATE INDEX idx_expenses_category ON expenses(category);
CREATE INDEX idx_wallets_trip_id ON wallets(trip_id);
CREATE INDEX idx_chat_user_trip ON chat_messages(user_id, trip_id);
```

### 6.2 Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         Mobile App                               │
│                                                                  │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │ Local SQLite│◀──▶│   Zustand   │◀──▶│    Views    │         │
│  │  (Offline)  │    │   Stores    │    │             │         │
│  └──────┬──────┘    └──────┬──────┘    └─────────────┘         │
│         │                  │                                     │
│         │    Sync Queue    │                                     │
│         └──────────────────┘                                     │
└────────────────────────────┬────────────────────────────────────┘
                             │ Online Sync
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Backend API                               │
│                                                                  │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │  PostgreSQL │◀──▶│   Prisma    │◀──▶│  Services   │         │
│  │   (Source   │    │    ORM      │    │             │         │
│  │   of Truth) │    │             │    │             │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. API Design

### 7.1 REST API Endpoints

#### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/register | 회원가입 |
| POST | /auth/login | 로그인 |
| POST | /auth/refresh | 토큰 갱신 |
| POST | /auth/social/apple | Apple 로그인 |
| POST | /auth/social/google | Google 로그인 |

#### Trips
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /trips | 여행 목록 |
| POST | /trips | 여행 생성 |
| GET | /trips/:id | 여행 상세 |
| PATCH | /trips/:id | 여행 수정 |
| DELETE | /trips/:id | 여행 삭제 |
| GET | /trips/:id/destinations | 방문지 목록 |
| POST | /trips/:id/destinations | 방문지 추가 |

#### Expenses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /trips/:tripId/expenses | 지출 목록 |
| POST | /trips/:tripId/expenses | 지출 생성 |
| GET | /expenses/:id | 지출 상세 |
| PATCH | /expenses/:id | 지출 수정 |
| DELETE | /expenses/:id | 지출 삭제 |
| GET | /trips/:tripId/expenses/stats | 지출 통계 |

#### AI
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /ai/receipt/analyze | 영수증 분석 |
| POST | /ai/chat | 챗봇 메시지 |
| GET | /ai/chat/history | 채팅 히스토리 |

#### Exchange Rates
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /exchange-rates | 현재 환율 |
| GET | /exchange-rates/convert | 환율 변환 |

### 7.2 Response Format

```typescript
// Success Response
interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

// Error Response
interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}
```

---

## 8. Security

### 8.1 Authentication

- **JWT Access Token**: 15분 만료
- **Refresh Token**: 7일 만료, httpOnly cookie
- **Password**: bcrypt 해싱 (salt rounds: 12)

### 8.2 Authorization

```typescript
// Role-based Access Control
enum Role {
  USER = 'user',
  PREMIUM = 'premium',
  ADMIN = 'admin',
}

// Resource-based Access Control
// 사용자는 자신의 여행/지출만 접근 가능
```

### 8.3 Data Protection

| Layer | Protection |
|-------|------------|
| Transport | HTTPS (TLS 1.3) |
| API | Rate Limiting (100 req/min) |
| Input | Validation (class-validator) |
| SQL | Prisma ORM (Parameterized Queries) |
| Secrets | Environment Variables |

---

## 9. Deployment Architecture

### 9.1 Development Environment

```yaml
# docker-compose.yml
services:
  api:
    build: ./apps/api
    ports:
      - "3000:3000"
    depends_on:
      - postgres
      - redis

  ai-service:
    build: ./apps/ai-service
    ports:
      - "8000:8000"
    deploy:
      resources:
        reservations:
          devices:
            - capabilities: [gpu]

  postgres:
    image: postgres:16
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
```

### 9.2 Production Environment (Initial)

```
┌─────────────────────────────────────────────────────────────────┐
│                        Railway / Render                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   NestJS    │  │  PostgreSQL │  │    Redis    │             │
│  │    API      │  │             │  │             │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    AI Provider (External)                   ││
│  │                    Groq / OpenAI API                        ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### 9.3 Production Environment (Scale)

```
┌─────────────────────────────────────────────────────────────────┐
│                           AWS / GCP                              │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                      Load Balancer                          ││
│  └──────────────────────────┬──────────────────────────────────┘│
│                             │                                    │
│  ┌──────────────────────────┴──────────────────────────────────┐│
│  │                    ECS / Cloud Run                          ││
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         ││
│  │  │   API x N   │  │   AI Svc    │  │   Worker    │         ││
│  │  └─────────────┘  └─────────────┘  └─────────────┘         ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │    RDS      │  │ ElastiCache │  │     S3      │             │
│  │ PostgreSQL  │  │    Redis    │  │   Images    │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 10. Monitoring & Observability

### 10.1 Logging

| Tool | Purpose |
|------|---------|
| Pino | Structured JSON logging |
| LogDNA / Datadog | Log aggregation |

### 10.2 Metrics

| Metric | Tool |
|--------|------|
| API Latency | Prometheus + Grafana |
| Error Rate | Sentry |
| AI Response Time | Custom metrics |

### 10.3 Health Checks

```typescript
// GET /health
{
  "status": "healthy",
  "timestamp": "2025-01-22T10:00:00Z",
  "services": {
    "database": "healthy",
    "redis": "healthy",
    "ai-service": "healthy"
  }
}
```

---

## 11. Project Structure

```
wigtn-travel-helper/
├── apps/
│   ├── mobile/                     # React Native (Expo)
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   └── package.json
│   │
│   ├── api/                        # NestJS Backend
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/
│   │   │   │   ├── user/
│   │   │   │   ├── trip/
│   │   │   │   ├── expense/
│   │   │   │   ├── wallet/
│   │   │   │   ├── exchange-rate/
│   │   │   │   └── ai/
│   │   │   ├── common/
│   │   │   ├── config/
│   │   │   └── main.ts
│   │   ├── prisma/
│   │   └── package.json
│   │
│   └── ai-service/                 # Python AI (자체 호스팅용)
│       ├── app/
│       ├── models/
│       └── requirements.txt
│
├── packages/
│   └── shared/                     # 공유 타입
│
├── docker/
├── docs/
├── .github/workflows/
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

---

## 12. Migration Strategy

### 12.1 From Current State

1. **Phase 1**: 모노레포 구조 전환
   - 기존 코드 → `apps/mobile/`
   - 모노레포 설정 (pnpm workspace)

2. **Phase 2**: Backend 구축
   - NestJS 스캐폴딩
   - Core modules 구현
   - API 연동

3. **Phase 3**: AI 통합
   - Provider 추상화
   - 외부 API 연동 (초기)
   - 자체 호스팅 준비

4. **Phase 4**: 데이터 동기화
   - 오프라인 → 온라인 동기화
   - 충돌 해결 로직

---

## Appendix

### A. Environment Variables

```env
# API
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://...
REDIS_URL=redis://...

# Auth
JWT_SECRET=...
JWT_REFRESH_SECRET=...

# AI
AI_PROVIDER=groq  # 'self-hosted' | 'openai' | 'groq'
OPENAI_API_KEY=...
GROQ_API_KEY=...
AI_SERVICE_URL=http://ai-service:8000

# External APIs
EXCHANGE_RATE_API_KEY=...
```

### B. Supported Currencies

JPY, USD, EUR, GBP, CNY, THB, VND, TWD, PHP, SGD, AUD, CAD, CHF, CZK, HKD, MYR, NZD, IDR

### C. Expense Categories

| ID | Label | Icon |
|----|-------|------|
| food | 식비 | restaurant |
| transport | 교통 | directions-bus |
| shopping | 쇼핑 | shopping-bag |
| lodging | 숙박 | hotel |
| activity | 관광 | local-activity |
| etc | 기타 | more-horiz |

---

**Document End**
