"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
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

// Define interfaces
interface Course {
  courseId: string;
  userId: string;
  title: string;
  description?: string;
  enrollmentDate: string;
  status: string;
  progress?: number;
}

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

interface AssignmentWithCourse extends Assignment {
  courseName: string;
  uiStatus: "active" | "upcoming" | "past";
}

const StudentAssignments = () => {
  const [selectedTab, setSelectedTab] = useState("active");
  const [courseFilter, setCourseFilter] = useState("all");
  const router = useRouter();
  const { user, isLoaded } = useUser();

  const { data: enrolledCourses = [], isLoading: isLoadingCourses } = useGetUserEnrolledCoursesQuery(
    user?.id ?? "", { skip: !isLoaded || !user }
  );

  // State to store all assignments
  const [allAssignments, setAllAssignments] = useState<AssignmentWithCourse[]>([]);
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(true);
  const [hasAssignmentError, setHasAssignmentError] = useState(false);

  // Individual course assignment queries - each hook must be called unconditionally at the top level
  const course0Query = useGetCourseAssignmentsQuery(enrolledCourses[0]?.courseId || "", { 
    skip: !enrolledCourses[0] || !enrolledCourses[0]?.courseId || enrolledCourses[0]?.courseId === "undefined"
  });
  const course1Query = useGetCourseAssignmentsQuery(enrolledCourses[1]?.courseId || "", { 
    skip: !enrolledCourses[1] || !enrolledCourses[1]?.courseId || enrolledCourses[1]?.courseId === "undefined"
  });
  const course2Query = useGetCourseAssignmentsQuery(enrolledCourses[2]?.courseId || "", { 
    skip: !enrolledCourses[2] || !enrolledCourses[2]?.courseId || enrolledCourses[2]?.courseId === "undefined"
  });
  const course3Query = useGetCourseAssignmentsQuery(enrolledCourses[3]?.courseId || "", { 
    skip: !enrolledCourses[3] || !enrolledCourses[3]?.courseId || enrolledCourses[3]?.courseId === "undefined"
  });
  const course4Query = useGetCourseAssignmentsQuery(enrolledCourses[4]?.courseId || "", { 
    skip: !enrolledCourses[4] || !enrolledCourses[4]?.courseId || enrolledCourses[4]?.courseId === "undefined"
  });
  const course5Query = useGetCourseAssignmentsQuery(enrolledCourses[5]?.courseId || "", { 
    skip: !enrolledCourses[5] || !enrolledCourses[5]?.courseId || enrolledCourses[5]?.courseId === "undefined"
  });
  const course6Query = useGetCourseAssignmentsQuery(enrolledCourses[6]?.courseId || "", { 
    skip: !enrolledCourses[6] || !enrolledCourses[6]?.courseId || enrolledCourses[6]?.courseId === "undefined"
  });
  const course7Query = useGetCourseAssignmentsQuery(enrolledCourses[7]?.courseId || "", { 
    skip: !enrolledCourses[7] || !enrolledCourses[7]?.courseId || enrolledCourses[7]?.courseId === "undefined"
  });
  const course8Query = useGetCourseAssignmentsQuery(enrolledCourses[8]?.courseId || "", { 
    skip: !enrolledCourses[8] || !enrolledCourses[8]?.courseId || enrolledCourses[8]?.courseId === "undefined"
  });
  const course9Query = useGetCourseAssignmentsQuery(enrolledCourses[9]?.courseId || "", { 
    skip: !enrolledCourses[9] || !enrolledCourses[9]?.courseId || enrolledCourses[9]?.courseId === "undefined"
  });

  // Function to refetch all course assignments
  const refetchAllAssignments = useCallback(() => {
    // Refetch all course queries that are not skipped
    if (enrolledCourses[0]) course0Query.refetch();
    if (enrolledCourses[1]) course1Query.refetch();
    if (enrolledCourses[2]) course2Query.refetch();
    if (enrolledCourses[3]) course3Query.refetch();
    if (enrolledCourses[4]) course4Query.refetch();
    if (enrolledCourses[5]) course5Query.refetch();
    if (enrolledCourses[6]) course6Query.refetch();
    if (enrolledCourses[7]) course7Query.refetch();
    if (enrolledCourses[8]) course8Query.refetch();
    if (enrolledCourses[9]) course9Query.refetch();
  }, [
    enrolledCourses,
    course0Query, course1Query, course2Query, course3Query, course4Query,
    course5Query, course6Query, course7Query, course8Query, course9Query
  ]);

  // Refetch assignments when the component mounts or when returning to the page
  useEffect(() => {
    refetchAllAssignments();
  }, [refetchAllAssignments]);

  // Create an array of query results to process
  const courseQueries = useMemo(() => {
    return [
      course0Query, course1Query, course2Query, course3Query, course4Query,
      course5Query, course6Query, course7Query, course8Query, course9Query
    ].slice(0, enrolledCourses.length);
  }, [
    course0Query, course1Query, course2Query, course3Query, course4Query,
    course5Query, course6Query, course7Query, course8Query, course9Query,
    enrolledCourses.length
  ]);

  // Combine assignments from all courses
  useEffect(() => {
    if (enrolledCourses.length === 0) {
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
      
      enrolledCourses.forEach((course, index) => {
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
  }, [enrolledCourses, courseQueries]);
  
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
            ) : hasAssignmentError ? (
              <Card className="p-8 text-center bg-slate-800 border-slate-700">
                <div className="flex justify-center mb-4">
                  <AlertCircle className="h-8 w-8 text-red-500" />
                </div>
                <p className="text-slate-400">Error loading assignments. Please try again.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={refetchAllAssignments}
                >
                  Retry
                </Button>
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
            ) : hasAssignmentError ? (
              <Card className="p-8 text-center bg-slate-800 border-slate-700">
                <div className="flex justify-center mb-4">
                  <AlertCircle className="h-8 w-8 text-red-500" />
                </div>
                <p className="text-slate-400">Error loading assignments. Please try again.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={refetchAllAssignments}
                >
                  Retry
                </Button>
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
            ) : hasAssignmentError ? (
              <Card className="p-8 text-center bg-slate-800 border-slate-700">
                <div className="flex justify-center mb-4">
                  <AlertCircle className="h-8 w-8 text-red-500" />
                </div>
                <p className="text-slate-400">Error loading assignments. Please try again.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={refetchAllAssignments}
                >
                  Retry
                </Button>
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
  assignments: AssignmentWithCourse[], 
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
      