export type ServiceStatus = "healthy" | "degraded" | "down";

export interface ServiceHealth {
  name: string;
  status: ServiceStatus;
  latencyMs: number;
  uptime: number; // percentage
  lastChecked: string;
  details?: Record<string, string | number>;
}

export interface SystemMetric {
  timestamp: string;
  cpu: number;
  memory: number;
  disk: number;
}

export const serviceHealth: ServiceHealth[] = [
  {
    name: "PostgreSQL",
    status: "healthy",
    latencyMs: 5,
    uptime: 99.99,
    lastChecked: new Date().toISOString(),
    details: {
      version: "15.4",
      connections: 23,
      maxConnections: 100,
      databaseSize: "2.4 GB",
    },
  },
  {
    name: "Redis",
    status: "healthy",
    latencyMs: 2,
    uptime: 99.95,
    lastChecked: new Date().toISOString(),
    details: {
      version: "7.2.3",
      usedMemory: "156 MB",
      maxMemory: "512 MB",
      connectedClients: 12,
      hitRate: "94.5%",
    },
  },
  {
    name: "AI Service (OpenAI)",
    status: "healthy",
    latencyMs: 890,
    uptime: 99.8,
    lastChecked: new Date().toISOString(),
    details: {
      provider: "OpenAI",
      model: "gpt-4o",
      rateLimit: "10000 req/min",
      remainingQuota: "85%",
    },
  },
  {
    name: "AI Service (Groq)",
    status: "healthy",
    latencyMs: 450,
    uptime: 98.5,
    lastChecked: new Date().toISOString(),
    details: {
      provider: "Groq",
      model: "llama-3.3-70b",
      rateLimit: "30 req/min",
      remainingQuota: "72%",
    },
  },
  {
    name: "Storage (S3)",
    status: "healthy",
    latencyMs: 45,
    uptime: 99.99,
    lastChecked: new Date().toISOString(),
    details: {
      provider: "AWS S3",
      bucket: "travel-helper-uploads",
      usedStorage: "15.6 GB",
    },
  },
  {
    name: "Email Service",
    status: "degraded",
    latencyMs: 1234,
    uptime: 95.5,
    lastChecked: new Date().toISOString(),
    details: {
      provider: "SendGrid",
      status: "Rate limited",
      dailyLimit: 1000,
      sentToday: 890,
    },
  },
];

// System metrics for the last hour (per 5 min)
export const systemMetrics: SystemMetric[] = Array.from({ length: 12 }, (_, i) => {
  const timestamp = new Date();
  timestamp.setMinutes(timestamp.getMinutes() - (11 - i) * 5);
  return {
    timestamp: timestamp.toISOString(),
    cpu: Math.floor(Math.random() * 30) + 20,
    memory: Math.floor(Math.random() * 20) + 55,
    disk: 67 + (i * 0.1),
  };
});

export const systemStats = {
  overallHealth: "healthy" as ServiceStatus,
  healthyServices: serviceHealth.filter(s => s.status === "healthy").length,
  totalServices: serviceHealth.length,
  avgResponseTime: Math.round(serviceHealth.reduce((sum, s) => sum + s.latencyMs, 0) / serviceHealth.length),
  lastIncident: "2026-01-20T14:30:00Z",
  incidentDescription: "Redis connection timeout (resolved)",
};

// Recent alerts
export const recentAlerts = [
  {
    id: "alert-001",
    severity: "warning" as const,
    service: "Email Service",
    message: "Rate limit approaching (89% of daily quota used)",
    timestamp: "2026-01-27T15:30:00Z",
    resolved: false,
  },
  {
    id: "alert-002",
    severity: "info" as const,
    service: "AI Service (Groq)",
    message: "API latency increased by 15%",
    timestamp: "2026-01-27T14:15:00Z",
    resolved: true,
  },
  {
    id: "alert-003",
    severity: "error" as const,
    service: "PostgreSQL",
    message: "Connection pool exhausted temporarily",
    timestamp: "2026-01-27T10:45:00Z",
    resolved: true,
  },
  {
    id: "alert-004",
    severity: "warning" as const,
    service: "Redis",
    message: "Memory usage above 75%",
    timestamp: "2026-01-26T18:20:00Z",
    resolved: true,
  },
];
