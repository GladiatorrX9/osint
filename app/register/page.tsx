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
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setIsLoading(true);

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          company,
          message,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to join waitlist");
        return;
      }

      setSuccess(true);
      setName("");
      setEmail("");
      setCompany("");
      setMessage("");
    } catch (error) {
      setError("Something went wrong. Please try again.");
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
              Join the Waitlist
            </h1>
            <p className="text-slate-400 text-base">
              Get early access to our cybersecurity intelligence platform
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-3 rounded-lg text-sm">
                Successfully joined the waitlist! We'll be in touch soon.
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
              <Label htmlFor="company">Company Name (Optional)</Label>
              <Input
                id="company"
                type="text"
                placeholder="Your Company Name"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-600"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message (Optional)</Label>
              <textarea
                id="message"
                placeholder="Tell us about your use case..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="w-full bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-600 rounded-md border px-3 py-2 text-base shadow-xs transition-colors outline-none focus:border-neutral-600 resize-none"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-neutral-800 hover:bg-neutral-700 text-white h-12 rounded-lg font-medium"
              disabled={isLoading}
            >
              {isLoading ? "Joining waitlist..." : "Join Waitlist"}
            </Button>

            <p className="text-xs text-center text-neutral-500">
              By joining, you agree to receive updates about our platform launch
            </p>
          </form>

          <p className="mt-8 text-center text-sm text-neutral-500">
            Admin user?{" "}
            <Link
              href="/login"
              className="text-orange-500 hover:text-orange-400 font-medium"
            >
              Sign in here
            </Link>
            {" · "}
            <Link
              href="/pricing"
              className="text-cyan-400 hover:text-cyan-300 font-medium"
            >
              View pricing
            </Link>
          </p>
        </div>

        {/* Right Side - Testimonial Card */}
        <div className="hidden lg:block">
          <BackgroundGradient className="rounded-3xl p-8 bg-neutral-900">
            <div className="relative h-[500px] rounded-2xl overflow-hidden bg-linear-to-br from-blue-400 via-cyan-300 to-teal-400">
              <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent"></div>

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
                    "Join thousands of security professionals getting early
                    access to our next-generation threat intelligence platform."
                  </p>
                  <div>
                    <p className="text-white/90 text-sm font-medium">
                      Building the Future of Cybersecurity
                    </p>
                    <p className="text-white/70 text-sm">
                      <span className="font-semibold">
                        GladiatorRX Security
                      </span>
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
