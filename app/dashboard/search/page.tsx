"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DownloadModal } from "@/components/download-modal";
import {
  Search,
  Download,
  Database,
  Clock,
  AlertTriangle,
  Shield,
  CheckCircle2,
  XCircle,
  FileSearch,
  Loader2,
} from "lucide-react";

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
    <div className="container mx-auto max-w-7xl space-y-8 p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="rounded-full bg-primary/10 p-3">
            <FileSearch className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-foreground">
              Search Database Leaks
            </h1>
          </div>
        </div>
        <p className="mt-2 text-muted-foreground">
          Search across millions of leaked records to find compromised data
        </p>
      </motion.div>

      {/* Search Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Search Query</CardTitle>
            <CardDescription>
              Enter an email, username, phone number, or domain to check for
              breaches
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="search"
                  type="text"
                  placeholder="e.g., user@example.com, username, +1234567890, example.com"
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSearchQuery(e.target.value)
                  }
                  className="h-12 pl-10"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  type="submit"
                  disabled={isLoading || !searchQuery.trim()}
                  className="gap-2"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="h-5 w-5" />
                      Search Leaks
                    </>
                  )}
                </Button>

                {results && results.NumOfResults > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowDownloadModal(true)}
                    className="gap-2"
                    size="lg"
                  >
                    <Download className="h-5 w-5" />
                    Download Results
                  </Button>
                )}
              </div>

              {error && (
                <div className="flex items-center gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* Search Results Summary */}
      <AnimatePresence>
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid gap-6 md:grid-cols-4"
          >
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Databases</p>
                    <p className="mt-2 text-3xl font-bold text-foreground">
                      {results.NumOfDatabase}
                    </p>
                  </div>
                  <div className="rounded-full bg-primary/10 p-3">
                    <Database className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Records
                    </p>
                    <p className="mt-2 text-3xl font-bold text-foreground">
                      {results.NumOfResults}
                    </p>
                  </div>
                  <div className="rounded-full bg-blue-500/10 p-3">
                    <FileSearch className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Search Time</p>
                    <p className="mt-2 text-3xl font-bold text-foreground">
                      {results["search time"].toFixed(2)}s
                    </p>
                  </div>
                  <div className="rounded-full bg-orange-500/10 p-3">
                    <Clock className="h-6 w-6 text-orange-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              className={
                results.NumOfResults > 0
                  ? "border-red-500/50"
                  : "border-green-500/50"
              }
            >
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p
                      className={`mt-2 text-2xl font-bold ${
                        results.NumOfResults > 0
                          ? "text-red-500"
                          : "text-green-500"
                      }`}
                    >
                      {results.NumOfResults > 0 ? "EXPOSED" : "SAFE"}
                    </p>
                  </div>
                  <div
                    className={`rounded-full p-3 ${
                      results.NumOfResults > 0
                        ? "bg-red-500/10"
                        : "bg-green-500/10"
                    }`}
                  >
                    {results.NumOfResults > 0 ? (
                      <XCircle className="h-6 w-6 text-red-500" />
                    ) : (
                      <CheckCircle2 className="h-6 w-6 text-green-500" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {results && results.NumOfResults > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">
                Leaked Records Found
              </h2>
              <Badge variant="destructive" className="text-sm">
                {results.NumOfResults} Matches
              </Badge>
            </div>

            {Object.entries(results.List).map(([dbName, dbData], index) => (
              <motion.div
                key={dbName}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
              >
                <Card className="overflow-hidden">
                  <CardHeader className="bg-muted/50">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2">
                          <Database className="h-5 w-5 text-primary" />
                          {dbName}
                        </CardTitle>
                        <CardDescription className="text-sm">
                          {dbData.InfoLeak}
                        </CardDescription>
                      </div>
                      <Badge variant="destructive">
                        {dbData.NumOfResults} Records
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {dbData.Data.map((record, idx) => (
                        <div
                          key={idx}
                          className="rounded-lg border border-border bg-muted/30 p-4"
                        >
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {Object.entries(record).map(([key, value]) => (
                              <div key={key} className="space-y-1">
                                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                  {key}
                                </p>
                                <p className="break-all font-mono text-sm text-foreground">
                                  {String(value)}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* No Results */}
      <AnimatePresence>
        {results && results.NumOfResults === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="border-green-500/50">
              <CardContent className="py-12 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                  <Shield className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="mb-2 text-2xl font-bold text-foreground">
                  All Clear!
                </h3>
                <p className="text-muted-foreground">
                  No leaked data found for "{searchQuery}". Your information
                  appears to be safe.
                </p>
                <Separator className="my-6" />
                <div className="mx-auto max-w-md space-y-2 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    No matches in {results.NumOfDatabase} databases
                  </p>
                  <p className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Search completed in {results["search time"].toFixed(2)}s
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

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
