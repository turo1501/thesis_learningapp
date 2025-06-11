"use client";

import { Button } from "@/components/ui/button";
import { Check, BookOpen, Play } from "lucide-react";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { Confetti } from "@/components/ui/Confetti";
import { useSearchParams } from "next/navigation";
import { useCurrentCourse } from "@/hooks/useCurrentCourse";

const CompletionPage = () => {
  const [showConfetti, setShowConfetti] = useState(true);
  const searchParams = useSearchParams();
  const courseId = searchParams.get("id");
  const { course } = useCurrentCourse();
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 6000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="completion">
      {showConfetti && <Confetti duration={6000} particleCount={200} />}
      <div className="completion__content">
        <div className="completion__icon">
          <Check className="w-16 h-16" />
        </div>
        <h1 className="completion__title">ENROLLMENT COMPLETE!</h1>
        <p className="completion__message">
          🎉 Congratulations! You have successfully enrolled in {course?.title || "the course"}! 🎉
        </p>
        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center space-x-2 text-green-800 dark:text-green-200">
            <BookOpen className="w-5 h-5" />
            <span className="font-medium">What's next?</span>
          </div>
          <p className="mt-2 text-sm text-green-700 dark:text-green-300">
            Your course is now available in your learning dashboard. Start learning right away!
        </p>
        </div>
      </div>
      <div className="completion__support">
        <p>
          Need help? Contact our{" "}
          <Button variant="link" asChild className="p-0 m-0 text-primary-700">
            <a href="mailto:support@example.com">customer support</a>
          </Button>
          .
        </p>
      </div>
      <div className="completion__action space-y-4">
        <Button asChild className="bg-primary-700 hover:bg-primary-600 text-white font-semibold px-8 py-3 text-lg">
          <Link href="/user/courses?refresh=true" scroll={false}>
            <BookOpen className="w-5 h-5 mr-2" />
            Go to My Courses
          </Link>
        </Button>
        {courseId && course && (
          <Button asChild variant="outline" className="border-primary-600 text-primary-600 hover:bg-primary-50 px-8 py-3 text-lg">
            <Link href={`/user/courses/${courseId}`} scroll={false}>
              <Play className="w-5 h-5 mr-2" />
              Start Learning Now
        </Link>
          </Button>
        )}
      </div>
    </div>
  );
};

export default CompletionPage;