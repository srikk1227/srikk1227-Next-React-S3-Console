const STORAGE_KEY = "next-react-s3-console_aws_config";

export function saveAwsConfig(config) {
  if (!config || !config.accessKeyId || !config.secretAccessKey || !config.bucketName) return;
  const encoded = btoa(JSON.stringify(config));
  localStorage.setItem(STORAGE_KEY, encoded);
}

export function loadAwsConfig() {
  const encoded = localStorage.getItem(STORAGE_KEY);
  if (!encoded) return null;
  try {
    return JSON.parse(atob(encoded));
  } catch {
    return null;
  }
}

export function clearAwsConfig() {
  localStorage.removeItem(STORAGE_KEY);
} 