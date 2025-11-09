"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import {
  IconUsers,
  IconMail,
  IconUserPlus,
  IconDatabase,
  IconBuilding,
  IconCreditCard,
  IconTrendingUp,
  IconClock,
  IconCheck,
  IconAlertCircle,
} from "@tabler/icons-react";
import { format } from "date-fns";

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
  recentWaitlistSignups: Array<{
    id: string;
    name: string;
    email: string;
    company: string | null;
    status: string;
    createdAt: string;
  }>;
  recentUsers: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    organization: string | null;
    createdAt: string;
  }>;
  pendingInvitations: Array<{
    id: string;
    email: string;
    role: string;
    invitedBy: string;
    organization: string;
    expiresAt: string;
    createdAt: string;
  }>;
  subscriptions: {
    total: number;
    byPlan: Array<{
      plan: string;
      count: number;
    }>;
  };
}

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/admin/stats");

        if (!response.ok) {
          if (response.status === 403) {
            setError("Access denied - Admin only");
            return;
          }
          throw new Error("Failed to fetch admin stats");
        }

        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.error("Error fetching admin stats:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load admin stats"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading admin stats...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-500/50 bg-red-500/5">
        <CardContent className="flex items-center gap-2 py-4">
          <IconAlertCircle className="h-5 w-5 text-red-500" />
          <p className="text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-8">
      {/* Admin Header */}
      <div className="flex items-center gap-2">
        <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-sm px-3 py-1">
          ADMIN DASHBOARD
        </Badge>
      </div>

      {/* Overview Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <BackgroundGradient className="rounded-[22px] p-1 bg-background">
            <Card className="border-0 shadow-none bg-transparent">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">
                  Total Users
                </CardTitle>
                <div className="rounded-full bg-blue-500/10 p-2">
                  <IconUsers className="h-4 w-4 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold bg-linear-to-br from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                  {stats.overview.totalUsers}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  +{stats.growth.users.last7Days} this week
                </p>
              </CardContent>
            </Card>
          </BackgroundGradient>
        </motion.div>

        {/* Waitlist */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <BackgroundGradient className="rounded-[22px] p-1 bg-background">
            <Card className="border-0 shadow-none bg-transparent">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">
                  Waitlist Signups
                </CardTitle>
                <div className="rounded-full bg-purple-500/10 p-2">
                  <IconUserPlus className="h-4 w-4 text-purple-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold bg-linear-to-br from-purple-500 to-pink-500 bg-clip-text text-transparent">
                  {stats.overview.totalWaitlist}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  +{stats.growth.waitlist.last7Days} this week
                </p>
              </CardContent>
            </Card>
          </BackgroundGradient>
        </motion.div>

        {/* Organizations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <BackgroundGradient className="rounded-[22px] p-1 bg-background">
            <Card className="border-0 shadow-none bg-transparent">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">
                  Organizations
                </CardTitle>
                <div className="rounded-full bg-green-500/10 p-2">
                  <IconBuilding className="h-4 w-4 text-green-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold bg-linear-to-br from-green-500 to-emerald-500 bg-clip-text text-transparent">
                  {stats.overview.totalOrganizations}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.overview.totalTeamMembers} total team members
                </p>
              </CardContent>
            </Card>
          </BackgroundGradient>
        </motion.div>

        {/* Subscriptions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <BackgroundGradient className="rounded-[22px] p-1 bg-background">
            <Card className="border-0 shadow-none bg-transparent">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">
                  Active Subscriptions
                </CardTitle>
                <div className="rounded-full bg-amber-500/10 p-2">
                  <IconCreditCard className="h-4 w-4 text-amber-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold bg-linear-to-br from-amber-500 to-orange-500 bg-clip-text text-transparent">
                  {stats.overview.activeSubscriptions}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Revenue generating
                </p>
              </CardContent>
            </Card>
          </BackgroundGradient>
        </motion.div>
      </div>

      {/* Recent Activity Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Waitlist Signups */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconUserPlus className="h-5 w-5 text-purple-500" />
              Recent Waitlist Signups
            </CardTitle>
            <CardDescription>
              Latest people interested in the platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.recentWaitlistSignups.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent signups</p>
            ) : (
              stats.recentWaitlistSignups.slice(0, 5).map((signup) => (
                <div
                  key={signup.id}
                  className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{signup.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {signup.email}
                    </p>
                    {signup.company && (
                      <p className="text-xs text-muted-foreground">
                        Company: {signup.company}
                      </p>
                    )}
                  </div>
                  <div className="text-right space-y-1">
                    <Badge
                      variant={
                        signup.status === "PENDING" ? "secondary" : "default"
                      }
                      className="text-xs"
                    >
                      {signup.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(signup.createdAt), "MMM d, h:mm a")}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconUsers className="h-5 w-5 text-blue-500" />
              Recent Registered Users
            </CardTitle>
            <CardDescription>
              Newest users who joined the platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.recentUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent users</p>
            ) : (
              stats.recentUsers.slice(0, 5).map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.email}
                    </p>
                    {user.organization && (
                      <p className="text-xs text-muted-foreground">
                        Org: {user.organization}
                      </p>
                    )}
                  </div>
                  <div className="text-right space-y-1">
                    <Badge variant="outline" className="text-xs">
                      {user.role}
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(user.createdAt), "MMM d, h:mm a")}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pending Invitations */}
      {stats.pendingInvitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconMail className="h-5 w-5 text-cyan-500" />
              Pending Team Invitations
            </CardTitle>
            <CardDescription>Invitations awaiting acceptance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.pendingInvitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{invitation.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Invited by {invitation.invitedBy} to{" "}
                      {invitation.organization}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge variant="outline" className="text-xs">
                      {invitation.role}
                    </Badge>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <IconClock className="h-3 w-3" />
                      Expires {format(new Date(invitation.expiresAt), "MMM d")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subscription Plans Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconCreditCard className="h-5 w-5 text-amber-500" />
            Subscription Plans Distribution
          </CardTitle>
          <CardDescription>Breakdown by plan type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {stats.subscriptions.byPlan.map((plan) => (
              <div
                key={plan.plan}
                className="flex flex-col items-center justify-center rounded-lg border p-4"
              >
                <p className="text-sm font-medium text-muted-foreground">
                  {plan.plan}
                </p>
                <p className="text-3xl font-bold mt-2">{plan.count}</p>
                <Badge variant="outline" className="mt-2">
                  {Math.round(
                    (plan.count / stats.overview.activeSubscriptions) * 100
                  )}
                  %
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
