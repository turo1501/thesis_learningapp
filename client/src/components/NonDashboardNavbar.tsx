"use client";

import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { 
  Bell, 
  BookOpen, 
  FileText, 
  LayoutDashboard, 
  ChevronRight, 
  Search, 
  Sparkles,
  LifeBuoy,
  Menu
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const NonDashboardNavbar = () => {
  const { user } = useUser();
  const userRole = user?.publicMetadata?.userType as "student" | "teacher" | "admin";
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
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
    <nav 
      className={cn(
        "fixed top-0 left-0 w-full z-50 transition-all duration-300",
        isScrolled ? "bg-customgreys-primarybg/80 backdrop-blur-lg shadow-lg shadow-black/10" : "bg-transparent"
      )}
    >
      <div className="max-w-[1600px] w-[100%] mx-auto px-4">
        <div className="flex justify-between items-center h-20 xl:h-28 2xl:h-32">
          {/* Logo and Left Section */}
          <div className="flex items-center gap-6 xl:gap-10 2xl:gap-12">
            <Link href="/" className="flex items-center" scroll={false}>
              <div className="relative h-10 w-10 xl:h-14 xl:w-14 2xl:h-16 2xl:w-16 mr-2 xl:mr-3">
                <Image 
                  src="/logo2.png" 
                  alt="Logo" 
                  fill 
                  sizes="(max-width: 768px) 40px, (max-width: 1200px) 56px, 64px"
                  className="object-contain" 
                />
              </div>
              <span className="text-xl xl:text-2xl 2xl:text-3xl font-bold bg-gradient-to-r from-primary-500 to-indigo-400 text-transparent bg-clip-text">Naut Tech</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-5 xl:gap-10 2xl:gap-12">
              <Link
                href="/blog"
                className={cn(
                  "flex items-center gap-2 text-customgreys-dirtyGrey hover:text-white transition-colors py-2 xl:text-lg 2xl:text-xl",
                  pathname === "/blog" && "text-white"
                )}
                scroll={false}
              >
                <FileText size={18} className="xl:w-6 xl:h-6 2xl:w-7 2xl:h-7" />
                <span>Blog</span>
              </Link>
              
              <Link
                href="/search"
                className={cn(
                  "flex items-center gap-2 text-customgreys-dirtyGrey hover:text-white transition-colors py-2 xl:text-lg 2xl:text-xl",
                  pathname === "/search" && "text-white"
                )}
                scroll={false}
              >
                <Search size={18} className="xl:w-6 xl:h-6 2xl:w-7 2xl:h-7" />
                <span>Courses</span>
              </Link>
              
              <Link
                href="/help"
                className="flex items-center gap-2 text-customgreys-dirtyGrey hover:text-white transition-colors py-2 xl:text-lg 2xl:text-xl"
                scroll={false}
              >
                <LifeBuoy size={18} className="xl:w-6 xl:h-6 2xl:w-7 2xl:h-7" />
                <span>Help</span>
              </Link>
            </div>
          </div>
          
          {/* Right Section */}
          <div className="flex items-center gap-4 xl:gap-6 2xl:gap-8">
            {/* Dashboard button - only visible when signed in */}
            <SignedIn>
              <div className="hidden md:block">
                <Link
                  href={getDashboardUrl()}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 xl:px-5 xl:py-3 2xl:px-6 2xl:py-4 rounded-lg transition-all xl:text-lg 2xl:text-xl",
                    isDashboardActive 
                      ? "bg-primary-700/20 text-primary-400 border border-primary-700/30" 
                      : "text-customgreys-dirtyGrey hover:text-white hover:bg-customgreys-darkGrey/30"
                  )}
                  scroll={false}
                >
                  <LayoutDashboard size={18} className="xl:w-6 xl:h-6 2xl:w-7 2xl:h-7" />
                  <span>Dashboard</span>
                  <ChevronRight size={16} className="ml-1 opacity-70 xl:w-5 xl:h-5 2xl:w-6 2xl:h-6" />
                </Link>
              </div>
            </SignedIn>
            
            <SignedIn>
              <div className="relative">
                <button className="relative p-2 xl:p-3 2xl:p-4 rounded-full bg-customgreys-darkGrey/50 hover:bg-customgreys-darkGrey transition-colors">
                  <span className="absolute top-1 right-1 h-2 w-2 xl:h-3 xl:w-3 2xl:h-3.5 2xl:w-3.5 rounded-full bg-primary-500"></span>
                  <Bell className="w-5 h-5 xl:w-6 xl:h-6 2xl:w-7 2xl:h-7 text-customgreys-dirtyGrey" />
                </button>
              </div>
            </SignedIn>
            
            <SignedIn>
              <UserButton
                appearance={{
                  baseTheme: dark,
                  elements: {
                    userButtonOuterIdentifier: "text-customgreys-dirtyGrey",
                    userButtonBox: "scale-90 sm:scale-100 xl:scale-125 2xl:scale-140",
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
              <div className="hidden md:flex items-center gap-3 xl:gap-4 2xl:gap-5">
                <Link
                  href="/signin"
                  className="px-4 py-2 xl:px-6 xl:py-3 2xl:px-8 2xl:py-4 rounded-lg text-customgreys-dirtyGrey border border-customgreys-darkerGrey hover:bg-customgreys-darkGrey/30 hover:text-white transition-all xl:text-lg 2xl:text-xl"
                  scroll={false}
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 xl:px-6 xl:py-3 2xl:px-8 2xl:py-4 rounded-lg bg-gradient-to-r from-primary-700 to-primary-600 hover:from-primary-600 hover:to-primary-500 text-white shadow-lg shadow-primary-900/20 transition-all xl:text-lg 2xl:text-xl"
                  scroll={false}
                >
                  Sign up
                </Link>
              </div>
            </SignedOut>
            
            {/* Mobile menu button */}
            <button 
              className="md:hidden p-2 rounded-lg hover:bg-customgreys-darkGrey/30 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="w-6 h-6 text-customgreys-dirtyGrey" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="md:hidden bg-customgreys-darkGrey border-t border-customgreys-darkerGrey"
        >
          <div className="px-4 py-5 space-y-4">
            <Link
              href="/blog"
              className="flex items-center gap-3 p-3 rounded-lg text-customgreys-dirtyGrey hover:bg-customgreys-secondarybg hover:text-white transition-all"
              scroll={false}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <FileText size={18} />
              <span>Blog</span>
            </Link>
            
            <Link
              href="/search"
              className="flex items-center gap-3 p-3 rounded-lg text-customgreys-dirtyGrey hover:bg-customgreys-secondarybg hover:text-white transition-all"
              scroll={false}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Search size={18} />
              <span>Courses</span>
            </Link>
            
            <Link
              href="/help"
              className="flex items-center gap-3 p-3 rounded-lg text-customgreys-dirtyGrey hover:bg-customgreys-secondarybg hover:text-white transition-all"
              scroll={false}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <LifeBuoy size={18} />
              <span>Help</span>
            </Link>
            
            <SignedIn>
              <Link
                href={getDashboardUrl()}
                className="flex items-center justify-between gap-3 p-3 rounded-lg bg-primary-700/20 text-primary-400 border border-primary-700/30"
                scroll={false}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="flex items-center gap-3">
                  <LayoutDashboard size={18} />
                  <span>Dashboard</span>
                </div>
                <ChevronRight size={16} />
              </Link>
            </SignedIn>
            
            <SignedOut>
              <div className="flex flex-col gap-3 pt-2">
                <Link
                  href="/signin"
                  className="w-full p-3 rounded-lg text-center text-customgreys-dirtyGrey border border-customgreys-darkerGrey hover:bg-customgreys-secondarybg hover:text-white transition-all"
                  scroll={false}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="w-full p-3 rounded-lg text-center bg-gradient-to-r from-primary-700 to-primary-600 hover:from-primary-600 hover:to-primary-500 text-white transition-all"
                  scroll={false}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign up
                </Link>
              </div>
            </SignedOut>
          </div>
        </motion.div>
      )}
    </nav>
  );
};

export default NonDashboardNavbar;