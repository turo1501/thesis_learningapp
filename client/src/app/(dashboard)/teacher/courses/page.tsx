"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Header from "@/components/Header";
import Loading from "@/components/Loading";
import TeacherCourseCard from "@/components/TeacherCourseCard";
import { Button } from "@/components/ui/button";
import {
  useCreateCourseMutation,
  useDeleteCourseMutation,
  useGetCoursesQuery,
} from "@/state/api";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Search, Plus, Briefcase, BookOpenCheck, Users, Award, 
  Lightbulb, BookOpen, GraduationCap, FolderPlus
} from "lucide-react";

// Thêm interface CoursesResponse để xử lý dữ liệu API
interface CoursesResponse {
  data?: Course[];
  success?: boolean;
  message?: string;
  [key: string]: any;
}

// Define course categories for filtering
const CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "programming", label: "Programming" },
  { value: "design", label: "Design" },
  { value: "business", label: "Business" },
  { value: "marketing", label: "Marketing" },
  { value: "photography", label: "Photography" },
  { value: "music", label: "Music" },
  { value: "health", label: "Health & Fitness" },
];

// Define course statuses for filtering
const STATUSES = [
  { value: "all", label: "All Statuses" },
  { value: "Draft", label: "Draft" },
  { value: "Published", label: "Published" },
];

