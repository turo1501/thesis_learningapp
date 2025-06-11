"use client";

import Loading from "@/components/Loading";
import { useGetCoursesQuery } from "@/state/api";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import CourseCardSearch from "@/components/CourseCardSearch";
import SelectedCourse from "./SelectedCourse";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search as SearchIcon, 
  Filter, 
  BookOpen,
  Users,
  Star,
  TrendingUp,
  Grid,
  List,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
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

  // Filter courses based on search query and category
  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const matchesSearch = !searchQuery || 
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.teacherName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === "all" || 
        course.category.toLowerCase() === selectedCategory.toLowerCase();
      
      return matchesSearch && matchesCategory;
    });
  }, [courses, searchQuery, selectedCategory]);

  // Get unique categories
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(courses.map(course => course.category)));
    return ["all", ...uniqueCategories];
  }, [courses]);

  useEffect(() => {
    if (filteredCourses.length > 0) {
      if (id) {
        const course = filteredCourses.find((c) => c.courseId === id);
        setSelectedCourse(course || filteredCourses[0]);
      } else {
        setSelectedCourse(filteredCourses[0]);
      }
    }
  }, [filteredCourses, id]);

  if (isLoading) return <Loading />;
  if (isError || !courses) return <div>Failed to fetch courses</div>;

  const handleCourseSelect = (courseId: string) => {
    console.log("Selected course ID:", courseId);
    setSelectedCourse(filteredCourses.find((c) => c.courseId === courseId) || null);
  };

  const handleEnrollNow = (courseId: string) => {
    console.log("Enrolling in course with ID:", courseId);
    // Add the course ID to localStorage as a fallback
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedCourseId', courseId);
    }
    // Navigate to checkout with course ID
    router.push(`/checkout?step=1&id=${courseId}`, { scroll: false });
  };

  const totalStudents = courses.reduce((sum, course) => sum + (course.enrollments?.length || 0), 0);
  const averageRating = 4.8; // Mock average rating

  return (
    <div className="min-h-screen bg-customgreys-primarybg">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-customgreys-primarybg via-primary-900/5 to-customgreys-primarybg pt-24 pb-12">
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-gradient-to-br from-primary-900/10 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-gradient-to-tl from-indigo-900/10 to-transparent rounded-full blur-3xl" />
        </div>
        
        
      </div>

      {/* Main Content */}
      <div className="max-w-[1600px] w-[95%] mx-auto px-4 pb-20">
        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <Card className="bg-customgreys-secondarybg border-customgreys-darkGrey/50">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4 items-center">
                {/* Search */}
                <div className="relative flex-1">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300 w-5 h-5" />
                  <Input
                    placeholder="Search courses, instructors, or topics..."
                    className="pl-10 bg-customgreys-darkGrey border-customgreys-darkGrey text-gray-300 placeholder-customgreys-dirtyGrey"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                {/* Category Filter */}
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-customgreys-dirtyGrey" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="bg-customgreys-darkGrey border border-customgreys-darkGrey text-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {categories.map(category => (
                      <option key={category} value={category} className="bg-customgreys-darkGrey">
                        {category === "all" ? "All Categories" : category}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* View Mode Toggle */}
                <div className="flex bg-customgreys-darkGrey rounded-lg p-1">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className={viewMode === "grid" ? "bg-primary-600" : ""}
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className={viewMode === "list" ? "bg-primary-600" : ""}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {/* Results info */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-customgreys-darkGrey/50">
                <div className="text-sm text-customgreys-dirtyGrey">
                  Showing {filteredCourses.length} of {courses.length} courses
                  {searchQuery && ` for "${searchQuery}"`}
                  {selectedCategory !== "all" && ` in ${selectedCategory}`}
                </div>
                
                {filteredCourses.length > 0 && (
                  <Badge variant="secondary" className="bg-primary-600/20 text-primary-400 border-primary-600/30">
                    <Sparkles className="w-3 h-3 mr-1" />
                    {filteredCourses.length} matches
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Content Area */}
        <div className="flex flex-col xl:flex-row gap-8">
          {/* Courses Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="xl:w-3/5"
          >
            {filteredCourses.length > 0 ? (
              <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`}>
                {filteredCourses.map((course) => (
                  <CourseCardSearch
                    key={course.courseId}
                    course={course}
                    isSelected={selectedCourse?.courseId === course.courseId}
                    onClick={() => handleCourseSelect(course.courseId)}
                  />
                ))}
              </div>
            ) : (
              <Card className="bg-customgreys-secondarybg border-customgreys-darkGrey/50">
                <CardContent className="p-12 text-center">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold text-white mb-2">No courses found</h3>
                  <p className="text-customgreys-dirtyGrey mb-6">
                    Try adjusting your search criteria or browse all available courses.
                  </p>
                  <Button 
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("all");
                    }}
                    className="bg-primary-700 hover:bg-primary-600"
                  >
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Show All Courses
                  </Button>
                </CardContent>
              </Card>
            )}
          </motion.div>

          {/* Selected Course Details */}
          {selectedCourse && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="xl:w-2/5"
            >
              <div className="sticky top-8">
                <SelectedCourse
                  course={selectedCourse}
                  handleEnrollNow={handleEnrollNow}
                />
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;