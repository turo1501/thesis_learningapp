"use client";

import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Bell, BookOpen, FileText, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const NonDashboardNavbar = () => {
  const { user } = useUser();
  const userRole = user?.publicMetadata?.userType as "student" | "teacher" | "admin";
  const pathname = usePathname();
  
  // Determine dashboard URL based on user role
  const getDashboardUrl = () => {
    if (userRole === "teacher") return "/teacher/courses";
    if (userRole === "admin") return "/admin/dashboard";
    return "/user/courses"; // Default for student
  };
  
  // Check if current path is the dashboard path
  const isDashboardActive = pathname.includes("/teacher/") || 
                           pathname.includes("/user/") || 
                           pathname.includes("/admin/");


  return (
    <nav className="nondashboard-navbar">
      <div className="nondashboard-navbar__container">
        <div className="nondashboard-navbar__search">
          <Link href="/" className="nondashboard-navbar__brand" scroll={false}>
            2
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/blog"
              className="flex items-center gap-2 text-customgreys-dirtyGrey hover:text-white-100 transition-colors"
              scroll={false}
            >
              <FileText size={18} />
              <span className="hidden sm:inline">Blog</span>
            </Link>
            
            {/* Dashboard button - only visible when signed in */}
            <SignedIn>
              <Link
                href={getDashboardUrl()}
                className={`flex items-center gap-2 ${isDashboardActive ? 'text-white-100' : 'text-customgreys-dirtyGrey hover:text-white-100'} transition-colors`}

                scroll={false}
              >
                <LayoutDashboard size={18} />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
            </SignedIn>
            
            <div className="relative group">
              <Link
                href="/search"
                className="nondashboard-navbar__search-input"
                scroll={false}
              >
                <span className="hidden sm:inline">Homepage</span>
                <span className="sm:hidden">Home</span>
              </Link>
              <BookOpen
                className="nondashboard-navbar__search-icon"
                size={18}
              />
            </div>
          </div>
        </div>
        <div className="nondashboard-navbar__actions">
          <button className="nondashboard-navbar__notification-button">
            <span className="nondashboard-navbar__notification-indicator"></span>
            <Bell className="nondashboard-navbar__notification-icon" />
          </button>

          <SignedIn>
            <UserButton
              appearance={{
                baseTheme: dark,
                elements: {
                  userButtonOuterIdentifier: "text-customgreys-dirtyGrey",
                  userButtonBox: "scale-90 sm:scale-100",
                },
              }}
              showName={true}
              userProfileMode="navigation"
              userProfileUrl={
                userRole === "teacher" 
                  ? "/teacher/profile" 
                  : userRole === "admin"
                    ? "/admin/profile"
                    : "/user/profile"

              }
            />
          </SignedIn>
          <SignedOut>
            <Link
              href="/signin"
              className="nondashboard-navbar__auth-button--login"
              scroll={false}
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="nondashboard-navbar__auth-button--signup"
              scroll={false}
            >
              Sign up
            </Link>
          </SignedOut>
        </div>
      </div>
    </nav>
  );
};

export default NonDashboardNavbar;
    </nav>
  );
};

export default NonDashboardNavbar;