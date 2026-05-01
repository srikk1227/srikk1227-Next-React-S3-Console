"use client";

import { useState, useEffect } from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { formatBytes, formatCurrency, formatPercentage } from '@/lib/analytics';
import LoadingSpinner from './LoadingSpinner';

export default function AnalyticsDashboard({ awsConfig, currentPrefix = '' }) {
  const {
    storageAnalytics,
    activityAnalytics,
    optimizations,
    loading,
    error,
    getStorageAnalytics,
    getActivityAnalytics,
    getOptimizations,
    trackActivity,
    generateReport,
    refreshAnalytics
  } = useAnalytics(awsConfig);

  const [activeTab, setActiveTab] = useState('overview');
  const [reportFormat, setReportFormat] = useState('json');

  // Load analytics on mount and when prefix changes
  useEffect(() => {
    if (awsConfig?.accessKeyId) {
      refreshAnalytics(currentPrefix);
    }
  }, [awsConfig, currentPrefix, refreshAnalytics]);

  // Track dashboard view
  useEffect(() => {
    if (awsConfig?.accessKeyId) {
      trackActivity('analytics_dashboard_view', { prefix: currentPrefix });
    }
  }, [awsConfig, currentPrefix, trackActivity]);

  const handleRefresh = async () => {
    await refreshAnalytics(currentPrefix);
    trackActivity('analytics_refresh', { prefix: currentPrefix });
  };

  const handleDownloadReport = async () => {
    await generateReport({}, reportFormat, true);
    trackActivity('analytics_report_download', { format: reportFormat });
  };

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-red-700 dark:text-red-300">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div></div>
        <div className="flex items-center space-x-3">
          <select
            value={reportFormat}
            onChange={(e) => setReportFormat(e.target.value)}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="json">JSON Report</option>
            <option value="csv">CSV Report</option>
          </select>
          <button
            onClick={handleDownloadReport}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download Report
          </button>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-6 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-700 mb-8">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'storage', label: 'Storage Analytics', icon: '💾' },
            { id: 'costs', label: 'Cost Analysis', icon: '💰' },
            { id: 'optimizations', label: 'Optimizations', icon: '⚡' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[500px]">
        {activeTab === 'overview' && (
          <OverviewTab 
            storageAnalytics={storageAnalytics}
            activityAnalytics={activityAnalytics}
            optimizations={optimizations}
            loading={loading}
          />
        )}
        
        {activeTab === 'storage' && (
          <StorageTab 
            storageAnalytics={storageAnalytics}
            loading={loading}
          />
        )}
        
        {/* Activity tab hidden for now */}
        
        {activeTab === 'costs' && (
          <CostsTab 
            storageAnalytics={storageAnalytics}
            loading={loading}
          />
        )}
        
        {activeTab === 'optimizations' && (
          <OptimizationsTab 
            optimizations={optimizations}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ storageAnalytics, activityAnalytics, optimizations, loading }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!storageAnalytics) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No Data Available</h3>
        <p className="text-slate-600 dark:text-slate-400">Connect to your S3 bucket to see analytics data</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Files"
          value={storageAnalytics.totalFiles.toLocaleString()}
          icon="📄"
          trend="+12%"
          trendUp={true}
          color="blue"
        />
        <MetricCard
          title="Total Size"
          value={formatBytes(storageAnalytics.totalSize)}
          icon="💾"
          trend="+8%"
          trendUp={true}
          color="green"
        />
        <MetricCard
          title="Total Folders"
          value={storageAnalytics.totalFolders.toLocaleString()}
          icon="📁"
          trend="+5%"
          trendUp={true}
          color="purple"
        />
        <MetricCard
          title="Recent Activity"
          value={activityAnalytics?.recentActivity?.last7d || 0}
          icon="📈"
          trend="+15%"
          trendUp={true}
          color="orange"
        />
      </div>

      {/* Charts and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Storage Distribution */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Storage Distribution
          </h3>
          <div className="grid grid-cols-2 gap-6">
            {Object.entries(storageAnalytics.sizeDistribution).map(([size, count]) => (
              <div key={size} className="text-center p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{count}</div>
                <div className="text-sm text-slate-600 dark:text-slate-400 capitalize">{size} files</div>
              </div>
            ))}
          </div>
        </div>

        {/* File Types */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center">
            <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            File Types
          </h3>
          <div className="space-y-4">
            {Object.entries(storageAnalytics.fileTypes)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 6)
              .map(([type, count], index) => (
                <div key={type} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      index === 0 ? 'bg-blue-500' :
                      index === 1 ? 'bg-green-500' :
                      index === 2 ? 'bg-purple-500' :
                      index === 3 ? 'bg-orange-500' :
                      index === 4 ? 'bg-red-500' : 'bg-slate-500'
                    }`}></div>
                    <span className="text-sm font-medium text-slate-900 dark:text-white capitalize">{type}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-400">{count}</span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center">
          <svg className="w-5 h-5 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          Recent Activity
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{storageAnalytics.recentActivity.last24h}</div>
            <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">Last 24 hours</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">{storageAnalytics.recentActivity.last7d}</div>
            <div className="text-sm text-green-600 dark:text-green-400 font-medium">Last 7 days</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{storageAnalytics.recentActivity.last30d}</div>
            <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">Last 30 days</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Storage Tab Component
function StorageTab({ storageAnalytics, loading }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!storageAnalytics) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2H6a2 2 0 00-2-2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No Storage Data</h3>
        <p className="text-slate-600 dark:text-slate-400">Storage analytics will appear here once data is available</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Storage Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2H6a2 2 0 00-2-2z" />
            </svg>
            Storage Classes
          </h3>
          <div className="space-y-4">
            {Object.entries(storageAnalytics.storageClasses).map(([class_, count], index) => (
              <div key={class_} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    index === 0 ? 'bg-blue-500' :
                    index === 1 ? 'bg-green-500' :
                    index === 2 ? 'bg-purple-500' : 'bg-slate-500'
                  }`}></div>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">{class_}</span>
                </div>
                <span className="text-sm font-bold text-slate-600 dark:text-slate-400">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center">
            <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Size Distribution
          </h3>
          <div className="space-y-4">
            {Object.entries(storageAnalytics.sizeDistribution).map(([size, count], index) => (
              <div key={size} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    index === 0 ? 'bg-blue-500' :
                    index === 1 ? 'bg-green-500' :
                    index === 2 ? 'bg-purple-500' : 'bg-orange-500'
                  }`}></div>
                  <span className="text-sm font-medium text-slate-900 dark:text-white capitalize">{size}</span>
                </div>
                <span className="text-sm font-bold text-slate-600 dark:text-slate-400">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center">
            <svg className="w-5 h-5 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            File Types
          </h3>
          <div className="space-y-4">
            {Object.entries(storageAnalytics.fileTypes)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 6)
              .map(([type, count], index) => (
                <div key={type} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      index === 0 ? 'bg-blue-500' :
                      index === 1 ? 'bg-green-500' :
                      index === 2 ? 'bg-purple-500' :
                      index === 3 ? 'bg-orange-500' :
                      index === 4 ? 'bg-red-500' : 'bg-slate-500'
                    }`}></div>
                    <span className="text-sm font-medium text-slate-900 dark:text-white capitalize">{type}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-400">{count}</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Activity Tab Component
function ActivityTab({ activityAnalytics, loading }) {
  if (loading) {
    return <LoadingSpinner size="lg" />;
  }

  if (!activityAnalytics) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No activity analytics available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Activity Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Last 24 hours</span>
              <span className="text-sm font-medium">{activityAnalytics.recentActivity.last24h}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Last 7 days</span>
              <span className="text-sm font-medium">{activityAnalytics.recentActivity.last7d}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Last 30 days</span>
              <span className="text-sm font-medium">{activityAnalytics.recentActivity.last30d}</span>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Action Types</h3>
          <div className="space-y-3">
            {Object.entries(activityAnalytics.actionsByType)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 5)
              .map(([action, count]) => (
                <div key={action} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground capitalize">{action.replace('_', ' ')}</span>
                  <span className="text-sm font-medium">{count}</span>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Total Actions</h3>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">{activityAnalytics.totalActions}</div>
            <p className="text-sm text-muted-foreground mt-2">Actions tracked</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Costs Tab Component
function CostsTab({ storageAnalytics, loading }) {
  if (loading) {
    return <LoadingSpinner size="lg" />;
  }

  if (!storageAnalytics?.costEstimate) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No cost data available</p>
      </div>
    );
  }

  const { costEstimate } = storageAnalytics;

  return (
    <div className="space-y-6">
      {/* Cost Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Monthly Cost</h3>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">
              {formatCurrency(costEstimate.monthly)}
            </div>
            <p className="text-sm text-muted-foreground mt-2">Estimated monthly cost</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Yearly Cost</h3>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">
              {formatCurrency(costEstimate.yearly)}
            </div>
            <p className="text-sm text-muted-foreground mt-2">Estimated yearly cost</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Storage Used</h3>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">
              {formatBytes(storageAnalytics.totalSize)}
            </div>
            <p className="text-sm text-muted-foreground mt-2">Total storage</p>
          </div>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Cost Breakdown</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Storage Cost (Standard)</span>
            <span className="text-sm font-medium">{formatCurrency(costEstimate.monthly)}/month</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Data Transfer</span>
            <span className="text-sm font-medium">~$0.00/month</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Request Costs</span>
            <span className="text-sm font-medium">~$0.00/month</span>
          </div>
          <hr className="border-border" />
          <div className="flex items-center justify-between font-semibold">
            <span>Total Estimated Cost</span>
            <span>{formatCurrency(costEstimate.monthly)}/month</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Optimizations Tab Component
function OptimizationsTab({ optimizations, loading }) {
  if (loading) {
    return <LoadingSpinner size="lg" />;
  }

  if (!optimizations || optimizations.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Great job!</h3>
        <p className="text-muted-foreground">No optimization recommendations at this time.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {optimizations.map((optimization, index) => (
        <div key={index} className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-3 ${
                  optimization.priority === 'high' 
                    ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                    : optimization.priority === 'medium'
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                }`}>
                  {optimization.priority} priority
                </span>
                <h3 className="text-lg font-semibold text-foreground">{optimization.title}</h3>
              </div>
              <p className="text-muted-foreground mb-3">{optimization.description}</p>
              <div className="flex items-center text-sm text-green-600 dark:text-green-400">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                Potential savings: {optimization.potentialSavings}
              </div>
            </div>
            <div className="ml-4">
              {optimization.type === 'compression' && (
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              )}
              {optimization.type === 'storage_class' && (
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2H6a2 2 0 00-2-2z" />
                  </svg>
                </div>
              )}
              {optimization.type === 'organization' && (
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Metric Card Component
function MetricCard({ title, value, icon, trend, trendUp, color = "blue" }) {
  const colorClasses = {
    blue: {
      bg: "bg-blue-50 dark:bg-blue-900/20",
      border: "border-blue-200 dark:border-blue-800",
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
      iconColor: "text-blue-600 dark:text-blue-400",
      valueColor: "text-blue-600 dark:text-blue-400",
      trendColor: "text-green-600 dark:text-green-400"
    },
    green: {
      bg: "bg-green-50 dark:bg-green-900/20",
      border: "border-green-200 dark:border-green-800",
      iconBg: "bg-green-100 dark:bg-green-900/30",
      iconColor: "text-green-600 dark:text-green-400",
      valueColor: "text-green-600 dark:text-green-400",
      trendColor: "text-green-600 dark:text-green-400"
    },
    purple: {
      bg: "bg-purple-50 dark:bg-purple-900/20",
      border: "border-purple-200 dark:border-purple-800",
      iconBg: "bg-purple-100 dark:bg-purple-900/30",
      iconColor: "text-purple-600 dark:text-purple-400",
      valueColor: "text-purple-600 dark:text-purple-400",
      trendColor: "text-green-600 dark:text-green-400"
    },
    orange: {
      bg: "bg-orange-50 dark:bg-orange-900/20",
      border: "border-orange-200 dark:border-orange-800",
      iconBg: "bg-orange-100 dark:bg-orange-900/30",
      iconColor: "text-orange-600 dark:text-orange-400",
      valueColor: "text-orange-600 dark:text-orange-400",
      trendColor: "text-green-600 dark:text-green-400"
    }
  };

  const colors = colorClasses[color] || colorClasses.blue;

  return (
    <div className={`${colors.bg} border ${colors.border} rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{title}</p>
          <p className={`text-3xl font-bold ${colors.valueColor}`}>{value}</p>
        </div>
        <div className={`w-12 h-12 ${colors.iconBg} rounded-lg flex items-center justify-center`}>
          <span className="text-xl">{icon}</span>
        </div>
      </div>
      {/* Growth percentage hidden for now */}
    </div>
  );
} 