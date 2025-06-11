import { useParams } from "next/navigation";
import { useGetCourseQuery } from "@/state/api";
import { useUser } from "@clerk/nextjs";

// Define interface for API response structure
interface CourseApiResponse {
  message?: string;
  data?: Course;
  [key: string]: any;
}

export const useTeacherCoursePreview = () => {
  const { courseId, chapterId } = useParams();
  const { user, isLoaded } = useUser();

  const { data: apiResponse, isLoading: courseLoading } = useGetCourseQuery(
    (courseId as string) ?? "",
    {
      skip: !courseId || courseId === "undefined",
    }
  );

  // Extract the actual course data from the API response
  // Handle both direct Course object or nested data structure
  const course = apiResponse && 'data' in apiResponse 
    ? (apiResponse as CourseApiResponse).data 
    : apiResponse as Course | undefined;

  const isLoading = !isLoaded || courseLoading;

  // Add null checks to prevent "Cannot read properties of undefined (reading 'find')" error
  const currentSection = course?.sections?.find((s) =>
    s.chapters?.some((c) => c.chapterId === chapterId)
  );

  const currentChapter = currentSection?.chapters?.find(
    (c) => c.chapterId === chapterId
  );

  // Add logging for debugging
  if (process.env.NODE_ENV !== "production") {
    console.log("useTeacherCoursePreview - course:", course);
    console.log("useTeacherCoursePreview - courseId:", courseId);
    console.log("useTeacherCoursePreview - chapterId:", chapterId);
    console.log("useTeacherCoursePreview - currentSection:", currentSection);
    console.log("useTeacherCoursePreview - currentChapter:", currentChapter);
  }

  // Check if the current user is the teacher of this course
  const isTeacher = user?.id === course?.teacherId;

  return {
    user,
    courseId,
    chapterId,
    course,
    currentSection,
    currentChapter,
    isLoading,
    isTeacher,
  };
}; 