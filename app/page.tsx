"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";
import { BackgroundGradient } from "@/components/ui/background-gradient";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-neutral-800 border-t-white rounded-full animate-spin"></div>
          <div className="text-neutral-400 text-sm">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <BackgroundRippleEffect rows={15} cols={40} cellSize={60} />

      {/* Navbar */}
      <nav className="relative z-50 border-b border-neutral-800 bg-black/50 backdrop-blur-sm pointer-events-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-black"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <span className="text-xl font-bold text-white">GladiatorRX</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-neutral-300 hover:text-white transition-colors text-sm font-medium"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 bg-white text-black rounded-lg hover:bg-neutral-200 transition-colors text-sm font-medium"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-20 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-5xl pointer-events-auto"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-full mb-8"
          >
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-neutral-300 text-sm">
              Real-time Database Leak Monitoring
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight"
          >
            <span className="text-white">Protect Your</span>
            <br />
            <span className="bg-clip-text text-transparent bg-linear-to-r from-cyan-400 via-blue-500 to-purple-600">
              Digital Assets
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-lg md:text-xl text-neutral-400 mb-10 max-w-3xl mx-auto leading-relaxed"
          >
            Monitor, track, and analyze database breaches across your
            organization. Stay ahead of security threats with real-time
            intelligence and comprehensive leak detection.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
          >
            <Link
              href="/register"
              className="px-8 py-4 bg-white text-black font-semibold rounded-lg hover:bg-neutral-200 transition-all transform hover:scale-105 w-full sm:w-auto shadow-lg shadow-white/10"
            >
              Start Monitoring Now →
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 border border-neutral-700 hover:bg-neutral-900 text-white font-semibold rounded-lg transition-all w-full sm:w-auto"
            >
              Sign In
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="grid grid-cols-3 gap-4 md:gap-8 max-w-2xl mx-auto mb-20"
          >
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                15+
              </div>
              <div className="text-sm text-neutral-500">Major Breaches</div>
            </div>
            <div className="text-center border-x border-neutral-800">
              <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                5B+
              </div>
              <div className="text-sm text-neutral-500">Records Tracked</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                24/7
              </div>
              <div className="text-sm text-neutral-500">Monitoring</div>
            </div>
          </motion.div>
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl w-full px-4 pointer-events-auto"
        >
          <BackgroundGradient className="rounded-3xl bg-neutral-900 p-8 h-full">
            <div className="w-14 h-14 bg-cyan-500/10 rounded-2xl flex items-center justify-center mb-6">
              <svg
                className="w-7 h-7 text-cyan-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">
              Advanced Search
            </h3>
            <p className="text-neutral-400 leading-relaxed">
              Search and filter through billions of leaked database records
              instantly with powerful query capabilities and real-time results.
            </p>
          </BackgroundGradient>

          <BackgroundGradient className="rounded-3xl bg-neutral-900 p-8 h-full">
            <div className="w-14 h-14 bg-orange-500/10 rounded-2xl flex items-center justify-center mb-6">
              <svg
                className="w-7 h-7 text-orange-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">
              Threat Intelligence
            </h3>
            <p className="text-neutral-400 leading-relaxed">
              Track severity levels, monitor critical threats, and receive
              alerts about new database breaches affecting your organization.
            </p>
          </BackgroundGradient>

          <BackgroundGradient className="rounded-3xl bg-neutral-900 p-8 h-full">
            <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6">
              <svg
                className="w-7 h-7 text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">
              Analytics Dashboard
            </h3>
            <p className="text-neutral-400 leading-relaxed">
              Visualize trends, patterns, and statistics with comprehensive
              analytics to make informed security decisions.
            </p>
          </BackgroundGradient>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="mt-20 text-center text-neutral-500 text-sm"
        >
          <p>
            © 2025 GladiatorRX. Protecting organizations from data breaches.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
