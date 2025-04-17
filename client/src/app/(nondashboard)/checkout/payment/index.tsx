import React, { useState, useEffect } from "react";
import StripeProvider from "./StripeProvider";
import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useCheckoutNavigation } from "@/hooks/useCheckoutNavigation";
import { useCurrentCourse } from "@/hooks/useCurrentCourse";
import { useClerk, useUser } from "@clerk/nextjs";
import CoursePreview from "@/components/CoursePreview";
import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCreateTransactionMutation } from "@/state/api";
import { toast } from "sonner";
import Loading from "@/components/Loading";

const PaymentPageContent = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createTransaction] = useCreateTransactionMutation();
  const { navigateToStep } = useCheckoutNavigation();
  const { course, courseId, isLoading: isCourseLoading, isError: isCourseError } = useCurrentCourse();
  const { user } = useUser();
  const { signOut } = useClerk();

  // Debug logging for course data
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.log("Payment page - course:", course);
      console.log("Payment page - courseId:", courseId);
    }
  }, [course, courseId]);

  // Reset error message when stripe or elements change
  useEffect(() => {
    if (stripe && elements) {
      setErrorMessage(null);
    }
  }, [stripe, elements]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    if (!stripe || !elements) {
      setErrorMessage("Stripe service is not available");
      setIsLoading(false);
      return;
    }

    if (!course || !courseId) {
      setErrorMessage("Course information is missing");
      setIsLoading(false);
      return;
    }

    const baseUrl = process.env.NEXT_PUBLIC_LOCAL_URL
    ? `http://${process.env.NEXT_PUBLIC_LOCAL_URL}`
    : process.env.NEXT_PUBLIC_VERCEL_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : typeof window !== 'undefined' 
      ? window.location.origin 
      : '';
  
    try {
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${baseUrl}/checkout?step=3&id=${courseId}`,
        },
        redirect: "if_required",
      });

      if (result.error) {
        setErrorMessage(result.error.message || "Payment failed. Please try again.");
        console.error("Payment error:", result.error);
        setIsLoading(false);
        return;
      }

      if (result.paymentIntent?.status === "succeeded") {
        // Create transaction data with correct typing
        const transactionData: Partial<Transaction> = {
          transactionId: result.paymentIntent.id,
          userId: user?.id ?? "",
          courseId: courseId,
          paymentProvider: "stripe",
          amount: course?.price || 0,
          dateTime: new Date().toISOString()
        };

        try {
          await createTransaction(transactionData);
          navigateToStep(3);
        } catch (err) {
          console.error("Transaction creation error:", err);
          setErrorMessage("Payment successful, but we couldn't record your transaction. Please contact support.");
        }
      }
    } catch (err) {
      console.error("Payment submission error:", err);
      setErrorMessage("Something went wrong processing your payment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOutAndNavigate = async () => {
    await signOut();
    navigateToStep(1);
  };

  // Show loading state while course data is being fetched
  if (isCourseLoading) {
    return <Loading />;
  }

  // Show error message if course data could not be loaded
  if (isCourseError || !course) {
    return (
      <div className="payment__error-container">
        <h2>Error Loading Course</h2>
        <p>We couldn't load the course information. Please try again or contact support.</p>
        <Button onClick={() => window.location.href = "/search"}>
          Return to Search
        </Button>
      </div>
    );
  }

  return (
    <div className="payment">
      <div className="payment__container">
        {/* Order Summary */}
        <div className="payment__preview">
          {course && (
            <CoursePreview course={course} />
          )}
        </div>

        {/* Payment Form */}
        <div className="payment__form-container">
          <form
            id="payment-form"
            onSubmit={handleSubmit}
            className="payment__form"
          >
            <div className="payment__content">
              <h1 className="payment__title">Checkout</h1>
              <p className="payment__subtitle">
                Fill out the payment details below to complete your purchase.
              </p>

              {errorMessage && (
                <div className="payment__error">{errorMessage}</div>
              )}

              <div className="payment__method">
                <h3 className="payment__method-title">Payment Method</h3>

                <div className="payment__card-container">
                  <div className="payment__card-header">
                    <CreditCard size={24} />
                    <span>Credit/Debit Card</span>
                  </div>
                  <div className="payment__card-element">
                    <PaymentElement />
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="payment__actions">
        <Button
          className="hover:bg-white-50/10"
          onClick={handleSignOutAndNavigate}
          variant="outline"
          type="button"
        >
          Switch Account
        </Button>

        <Button
          form="payment-form"
          type="submit"
          className="payment__submit"
          disabled={!stripe || !elements || isLoading || !course}
        >
          {isLoading ? "Processing..." : `Pay ${course ? formatPrice(course.price || 0) : ""}`}
        </Button>
      </div>
    </div>
  );
};

// Format price directly in component
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price / 100);
};

const PaymentPage = () => (
  <StripeProvider>
    <PaymentPageContent />
  </StripeProvider>
);

export default PaymentPage;
