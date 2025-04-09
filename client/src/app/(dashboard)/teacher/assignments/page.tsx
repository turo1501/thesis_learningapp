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
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, useMemo, useEffect } from "react";
import { useGetCoursesQuery, useGetCourseAssignmentsQuery } from "@/state/api";
import { useUser } from "@clerk/nextjs";

const TeacherAssignments = () => {
  const [selectedTab, setSelectedTab] = useState("active");
  const [courseFilter, setCourseFilter] = useState("all");
  const [allAssignments, setAllAssignments] = useState<any[]>([]);
  const [isClient, setIsClient] = useState(false);
  
  const router = useRouter();
  const { user } = useUser();
  
  const { data: courses = [], isLoading: isLoadingCourses } = useGetCoursesQuery({ category: "" });
  
  // Add effect to set client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Filter to only show teacher's courses
  const teacherCourses = useMemo(() => {
    return courses.filter(course => course.teacherId === user?.id);
  }, [courses, user?.id]);

  // Get all course IDs for teacher courses
  const courseIds = useMemo(() => 
    teacherCourses.map(course => course.courseId), 
    [teacherCourses]
  );
  
  // Instead of using hooks in a map (which violates Rules of Hooks),
  // fetch assignments directly using fetch API
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(false);
  
  useEffect(() => {
    if (!isClient || teacherCourses.length === 0) return;
    
    const fetchAssignmentsForCourses = async () => {
      setIsLoadingAssignments(true);
      try {
        const assignmentsData: any[] = [];
        
        // Fetch assignments for each course sequentially
        for (const course of teacherCourses) {
          try {
            // Use your API directly instead of through hooks in loops
            const token = await getAuthToken();
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/assignments/course/${course.courseId}`, {
              headers: {
                'Authorization': token ? `Bearer ${token}` : '',
                'Cache-Control': 'no-cache, no-store, must-revalidate'
              }
            });
            
            if (response.ok) {
              const responseData = await response.json();
              const courseAssignments = responseData.data || responseData; // Handle possible data wrapping
              
              if (Array.isArray(courseAssignments) && courseAssignments.length > 0) {
                // Add course info to each assignment
                courseAssignments.forEach((assignment: any) => {
                  assignmentsData.push({
                    ...assignment,
                    courseName: course.title
                  });
                });
              }
            }
          } catch (error) {
            console.error(`Error fetching assignments for course ${course.courseId}:`, error);
          }
        }
        
        setAllAssignments(assignmentsData);
      } catch (error) {
        console.error("Failed to fetch assignments:", error);
      } finally {
        setIsLoadingAssignments(false);
      }
    };
    
    // Helper function to get auth token
    const getAuthToken = async () => {
      if (typeof window !== 'undefined' && window.Clerk) {
        const session = await window.Clerk.session;
        if (session) {
          return session.getToken();
        }
      }
      return '';
    };
    
    fetchAssignmentsForCourses();
  }, [teacherCourses, isClient]);
  
  // Filter assignments based on status and course
  const filteredAssignments = useMemo(() => {
    // Current date for comparison
    const now = new Date();
    
    return allAssignments.filter(assignment => {
      // Filter by course if specified
      if (courseFilter !== "all" && assignment.courseId !== courseFilter) {
        return false;
      }
      
      // Determine status based on due date
      const dueDate = new Date(assignment.dueDate);
      let status;
      
      if (dueDate < now) {
        status = "past";
      } else if (dueDate.getTime() - now.getTime() < 7 * 24 * 60 * 60 * 1000) { // Within next 7 days
        status = "active";
      } else {
        status = "upcoming";
      }
      
      return status === selectedTab;
    });
  }, [allAssignments, selectedTab, courseFilter]);

  const handleCreateAssignment = () => {
    router.push("/teacher/assignments/create");
  };

  const handleViewDetails = (assignmentId: string) => {
    router.push(`/teacher/assignments/${assignmentId}`);
  };

  const handleGradeSubmissions = (assignmentId: string) => {
    router.push(`/teacher/assignments/${assignmentId}/submissions`);
  };

  // Loading state
  const isLoading = isLoadingCourses || isLoadingAssignments;

  // Show a simpler initial loading state when not yet hydrated
  if (!isClient) {
    return (
      <div className="teacher-assignments">
        <Header
          title="Assignments"
          subtitle="Create and manage student assignments"
          rightElement={
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              disabled={true}
            >
              <Plus size={16} className="mr-1" />
              Create Assignment
            </Button>
          }
        />
        <div className="mt-6">
          <Card className="p-8 text-center bg-slate-800 border-slate-700">
            <div className="flex justify-center mb-4">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
            <p className="text-slate-400">Loading assignments...</p>
          </Card>
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
          >
            <Plus size={16} className="mr-1" />
            Create Assignment
          </Button>
        }
      />

      <Tabs
        defaultValue="active"
        value={selectedTab}
        onValueChange={setSelectedTab}
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

        <TabsContent value="active" className="mt-0">
          <div className="space-y-4">
            {isLoading ? (
              <Card className="p-8 text-center bg-slate-800 border-slate-700">
                <div className="flex justify-center mb-4">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
                <p className="text-slate-400">Loading assignments...</p>
              </Card>
            ) : (
              renderAssignmentsList(filteredAssignments, handleViewDetails, handleGradeSubmissions)
            )}
          </div>
        </TabsContent>

        <TabsContent value="upcoming" className="mt-0">
          <div className="space-y-4">
            {isLoading ? (
              <Card className="p-8 text-center bg-slate-800 border-slate-700">
                <div className="flex justify-center mb-4">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
                <p className="text-slate-400">Loading assignments...</p>
              </Card>
            ) : (
              renderAssignmentsList(filteredAssignments, handleViewDetails, handleGradeSubmissions)
            )}
          </div>
        </TabsContent>

        <TabsContent value="past" className="mt-0">
          <div className="space-y-4">
            {isLoading ? (
              <Card className="p-8 text-center bg-slate-800 border-slate-700">
                <div className="flex justify-center mb-4">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
                <p className="text-slate-400">Loading assignments...</p>
              </Card>
            ) : (
              renderAssignmentsList(filteredAssignments, handleViewDetails, handleGradeSubmissions)
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const renderAssignmentsList = (
  assignments: any[], 
  onViewDetails: (id: string) => void, 
  onGradeSubmissions: (id: string) => void
) => {
  if (assignments.length === 0) {
    return (
      <Card className="p-8 text-center bg-slate-800 border-slate-700">
        <p className="text-slate-400">No assignments found in this category.</p>
      </Card>
    );
  }

  return assignments.map((assignment) => (
    <Card
      key={assignment.assignmentId}
      className="p-6 bg-slate-800 border-slate-700 hover:border-blue-600/40 transition-colors"
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
              className="bg-slate-900 text-slate-300 border-slate-700"
            >
              <Calendar className="h-3 w-3 mr-1" />
              Due: {format(new Date(assignment.dueDate), "MMM dd, yyyy")}
            </Badge>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            {assignment.title}
          </h3>
          <p className="text-slate-400 mb-4">{assignment.description}</p>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center text-slate-400">
              <Users className="h-4 w-4 mr-1 text-slate-500" />
              <span>{assignment.submissions?.length || 0} Submissions</span>
            </div>
            <div className="flex items-center text-green-500">
              <CheckCircle className="h-4 w-4 mr-1" />
              <span>
                {assignment.submissions?.filter((s: any) => s.status === "submitted").length || 0} Submitted
              </span>
            </div>
            <div className="flex items-center text-orange-500">
              <FileText className="h-4 w-4 mr-1" />
              <span>
                {assignment.submissions?.filter((s: any) => s.status === "graded").length || 0} Graded
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-row md:flex-col gap-2 self-end md:self-center">
          <Button
            variant="outline"
            className="bg-slate-900 text-slate-200 border-slate-700 hover:bg-slate-700"
            onClick={() => onViewDetails(assignment.assignmentId)}
          >
            View Details
          </Button>
          <Button 
            className="bg-orange-600 hover:bg-orange-700 text-white"
            onClick={() => onGradeSubmissions(assignment.assignmentId)}
          >
            Grade Submissions
          </Button>
        </div>
      </div>
    </Card>
  ));
};

export default TeacherAssignments;
