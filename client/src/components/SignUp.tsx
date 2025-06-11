"use client";

import { SignUp, useUser } from "@clerk/nextjs";
import React, { useState, useEffect, useRef } from "react";
import { dark } from "@clerk/themes";
import { useSearchParams } from "next/navigation";

const SignUpComponent = () => {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const isCheckoutPage = searchParams.get("showSignUp") !== null;
  const courseId = searchParams.get("id");
  const showSignUpValue = searchParams.get("showSignUp") || "true";
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  const signInUrl = isCheckoutPage
    ? `/checkout?step=1&id=${courseId}&showSignUp=false`
    : "/signin";

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    
    // Clear any existing timeout
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current);
    }

    redirectTimeoutRef.current = setTimeout(() => {
      if (isCheckoutPage) {
        setRedirectUrl(`/checkout?step=2&id=${courseId}&showSignUp=${showSignUpValue}`);
        return;
      }

      const userType = user?.publicMetadata?.userType as string;
      if (userType === "teacher") {
        setRedirectUrl("/teacher/courses");
      } else {
        setRedirectUrl("/user/courses");
      }
    }, 300);
  }, [user, isCheckoutPage, courseId, showSignUpValue]);

  // Don't render SignUp if user is already signed in and we have a redirect URL
  if (user && redirectUrl) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-700 mx-auto mb-4"></div>
          <p className="text-gray-400">Redirecting...</p>
        </div>
      </div>
    );
  }

  // Don't render SignUp if user is already signed in but no redirect URL yet
  if (user && !redirectUrl) {
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
    <SignUp
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
      signInUrl={signInUrl}
      forceRedirectUrl={redirectUrl}
      routing="hash"
      afterSignOutUrl="/"
    />
  );
};

export default SignUpComponent;