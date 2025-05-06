import React, { useEffect, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import {
  Appearance,
  loadStripe,
  StripeElementsOptions,
} from "@stripe/stripe-js";
import { useCreateStripePaymentIntentMutation } from "@/state/api";
import { useCurrentCourse } from "@/hooks/useCurrentCourse";
import Loading from "@/components/Loading";

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY) {
  throw new Error("NEXT_PUBLIC_STRIPE_PUBLIC_KEY is not set");
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

const appearance: Appearance = {
  theme: "stripe",
  variables: {
    colorPrimary: "#0570de",
    colorBackground: "#18181b",
    colorText: "#d2d2d2",
    colorDanger: "#df1b41",
    colorTextPlaceholder: "#6e6e6e",
    fontFamily: "Inter, system-ui, sans-serif",
    spacingUnit: "3px",
    borderRadius: "10px",
    fontSizeBase: "14px",
  },
};

const StripeProvider = ({ children }: { children: React.ReactNode }) => {
  const [clientSecret, setClientSecret] = useState<string | "">("");
  const [error, setError] = useState<string | null>(null);
  const [createStripePaymentIntent] = useCreateStripePaymentIntentMutation();
  const { course } = useCurrentCourse();

  useEffect(() => {
    if (!course) return;
    const fetchPaymentIntent = async () => {
      try {
        // Ensure the amount is valid for Stripe (max $999,999.99)
        // Convert to cents (Stripe uses smallest currency unit)
        let amount = course?.price || 0;
        
        // Cap at Stripe's maximum amount
        if (amount > 99999999) {
          amount = 99999999; // $999,999.99 in cents
        }
        
        // Ensure amount is at least 50 cents (Stripe minimum)
        if (amount < 50) {
          amount = 50;
        }
        
        const result = await createStripePaymentIntent({
          amount,
        }).unwrap();

        if (result && result.clientSecret) {
          setClientSecret(result.clientSecret);
        } else {
          setError("Invalid response from payment service");
        }
      } catch (err) {
        console.error("Payment intent creation failed:", err);
        setError("Failed to initialize payment service");
      }
    };

    fetchPaymentIntent();
  }, [createStripePaymentIntent, course?.price, course]);

  const options: StripeElementsOptions = {
    clientSecret,
    appearance,
  };

  if (error) return <div className="payment-error">Error: {error}</div>;
  if (!clientSecret) return <Loading />;

  return (
    <Elements stripe={stripePromise} options={options} key={clientSecret}>
      {children}
    </Elements>
  );
};

export default StripeProvider;