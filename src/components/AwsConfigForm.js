"use client";

import { useState } from "react";

export default function AwsConfigForm({ 
  awsConfig, 
  onConfigChange, 
  onSubmit, 
  isLoading, 
  error, 
  errorDetails,
  regions,
  loadingRegions 
}) {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onConfigChange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 mb-6">
      <h2 className="text-xl font-semibold text-foreground mb-4">
        AWS Credentials
      </h2>
      
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="accessKeyId" className="block text-sm font-medium text-foreground mb-2">
              Access Key ID *
            </label>
            <input
              type="text"
              id="accessKeyId"
              name="accessKeyId"
              value={awsConfig.accessKeyId}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="AKIA..."
              disabled={isLoading}
              required
            />
          </div>
          
          <div>
            <label htmlFor="secretAccessKey" className="block text-sm font-medium text-foreground mb-2">
              Secret Access Key *
            </label>
            <input
              type="password"
              id="secretAccessKey"
              name="secretAccessKey"
              value={awsConfig.secretAccessKey}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter your secret access key"
              disabled={isLoading}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="bucketName" className="block text-sm font-medium text-foreground mb-2">
              Bucket Name *
            </label>
            <input
              type="text"
              id="bucketName"
              name="bucketName"
              value={awsConfig.bucketName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="my-bucket-name"
              disabled={isLoading}
              required
            />
          </div>
          
          <div>
            <label htmlFor="region" className="block text-sm font-medium text-foreground mb-2">
              AWS Region
            </label>
            <select
              id="region"
              name="region"
              value={awsConfig.region}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              disabled={isLoading || loadingRegions}
            >
              {loadingRegions ? (
                <option value="">Loading regions...</option>
              ) : (
                regions.map((region) => (
                  <option key={region.value} value={region.value}>
                    {region.name} - {region.value}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm font-medium mb-2">{error}</p>
            {errorDetails && (
              <div className="text-xs text-red-500">
                <p>Error Code: {errorDetails.code || 'N/A'}</p>
                <p>Error Type: {errorDetails.name || 'N/A'}</p>
                {errorDetails.requestId && (
                  <p>Request ID: {errorDetails.requestId}</p>
                )}
              </div>
            )}
          </div>
        )}

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Connecting..." : "Connect to AWS"}
          </button>
        </div>
      </form>
    </div>
  );
} 