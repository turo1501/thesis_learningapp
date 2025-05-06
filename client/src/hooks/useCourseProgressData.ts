import { useState } from "react";
import { useParams } from "next/navigation";
import {
  useGetCourseQuery,
  useGetUserCourseProgressQuery,
  useUpdateUserCourseProgressMutation,
} from "@/state/api";
import { useUser } from "@clerk/nextjs";

// Define interface for API response structure
interface CourseApiResponse {
  message?: string;
  data?: Course;
  [key: string]: any;
}

export const useCourseProgressData = () => {
  const { courseId, chapterId } = useParams();
  const { user, isLoaded } = useUser();
  const [hasMarkedComplete, setHasMarkedComplete] = useState(false);
  const [updateProgress] = useUpdateUserCourseProgressMutation();

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

  const { data: userProgress, isLoading: progressLoading } =
    useGetUserCourseProgressQuery(
      {
        userId: user?.id ?? "",
        courseId: (courseId as string) ?? "",
      },
      {
        skip: !isLoaded || !user || !courseId,
      }
    );

  const isLoading = !isLoaded || courseLoading || progressLoading;

  // Add null checks to prevent "Cannot read properties of undefined (reading 'find')" error
  const currentSection = course?.sections?.find((s) =>
    s.chapters?.some((c) => c.chapterId === chapterId)
  );

  const currentChapter = currentSection?.chapters?.find(
    (c) => c.chapterId === chapterId
  );

  // Add logging for debugging
  if (process.env.NODE_ENV !== "production") {
    console.log("useCourseProgressData - course:", course);
    console.log("useCourseProgressData - courseId:", courseId);
    console.log("useCourseProgressData - chapterId:", chapterId);
    console.log("useCourseProgressData - currentSection:", currentSection);
    console.log("useCourseProgressData - currentChapter:", currentChapter);
  }

  const isChapterCompleted = () => {
    if (!currentSection || !currentChapter || !userProgress?.sections)
      return false;

    const section = userProgress.sections.find(
      (s) => s.sectionId === currentSection.sectionId
    );
    
    if (!section) return false;
    
    return (
      section.chapters.some(
        (c) => c.chapterId === currentChapter.chapterId && c.completed
      ) ?? false
    );
  };

  const updateChapterProgress = (
    sectionId: string,
    chapterId: string,
    completed: boolean
  ) => {
    if (!user) return;

    const updatedSections = [
      {
        sectionId,
        chapters: [
          {
            chapterId,
            completed,
          },
        ],
      },
    ];

    updateProgress({
      userId: user.id,
      courseId: (courseId as string) ?? "",
      progressData: {
        sections: updatedSections,
      },
    });
  };

  return {
    user,
    courseId,
    chapterId,
    course,
    userProgress,
    currentSection,
    currentChapter,
    isLoading,
    isChapterCompleted,
    updateChapterProgress,
    hasMarkedComplete,
    setHasMarkedComplete,
  };
};