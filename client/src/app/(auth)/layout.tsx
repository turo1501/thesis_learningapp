"use client";

import React, { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { getToken, isSignedIn } = useAuth();
  
  // Đảm bảo token được lưu vào localStorage cho các API calls
  useEffect(() => {
    const storeToken = async () => {
      if (isSignedIn) {
        try {
          const token = await getToken();
          if (token) {
            localStorage.setItem('clerk-auth-token', token);
            console.log('Token stored in localStorage');
          }
        } catch (error) {
          console.error('Failed to get auth token:', error);
        }
      } else {
        // Xóa token khi đăng xuất
        localStorage.removeItem('clerk-auth-token');
      }
    };
    
    storeToken();
    
    // Thiết lập interval để cập nhật token mỗi 5 phút
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