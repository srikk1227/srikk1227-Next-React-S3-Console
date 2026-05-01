"use client";
import { useState, useEffect } from "react";

export default function FileSummaryDialog({ 
  isOpen, 
  onClose, 
  file, 
  awsConfig,
  getFileIcon 
}) {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fileInfo, setFileInfo] = useState(null);
  const [currentFileKey, setCurrentFileKey] = useState(null);
  
  // Cache for storing summaries across dialog sessions
  const [summaryCache, setSummaryCache] = useState({});

  useEffect(() => {
    if (isOpen && file && awsConfig) {
      setCurrentFileKey(file.key);
      
      // Check if we have a cached summary for this file
      if (summaryCache[file.key]) {
        const cachedData = summaryCache[file.key];
        setSummary(cachedData.summary);
        setFileInfo(cachedData.fileInfo);
        setError("");
        setLoading(false);
      } else {
        // No cached summary, generate new one
        generateSummary();
      }
    }
  }, [isOpen, file, awsConfig, summaryCache]);

  const generateSummary = async () => {
    if (!file || !awsConfig) return;

    setLoading(true);
    setError("");
    setSummary("");
    setFileInfo(null);

    try {
      const response = await fetch("/api/s3/summarize-file", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accessKeyId: awsConfig.accessKeyId,
          secretAccessKey: awsConfig.secretAccessKey,
          bucketName: awsConfig.bucketName,
          region: awsConfig.region,
          key: file.key,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const fileInfoData = {
          fileName: data.fileName,
          fileType: data.fileType,
          contentLength: data.contentLength,
          wasTruncated: data.wasTruncated,
        };
        
        setSummary(data.summary);
        setFileInfo(fileInfoData);
        
        // Cache the summary for future use
        setSummaryCache(prev => ({
          ...prev,
          [file.key]: {
            summary: data.summary,
            fileInfo: fileInfoData
          }
        }));
      } else {
        setError(data.error || "Failed to generate summary");
      }
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("Error generating summary:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSummary("");
    setError("");
    setFileInfo(null);
    setCurrentFileKey(null);
    setLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <span className="text-xl text-blue-600 dark:text-blue-400">
                {file ? getFileIcon(file.name) : "📄"}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                File Summary
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {file?.name}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 min-h-0">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400 text-center">
                Analyzing file content and generating summary...
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                This may take a few moments for larger files
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-red-800 dark:text-red-200 font-medium">Error</h3>
                  <p className="text-red-700 dark:text-red-300 text-sm mt-1">{error}</p>
                </div>
              </div>
              <button
                onClick={generateSummary}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                Try Again
              </button>
            </div>
          )}

          {summary && !loading && !error && (
            <div className="space-y-4">
              {/* File Info */}
              {fileInfo && (
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">File Type:</span>
                      <span className="ml-2 text-gray-900 dark:text-white font-medium">
                        {fileInfo.fileType?.toUpperCase() || "Unknown"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Size:</span>
                      <span className="ml-2 text-gray-900 dark:text-white font-medium">
                        {fileInfo.contentLength?.toLocaleString()} characters
                      </span>
                    </div>
                  </div>
                  {fileInfo.wasTruncated && (
                    <div className="mt-2 text-amber-600 dark:text-amber-400 text-sm flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      Content was truncated due to file size
                    </div>
                  )}
                </div>
              )}

              {/* Summary */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-blue-900 dark:text-blue-100 font-semibold">AI-Generated Summary</h3>
                </div>
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                    {summary}
                  </p>
                </div>
              </div>

              {/* Powered by Groq */}
              <div className="text-center text-xs text-gray-500 dark:text-gray-400">
                Powered by Groq AI • Generated using Llama 3.2
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 