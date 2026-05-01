import { useState } from 'react';

export function useAwsConnection() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [errorDetails, setErrorDetails] = useState(null);

  const connect = async (awsConfig) => {
    setIsLoading(true);
    setError("");
    setErrorDetails(null);

    try {
      // Validate inputs
      if (!awsConfig.accessKeyId || !awsConfig.secretAccessKey || !awsConfig.bucketName) {
        throw new Error("Please fill in all required fields");
      }

      console.log('Attempting to connect with config:', {
        region: awsConfig.region,
        bucketName: awsConfig.bucketName,
        hasAccessKey: !!awsConfig.accessKeyId,
        hasSecretKey: !!awsConfig.secretAccessKey
      });

      // Test AWS connection using server-side API
      const response = await fetch('/api/s3/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(awsConfig),
      });

      const result = await response.json();
      
      if (!result.success) {
        setErrorDetails(result.details);
        throw new Error(result.error);
      }
      
      setIsConnected(true);
      setError("");
      setErrorDetails(null);
    } catch (err) {
      setError(err.message);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = () => {
    setIsConnected(false);
    setError("");
    setErrorDetails(null);
  };

  return {
    isConnected,
    isLoading,
    error,
    errorDetails,
    connect,
    disconnect
  };
} 