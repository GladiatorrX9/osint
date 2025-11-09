"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  IconUserPlus,
  IconMail,
  IconDotsVertical,
  IconEdit,
  IconTrash,
  IconShield,
  IconUsers,
  IconLoader2,
  IconAlertCircle,
} from "@tabler/icons-react";

interface TeamMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: string;
  status: string;
  joinedAt: string;
}

export default function TeamPage() {
  const { data: session } = useSession();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("MEMBER");
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);
  const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(null);
  const [removing, setRemoving] = useState(false);

  const [needsOrganization, setNeedsOrganization] = useState(false);
  const [organizationName, setOrganizationName] = useState("");
  const [settingUpOrg, setSettingUpOrg] = useState(false);

  // Fetch team members
  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/team/members");

      const data = await response.json();

      // Check if user needs to set up organization
      if (data.members && data.members.length === 0 && data.message) {
        setNeedsOrganization(true);
        setTeamMembers([]);
      } else if (!response.ok) {
        throw new Error(data.error || "Failed to fetch team members");
      } else {
        setTeamMembers(data.members || []);
        setNeedsOrganization(false);
      }
    } catch (err) {
      console.error("Error fetching team members:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch team members"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSetupOrganization = async () => {
    if (!organizationName.trim()) {
      setInviteError("Please enter an organization name");
      return;
    }

    setSettingUpOrg(true);
    setError(null);

    try {
      const response = await fetch("/api/organization/setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          organizationName: organizationName.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to set up organization");
      }

      // Refresh team members after organization setup
      await fetchTeamMembers();
      setNeedsOrganization(false);
      setOrganizationName("");
    } catch (err) {
      console.error("Error setting up organization:", err);
      setError(
        err instanceof Error ? err.message : "Failed to set up organization"
      );
    } finally {
      setSettingUpOrg(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail) {
      setInviteError("Please enter an email address");
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail)) {
      setInviteError("Please enter a valid email address");
      return;
    }

    setInviting(true);
    setInviteError(null);
    setInviteSuccess(null);

    try {
      const response = await fetch("/api/team/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Show detailed error message including email configuration issues
        const errorMessage = data.details
          ? `${data.error}\n\n${data.details}`
          : data.error || "Failed to send invitation";
        throw new Error(errorMessage);
      }

      setInviteSuccess(`Invitation sent to ${inviteEmail}!`);
      setInviteEmail("");
      setInviteRole("MEMBER");

      // Close dialog after a brief delay
      setTimeout(() => {
        setIsInviteDialogOpen(false);
        setInviteSuccess(null);
      }, 2000);

      // Refresh team members list
      await fetchTeamMembers();
    } catch (err) {
      console.error("Error sending invitation:", err);
      setInviteError(
        err instanceof Error ? err.message : "Failed to send invitation"
      );
    } finally {
      setInviting(false);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: string) => {
    try {
      const response = await fetch("/api/team/members", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          memberId,
          role: newRole,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update role");
      }

      // Update local state
      setTeamMembers((prev) =>
        prev.map((member) =>
          member.id === memberId ? { ...member, role: newRole } : member
        )
      );
    } catch (err) {
      console.error("Error updating role:", err);
      alert(err instanceof Error ? err.message : "Failed to update role");
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;

    setRemoving(true);

    try {
      const response = await fetch(
        `/api/team/members?memberId=${memberToRemove.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to remove member");
      }

      // Update local state
      setTeamMembers((prev) => prev.filter((m) => m.id !== memberToRemove.id));
      setMemberToRemove(null);
    } catch (err) {
      console.error("Error removing member:", err);
      alert(err instanceof Error ? err.message : "Failed to remove member");
    } finally {
      setRemoving(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role.toUpperCase()) {
      case "OWNER":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "ADMIN":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "MEMBER":
        return "bg-cyan-500/10 text-cyan-500 border-cyan-500/20";
      case "VIEWER":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "ACTIVE":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "PENDING":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "INACTIVE":
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const currentUserMembership = teamMembers.find(
    (m) => m.email === session?.user?.email
  );
  const canInvite =
    currentUserMembership?.role === "OWNER" ||
    currentUserMembership?.role === "ADMIN";
  const canModifyMembers = canInvite;

  if (loading) {
    return (
      <div className="container mx-auto flex min-h-[600px] max-w-7xl items-center justify-center p-8">
        <div className="text-center">
          <IconLoader2 className="mx-auto h-12 w-12 animate-spin text-cyan-500" />
          <p className="mt-4 text-muted-foreground">Loading team members...</p>
        </div>
      </div>
    );
  }

  if (error && !needsOrganization) {
    return (
      <div className="container mx-auto max-w-7xl space-y-6 p-8">
        <Alert variant="destructive">
          <IconAlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={fetchTeamMembers}>Retry</Button>
      </div>
    );
  }

  // Show organization setup if needed
  if (needsOrganization) {
    return (
      <div className="container mx-auto flex min-h-[600px] max-w-2xl items-center justify-center p-8">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl">Set Up Your Organization</CardTitle>
            <CardDescription>
              Create your organization to start inviting team members and
              collaborating.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <IconAlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="orgName">Organization Name</Label>
              <Input
                id="orgName"
                type="text"
                placeholder="e.g., Acme Corporation"
                value={organizationName}
                onChange={(e) => {
                  setOrganizationName(e.target.value);
                  setError(null);
                }}
                disabled={settingUpOrg}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSetupOrganization();
                  }
                }}
              />
              <p className="text-xs text-muted-foreground">
                This will be visible to your team members and in invitations.
              </p>
            </div>
            <Button
              onClick={handleSetupOrganization}
              disabled={settingUpOrg || !organizationName.trim()}
              className="w-full"
            >
              {settingUpOrg ? (
                <>
                  <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Organization...
                </>
              ) : (
                <>
                  <IconUsers className="mr-2 h-4 w-4" />
                  Create Organization
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl space-y-6 p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-bold text-foreground">
            Team Management
          </h1>
          <p className="mt-2 text-muted-foreground">
            Manage your team members and their access levels
          </p>
        </div>
        <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" disabled={!canInvite}>
              <IconUserPlus className="h-4 w-4" />
              Invite Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
              <DialogDescription>
                Send an invitation to join your organization
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {inviteError && (
                <Alert variant="destructive">
                  <IconAlertCircle className="h-4 w-4" />
                  <AlertDescription>{inviteError}</AlertDescription>
                </Alert>
              )}
              {inviteSuccess && (
                <Alert className="border-green-500/20 bg-green-500/10 text-green-500">
                  <IconMail className="h-4 w-4" />
                  <AlertDescription>{inviteSuccess}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="colleague@example.com"
                  value={inviteEmail}
                  onChange={(e) => {
                    setInviteEmail(e.target.value);
                    setInviteError(null);
                  }}
                  disabled={inviting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={inviteRole}
                  onValueChange={setInviteRole}
                  disabled={inviting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currentUserMembership?.role === "OWNER" && (
                      <SelectItem value="OWNER">Owner</SelectItem>
                    )}
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="MEMBER">Member</SelectItem>
                    <SelectItem value="VIEWER">Viewer</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {inviteRole === "OWNER" &&
                    "Full access to everything including billing"}
                  {inviteRole === "ADMIN" &&
                    "Can invite users and manage members"}
                  {inviteRole === "MEMBER" && "Can view and download reports"}
                  {inviteRole === "VIEWER" && "Read-only access to data"}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsInviteDialogOpen(false);
                  setInviteError(null);
                  setInviteSuccess(null);
                }}
                disabled={inviting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleInvite}
                className="gap-2"
                disabled={inviting}
              >
                {inviting ? (
                  <>
                    <IconLoader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <IconMail className="h-4 w-4" />
                    Send Invitation
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Members</p>
                  <p className="mt-2 text-3xl font-bold text-foreground">
                    {teamMembers.length}
                  </p>
                </div>
                <div className="rounded-full bg-cyan-500/10 p-3">
                  <IconUsers className="h-6 w-6 text-cyan-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="mt-2 text-3xl font-bold text-green-500">
                    {
                      teamMembers.filter(
                        (m) => m.status.toUpperCase() === "ACTIVE"
                      ).length
                    }
                  </p>
                </div>
                <div className="rounded-full bg-green-500/10 p-3">
                  <IconShield className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="mt-2 text-3xl font-bold text-yellow-500">
                    {
                      teamMembers.filter(
                        (m) => m.status.toUpperCase() === "PENDING"
                      ).length
                    }
                  </p>
                </div>
                <div className="rounded-full bg-yellow-500/10 p-3">
                  <IconMail className="h-6 w-6 text-yellow-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Team Members Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>
              A list of all team members including their role and status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamMembers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="rounded-full bg-cyan-500/10 p-4">
                          <IconUsers className="h-8 w-8 text-cyan-500" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            No team members yet
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Start building your team by inviting members
                          </p>
                        </div>
                        {canInvite && (
                          <Button
                            size="sm"
                            className="mt-2"
                            onClick={() => setIsInviteDialogOpen(true)}
                          >
                            <IconUserPlus className="mr-2 h-4 w-4" />
                            Invite Team Member
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  teamMembers.map((member, index) => {
                    const initials = member.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase();
                    const isCurrentUser = member.email === session?.user?.email;
                    const canModifyThisMember =
                      canModifyMembers &&
                      !isCurrentUser &&
                      member.role !== "OWNER";

                    return (
                      <motion.tr
                        key={member.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                        className="group"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback className="bg-cyan-500/10 text-cyan-500">
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{member.name}</p>
                                {isCurrentUser && (
                                  <Badge variant="outline" className="text-xs">
                                    You
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {member.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={getRoleBadgeColor(member.role)}
                          >
                            {member.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={getStatusBadgeColor(member.status)}
                          >
                            {member.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(member.joinedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          {canModifyThisMember ? (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                >
                                  <IconDotsVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>
                                  Change Role
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {currentUserMembership?.role === "OWNER" && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleRoleChange(member.id, "ADMIN")
                                    }
                                  >
                                    <IconShield className="mr-2 h-4 w-4" />
                                    Make Admin
                                  </DropdownMenuItem>
                                )}
                                {member.role !== "MEMBER" && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleRoleChange(member.id, "MEMBER")
                                    }
                                  >
                                    <IconEdit className="mr-2 h-4 w-4" />
                                    Make Member
                                  </DropdownMenuItem>
                                )}
                                {member.role !== "VIEWER" && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleRoleChange(member.id, "VIEWER")
                                    }
                                  >
                                    <IconEdit className="mr-2 h-4 w-4" />
                                    Make Viewer
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => setMemberToRemove(member)}
                                  className="text-red-600"
                                >
                                  <IconTrash className="mr-2 h-4 w-4" />
                                  Remove Member
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              —
                            </span>
                          )}
                        </TableCell>
                      </motion.tr>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      {/* Remove Member Confirmation Dialog */}
      <AlertDialog
        open={!!memberToRemove}
        onOpenChange={(open) => !open && setMemberToRemove(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{" "}
              <strong>{memberToRemove?.name}</strong> ({memberToRemove?.email})
              from your organization? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              disabled={removing}
              className="bg-red-600 hover:bg-red-700"
            >
              {removing ? (
                <>
                  <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removing...
                </>
              ) : (
                <>
                  <IconTrash className="mr-2 h-4 w-4" />
                  Remove Member
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
