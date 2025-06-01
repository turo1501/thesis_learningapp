"use client"

import React, { useEffect } from "react"
import StoreProvider from "@/state/redux"
import { useAuth } from "@clerk/nextjs"
import { SWRConfig } from "swr"

export default function Providers({ children }: { children: React.ReactNode }) {
  const { getToken, isSignedIn } = useAuth();

  // Handle authentication token management globally
  useEffect(() => {
    if (!isSignedIn) return;

    const syncAuthToken = async () => {
      try {
        const token = await getToken();
        if (token) {
          localStorage.setItem('clerk-auth-token', token);
          sessionStorage.setItem('clerk-auth-token', token);
        }
      } catch (error) {
        console.error('Failed to get auth token in providers:', error);
      }
    };

    // Sync token immediately
    syncAuthToken();
    
    // Set up refresh interval (every 4 minutes)
    const interval = setInterval(syncAuthToken, 4 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [isSignedIn, getToken]);

  // Global error handler for browser extension conflicts
  useEffect(() => {
    // This helps prevent errors from browser extensions (like content.js)
    // that might interfere with our application
    const handleGlobalError = (event: ErrorEvent) => {
      // Check if the error is related to common browser extension conflicts
      if (event.message && (
          event.message.includes('getActiveObject') || 
          event.message.includes('content.js') ||
          event.message.includes('Cannot read properties of undefined')
        )) {
        console.warn('Caught browser extension conflict:', event.message);
        console.warn('This error is being suppressed as it likely comes from a browser extension and not the application.');
        event.preventDefault();
        event.stopPropagation();
      }
    };

    // Add error event listener
    window.addEventListener('error', handleGlobalError);
    
    // Clean up
    return () => {
      window.removeEventListener('error', handleGlobalError);
    };
  }, []);

  // Configure SWR for consistent data fetching
  return (
    <SWRConfig 
      value={{
        revalidateOnFocus: false,
        errorRetryCount: 3,
        dedupingInterval: 5000,
      }}
    >
      <StoreProvider>{children}</StoreProvider>
    </SWRConfig>
  );
} 