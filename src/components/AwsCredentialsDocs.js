"use client";

import { useState } from "react";

export default function AwsCredentialsDocs() {
  const [showDocs, setShowDocs] = useState(false);

  return (
    <div className="bg-card border border-border rounded-lg p-6 mb-6">
      <button
        onClick={() => setShowDocs(!showDocs)}
        className="flex items-center justify-between w-full text-left"
      >
        <div className="flex items-center">
          <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="font-medium text-foreground">How to get AWS Access Keys?</h3>
        </div>
        <svg 
          className={`w-5 h-5 text-muted-foreground transition-transform ${showDocs ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {showDocs && (
        <div className="mt-4 space-y-4 text-sm text-muted-foreground">
          <div className="bg-muted/30 rounded-lg p-4">
            <h4 className="font-medium text-foreground mb-2">Step-by-Step Guide:</h4>
            <ol className="list-decimal list-inside space-y-2 ml-2">
              <li>
                <strong>Sign in to AWS Console</strong>
                <p className="ml-6 mt-1">Go to <a href="https://console.aws.amazon.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://console.aws.amazon.com</a></p>
              </li>
              <li>
                <strong>Navigate to IAM</strong>
                <p className="ml-6 mt-1">Search for "IAM" in the services search bar</p>
              </li>
              <li>
                <strong>Go to Users</strong>
                <p className="ml-6 mt-1">Click on "Users" in the left sidebar</p>
              </li>
              <li>
                <strong>Select or Create User</strong>
                <p className="ml-6 mt-1">Choose an existing user or create a new one</p>
              </li>
              <li>
                <strong>Create Access Key</strong>
                <p className="ml-6 mt-1">Click on the "Security credentials" tab, then "Create access key"</p>
              </li>
              <li>
                <strong>Choose Use Case</strong>
                <p className="ml-6 mt-1">Select "Application running outside AWS"</p>
              </li>
              <li>
                <strong>Set Permissions</strong>
                <p className="ml-6 mt-1">Attach the "AmazonS3FullAccess" policy (or create a custom policy with minimal S3 permissions)</p>
              </li>
              <li>
                <strong>Download Keys</strong>
                <p className="ml-6 mt-1">Download the CSV file containing your Access Key ID and Secret Access Key</p>
              </li>
            </ol>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <h4 className="font-medium text-yellow-800 mb-1">Security Best Practices:</h4>
                <ul className="list-disc list-inside space-y-1 text-yellow-700">
                  <li>Never share your Secret Access Key</li>
                  <li>Use IAM roles when possible instead of access keys</li>
                  <li>Rotate your access keys regularly</li>
                  <li>Grant only the minimum permissions needed</li>
                  <li>Consider using temporary credentials for enhanced security</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="font-medium text-blue-800 mb-1">Required S3 Permissions:</h4>
                <p className="text-blue-700">Your IAM user needs these S3 permissions:</p>
                <ul className="list-disc list-inside mt-1 text-blue-700">
                  <li>s3:ListBucket</li>
                  <li>s3:GetObject</li>
                  <li>s3:PutObject</li>
                  <li>s3:DeleteObject</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 