"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  IconSearch,
  IconFilter,
  IconDownload,
  IconClock,
} from "@tabler/icons-react";
import { format } from "date-fns";

interface SearchLog {
  id: string;
  query: string;
  resultsCount: number;
  databaseName: string | null;
  searchType: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function SearchLogsPage() {
  const [logs, setLogs] = useState<SearchLog[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchType, setSearchType] = useState<string>("all");
  const [databaseFilter, setDatabaseFilter] = useState<string>("");

  const fetchLogs = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
      });

      if (searchType && searchType !== "all")
        params.append("searchType", searchType);
      if (databaseFilter) params.append("databaseName", databaseFilter);

      const response = await fetch(`/api/search-logs?${params}`);
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Error fetching search logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [searchType, databaseFilter]);

  const exportLogs = () => {
    const csv = [
      ["Date", "Query", "Results", "Database", "Type", "IP Address"].join(","),
      ...logs.map((log) =>
        [
          format(new Date(log.createdAt), "yyyy-MM-dd HH:mm:ss"),
          `"${log.query}"`,
          log.resultsCount,
          log.databaseName || "N/A",
          log.searchType,
          log.ipAddress || "N/A",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `search-logs-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getSearchTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      general: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      email: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      domain: "bg-orange-500/10 text-orange-500 border-orange-500/20",
      credential: "bg-red-500/10 text-red-500 border-red-500/20",
    };

    return (
      <Badge
        variant="outline"
        className={colors[type.toLowerCase()] || "bg-gray-500/10 text-gray-500"}
      >
        {type}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Search Logs</h1>
          <p className="text-muted-foreground mt-1">
            View your search history and activity
          </p>
        </div>
        <Button onClick={exportLogs} variant="outline" className="gap-2">
          <IconDownload className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Search History</CardTitle>
              <CardDescription>
                Total searches: {pagination.total}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={searchType} onValueChange={setSearchType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="domain">Domain</SelectItem>
                  <SelectItem value="credential">Credential</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Filter by database..."
                value={databaseFilter}
                onChange={(e) => setDatabaseFilter(e.target.value)}
                className="w-[200px]"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <IconSearch className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-1">No search logs yet</h3>
              <p className="text-muted-foreground">
                Your search history will appear here
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Query</TableHead>
                    <TableHead>Results</TableHead>
                    <TableHead>Database</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>IP Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <IconClock className="h-4 w-4 text-muted-foreground" />
                          {format(
                            new Date(log.createdAt),
                            "MMM dd, yyyy HH:mm"
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm max-w-xs truncate">
                        {log.query}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            log.resultsCount > 0 ? "destructive" : "secondary"
                          }
                        >
                          {log.resultsCount}{" "}
                          {log.resultsCount === 1 ? "result" : "results"}
                        </Badge>
                      </TableCell>
                      <TableCell>{log.databaseName || "N/A"}</TableCell>
                      <TableCell>
                        {getSearchTypeBadge(log.searchType)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {log.ipAddress || "N/A"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchLogs(pagination.page - 1)}
                    disabled={pagination.page === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchLogs(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
