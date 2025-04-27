"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  Calendar,
  FileText,
  CheckCircle,
  Clock,
  ArrowUp,
  ArrowDown,
  X,
  ExternalLink,
  Download,
  Eye,
} from "lucide-react";
import { format } from "date-fns";

import Header from "@/components/shared/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@clerk/nextjs";
import { Assignment, Submission } from "@/state/api/assignmentApi";

// Define types for better typescript support
interface Course {
  id: string;
  name: string;
}

interface Student {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface SubmissionWithDetails extends Submission {
  assignment: Assignment;
  student: Student;
}

// Sample data for UI development
const SAMPLE_SUBMISSIONS: SubmissionWithDetails[] = [
  {
    id: "sub-1",
    assignmentId: "assign-1",
    studentId: "student-1",
    status: "submitted",
    submittedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    assignment: {
      id: "assign-1",
      title: "JavaScript Fundamentals Quiz",
      description: "Quiz covering basic JavaScript concepts",
      courseId: "course-1",
      deadline: new Date(Date.now() + 3600000 * 48).toISOString(),
      points: 100,
      status: "active",
      createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 72).toISOString(),
      submissionCount: 18,
      totalStudents: 25,
      attachments: []
    },
    student: {
      id: "student-1",
      name: "Alex Johnson",
      email: "alex@example.com",
      avatar: ""
    },
    attachments: []
  },
  {
    id: "sub-2",
    assignmentId: "assign-2",
    studentId: "student-2",
    status: "graded",
    submittedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    grade: 85,
    feedback: "Good work, but could improve code organization.",
    assignment: {
      id: "assign-2",
      title: "React Components Project",
      description: "Build a set of reusable React components",
      courseId: "course-2",
      deadline: new Date(Date.now() - 3600000 * 24).toISOString(),
      points: 150,
      status: "active",
      createdAt: new Date(Date.now() - 3600000 * 120).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 120).toISOString(),
      submissionCount: 22,
      totalStudents: 25,
      attachments: []
    },
    student: {
      id: "student-2",
      name: "Jamie Smith",
      email: "jamie@example.com",
      avatar: ""
    },
    attachments: [
      {
        id: "attach-1",
        name: "project.zip",
        url: "#",
        type: "application/zip"
      }
    ]
  },
  {
    id: "sub-3",
    assignmentId: "assign-1",
    studentId: "student-3",
    status: "late",
    submittedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    assignment: {
      id: "assign-1",
      title: "JavaScript Fundamentals Quiz",
      description: "Quiz covering basic JavaScript concepts",
      courseId: "course-1",
      deadline: new Date(Date.now() - 3600000 * 24).toISOString(),
      points: 100,
      status: "active",
      createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 72).toISOString(),
      submissionCount: 18,
      totalStudents: 25,
      attachments: []
    },
    student: {
      id: "student-3",
      name: "Taylor Brown",
      email: "taylor@example.com",
      avatar: ""
    },
    attachments: [
      {
        id: "attach-2",
        name: "quiz-answers.pdf",
        url: "#",
        type: "application/pdf"
      }
    ]
  }
];

const COURSES: Course[] = [
  { id: "course-1", name: "Web Development Fundamentals" },
  { id: "course-2", name: "React Masterclass" },
  { id: "course-3", name: "Python Programming Essentials" },
  { id: "course-4", name: "UI/UX Design Principles" },
];

type SortField = "date" | "student" | "assignment" | "status";
type SortOrder = "asc" | "desc";
type TabStatus = "all" | "graded" | "pending" | "late";

