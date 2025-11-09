"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { AdminDashboard } from "@/components/admin-dashboard";
import {
  IconUsers,
  IconCreditCard,
  IconMail,
  IconSearch,
  IconShieldCheck,
  IconArrowRight,
  IconCalendar,
  IconCrown,
  IconAlertCircle,
  IconSparkles,
  IconTrendingUp,
  IconDatabase,
  IconEye,
  IconAlertTriangle,
  IconShield,
  IconActivity,
} from "@tabler/icons-react";

interface DashboardStats {
  organization: {
    name: string;
    memberCount: number;
    pendingInvites: number;
  };
  subscription: {
    plan: string;
    status: string;
    currentPeriodEnd: string | null;
  } | null;
  recentActivity: {
    invitations: number;
    searches: number;
  };
  monitoring: {
    emails: number;
    domains: number;
    totalSearches: number;
  };
  breaches: {
    total: number;
    active: number;
    investigating: number;
    archived: number;
    critical: number;
    high: number;
    medium: number;
  };
  leakedDatabases: Array<{
    id: string;
    name: string;
    severity: string;
    status: string;
    recordCount: number;
    leakDate: string;
    affectedOrg: string;
  }>;
  remediation: {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    failed: number;
  };
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/dashboard/overview");

        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load dashboard"
        );
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchData();
    }
  }, [session]);

  if (status === "loading" || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const getSubscriptionBadge = (status?: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "TRIALING":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "PAST_DUE":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-muted text-muted-foreground border-muted";
    }
  };

  return (
    <div className="container mx-auto max-w-7xl space-y-8 p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold text-foreground">
          Welcome back, {session.user?.name || "User"}! 👋
        </h1>
        <p className="mt-2 text-muted-foreground">
          Here's an overview of your organization and recent activity
        </p>
      </motion.div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <IconAlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Admin Dashboard - Only for admin users */}
      {session.user?.email === "admin@gladiatorrx.com" && (
        <div className="space-y-6">
          <AdminDashboard />
          <div className="border-t pt-8">
            <h2 className="text-2xl font-bold mb-4">
              My Organization Dashboard
            </h2>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      {stats && (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Team Members */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <BackgroundGradient className="rounded-[22px] p-1 bg-background">
                <Card className="border-0 shadow-none bg-transparent">
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium">
                      Team Members
                    </CardTitle>
                    <div className="rounded-full bg-blue-500/10 p-2">
                      <IconUsers className="h-4 w-4 text-blue-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold bg-linear-to-br from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                      {stats.organization.memberCount}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <IconTrendingUp className="h-3 w-3" />
                      Active in your organization
                    </p>
                  </CardContent>
                </Card>
              </BackgroundGradient>
            </motion.div>

            {/* Pending Invites */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <BackgroundGradient className="rounded-[22px] p-1 bg-background">
                <Card className="border-0 shadow-none bg-transparent">
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium">
                      Pending Invites
                    </CardTitle>
                    <div className="rounded-full bg-purple-500/10 p-2">
                      <IconMail className="h-4 w-4 text-purple-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold bg-linear-to-br from-purple-500 to-pink-500 bg-clip-text text-transparent">
                      {stats.organization.pendingInvites}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Awaiting response
                    </p>
                  </CardContent>
                </Card>
              </BackgroundGradient>
            </motion.div>

            {/* Recent Searches */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <BackgroundGradient className="rounded-[22px] p-1 bg-background">
                <Card className="border-0 shadow-none bg-transparent">
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium">
                      Recent Searches
                    </CardTitle>
                    <div className="rounded-full bg-green-500/10 p-2">
                      <IconSearch className="h-4 w-4 text-green-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold bg-linear-to-br from-green-500 to-emerald-500 bg-clip-text text-transparent">
                      {stats.recentActivity.searches}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      In the last 7 days
                    </p>
                  </CardContent>
                </Card>
              </BackgroundGradient>
            </motion.div>

            {/* Subscription Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <BackgroundGradient className="rounded-[22px] p-1 bg-background">
                <Card className="border-0 shadow-none bg-transparent">
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium">
                      Subscription
                    </CardTitle>
                    <div className="rounded-full bg-amber-500/10 p-2">
                      <IconCrown className="h-4 w-4 text-amber-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold bg-linear-to-br from-amber-500 to-orange-500 bg-clip-text text-transparent capitalize">
                      {stats.subscription?.plan?.toLowerCase() || "Free"}
                    </div>
                    <Badge
                      variant="outline"
                      className={`mt-2 ${getSubscriptionBadge(
                        stats.subscription?.status
                      )}`}
                    >
                      {stats.subscription?.status || "No Plan"}
                    </Badge>
                  </CardContent>
                </Card>
              </BackgroundGradient>
            </motion.div>
          </div>

          {/* Organization & Subscription Info */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Organization Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <IconShieldCheck className="h-5 w-5" />
                    Organization
                  </CardTitle>
                  <CardDescription>
                    Manage your team and settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Organization Name
                    </p>
                    <p className="text-lg font-semibold">
                      {stats.organization.name}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Members
                      </p>
                      <p className="text-2xl font-bold">
                        {stats.organization.memberCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Pending</p>
                      <p className="text-2xl font-bold">
                        {stats.organization.pendingInvites}
                      </p>
                    </div>
                  </div>
                  <Link href="/dashboard/team">
                    <Button className="w-full gap-2">
                      Manage Team
                      <IconArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            {/* Subscription Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <IconCrown className="h-5 w-5" />
                    Subscription
                  </CardTitle>
                  <CardDescription>
                    Your current plan and billing
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {stats.subscription ? (
                    <>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Current Plan
                        </p>
                        <p className="text-lg font-semibold capitalize">
                          {stats.subscription.plan.toLowerCase()} Plan
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Status
                          </p>
                          <Badge
                            variant="outline"
                            className={getSubscriptionBadge(
                              stats.subscription.status
                            )}
                          >
                            {stats.subscription.status}
                          </Badge>
                        </div>
                        {stats.subscription.currentPeriodEnd && (
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Renews On
                            </p>
                            <p className="text-sm font-medium flex items-center gap-1">
                              <IconCalendar className="h-3 w-3" />
                              {new Date(
                                stats.subscription.currentPeriodEnd
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </div>
                      <Link href="/dashboard/subscription">
                        <Button className="w-full gap-2" variant="outline">
                          Manage Subscription
                          <IconArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <>
                      <div className="text-center py-4">
                        <IconCreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground">
                          No active subscription
                        </p>
                      </div>
                      <Link href="/dashboard/subscription">
                        <Button className="w-full gap-2">
                          Choose a Plan
                          <IconArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Monitoring Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconEye className="h-5 w-5" />
                  Monitoring Indicators
                </CardTitle>
                <CardDescription>
                  Assets being monitored for data breaches
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="flex items-center gap-4 p-4 rounded-lg border bg-card">
                    <div className="rounded-full bg-blue-500/10 p-3">
                      <IconMail className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {stats.monitoring.emails}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Email Addresses
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 rounded-lg border bg-card">
                    <div className="rounded-full bg-purple-500/10 p-3">
                      <IconDatabase className="h-6 w-6 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {stats.monitoring.domains}
                      </p>
                      <p className="text-sm text-muted-foreground">Domains</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 rounded-lg border bg-card">
                    <div className="rounded-full bg-green-500/10 p-3">
                      <IconActivity className="h-6 w-6 text-green-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {stats.monitoring.totalSearches}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Total Searches
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Breach Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconAlertTriangle className="h-5 w-5" />
                  Data Breach Overview
                </CardTitle>
                <CardDescription>
                  Known breaches in our database
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="text-center p-4 rounded-lg border bg-card">
                    <div className="rounded-full bg-slate-500/10 p-2 w-fit mx-auto mb-2">
                      <IconDatabase className="h-5 w-5 text-slate-500" />
                    </div>
                    <p className="text-3xl font-bold">{stats.breaches.total}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Total Breaches
                    </p>
                  </div>
                  <div className="text-center p-4 rounded-lg border bg-card">
                    <div className="rounded-full bg-red-500/10 p-2 w-fit mx-auto mb-2">
                      <IconAlertCircle className="h-5 w-5 text-red-500" />
                    </div>
                    <p className="text-3xl font-bold text-red-500">
                      {stats.breaches.active}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Active</p>
                  </div>
                  <div className="text-center p-4 rounded-lg border bg-card">
                    <div className="rounded-full bg-orange-500/10 p-2 w-fit mx-auto mb-2">
                      <IconSearch className="h-5 w-5 text-orange-500" />
                    </div>
                    <p className="text-3xl font-bold text-orange-500">
                      {stats.breaches.investigating}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Investigating
                    </p>
                  </div>
                  <div className="text-center p-4 rounded-lg border bg-card">
                    <div className="rounded-full bg-purple-500/10 p-2 w-fit mx-auto mb-2">
                      <IconShield className="h-5 w-5 text-purple-500" />
                    </div>
                    <p className="text-3xl font-bold text-purple-500">
                      {stats.breaches.critical}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Critical Severity
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Breaches Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <IconDatabase className="h-5 w-5" />
                      Recent Data Breaches
                    </CardTitle>
                    <CardDescription>
                      Latest breaches in our monitoring database
                    </CardDescription>
                  </div>
                  <Link href="/dashboard/search">
                    <Button variant="outline" size="sm" className="gap-2">
                      Search All
                      <IconArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.leakedDatabases.slice(0, 5).map((breach, index) => (
                    <div
                      key={breach.id}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`rounded-full p-2 ${
                            breach.severity === "critical"
                              ? "bg-red-500/10"
                              : breach.severity === "high"
                              ? "bg-orange-500/10"
                              : "bg-yellow-500/10"
                          }`}
                        >
                          <IconAlertTriangle
                            className={`h-5 w-5 ${
                              breach.severity === "critical"
                                ? "text-red-500"
                                : breach.severity === "high"
                                ? "text-orange-500"
                                : "text-yellow-500"
                            }`}
                          />
                        </div>
                        <div>
                          <p className="font-semibold">{breach.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {breach.affectedOrg}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {(breach.recordCount / 1000000).toFixed(1)}M records
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(breach.leakDate).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            breach.status === "active"
                              ? "bg-red-500/10 text-red-500 border-red-500/20"
                              : breach.status === "investigating"
                              ? "bg-orange-500/10 text-orange-500 border-orange-500/20"
                              : "bg-gray-500/10 text-gray-500 border-gray-500/20"
                          }
                        >
                          {breach.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                {stats.leakedDatabases.length > 5 && (
                  <div className="mt-4 text-center">
                    <Link href="/dashboard/search">
                      <Button variant="ghost" className="gap-2">
                        View All {stats.breaches.total} Breaches
                        <IconArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Remediation Summary */}
          {stats.remediation.total > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.0 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <IconShield className="h-5 w-5" />
                        Remediation Actions
                      </CardTitle>
                      <CardDescription>
                        Your active security remediation tasks
                      </CardDescription>
                    </div>
                    <Link href="/dashboard/remediation">
                      <Button variant="outline" size="sm" className="gap-2">
                        Manage
                        <IconArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="text-center p-3 rounded-lg border bg-card">
                      <p className="text-2xl font-bold">
                        {stats.remediation.total}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Total
                      </p>
                    </div>
                    <div className="text-center p-3 rounded-lg border bg-card">
                      <p className="text-2xl font-bold text-yellow-500">
                        {stats.remediation.pending}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Pending
                      </p>
                    </div>
                    <div className="text-center p-3 rounded-lg border bg-card">
                      <p className="text-2xl font-bold text-blue-500">
                        {stats.remediation.inProgress}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        In Progress
                      </p>
                    </div>
                    <div className="text-center p-3 rounded-lg border bg-card">
                      <p className="text-2xl font-bold text-green-500">
                        {stats.remediation.completed}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Completed
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.1 }}
          >
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconSparkles className="h-5 w-5 text-primary" />
                  Quick Actions
                </CardTitle>
                <CardDescription>Common tasks and shortcuts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <Link href="/dashboard/search">
                    <HoverBorderGradient
                      containerClassName="w-full"
                      className="w-full h-auto py-6 flex flex-col gap-3 items-center justify-center"
                      as="div"
                    >
                      <div className="rounded-full bg-primary/10 p-3">
                        <IconSearch className="h-6 w-6 text-primary" />
                      </div>
                      <span className="font-semibold">Search Breaches</span>
                      <span className="text-xs text-muted-foreground text-center">
                        Find compromised data
                      </span>
                    </HoverBorderGradient>
                  </Link>
                  <Link href="/dashboard/team">
                    <HoverBorderGradient
                      containerClassName="w-full"
                      className="w-full h-auto py-6 flex flex-col gap-3 items-center justify-center"
                      as="div"
                    >
                      <div className="rounded-full bg-primary/10 p-3">
                        <IconUsers className="h-6 w-6 text-primary" />
                      </div>
                      <span className="font-semibold">Invite Members</span>
                      <span className="text-xs text-muted-foreground text-center">
                        Grow your team
                      </span>
                    </HoverBorderGradient>
                  </Link>
                  <Link href="/dashboard/profile">
                    <HoverBorderGradient
                      containerClassName="w-full"
                      className="w-full h-auto py-6 flex flex-col gap-3 items-center justify-center"
                      as="div"
                    >
                      <div className="rounded-full bg-primary/10 p-3">
                        <IconShieldCheck className="h-6 w-6 text-primary" />
                      </div>
                      <span className="font-semibold">Update Profile</span>
                      <span className="text-xs text-muted-foreground text-center">
                        Manage your account
                      </span>
                    </HoverBorderGradient>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </div>
  );
}
