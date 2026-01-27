"use client";

import { Users, UserPlus, Bot, Activity, TrendingUp } from "lucide-react";
import { StatsCard, StatusIndicator } from "@/components/dashboard";
import { AreaChart, BarChart } from "@/components/charts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { userStats, dummyUsers } from "@/data/dummy-users";
import { aiStats, dailyAIUsage } from "@/data/dummy-ai";
import { trafficStats, dailyTraffic } from "@/data/dummy-traffic";
import { serviceHealth } from "@/data/dummy-system";
import { formatNumber, formatDate } from "@/lib/utils";

export default function DashboardPage() {
  // Get recent users (last 5)
  const recentUsers = [...dummyUsers]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // Prepare chart data
  const weeklyTrendData = dailyTraffic.map((item, index) => ({
    date: item.date.slice(5), // MM-DD format
    requests: item.totalRequests,
    users: item.uniqueUsers,
    aiUsage: dailyAIUsage[index]?.ocrCount + dailyAIUsage[index]?.chatCount || 0,
  }));

  const aiUsageChartData = dailyAIUsage.map((item) => ({
    date: item.date.slice(5),
    OCR: item.ocrCount,
    Chat: item.chatCount,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Overview of Travel Helper service metrics
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Users"
          value={formatNumber(userStats.total * 617)}
          description="from last month"
          icon={Users}
          trend={{ value: 12.5, isPositive: true }}
        />
        <StatsCard
          title="Today's Signups"
          value={`+${userStats.todaySignups}`}
          description={`${userStats.weekSignups} this week`}
          icon={UserPlus}
          trend={{ value: 8.2, isPositive: true }}
        />
        <StatsCard
          title="AI Usage Today"
          value={formatNumber(aiStats.totalOCRToday + aiStats.totalChatToday)}
          description={`$${aiStats.estimatedCostToday.toFixed(2)} estimated cost`}
          icon={Bot}
          trend={{ value: 15.3, isPositive: true }}
        />
        <StatsCard
          title="API Requests Today"
          value={formatNumber(trafficStats.totalRequestsToday)}
          description={`${trafficStats.requestsPerMinute} req/min`}
          icon={Activity}
          trend={{ value: 5.7, isPositive: true }}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <AreaChart
          title="Weekly Traffic Trend"
          description="Total API requests over the last 7 days"
          data={weeklyTrendData}
          dataKey="requests"
          xAxisKey="date"
          color="hsl(var(--chart-1))"
          formatYAxis={(value) => formatNumber(value)}
        />
        <BarChart
          title="AI Usage by Type"
          description="OCR and Chat usage over the last 7 days"
          data={aiUsageChartData}
          bars={[
            { dataKey: "OCR", color: "hsl(var(--chart-2))", name: "OCR" },
            { dataKey: "Chat", color: "hsl(var(--chart-3))", name: "Chat" },
          ]}
          xAxisKey="date"
          showLegend
        />
      </div>

      {/* Recent Users & System Status */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Recent Signups
            </CardTitle>
            <CardDescription>Latest user registrations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentUsers.map((user) => (
                <div key={user.id} className="flex items-center gap-4">
                  <Avatar className="h-9 w-9">
                    {user.profileImageUrl && (
                      <AvatarImage src={user.profileImageUrl} alt={user.name} />
                    )}
                    <AvatarFallback>
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {formatDate(user.createdAt)}
                    </p>
                    <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      {user.provider}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              System Status
            </CardTitle>
            <CardDescription>Current service health</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {serviceHealth.map((service) => (
                <div
                  key={service.name}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <StatusIndicator status={service.status} showLabel={false} />
                    <span className="text-sm font-medium">{service.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      {service.latencyMs}ms
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {service.uptime}% uptime
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