const Courses = () => {
  const router = useRouter();
  const { user } = useUser();
  const {
    data: coursesData,
    isLoading,
    isError,
    refetch
  } = useGetCoursesQuery({});

  const [createCourse] = useCreateCourseMutation();
  const [deleteCourse] = useDeleteCourseMutation();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isDeleting, setIsDeleting] = useState(false);

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

  // Calculate course statistics
  const courseStats = useMemo(() => {
    return {
      total: courses.length,
      published: courses.filter(c => c.status === "Published").length,
      draft: courses.filter(c => c.status === "Draft").length,
      enrollments: courses.reduce((acc, course) => acc + (course.enrollments?.length || 0), 0)
    };
  }, [courses]);

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch = course.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || course.category === selectedCategory;
      const matchesStatus =
        selectedStatus === "all" || course.status === selectedStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [courses, searchTerm, selectedCategory, selectedStatus]);

  const handleEdit = (course: Course) => {
    router.push(`/teacher/courses/${course.courseId}`, {
      scroll: false,
    });
  };

  const handleDelete = async (course: Course) => {
    try {
      setIsDeleting(true);
      if (window.confirm("Are you sure you want to delete this course?")) {
        await deleteCourse(course.courseId).unwrap();
        await refetch();
      }
    } catch (error) {
      console.error("Failed to delete course:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreateCourse = async () => {
    if (!user) return;

    try {
      const result = await createCourse({
        teacherId: user.id,
        teacherName: user.fullName || "Unknown Teacher",
      }).unwrap();
      router.push(`/teacher/courses/${result.courseId}`, {
        scroll: false,
      });
    } catch (error) {
      console.error("Failed to create course:", error);
    }
  };

  if (isLoading) return <Loading />;
  if (isError || !courses) return <div>Error loading courses.</div>;

  return (
    <div className="min-h-screen bg-customgreys-primarybg text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header with Create Button */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <Briefcase className="h-7 w-7 text-primary-400" />
              Course Management
            </h1>
            <p className="text-gray-400 mt-1">Create, edit, and manage your course offerings</p>
          </div>
          
          <Button
            onClick={handleCreateCourse}
            className="bg-primary-700 hover:bg-primary-600 text-white rounded-lg px-5 h-11 shadow-lg shadow-primary-900/20"
          >
            <FolderPlus className="mr-2 h-5 w-5" />
            Create New Course
          </Button>
        </div>
        
        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-customgreys-darkGrey rounded-xl p-5 border border-customgreys-darkerGrey shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-white">{courseStats.total}</p>
                <p className="text-sm text-gray-400">Total Courses</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary-900/30 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-primary-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-customgreys-darkGrey rounded-xl p-5 border border-customgreys-darkerGrey shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-white">{courseStats.published}</p>
                <p className="text-sm text-gray-400">Published</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-900/30 flex items-center justify-center">
                <Award className="h-5 w-5 text-green-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-customgreys-darkGrey rounded-xl p-5 border border-customgreys-darkerGrey shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-white">{courseStats.draft}</p>
                <p className="text-sm text-gray-400">Drafts</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-yellow-900/30 flex items-center justify-center">
                <Lightbulb className="h-5 w-5 text-yellow-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-customgreys-darkGrey rounded-xl p-5 border border-customgreys-darkerGrey shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-white">{courseStats.enrollments}</p>
                <p className="text-sm text-gray-400">Students</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-900/30 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-400" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Filters Section */}
        <div className="bg-customgreys-darkGrey rounded-xl p-4 md:p-6 border border-customgreys-darkerGrey shadow-lg mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search your courses..."
                className="pl-10 bg-customgreys-primarybg border-customgreys-darkerGrey text-white h-11 rounded-lg"
              />
            </div>
            
            <div className="flex flex-wrap gap-4 w-full md:w-auto">
              <Tabs defaultValue="all" value={selectedCategory} onValueChange={setSelectedCategory} className="w-full md:w-auto">
                <TabsList className="bg-customgreys-primarybg h-auto p-1 rounded-lg">
                  <TabsTrigger 
                    value="all" 
                    className="text-sm py-2 px-4 data-[state=active]:bg-primary-700 data-[state=active]:text-white rounded-md"
                  >
                    All Categories
                  </TabsTrigger>
                  <TabsTrigger 
                    value="programming" 
                    className="text-sm py-2 px-4 data-[state=active]:bg-primary-700 data-[state=active]:text-white rounded-md"
                  >
                    Programming
                  </TabsTrigger>
                  <TabsTrigger 
                    value="design" 
                    className="text-sm py-2 px-4 data-[state=active]:bg-primary-700 data-[state=active]:text-white rounded-md"
                  >
                    Design
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              
              <Tabs defaultValue="all" value={selectedStatus} onValueChange={setSelectedStatus} className="w-full md:w-auto">
                <TabsList className="bg-customgreys-primarybg h-auto p-1 rounded-lg">
                  <TabsTrigger 
                    value="all" 
                    className="text-sm py-2 px-4 data-[state=active]:bg-primary-700 data-[state=active]:text-white rounded-md"
                  >
                    All Status
                  </TabsTrigger>
                  <TabsTrigger 
                    value="Published" 
                    className="text-sm py-2 px-4 data-[state=active]:bg-green-700 data-[state=active]:text-white rounded-md"
                  >
                    Published
                  </TabsTrigger>
                  <TabsTrigger 
                    value="Draft" 
                    className="text-sm py-2 px-4 data-[state=active]:bg-yellow-700 data-[state=active]:text-white rounded-md"
                  >
                    Draft
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </div>
        
        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-gray-400">
              Showing {filteredCourses.length} of {courses.length} courses
            </p>
          </div>
          
          {selectedCategory !== 'all' && (
            <Badge className="bg-primary-900/20 text-primary-400 border-primary-700/30 px-3 py-1">
              Category: {CATEGORIES.find(c => c.value === selectedCategory)?.label}
            </Badge>
          )}
        </div>
        
        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            <div className="col-span-full p-12 rounded-xl bg-customgreys-darkGrey border border-customgreys-darkerGrey text-center">
              <GraduationCap className="mx-auto h-12 w-12 text-gray-500 mb-4" />
              <h3 className="text-xl font-medium text-white mb-2">No courses found</h3>
              <p className="text-gray-400 mb-6">
                {searchTerm 
                  ? `No courses match "${searchTerm}". Try different keywords or clear your filters.` 
                  : "You haven't created any courses yet or none match your current filters."}
              </p>
              <Button onClick={handleCreateCourse} className="bg-primary-700 hover:bg-primary-600 mx-auto">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Course
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Courses;