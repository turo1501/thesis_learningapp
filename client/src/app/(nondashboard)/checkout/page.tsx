"use client";

import Loading from "@/components/Loading";
import WizardStepper from "@/components/WizardStepper";
import { useCheckoutNavigation } from "@/hooks/useCheckoutNavigation";
import { useUser } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect } from "react";
import CheckoutDetailsPage from "./details";
import PaymentPage from "./payment";
import CompletionPage from "./completion";

const CheckoutWizard = () => {
  const { isLoaded, isSignedIn } = useUser();
  const { checkoutStep } = useCheckoutNavigation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("id") ?? "";

  // Ensure we move to step 2 for signed-in users
  useEffect(() => {
    if (isLoaded && isSignedIn && checkoutStep === 1) {
      // Add a delay before redirecting to step 2 to avoid race conditions
      const redirectTimer = setTimeout(() => {
        const showSignUp = searchParams.get("showSignUp") ?? "false";
        router.push(`/checkout?step=2&id=${courseId}&showSignUp=${showSignUp}`, {
          scroll: false,
        });
      }, 300);

      return () => clearTimeout(redirectTimer);
    }
  }, [isLoaded, isSignedIn, checkoutStep, courseId, router, searchParams]);

  if (!isLoaded) return <Loading />;

  const renderStep = () => {
    switch (checkoutStep) {
      case 1:
        return <CheckoutDetailsPage />;
      case 2:
        return <PaymentPage />;
      case 3:
        return <CompletionPage />;
      default:
        return <CheckoutDetailsPage />;
    }
  };

  return (
    <div className="checkout">
      <WizardStepper currentStep={checkoutStep} />
      <div className="checkout__content">{renderStep()}</div>
    </div>
  );
};

export default CheckoutWizard;