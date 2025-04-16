"use client";

import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Plus,
  CheckCircle,
  Clock,
  BookOpen,
  Users,
  Filter,
  FileText,
  Calendar,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { 
  useGetCoursesQuery, 
  useGetCourseAssignmentsQuery 
} from "@/state/api";
import { toast } from "sonner";

// Define interface for API response
interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

// Define Course type
interface Course {
  courseId: string;
  teacherId: string;
  title: string;
  description?: string;
  category: string;
  image?: string;
  level: string;
  status: string;
}

// Define Assignment type to match API schema
interface Assignment {
  assignmentId: string;
  courseId: string;
  teacherId: string;
  title: string;
  description: string;
  dueDate: string;
  points: number;
  status: "draft" | "published" | "archived";
  submissions: AssignmentSubmission[];
  attachments: string[];
  createdAt?: string;
  updatedAt?: string;
}

interface AssignmentSubmission {
  studentId: string;
  studentName: string;
  submissionDate: string;
  content: string;
  grade?: number;
  feedback?: string;
  status: "submitted" | "graded";
}

// Extend Assignment with course info and UI status
interface AssignmentWithCourse extends Assignment {
  courseName: string;
  uiStatus: "active" | "upcoming" | "past";
}

const TeacherAssignments = () => {
  const [selectedTab, setSelectedTab] = useState<"active" | "upcoming" | "past">("active");
  const [courseFilter, setCourseFilter] = useState("all");
  const router = useRouter();
  const { user, isLoaded } = useUser();
  
  // Get courses taught by this teacher
  const { data: coursesData, isLoading: isLoadingCourses, error: coursesError } = useGetCoursesQuery(
    {},
    { skip: !isLoaded || !user }
  );

  // Process courses data
  const courses = useMemo(() => {
    if (!coursesData) return [] as Course[];
    
    // Handle both array responses and object responses with data property
    if (Array.isArray(coursesData)) {
      return coursesData as Course[];
    } else if (typeof coursesData === 'object' && coursesData !== null) {
      // For object responses that might have a data property
      const data = (coursesData as unknown as ApiResponse<Course[]>).data;
      return Array.isArray(data) ? data : [] as Course[];
    }
    
    return [] as Course[];
  }, [coursesData]);

  // Filter courses where the teacher is the owner
  const teacherCourses = useMemo(() => {
    return courses.filter(course => course.teacherId === user?.id);
  }, [courses, user?.id]);
  
  // State to store all assignments
  const [allAssignments, setAllAssignments] = useState<AssignmentWithCourse[]>([]);
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(true);
  const [hasAssignmentError, setHasAssignmentError] = useState(false);

  // Individual course assignment queries - each hook must be called unconditionally at the top level
  const course1Query = useGetCourseAssignmentsQuery(teacherCourses[0]?.courseId || "", { 
    skip: !teacherCourses[0] || !teacherCourses[0]?.courseId || teacherCourses[0]?.courseId === "undefined"
  });
  const course2Query = useGetCourseAssignmentsQuery(teacherCourses[1]?.courseId || "", { 
    skip: !teacherCourses[1] || !teacherCourses[1]?.courseId || teacherCourses[1]?.courseId === "undefined"
  });
  const course3Query = useGetCourseAssignmentsQuery(teacherCourses[2]?.courseId || "", { 
    skip: !teacherCourses[2] || !teacherCourses[2]?.courseId || teacherCourses[2]?.courseId === "undefined"
  });
  const course4Query = useGetCourseAssignmentsQuery(teacherCourses[3]?.courseId || "", { 
    skip: !teacherCourses[3] || !teacherCourses[3]?.courseId || teacherCourses[3]?.courseId === "undefined"
  });
  const course5Query = useGetCourseAssignmentsQuery(teacherCourses[4]?.courseId || "", { 
    skip: !teacherCourses[4] || !teacherCourses[4]?.courseId || teacherCourses[4]?.courseId === "undefined"
  });
  const course6Query = useGetCourseAssignmentsQuery(teacherCourses[5]?.courseId || "", { 
    skip: !teacherCourses[5] || !teacherCourses[5]?.courseId || teacherCourses[5]?.courseId === "undefined"
  });
  const course7Query = useGetCourseAssignmentsQuery(teacherCourses[6]?.courseId || "", { 
    skip: !teacherCourses[6] || !teacherCourses[6]?.courseId || teacherCourses[6]?.courseId === "undefined"
  });
  const course8Query = useGetCourseAssignmentsQuery(teacherCourses[7]?.courseId || "", { 
    skip: !teacherCourses[7] || !teacherCourses[7]?.courseId || teacherCourses[7]?.courseId === "undefined"
  });
  const course9Query = useGetCourseAssignmentsQuery(teacherCourses[8]?.courseId || "", { 
    skip: !teacherCourses[8] || !teacherCourses[8]?.courseId || teacherCourses[8]?.courseId === "undefined"
  });
  const course10Query = useGetCourseAssignmentsQuery(teacherCourses[9]?.courseId || "", { 
    skip: !teacherCourses[9] || !teacherCourses[9]?.courseId || teacherCourses[9]?.courseId === "undefined"
  });

  // Function to refetch all course assignments
  const refetchAllAssignments = useCallback(() => {
    // Refetch all course queries that are not skipped
    if (teacherCourses[0]) course1Query.refetch();
    if (teacherCourses[1]) course2Query.refetch();
    if (teacherCourses[2]) course3Query.refetch();
    if (teacherCourses[3]) course4Query.refetch();
    if (teacherCourses[4]) course5Query.refetch();
    if (teacherCourses[5]) course6Query.refetch();
    if (teacherCourses[6]) course7Query.refetch();
    if (teacherCourses[7]) course8Query.refetch();
    if (teacherCourses[8]) course9Query.refetch();
    if (teacherCourses[9]) course10Query.refetch();
  }, [
    teacherCourses,
    course1Query, course2Query, course3Query, course4Query, course5Query,
    course6Query, course7Query, course8Query, course9Query, course10Query
  ]);

  // Refetch assignments when the component mounts or when returning to the page
  useEffect(() => {
    refetchAllAssignments();
  }, [refetchAllAssignments]);

  // Create an array of query results to process
  const courseQueries = useMemo(() => {
    return [
      course1Query, course2Query, course3Query, course4Query, course5Query,
      course6Query, course7Query, course8Query, course9Query, course10Query
    ].slice(0, teacherCourses.length);
  }, [
    course1Query, course2Query, course3Query, course4Query, course5Query,
    course6Query, course7Query, course8Query, course9Query, course10Query,
    teacherCourses.length
  ]);

  // Combine assignments from all courses
  useEffect(() => {
    if (teacherCourses.length === 0) {
      setAllAssignments([]);
      setIsLoadingAssignments(false);
      return;
    }

    // Check if all queries have loaded
    const isLoading = courseQueries.some(query => query.isLoading);
    setIsLoadingAssignments(isLoading);
    
    // Check if any query has an error
    const hasError = courseQueries.some(query => query.isError);
    setHasAssignmentError(hasError);

    if (!isLoading) {
      let combinedAssignments: AssignmentWithCourse[] = [];
      
      teacherCourses.forEach((course, index) => {
        if (index < courseQueries.length) {
          const courseAssignments = courseQueries[index].data || [];
          
          if (courseAssignments.length > 0) {
            // Add course info to each assignment and calculate UI status
            const assignmentsWithCourse = courseAssignments.map((assignment: Assignment) => {
              const dueDate = new Date(assignment.dueDate);
              const now = new Date();
              
              let uiStatus: "active" | "upcoming" | "past";
              if (dueDate < now) {
                uiStatus = "past";
              } else if (dueDate.getTime() - now.getTime() < 7 * 24 * 60 * 60 * 1000) { // Within next 7 days
                uiStatus = "active";
              } else {
                uiStatus = "upcoming";
              }
              
              return {
                ...assignment,
                courseName: course.title,
                uiStatus
              };
            });
            
            combinedAssignments = [...combinedAssignments, ...assignmentsWithCourse];
          }
        }
      });
      
      setAllAssignments(combinedAssignments);
    }
  }, [teacherCourses, courseQueries]);
  
  // Filter assignments based on status and course
  const filteredAssignments = useMemo(() => {
    return allAssignments.filter(assignment => {
      // Filter by course if specified
      if (courseFilter !== "all" && assignment.courseId !== courseFilter) {
        return false;
      }
      
      // Filter by tab/status
      return assignment.uiStatus === selectedTab;
    });
  }, [allAssignments, selectedTab, courseFilter]);

  const handleViewAssignment = (assignmentId: string) => {
    router.push(`/teacher/assignments/${assignmentId}`);
  };

  const handleCreateAssignment = () => {
    router.push("/teacher/assignments/create");
  };

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
      </div>
    );
  }

  if (coursesError) {
    return (
      <div className="p-8">
        <div className="text-red-500 bg-red-100 p-4 rounded-md flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>Error loading courses. Please try again later.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="teacher-assignments">
      <Header
        title="Assignments"
        subtitle="Create and manage student assignments"
        rightElement={
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleCreateAssignment}
            disabled={teacherCourses.length === 0}
          >
            <Plus size={16} className="mr-1" />
            Create Assignment
          </Button>
        }
      />

      <Tabs
        defaultValue="active"
        value={selectedTab}
        onValueChange={(value) => setSelectedTab(value as "active" | "upcoming" | "past")}
        className="mt-6"
      >
        <div className="flex items-center justify-between mb-6">
          <TabsList className="bg-slate-800">
            <TabsTrigger
              value="active"
              className="data-[state=active]:bg-blue-600"
            >
              Active
            </TabsTrigger>
            <TabsTrigger
              value="upcoming"
              className="data-[state=active]:bg-blue-600"
            >
              Upcoming
            </TabsTrigger>
            <TabsTrigger
              value="past"
              className="data-[state=active]:bg-blue-600"
            >
              Past
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-3">
            <div className="bg-slate-800 p-2 rounded-md flex items-center gap-2">
              <Filter size={14} className="text-slate-400" />
              <select 
                className="bg-transparent text-sm border-none focus:outline-none text-white"
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
              >
                <option value="all">All Courses</option>
                {teacherCourses.map(course => (
                  <option key={course.courseId} value={course.courseId}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {isLoadingAssignments || isLoadingCourses ? (
          <div className="flex justify-center items-center p-12">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            <span className="ml-3 text-slate-500">Loading assignments...</span>
          </div>
        ) : hasAssignmentError ? (
          <div className="p-4 bg-red-900/20 border border-red-600/30 rounded-md text-red-200 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
            <span>Error loading assignments. Please try again later.</span>
          </div>
        ) : (
          <>
        <TabsContent value="active" className="mt-0">
          <div className="space-y-4">
                {renderAssignmentsList(filteredAssignments, handleViewAssignment)}
          </div>
        </TabsContent>

        <TabsContent value="upcoming" className="mt-0">
          <div className="space-y-4">
                {renderAssignmentsList(filteredAssignments, handleViewAssignment)}
          </div>
        </TabsContent>

        <TabsContent value="past" className="mt-0">
          <div className="space-y-4">
                {renderAssignmentsList(filteredAssignments, handleViewAssignment)}
              </div>
            </TabsContent>
          </>
        )}
        
        {teacherCourses.length === 0 && !isLoadingCourses && (
          <div className="mt-4 p-6 bg-slate-800 border border-slate-700 rounded-md">
            <h3 className="text-lg font-medium text-white mb-2">You don't have any courses yet</h3>
            <p className="text-slate-400 mb-4">
              You need to create or be assigned to courses before you can create assignments.
            </p>
            <Button 
              onClick={() => router.push("/teacher/courses/create")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              Create a Course
            </Button>
          </div>
        )}
      </Tabs>
    </div>
  );
};

const renderAssignmentsList = (
  assignments: AssignmentWithCourse[],
  onViewAssignment: (id: string) => void
) => {
  if (assignments.length === 0) {
    return (
      <Card className="p-8 text-center text-slate-400 bg-slate-800 border-slate-700">
        <p>No assignments found in this category.</p>
      </Card>
    );
  }

  return assignments.map((assignment) => {
    const submittedCount = assignment.submissions.length;
    const gradedCount = assignment.submissions.filter(sub => sub.status === "graded").length;
    
    return (
    <Card
        key={assignment.assignmentId}
      className="p-6 bg-slate-900 border-slate-700 hover:border-blue-600/40 transition-colors cursor-pointer"
        onClick={() => onViewAssignment(assignment.assignmentId)}
    >
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-blue-600 hover:bg-blue-700">
              <BookOpen className="h-3 w-3 mr-1" />
              {assignment.courseName}
            </Badge>
            <Badge
              variant="outline"
              className="bg-slate-800 text-slate-300 border-slate-700"
            >
              <Calendar className="h-3 w-3 mr-1" />
              Due: {format(new Date(assignment.dueDate), "MMM dd, yyyy")}
            </Badge>
              <Badge 
                className={`${
                  assignment.status === "published" 
                    ? "bg-green-600 hover:bg-green-700" 
                    : assignment.status === "draft"
                    ? "bg-yellow-600 hover:bg-yellow-700"
                    : "bg-gray-600 hover:bg-gray-700"
                }`}
              >
                {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
            </Badge>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            {assignment.title}
          </h3>
          <p className="text-slate-400 mb-4">{assignment.description}</p>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center text-slate-400">
                <FileText className="h-4 w-4 mr-1 text-slate-500" />
                <span>{assignment.points} {assignment.points === 1 ? "Point" : "Points"}</span>
            </div>
            <div className="flex items-center text-green-500">
              <CheckCircle className="h-4 w-4 mr-1" />
              <span>
                  {submittedCount} Submitted
              </span>
            </div>
              {submittedCount > 0 && (
            <div className="flex items-center text-orange-500">
              <FileText className="h-4 w-4 mr-1" />
              <span>
                    {gradedCount} Graded ({Math.round((gradedCount / submittedCount) * 100)}%)
              </span>
            </div>
              )}
          </div>
        </div>
        <div className="flex flex-row md:flex-col gap-2 self-end md:self-center">
          <Button
            variant="outline"
              size="sm"
              className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
              onClick={(e) => {
                e.stopPropagation();
                onViewAssignment(assignment.assignmentId);
              }}
          >
            View Details
            </Button>
        </div>
      </div>
    </Card>
    );
  });
};

export default TeacherAssignments;
