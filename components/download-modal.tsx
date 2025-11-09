"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Download, FileText, FileSpreadsheet, Code } from "lucide-react";
import { cn } from "@/lib/utils";

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  query: string;
}

export function DownloadModal({
  isOpen,
  onClose,
  data,
  query,
}: DownloadModalProps) {
  const downloadCSV = () => {
    const csvContent = generateCSV(data);
    downloadFile(
      csvContent,
      `gladiatorrx-search-${query}-${Date.now()}.csv`,
      "text/csv"
    );
    onClose();
  };

  const downloadPDF = () => {
    const htmlContent = generateHTML(data, query);
    // For PDF, we'll create a printable HTML that user can save as PDF
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
    onClose();
  };

  const downloadHTML = () => {
    const htmlContent = generateHTML(data, query);
    downloadFile(
      htmlContent,
      `gladiatorrx-search-${query}-${Date.now()}.html`,
      "text/html"
    );
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-md w-full border border-neutral-200 dark:border-neutral-800"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Download className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                      Download Results
                    </h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      Choose your preferred format
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-neutral-500" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-3">
                {/* CSV Option */}
                <button
                  onClick={downloadCSV}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 rounded-xl border-2",
                    "border-neutral-200 dark:border-neutral-800",
                    "hover:border-blue-500 dark:hover:border-blue-400",
                    "hover:bg-blue-50 dark:hover:bg-blue-900/10",
                    "transition-all duration-200 group"
                  )}
                >
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg group-hover:scale-110 transition-transform">
                    <FileSpreadsheet className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">
                      CSV Format
                    </h4>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      Best for spreadsheets & analysis
                    </p>
                  </div>
                  <Download className="w-5 h-5 text-neutral-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                </button>

                {/* PDF Option */}
                <button
                  onClick={downloadPDF}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 rounded-xl border-2",
                    "border-neutral-200 dark:border-neutral-800",
                    "hover:border-blue-500 dark:hover:border-blue-400",
                    "hover:bg-blue-50 dark:hover:bg-blue-900/10",
                    "transition-all duration-200 group"
                  )}
                >
                  <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg group-hover:scale-110 transition-transform">
                    <FileText className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">
                      PDF Format
                    </h4>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      Print-ready document format
                    </p>
                  </div>
                  <Download className="w-5 h-5 text-neutral-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                </button>

                {/* HTML Option */}
                <button
                  onClick={downloadHTML}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 rounded-xl border-2",
                    "border-neutral-200 dark:border-neutral-800",
                    "hover:border-blue-500 dark:hover:border-blue-400",
                    "hover:bg-blue-50 dark:hover:bg-blue-900/10",
                    "transition-all duration-200 group"
                  )}
                >
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg group-hover:scale-110 transition-transform">
                    <Code className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">
                      HTML Format
                    </h4>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      Web-ready structured data
                    </p>
                  </div>
                  <Download className="w-5 h-5 text-neutral-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                </button>
              </div>

              {/* Footer */}
              <div className="p-6 bg-neutral-50 dark:bg-neutral-800/50 border-t border-neutral-200 dark:border-neutral-800 rounded-b-2xl">
                <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center">
                  All downloads contain search results for:{" "}
                  <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                    {query}
                  </span>
                </p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

// Helper function to download file
function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Generate CSV content
function generateCSV(data: any): string {
  let csv = "Database,Field,Value,Info Leak\n";

  Object.entries(data.List).forEach(([dbName, dbData]: [string, any]) => {
    dbData.Data.forEach((item: any) => {
      Object.entries(item).forEach(([key, value]) => {
        const escapedValue = String(value).replace(/"/g, '""');
        const escapedDbName = dbName.replace(/"/g, '""');
        const escapedInfoLeak = dbData.InfoLeak.replace(/"/g, '""');
        csv += `"${escapedDbName}","${key}","${escapedValue}","${escapedInfoLeak}"\n`;
      });
    });
  });

  return csv;
}

// Generate HTML content
function generateHTML(data: any, query: string): string {
  const timestamp = new Date().toLocaleString();

  let html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GladiatorrX Search Results - ${query}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6; 
            color: #333; 
            padding: 40px 20px;
            background: #f9fafb;
        }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { border-bottom: 3px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { color: #1f2937; font-size: 32px; margin-bottom: 10px; }
        .header .subtitle { color: #6b7280; font-size: 14px; }
        .meta { background: #eff6ff; padding: 15px; border-radius: 8px; margin-bottom: 30px; }
        .meta-item { display: inline-block; margin-right: 20px; font-size: 14px; }
        .meta-label { font-weight: 600; color: #1f2937; }
        .database { margin-bottom: 30px; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
        .database-header { background: #3b82f6; color: white; padding: 15px 20px; }
        .database-header h2 { font-size: 20px; margin-bottom: 5px; }
        .database-info { font-size: 13px; opacity: 0.9; margin-top: 8px; padding: 10px; background: rgba(255,255,255,0.1); border-radius: 4px; }
        .database-content { padding: 20px; }
        .record { background: #f9fafb; padding: 15px; margin-bottom: 15px; border-radius: 6px; border-left: 3px solid #3b82f6; }
        .record:last-child { margin-bottom: 0; }
        .field { display: grid; grid-template-columns: 200px 1fr; gap: 10px; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
        .field:last-child { border-bottom: none; }
        .field-name { font-weight: 600; color: #374151; }
        .field-value { color: #6b7280; word-break: break-all; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px; }
        @media print {
            body { background: white; }
            .container { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>GladiatorrX Security Report</h1>
            <p class="subtitle">Cyber Security Intelligence Platform</p>
        </div>
        
        <div class="meta">
            <div class="meta-item"><span class="meta-label">Search Query:</span> ${query}</div>
            <div class="meta-item"><span class="meta-label">Date:</span> ${timestamp}</div>
            <div class="meta-item"><span class="meta-label">Databases:</span> ${
              data.NumOfDatabase
            }</div>
            <div class="meta-item"><span class="meta-label">Total Results:</span> ${
              data.NumOfResults
            }</div>
            <div class="meta-item"><span class="meta-label">Search Time:</span> ${data[
              "search time"
            ].toFixed(3)}s</div>
        </div>
`;

  Object.entries(data.List).forEach(([dbName, dbData]: [string, any]) => {
    html += `
        <div class="database">
            <div class="database-header">
                <h2>${dbName}</h2>
                <div class="database-info">
                    <strong>Results:</strong> ${dbData.NumOfResults} | 
                    <strong>Info:</strong> ${dbData.InfoLeak}
                </div>
            </div>
            <div class="database-content">
`;

    dbData.Data.forEach((item: any, idx: number) => {
      html += `<div class="record">`;
      Object.entries(item).forEach(([key, value]) => {
        html += `
                    <div class="field">
                        <div class="field-name">${key}:</div>
                        <div class="field-value">${value}</div>
                    </div>
`;
      });
      html += `</div>`;
    });

    html += `
            </div>
        </div>
`;
  });

  html += `
        <div class="footer">
            <p>Generated by GladiatorrX Cyber Security Intelligence Platform</p>
            <p>© 2025 GladiatorrX. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

  return html;
}
