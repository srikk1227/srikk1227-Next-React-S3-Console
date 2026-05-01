"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import FileManager from "@/components/FileManager";
import AwsConfigForm from "@/components/AwsConfigForm";
import AwsCredentialsDocs from "@/components/AwsCredentialsDocs";
import SecurityNotice from "@/components/SecurityNotice";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAwsRegions } from "@/hooks/useAwsRegions";
import { useAwsConnection } from "@/hooks/useAwsConnection";
import { saveAwsConfig, loadAwsConfig, clearAwsConfig } from "@/lib/sessionAwsConfig";
import LoadingSpinner from "@/components/LoadingSpinner";

function DashboardContent() {
  const { user } = useUser();
  const { regions, loading: loadingRegions } = useAwsRegions();
  const { isConnected, isLoading, error, errorDetails, connect, disconnect } = useAwsConnection();
  
  const [awsConfig, setAwsConfig] = useState({
    accessKeyId: "",
    secretAccessKey: "",
    bucketName: "",
    region: "us-east-1"
  });
  const [autoConnected, setAutoConnected] = useState(false);
  const [isAutoConnecting, setIsAutoConnecting] = useState(true);

  // On mount, load config from sessionStorage and auto-connect if present
  useEffect(() => {
    const stored = loadAwsConfig();
    if (stored && !autoConnected) {
      setAwsConfig(stored);
      // Try to connect automatically
      (async () => {
        try {
          await connect(stored);
        } catch (error) {
          console.log('Auto-connection failed:', error);
        } finally {
          setAutoConnected(true);
          setIsAutoConnecting(false);
        }
      })();
    } else {
      setIsAutoConnecting(false);
    }
    // eslint-disable-next-line
  }, []);

  // On connect, save config to sessionStorage
  useEffect(() => {
    if (isConnected) {
      saveAwsConfig(awsConfig);
    }
    // eslint-disable-next-line
  }, [isConnected]);

  const handleConfigChange = (newConfig) => {
    setAwsConfig(newConfig);
  };

  const handleConnect = async (e) => {
    e.preventDefault();
    await connect(awsConfig);
    // Saving is handled by useEffect above
  };

  const handleDisconnect = () => {
    disconnect();
    setAwsConfig({
      accessKeyId: "",
      secretAccessKey: "",
      bucketName: "",
      region: "us-east-1"
    });
    clearAwsConfig();
    setAutoConnected(false);
  };

  // Show loading spinner while auto-connecting
  if (isAutoConnecting) {
    return <LoadingSpinner size="lg" fullScreen={true} />;
  }

  // If connected, show the file manager
  if (isConnected) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-6xl mx-auto">
          <FileManager 
            awsConfig={awsConfig} 
            onDisconnect={handleDisconnect}
          />
        </div>
      </div>
    );
  }

  // Show configuration form when not connected
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Next-React-S3-Console Dashboard
          </h1>
          <p className="text-muted-foreground">
            Configure your AWS connection and manage your S3 files
          </p>
        </div>

        {/* AWS Configuration Form */}
        <AwsConfigForm
          awsConfig={awsConfig}
          onConfigChange={handleConfigChange}
          onSubmit={handleConnect}
          isLoading={isLoading}
          error={error}
          errorDetails={errorDetails}
          regions={regions}
          loadingRegions={loadingRegions}
        />

        {/* AWS Credentials Documentation */}
        <AwsCredentialsDocs />

        {/* Security Notice */}
        <SecurityNotice />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
} 