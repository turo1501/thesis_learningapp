"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useRef } from "react";

export const useCheckoutNavigation = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoaded, isSignedIn } = useUser();
  const navigationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const courseId = searchParams.get("id") ?? "";
  const checkoutStep = parseInt(searchParams.get("step") ?? "1", 10);
  const showSignUp = searchParams.get("showSignUp") ?? "false";

  // Clear any existing timeout on component unmount
  useEffect(() => {
    return () => {
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, []);

  const navigateToStep = useCallback(
    (step: number) => {
      const newStep = Math.min(Math.max(1, step), 3);
      const showSignUpValue = showSignUp;

      // Clear any existing timeout
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }

      // Set a longer timeout to prevent flickering and give the session time to stabilize
      navigationTimeoutRef.current = setTimeout(() => {
        router.push(
          `/checkout?step=${newStep}&id=${courseId}&showSignUp=${showSignUpValue}`,
          {
            scroll: false,
          }
        );
      }, 300); // Increased from 50ms to 300ms for better stability
    },
    [courseId, router, showSignUp]
  );

  // Only redirect back to step 1 if not signed in and trying to access step > 1
  useEffect(() => {
    if (isLoaded && !isSignedIn && checkoutStep > 1) {
      navigateToStep(1);
    }
  }, [isLoaded, isSignedIn, checkoutStep, navigateToStep]);

  return { checkoutStep, navigateToStep };
};