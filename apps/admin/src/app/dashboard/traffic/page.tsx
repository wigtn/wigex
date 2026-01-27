"use client";

import { Activity, Clock, AlertTriangle, Zap } from "lucide-react";
import { StatsCard, DataTable } from "@/components/dashboard";
import { AreaChart, BarChart } from "@/components/charts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  trafficStats,
  dailyTraffic,
  hourlyTraffic,
  endpointStats,
  errorBreakdown,
  type TrafficEndpoint,
} from "@/data/dummy-traffic";
import { formatNumber } from "@/lib/utils";

export default function TrafficMonitoringPage() {
  // Prepare chart data
  const dailyChartData = dailyTraffic.map((item) => ({
    date: item.date.slice(5),
    requests: item.totalRequests,
    users: item.uniqueUsers,
  }));

  const hourlyChartData = hourlyTraffic.map((item) => ({
    hour: item.hour,
    requests: item.requests,
    latency: item.latency,
    errors: item.errors,
  }));

  const endpointColumns = [
    {
      key: "endpoint",
      header: "Endpoint",
      cell: (row: TrafficEndpoint) => (
        <div className="flex items-center gap-2">
          <Badge
            variant={
              row.method === "GET"
                ? "secondary"
                : row.method === "POST"
                ? "default"
                : "outline"
            }
            className="w-16 justify-center text-xs"
          >
            {row.method}
          </Badge>
          <code className="text-sm">{row.endpoint}</code>
        </div>
      ),
    },
    {
      key: "requests",
      header: "Requests",
      cell: (row: TrafficEndpoint) => (
        <span className="font-medium">{formatNumber(row.requestCount)}</span>
      ),
      className: "w-[100px]",
    },
    {
      key: "avgLatency",
      header: "Avg Latency",
      cell: (row: TrafficEndpoint) => (
        <span
          className={
            row.avgLatencyMs > 1000
              ? "text-yellow-500"
              : row.avgLatencyMs > 2000
              ? "text-red-500"
              : ""
          }
        >
          {row.avgLatencyMs}ms
        </span>
      ),
      className: "w-[100px]",
    },
    {
      key: "p95",
      header: "P95",
      cell: (row: TrafficEndpoint) => (
        <span className="text-muted-foreground">{row.p95LatencyMs}ms</span>
      ),
      className: "w-[80px]",
    },
    {
      key: "p99",
      header: "P99",
      cell: (row: TrafficEndpoint) => (
        <span className="text-muted-foreground">{row.p99LatencyMs}ms</span>
      ),
      className: "w-[80px]",
    },
    {
      key: "errorRate",
      header: "Error Rate",
      cell: (row: TrafficEndpoint) => (
        <span
          className={
            row.errorRate > 2
              ? "text-red-500"
              : row.errorRate > 1
              ? "text-yellow-500"
              : "text-green-500"
          }
        >
          {row.errorRate}%
        </span>
      ),
      className: "w-[100px]",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Traffic Monitoring</h2>
        <p className="text-muted-foreground">
          Monitor API traffic and performance metrics
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Requests Today"
          value={formatNumber(trafficStats.totalRequestsToday)}
          description={`${trafficStats.requestsPerMinute} req/min`}
          icon={Activity}
          trend={{ value: 8.5, isPositive: true }}
        />
        <StatsCard
          title="Avg Latency"
          value={`${trafficStats.avgLatencyToday}ms`}
          description={`${trafficStats.avgLatencyWeek}ms weekly avg`}
          icon={Clock}
        />
        <StatsCard
          title="Error Rate"
          value={`${trafficStats.errorRateToday}%`}
          description={`${trafficStats.avgErrorRateWeek}% weekly avg`}
          icon={AlertTriangle}
          trend={{ value: 0.3, isPositive: false }}
        />
        <StatsCard
          title="Active Connections"
          value={trafficStats.activeConnectionsNow}
          description="Real-time"
          icon={Zap}
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="errors">Errors</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <AreaChart
              title="Daily Traffic"
              description="Total API requests over the last 7 days"
              data={dailyChartData}
              dataKey="requests"
              xAxisKey="date"
              color="hsl(var(--chart-1))"
              formatYAxis={(value) => formatNumber(value)}
            />
            <BarChart
              title="Today's Hourly Traffic"
              description="Request distribution throughout the day"
              data={hourlyChartData}
              bars={[
                { dataKey: "requests", color: "hsl(var(--chart-1))", name: "Requests" },
              ]}
              xAxisKey="hour"
            />
          </div>
        </TabsContent>

        <TabsContent value="endpoints">
          <Card>
            <CardHeader>
              <CardTitle>Endpoint Statistics</CardTitle>
              <CardDescription>
                Performance metrics by API endpoint
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={endpointColumns}
                data={endpointStats}
                pageSize={10}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* 4xx Errors */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>4xx Client Errors</span>
                  <Badge variant="warning">{errorBreakdown["4xx"].total}</Badge>
                </CardTitle>
                <CardDescription>
                  Client-side error breakdown
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(errorBreakdown["4xx"].breakdown).map(
                    ([code, count]) => (
                      <div key={code} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">{code}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {code === "400"
                              ? "Bad Request"
                              : code === "401"
                              ? "Unauthorized"
                              : code === "403"
                              ? "Forbidden"
                              : "Not Found"}
                          </span>
                        </div>
                        <span className="font-medium">{count}</span>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 5xx Errors */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>5xx Server Errors</span>
                  <Badge variant="destructive">{errorBreakdown["5xx"].total}</Badge>
                </CardTitle>
                <CardDescription>
                  Server-side error breakdown
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(errorBreakdown["5xx"].breakdown).map(
                    ([code, count]) => (
                      <div key={code} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant="destructive">{code}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {code === "500"
                              ? "Internal Server Error"
                              : code === "502"
                              ? "Bad Gateway"
                              : "Service Unavailable"}
                          </span>
                        </div>
                        <span className="font-medium">{count}</span>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
