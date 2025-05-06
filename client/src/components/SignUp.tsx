"use client";

import { SignUp, useUser } from "@clerk/nextjs";
import React, { useState, useEffect, useRef } from "react";

import { dark } from "@clerk/themes";
import { useSearchParams, useRouter } from "next/navigation";

const SignUpComponent = () => {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  const isCheckoutPage = searchParams.get("showSignUp") !== null;
  const courseId = searchParams.get("id");
  const showSignUpValue = searchParams.get("showSignUp") || "true";
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);


  const signInUrl = isCheckoutPage
    ? `/checkout?step=${step}&id=${courseId}&showSignUp=false`
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

  // Handle the post-registration redirect for checkout
  useEffect(() => {
    if (user && isCheckoutPage) {
      const redirectUrl = `/checkout?step=2&id=${courseId}&showSignUp=true`;
      router.push(redirectUrl, { scroll: false });
    }
  }, [user, isCheckoutPage, courseId, router]);

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