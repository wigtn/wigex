"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Eye, MoreHorizontal } from "lucide-react";
import { DataTable, StatusIndicator } from "@/components/dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { dummyUsers, searchUsers, type User, type UserProvider, type UserStatus } from "@/data/dummy-users";
import { formatDate, formatNumber } from "@/lib/utils";

const PAGE_SIZE = 10;

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [providerFilter, setProviderFilter] = useState<UserProvider | "all">("all");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Filter users
  const filteredUsers = useMemo(() => {
    return searchUsers(
      searchQuery,
      providerFilter === "all" ? undefined : providerFilter,
      statusFilter === "all" ? undefined : statusFilter
    );
  }, [searchQuery, providerFilter, statusFilter]);

  // Paginate
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredUsers.slice(start, start + PAGE_SIZE);
  }, [filteredUsers, currentPage]);

  // Reset page when filters change
  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  const columns = [
    {
      key: "user",
      header: "User",
      cell: (user: User) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            {user.profileImageUrl && (
              <AvatarImage src={user.profileImageUrl} alt={user.name} />
            )}
            <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "provider",
      header: "Provider",
      cell: (user: User) => (
        <Badge variant="secondary" className="capitalize">
          {user.provider}
        </Badge>
      ),
      className: "w-[100px]",
    },
    {
      key: "status",
      header: "Status",
      cell: (user: User) => (
        <StatusIndicator status={user.status} />
      ),
      className: "w-[120px]",
    },
    {
      key: "trips",
      header: "Trips",
      cell: (user: User) => (
        <span className="text-sm">{user.tripsCount}</span>
      ),
      className: "w-[80px]",
    },
    {
      key: "expenses",
      header: "Total Expenses",
      cell: (user: User) => (
        <span className="text-sm">{formatNumber(user.expensesTotal)} KRW</span>
      ),
      className: "w-[140px]",
    },
    {
      key: "createdAt",
      header: "Joined",
      cell: (user: User) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(user.createdAt)}
        </span>
      ),
      className: "w-[100px]",
    },
    {
      key: "actions",
      header: "",
      cell: (user: User) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/users/${user.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      className: "w-[50px]",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Users</h2>
        <p className="text-muted-foreground">
          Manage and view user information
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User List</CardTitle>
          <CardDescription>
            Total {filteredUsers.length} users found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by email or name..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  handleFilterChange();
                }}
                className="pl-9"
              />
            </div>
            <Select
              value={providerFilter}
              onValueChange={(value) => {
                setProviderFilter(value as UserProvider | "all");
                handleFilterChange();
              }}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Providers</SelectItem>
                <SelectItem value="local">Local</SelectItem>
                <SelectItem value="google">Google</SelectItem>
                <SelectItem value="apple">Apple</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value as UserStatus | "all");
                handleFilterChange();
              }}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <DataTable
            columns={columns}
            data={paginatedUsers}
            pageSize={PAGE_SIZE}
            currentPage={currentPage}
            totalItems={filteredUsers.length}
            onPageChange={setCurrentPage}
            emptyMessage="No users found matching your criteria."
          />
        </CardContent>
      </Card>
    </div>
  );
}