const TeacherSubmissions = () => {
  const router = useRouter();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [currentTab, setCurrentTab] = useState<TabStatus>("all");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  
  // In a real application, this would be fetched from the API
  const [submissions, setSubmissions] = useState<SubmissionWithDetails[]>(SAMPLE_SUBMISSIONS);
  
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };
  
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortOrder === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };
  
  const getCourseNameById = (courseId: string): string => {
    const course = COURSES.find(c => c.id === courseId);
    return course ? course.name : "Unknown Course";
  };
  
  const getStatusBadge = (status: Submission["status"]) => {
    switch (status) {
      case "submitted":
        return <Badge className="bg-blue-600">Submitted</Badge>;
      case "graded":
        return <Badge className="bg-green-600">Graded</Badge>;
      case "late":
        return <Badge className="bg-amber-600">Late</Badge>;
      case "not_submitted":
        return <Badge className="bg-gray-500">Not Submitted</Badge>;
      default:
        return <Badge className="bg-gray-500">Unknown</Badge>;
    }
  };
  
  const filteredSubmissions = submissions.filter(submission => {
    // Filter by search term
    const matchesSearch = 
      submission.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.assignment.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by course
    const matchesCourse = courseFilter === "all" || submission.assignment.courseId === courseFilter;
    
    // Filter by tab (status)
    const matchesTab = 
      (currentTab === "all") ||
      (currentTab === "graded" && submission.status === "graded") ||
      (currentTab === "pending" && submission.status === "submitted") ||
      (currentTab === "late" && submission.status === "late");
    
    return matchesSearch && matchesCourse && matchesTab;
  });
  
  // Sort submissions
  const sortedSubmissions = [...filteredSubmissions].sort((a, b) => {
    const multiplier = sortOrder === "asc" ? 1 : -1;
    
    switch (sortField) {
      case "date":
        return multiplier * (new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime());
      case "student":
        return multiplier * a.student.name.localeCompare(b.student.name);
      case "assignment":
        return multiplier * a.assignment.title.localeCompare(b.assignment.title);
      case "status":
        return multiplier * a.status.localeCompare(b.status);
      default:
        return 0;
    }
  });
  
  return (
    <div className="space-y-6">
      <Header
        title="Student Submissions"
        subtitle="Review and grade student submissions for your assignments"
      />
      
      {/* Filters and Search */}
      <Card className="bg-customgreys-secondarybg border-none shadow-md">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-customgreys-dirtyGrey" />
              <Input
                placeholder="Search by student or assignment..."
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
                  {COURSES.map(course => (
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
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-customgreys-secondarybg border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-400">Total Submissions</p>
                <h3 className="text-2xl font-bold mt-1">{submissions.length}</h3>
              </div>
              <div className="bg-primary-900/20 p-2 rounded-full">
                <FileText className="h-5 w-5 text-primary-500" />
              </div>
            </div>
            <div className="mt-4">
              <Progress value={85} className="h-2" />
              <p className="text-xs text-gray-400 mt-2">
                85% of assignments have submissions
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-customgreys-secondarybg border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-400">Graded</p>
                <h3 className="text-2xl font-bold mt-1">
                  {submissions.filter(s => s.status === "graded").length}
                </h3>
              </div>
              <div className="bg-green-900/20 p-2 rounded-full">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
            </div>
            <div className="mt-4">
              <Progress 
                value={submissions.filter(s => s.status === "graded").length / submissions.length * 100} 
                className="h-2"
                indicatorClassName="bg-green-500"
              />
              <p className="text-xs text-gray-400 mt-2">
                {Math.round(submissions.filter(s => s.status === "graded").length / submissions.length * 100)}% of submissions graded
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-customgreys-secondarybg border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-400">Pending</p>
                <h3 className="text-2xl font-bold mt-1">
                  {submissions.filter(s => s.status === "submitted").length}
                </h3>
              </div>
              <div className="bg-blue-900/20 p-2 rounded-full">
                <Clock className="h-5 w-5 text-blue-500" />
              </div>
            </div>
            <div className="mt-4">
              <Progress 
                value={submissions.filter(s => s.status === "submitted").length / submissions.length * 100} 
                className="h-2"
                indicatorClassName="bg-blue-500"
              />
              <p className="text-xs text-gray-400 mt-2">
                Pending submissions to grade
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-customgreys-secondarybg border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-400">Late</p>
                <h3 className="text-2xl font-bold mt-1">
                  {submissions.filter(s => s.status === "late").length}
                </h3>
              </div>
              <div className="bg-amber-900/20 p-2 rounded-full">
                <Calendar className="h-5 w-5 text-amber-500" />
              </div>
            </div>
            <div className="mt-4">
              <Progress 
                value={submissions.filter(s => s.status === "late").length / submissions.length * 100} 
                className="h-2"
                indicatorClassName="bg-amber-500"
              />
              <p className="text-xs text-gray-400 mt-2">
                {submissions.filter(s => s.status === "late").length} late submissions received
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs and Submissions Table */}
      <Tabs defaultValue="all" value={currentTab} onValueChange={(value: string) => setCurrentTab(value as TabStatus)}>
        <TabsList className="bg-customgreys-secondarybg border-b border-gray-700 rounded-none p-0 h-12">
          <TabsTrigger
            value="all"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary-500 data-[state=active]:bg-transparent px-6"
          >
            All Submissions
          </TabsTrigger>
          <TabsTrigger
            value="pending"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary-500 data-[state=active]:bg-transparent px-6"
          >
            Pending
          </TabsTrigger>
          <TabsTrigger
            value="graded"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary-500 data-[state=active]:bg-transparent px-6"
          >
            Graded
          </TabsTrigger>
          <TabsTrigger
            value="late"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary-500 data-[state=active]:bg-transparent px-6"
          >
            Late
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value={currentTab} className="pt-6">
          <Card className="bg-customgreys-secondarybg border-none shadow-md overflow-hidden">
            {isLoading ? (
              <div className="p-6 space-y-4">
                <Skeleton className="h-12 w-full bg-customgreys-primarybg" />
                <Skeleton className="h-12 w-full bg-customgreys-primarybg" />
                <Skeleton className="h-12 w-full bg-customgreys-primarybg" />
              </div>
            ) : sortedSubmissions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <X className="h-12 w-12 text-gray-500 mb-4" />
                <h3 className="text-lg font-medium mb-2">No submissions found</h3>
                <p className="text-gray-400 mb-6 text-center max-w-md">
                  {searchTerm || courseFilter !== "all" 
                    ? "Try adjusting your filters to see more results" 
                    : `There are no ${currentTab === "all" ? "" : currentTab} submissions available`}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700 hover:bg-transparent">
                      <TableHead 
                        className="text-gray-400 cursor-pointer"
                        onClick={() => handleSort("student")}
                      >
                        <div className="flex items-center">
                          Student {getSortIcon("student")}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="text-gray-400 cursor-pointer"
                        onClick={() => handleSort("assignment")}
                      >
                        <div className="flex items-center">
                          Assignment {getSortIcon("assignment")}
                        </div>
                      </TableHead>
                      <TableHead className="text-gray-400">Course</TableHead>
                      <TableHead 
                        className="text-gray-400 cursor-pointer"
                        onClick={() => handleSort("date")}
                      >
                        <div className="flex items-center">
                          Submitted {getSortIcon("date")}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="text-gray-400 cursor-pointer"
                        onClick={() => handleSort("status")}
                      >
                        <div className="flex items-center">
                          Status {getSortIcon("status")}
                        </div>
                      </TableHead>
                      <TableHead className="text-gray-400 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedSubmissions.map((submission) => (
                      <TableRow 
                        key={submission.id} 
                        className="border-gray-700 hover:bg-customgreys-primarybg"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              {submission.student.avatar ? (
                                <AvatarImage src={submission.student.avatar} alt={submission.student.name} />
                              ) : (
                                <AvatarFallback className="bg-primary-700">
                                  {submission.student.name.charAt(0)}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <div>
                              <p className="font-medium">{submission.student.name}</p>
                              <p className="text-sm text-gray-400">{submission.student.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{submission.assignment.title}</TableCell>
                        <TableCell>
                          {getCourseNameById(submission.assignment.courseId)}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{format(new Date(submission.submittedAt), "MMM d, yyyy")}</span>
                            <span className="text-sm text-gray-400">
                              {format(new Date(submission.submittedAt), "h:mm a")}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(submission.status)}
                          {submission.status === "graded" && submission.grade && (
                            <div className="mt-1 text-sm">
                              <span className="text-gray-400">Grade: </span>
                              <span className="font-medium">{submission.grade}/{submission.assignment.points}</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {submission.attachments.length > 0 && (
                              <Button size="sm" variant="outline">
                                <Download className="h-4 w-4" />
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              onClick={() => router.push(`/teacher/assignments/${submission.assignmentId}/submission/${submission.id}`)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TeacherSubmissions; 