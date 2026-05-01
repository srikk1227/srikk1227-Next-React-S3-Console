// Analytics library for Next-React-S3-Console
// Handles storage analytics, user activity tracking, cost calculations, and performance metrics

import { S3Client, ListObjectsV2Command, GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { safeLocalStorage } from './storage';

// AWS S3 Pricing (as of 2024 - update as needed)
const S3_PRICING = {
  'us-east-1': {
    storage: {
      standard: 0.023, // per GB per month
      ia: 0.0125, // per GB per month
      glacier: 0.004, // per GB per month
      deepArchive: 0.00099 // per GB per month
    },
    requests: {
      get: 0.0004, // per 1,000 requests
      put: 0.0005, // per 1,000 requests
      delete: 0.0004 // per 1,000 requests
    },
    dataTransfer: {
      out: 0.09 // per GB
    }
  }
  // Add more regions as needed
};

// Storage class mapping
const STORAGE_CLASSES = {
  'STANDARD': 'standard',
  'STANDARD_IA': 'ia',
  'GLACIER': 'glacier',
  'DEEP_ARCHIVE': 'deepArchive',
  'INTELLIGENT_TIERING': 'standard' // Default to standard pricing
};

export class AnalyticsService {
  constructor(awsConfig) {
    this.awsConfig = awsConfig;
    this.s3Client = new S3Client({
      region: awsConfig.region || 'us-east-1',
      credentials: {
        accessKeyId: awsConfig.accessKeyId,
        secretAccessKey: awsConfig.secretAccessKey,
      },
    });
    this.region = awsConfig.region || 'us-east-1';
  }

  // Format file size to human readable format
  formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Get file extension and type
  getFileType(filename) {
    const ext = filename.split('.').pop()?.toLowerCase();
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];
    const videoExts = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'];
    const audioExts = ['mp3', 'wav', 'flac', 'aac', 'ogg'];
    const docExts = ['pdf', 'doc', 'docx', 'txt', 'rtf'];
    const codeExts = ['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'c', 'html', 'css', 'json', 'xml', 'yaml', 'yml'];
    const archiveExts = ['zip', 'rar', '7z', 'tar', 'gz'];
    
    if (imageExts.includes(ext)) return 'image';
    if (videoExts.includes(ext)) return 'video';
    if (audioExts.includes(ext)) return 'audio';
    if (docExts.includes(ext)) return 'document';
    if (codeExts.includes(ext)) return 'code';
    if (archiveExts.includes(ext)) return 'archive';
    return 'other';
  }

  // Calculate storage analytics
  async getStorageAnalytics(prefix = '') {
    try {
      const analytics = {
        totalFiles: 0,
        totalSize: 0,
        totalFolders: 0,
        fileTypes: {},
        storageClasses: {},
        sizeDistribution: {
          small: 0, // < 1MB
          medium: 0, // 1MB - 100MB
          large: 0, // 100MB - 1GB
          huge: 0 // > 1GB
        },
        recentActivity: {
          last24h: 0,
          last7d: 0,
          last30d: 0
        },
        costEstimate: 0
      };

      let continuationToken = undefined;
      const now = new Date();

      do {
        const command = new ListObjectsV2Command({
          Bucket: this.awsConfig.bucketName,
          Prefix: prefix,
          ContinuationToken: continuationToken,
          MaxKeys: 1000,
        });

        const response = await this.s3Client.send(command);

        if (response.Contents) {
          for (const item of response.Contents) {
            // Skip the prefix itself
            if (item.Key === prefix) continue;

            const isFolder = item.Key.endsWith('/');
            const fileName = item.Key.split('/').pop();
            
            if (isFolder) {
              analytics.totalFolders++;
            } else {
              analytics.totalFiles++;
              analytics.totalSize += item.Size;

              // File type analysis
              const fileType = this.getFileType(fileName);
              analytics.fileTypes[fileType] = (analytics.fileTypes[fileType] || 0) + 1;

              // Storage class analysis
              const storageClass = item.StorageClass || 'STANDARD';
              analytics.storageClasses[storageClass] = (analytics.storageClasses[storageClass] || 0) + 1;

              // Size distribution
              const sizeMB = item.Size / (1024 * 1024);
              if (sizeMB < 1) analytics.sizeDistribution.small++;
              else if (sizeMB < 100) analytics.sizeDistribution.medium++;
              else if (sizeMB < 1024) analytics.sizeDistribution.large++;
              else analytics.sizeDistribution.huge++;

              // Recent activity
              const daysSinceModified = (now - item.LastModified) / (1000 * 60 * 60 * 24);
              if (daysSinceModified <= 1) analytics.recentActivity.last24h++;
              if (daysSinceModified <= 7) analytics.recentActivity.last7d++;
              if (daysSinceModified <= 30) analytics.recentActivity.last30d++;
            }
          }
        }

        continuationToken = response.NextContinuationToken;
      } while (continuationToken);

      // Calculate cost estimate
      analytics.costEstimate = this.calculateStorageCost(analytics);

      return {
        success: true,
        analytics
      };
    } catch (error) {
      console.error('Error getting storage analytics:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Calculate storage cost based on usage
  calculateStorageCost(analytics) {
    const pricing = S3_PRICING[this.region] || S3_PRICING['us-east-1'];
    const storageGB = analytics.totalSize / (1024 * 1024 * 1024);
    
    // Estimate based on standard storage class (most common)
    const monthlyCost = storageGB * pricing.storage.standard;
    
    return {
      monthly: monthlyCost,
      yearly: monthlyCost * 12,
      storageGB: storageGB
    };
  }

  // Get performance metrics for upload/download operations
  async getPerformanceMetrics() {
    // This would typically be tracked over time
    // For now, return sample data structure
    return {
      uploadSpeed: {
        average: 0, // MB/s
        recent: [] // Last 10 uploads
      },
      downloadSpeed: {
        average: 0, // MB/s
        recent: [] // Last 10 downloads
      },
      operationLatency: {
        upload: 0, // ms
        download: 0, // ms
        list: 0 // ms
      }
    };
  }

  // Get storage optimization recommendations
  getStorageOptimizations(analytics) {
    const recommendations = [];

    // Check for large files that could be compressed
    if (analytics.sizeDistribution.huge > 0) {
      recommendations.push({
        type: 'compression',
        title: 'Large Files Detected',
        description: `You have ${analytics.sizeDistribution.huge} files larger than 1GB. Consider compressing them to reduce storage costs.`,
        potentialSavings: '20-50% storage reduction',
        priority: 'high'
      });
    }

    // Check for infrequently accessed files
    if (analytics.recentActivity.last30d < analytics.totalFiles * 0.8) {
      recommendations.push({
        type: 'storage_class',
        title: 'Infrequently Accessed Files',
        description: 'Many files haven\'t been accessed recently. Consider moving them to cheaper storage classes.',
        potentialSavings: '50-70% storage cost reduction',
        priority: 'medium'
      });
    }

    // Check for duplicate file types
    const fileTypeEntries = Object.entries(analytics.fileTypes);
    const dominantTypes = fileTypeEntries.filter(([_, count]) => count > analytics.totalFiles * 0.3);
    
    if (dominantTypes.length > 0) {
      recommendations.push({
        type: 'organization',
        title: 'File Type Distribution',
        description: `Your storage is dominated by ${dominantTypes.map(([type, _]) => type).join(', ')} files. Consider organizing them into dedicated folders.`,
        potentialSavings: 'Better organization and faster access',
        priority: 'low'
      });
    }

    return recommendations;
  }

  // Track user activity (to be called from components)
  trackUserActivity(action, details = {}) {
    const activity = {
      timestamp: new Date().toISOString(),
      action,
      details,
      userId: this.awsConfig.accessKeyId, // Use access key as user identifier
      bucket: this.awsConfig.bucketName,
      region: this.region
    };

    // Store activity using safe localStorage utilities
    const activities = safeLocalStorage.getItem('next-react-s3-console_activities', []);
    activities.push(activity);
    
    // Keep only last 1000 activities
    if (activities.length > 1000) {
      activities.splice(0, activities.length - 1000);
    }
    
    safeLocalStorage.setItem('next-react-s3-console_activities', activities);
    
    return activity;
  }

  // Get user activity analytics
  getUserActivityAnalytics() {
    const activities = safeLocalStorage.getItem('next-react-s3-console_activities', []);
    
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const analytics = {
      totalActions: activities.length,
      actionsByType: {},
      recentActivity: {
        last24h: activities.filter(a => new Date(a.timestamp) > last24h).length,
        last7d: activities.filter(a => new Date(a.timestamp) > last7d).length,
        last30d: activities.filter(a => new Date(a.timestamp) > last30d).length
      },
      activityTimeline: [],
      mostActiveHours: {},
      mostActiveDays: {}
    };

    // Group by action type
    activities.forEach(activity => {
      analytics.actionsByType[activity.action] = (analytics.actionsByType[activity.action] || 0) + 1;
    });

    // Activity timeline (last 30 days)
    const timeline = {};
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      timeline[dateStr] = 0;
    }

    activities.forEach(activity => {
      const activityDate = new Date(activity.timestamp).toISOString().split('T')[0];
      if (timeline[activityDate] !== undefined) {
        timeline[activityDate]++;
      }
    });

    analytics.activityTimeline = Object.entries(timeline).map(([date, count]) => ({
      date,
      count
    }));

    return analytics;
  }

  // Generate custom reports
  async generateCustomReport(options = {}) {
    const {
      includeStorage = true,
      includeActivity = true,
      includeCosts = true,
      includeOptimizations = true,
      dateRange = '30d'
    } = options;

    const report = {
      generatedAt: new Date().toISOString(),
      dateRange,
      summary: {},
      details: {}
    };

    if (includeStorage) {
      // Get storage analytics
      const storageResult = await this.getStorageAnalytics();
      report.details.storage = storageResult.success ? storageResult.analytics : null;
    }

    if (includeActivity) {
      report.details.activity = this.getUserActivityAnalytics();
    }

    if (includeCosts) {
      const storageResult = await this.getStorageAnalytics();
      if (storageResult.success) {
        report.details.costs = this.calculateStorageCost(storageResult.analytics);
      }
    }

    if (includeOptimizations) {
      const storageResult = await this.getStorageAnalytics();
      if (storageResult.success) {
        report.details.optimizations = this.getStorageOptimizations(storageResult.analytics);
      }
    }

    return report;
  }

  // Export analytics data
  async exportAnalyticsData(format = 'json') {
    const data = {
      storage: await this.getStorageAnalytics(),
      activity: this.getUserActivityAnalytics(),
      performance: await this.getPerformanceMetrics(),
      generatedAt: new Date().toISOString()
    };

    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    } else if (format === 'csv') {
      // Convert to CSV format
      return this.convertToCSV(data);
    }

    return data;
  }

  // Convert data to CSV format
  convertToCSV(data) {
    // Implementation for CSV conversion
    // This is a simplified version
    const csvRows = [];
    
    // Add headers
    csvRows.push(['Metric', 'Value']);
    
    // Add data
    if (data.storage.success) {
      csvRows.push(['Total Files', data.storage.analytics.totalFiles]);
      csvRows.push(['Total Size (bytes)', data.storage.analytics.totalSize]);
      csvRows.push(['Total Folders', data.storage.analytics.totalFolders]);
    }
    
    return csvRows.map(row => row.join(',')).join('\n');
  }
}

// Utility functions
export const formatBytes = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

export const formatPercentage = (value, total) => {
  if (total === 0) return '0%';
  return ((value / total) * 100).toFixed(1) + '%';
};

 