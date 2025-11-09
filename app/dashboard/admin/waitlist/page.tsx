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
  IconUserPlus,
  IconClock,
  IconCheck,
  IconX,
  IconRefresh,
  IconMail,
  IconBuilding,
  IconTrendingUp,
  IconTrendingDown,
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

interface WaitlistEntry {
  id: string;
  name: string;
  email: string;
  company: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
}

interface WaitlistStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export default function AdminWaitlistDashboard() {
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [stats, setStats] = useState<WaitlistStats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    entry: WaitlistEntry | null;
    action: "APPROVED" | "REJECTED" | null;
  }>({
    open: false,
    entry: null,
    action: null,
  });
  const { toast } = useToast();
  const router = useRouter();

  const fetchWaitlist = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/waitlist");
      if (!response.ok) throw new Error("Failed to fetch waitlist");

      const data = await response.json();
      setWaitlist(data.waitlist.slice(0, 10)); // Show latest 10
      setStats(data.stats);
    } catch (error) {
      console.error("Error fetching waitlist:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load waitlist data",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWaitlist();
  }, []);

  const handleStatusUpdate = async (
    id: string,
    status: "APPROVED" | "REJECTED"
  ) => {
    try {
      setActionLoading(id);
      const response = await fetch("/api/admin/waitlist", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });

      if (!response.ok) throw new Error("Failed to update status");

      toast({
        title: "Success",
        description: `Application ${status.toLowerCase()} successfully`,
      });

      await fetchWaitlist();
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update application status",
      });
    } finally {
      setActionLoading(null);
      setConfirmDialog({ open: false, entry: null, action: null });
    }
  };

  const openConfirmDialog = (
    entry: WaitlistEntry,
    action: "APPROVED" | "REJECTED"
  ) => {
    setConfirmDialog({ open: true, entry, action });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
          >
            <IconClock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "APPROVED":
        return (
          <Badge
            variant="outline"
            className="bg-green-500/10 text-green-500 border-green-500/20"
          >
            <IconCheck className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge
            variant="outline"
            className="bg-red-500/10 text-red-500 border-red-500/20"
          >
            <IconX className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  const approvalRate =
    stats.total > 0 ? ((stats.approved / stats.total) * 100).toFixed(1) : "0.0";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading waitlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Waitlist Management
          </h1>
          <p className="text-muted-foreground">
            Track and manage user applications
          </p>
        </div>
        <Button onClick={fetchWaitlist} variant="outline">
          <IconRefresh className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-linear-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <IconUserPlus className="w-4 h-4" />
              Total Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-cyan-500">
              {stats.total}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              All time submissions
            </p>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <IconClock className="w-4 h-4" />
              Pending Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-500">
              {stats.pending}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Awaiting action
            </p>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <IconCheck className="w-4 h-4" />
              Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">
              {stats.approved}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <IconTrendingUp className="w-3 h-3" />
              {approvalRate}% approval rate
            </p>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-red-500/10 to-pink-500/10 border-red-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <IconX className="w-4 h-4" />
              Rejected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">
              {stats.rejected}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Declined applications
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Applications */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Applications</CardTitle>
              <CardDescription>Latest 10 waitlist submissions</CardDescription>
            </div>
            <Button
              onClick={() => router.push("/admin/waitlist")}
              variant="outline"
              size="sm"
            >
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applied</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {waitlist.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No waitlist applications found
                    </TableCell>
                  </TableRow>
                ) : (
                  waitlist.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">
                        {entry.name}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <IconMail className="w-4 h-4 text-muted-foreground" />
                          {entry.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        {entry.company ? (
                          <div className="flex items-center gap-2">
                            <IconBuilding className="w-4 h-4 text-muted-foreground" />
                            {entry.company}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(entry.status)}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDistanceToNow(new Date(entry.createdAt), {
                          addSuffix: true,
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        {entry.status === "PENDING" ? (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 text-green-500 hover:text-green-600 hover:bg-green-500/10"
                              onClick={() =>
                                openConfirmDialog(entry, "APPROVED")
                              }
                              disabled={actionLoading === entry.id}
                            >
                              <IconCheck className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                              onClick={() =>
                                openConfirmDialog(entry, "REJECTED")
                              }
                              disabled={actionLoading === entry.id}
                            >
                              <IconX className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">
                            {entry.status.toLowerCase()}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog
        open={confirmDialog.open}
        onOpenChange={(open) =>
          !open && setConfirmDialog({ open: false, entry: null, action: null })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.action === "APPROVED" ? "Approve" : "Reject"}{" "}
              Application
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {confirmDialog.action?.toLowerCase()} the
              application from <strong>{confirmDialog.entry?.name}</strong> (
              {confirmDialog.entry?.email})?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                confirmDialog.entry &&
                confirmDialog.action &&
                handleStatusUpdate(confirmDialog.entry.id, confirmDialog.action)
              }
              className={
                confirmDialog.action === "APPROVED"
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-red-500 hover:bg-red-600"
              }
            >
              {confirmDialog.action === "APPROVED" ? "Approve" : "Reject"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
