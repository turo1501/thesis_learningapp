"use client";

import { SignIn, useAuth } from "@clerk/nextjs";
import React, { useEffect, useState, useRef } from "react";
import { dark } from "@clerk/themes";
import { useSearchParams } from "next/navigation";

const SignInComponent = () => {
  const { isSignedIn, isLoaded, userId } = useAuth();
  const searchParams = useSearchParams();
  const isCheckoutPage = searchParams.get("showSignUp") !== null;
  const courseId = searchParams.get("id");
  const showSignUpValue = searchParams.get("showSignUp") || "false";
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const signUpUrl = isCheckoutPage
    ? `/checkout?step=1&id=${courseId}&showSignUp=true`
    : "/signup";

  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isLoaded) return; // Đợi Clerk tải dữ liệu xong

    if (!isSignedIn) return; // Nếu chưa đăng nhập, không cần xử lý tiếp

    // Clear any existing timeout
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current);
    }

    if (isCheckoutPage) {
      // Add a small delay to allow the session to stabilize before redirecting
      redirectTimeoutRef.current = setTimeout(() => {
        setRedirectUrl(`/checkout?step=2&id=${courseId}&showSignUp=${showSignUpValue}`);
      }, 300);
      return;
    }

    fetch(`/api/get-user-role?userId=${userId}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (data.error) {
          throw new Error(data.error);
        }
        
        const userType = data.userType;
        console.log("UserType:", userType);

        // Add a small delay to allow the session to stabilize before redirecting
        redirectTimeoutRef.current = setTimeout(() => {
          if (userType === "user") {
            setRedirectUrl("/user/courses");
          } else {
            setRedirectUrl("/teacher/courses");
          }
        }, 300);
      })
      .catch((error) => {
        console.error("Error fetching user role:", error);
        // Default to user dashboard if role fetch fails
        redirectTimeoutRef.current = setTimeout(() => {
          setRedirectUrl("/user/courses");
        }, 300);
      });
  }, [isLoaded, isSignedIn, userId, isCheckoutPage, courseId, showSignUpValue]);

  // Don't render SignIn if user is already signed in and we have a redirect URL
  if (isSignedIn && redirectUrl) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-700 mx-auto mb-4"></div>
          <p className="text-gray-400">Redirecting...</p>
        </div>
      </div>
    );
  }

  // Don't render SignIn if user is already signed in but no redirect URL yet
  if (isSignedIn && !redirectUrl) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-700 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <SignIn
      appearance={{
        baseTheme: dark,
        elements: {
          rootBox: "flex justify-center items-center py-5",
          cardBox: "shadow-none",
          card: "bg-customgreys-secondarybg w-full shadow-none",
          footer: {
            background: "#25262F",
            padding: "0rem 2.5rem",
            "& > div > div:nth-child(1)": {
              background: "#25262F",
            },
          },
          formFieldLabel: "text-white-50 font-normal",
          formButtonPrimary:
            "bg-primary-700 text-white-100 hover:bg-primary-600 !shadow-none",
          formFieldInput: "bg-customgreys-primarybg text-white-50 !shadow-none",
          footerActionLink: "text-primary-750 hover:text-primary-600",
        },
      }}
      signUpUrl={signUpUrl}
      forceRedirectUrl={redirectUrl} // Chỉ redirect khi redirectUrl có giá trị
      routing="hash"
      afterSignOutUrl="/"
    />
  );
};

export default SignInComponent;
