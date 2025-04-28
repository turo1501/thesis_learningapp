import { useState, useEffect } from 'react';
import { useGetCourseQuery } from '@/state/api';

interface CourseSection {
  sectionId: string;
  title: string;
  chapters: {
    chapterId: string;
    title: string;
  }[];
}

interface UseCourseContentOptions {
  courseId?: string | null;
  userId?: string | null;
}

export const useCourseContent = ({ courseId, userId }: UseCourseContentOptions) => {
  const [sections, setSections] = useState<CourseSection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const {
    data: courseData,
    isLoading: isLoadingCourse,
    error: courseError,
  } = useGetCourseQuery(courseId || '', {
    skip: !courseId,
  });

  // Process course data to extract sections and chapters
  useEffect(() => {
    if (courseData && !isLoadingCourse) {
      try {
        setIsLoading(true);
        
        // Map the course sections and chapters to a format suitable for the memory card form
        const courseSections = courseData.sections?.map(section => ({
          sectionId: section.sectionId,
          title: section.title,
          chapters: section.chapters?.map(chapter => ({
            chapterId: chapter.chapterId,
            title: chapter.title,
          })) || [],
        })) || [];
        
        setSections(courseSections);
        setError(null);
      } catch (err) {
        console.error('Error processing course data:', err);
        setError(err instanceof Error ? err : new Error('Failed to process course data'));
      } finally {
        setIsLoading(false);
      }
    }
  }, [courseData, isLoadingCourse]);

  return {
    sections,
    isLoading: isLoading || isLoadingCourse,
    error: error || courseError,
  };
}; 
 
 
 
 
 