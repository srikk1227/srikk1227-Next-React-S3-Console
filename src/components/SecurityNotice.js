export default function SecurityNotice() {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
      <div className="flex items-start">
        <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <h3 className="font-medium text-blue-800 mb-1">Security Notice</h3>
          <p className="text-sm text-blue-600">
            Your AWS credentials are encrypted and never stored on our servers. They are only used temporarily to establish a secure connection to your S3 bucket.
          </p>
        </div>
      </div>
    </div>
  );
} 