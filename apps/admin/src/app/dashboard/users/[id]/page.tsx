"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Calendar, MapPin, Wallet, Bot, MessageSquare, Scan } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusIndicator, StatsCard } from "@/components/dashboard";
import { getUserById } from "@/data/dummy-users";
import { formatDate, formatDateTime, formatNumber } from "@/lib/utils";

interface UserDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function UserDetailPage({ params }: UserDetailPageProps) {
  const { id } = use(params);
  const user = getUserById(id);

  if (!user) {
    return (
      <div className="space-y-6">
        <Link href="/dashboard/users">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Users
          </Button>
        </Link>
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">User not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/users">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">User Details</h2>
          <p className="text-muted-foreground">View user information and activity</p>
        </div>
      </div>

      {/* User Profile Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            <Avatar className="h-24 w-24">
              {user.profileImageUrl && (
                <AvatarImage src={user.profileImageUrl} alt={user.name} />
              )}
              <AvatarFallback className="text-2xl">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-start">
                <h3 className="text-2xl font-bold">{user.name}</h3>
                <StatusIndicator status={user.status} />
              </div>
              <div className="mt-2 flex flex-col gap-2 text-muted-foreground sm:flex-row sm:gap-4">
                <span className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Joined {formatDate(user.createdAt)}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                <Badge variant="secondary" className="capitalize">
                  {user.provider}
                </Badge>
                <Badge variant="outline">
                  Last login: {formatDateTime(user.lastLoginAt)}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard
          title="Total Trips"
          value={user.tripsCount}
          icon={MapPin}
        />
        <StatsCard
          title="Total Expenses"
          value={`${formatNumber(user.expensesTotal)} KRW`}
          icon={Wallet}
        />
        <StatsCard
          title="OCR Usage"
          value={user.aiUsage.ocrCount}
          icon={Scan}
        />
        <StatsCard
          title="Chat Usage"
          value={user.aiUsage.chatCount}
          icon={MessageSquare}
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="trips" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trips">Trips</TabsTrigger>
          <TabsTrigger value="expenses">Recent Expenses</TabsTrigger>
          <TabsTrigger value="ai">AI Usage</TabsTrigger>
        </TabsList>

        <TabsContent value="trips">
          <Card>
            <CardHeader>
              <CardTitle>Travel History</CardTitle>
              <CardDescription>
                Recent trips created by this user
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {user.trips.map((trip) => (
                  <div
                    key={trip.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div>
                      <p className="font-medium">{trip.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {trip.destination}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {formatNumber(trip.totalExpense)} KRW
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Total expenses
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses">
          <Card>
            <CardHeader>
              <CardTitle>Recent Expenses</CardTitle>
              <CardDescription>
                Latest expense records
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {user.recentExpenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div>
                      <p className="font-medium">{expense.description}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {expense.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(expense.date)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {formatNumber(expense.amount)} {expense.currency}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai">
          <Card>
            <CardHeader>
              <CardTitle>AI Feature Usage</CardTitle>
              <CardDescription>
                OCR and Chatbot usage statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-primary/10 p-2">
                      <Scan className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{user.aiUsage.ocrCount}</p>
                      <p className="text-sm text-muted-foreground">
                        OCR Scans
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-primary/10 p-2">
                      <Bot className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{user.aiUsage.chatCount}</p>
                      <p className="text-sm text-muted-foreground">
                        Chat Messages
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                Last AI usage: {formatDateTime(user.aiUsage.lastUsedAt)}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
