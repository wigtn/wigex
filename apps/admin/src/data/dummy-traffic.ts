export interface TrafficEndpoint {
  endpoint: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  requestCount: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  errorRate: number;
  errorCount: number;
}

export interface TrafficDaily {
  date: string;
  totalRequests: number;
  avgLatencyMs: number;
  errorRate: number;
  uniqueUsers: number;
}

export interface TrafficHourly {
  hour: string;
  requests: number;
  latency: number;
  errors: number;
}

// Generate last 7 days data
const today = new Date("2026-01-27");
const last7Days = Array.from({ length: 7 }, (_, i) => {
  const date = new Date(today);
  date.setDate(date.getDate() - (6 - i));
  return date.toISOString().split("T")[0];
});

export const dailyTraffic: TrafficDaily[] = last7Days.map((date, index) => ({
  date,
  totalRequests: Math.floor(Math.random() * 10000) + 5000 + (index * 500),
  avgLatencyMs: Math.floor(Math.random() * 100) + 50,
  errorRate: Math.round((Math.random() * 2) * 100) / 100,
  uniqueUsers: Math.floor(Math.random() * 500) + 200,
}));

export const endpointStats: TrafficEndpoint[] = [
  {
    endpoint: "/api/auth/login",
    method: "POST",
    requestCount: 2345,
    avgLatencyMs: 156,
    p95LatencyMs: 320,
    p99LatencyMs: 580,
    errorRate: 0.8,
    errorCount: 19,
  },
  {
    endpoint: "/api/users/me",
    method: "GET",
    requestCount: 12456,
    avgLatencyMs: 45,
    p95LatencyMs: 120,
    p99LatencyMs: 200,
    errorRate: 0.1,
    errorCount: 12,
  },
  {
    endpoint: "/api/trips",
    method: "GET",
    requestCount: 8934,
    avgLatencyMs: 78,
    p95LatencyMs: 180,
    p99LatencyMs: 350,
    errorRate: 0.2,
    errorCount: 18,
  },
  {
    endpoint: "/api/trips",
    method: "POST",
    requestCount: 1234,
    avgLatencyMs: 234,
    p95LatencyMs: 450,
    p99LatencyMs: 780,
    errorRate: 1.2,
    errorCount: 15,
  },
  {
    endpoint: "/api/expenses",
    method: "GET",
    requestCount: 6789,
    avgLatencyMs: 89,
    p95LatencyMs: 200,
    p99LatencyMs: 400,
    errorRate: 0.3,
    errorCount: 20,
  },
  {
    endpoint: "/api/expenses",
    method: "POST",
    requestCount: 3456,
    avgLatencyMs: 167,
    p95LatencyMs: 340,
    p99LatencyMs: 560,
    errorRate: 0.9,
    errorCount: 31,
  },
  {
    endpoint: "/api/ai/ocr",
    method: "POST",
    requestCount: 1890,
    avgLatencyMs: 2340,
    p95LatencyMs: 4500,
    p99LatencyMs: 6000,
    errorRate: 2.1,
    errorCount: 40,
  },
  {
    endpoint: "/api/ai/chat",
    method: "POST",
    requestCount: 4567,
    avgLatencyMs: 1890,
    p95LatencyMs: 3500,
    p99LatencyMs: 5000,
    errorRate: 1.5,
    errorCount: 68,
  },
  {
    endpoint: "/api/sync",
    method: "POST",
    requestCount: 5678,
    avgLatencyMs: 345,
    p95LatencyMs: 700,
    p99LatencyMs: 1200,
    errorRate: 0.5,
    errorCount: 28,
  },
  {
    endpoint: "/api/health",
    method: "GET",
    requestCount: 15678,
    avgLatencyMs: 12,
    p95LatencyMs: 30,
    p99LatencyMs: 50,
    errorRate: 0,
    errorCount: 0,
  },
];

// Hourly traffic for today
export const hourlyTraffic: TrafficHourly[] = Array.from({ length: 24 }, (_, hour) => ({
  hour: `${String(hour).padStart(2, "0")}:00`,
  requests: Math.floor(Math.random() * 500) + (hour >= 9 && hour <= 21 ? 300 : 50),
  latency: Math.floor(Math.random() * 50) + 40,
  errors: Math.floor(Math.random() * 5) + (hour >= 18 && hour <= 20 ? 3 : 0),
}));

export const trafficStats = {
  totalRequestsToday: 45678,
  avgLatencyToday: 123,
  errorRateToday: 0.98,
  activeConnectionsNow: 234,
  requestsPerMinute: 52,
  totalRequestsWeek: dailyTraffic.reduce((sum, d) => sum + d.totalRequests, 0),
  avgLatencyWeek: Math.round(dailyTraffic.reduce((sum, d) => sum + d.avgLatencyMs, 0) / 7),
  avgErrorRateWeek: Math.round(dailyTraffic.reduce((sum, d) => sum + d.errorRate, 0) / 7 * 100) / 100,
};

// Error breakdown
export const errorBreakdown = {
  "4xx": {
    total: 156,
    breakdown: {
      400: 45,
      401: 67,
      403: 12,
      404: 32,
    },
  },
  "5xx": {
    total: 23,
    breakdown: {
      500: 15,
      502: 5,
      503: 3,
    },
  },
};
