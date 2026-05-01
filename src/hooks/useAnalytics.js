import { useState, useEffect, useCallback } from 'react';

export function useAnalytics(awsConfig) {
  const [storageAnalytics, setStorageAnalytics] = useState(null);
  const [activityAnalytics, setActivityAnalytics] = useState(null);
  const [optimizations, setOptimizations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get storage analytics
  const getStorageAnalytics = useCallback(async (prefix = '') => {
    if (!awsConfig?.accessKeyId || !awsConfig?.secretAccessKey || !awsConfig?.bucketName) {
      setError('AWS configuration is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analytics/storage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessKeyId: awsConfig.accessKeyId,
          secretAccessKey: awsConfig.secretAccessKey,
          bucketName: awsConfig.bucketName,
          region: awsConfig.region,
          prefix
        }),
      });

      const data = await response.json();

      if (data.success) {
        setStorageAnalytics(data.analytics);
        return data.analytics;
      } else {
        setError(data.error || 'Failed to get storage analytics');
        return null;
      }
    } catch (err) {
      setError(err.message || 'Failed to get storage analytics');
      return null;
    } finally {
      setLoading(false);
    }
  }, [awsConfig]);

  // Get user activity analytics
  const getActivityAnalytics = useCallback(async () => {
    if (!awsConfig?.accessKeyId || !awsConfig?.secretAccessKey || !awsConfig?.bucketName) {
      setError('AWS configuration is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analytics/activity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessKeyId: awsConfig.accessKeyId,
          secretAccessKey: awsConfig.secretAccessKey,
          bucketName: awsConfig.bucketName,
          region: awsConfig.region
        }),
      });

      const data = await response.json();

      if (data.success) {
        setActivityAnalytics(data.analytics);
        return data.analytics;
      } else {
        setError(data.error || 'Failed to get activity analytics');
        return null;
      }
    } catch (err) {
      setError(err.message || 'Failed to get activity analytics');
      return null;
    } finally {
      setLoading(false);
    }
  }, [awsConfig]);

  // Track user activity
  const trackActivity = useCallback(async (action, details = {}) => {
    if (!awsConfig?.accessKeyId || !awsConfig?.secretAccessKey || !awsConfig?.bucketName) {
      console.warn('AWS configuration is required for activity tracking');
      return;
    }

    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      console.warn('Cannot track activity in server environment');
      return;
    }

    try {
      const response = await fetch('/api/analytics/activity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessKeyId: awsConfig.accessKeyId,
          secretAccessKey: awsConfig.secretAccessKey,
          bucketName: awsConfig.bucketName,
          region: awsConfig.region,
          action,
          details
        }),
      });

      const data = await response.json();
      
      if (!data.success) {
        console.warn('Failed to track activity:', data.error);
      }
    } catch (err) {
      console.warn('Failed to track activity:', err.message);
    }
  }, [awsConfig]);

  // Get storage optimizations
  const getOptimizations = useCallback(async (prefix = '') => {
    if (!awsConfig?.accessKeyId || !awsConfig?.secretAccessKey || !awsConfig?.bucketName) {
      setError('AWS configuration is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analytics/optimizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessKeyId: awsConfig.accessKeyId,
          secretAccessKey: awsConfig.secretAccessKey,
          bucketName: awsConfig.bucketName,
          region: awsConfig.region,
          prefix
        }),
      });

      const data = await response.json();

      if (data.success) {
        setOptimizations(data.optimizations);
        return data.optimizations;
      } else {
        setError(data.error || 'Failed to get optimizations');
        return [];
      }
    } catch (err) {
      setError(err.message || 'Failed to get optimizations');
      return [];
    } finally {
      setLoading(false);
    }
  }, [awsConfig]);

  // Generate and download report
  const generateReport = useCallback(async (options = {}, format = 'json', download = false) => {
    if (!awsConfig?.accessKeyId || !awsConfig?.secretAccessKey || !awsConfig?.bucketName) {
      setError('AWS configuration is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analytics/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessKeyId: awsConfig.accessKeyId,
          secretAccessKey: awsConfig.secretAccessKey,
          bucketName: awsConfig.bucketName,
          region: awsConfig.region,
          options,
          format,
          download
        }),
      });

      if (download) {
        // Handle file download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `next-react-s3-console-analytics-${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        return { success: true };
      } else {
        const data = await response.json();
        
        if (data.success) {
          return data;
        } else {
          setError(data.error || 'Failed to generate report');
          return null;
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to generate report');
      return null;
    } finally {
      setLoading(false);
    }
  }, [awsConfig]);

  // Refresh all analytics
  const refreshAnalytics = useCallback(async (prefix = '') => {
    const [storage, activity, optimizations] = await Promise.allSettled([
      getStorageAnalytics(prefix),
      getActivityAnalytics(),
      getOptimizations(prefix)
    ]);

    return {
      storage: storage.status === 'fulfilled' ? storage.value : null,
      activity: activity.status === 'fulfilled' ? activity.value : null,
      optimizations: optimizations.status === 'fulfilled' ? optimizations.value : []
    };
  }, [getStorageAnalytics, getActivityAnalytics, getOptimizations]);

  // Clear analytics data
  const clearAnalytics = useCallback(() => {
    setStorageAnalytics(null);
    setActivityAnalytics(null);
    setOptimizations([]);
    setError(null);
  }, []);

  return {
    // State
    storageAnalytics,
    activityAnalytics,
    optimizations,
    loading,
    error,
    
    // Actions
    getStorageAnalytics,
    getActivityAnalytics,
    trackActivity,
    getOptimizations,
    generateReport,
    refreshAnalytics,
    clearAnalytics
  };
} 