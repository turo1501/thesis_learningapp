"use client";

import Header from "@/components/Header";
import Loading from "@/components/Loading";
import TeacherCourseCard from "@/components/TeacherCourseCard";
import Toolbar from "@/components/Toolbar";
import { Button } from "@/components/ui/button";
import {
  useCreateCourseMutation,
  useDeleteCourseMutation,
  useGetCoursesQuery,
} from "@/state/api";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";

// Thêm interface CoursesResponse để xử lý dữ liệu API
interface CoursesResponse {
  data?: Course[];
  success?: boolean;
  message?: string;
  [key: string]: any;
}

const Courses = () => {
  const router = useRouter();
  const { user } = useUser();
  const {
    data: coursesData,
    isLoading,
    isError,
  } = useGetCoursesQuery({});

  const [createCourse] = useCreateCourseMutation();
  const [deleteCourse] = useDeleteCourseMutation();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Extract courses array from API response
  const courses = useMemo(() => {
    // Kiểm tra xem coursesData có phải là mảng không
    if (coursesData && Array.isArray(coursesData)) {
      return coursesData as Course[]; // Nếu là mảng, trả về ngay
    } else if (coursesData && 'data' in coursesData && Array.isArray((coursesData as CoursesResponse).data)) {
      return (coursesData as CoursesResponse).data || []; // Nếu coursesData có thuộc tính data là mảng
    } else {
      return [] as Course[]; // Trả về mảng rỗng nếu không có dữ liệu hợp lệ
    }
  }, [coursesData]);

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch = course.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || course.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [courses, searchTerm, selectedCategory]);

  const handleEdit = (course: Course) => {
    router.push(`/teacher/courses/${course.courseId}`, {
      scroll: false,
    });
  };

  const handleDelete = async (course: Course) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      await deleteCourse(course.courseId).unwrap();
    }
  };

  const handleCreateCourse = async () => {
    if (!user) return;

    const result = await createCourse({
      teacherId: user.id,
      teacherName: user.fullName || "Unknown Teacher",
    }).unwrap();
    router.push(`/teacher/courses/${result.courseId}`, {
      scroll: false,
    });
  };

  if (isLoading) return <Loading />;
  if (isError || !courses) return <div>Error loading courses.</div>;

  return (
    <div className="teacher-courses">
      <Header
        title="Courses"
        subtitle="Browse your courses"
        rightElement={
          <Button
            onClick={handleCreateCourse}
            className="teacher-courses__header"
          >
            Create Course
          </Button>
        }
      />
      <Toolbar
        onSearch={setSearchTerm}
        onCategoryChange={setSelectedCategory}
      />
      <div className="teacher-courses__grid">
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course) => (
            <TeacherCourseCard
              key={course.courseId}
              course={course}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isOwner={course.teacherId === user?.id}
            />
          ))
        ) : (
          <p className="text-center w-full py-8 text-gray-500">
            No courses found. Create a new course or adjust your filters.
          </p>
        )}
      </div>
    </div>
  );
};

export default Courses;