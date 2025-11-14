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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import {
  IconMail,
  IconSend,
  IconUserPlus,
  IconCheck,
  IconRefresh,
  IconClock,
  IconTrendingUp,
} from "@tabler/icons-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

interface WaitlistEntry {
  id: string;
  name: string;
  email: string;
  company: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
}

const EMAIL_TEMPLATES = {
  approval: {
    subject: "Welcome to GladiatorrX - Your Application Has Been Approved!",
    body: `Hello {{name}},

Great news! Your application to join GladiatorrX has been approved.

We're excited to have you join our cybersecurity intelligence platform. You can now register and start protecting your organization's data.

Get started by creating your account here: [Registration Link]

If you have any questions, feel free to reach out to our support team.

Best regards,
The GladiatorrX Team`,
  },
  rejection: {
    subject: "Update on Your GladiatorrX Application",
    body: `Hello {{name}},

Thank you for your interest in GladiatorrX.

After careful consideration, we're unable to approve your application at this time. This decision was based on our current capacity and focus areas.

We appreciate your interest and encourage you to reapply in the future as we expand our platform.

Best regards,
The GladiatorrX Team`,
  },
  custom: {
    subject: "",
    body: "",
  },
};

export default function AdminEmailsDashboard() {
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [template, setTemplate] =
    useState<keyof typeof EMAIL_TEMPLATES>("custom");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const { toast } = useToast();
  const router = useRouter();

  const fetchWaitlist = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/waitlist");
      if (!response.ok) throw new Error("Failed to fetch waitlist");

      const data = await response.json();
      setWaitlist(
        data.waitlist
          .filter((entry: WaitlistEntry) => entry.status === "PENDING")
          .slice(0, 5)
      );
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

  const handleTemplateChange = (templateKey: keyof typeof EMAIL_TEMPLATES) => {
    setTemplate(templateKey);
    const selectedTemplate = EMAIL_TEMPLATES[templateKey];
    setSubject(selectedTemplate.subject);
    setBody(selectedTemplate.body);
  };

  const toggleUser = (userId: string) => {
    setSelectedUsers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const handleSend = async () => {
    if (selectedUsers.size === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select at least one recipient",
      });
      return;
    }

    if (!subject.trim() || !body.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please provide both subject and message",
      });
      return;
    }

    try {
      setSending(true);

      const selectedEmails = waitlist
        .filter((entry) => selectedUsers.has(entry.id))
        .map((entry) => ({
          email: entry.email,
          name: entry.name,
        }));

      let successCount = 0;
      let failCount = 0;

      for (const recipient of selectedEmails) {
        try {
          const personalizedBody = body.replace(/{{name}}/g, recipient.name);

          const response = await fetch("/api/admin/send-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              to: recipient.email,
              subject,
              html: personalizedBody.replace(/\n/g, "<br>"),
              text: personalizedBody,
            }),
          });

          if (response.ok) {
            successCount++;
          } else {
            failCount++;
          }
        } catch (error) {
          failCount++;
        }
      }

      toast({
        title: "Emails Sent",
        description: `Successfully sent ${successCount} email(s). ${
          failCount > 0 ? `Failed: ${failCount}` : ""
        }`,
      });

      setSelectedUsers(new Set());
      setSubject("");
      setBody("");
      setTemplate("custom");
    } catch (error) {
      console.error("Error sending emails:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send emails",
      });
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Email Manager</h1>
          <p className="text-muted-foreground">
            Send emails to waitlist applicants
          </p>
        </div>
        <Button onClick={() => router.push("/admin/emails")} variant="outline">
          Full Email Manager
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-linear-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <IconMail className="w-4 h-4" />
              Pending Emails
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-cyan-500">
              {waitlist.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Awaiting response
            </p>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <IconCheck className="w-4 h-4" />
              Selected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">
              {selectedUsers.size}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Recipients selected
            </p>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <IconSend className="w-4 h-4" />
              Ready to Send
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-500">
              {selectedUsers.size > 0 && subject && body ? "Yes" : "No"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {selectedUsers.size > 0 && subject && body
                ? "Ready"
                : "Fill form"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Email Composer */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconMail className="w-5 h-5" />
              Compose Email
            </CardTitle>
            <CardDescription>Create and customize your message</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Template Selection */}
            <div className="space-y-2">
              <Label>Email Template</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={template === "approval" ? "default" : "outline"}
                  onClick={() => handleTemplateChange("approval")}
                  size="sm"
                >
                  <IconCheck className="w-4 h-4 mr-1" />
                  Approval
                </Button>
                <Button
                  variant={template === "rejection" ? "default" : "outline"}
                  onClick={() => handleTemplateChange("rejection")}
                  size="sm"
                >
                  Rejection
                </Button>
                <Button
                  variant={template === "custom" ? "default" : "outline"}
                  onClick={() => handleTemplateChange("custom")}
                  size="sm"
                >
                  Custom
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Use {"{{name}}"} to personalize with recipient&apos;s name
              </p>
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Email subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            {/* Message Body */}
            <div className="space-y-2">
              <Label htmlFor="body">Message</Label>
              <Textarea
                id="body"
                placeholder="Email message body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={8}
                className="font-mono text-sm"
              />
            </div>

            <Button
              onClick={handleSend}
              disabled={
                sending || selectedUsers.size === 0 || !subject || !body
              }
              className="w-full"
            >
              <IconSend className="w-4 h-4 mr-2" />
              {sending
                ? "Sending..."
                : `Send to ${selectedUsers.size} recipient(s)`}
            </Button>
          </CardContent>
        </Card>

        {/* Recipients */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconUserPlus className="w-5 h-5" />
              Select Recipients
            </CardTitle>
            <CardDescription>
              Choose waitlist users to email (showing latest 5)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {waitlist.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No pending waitlist users
                </div>
              ) : (
                <>
                  {waitlist.map((entry) => (
                    <div
                      key={entry.id}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                        selectedUsers.has(entry.id)
                          ? "bg-cyan-500/10 border-cyan-500/20"
                          : "border-muted hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={selectedUsers.has(entry.id)}
                          onCheckedChange={() => toggleUser(entry.id)}
                        />
                        <div>
                          <div className="font-medium text-sm">
                            {entry.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {entry.email}
                          </div>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 text-xs"
                      >
                        <IconClock className="w-3 h-3 mr-1" />
                        Pending
                      </Badge>
                    </div>
                  ))}
                  <Button
                    onClick={() => router.push("/admin/emails")}
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                  >
                    View All Waitlist Users
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
