"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { Logo } from "@/components/logo";
import { motion } from "framer-motion";
import {
  IconUser,
  IconMail,
  IconBuilding,
  IconMessage,
  IconSparkles,
  IconRocket,
} from "@tabler/icons-react";

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
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background gradient orbs */}
      <motion.div
        className="absolute top-20 right-20 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-20 left-20 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl"
        animate={{
          scale: [1.3, 1, 1.3],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 11,
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
              <div className="bg-white rounded-lg p-4 shadow-xl shadow-cyan-500/20">
                <Logo size="xl" showText={false} href={undefined} />
              </div>
            </motion.div>
            <h1 className="text-4xl font-bold text-white mb-3 flex items-center justify-center gap-2">
              Join the Waitlist
              <IconSparkles className="w-6 h-6 text-yellow-400" />
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

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-2"
            >
              <Label
                htmlFor="name"
                className="text-slate-200 flex items-center gap-2"
              >
                <IconUser className="w-4 h-4 text-cyan-400" />
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-600 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-2"
            >
              <Label
                htmlFor="email"
                className="text-slate-200 flex items-center gap-2"
              >
                <IconMail className="w-4 h-4 text-teal-400" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="youremail@yourdomain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-600 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-2"
            >
              <Label
                htmlFor="company"
                className="text-slate-200 flex items-center gap-2"
              >
                <IconBuilding className="w-4 h-4 text-blue-400" />
                Company Name (Optional)
              </Label>
              <Input
                id="company"
                type="text"
                placeholder="Your Company Name"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-2"
            >
              <Label
                htmlFor="message"
                className="text-slate-200 flex items-center gap-2"
              >
                <IconMessage className="w-4 h-4 text-green-400" />
                Message (Optional)
              </Label>
              <textarea
                id="message"
                placeholder="Tell us about your use case..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="w-full bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-600 rounded-md border px-3 py-2 text-base shadow-xs transition-colors outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 resize-none"
              />
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
                  <span>Joining waitlist...</span>
                </>
              ) : (
                <>
                  <IconRocket className="w-5 h-5" />
                  <span>Join Waitlist</span>
                </>
              )}
            </motion.button>

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
        </motion.div>

        {/* Right Side - Testimonial Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="hidden lg:block"
        >
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
        </motion.div>
      </div>
    </div>
  );
}
