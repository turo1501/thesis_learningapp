"use client";

import { SignIn, useAuth } from "@clerk/nextjs";
import React, { useEffect, useState, useRef } from "react";
import { dark } from "@clerk/themes";
import { useSearchParams, useRouter } from "next/navigation";

const SignInComponent = () => {
  const { isSignedIn, isLoaded, userId } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
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
    if (!isLoaded) return; // Wait for Clerk to load

    if (!isSignedIn) return; // If not signed in, no need to process further

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
      .then((res) => res.json())
      .then((data) => {
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
      .catch((error) => console.error("Error fetching user role:", error));
  }, [isLoaded, isSignedIn, userId, isCheckoutPage, courseId, showSignUpValue]);


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
      forceRedirectUrl={redirectUrl} // Only redirect when redirectUrl has a value
      routing="hash"
      afterSignOutUrl="/"
    />
  );
};

export default SignInComponent;
