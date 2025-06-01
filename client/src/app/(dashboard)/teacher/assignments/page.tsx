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
  useGetCoursesQuery
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

  // Function to fetch assignments for all teacher courses
  const fetchAllAssignments = useCallback(async () => {
    if (!user?.id || teacherCourses.length === 0) {
      setAllAssignments([]);
      setIsLoadingAssignments(false);
      return;
    }

    setIsLoadingAssignments(true);
    setHasAssignmentError(false);

    try {
      // Get auth token
      const token = localStorage.getItem('clerk-auth-token');
      if (!token) {
        throw new Error('No auth token available');
      }

      // Create an array of promises for each course's assignments
      const assignmentPromises = teacherCourses.map(async (course) => {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001"}/assignments/course/${course.courseId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (!response.ok) {
            throw new Error(`Failed to fetch assignments for course ${course.courseId}`);
          }

          const assignments = await response.json();
          
            // Add course info to each assignment and calculate UI status
          return assignments.map((assignment: Assignment) => {
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
        } catch (error) {
          console.error(`Error fetching assignments for course ${course.courseId}:`, error);
          return [];
        }
      });

      // Wait for all promises to resolve
      const assignmentsArrays = await Promise.all(assignmentPromises);
      
      // Flatten the array of arrays into a single array of assignments
      const combinedAssignments = assignmentsArrays.flat();
      
      setAllAssignments(combinedAssignments);
      setIsLoadingAssignments(false);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      setHasAssignmentError(true);
      setIsLoadingAssignments(false);
    }
  }, [user?.id, teacherCourses]);

  // Fetch assignments when courses are loaded or when returning to the page
  useEffect(() => {
    if (!isLoadingCourses && teacherCourses.length > 0) {
      fetchAllAssignments();
    }
  }, [isLoadingCourses, teacherCourses, fetchAllAssignments]);
  
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
    const pendingCount = submittedCount - gradedCount;
    
    // Determine if there are pending submissions that need attention
    const hasPendingSubmissions = pendingCount > 0;
    
    return (
    <Card
        key={assignment.assignmentId}
      className={`p-6 bg-slate-900 border-slate-700 ${hasPendingSubmissions ? 'border-orange-500' : 'hover:border-blue-600/40'} transition-colors cursor-pointer`}
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
              <>
                <div className="flex items-center text-green-400">
                  <FileText className="h-4 w-4 mr-1" />
                  <span>
                    {gradedCount} Graded
                  </span>
                </div>
                {hasPendingSubmissions && (
                  <div className="flex items-center text-orange-400 font-medium">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    <span>
                      {pendingCount} Pending
                    </span>
                  </div>
                )}
              </>
            )}
          </div>

          {submittedCount > 0 && (
            <div className="mt-3 w-full bg-slate-800 rounded-full h-1.5">
              <div 
                className={`h-1.5 rounded-full ${gradedCount === 0 ? 'bg-orange-500' : 'bg-green-500'}`}
                style={{ width: `${(gradedCount / submittedCount) * 100}%` }}
              ></div>
            </div>
          )}
        </div>
        <div className="flex flex-row md:flex-col gap-2 self-end md:self-center">
          {hasPendingSubmissions ? (
            <Button
              size="sm"
              className="bg-orange-600 text-white hover:bg-orange-700"
              onClick={(e) => {
                e.stopPropagation();
                onViewAssignment(`${assignment.assignmentId}/submissions`);
              }}
            >
              Grade Submissions ({pendingCount})
            </Button>
          ) : (
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
          )}
        </div>
      </div>
    </Card>
    );
  });
};

export default TeacherAssignments;
