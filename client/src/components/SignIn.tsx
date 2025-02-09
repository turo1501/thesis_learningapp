"use client";

import { SignIn, useAuth } from "@clerk/nextjs";
import React, { useEffect, useState } from "react";
import { dark } from "@clerk/themes";
import { useSearchParams } from "next/navigation";

const SignInComponent = () => {
  const { isSignedIn, isLoaded, userId } = useAuth();
  const searchParams = useSearchParams();
  const isCheckoutPage = searchParams.get("showSignUp") !== null;
  const courseId = searchParams.get("id");

  const signUpUrl = isCheckoutPage
    ? `/checkout?step=1&id=${courseId}&showSignUp=true`
    : "/signup";

  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return; // Đợi Clerk tải dữ liệu xong

    if (!isSignedIn) return; // Nếu chưa đăng nhập, không cần xử lý tiếp

    if (isCheckoutPage) {
      setRedirectUrl(`/checkout?step=2&id=${courseId}&showSignUp=true`);
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
  }, [isLoaded, isSignedIn, userId, isCheckoutPage, courseId]);

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
