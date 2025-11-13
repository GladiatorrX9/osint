"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Logo } from "@/components/logo";
import { motion } from "framer-motion";
import {
  IconMail,
  IconCheck,
  IconAlertCircle,
  IconArrowLeft,
  IconLoader2,
} from "@tabler/icons-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to send reset email");
        setIsLoading(false);
        return;
      }

      setSuccess(true);
      setIsLoading(false);
    } catch (err) {
      console.error("Error sending reset email:", err);
      setError("Failed to send reset email. Please try again.");
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated background gradient orbs */}
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
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl">
            <div className="text-center mb-6">
              <div className="mx-auto mb-4 w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
                <IconCheck className="w-8 h-8 text-green-500" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Check Your Email
              </h1>
              <p className="text-slate-400">
                We've sent a password reset link to{" "}
                <span className="text-white font-medium">{email}</span>
              </p>
            </div>

            <Alert className="bg-green-500/10 border border-green-500/50 text-green-400 mb-6">
              <IconCheck className="h-4 w-4" />
              <AlertDescription>
                The reset link will expire in 1 hour for security reasons.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <p className="text-sm text-slate-400 text-center">
                Didn't receive the email? Check your spam folder or try again.
              </p>

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
            Forgot Password?
          </h1>
          <p className="text-slate-400 text-base">
            No worries! Enter your email and we'll send you a reset link.
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
                htmlFor="email"
                className="text-slate-200 flex items-center gap-2"
              >
                <IconMail className="w-4 h-4 text-blue-400" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="youremail@yourdomain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
              <p className="text-xs text-slate-500">
                Enter the email address associated with your account
              </p>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-white hover:bg-neutral-100 text-black rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <IconLoader2 className="w-5 h-5 animate-spin" />
                  <span>Sending Reset Link...</span>
                </>
              ) : (
                <>
                  <IconMail className="w-5 h-5" />
                  <span>Send Reset Link</span>
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
