"use client";
import { useEffect } from "react";

export default function ProductionError({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service in production
    if (process.env.NODE_ENV === "production") {
      console.error("Error:: ", error);
      // Example: Sentry.captureException(error);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card border border-border rounded-lg p-6 text-center">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        
        <h1 className="text-xl font-semibold text-foreground dark:text-white mb-2">
          Something went wrong
        </h1>
        
        <p className="text-muted-foreground dark:text-gray-400 mb-6">
          We're sorry, but something unexpected happened. Our team has been notified and is working to fix this issue.
        </p>

        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
          
          <button
            onClick={() => window.location.href = "/"}
            className="w-full px-4 py-2 bg-muted dark:bg-secondary text-foreground dark:text-gray-200 rounded-md font-medium hover:bg-muted/80 dark:hover:bg-secondary/70 transition-colors"
          >
            Go to Home
          </button>
        </div>

        {process.env.NODE_ENV === "development" && (
          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-sm text-muted-foreground dark:text-gray-400 hover:text-foreground dark:hover:text-white">
              Error Details (Development)
            </summary>
            <div className="mt-2 p-3 bg-muted dark:bg-secondary rounded-md text-xs font-mono text-foreground dark:text-gray-300 overflow-auto">
              <pre className="whitespace-pre-wrap">{error.message}</pre>
            </div>
          </details>
        )}
      </div>
    </div>
  );
} 