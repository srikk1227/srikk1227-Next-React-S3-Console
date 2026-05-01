"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import LoadingSpinner from '@/components/LoadingSpinner';
import ProtectedRoute from '@/components/ProtectedRoute';
import { loadAwsConfig } from '@/lib/sessionAwsConfig';

function AnalyticsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [awsConfig, setAwsConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Wait for user authentication to load
    if (!isLoaded) return;

    // If user is not authenticated, redirect to sign-in
    if (!user) {
      router.push('/sign-in');
      return;
    }

    const loadConfig = async () => {
      try {
        const config = loadAwsConfig();
        if (config) {
          setAwsConfig(config);
        } else {
          setError('No AWS configuration found. Please connect to your S3 bucket first.');
        }
      } catch (err) {
        setError('Failed to load AWS configuration');
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, [user, isLoaded, router]);

  const handleBackToFileManager = () => {
    router.push('/dashboard');
  };

  // Show loading while authentication is being determined
  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-muted-foreground">
            {!isLoaded ? 'Checking authentication...' : 'Loading analytics dashboard...'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-red-200 dark:border-red-800 p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Configuration Required</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">{error}</p>
              <button
                onClick={handleBackToFileManager}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to File Manager
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      
      {/* Analytics Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Analytics Dashboard
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                Comprehensive insights into your S3 storage and usage patterns
              </p>
            </div>
            {awsConfig && (
              <div className="flex items-center space-x-3">
                <div className="bg-white dark:bg-slate-800 rounded-xl px-4 py-2 border border-slate-200 dark:border-slate-700">
                  <span className="text-sm text-slate-500 dark:text-slate-400">Bucket:</span>
                  <span className="ml-2 font-medium text-slate-900 dark:text-white">{awsConfig.bucketName}</span>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl px-4 py-2 border border-slate-200 dark:border-slate-700">
                  <span className="text-sm text-slate-500 dark:text-slate-400">Region:</span>
                  <span className="ml-2 font-medium text-slate-900 dark:text-white">{awsConfig.region}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Dashboard Content */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <AnalyticsDashboard 
            awsConfig={awsConfig} 
            currentPrefix=""
          />
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsPageWrapper() {
  return (
    <ProtectedRoute>
      <AnalyticsPage />
    </ProtectedRoute>
  );
} 