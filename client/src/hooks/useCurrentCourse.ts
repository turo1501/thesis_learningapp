import { useGetCourseQuery } from "@/state/api";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

// Define interface for API response structure
interface CourseApiResponse {
  message?: string;
  data?: Course;
  [key: string]: any;
}

export const useCurrentCourse = () => {
  const searchParams = useSearchParams();
  // Try to get courseId from URL params
  let courseId = searchParams.get("id") ?? "";
  
  // Fallback to localStorage if URL param is empty/undefined
  if ((!courseId || courseId === "undefined") && typeof window !== 'undefined') {
    const storedCourseId = localStorage.getItem('selectedCourseId');
    if (storedCourseId) {
      courseId = storedCourseId;
      console.log("Using courseId from localStorage:", courseId);
    }
  }
  
  // Add debug logging
  if (process.env.NODE_ENV !== "production") {
    console.log("useCurrentCourse hook - courseId:", courseId);
  }
  
  // Ensure the courseId is valid before making the query
  const isValidCourseId = courseId && courseId !== "undefined" && courseId.length > 0;
  
  const { data: apiResponse, isLoading, isError, error, ...rest } = useGetCourseQuery(courseId, {
    skip: !isValidCourseId
  });

  // Extract the actual course data from the API response
  // Handle both direct Course object or nested data structure
  const course = apiResponse && 'data' in apiResponse 
    ? (apiResponse as CourseApiResponse).data 
    : apiResponse as Course | null;

  // Log any errors in development mode
  if (process.env.NODE_ENV !== "production" && isError) {
    console.error("useCurrentCourse error:", error);
  }

  // Log the retrieved course data in development mode
  if (process.env.NODE_ENV !== "production" && course) {
    console.log("useCurrentCourse extracted course data:", course);
  }

  // Store course data in localStorage as a fallback mechanism
  useEffect(() => {
    if (course && typeof window !== 'undefined') {
      try {
        localStorage.setItem('currentCourse', JSON.stringify(course));
      } catch (e) {
        console.error("Failed to store course in localStorage:", e);
      }
    }
  }, [course]);

  return { 
    course, 
    courseId, 
    isLoading, 
    isError,
    isValidCourseId, 
    ...rest 
  };
};