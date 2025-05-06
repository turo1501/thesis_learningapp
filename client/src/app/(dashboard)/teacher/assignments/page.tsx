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
=======
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

import { useUser } from "@clerk/nextjs";
import { 
  useGetTeacherAssignmentsQuery,
  useCreateAssignmentMutation, 
  useUpdateAssignmentMutation,
  useDeleteAssignmentMutation,
  Assignment
} from "@/state/api/assignmentApi";

// Course type definition
interface Course {
  id: string;
  name: string;
}

// Temporary course data until we have API integration
const COURSES: Course[] = [
  { id: "course-1", name: "Web Development Fundamentals" },
  { id: "course-2", name: "React Masterclass" },
  { id: "course-3", name: "Python Programming Essentials" },
  { id: "course-4", name: "UI/UX Design Principles" },
];

type AssignmentStatus = "active" | "closed" | "draft";
type TabStatus = "active" | "closed" | "draft" | "all";

const TeacherAssignments = () => {
  const router = useRouter();
  const { user } = useUser();
  const [currentTab, setCurrentTab] = useState<TabStatus>("active");
  const [searchTerm, setSearchTerm] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [showNewAssignmentDialog, setShowNewAssignmentDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [date, setDate] = useState<Date>(new Date());
  const [courses, setCourses] = useState<Course[]>(COURSES);
  
  // New assignment form state
  const [newAssignmentTitle, setNewAssignmentTitle] = useState("");
  const [newAssignmentCourse, setNewAssignmentCourse] = useState("");
  const [newAssignmentDesc, setNewAssignmentDesc] = useState("");
  const [newAssignmentPoints, setNewAssignmentPoints] = useState(100);
  const [newAssignmentDeadline, setNewAssignmentDeadline] = useState<Date>(new Date());
  const [newAssignmentSaveAsDraft, setNewAssignmentSaveAsDraft] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  
  // Redux API hooks
  const teacherId = user?.id || "";
  const { 
    data: assignments = [], 
    isLoading, 
    isError,
    refetch 
  } = useGetTeacherAssignmentsQuery(teacherId, { skip: !teacherId });
  
  const [createAssignment, { isLoading: isCreating }] = useCreateAssignmentMutation();
  const [updateAssignment, { isLoading: isUpdating }] = useUpdateAssignmentMutation();
  const [deleteAssignment, { isLoading: isDeleting }] = useDeleteAssignmentMutation();
  
  useEffect(() => {
    // In a real app, we would fetch courses from the API here
    // Example:
    // const fetchCourses = async () => {
    //   const response = await fetch('/api/teacher/courses');
    //   const data = await response.json();
    //   setCourses(data);
    // };
    // fetchCourses();
  }, []);
  
  const filteredAssignments = assignments.filter((assignment: Assignment) => {
    // Filter by search term
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by course
    const matchesCourse = courseFilter === "all" || assignment.courseId === courseFilter;
    
    // Filter by tab (status)
    const matchesTab = 
      (currentTab === "active" && assignment.status === "active") ||
      (currentTab === "closed" && assignment.status === "closed") ||
      (currentTab === "draft" && assignment.status === "draft") ||
      (currentTab === "all");
    
    return matchesSearch && matchesCourse && matchesTab;
  });
  
  const handleCreateAssignment = async () => {
    if (!newAssignmentTitle || !newAssignmentCourse || !newAssignmentDesc) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    try {
      await createAssignment({
        title: newAssignmentTitle,
        description: newAssignmentDesc,
        courseId: newAssignmentCourse,
        deadline: newAssignmentSaveAsDraft ? null : newAssignmentDeadline.toISOString(),
        points: newAssignmentPoints,
        status: newAssignmentSaveAsDraft ? "draft" : "active",
        attachments: [],
      }).unwrap();
      
      toast.success("Assignment created successfully");
      resetNewAssignmentForm();
      setShowNewAssignmentDialog(false);
      refetch();
    } catch (error) {
      toast.error("Failed to create assignment");
      console.error(error);
    }
  };
  
  const handleUpdateAssignment = async (assignment: Assignment, newStatus: AssignmentStatus) => {
    try {
      await updateAssignment({
        id: assignment.id,
        data: { status: newStatus },
      }).unwrap();
      
      toast.success(`Assignment ${newStatus === 'active' ? 'published' : newStatus === 'closed' ? 'closed' : 'reopened'} successfully`);
      refetch();
    } catch (error) {
      toast.error(`Failed to update assignment status`);
      console.error(error);
    }
  };
  
  const handleDeleteAssignment = async () => {
    if (!selectedAssignment) return;
    
    try {
      await deleteAssignment(selectedAssignment.id).unwrap();
      toast.success("Assignment deleted successfully");
      setShowDeleteDialog(false);
      setSelectedAssignment(null);
      refetch();
    } catch (error) {
      toast.error("Failed to delete assignment");
      console.error(error);
    }
  };
  
  const resetNewAssignmentForm = () => {
    setNewAssignmentTitle("");
    setNewAssignmentCourse("");
    setNewAssignmentDesc("");
    setNewAssignmentPoints(100);
    setNewAssignmentDeadline(new Date());
    setNewAssignmentSaveAsDraft(false);
  };
  
  const getCourseNameById = (courseId: string): string => {
    const course = courses.find(c => c.id === courseId);
    return course ? course.name : "Unknown Course";
  };
  
  const handleAssignmentAction = (assignment: Assignment, action: string) => {
    setSelectedAssignment(assignment);
    
    switch (action) {
      case 'view':
        router.push(`/teacher/assignments/${assignment.id}`);
        break;
      case 'edit':
        router.push(`/teacher/assignments/${assignment.id}?edit=true`);
        break;
      case 'publish':
        handleUpdateAssignment(assignment, 'active');
        break;
      case 'close':
        handleUpdateAssignment(assignment, 'closed');
        break;
      case 'reopen':
        handleUpdateAssignment(assignment, 'active');
        break;
      case 'delete':
        setShowDeleteDialog(true);
        break;
      default:
        break;
    }
  };
  
  return (
    <div className="space-y-6">
      <Header
        title="Assignments"
        subtitle="Create and manage assignments for your courses"
        rightElement={
          <Button onClick={() => setShowNewAssignmentDialog(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Assignment
          </Button>
        }
      />
      
      {/* Filters and Search */}
      <Card className="bg-customgreys-secondarybg border-none shadow-md">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-customgreys-dirtyGrey" />
              <Input
                placeholder="Search assignments..."
                className="pl-10 bg-customgreys-primarybg border-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-4">
              <Select value={courseFilter} onValueChange={setCourseFilter}>
                <SelectTrigger className="w-[240px] bg-customgreys-primarybg border-none">
                  <SelectValue placeholder="Filter by course" />
                </SelectTrigger>
                <SelectContent className="bg-customgreys-primarybg border-gray-700">
                  <SelectItem value="all">All Courses</SelectItem>
                  {courses.map(course => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Tabs and Assignment Cards */}
      <Tabs defaultValue="active" value={currentTab} onValueChange={(value: string) => setCurrentTab(value as TabStatus)}>
        <TabsList className="bg-customgreys-secondarybg border-b border-gray-700 rounded-none p-0 h-12">
          <TabsTrigger
            value="active"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary-500 data-[state=active]:bg-transparent px-6"
          >
            Active
          </TabsTrigger>
          <TabsTrigger
            value="closed"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary-500 data-[state=active]:bg-transparent px-6"
          >
            Closed
          </TabsTrigger>
          <TabsTrigger
            value="draft"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary-500 data-[state=active]:bg-transparent px-6"
          >
            Drafts
          </TabsTrigger>
          <TabsTrigger
            value="all"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary-500 data-[state=active]:bg-transparent px-6"
          >
            All
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value={currentTab} className="pt-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="bg-customgreys-secondarybg border-none shadow-md">
                  <CardHeader className="pb-2">
                    <Skeleton className="h-6 w-32 bg-customgreys-primarybg" />
                    <Skeleton className="h-4 w-48 mt-2 bg-customgreys-primarybg" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-16 w-full bg-customgreys-primarybg" />
                    <div className="flex justify-between mt-4">
                      <Skeleton className="h-4 w-16 bg-customgreys-primarybg" />
                      <Skeleton className="h-4 w-24 bg-customgreys-primarybg" />
                    </div>
                  </CardContent>
                  <CardFooter className="border-t border-gray-700 pt-4">
                    <div className="w-full flex justify-between">
                      <Skeleton className="h-4 w-32 bg-customgreys-primarybg" />
                      <Skeleton className="h-8 w-20 bg-customgreys-primarybg" />
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : isError ? (
            <div className="text-center py-8">
              <p className="text-red-400">Error loading assignments. Please try again later.</p>
              <Button 
                variant="outline" 
                onClick={() => refetch()} 
                className="mt-4"
              >
                Retry
              </Button>
            </div>
          ) : filteredAssignments.length === 0 ? (
            <div className="text-center py-10">
              <ClipboardCheck className="h-12 w-12 mx-auto text-gray-500 mb-4" />
              <h3 className="text-lg font-medium mb-2">No assignments found</h3>
              <p className="text-gray-400 mb-6">
                {searchTerm || courseFilter !== "all" 
                  ? "Try adjusting your filters to see more results" 
                  : `You don't have any ${currentTab} assignments yet`}
              </p>
              <Button onClick={() => setShowNewAssignmentDialog(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create New Assignment
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAssignments.map((assignment: Assignment) => (
                <Card 
                  key={assignment.id} 
                  className="bg-customgreys-secondarybg border-none shadow-md hover:bg-customgreys-darkerGrey transition overflow-hidden"
                >
                  <CardHeader className="pb-2 relative">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <Badge 
                          className={
                            assignment.status === "active" 
                              ? "bg-green-600" 
                              : assignment.status === "closed" 
                              ? "bg-gray-500"
                              : "bg-amber-600"
                          }
                        >
                          {assignment.status === "active" 
                            ? "Active" 
                            : assignment.status === "closed" 
                            ? "Closed"
                            : "Draft"
                          }
                        </Badge>
                        <CardTitle className="text-lg mt-2 pr-8">
                          {assignment.title}
                        </CardTitle>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 absolute top-4 right-4">
                            <Filter className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-customgreys-primarybg border-gray-700">
                          <DropdownMenuItem onClick={() => handleAssignmentAction(assignment, 'view')}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAssignmentAction(assignment, 'edit')}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          {assignment.status === "draft" ? (
                            <DropdownMenuItem onClick={() => handleAssignmentAction(assignment, 'publish')}>
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Publish
                            </DropdownMenuItem>
                          ) : assignment.status === "active" ? (
                            <DropdownMenuItem onClick={() => handleAssignmentAction(assignment, 'close')}>
                              <Ban className="mr-2 h-4 w-4" />
                              Close
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleAssignmentAction(assignment, 'reopen')}>
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Reopen
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={() => handleAssignmentAction(assignment, 'delete')}
                            className="text-red-500"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <p className="text-sm text-gray-400">{getCourseNameById(assignment.courseId)}</p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-300 line-clamp-2 mb-4">
                      {assignment.description}
                    </p>
                    <div className="flex justify-between text-sm text-gray-400">
                      <div className="flex items-center">
                        <FileText className="mr-2 h-4 w-4 text-primary-500" />
                        {assignment.points} points
                      </div>
                      {assignment.deadline && (
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4 text-amber-500" />
                          Due {format(new Date(assignment.deadline), "MMM d")}
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="border-t border-gray-700 pt-4">
                    <div className="w-full flex justify-between items-center">
                      <div className="text-sm">
                        {assignment.submissionCount || 0} / {assignment.totalStudents || 0} submissions
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => router.push(`/teacher/assignments/${assignment.id}`)}
                      >
                        View
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* New Assignment Dialog */}
      <Dialog open={showNewAssignmentDialog} onOpenChange={setShowNewAssignmentDialog}>
        <DialogContent className="bg-customgreys-primarybg border-none max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Assignment</DialogTitle>
            <DialogDescription>
              Create a new assignment for your students. Fill out the details below.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Assignment Title<span className="text-red-500">*</span>
              </label>
              <Input
                id="title"
                placeholder="Enter assignment title"
                className="bg-customgreys-secondarybg border-gray-700"
                value={newAssignmentTitle}
                onChange={(e) => setNewAssignmentTitle(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="course" className="text-sm font-medium">
                Course<span className="text-red-500">*</span>
              </label>
              <Select 
                value={newAssignmentCourse} 
                onValueChange={setNewAssignmentCourse}
              >
                <SelectTrigger 
                  id="course" 
                  className="bg-customgreys-secondarybg border-gray-700 w-full"
                >
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent className="bg-customgreys-primarybg border-gray-700">
                  {courses.map(course => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description<span className="text-red-500">*</span>
              </label>
              <Textarea
                id="description"
                placeholder="Enter assignment description"
                className="bg-customgreys-secondarybg border-gray-700 min-h-[100px]"
                value={newAssignmentDesc}
                onChange={(e) => setNewAssignmentDesc(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="points" className="text-sm font-medium">
                  Points<span className="text-red-500">*</span>
                </label>
                <Input
                  id="points"
                  type="number"
                  className="bg-customgreys-secondarybg border-gray-700"
                  value={newAssignmentPoints}
                  onChange={(e) => setNewAssignmentPoints(Number(e.target.value))}
                  min={0}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Deadline
                </label>
                <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal bg-customgreys-secondarybg border-gray-700 ${
                        newAssignmentSaveAsDraft ? 'opacity-50' : ''
                      }`}
                      disabled={newAssignmentSaveAsDraft}
                    >
                      <CalendarClock className="mr-2 h-4 w-4" />
                      {newAssignmentSaveAsDraft
                        ? "No deadline for drafts"
                        : format(newAssignmentDeadline, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-customgreys-secondarybg border-gray-700">
                    <Calendar
                      mode="single"
                      selected={newAssignmentDeadline}
                      onSelect={(date) => {
                        if (date) {
                          setNewAssignmentDeadline(date);
                          setIsDatePickerOpen(false);
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="saveAsDraft"
                checked={newAssignmentSaveAsDraft}
                onCheckedChange={(checked) => 
                  setNewAssignmentSaveAsDraft(checked === true)}
              />
              <label
                htmlFor="saveAsDraft"
                className="text-sm font-medium leading-none cursor-pointer"
              >
                Save as draft
              </label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              resetNewAssignmentForm();
              setShowNewAssignmentDialog(false);
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateAssignment} 
              disabled={isCreating}
            >
              {isCreating ? "Creating..." : "Create Assignment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Assignment Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-customgreys-primarybg border-none">
          <DialogHeader>
            <DialogTitle>Delete Assignment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this assignment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowDeleteDialog(false);
              setSelectedAssignment(null);
            }}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteAssignment}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeacherAssignments; 
