"use client";

import { Bot, Scan, MessageSquare, DollarSign, Clock, CheckCircle } from "lucide-react";
import { StatsCard } from "@/components/dashboard";
import { BarChart, LineChart } from "@/components/charts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  aiStats,
  dailyAIUsage,
  providerStats,
  hourlyUsage,
  costBreakdown,
} from "@/data/dummy-ai";
import { formatNumber, formatCurrency } from "@/lib/utils";

export default function AIMonitoringPage() {
  // Prepare chart data
  const dailyChartData = dailyAIUsage.map((item) => ({
    date: item.date.slice(5),
    OCR: item.ocrCount,
    Chat: item.chatCount,
    cost: item.cost,
  }));

  const hourlyChartData = hourlyUsage.map((item) => ({
    hour: item.hour,
    OCR: item.ocr,
    Chat: item.chat,
  }));

  const costChartData = dailyAIUsage.map((item) => ({
    date: item.date.slice(5),
    cost: item.cost,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">AI Monitoring</h2>
        <p className="text-muted-foreground">
          Monitor AI feature usage and costs
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="OCR Today"
          value={aiStats.totalOCRToday}
          description={`${aiStats.totalOCRWeek} this week`}
          icon={Scan}
          trend={{ value: 12.3, isPositive: true }}
        />
        <StatsCard
          title="Chat Today"
          value={aiStats.totalChatToday}
          description={`${aiStats.totalChatWeek} this week`}
          icon={MessageSquare}
          trend={{ value: 8.7, isPositive: true }}
        />
        <StatsCard
          title="Estimated Cost"
          value={formatCurrency(aiStats.estimatedCostToday)}
          description={`${formatCurrency(aiStats.totalCostWeek)} this week`}
          icon={DollarSign}
          trend={{ value: 5.2, isPositive: false }}
        />
        <StatsCard
          title="Avg Latency"
          value={`${aiStats.avgLatencyMs}ms`}
          description={`${aiStats.avgSuccessRate}% success rate`}
          icon={Clock}
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="usage" className="space-y-4">
        <TabsList>
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="providers">Providers</TabsTrigger>
          <TabsTrigger value="cost">Cost Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="usage" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <BarChart
              title="Daily AI Usage"
              description="OCR and Chat usage over the last 7 days"
              data={dailyChartData}
              bars={[
                { dataKey: "OCR", color: "hsl(var(--chart-2))", name: "OCR" },
                { dataKey: "Chat", color: "hsl(var(--chart-3))", name: "Chat" },
              ]}
              xAxisKey="date"
              showLegend
            />
            <LineChart
              title="Today's Hourly Usage"
              description="Usage pattern throughout the day"
              data={hourlyChartData}
              lines={[
                { dataKey: "OCR", color: "hsl(var(--chart-2))", name: "OCR" },
                { dataKey: "Chat", color: "hsl(var(--chart-3))", name: "Chat" },
              ]}
              xAxisKey="hour"
              showLegend
            />
          </div>
        </TabsContent>

        <TabsContent value="providers" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {providerStats.map((provider) => (
              <Card key={`${provider.provider}-${provider.model}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{provider.model}</CardTitle>
                    <Badge variant="outline" className="capitalize">
                      {provider.provider}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Requests</span>
                      <span className="font-medium">
                        {formatNumber(provider.requestCount)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Input Tokens</span>
                      <span className="font-medium">
                        {formatNumber(provider.inputTokens)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Output Tokens</span>
                      <span className="font-medium">
                        {formatNumber(provider.outputTokens)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Avg Latency</span>
                      <span className="font-medium">{provider.avgLatencyMs}ms</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Success Rate</span>
                      <span className="flex items-center gap-1 font-medium">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        {provider.successRate}%
                      </span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Est. Cost</span>
                        <span className="font-bold text-primary">
                          {formatCurrency(provider.cost)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="cost" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <LineChart
              title="Daily Cost Trend"
              description="AI costs over the last 7 days"
              data={costChartData}
              lines={[
                { dataKey: "cost", color: "hsl(var(--chart-5))", name: "Cost ($)" },
              ]}
              xAxisKey="date"
              formatYAxis={(value) => `$${value}`}
            />
            <Card>
              <CardHeader>
                <CardTitle>Cost Breakdown</CardTitle>
                <CardDescription>Costs by AI feature type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* OCR Costs */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Scan className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">OCR</span>
                      </div>
                      <span className="font-bold">
                        {formatCurrency(costBreakdown.ocr.total)}
                      </span>
                    </div>
                    <div className="space-y-1 pl-6">
                      {Object.entries(costBreakdown.ocr.byProvider).map(
                        ([provider, cost]) => (
                          <div
                            key={provider}
                            className="flex justify-between text-sm text-muted-foreground"
                          >
                            <span className="capitalize">{provider}</span>
                            <span>{formatCurrency(cost)}</span>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  {/* Chat Costs */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Chat</span>
                      </div>
                      <span className="font-bold">
                        {formatCurrency(costBreakdown.chat.total)}
                      </span>
                    </div>
                    <div className="space-y-1 pl-6">
                      {Object.entries(costBreakdown.chat.byProvider).map(
                        ([provider, cost]) => (
                          <div
                            key={provider}
                            className="flex justify-between text-sm text-muted-foreground"
                          >
                            <span className="capitalize">{provider}</span>
                            <span>{formatCurrency(cost)}</span>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  {/* Total */}
                  <div className="border-t pt-4">
                    <div className="flex justify-between">
                      <span className="font-bold">Total Weekly Cost</span>
                      <span className="text-xl font-bold text-primary">
                        {formatCurrency(
                          costBreakdown.ocr.total + costBreakdown.chat.total
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
