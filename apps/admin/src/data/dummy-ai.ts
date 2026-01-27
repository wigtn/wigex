export type AIType = "OCR" | "CHAT";
export type AIProvider = "openai" | "groq" | "self-hosted";

export interface AIUsageDaily {
  date: string;
  ocrCount: number;
  chatCount: number;
  totalTokens: number;
  cost: number;
}

export interface AIProviderStats {
  provider: AIProvider;
  model: string;
  requestCount: number;
  inputTokens: number;
  outputTokens: number;
  avgLatencyMs: number;
  successRate: number;
  cost: number;
}

// Generate last 7 days data
const today = new Date("2026-01-27");
const last7Days = Array.from({ length: 7 }, (_, i) => {
  const date = new Date(today);
  date.setDate(date.getDate() - (6 - i));
  return date.toISOString().split("T")[0];
});

export const dailyAIUsage: AIUsageDaily[] = last7Days.map((date, index) => ({
  date,
  ocrCount: Math.floor(Math.random() * 200) + 100 + (index * 10),
  chatCount: Math.floor(Math.random() * 500) + 200 + (index * 20),
  totalTokens: Math.floor(Math.random() * 500000) + 200000,
  cost: Math.round((Math.random() * 50 + 20) * 100) / 100,
}));

export const providerStats: AIProviderStats[] = [
  {
    provider: "openai",
    model: "gpt-4o",
    requestCount: 1234,
    inputTokens: 2456000,
    outputTokens: 1823000,
    avgLatencyMs: 2340,
    successRate: 99.2,
    cost: 156.78,
  },
  {
    provider: "openai",
    model: "gpt-4o-mini",
    requestCount: 3456,
    inputTokens: 1234000,
    outputTokens: 987000,
    avgLatencyMs: 890,
    successRate: 99.8,
    cost: 23.45,
  },
  {
    provider: "groq",
    model: "llama-3.3-70b",
    requestCount: 2345,
    inputTokens: 3456000,
    outputTokens: 2345000,
    avgLatencyMs: 450,
    successRate: 98.5,
    cost: 45.67,
  },
  {
    provider: "groq",
    model: "llama-3.2-90b-vision",
    requestCount: 890,
    inputTokens: 1234000,
    outputTokens: 567000,
    avgLatencyMs: 780,
    successRate: 97.8,
    cost: 18.90,
  },
  {
    provider: "self-hosted",
    model: "local-ocr",
    requestCount: 567,
    inputTokens: 0,
    outputTokens: 0,
    avgLatencyMs: 1200,
    successRate: 95.5,
    cost: 0,
  },
];

export const aiStats = {
  totalOCRToday: 156,
  totalChatToday: 423,
  totalTokensToday: 345678,
  estimatedCostToday: 34.56,
  totalOCRWeek: dailyAIUsage.reduce((sum, d) => sum + d.ocrCount, 0),
  totalChatWeek: dailyAIUsage.reduce((sum, d) => sum + d.chatCount, 0),
  totalCostWeek: dailyAIUsage.reduce((sum, d) => sum + d.cost, 0),
  avgSuccessRate: 98.2,
  avgLatencyMs: 1123,
};

// Hourly breakdown for today
export const hourlyUsage = Array.from({ length: 24 }, (_, hour) => ({
  hour: `${String(hour).padStart(2, "0")}:00`,
  ocr: Math.floor(Math.random() * 15) + (hour >= 9 && hour <= 21 ? 10 : 2),
  chat: Math.floor(Math.random() * 30) + (hour >= 9 && hour <= 21 ? 20 : 5),
}));

// Cost breakdown by type
export const costBreakdown = {
  ocr: {
    total: 89.45,
    byProvider: {
      openai: 45.23,
      groq: 34.22,
      selfHosted: 10.00,
    },
  },
  chat: {
    total: 155.45,
    byProvider: {
      openai: 135.00,
      groq: 20.45,
    },
  },
};
