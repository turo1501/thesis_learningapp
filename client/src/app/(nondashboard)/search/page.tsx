"use client";

import Loading from "@/components/Loading";
import { useGetCoursesQuery } from "@/state/api/courseApi";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import CourseCardSearch from "@/components/CourseCardSearch";
import SelectedCourse from "./SelectedCourse";
import { useUser } from "@clerk/nextjs";

// Interface for API response structure
interface CoursesResponse {
  data?: Course[];
  message?: string;
  success?: boolean;
  [key: string]: any;
}

const Search = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const { data: coursesData, isLoading, isError } = useGetCoursesQuery({});

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();

  // Extract courses from API response correctly
  const courses = useMemo(() => {
    // If coursesData is an array, return it directly
    if (coursesData && Array.isArray(coursesData)) {
      return coursesData as Course[];
    } 
    // If coursesData has a data property that is an array, return that
    else if (coursesData && 'data' in coursesData && Array.isArray((coursesData as CoursesResponse).data)) {
      return (coursesData as CoursesResponse).data || [];
    }
    // Default fallback to empty array
    return [] as Course[];
  }, [coursesData]);

  useEffect(() => {
    if (courses.length > 0) {

      if (id) {
        const course = transformedCourses.find((c) => c.courseId === id);
        setSelectedCourse(course || transformedCourses[0]);
      } else {
        setSelectedCourse(transformedCourses[0]);
      }
    }
  }, [apiCourses, id]);

  if (isLoading) return <Loading />;
  if (isError || !courses) return <div>Failed to fetch courses</div>;

  const handleCourseSelect = (course: Course) => {
    setSelectedCourse(course);
    router.push(`/search?id=${course.courseId}`, {
      scroll: false,
    });
  };

  const handleEnrollNow = (courseId: string) => {
    // Wait for authentication state to be loaded
    if (!isLoaded) return;

    // Force step=2 for authenticated users, otherwise step=1
    const step = isSignedIn ? "2" : "1";
    
    // Always set showSignUp to false for consistent behavior
    router.push(`/checkout?step=${step}&id=${courseId}&showSignUp=false`, {

      scroll: false,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="search"
    >
      <h1 className="search__title">List of available courses</h1>
      <h2 className="search__subtitle">{courses.length} courses avaiable</h2>
      <div className="search__content">
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="search__courses-grid"
        >
          {courses.length > 0 ? (
            courses.map((course) => (
            <CourseCardSearch
              key={course.courseId}
              course={course}
              isSelected={selectedCourse?.courseId === course.courseId}
              onClick={() => handleCourseSelect(course)}
            />
            ))
          ) : (
            <p>No courses available</p>
          )}
        </motion.div>

        {selectedCourse && (
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="search__selected-course"
          >
            <SelectedCourse
              course={selectedCourse}
              handleEnrollNow={handleEnrollNow}
            />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default Search;