"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import { DownloadModal } from "@/components/download-modal";
import { Search, Download, Database, Clock, AlertTriangle } from "lucide-react";

interface SearchResult {
  List: {
    [dbName: string]: {
      Data: any[];
      NumOfResults: number;
      InfoLeak: string;
    };
  };
  NumOfDatabase: number;
  NumOfResults: number;
  "search time": number;
}

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setError("");
    setResults(null);

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: searchQuery }),
      });

      if (!response.ok) {
        throw new Error("Search failed");
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError("Failed to perform search. Please try again.");
      console.error("Search error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          Search Database Leaks
        </h1>
        <p className="text-neutral-400">
          Search across millions of leaked records to find compromised data
        </p>
      </div>

      {/* Search Form */}
      <BackgroundGradient className="rounded-2xl bg-neutral-900 p-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <Label htmlFor="search" className="mb-2 block text-white">
              Search Query
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-500" />
              <Input
                id="search"
                type="text"
                placeholder="Enter email, username, phone, or domain..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500 h-12"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isLoading || !searchQuery.trim()}
              className="px-6 py-3 bg-white text-black rounded-lg hover:bg-neutral-200 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Search
                </>
              )}
            </button>

            {results && (
              <button
                type="button"
                onClick={() => setShowDownloadModal(true)}
                className="px-6 py-3 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition-all font-semibold flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download Results
              </button>
            )}
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              {error}
            </div>
          )}
        </form>
      </BackgroundGradient>

      {/* Search Results Summary */}
      {results && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Database className="w-5 h-5 text-cyan-400" />
              <p className="text-neutral-400 text-sm">Databases</p>
            </div>
            <p className="text-3xl font-bold text-white">
              {results.NumOfDatabase}
            </p>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Search className="w-5 h-5 text-green-400" />
              <p className="text-neutral-400 text-sm">Total Results</p>
            </div>
            <p className="text-3xl font-bold text-white">
              {results.NumOfResults}
            </p>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-orange-400" />
              <p className="text-neutral-400 text-sm">Search Time</p>
            </div>
            <p className="text-3xl font-bold text-white">
              {results["search time"].toFixed(2)}s
            </p>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <p className="text-neutral-400 text-sm">Status</p>
            </div>
            <p className="text-lg font-bold text-red-400">
              {results.NumOfResults > 0 ? "EXPOSED" : "SAFE"}
            </p>
          </div>
        </motion.div>
      )}

      {/* Results */}
      {results && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white">Search Results</h2>

          {Object.entries(results.List).map(([dbName, dbData], index) => (
            <motion.div
              key={dbName}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <BackgroundGradient className="rounded-2xl bg-neutral-900 p-6">
                <div className="mb-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-bold text-white">{dbName}</h3>
                    <span className="px-3 py-1 bg-red-500/10 text-red-400 rounded-full text-sm font-medium border border-red-500/20">
                      {dbData.NumOfResults} Records
                    </span>
                  </div>
                  <p className="text-neutral-400 text-sm">{dbData.InfoLeak}</p>
                </div>

                <div className="space-y-3">
                  {dbData.Data.map((record, idx) => (
                    <div
                      key={idx}
                      className="bg-neutral-800 rounded-lg p-4 border border-neutral-700"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {Object.entries(record).map(([key, value]) => (
                          <div key={key} className="flex flex-col">
                            <span className="text-xs text-neutral-500 mb-1">
                              {key}
                            </span>
                            <span className="text-white font-mono text-sm break-all">
                              {String(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </BackgroundGradient>
            </motion.div>
          ))}
        </div>
      )}

      {/* No Results */}
      {results && results.NumOfResults === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Good News!</h3>
          <p className="text-neutral-400">
            No leaked data found for your search query
          </p>
        </motion.div>
      )}

      {/* Download Modal */}
      {results && (
        <DownloadModal
          isOpen={showDownloadModal}
          onClose={() => setShowDownloadModal(false)}
          data={results}
          query={searchQuery}
        />
      )}
    </div>
  );
}
