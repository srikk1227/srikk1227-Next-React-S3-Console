"use client";
import { Suspense, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import LoadingSpinner from "./LoadingSpinner";

export default function ProtectedRoute({ children }) {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) {
    return <LoadingSpinner size="lg" fullScreen={true} />;
  }

  if (!isSignedIn) {
    return <LoadingSpinner size="lg" fullScreen={true} />;
  }

  return (
    <Suspense fallback={<LoadingSpinner size="lg" fullScreen={true} />}>
      {children}
    </Suspense>
  );
} 