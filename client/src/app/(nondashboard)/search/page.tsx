"use client";

import Loading from "@/components/Loading";
import { useGetCoursesQuery } from "@/state/api/courseApi";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import CourseCardSearch from "@/components/CourseCardSearch";
import SelectedCourse from "./SelectedCourse";
import { useUser } from "@clerk/nextjs";

const Search = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const { data: apiCourses, isLoading, isError } = useGetCoursesQuery({});
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();


  useEffect(() => {
    if (apiCourses) {
      // Transform the API courses to match the global Course interface
      const transformedCourses: Course[] = apiCourses.map(course => ({
        courseId: course.id,
        title: course.title,
        description: course.description,
        teacherId: course.teacherId,
        teacherName: course.teacherId, // Using teacherId as teacherName temporarily
        category: course.subject,
        level: course.level as "Beginner" | "Intermediate" | "Advanced",
        status: course.status as "Draft" | "Published",
        sections: [],
        price: 0, // Default price
        image: course.imageUrl,
        enrollments: []
      }));
      
      setCourses(transformedCourses);
      
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
          {courses.map((course) => (
            <CourseCardSearch
              key={course.courseId}
              course={course}
              isSelected={selectedCourse?.courseId === course.courseId}
              onClick={() => handleCourseSelect(course)}
            />
          ))}
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