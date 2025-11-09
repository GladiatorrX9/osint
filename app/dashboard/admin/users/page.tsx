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
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import {
  IconUsers,
  IconBuilding,
  IconMail,
  IconRefresh,
  IconCrown,
  IconUser,
  IconChevronDown,
  IconChevronRight,
  IconTrendingUp,
} from "@tabler/icons-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
}

interface Organization {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  userCount: number;
  teamMemberCount: number;
  users: User[];
  subscription: {
    plan: string;
    status: string;
  } | null;
}

interface UsersData {
  organizations: Organization[];
  usersWithoutOrganization: User[];
  totalOrganizations: number;
  totalUsers: number;
}

export default function AdminUsersDashboard() {
  const [data, setData] = useState<UsersData>({
    organizations: [],
    usersWithoutOrganization: [],
    totalOrganizations: 0,
    totalUsers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [openOrgs, setOpenOrgs] = useState<Set<string>>(new Set());
  const router = useRouter();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/users");
      if (!response.ok) throw new Error("Failed to fetch users");

      const result = await response.json();
      setData(result);

      // Open first 3 organizations by default
      if (result.organizations.length > 0) {
        const firstThree = result.organizations
          .slice(0, 3)
          .map((org: Organization) => org.id);
        setOpenOrgs(new Set(firstThree));
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleOrg = (orgId: string) => {
    setOpenOrgs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(orgId)) {
        newSet.delete(orgId);
      } else {
        newSet.add(orgId);
      }
      return newSet;
    });
  };

  const getRoleBadge = (role: string) => {
    if (role === "ADMIN") {
      return (
        <Badge
          variant="outline"
          className="bg-purple-500/10 text-purple-500 border-purple-500/20"
        >
          <IconCrown className="w-3 h-3 mr-1" />
          Admin
        </Badge>
      );
    }
    return (
      <Badge
        variant="outline"
        className="bg-blue-500/10 text-blue-500 border-blue-500/20"
      >
        <IconUser className="w-3 h-3 mr-1" />
        User
      </Badge>
    );
  };

  const getSubscriptionBadge = (
    subscription: { plan: string; status: string } | null
  ) => {
    if (!subscription) {
      return (
        <Badge
          variant="outline"
          className="bg-gray-500/10 text-gray-500 border-gray-500/20 text-xs"
        >
          Free
        </Badge>
      );
    }

    const colorMap: Record<string, string> = {
      FREE: "bg-gray-500/10 text-gray-500 border-gray-500/20",
      BASIC: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      PRO: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      ENTERPRISE: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
    };

    return (
      <Badge
        variant="outline"
        className={`${colorMap[subscription.plan] || colorMap.FREE} text-xs`}
      >
        {subscription.plan}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">Track users and organizations</p>
        </div>
        <Button onClick={fetchUsers} variant="outline">
          <IconRefresh className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-linear-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <IconUsers className="w-4 h-4" />
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-cyan-500">
              {data.totalUsers}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <IconTrendingUp className="w-3 h-3" />
              Across all organizations
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
              {data.totalOrganizations}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Active organizations
            </p>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <IconUser className="w-4 h-4" />
              Unassigned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">
              {data.usersWithoutOrganization.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Without organization
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Organizations List - Showing top 5 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Organizations</CardTitle>
              <CardDescription>Top organizations by user count</CardDescription>
            </div>
            <Button
              onClick={() => router.push("/admin/users")}
              variant="outline"
              size="sm"
            >
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.organizations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No organizations found
              </div>
            ) : (
              data.organizations.slice(0, 5).map((org) => (
                <Collapsible
                  key={org.id}
                  open={openOrgs.has(org.id)}
                  onOpenChange={() => toggleOrg(org.id)}
                >
                  <Card className="border-muted hover:border-cyan-500/20 transition-colors">
                    <CollapsibleTrigger className="w-full">
                      <CardHeader className="hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {openOrgs.has(org.id) ? (
                              <IconChevronDown className="w-5 h-5 text-muted-foreground" />
                            ) : (
                              <IconChevronRight className="w-5 h-5 text-muted-foreground" />
                            )}
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                                <IconBuilding className="w-5 h-5 text-cyan-500" />
                              </div>
                              <div className="text-left">
                                <CardTitle className="text-base">
                                  {org.name}
                                </CardTitle>
                                <CardDescription className="text-xs">
                                  {org.userCount}{" "}
                                  {org.userCount === 1 ? "user" : "users"} •{" "}
                                  {org.teamMemberCount}{" "}
                                  {org.teamMemberCount === 1
                                    ? "member"
                                    : "members"}
                                </CardDescription>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getSubscriptionBadge(org.subscription)}
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(org.createdAt), {
                                addSuffix: true,
                              })}
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        <div className="rounded-md border mt-2">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Joined</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {org.users.length === 0 ? (
                                <TableRow>
                                  <TableCell
                                    colSpan={4}
                                    className="text-center py-4 text-muted-foreground text-sm"
                                  >
                                    No users in this organization
                                  </TableCell>
                                </TableRow>
                              ) : (
                                org.users.map((user) => (
                                  <TableRow key={user.id}>
                                    <TableCell className="font-medium text-sm">
                                      {user.name || "—"}
                                    </TableCell>
                                    <TableCell className="text-sm">
                                      <div className="flex items-center gap-2">
                                        <IconMail className="w-3 h-3 text-muted-foreground" />
                                        {user.email}
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      {getRoleBadge(user.role)}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-xs">
                                      {formatDistanceToNow(
                                        new Date(user.createdAt),
                                        {
                                          addSuffix: true,
                                        }
                                      )}
                                    </TableCell>
                                  </TableRow>
                                ))
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Unassigned Users */}
      {data.usersWithoutOrganization.length > 0 && (
        <Card className="border-yellow-500/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <IconUser className="w-5 h-5" />
              Unassigned Users
            </CardTitle>
            <CardDescription>
              {data.usersWithoutOrganization.length}{" "}
              {data.usersWithoutOrganization.length === 1 ? "user" : "users"}{" "}
              without organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.usersWithoutOrganization.slice(0, 5).map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium text-sm">
                        {user.name || "—"}
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="flex items-center gap-2">
                          <IconMail className="w-3 h-3 text-muted-foreground" />
                          {user.email}
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {formatDistanceToNow(new Date(user.createdAt), {
                          addSuffix: true,
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
