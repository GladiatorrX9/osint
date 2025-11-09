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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  IconMail,
  IconSend,
  IconUserPlus,
  IconCheck,
  IconRefresh,
} from "@tabler/icons-react";
import { Checkbox } from "@/components/ui/checkbox";

interface WaitlistEntry {
  id: string;
  name: string;
  email: string;
  company: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
}

const EMAIL_TEMPLATES = {
  approval: {
    subject: "Welcome to GladiatorRX - Your Application Has Been Approved!",
    body: `Hello {{name}},

Great news! Your application to join GladiatorRX has been approved.

We're excited to have you join our cybersecurity intelligence platform. You can now register and start protecting your organization's data.

Get started by creating your account here: [Registration Link]

If you have any questions, feel free to reach out to our support team.

Best regards,
The GladiatorRX Team`,
  },
  rejection: {
    subject: "Update on Your GladiatorRX Application",
    body: `Hello {{name}},

Thank you for your interest in GladiatorRX.

After careful consideration, we're unable to approve your application at this time. This decision was based on our current capacity and focus areas.

We appreciate your interest and encourage you to reapply in the future as we expand our platform.

Best regards,
The GladiatorRX Team`,
  },
  custom: {
    subject: "",
    body: "",
  },
};

export default function AdminEmailsPage() {
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [template, setTemplate] =
    useState<keyof typeof EMAIL_TEMPLATES>("custom");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const { toast } = useToast();

  const fetchWaitlist = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/waitlist");
      if (!response.ok) throw new Error("Failed to fetch waitlist");

      const data = await response.json();
      setWaitlist(data.waitlist);
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

  const selectAll = () => {
    if (selectedUsers.size === waitlist.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(waitlist.map((u) => u.id)));
    }
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

      // Send emails sequentially
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
            console.error(`Failed to send to ${recipient.email}`);
          }
        } catch (error) {
          failCount++;
          console.error(`Error sending to ${recipient.email}:`, error);
        }
      }

      toast({
        title: "Emails Sent",
        description: `Successfully sent ${successCount} email(s). ${
          failCount > 0 ? `Failed: ${failCount}` : ""
        }`,
      });

      // Reset form
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconMail className="w-5 h-5" />
            Send Custom Emails
          </CardTitle>
          <CardDescription>
            Send personalized emails to waitlisted users
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Template Selection */}
          <div className="space-y-2">
            <Label>Email Template</Label>
            <div className="flex gap-2">
              <Button
                variant={template === "approval" ? "default" : "outline"}
                onClick={() => handleTemplateChange("approval")}
                className="flex-1"
              >
                <IconCheck className="w-4 h-4 mr-2" />
                Approval
              </Button>
              <Button
                variant={template === "rejection" ? "default" : "outline"}
                onClick={() => handleTemplateChange("rejection")}
                className="flex-1"
              >
                Rejection
              </Button>
              <Button
                variant={template === "custom" ? "default" : "outline"}
                onClick={() => handleTemplateChange("custom")}
                className="flex-1"
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
              rows={12}
              className="font-mono text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Recipients */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <IconUserPlus className="w-5 h-5" />
                Select Recipients
              </CardTitle>
              <CardDescription>
                {selectedUsers.size} of {waitlist.length} selected
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={selectAll} variant="outline" size="sm">
                {selectedUsers.size === waitlist.length
                  ? "Deselect All"
                  : "Select All"}
              </Button>
              <Button
                onClick={fetchWaitlist}
                variant="outline"
                size="sm"
                disabled={loading}
              >
                <IconRefresh className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {waitlist.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No waitlist users found
              </div>
            ) : (
              waitlist.map((entry) => (
                <div
                  key={entry.id}
                  className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                    selectedUsers.has(entry.id)
                      ? "bg-cyan-500/10 border-cyan-500/20"
                      : "border-muted hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <Checkbox
                      checked={selectedUsers.has(entry.id)}
                      onCheckedChange={() => toggleUser(entry.id)}
                    />
                    <div>
                      <div className="font-medium">{entry.name}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-3">
                        <span>{entry.email}</span>
                        {entry.company && (
                          <span className="text-xs">• {entry.company}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      entry.status === "PENDING"
                        ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                        : entry.status === "APPROVED"
                        ? "bg-green-500/10 text-green-500 border-green-500/20"
                        : "bg-red-500/10 text-red-500 border-red-500/20"
                    }
                  >
                    {entry.status}
                  </Badge>
                </div>
              ))
            )}
          </div>

          {waitlist.length > 0 && (
            <div className="mt-6 flex justify-end">
              <Button
                onClick={handleSend}
                disabled={sending || selectedUsers.size === 0}
                size="lg"
                className="bg-cyan-500 hover:bg-cyan-600"
              >
                <IconSend className="w-4 h-4 mr-2" />
                {sending
                  ? "Sending..."
                  : `Send to ${selectedUsers.size} recipient(s)`}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
