"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import {
  IconChartBar,
  IconUsers,
  IconUserPlus,
  IconBuilding,
  IconRefresh,
  IconTrendingUp,
  IconTrendingDown,
  IconActivity,
  IconDatabase,
} from "@tabler/icons-react";

interface AdminStats {
  overview: {
    totalUsers: number;
    totalWaitlist: number;
    totalTeamMembers: number;
    totalOrganizations: number;
    totalDatabases: number;
    totalInvitations: number;
    activeSubscriptions: number;
  };
  growth: {
    waitlist: {
      last24Hours: number;
      last7Days: number;
      last30Days: number;
    };
    users: {
      last24Hours: number;
      last7Days: number;
    };
  };
  subscriptions: {
    total: number;
    byPlan: Array<{
      plan: string;
      count: number;
    }>;
  };
}

export default function AdminAnalyticsDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/stats");
      if (!response.ok) throw new Error("Failed to fetch stats");

      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Platform Analytics
          </h1>
          <p className="text-muted-foreground">
            Comprehensive platform metrics and insights
          </p>
        </div>
        <Button onClick={fetchStats} variant="outline">
          <IconRefresh className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-linear-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <IconUsers className="w-4 h-4" />
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-cyan-500">
              {stats.overview.totalUsers}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <IconTrendingUp className="w-3 h-3 text-green-500" />+
              {stats.growth.users.last7Days} this week
            </p>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <IconUserPlus className="w-4 h-4" />
              Waitlist
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-500">
              {stats.overview.totalWaitlist}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <IconTrendingUp className="w-3 h-3 text-green-500" />+
              {stats.growth.waitlist.last7Days} this week
            </p>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <IconBuilding className="w-4 h-4" />
              Organizations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-500">
              {stats.overview.totalOrganizations}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Active organizations
            </p>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <IconActivity className="w-4 h-4" />
              Subscriptions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">
              {stats.overview.activeSubscriptions}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Active subscribers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Growth Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconTrendingUp className="w-5 h-5" />
              User Growth
            </CardTitle>
            <CardDescription>New user registrations over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border border-cyan-500/20 bg-cyan-500/5">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Last 24 Hours
                  </p>
                  <p className="text-2xl font-bold text-cyan-500">
                    {stats.growth.users.last24Hours}
                  </p>
                </div>
                <IconTrendingUp className="w-8 h-8 text-cyan-500" />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border border-blue-500/20 bg-blue-500/5">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Last 7 Days
                  </p>
                  <p className="text-2xl font-bold text-blue-500">
                    {stats.growth.users.last7Days}
                  </p>
                </div>
                <IconTrendingUp className="w-8 h-8 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconUserPlus className="w-5 h-5" />
              Waitlist Growth
            </CardTitle>
            <CardDescription>New waitlist signups over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border border-yellow-500/20 bg-yellow-500/5">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Last 24 Hours
                  </p>
                  <p className="text-2xl font-bold text-yellow-500">
                    {stats.growth.waitlist.last24Hours}
                  </p>
                </div>
                <IconTrendingUp className="w-8 h-8 text-yellow-500" />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border border-orange-500/20 bg-orange-500/5">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Last 7 Days
                  </p>
                  <p className="text-2xl font-bold text-orange-500">
                    {stats.growth.waitlist.last7Days}
                  </p>
                </div>
                <IconTrendingUp className="w-8 h-8 text-orange-500" />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border border-red-500/20 bg-red-500/5">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Last 30 Days
                  </p>
                  <p className="text-2xl font-bold text-red-500">
                    {stats.growth.waitlist.last30Days}
                  </p>
                </div>
                <IconTrendingUp className="w-8 h-8 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconChartBar className="w-5 h-5" />
              Subscription Distribution
            </CardTitle>
            <CardDescription>Breakdown by plan type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.subscriptions.byPlan.map(
                (sub: { plan: string; count: number }, index: number) => {
                  const colors = [
                    "from-gray-500/10 to-slate-500/10 border-gray-500/20",
                    "from-blue-500/10 to-cyan-500/10 border-blue-500/20",
                    "from-purple-500/10 to-pink-500/10 border-purple-500/20",
                    "from-cyan-500/10 to-teal-500/10 border-cyan-500/20",
                  ];
                  const textColors = [
                    "text-gray-500",
                    "text-blue-500",
                    "text-purple-500",
                    "text-cyan-500",
                  ];
                  return (
                    <div
                      key={sub.plan}
                      className={`flex items-center justify-between p-4 rounded-lg border bg-linear-to-br ${
                        colors[index % colors.length]
                      }`}
                    >
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          {sub.plan}
                        </p>
                        <p
                          className={`text-2xl font-bold ${
                            textColors[index % textColors.length]
                          }`}
                        >
                          {sub.count}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {sub.count > 0 && stats.subscriptions.total > 0
                          ? (
                              (sub.count / stats.subscriptions.total) *
                              100
                            ).toFixed(0)
                          : 0}
                        %
                      </Badge>
                    </div>
                  );
                }
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconDatabase className="w-5 h-5" />
              Platform Resources
            </CardTitle>
            <CardDescription>Database and member statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-lg border border-cyan-500/20 bg-cyan-500/5">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Databases
                  </p>
                  <p className="text-2xl font-bold text-cyan-500">
                    {stats.overview.totalDatabases}
                  </p>
                </div>
                <IconDatabase className="w-8 h-8 text-cyan-500" />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border border-purple-500/20 bg-purple-500/5">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Team Members
                  </p>
                  <p className="text-2xl font-bold text-purple-500">
                    {stats.overview.totalTeamMembers}
                  </p>
                </div>
                <IconUsers className="w-8 h-8 text-purple-500" />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border border-green-500/20 bg-green-500/5">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Pending Invitations
                  </p>
                  <p className="text-2xl font-bold text-green-500">
                    {stats.overview.totalInvitations}
                  </p>
                </div>
                <IconActivity className="w-8 h-8 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
