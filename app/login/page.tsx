"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { Logo } from "@/components/logo";
import { motion } from "framer-motion";
import {
  IconLock,
  IconMail,
  IconSparkles,
  IconCheck,
} from "@tabler/icons-react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    // Check if user was redirected after successful registration
    if (searchParams.get("registered") === "true") {
      setSuccessMessage(
        "Registration completed successfully! You can now log in with your credentials."
      );
    }
    // Check if user was redirected after password reset
    if (searchParams.get("reset") === "true") {
      setSuccessMessage(
        "Password reset successful! You can now log in with your new password."
      );
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid credentials");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error) {
      setError("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

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

      <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-8 items-center relative z-10">
        {/* Left Side - Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md mx-auto lg:mx-0"
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
            <h1 className="text-4xl font-bold text-white mb-3 flex items-center justify-center gap-2">
              Welcome back!
              <IconSparkles className="w-6 h-6 text-yellow-400" />
            </h1>
            <p className="text-slate-400 text-base">
              Monitor and track database leaks across your organization
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {successMessage && (
              <Alert className="bg-green-500/10 border border-green-500/50 text-green-400">
                <IconCheck className="h-4 w-4" />
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>
            )}
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-2"
            >
              <Label
                htmlFor="email"
                className="text-slate-200 flex items-center gap-2"
              >
                <IconMail className="w-4 h-4 text-blue-400" />
                Email
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="youremail@yourdomain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  className="text-slate-200 flex items-center gap-2"
                >
                  <IconLock className="w-4 h-4 text-purple-400" />
                  Password
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                />
              </div>
            </motion.div>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full h-12 bg-white hover:bg-neutral-100 text-black rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-5 h-5 border-2 border-black border-t-transparent rounded-full"
                  />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <IconLock className="w-5 h-5" />
                  <span>Sign in to Dashboard</span>
                </>
              )}
            </motion.button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-800"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-black text-neutral-500">or</span>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-3 gap-3"
            >
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center h-12 bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors border border-neutral-800 hover:border-neutral-700"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              </motion.button>
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center h-12 bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors border border-neutral-800 hover:border-neutral-700"
              >
                <svg
                  className="w-5 h-5 text-blue-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </motion.button>
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center h-12 bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors border border-neutral-800 hover:border-neutral-700"
              >
                <svg
                  className="w-5 h-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                </svg>
              </motion.button>
            </motion.div>
          </form>

          <p className="mt-8 text-center text-sm text-neutral-500">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="text-orange-500 hover:text-orange-400 font-medium"
            >
              Join waitlist
            </Link>
            {" · "}
            <Link
              href="/pricing"
              className="text-cyan-400 hover:text-cyan-300 font-medium"
            >
              View pricing
            </Link>
          </p>
        </motion.div>

        {/* Right Side - Testimonial Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="hidden lg:block"
        >
          <BackgroundGradient className="rounded-3xl p-8 bg-neutral-900">
            <div className="relative h-[500px] rounded-2xl overflow-hidden bg-linear-to-br from-amber-200 via-orange-300 to-amber-400">
              <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent"></div>

              <div className="absolute top-6 left-6 flex gap-2">
                <span className="px-3 py-1 bg-black/40 backdrop-blur-sm text-white text-xs rounded-full border border-white/20">
                  Product Company
                </span>
                <span className="px-3 py-1 bg-black/40 backdrop-blur-sm text-white text-xs rounded-full border border-white/20">
                  Cloud Management
                </span>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                  <p className="text-white text-base mb-4 leading-relaxed">
                    GladiatorRX has completely changed how we work. What used to
                    take hours every week is now fully automated.
                  </p>
                  <div>
                    <p className="text-white/90 text-sm font-medium">
                      Gina Clinton
                    </p>
                    <p className="text-white/70 text-sm">
                      Head of Product,{" "}
                      <span className="font-semibold">Acme Inc.</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </BackgroundGradient>
        </motion.div>
      </div>
    </div>
  );
}
