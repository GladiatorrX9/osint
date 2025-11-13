"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Logo } from "@/components/logo";
import { motion } from "framer-motion";
import {
  IconLock,
  IconCheck,
  IconAlertCircle,
  IconLoader2,
  IconArrowLeft,
} from "@tabler/icons-react";

export default function ResetPasswordPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenValid, setTokenValid] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function verifyToken() {
      try {
        const response = await fetch(
          `/api/auth/reset-password/verify?token=${token}`
        );
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Invalid or expired reset link");
          setLoading(false);
          return;
        }

        setTokenValid(true);
        setLoading(false);
      } catch (err) {
        console.error("Error verifying token:", err);
        setError("Failed to verify reset link");
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
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to reset password");
        setSubmitting(false);
        return;
      }

      setSuccess(true);
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/login?reset=true");
      }, 2000);
    } catch (err) {
      console.error("Error resetting password:", err);
      setError("Failed to reset password. Please try again.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center">
          <IconLoader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-slate-400">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  if (error && !tokenValid) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
        <motion.div
          className="absolute top-20 left-20 w-72 h-72 bg-red-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl text-center">
            <div className="mx-auto mb-4">
              <Logo size="lg" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Invalid Link</h1>
            <p className="text-slate-400 mb-6">
              This password reset link is invalid or has expired
            </p>

            <Alert
              variant="destructive"
              className="mb-6 bg-red-500/10 border-red-500/50"
            >
              <IconAlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>

            <div className="space-y-3">
              <Button
                className="w-full bg-white hover:bg-neutral-100 text-black"
                onClick={() => router.push("/forgot-password")}
              >
                Request New Reset Link
              </Button>
              <Button
                variant="outline"
                className="w-full bg-neutral-800 hover:bg-neutral-700 text-white border-neutral-700"
                onClick={() => router.push("/login")}
              >
                <IconArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
        <motion.div
          className="absolute top-20 left-20 w-72 h-72 bg-green-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
              <IconCheck className="w-8 h-8 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Password Reset Successful!
            </h1>
            <p className="text-slate-400 mb-6">
              Your password has been updated. Redirecting to login...
            </p>

            <Alert className="bg-green-500/10 border border-green-500/50 text-green-400">
              <IconCheck className="h-4 w-4" />
              <AlertDescription>
                You can now log in with your new password.
              </AlertDescription>
            </Alert>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background gradient orbs */}
      <motion.div
        className="absolute top-20 left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="mb-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="mb-6 flex justify-center"
          >
            <div className="bg-white rounded-lg p-4 shadow-xl shadow-blue-500/20">
              <Logo size="xl" showText={false} href={undefined} />
            </div>
          </motion.div>
          <h1 className="text-4xl font-bold text-white mb-3">
            Reset Your Password
          </h1>
          <p className="text-slate-400 text-base">
            Enter your new password below
          </p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl">
          {error && (
            <Alert
              variant="destructive"
              className="mb-6 bg-red-500/10 border-red-500/50"
            >
              <IconAlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-slate-200 flex items-center gap-2"
              >
                <IconLock className="w-4 h-4 text-blue-400" />
                New Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                disabled={submitting}
                className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
              <p className="text-xs text-slate-500">
                Must be at least 8 characters long
              </p>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="confirmPassword"
                className="text-slate-200 flex items-center gap-2"
              >
                <IconCheck className="w-4 h-4 text-green-400" />
                Confirm New Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                disabled={submitting}
                className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-600 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
              />
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-12 bg-white hover:bg-neutral-100 text-black rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <IconLoader2 className="w-5 h-5 animate-spin" />
                  <span>Resetting Password...</span>
                </>
              ) : (
                <>
                  <IconCheck className="w-5 h-5" />
                  <span>Reset Password</span>
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-sm text-blue-400 hover:text-blue-300 inline-flex items-center gap-2 transition-colors"
            >
              <IconArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
