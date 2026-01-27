"use client";

import { Server, Database, HardDrive, Clock, AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";
import { StatsCard, StatusIndicator } from "@/components/dashboard";
import { LineChart } from "@/components/charts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  serviceHealth,
  systemMetrics,
  systemStats,
  recentAlerts,
} from "@/data/dummy-system";
import { formatDateTime } from "@/lib/utils";

const severityIcons = {
  info: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle,
};

const severityColors = {
  info: "text-blue-500",
  warning: "text-yellow-500",
  error: "text-red-500",
};

export default function SystemStatusPage() {
  // Prepare chart data
  const metricsChartData = systemMetrics.map((item, index) => ({
    time: `${index * 5}m`,
    CPU: item.cpu,
    Memory: item.memory,
    Disk: Math.round(item.disk),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">System Status</h2>
        <p className="text-muted-foreground">
          Monitor system health and infrastructure status
        </p>
      </div>

      {/* Overall Status */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Overall Health"
          value={systemStats.healthyServices + "/" + systemStats.totalServices}
          description="Services healthy"
          icon={Server}
        />
        <StatsCard
          title="Avg Response Time"
          value={`${systemStats.avgResponseTime}ms`}
          description="Across all services"
          icon={Clock}
        />
        <StatsCard
          title="Last Incident"
          value={formatDateTime(systemStats.lastIncident).split(" ")[0]}
          description={systemStats.incidentDescription}
          icon={AlertCircle}
        />
        <Card className="flex items-center justify-center">
          <div className="p-6 text-center">
            <StatusIndicator status={systemStats.overallHealth} />
            <p className="mt-2 text-sm text-muted-foreground">
              System Status
            </p>
          </div>
        </Card>
      </div>

      {/* Service Health */}
      <Card>
        <CardHeader>
          <CardTitle>Service Health</CardTitle>
          <CardDescription>Current status of all services</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {serviceHealth.map((service) => (
              <Card key={service.name} className="border">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-primary/10 p-2">
                        {service.name.includes("PostgreSQL") ? (
                          <Database className="h-5 w-5 text-primary" />
                        ) : service.name.includes("Redis") ? (
                          <HardDrive className="h-5 w-5 text-primary" />
                        ) : (
                          <Server className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{service.name}</p>
                        <StatusIndicator status={service.status} />
                      </div>
                    </div>
                  </div>

                  <Separator className="my-3" />

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Latency</span>
                      <span className="font-medium">{service.latencyMs}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Uptime</span>
                      <span className="font-medium">{service.uptime}%</span>
                    </div>
                    {service.details && (
                      <>
                        <Separator className="my-2" />
                        {Object.entries(service.details).slice(0, 3).map(
                          ([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="text-muted-foreground capitalize">
                                {key.replace(/([A-Z])/g, " $1").trim()}
                              </span>
                              <span className="font-medium">{value}</span>
                            </div>
                          )
                        )}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Metrics & Alerts */}
      <div className="grid gap-4 md:grid-cols-2">
        <LineChart
          title="System Resources"
          description="CPU, Memory, and Disk usage (last hour)"
          data={metricsChartData}
          lines={[
            { dataKey: "CPU", color: "hsl(var(--chart-1))", name: "CPU %" },
            { dataKey: "Memory", color: "hsl(var(--chart-2))", name: "Memory %" },
            { dataKey: "Disk", color: "hsl(var(--chart-3))", name: "Disk %" },
          ]}
          xAxisKey="time"
          showLegend
          formatYAxis={(value) => `${value}%`}
        />

        {/* Recent Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
            <CardDescription>System alerts and notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAlerts.map((alert) => {
                const Icon = severityIcons[alert.severity];
                return (
                  <div
                    key={alert.id}
                    className="flex items-start gap-3 rounded-lg border p-3"
                  >
                    <Icon
                      className={`mt-0.5 h-5 w-5 ${severityColors[alert.severity]}`}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{alert.service}</span>
                        <Badge
                          variant={alert.resolved ? "secondary" : "default"}
                        >
                          {alert.resolved ? "Resolved" : "Active"}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {alert.message}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDateTime(alert.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
