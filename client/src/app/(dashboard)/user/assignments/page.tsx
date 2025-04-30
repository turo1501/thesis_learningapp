"use client";

import { useState, useMemo, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { format as dateFormat } from "date-fns";
import {
  CheckCircle,
  Calendar,
  BookOpen,
  Loader2,
  Clock,
  AlertCircle,
  FileText,
  Filter,
} from "lucide-react";
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
  useGetUserEnrolledCoursesQuery,
  useGetCourseAssignmentsQuery 
} from "@/state/api";
import Loading from "@/components/Loading";

const StudentAssignments = () => {
  const [selectedTab, setSelectedTab] = useState("active");
  const [courseFilter, setCourseFilter] = useState("all");
  const router = useRouter();
  const { user, isLoaded } = useUser();

  const { data: enrolledCourses = [], isLoading: isLoadingCourses } = useGetUserEnrolledCoursesQuery(
    user?.id ?? "", { skip: !isLoaded || !user }
  );

  // State to store all assignments
  const [allAssignments, setAllAssignments] = useState<any[]>([]);
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(true);

  // Use separate queries for each course and combine the results
  const courseQueries = useMemo(() => {
    return enrolledCourses.map(course => {
      // Skip if course ID is invalid
      if (!course.courseId || course.courseId === "undefined") {
        return { data: [], isLoading: false, isError: false };
      }
    return useGetCourseAssignmentsQuery(course.courseId);
  });
  }, [enrolledCourses]);

  // Combine assignments from all courses when enrolledCourses or queries change
  useEffect(() => {
    if (enrolledCourses.length === 0) {
      setAllAssignments([]);
      setIsLoadingAssignments(false);
      return;
    }

    // Check if all queries have loaded
    const isLoading = courseQueries.some(query => query.isLoading);
    setIsLoadingAssignments(isLoading);

    if (!isLoading) {
      let combinedAssignments: any[] = [];
      
      enrolledCourses.forEach((course, index) => {
        const courseAssignments = courseQueries[index].data || [];
        
        if (courseAssignments.length > 0) {
          // Add course info to each assignment
          const assignmentsWithCourse = courseAssignments.map((assignment: any) => ({
            ...assignment,
            courseName: course.title
          }));
          
          combinedAssignments = [...combinedAssignments, ...assignmentsWithCourse];
        }
      });
      
      setAllAssignments(combinedAssignments);
    }
  }, [enrolledCourses, courseQueries]);
  
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

  const handleViewDetails = (assignmentId: string) => {
    router.push(`/user/assignments/${assignmentId}`);
  };

  if (!isLoaded || isLoadingCourses) return <Loading />;
  if (!user) return <div>Please sign in to view your assignments.</div>;

  return (
    <div className="student-assignments">
      <Header
        title="Assignments"
        subtitle="View and complete your course assignments"
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
                {enrolledCourses.map(course => (
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
            {isLoadingAssignments ? (
              <Card className="p-8 text-center bg-slate-800 border-slate-700">
                <div className="flex justify-center mb-4">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
                <p className="text-slate-400">Loading assignments...</p>
              </Card>
            ) : (
              renderAssignmentsList(filteredAssignments, handleViewDetails, user?.id as string)
            )}
          </div>
        </TabsContent>

        <TabsContent value="upcoming" className="mt-0">
          <div className="space-y-4">
            {isLoadingAssignments ? (
              <Card className="p-8 text-center bg-slate-800 border-slate-700">
                <div className="flex justify-center mb-4">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
                <p className="text-slate-400">Loading assignments...</p>
              </Card>
            ) : (
              renderAssignmentsList(filteredAssignments, handleViewDetails, user?.id as string)
            )}
          </div>
        </TabsContent>

        <TabsContent value="past" className="mt-0">
          <div className="space-y-4">
            {isLoadingAssignments ? (
              <Card className="p-8 text-center bg-slate-800 border-slate-700">
                <div className="flex justify-center mb-4">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
                <p className="text-slate-400">Loading assignments...</p>
              </Card>
            ) : (
              renderAssignmentsList(filteredAssignments, handleViewDetails, user?.id as string)
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
  userId: string
) => {
  if (assignments.length === 0) {
    return (
      <Card className="p-8 text-center bg-slate-800 border-slate-700">
        <p className="text-slate-400">No assignments found in this category.</p>
      </Card>
    );
  }

  return assignments.map((assignment) => {
    // Check if user has submitted this assignment
    const userSubmission = assignment.submissions?.find(
      (s: any) => s.studentId === userId
    );
    
    const isSubmitted = !!userSubmission;
    const isGraded = userSubmission?.status === "graded";
    const submissionDate = userSubmission?.submissionDate;
    
    return (
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
                Due: {dateFormat(new Date(assignment.dueDate), "MMM dd, yyyy")}
              </Badge>
              {isSubmitted && (
                <Badge 
                  className={isGraded ? "bg-green-600" : "bg-yellow-600"}
                >
                  {isGraded ? "Graded" : "Submitted"}
                </Badge>
              )}
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {assignment.title}
            </h3>
            <p className="text-slate-400 mb-4">{assignment.description}</p>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center text-slate-400">
                <FileText className="h-4 w-4 mr-1 text-slate-500" />
                <span>Points: {assignment.points}</span>
              </div>
              
              {isSubmitted && (
                <>
                  <div className="flex items-center text-yellow-500">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>
                      Submitted: {dateFormat(new Date(submissionDate), "MMM dd, yyyy")}
                    </span>
                  </div>
                  
                  {isGraded && (
                    <div className="flex items-center text-green-500">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      <span>
                        Grade: {userSubmission.grade}/{assignment.points}
                      </span>
                    </div>
                  )}
                </>
              )}
              
              {!isSubmitted && new Date(assignment.dueDate) < new Date() && (
                <div className="flex items-center text-red-500">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  <span>Overdue</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-row md:flex-col gap-2 self-end md:self-center">
            <Button
              variant="outline"
              className="bg-slate-900 text-slate-200 border-slate-700 hover:bg-slate-700"
              onClick={() => onViewDetails(assignment.assignmentId)}
            >
              {isSubmitted ? 
                (isGraded ? "View Feedback" : "View Submission") : 
                "Submit Assignment"}
            </Button>
          </div>
        </div>
      </Card>
    );
  });
};

export default StudentAssignments; 
      