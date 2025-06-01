"use client";

import React, { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { getToken, isSignedIn } = useAuth();
  
  useEffect(() => {
    const storeToken = async () => {
      if (isSignedIn) {
        try {
          const token = await getToken();
          if (token) {
            localStorage.setItem('clerk-auth-token', token);
          }
        } catch (error) {
          console.error('Failed to get auth token:', error);
        }
      } else {
        localStorage.removeItem('clerk-auth-token');
      }
    };
    
    storeToken();
    
    const interval = setInterval(storeToken, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [isSignedIn, getToken]);
  
  return (
    <div className="auth-layout">
      <main className="auth-layout__main">{children}</main>
    </div>
  );
};

export default Layout;