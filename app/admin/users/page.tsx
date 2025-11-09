"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import {
  IconUsers,
  IconBuilding,
  IconMail,
  IconRefresh,
  IconChevronDown,
  IconChevronRight,
  IconCrown,
  IconUser,
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
  updatedAt: string;
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

export default function AdminUsersPage() {
  const [data, setData] = useState<UsersData>({
    organizations: [],
    usersWithoutOrganization: [],
    totalOrganizations: 0,
    totalUsers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [openOrgs, setOpenOrgs] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/users");
      if (!response.ok) throw new Error("Failed to fetch users");

      const result = await response.json();
      setData(result);

      // Open first organization by default
      if (result.organizations.length > 0) {
        setOpenOrgs(new Set([result.organizations[0].id]));
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load users data",
      });
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
          className="bg-gray-500/10 text-gray-500 border-gray-500/20"
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
        className={colorMap[subscription.plan] || colorMap.FREE}
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
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-linear-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cyan-500">
              {data.totalUsers}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Organizations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-500">
              {data.totalOrganizations}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Unassigned Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {data.usersWithoutOrganization.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Organizations List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <IconBuilding className="w-5 h-5" />
                Organizations & Users
              </CardTitle>
              <CardDescription>
                All registered users organized by their organizations
              </CardDescription>
            </div>
            <Button
              onClick={fetchUsers}
              variant="outline"
              size="sm"
              disabled={loading}
            >
              <IconRefresh className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.organizations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No organizations found
              </div>
            ) : (
              data.organizations.map((org) => (
                <Collapsible
                  key={org.id}
                  open={openOrgs.has(org.id)}
                  onOpenChange={() => toggleOrg(org.id)}
                >
                  <Card className="border-muted">
                    <CollapsibleTrigger className="w-full">
                      <CardHeader className="hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            {openOrgs.has(org.id) ? (
                              <IconChevronDown className="w-5 h-5 text-muted-foreground" />
                            ) : (
                              <IconChevronRight className="w-5 h-5 text-muted-foreground" />
                            )}
                            <div className="text-left">
                              <CardTitle className="text-lg">
                                {org.name}
                              </CardTitle>
                              <CardDescription className="flex items-center gap-3 mt-1">
                                <span className="flex items-center gap-1">
                                  <IconUsers className="w-4 h-4" />
                                  {org.userCount}{" "}
                                  {org.userCount === 1 ? "user" : "users"}
                                </span>
                                <span className="flex items-center gap-1">
                                  <IconUser className="w-4 h-4" />
                                  {org.teamMemberCount}{" "}
                                  {org.teamMemberCount === 1
                                    ? "member"
                                    : "members"}
                                </span>
                                <span className="text-xs">
                                  Created{" "}
                                  {formatDistanceToNow(
                                    new Date(org.createdAt),
                                    { addSuffix: true }
                                  )}
                                </span>
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getSubscriptionBadge(org.subscription)}
                          </div>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="pt-0">
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
                              {org.users.length === 0 ? (
                                <TableRow>
                                  <TableCell
                                    colSpan={4}
                                    className="text-center py-4 text-muted-foreground"
                                  >
                                    No users in this organization
                                  </TableCell>
                                </TableRow>
                              ) : (
                                org.users.map((user) => (
                                  <TableRow key={user.id}>
                                    <TableCell className="font-medium">
                                      {user.name || "—"}
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-2">
                                        <IconMail className="w-4 h-4 text-muted-foreground" />
                                        {user.email}
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      {getRoleBadge(user.role)}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
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

            {/* Users without organization */}
            {data.usersWithoutOrganization.length > 0 && (
              <Card className="border-yellow-500/20">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <IconUsers className="w-5 h-5" />
                    Users Without Organization
                  </CardTitle>
                  <CardDescription>
                    {data.usersWithoutOrganization.length}{" "}
                    {data.usersWithoutOrganization.length === 1
                      ? "user"
                      : "users"}{" "}
                    not assigned to any organization
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
                        {data.usersWithoutOrganization.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">
                              {user.name || "—"}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <IconMail className="w-4 h-4 text-muted-foreground" />
                                {user.email}
                              </div>
                            </TableCell>
                            <TableCell>{getRoleBadge(user.role)}</TableCell>
                            <TableCell className="text-muted-foreground">
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
        </CardContent>
      </Card>
    </div>
  );
}
