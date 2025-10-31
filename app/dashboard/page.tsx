"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { BackgroundGradient } from "@/components/ui/background-gradient";

interface LeakedDatabase {
  id: string;
  name: string;
  description: string;
  severity: string;
  recordCount: number;
  leakDate: string;
  affectedOrg: string;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [databases, setDatabases] = useState<LeakedDatabase[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    critical: 0,
    high: 0,
    medium: 0,
  });

  useEffect(() => {
    fetchDatabases();
  }, []);

  const fetchDatabases = async () => {
    try {
      const response = await fetch("/api/databases");
      const data = await response.json();
      setDatabases(data.slice(0, 5)); // Get latest 5

      // Calculate stats
      const total = data.length;
      const critical = data.filter(
        (d: LeakedDatabase) => d.severity === "critical"
      ).length;
      const high = data.filter(
        (d: LeakedDatabase) => d.severity === "high"
      ).length;
      const medium = data.filter(
        (d: LeakedDatabase) => d.severity === "medium"
      ).length;

      setStats({ total, critical, high, medium });
    } catch (error) {
      console.error("Error fetching databases:", error);
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      case "high":
        return "bg-orange-500/10 text-orange-400 border-orange-500/20";
      case "medium":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      default:
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          Welcome back, {session?.user?.name}
        </h1>
        <p className="text-neutral-400">
          Here's what's happening with your database security today
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 hover:border-neutral-700 transition-colors"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-neutral-800 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-cyan-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
                />
              </svg>
            </div>
          </div>
          <p className="text-neutral-400 text-sm font-medium mb-1">
            Total Leaks
          </p>
          <p className="text-3xl font-bold text-white">{stats.total}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 hover:border-red-500/50 transition-colors"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>
          <p className="text-neutral-400 text-sm font-medium mb-1">Critical</p>
          <p className="text-3xl font-bold text-red-400">{stats.critical}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 hover:border-orange-500/50 transition-colors"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-orange-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
          </div>
          <p className="text-neutral-400 text-sm font-medium mb-1">High</p>
          <p className="text-3xl font-bold text-orange-400">{stats.high}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 hover:border-yellow-500/50 transition-colors"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-yellow-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <p className="text-neutral-400 text-sm font-medium mb-1">Medium</p>
          <p className="text-3xl font-bold text-yellow-400">{stats.medium}</p>
        </motion.div>
      </div>

      {/* Recent Leaks */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            Recent Database Leaks
          </h2>
          <Link
            href="/dashboard/search"
            className="text-orange-500 hover:text-orange-400 text-sm font-medium transition-colors"
          >
            View All →
          </Link>
        </div>

        <div className="space-y-4">
          {databases.map((db, index) => (
            <motion.div
              key={db.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <BackgroundGradient
                className="rounded-2xl bg-neutral-900 p-6 hover:shadow-lg hover:shadow-orange-500/5 transition-all"
                containerClassName="rounded-2xl"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">
                        {db.name}
                      </h3>
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getSeverityBadge(
                          db.severity
                        )}`}
                      >
                        {db.severity.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-neutral-400 text-sm line-clamp-2">
                      {db.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2 text-neutral-400">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                    <span>{db.affectedOrg}</span>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-400">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    <span>{db.recordCount.toLocaleString()} records</span>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-400">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span>{new Date(db.leakDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </BackgroundGradient>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
