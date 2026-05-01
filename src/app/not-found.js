import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card border border-border rounded-lg p-6 text-center">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
          <Image 
            src="/logo.png" 
            alt="Next-React-S3-Console Logo" 
            width={32} 
            height={32} 
            className="w-8 h-8"
          />
        </div>
        
        <h1 className="text-2xl font-bold text-foreground dark:text-white mb-2">
          Page Not Found
        </h1>
        
        <p className="text-muted-foreground dark:text-gray-400 mb-6">
          Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or you entered the wrong URL.
        </p>

        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors"
          >
            Go to Home
          </Link>
          
          <Link
            href="/dashboard"
            className="block w-full px-4 py-2 bg-muted dark:bg-secondary text-foreground dark:text-gray-200 rounded-md font-medium hover:bg-muted/80 dark:hover:bg-secondary/70 transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>

        <div className="mt-6 text-sm text-muted-foreground dark:text-gray-400">
          <p>Error Code: 404</p>
        </div>
      </div>
    </div>
  );
} 