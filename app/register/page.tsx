"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { BackgroundGradient } from "@/components/ui/background-gradient";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          organizationName,
        }),
      });

      if (!response.ok) {
        const data = await response.text();
        setError(data);
        return;
      }

      router.push("/login");
    } catch (error) {
      setError("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Form */}
        <div className="w-full max-w-md mx-auto lg:mx-0">
          <div className="mb-8">
            <div className="w-12 h-12 bg-white rounded-lg mb-6 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-black"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-white mb-3">
              Create an account
            </h1>
            <p className="text-slate-400 text-base">
              Start monitoring database leaks and secure your organization
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-600"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="youremail@yourdomain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-600"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="organizationName">Organization Name</Label>
              <Input
                id="organizationName"
                type="text"
                placeholder="Your Company Name"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                required
                className="bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-600"
              />
              <p className="text-xs text-neutral-500 mt-1">
                You'll be the admin of this organization (max 2 users per org)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-600"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-neutral-800 hover:bg-neutral-700 text-white h-12 rounded-lg font-medium"
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-800"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-black text-neutral-500">or</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                className="flex items-center justify-center h-12 bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors border border-neutral-800"
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
              </button>
              <button
                type="button"
                className="flex items-center justify-center h-12 bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors border border-neutral-800"
              >
                <svg
                  className="w-5 h-5 text-blue-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </button>
              <button
                type="button"
                className="flex items-center justify-center h-12 bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors border border-neutral-800"
              >
                <svg
                  className="w-5 h-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                </svg>
              </button>
            </div>
          </form>

          <p className="mt-8 text-center text-sm text-neutral-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-orange-500 hover:text-orange-400 font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Right Side - Testimonial Card */}
        <div className="hidden lg:block">
          <BackgroundGradient className="rounded-3xl p-8 bg-neutral-900">
            <div className="relative h-[500px] rounded-2xl overflow-hidden bg-gradient-to-br from-blue-400 via-cyan-300 to-teal-400">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

              <div className="absolute top-6 left-6 flex gap-2">
                <span className="px-3 py-1 bg-black/40 backdrop-blur-sm text-white text-xs rounded-full border border-white/20">
                  Cybersecurity
                </span>
                <span className="px-3 py-1 bg-black/40 backdrop-blur-sm text-white text-xs rounded-full border border-white/20">
                  Enterprise
                </span>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                  <p className="text-white text-base mb-4 leading-relaxed">
                    The best security intelligence platform we've used.
                    Real-time leak detection has saved us countless hours and
                    protected our customers.
                  </p>
                  <div>
                    <p className="text-white/90 text-sm font-medium">
                      Sarah Johnson
                    </p>
                    <p className="text-white/70 text-sm">
                      CISO,{" "}
                      <span className="font-semibold">TechCorp Security</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </BackgroundGradient>
        </div>
      </div>
    </div>
  );
}
