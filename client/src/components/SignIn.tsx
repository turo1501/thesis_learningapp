"use client";

import { SignIn, useAuth } from "@clerk/nextjs";
import React, { useEffect, useState } from "react";
import { dark } from "@clerk/themes";
import { useSearchParams, useRouter } from "next/navigation";

const SignInComponent = () => {
  const { isSignedIn, isLoaded, userId } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const isCheckoutPage = searchParams.get("showSignUp") !== null;
  const courseId = searchParams.get("id");
  const step = searchParams.get("step") || "1";

  const signUpUrl = isCheckoutPage
    ? `/checkout?step=1&id=${courseId}&showSignUp=true`
    : "/signup";

  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return; // Wait for Clerk to load

    if (!isSignedIn) return; // If not signed in, no need to process further

    if (isCheckoutPage) {
      // For checkout, ensure step is preserved or defaulted to step 2 after login
      const targetStep = step || "2";
      const url = `/checkout?step=${targetStep}&id=${courseId}&showSignUp=true`;
      setRedirectUrl(url);
      
      // Handle immediate redirect to prevent flash
      if (typeof window !== 'undefined') {
        router.push(url, { scroll: false });
      }
      return;
    }

    fetch(`/api/get-user-role?userId=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        const userType = data.userType;
        console.log("UserType:", userType);

        if (userType === "user") {
          setRedirectUrl("/user/courses");
        } else {
          setRedirectUrl("/teacher/courses");
        }
      })
      .catch((error) => console.error("Error fetching user role:", error));
  }, [isLoaded, isSignedIn, userId, isCheckoutPage, courseId, step, router]);

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
