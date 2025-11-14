"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  IconPlus,
  IconShieldCheck,
  IconAlertTriangle,
  IconClock,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import { format } from "date-fns";

interface Organization {
  id: string;
  name: string;
  slug: string;
}

interface RemediationAction {
  id: string;
  organizationId: string | null;
  organization: Organization | null;
  leakId: string | null;
  affectedEmail: string | null;
  affectedDomain: string | null;
  actionType: string;
  status: string;
  priority: string;
  description: string;
  steps: any;
  assignedTo: string | null;
  completedAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function RemediationPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [actions, setActions] = useState<RemediationAction[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<RemediationAction | null>(
    null
  );
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [formData, setFormData] = useState({
    organizationId: "all", // "all" means "All Organizations"
    affectedEmail: "",
    affectedDomain: "",
    actionType: "PASSWORD_RESET",
    priority: "MEDIUM",
    description: "",
  });
  const [editFormData, setEditFormData] = useState({
    organizationId: "all",
    affectedEmail: "",
    affectedDomain: "",
    actionType: "PASSWORD_RESET",
    priority: "MEDIUM",
    description: "",
  });

  // Check if user is admin
  const isAdmin = session?.user?.email === "admin@gladiatorrx.com";

  const fetchOrganizations = async () => {
    try {
      const response = await fetch("/api/admin/organizations");
      if (response.ok) {
        const data = await response.json();
        setOrganizations(data.organizations);
      }
    } catch (error) {
      console.error("Error fetching organizations:", error);
    }
  };

  const fetchActions = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
      });

      if (statusFilter && statusFilter !== "all")
        params.append("status", statusFilter);
      if (priorityFilter && priorityFilter !== "all")
        params.append("priority", priorityFilter);

      // Use different API endpoint based on user role
      const endpoint = isAdmin ? "/api/remediation" : "/api/user/remediation";
      const response = await fetch(`${endpoint}?${params}`);

      if (response.ok) {
        const data = await response.json();
        setActions(data.actions);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Error fetching remediation actions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchOrganizations();
    }
    fetchActions();
  }, [statusFilter, priorityFilter, isAdmin]);

  const handleCreateAction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Convert "all" to null for API
      const submitData = {
        ...formData,
        organizationId:
          formData.organizationId === "all" ? null : formData.organizationId,
      };

      const response = await fetch("/api/remediation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        setIsCreateDialogOpen(false);
        setFormData({
          organizationId: "all",
          affectedEmail: "",
          affectedDomain: "",
          actionType: "PASSWORD_RESET",
          priority: "MEDIUM",
          description: "",
        });
        fetchActions();
      }
    } catch (error) {
      console.error("Error creating remediation action:", error);
    }
  };

  const openEditDialog = (action: RemediationAction) => {
    setEditingAction(action);
    setEditFormData({
      organizationId: action.organizationId || "all",
      affectedEmail: action.affectedEmail || "",
      affectedDomain: action.affectedDomain || "",
      actionType: action.actionType,
      priority: action.priority,
      description: action.description,
    });
    setIsEditDialogOpen(true);
  };

  const handleEditAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAction) return;

    try {
      const submitData = {
        id: editingAction.id,
        organizationId:
          editFormData.organizationId === "all"
            ? null
            : editFormData.organizationId,
        affectedEmail: editFormData.affectedEmail || null,
        affectedDomain: editFormData.affectedDomain || null,
        actionType: editFormData.actionType,
        priority: editFormData.priority,
        description: editFormData.description,
      };

      const response = await fetch("/api/remediation", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        setIsEditDialogOpen(false);
        setEditingAction(null);
        fetchActions();
      } else {
        alert("Failed to update action");
      }
    } catch (error) {
      console.error("Error updating remediation action:", error);
      alert("Failed to update action");
    }
  };

  const updateActionStatus = async (id: string, newStatus: string) => {
    try {
      // Use different API endpoint based on user role
      const endpoint = isAdmin ? "/api/remediation" : "/api/user/remediation";
      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (response.ok) {
        fetchActions();
      }
    } catch (error) {
      console.error("Error updating action:", error);
    }
  };

  const deleteAction = async (id: string) => {
    if (!confirm("Are you sure you want to delete this remediation action?")) {
      return;
    }

    try {
      const response = await fetch(`/api/remediation?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchActions();
      } else {
        alert("Failed to delete action");
      }
    } catch (error) {
      console.error("Error deleting action:", error);
      alert("Failed to delete action");
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, { bg: string; icon: any }> = {
      PENDING: {
        bg: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
        icon: IconClock,
      },
      IN_PROGRESS: {
        bg: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        icon: IconClock,
      },
      COMPLETED: {
        bg: "bg-green-500/10 text-green-500 border-green-500/20",
        icon: IconCheck,
      },
      FAILED: {
        bg: "bg-red-500/10 text-red-500 border-red-500/20",
        icon: IconX,
      },
    };

    const config = colors[status] || colors.PENDING;
    const Icon = config.icon;

    return (
      <Badge variant="outline" className={config.bg}>
        <Icon className="h-3 w-3 mr-1" />
        {status.replace("_", " ")}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      LOW: "bg-gray-500/10 text-gray-500 border-gray-500/20",
      MEDIUM: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      HIGH: "bg-orange-500/10 text-orange-500 border-orange-500/20",
      CRITICAL: "bg-red-500/10 text-red-500 border-red-500/20",
    };

    return (
      <Badge variant="outline" className={colors[priority] || colors.MEDIUM}>
        {priority}
      </Badge>
    );
  };

  const getActionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      PASSWORD_RESET: "Password Reset",
      ACCOUNT_DISABLED: "Account Disabled",
      NOTIFICATION_SENT: "Notification Sent",
      CREDENTIAL_ROTATED: "Credential Rotated",
    };
    return labels[type] || type;
  };

  const stats = {
    total: pagination.total,
    pending: actions.filter((a) => a.status === "PENDING").length,
    inProgress: actions.filter((a) => a.status === "IN_PROGRESS").length,
    completed: actions.filter((a) => a.status === "COMPLETED").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Remediation Actions</h1>
          <p className="text-muted-foreground mt-1">
            {isAdmin
              ? "Create and manage remediation tasks for organizations"
              : "View and complete remediation tasks assigned to your organization"}
          </p>
        </div>
        {isAdmin && (
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button className="gap-2">
                <IconPlus className="h-4 w-4" />
                New Action
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleCreateAction}>
                <DialogHeader>
                  <DialogTitle>Create Remediation Action</DialogTitle>
                  <DialogDescription>
                    Create a new remediation task for a security breach or leak
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="organization">Target Organization</Label>
                    <Select
                      value={formData.organizationId}
                      onValueChange={(value) =>
                        setFormData({ ...formData, organizationId: value })
                      }
                    >
                      <SelectTrigger id="organization">
                        <SelectValue placeholder="Select organization" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Organizations</SelectItem>
                        {organizations.map((org) => (
                          <SelectItem key={org.id} value={org.id}>
                            {org.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Select a specific organization or leave as "All
                      Organizations" to apply to everyone
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="affectedEmail">Affected Email</Label>
                    <Input
                      id="affectedEmail"
                      value={formData.affectedEmail}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          affectedEmail: e.target.value,
                        })
                      }
                      placeholder="user@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="affectedDomain">Affected Domain</Label>
                    <Input
                      id="affectedDomain"
                      value={formData.affectedDomain}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          affectedDomain: e.target.value,
                        })
                      }
                      placeholder="example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="actionType">Action Type</Label>
                    <Select
                      value={formData.actionType}
                      onValueChange={(value) =>
                        setFormData({ ...formData, actionType: value })
                      }
                    >
                      <SelectTrigger id="actionType">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PASSWORD_RESET">
                          Password Reset
                        </SelectItem>
                        <SelectItem value="ACCOUNT_DISABLED">
                          Account Disabled
                        </SelectItem>
                        <SelectItem value="NOTIFICATION_SENT">
                          Notification Sent
                        </SelectItem>
                        <SelectItem value="CREDENTIAL_ROTATED">
                          Credential Rotated
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value) =>
                        setFormData({ ...formData, priority: value })
                      }
                    >
                      <SelectTrigger id="priority">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW">Low</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                        <SelectItem value="CRITICAL">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Describe the remediation action..."
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Create Action</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Edit Dialog */}
      {isAdmin && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <form onSubmit={handleEditAction}>
              <DialogHeader>
                <DialogTitle>Edit Remediation Action</DialogTitle>
                <DialogDescription>
                  Update the remediation task details
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-organization">Target Organization</Label>
                  <Select
                    value={editFormData.organizationId}
                    onValueChange={(value) =>
                      setEditFormData({
                        ...editFormData,
                        organizationId: value,
                      })
                    }
                  >
                    <SelectTrigger id="edit-organization">
                      <SelectValue placeholder="Select organization" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Organizations</SelectItem>
                      {organizations.map((org) => (
                        <SelectItem key={org.id} value={org.id}>
                          {org.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-affectedEmail">Affected Email</Label>
                  <Input
                    id="edit-affectedEmail"
                    value={editFormData.affectedEmail}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        affectedEmail: e.target.value,
                      })
                    }
                    placeholder="user@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-affectedDomain">Affected Domain</Label>
                  <Input
                    id="edit-affectedDomain"
                    value={editFormData.affectedDomain}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        affectedDomain: e.target.value,
                      })
                    }
                    placeholder="example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-actionType">Action Type</Label>
                  <Select
                    value={editFormData.actionType}
                    onValueChange={(value) =>
                      setEditFormData({ ...editFormData, actionType: value })
                    }
                  >
                    <SelectTrigger id="edit-actionType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PASSWORD_RESET">
                        Password Reset
                      </SelectItem>
                      <SelectItem value="ACCOUNT_DISABLED">
                        Account Disabled
                      </SelectItem>
                      <SelectItem value="NOTIFICATION_SENT">
                        Notification Sent
                      </SelectItem>
                      <SelectItem value="CREDENTIAL_ROTATED">
                        Credential Rotated
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-priority">Priority</Label>
                  <Select
                    value={editFormData.priority}
                    onValueChange={(value) =>
                      setEditFormData({ ...editFormData, priority: value })
                    }
                  >
                    <SelectTrigger id="edit-priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="CRITICAL">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={editFormData.description}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        description: e.target.value,
                      })
                    }
                    placeholder="Describe the remediation action..."
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Update Action</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Actions</CardTitle>
            <IconShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <IconClock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <IconAlertTriangle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <IconCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Actions</CardTitle>
              <CardDescription>
                Manage and track remediation tasks
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="CRITICAL">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : actions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <IconShieldCheck className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-1">
                No remediation actions
              </h3>
              <p className="text-muted-foreground mb-4">
                {isAdmin
                  ? "Create your first action to get started"
                  : "No pending tasks for your organization at this time"}
              </p>
              {isAdmin && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <IconPlus className="h-4 w-4 mr-2" />
                  New Action
                </Button>
              )}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Created</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Affected</TableHead>
                    <TableHead>Action Type</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {actions.map((action) => (
                    <TableRow key={action.id}>
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(action.createdAt), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell>
                        {action.organization ? (
                          <Badge variant="outline" className="font-normal">
                            {action.organization.name}
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="font-normal">
                            All Organizations
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {action.affectedEmail && (
                            <span className="text-sm font-mono">
                              {action.affectedEmail}
                            </span>
                          )}
                          {action.affectedDomain && (
                            <span className="text-xs text-muted-foreground">
                              {action.affectedDomain}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getActionTypeLabel(action.actionType)}
                      </TableCell>
                      <TableCell>{getPriorityBadge(action.priority)}</TableCell>
                      <TableCell>{getStatusBadge(action.status)}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {action.description}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {isAdmin ? (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openEditDialog(action)}
                              >
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => deleteAction(action.id)}
                              >
                                Delete
                              </Button>
                            </>
                          ) : (
                            <>
                              {action.status === "PENDING" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    updateActionStatus(action.id, "IN_PROGRESS")
                                  }
                                >
                                  Start
                                </Button>
                              )}
                              {action.status === "IN_PROGRESS" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    updateActionStatus(action.id, "COMPLETED")
                                  }
                                >
                                  Complete
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchActions(pagination.page - 1)}
                    disabled={pagination.page === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchActions(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
