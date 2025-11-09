"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Mail,
  Building2,
  User,
} from "lucide-react";

interface InvitationDetails {
  invitation: {
    id: string;
    email: string;
    role: string;
    status: string;
    expiresAt: string;
    organization: {
      id: string;
      name: string;
    };
    invitedBy: {
      name: string;
      email: string;
    };
  };
  userExists: boolean;
}

export default function AcceptInvitePage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form fields for new users
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    fetchInvitation();
  }, [token]);

  const fetchInvitation = async () => {
    try {
      const response = await fetch(`/api/team/invite/${token}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to fetch invitation");
        setLoading(false);
        return;
      }

      setInvitation(data);
      setLoading(false);
    } catch (err) {
      setError("Failed to load invitation details");
      setLoading(false);
    }
  };

  const handleAcceptInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation for new users
    if (!invitation?.userExists) {
      if (!name.trim()) {
        setError("Please enter your name");
        return;
      }
      if (password.length < 8) {
        setError("Password must be at least 8 characters long");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }
    }

    setSubmitting(true);

    try {
      const response = await fetch(`/api/team/invite/${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim() || undefined,
          password: password || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to accept invitation");
        setSubmitting(false);
        return;
      }

      setSuccess(true);

      // If new user was created, automatically sign them in
      if (!invitation?.userExists && password) {
        await signIn("credentials", {
          email: invitation?.invitation.email,
          password: password,
          redirect: false,
        });
      }

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (err) {
      setError("An error occurred while accepting the invitation");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-black via-black to-cyan-950">
        <Card className="w-full max-w-md border-cyan-500/20 bg-black/40 backdrop-blur-xl">
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && !invitation) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-black via-black to-cyan-950 p-4">
        <Card className="w-full max-w-md border-red-500/20 bg-black/40 backdrop-blur-xl">
          <CardHeader>
            <div className="mb-4 flex justify-center">
              <XCircle className="h-12 w-12 text-red-500" />
            </div>
            <CardTitle className="text-center text-white">
              Invalid Invitation
            </CardTitle>
            <CardDescription className="text-center">{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => router.push("/login")}
              className="w-full bg-cyan-500 hover:bg-cyan-600"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-black via-black to-cyan-950 p-4">
        <Card className="w-full max-w-md border-green-500/20 bg-black/40 backdrop-blur-xl">
          <CardHeader>
            <div className="mb-4 flex justify-center">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            </div>
            <CardTitle className="text-center text-white">
              Invitation Accepted!
            </CardTitle>
            <CardDescription className="text-center">
              You have successfully joined{" "}
              {invitation?.invitation.organization.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center text-sm text-gray-400">
            Redirecting to dashboard...
          </CardContent>
        </Card>
      </div>
    );
  }

  const inv = invitation?.invitation;
  if (!inv) return null;

  const isExpired = inv.status === "EXPIRED";
  const isUsed = inv.status !== "PENDING" && inv.status !== "EXPIRED";

  if (isExpired || isUsed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-black via-black to-cyan-950 p-4">
        <Card className="w-full max-w-md border-red-500/20 bg-black/40 backdrop-blur-xl">
          <CardHeader>
            <div className="mb-4 flex justify-center">
              <XCircle className="h-12 w-12 text-red-500" />
            </div>
            <CardTitle className="text-center text-white">
              {isExpired ? "Invitation Expired" : "Invitation Already Used"}
            </CardTitle>
            <CardDescription className="text-center">
              {isExpired
                ? "This invitation has expired. Please contact your administrator for a new invitation."
                : "This invitation has already been accepted."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => router.push("/login")}
              className="w-full bg-cyan-500 hover:bg-cyan-600"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-black via-black to-cyan-950 p-4">
      <Card className="w-full max-w-md border-cyan-500/20 bg-black/40 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl text-white">
            You're Invited!
          </CardTitle>
          <CardDescription className="text-center">
            Join your team on GladiatorRX
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Organization Info */}
          <div className="space-y-3 rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-cyan-500" />
              <div>
                <p className="text-sm text-gray-400">Organization</p>
                <p className="font-semibold text-white">
                  {inv.organization.name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-cyan-500" />
              <div>
                <p className="text-sm text-gray-400">Invited by</p>
                <p className="font-semibold text-white">{inv.invitedBy.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-cyan-500" />
              <div>
                <p className="text-sm text-gray-400">Email</p>
                <p className="font-semibold text-white">{inv.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <p className="text-sm text-gray-400">Role</p>
                <Badge className="mt-1 bg-cyan-500/20 text-cyan-500">
                  {inv.role}
                </Badge>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleAcceptInvitation} className="space-y-4">
            {!invitation.userExists && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="border-cyan-500/20 bg-black/60 text-white placeholder:text-gray-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password (min. 8 characters)"
                    className="border-cyan-500/20 bg-black/60 text-white placeholder:text-gray-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-white">
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="border-cyan-500/20 bg-black/60 text-white placeholder:text-gray-500"
                    required
                  />
                </div>
              </>
            )}

            {invitation.userExists && (
              <Alert className="border-cyan-500/20 bg-cyan-500/10">
                <AlertDescription className="text-sm text-cyan-100">
                  An account with this email already exists. Click accept to
                  join the organization.
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert className="border-red-500/20 bg-red-500/10">
                <AlertDescription className="text-sm text-red-200">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Accepting...
                </>
              ) : (
                "Accept Invitation"
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-gray-500">
            By accepting, you agree to join {inv.organization.name} and access
            their data.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
