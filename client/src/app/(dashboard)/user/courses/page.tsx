"use client";

import Toolbar from "@/components/Toolbar";
import CourseCard from "@/components/CourseCard";
import { useGetUserEnrolledCoursesQuery } from "@/state/api";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { useUser } from "@clerk/nextjs";
import { useState, useMemo, useEffect } from "react";
import Loading from "@/components/Loading";

const Courses = () => {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [retryCount, setRetryCount] = useState(0);

  // Get auth token from localStorage for verification
  const [hasToken, setHasToken] = useState(false);
  
  useEffect(() => {
    // Check if token exists and update state
    const checkToken = () => {
      const token = localStorage.getItem('clerk-auth-token');
      setHasToken(!!token);
    };
    
    // Check immediately and then periodically
    checkToken();
    const tokenCheckInterval = setInterval(checkToken, 1000);
    
    return () => clearInterval(tokenCheckInterval);
  }, []);

  const {
    data: coursesResponse,
    isLoading,
    isError,
    refetch,
  } = useGetUserEnrolledCoursesQuery(user?.id ?? "", {
    skip: !isLoaded || !user || !hasToken,
  });
  
  // Retry loading if we have a user but no data
  useEffect(() => {
    if (isLoaded && user && hasToken && !coursesResponse && !isLoading && retryCount < 3) {
      const timer = setTimeout(() => {
        console.log(`Retrying course data fetch (attempt ${retryCount + 1})`);
        refetch();
        setRetryCount(prev => prev + 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isLoaded, user, hasToken, coursesResponse, isLoading, retryCount, refetch]);
  
  // Extract and validate courses array
  const courses = useMemo(() => {
    // Log received data for debugging
    console.log('Enrolled courses data:', coursesResponse);
    
    // Handle different response formats
    if (Array.isArray(coursesResponse)) {
      return coursesResponse;
    } else if (coursesResponse && typeof coursesResponse === 'object') {
      // Check for nested data structures
      if ('data' in coursesResponse) {
      const data = (coursesResponse as any).data;
      return Array.isArray(data) ? data : [];
      } else if ('courses' in coursesResponse) {
        const courses = (coursesResponse as any).courses;
        return Array.isArray(courses) ? courses : [];
      } else if ('enrolledCourses' in coursesResponse) {
        const enrolledCourses = (coursesResponse as any).enrolledCourses;
        return Array.isArray(enrolledCourses) ? enrolledCourses : [];
      }
    }
    // Default fallback
    return [];
  }, [coursesResponse]);

  // Add effect to log the extracted courses
  useEffect(() => {
    console.log('Extracted courses array:', courses);
  }, [courses]);

  const filteredCourses = useMemo(() => {
    // Ensure courses is an array
    if (!Array.isArray(courses)) {
      console.warn('courses is not an array:', courses);
      return [];
    }

    return courses.filter((course) => {
      const matchesSearch = course.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || course.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [courses, searchTerm, selectedCategory]);

  const handleGoToCourse = (course: Course) => {
    if (
      course.sections &&
      course.sections.length > 0 &&
      course.sections[0].chapters.length > 0
    ) {
      const firstChapter = course.sections[0].chapters[0];
      router.push(
        `/user/courses/${course.courseId}/chapters/${firstChapter.chapterId}`,
        {
          scroll: false,
        }
      );
    } else {
      router.push(`/user/courses/${course.courseId}`, {
        scroll: false,
      });
    }
  };

  if (!isLoaded || (isLoading && !coursesResponse)) return <Loading />;
  if (!user) return <div>Please sign in to view your courses.</div>;
  if (!hasToken) return <Loading />;
  if (isError) return <div>Error loading your enrolled courses. Please try again later.</div>;
  if (!courses || !Array.isArray(courses) || courses.length === 0)
    return <div>You are not enrolled in any courses yet.</div>;

  return (
    <div className="user-courses">
      <Header title="My Courses" subtitle="View your enrolled courses" />
      <Toolbar
        onSearch={setSearchTerm}
        onCategoryChange={setSelectedCategory}
      />
      <div className="user-courses__grid">
        {filteredCourses.map((course) => (
          <CourseCard
            key={course.courseId}
            course={course}
            onGoToCourse={handleGoToCourse}
          />
        ))}
      </div>
    </div>
  );
};

export default Courses;