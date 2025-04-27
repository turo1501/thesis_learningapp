"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useEffect } from "react";

export const useCheckoutNavigation = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoaded, isSignedIn, user } = useUser();

  const courseId = searchParams.get("id") ?? "";
  const checkoutStep = parseInt(searchParams.get("step") ?? "1", 10);
  const showSignUpParam = searchParams.get("showSignUp");

  // Get the user role
  const userRole = user?.publicMetadata?.userType as string;
  const isTeacher = userRole === "teacher";

  const navigateToStep = useCallback(
    (step: number) => {
      const newStep = Math.min(Math.max(1, step), 3);
      // Keep the current showSignUp value if it exists, otherwise set based on isSignedIn
      const showSignUp = showSignUpParam !== null ? showSignUpParam : isSignedIn ? "true" : "false";

      router.push(
        `/checkout?step=${newStep}&id=${courseId}&showSignUp=${showSignUp}`,
        {
          scroll: false,
        }
      );
    },
    [courseId, isSignedIn, router, showSignUpParam]
  );

  useEffect(() => {
    // Only redirect in these cases:
    // 1. If user is not signed in and trying to access steps > 1
    // 2. If user is a teacher trying to access checkout steps > 1
    if (isLoaded) {
      if ((!isSignedIn && checkoutStep > 1) || (isSignedIn && isTeacher && checkoutStep > 1)) {
        // Redirect to step 1 or home for teachers
        if (isTeacher) {
          router.push('/teacher/courses');
        } else {
          navigateToStep(1);
        }
      }
    }
  }, [isLoaded, isSignedIn, checkoutStep, navigateToStep, isTeacher, router]);

  return { checkoutStep, navigateToStep };
};