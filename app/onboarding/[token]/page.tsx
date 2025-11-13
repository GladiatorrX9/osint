"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
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
import { Logo } from "@/components/logo";
import {
  IconLoader2,
  IconCheck,
  IconAlertCircle,
  IconBuilding,
  IconLock,
  IconUser,
  IconMail,
} from "@tabler/icons-react";

interface WaitlistData {
  email: string;
  name: string;
  company: string | null;
}

export default function OnboardingPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [waitlistData, setWaitlistData] = useState<WaitlistData | null>(null);

  const [formData, setFormData] = useState({
    organizationName: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    async function verifyToken() {
      try {
        const response = await fetch(`/api/onboarding/verify?token=${token}`);
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Invalid or expired onboarding link");
          setLoading(false);
          return;
        }

        setWaitlistData(data.waitlist);
        // Pre-fill organization name if provided during waitlist
        if (data.waitlist.company) {
          setFormData((prev) => ({
            ...prev,
            organizationName: data.waitlist.company,
          }));
        }
        setLoading(false);
      } catch (err) {
        console.error("Error verifying token:", err);
        setError("Failed to verify onboarding link");
        setLoading(false);
      }
    }

    if (token) {
      verifyToken();
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.organizationName.trim()) {
      setError("Organization name is required");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          organizationName: formData.organizationName,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to complete registration");
        setSubmitting(false);
        return;
      }

      // Success! Redirect to login
      router.push("/login?registered=true");
    } catch (err) {
      console.error("Error completing onboarding:", err);
      setError("Failed to complete registration. Please try again.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <IconLoader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Verifying your invitation...</p>
        </div>
      </div>
    );
  }

  if (error && !waitlistData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <Logo size="lg" />
            </div>
            <CardTitle className="text-2xl">Invalid Link</CardTitle>
            <CardDescription>
              This onboarding link is invalid or has expired
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <IconAlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button className="w-full" onClick={() => router.push("/register")}>
              Request New Access
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full"
      >
        <Card>
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto">
              <Logo size="lg" showText />
            </div>
            <div>
              <CardTitle className="text-3xl font-bold">
                Welcome to GladiatorRX!
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Complete your registration to get started
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {/* User Info Display */}
            <div className="bg-muted/50 rounded-lg p-4 mb-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <IconUser className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{waitlistData?.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <IconMail className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{waitlistData?.email}</p>
                </div>
              </div>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-6">
                <IconAlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Organization Name */}
              <div className="space-y-2">
                <Label
                  htmlFor="organizationName"
                  className="flex items-center gap-2"
                >
                  <IconBuilding className="h-4 w-4" />
                  Organization Name
                </Label>
                <Input
                  id="organizationName"
                  type="text"
                  placeholder="Your company or organization name"
                  value={formData.organizationName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      organizationName: e.target.value,
                    })
                  }
                  required
                  disabled={submitting}
                />
                <p className="text-xs text-muted-foreground">
                  {waitlistData?.company
                    ? "You can update this if needed"
                    : "This will be the name of your organization in GladiatorRX"}
                </p>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <IconLock className="h-4 w-4" />
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a secure password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                  minLength={8}
                  disabled={submitting}
                />
                <p className="text-xs text-muted-foreground">
                  Must be at least 8 characters long
                </p>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="flex items-center gap-2"
                >
                  <IconCheck className="h-4 w-4" />
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  required
                  minLength={8}
                  disabled={submitting}
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Your Account...
                  </>
                ) : (
                  <>
                    <IconCheck className="mr-2 h-4 w-4" />
                    Complete Registration
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">What happens next?</strong>
                <br />
                After registration, you'll be able to log in immediately and
                start monitoring for data breaches across 15+ major databases.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
