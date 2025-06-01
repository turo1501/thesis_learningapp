"use client";
import AppSidebar from "@/components/AppSidebar";
import Loading from "@/components/Loading";
import Navbar from "@/components/Navbar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useUser, useAuth } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import ChaptersSidebar from "./user/courses/[courseId]/ChaptersSidebar";
import ChatBot from "@/components/ChatBot";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [courseId, setCourseId] = useState<string | null>(null);
  const [isTokenReady, setIsTokenReady] = useState(false);
  const { user, isLoaded } = useUser();
  const { getToken, isSignedIn } = useAuth();
  const isCoursePage = /^\/user\/courses\/[^\/]+(?:\/chapters\/[^\/]+)?$/.test(
    pathname
  );

  useEffect(() => {
    if (isCoursePage) {
      const match = pathname.match(/\/user\/courses\/([^\/]+)/);
      setCourseId(match ? match[1] : null);
    } else {
      setCourseId(null);
    }
  }, [isCoursePage, pathname]);

  useEffect(() => {
    const storeToken = async () => {
      if (isSignedIn) {
        try {
          const token = await getToken();
          if (token) {
            localStorage.setItem('clerk-auth-token', token);
            sessionStorage.setItem('clerk-auth-token', token);
            console.log('Token stored in localStorage in dashboard layout');
            setIsTokenReady(true);
          } else {
            console.error('Token is empty or undefined');
            setIsTokenReady(false);
          }
        } catch (error) {
          console.error('Failed to get auth token:', error);
          setIsTokenReady(false);
        }
      } else {
        localStorage.removeItem('clerk-auth-token');
        sessionStorage.removeItem('clerk-auth-token');
        setIsTokenReady(false);
      }
    };
    
    // Immediately try to get and store token
    storeToken();
    
    // Set up refresh interval (every 4 minutes to be safe with 5 minute expiry)
    const interval = setInterval(storeToken, 4 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [isSignedIn, getToken]);

  if (!isLoaded) return <Loading />;
  if (!user) return <div>Please sign in to access this page.</div>;
  if (!isTokenReady) return <Loading />;

  return (
    <SidebarProvider>
      <div className="dashboard">
        <AppSidebar />
        <div className="dashboard__content">
          {courseId && <ChaptersSidebar />}
          <div
            className={cn(
              "dashboard__main",
              isCoursePage && "dashboard__main--not-course"
            )}
            style={{ height: "100vh" }}
          >
            <Navbar isCoursePage={isCoursePage} />
            <main className="dashboard__body">{children}</main>
          </div>
        </div>
        <ChatBot />
      </div>
    </SidebarProvider>
  );
}