"use client";

import React, { useState } from "react";
import Header from "@/components/shared/Header";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  MoreHorizontal,
  PlusCircle,
  Edit,
  Trash2,
  Eye,
  BarChart2,
  ClipboardList,
  TimerOff,
  Clock,
  FileText,
  Copy,
  FileSymlink,
} from "lucide-react";

interface Course {
  id: string;
  name: string;
}

interface AssessmentType {
  id: string;
  name: string;
}

interface Assessment {
  id: string;
  title: string;
  courseId: string;
  type: string;
  description: string;
  timeLimit: number;
  questions: number;
  availableFrom: Date | null;
  availableUntil: Date | null;
  status: "active" | "closed" | "draft";
  completed: number;
  totalStudents: number;
  totalPoints: number;
  avgScore: number;
  dateCreated: Date;
}

type TabStatus = "active" | "closed" | "draft" | "all";

const COURSES: Course[] = [
  { id: "course-1", name: "JavaScript Fundamentals" },
  { id: "course-2", name: "React Development" },
  { id: "course-3", name: "Python Basics" },
  { id: "course-4", name: "CSS Mastery" },
];

const ASSESSMENT_TYPES: AssessmentType[] = [
  { id: "quiz", name: "Quiz" },
  { id: "test", name: "Test" },
  { id: "exam", name: "Exam" },
  { id: "assignment", name: "Assignment" },
];

const ASSESSMENTS: Assessment[] = [
  {
    id: "assessment-1",
    title: "JavaScript Control Flow Quiz",
    courseId: "course-1",
    type: "quiz",
    description: "A quiz covering loops, conditionals, and basic control flow in JavaScript",
    timeLimit: 20,
    questions: 10,
    availableFrom: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    availableUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    status: "active",
    completed: 15,
    totalStudents: 24,
    totalPoints: 30,
    avgScore: 82,
    dateCreated: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
  },
  {
    id: "assessment-2",
    title: "React Components Midterm",
    courseId: "course-2",
    type: "test",
    description: "A midterm test covering React component architecture and state management",
    timeLimit: 60,
    questions: 25,
    availableFrom: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    availableUntil: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    status: "active",
    completed: 12,
    totalStudents: 20,
    totalPoints: 100,
    avgScore: 75,
    dateCreated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: "assessment-3",
    title: "Python Data Structures",
    courseId: "course-3",
    type: "quiz",
    description: "A short quiz on Python lists, dictionaries, and tuples",
    timeLimit: 15,
    questions: 8,
    availableFrom: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    availableUntil: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    status: "closed",
    completed: 19,
    totalStudents: 22,
    totalPoints: 24,
    avgScore: 90,
    dateCreated: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
  },
  {
    id: "assessment-4",
    title: "Final CSS Exam",
    courseId: "course-4",
    type: "exam",
    description: "Final comprehensive examination on all CSS concepts covered in the course",
    timeLimit: 120,
    questions: 40,
    availableFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    availableUntil: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
    status: "closed",
    completed: 18,
    totalStudents: 19,
    totalPoints: 200,
    avgScore: 78,
    dateCreated: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
  },
  {
    id: "assessment-5",
    title: "JavaScript ES6 Features Quiz",
    courseId: "course-1",
    type: "quiz",
    description: "Draft quiz covering modern JavaScript features and syntax",
    timeLimit: 30,
    questions: 15,
    availableFrom: null,
    availableUntil: null,
    status: "draft",
    completed: 0,
    totalStudents: 24,
    totalPoints: 45,
    avgScore: 0,
    dateCreated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
];

const TeacherAssessments = () => {
  const [assessments, setAssessments] = useState<Assessment[]>(ASSESSMENTS);
  const [courses, setCourses] = useState<Course[]>(COURSES);
  const [assessmentTypes] = useState<AssessmentType[]>(ASSESSMENT_TYPES);
  const [currentTab, setCurrentTab] = useState<TabStatus>("active");
  const [searchTerm, setSearchTerm] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showNewAssessmentDialog, setShowNewAssessmentDialog] = useState(false);
  
  // New assessment form state
  const [newAssessmentTitle, setNewAssessmentTitle] = useState("");
  const [newAssessmentCourse, setNewAssessmentCourse] = useState("");
  const [newAssessmentType, setNewAssessmentType] = useState("");
  const [newAssessmentDesc, setNewAssessmentDesc] = useState("");
  const [newAssessmentTimeLimit, setNewAssessmentTimeLimit] = useState(30);
  const [newAssessmentQuestions, setNewAssessmentQuestions] = useState(10);
  const [newAssessmentPoints, setNewAssessmentPoints] = useState(30);
  const [newAssessmentSaveAsDraft, setNewAssessmentSaveAsDraft] = useState(false);
  
  const filteredAssessments = assessments.filter(assessment => {
    // Filter by search term
    const matchesSearch = assessment.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by course
    const matchesCourse = courseFilter === "all" || assessment.courseId === courseFilter;
    
    // Filter by type
    const matchesType = typeFilter === "all" || assessment.type === typeFilter;
    
    // Filter by tab (status)
    const matchesTab = 
      (currentTab === "active" && assessment.status === "active") ||
      (currentTab === "closed" && assessment.status === "closed") ||
      (currentTab === "draft" && assessment.status === "draft") ||
      (currentTab === "all");
    
    return matchesSearch && matchesCourse && matchesType && matchesTab;
  });
  
  const handleCreateAssessment = () => {
    const totalStudents = courses.find(c => c.id === newAssessmentCourse)?.id === "course-1" ? 24 : 
                          courses.find(c => c.id === newAssessmentCourse)?.id === "course-2" ? 20 :
                          courses.find(c => c.id === newAssessmentCourse)?.id === "course-3" ? 22 : 19;
    
    const newAssessment: Assessment = {
      id: `assessment-${assessments.length + 1}`,
      title: newAssessmentTitle,
      courseId: newAssessmentCourse,
      type: newAssessmentType,
      description: newAssessmentDesc,
      timeLimit: newAssessmentTimeLimit,
      questions: newAssessmentQuestions,
      availableFrom: newAssessmentSaveAsDraft ? null : new Date(),
      availableUntil: newAssessmentSaveAsDraft ? null : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      status: newAssessmentSaveAsDraft ? "draft" : "active",
      completed: 0,
      totalStudents,
      totalPoints: newAssessmentPoints,
      avgScore: 0,
      dateCreated: new Date(),
    };
    
    setAssessments([...assessments, newAssessment]);
    resetNewAssessmentForm();
    setShowNewAssessmentDialog(false);
  };
  
  const resetNewAssessmentForm = () => {
    setNewAssessmentTitle("");
    setNewAssessmentCourse("");
    setNewAssessmentType("");
    setNewAssessmentDesc("");
    setNewAssessmentTimeLimit(30);
    setNewAssessmentQuestions(10);
    setNewAssessmentPoints(30);
    setNewAssessmentSaveAsDraft(false);
  };
  
  const getCourseNameById = (courseId: string): string => {
    const course = courses.find(c => c.id === courseId);
    return course ? course.name : "Unknown Course";
  };
  
  const getTypeNameById = (typeId: string): string => {
    const type = assessmentTypes.find(t => t.id === typeId);
    return type ? type.name : "Unknown Type";
  };
  
  const getStatusColor = (status: string): string => {
    switch(status) {
      case "active": return "bg-green-600";
      case "closed": return "bg-gray-500";
      case "draft": return "bg-amber-600";
      default: return "bg-gray-500";
    }
  };
  
  const getTypeColor = (type: string): string => {
    switch(type) {
      case "quiz": return "bg-blue-600";
      case "test": return "bg-purple-600";
      case "exam": return "bg-red-600";
      case "assignment": return "bg-cyan-600";
      default: return "bg-blue-600";
    }
  };
  
  return (
    <div className="space-y-6">
      <Header
        title="Assessments"
        subtitle="Create and manage quizzes, tests, and exams"
        rightElement={
          <Button onClick={() => setShowNewAssessmentDialog(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Assessment
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
                placeholder="Search assessments..."
                className="pl-10 bg-customgreys-primarybg border-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-4 flex-col sm:flex-row">
              <Select value={courseFilter} onValueChange={setCourseFilter}>
                <SelectTrigger className="w-full sm:w-[200px] bg-customgreys-primarybg border-none">
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
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-[200px] bg-customgreys-primarybg border-none">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent className="bg-customgreys-primarybg border-gray-700">
                  <SelectItem value="all">All Types</SelectItem>
                  {assessmentTypes.map(type => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Assessments List */}
      <Tabs 
        value={currentTab} 
        onValueChange={(value) => setCurrentTab(value as TabStatus)} 
        className="w-full"
      >
        <TabsList className="grid grid-cols-4 w-[500px] bg-customgreys-secondarybg mb-6">
          <TabsTrigger 
            value="active" 
            className="data-[state=active]:bg-primary-700"
          >
            Active
          </TabsTrigger>
          <TabsTrigger 
            value="closed" 
            className="data-[state=active]:bg-primary-700"
          >
            Closed
          </TabsTrigger>
          <TabsTrigger 
            value="draft" 
            className="data-[state=active]:bg-primary-700"
          >
            Drafts
          </TabsTrigger>
          <TabsTrigger 
            value="all" 
            className="data-[state=active]:bg-primary-700"
          >
            All
          </TabsTrigger>
        </TabsList>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssessments.map(assessment => (
            <Card 
              key={assessment.id} 
              className="bg-customgreys-secondarybg border-none shadow-md hover:bg-customgreys-darkerGrey transition cursor-pointer"
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex gap-2">
                    <Badge className={getStatusColor(assessment.status)}>
                      {assessment.status === "active" 
                        ? "Active" 
                        : assessment.status === "closed" 
                        ? "Closed"
                        : "Draft"
                      }
                    </Badge>
                    <Badge className={getTypeColor(assessment.type)}>
                      {getTypeNameById(assessment.type)}
                    </Badge>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-customgreys-primarybg border-gray-700">
                      <DropdownMenuItem className="cursor-pointer flex items-center">
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer flex items-center">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Assessment
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer flex items-center">
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer flex items-center">
                        <FileSymlink className="mr-2 h-4 w-4" />
                        Create Similar
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer flex items-center">
                        <BarChart2 className="mr-2 h-4 w-4" />
                        View Analytics
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer flex items-center text-red-500">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardTitle className="text-lg mt-2">{assessment.title}</CardTitle>
                <CardDescription className="text-sm">
                  {getCourseNameById(assessment.courseId)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-400 line-clamp-2 mb-4">
                  {assessment.description}
                </p>
                <div className="flex flex-wrap gap-3 text-sm text-gray-400">
                  <div className="flex items-center">
                    <Clock className="mr-1 h-4 w-4 text-amber-500" />
                    {assessment.timeLimit} min
                  </div>
                  <div className="flex items-center">
                    <ClipboardList className="mr-1 h-4 w-4 text-blue-500" />
                    {assessment.questions} questions
                  </div>
                  <div className="flex items-center">
                    <FileText className="mr-1 h-4 w-4 text-primary-500" />
                    {assessment.totalPoints} points
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t border-gray-700 pt-4 flex-col">
                <div className="w-full flex justify-between items-center mb-2">
                  <div className="text-sm">
                    {assessment.completed} / {assessment.totalStudents} completed
                  </div>
                  {assessment.status !== "draft" && assessment.avgScore > 0 && (
                    <div className="text-sm">
                      Avg. Score: {assessment.avgScore}%
                    </div>
                  )}
                </div>
                <div className="w-full flex justify-between items-center">
                  {assessment.status === "active" && assessment.availableUntil && (
                    <div className="text-xs text-gray-400">
                      Available until {format(new Date(assessment.availableUntil), "MMM d, yyyy")}
                    </div>
                  )}
                  <div className="flex gap-2 ml-auto">
                    {assessment.status === "draft" ? (
                      <Button size="sm" className="bg-primary-700 hover:bg-primary-600">
                        Publish
                      </Button>
                    ) : assessment.status === "active" ? (
                      <Button size="sm" variant="outline" className="border-gray-700">
                        <TimerOff className="mr-1 h-3 w-3" />
                        Close
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" className="border-gray-700">
                        Reopen
                      </Button>
                    )}
                  </div>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </Tabs>
      
      {/* New Assessment Dialog */}
      <Dialog open={showNewAssessmentDialog} onOpenChange={setShowNewAssessmentDialog}>
        <DialogContent className="bg-customgreys-primarybg border-none max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Assessment</DialogTitle>
            <DialogDescription>
              Create a new quiz, test, or exam for your students.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Assessment Title
              </label>
              <Input
                id="title"
                placeholder="Enter assessment title"
                className="bg-customgreys-secondarybg border-gray-700"
                value={newAssessmentTitle}
                onChange={(e) => setNewAssessmentTitle(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="course" className="text-sm font-medium">
                  Course
                </label>
                <Select 
                  value={newAssessmentCourse} 
                  onValueChange={setNewAssessmentCourse}
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
                <label htmlFor="type" className="text-sm font-medium">
                  Assessment Type
                </label>
                <Select 
                  value={newAssessmentType} 
                  onValueChange={setNewAssessmentType}
                >
                  <SelectTrigger 
                    id="type" 
                    className="bg-customgreys-secondarybg border-gray-700 w-full"
                  >
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-customgreys-primarybg border-gray-700">
                    {assessmentTypes.map(type => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="description"
                placeholder="Enter assessment description"
                className="bg-customgreys-secondarybg border-gray-700 min-h-[80px]"
                value={newAssessmentDesc}
                onChange={(e) => setNewAssessmentDesc(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="timeLimit" className="text-sm font-medium">
                  Time Limit (minutes)
                </label>
                <Input
                  id="timeLimit"
                  type="number"
                  className="bg-customgreys-secondarybg border-gray-700"
                  value={newAssessmentTimeLimit}
                  onChange={(e) => setNewAssessmentTimeLimit(Number(e.target.value))}
                  min={1}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="questions" className="text-sm font-medium">
                  Number of Questions
                </label>
                <Input
                  id="questions"
                  type="number"
                  className="bg-customgreys-secondarybg border-gray-700"
                  value={newAssessmentQuestions}
                  onChange={(e) => setNewAssessmentQuestions(Number(e.target.value))}
                  min={1}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="points" className="text-sm font-medium">
                  Total Points
                </label>
                <Input
                  id="points"
                  type="number"
                  className="bg-customgreys-secondarybg border-gray-700"
                  value={newAssessmentPoints}
                  onChange={(e) => setNewAssessmentPoints(Number(e.target.value))}
                  min={1}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="save-as-draft"
                checked={newAssessmentSaveAsDraft}
                onCheckedChange={(checked) => setNewAssessmentSaveAsDraft(checked === true)}
              />
              <label
                htmlFor="save-as-draft"
                className="text-sm font-medium leading-none cursor-pointer"
              >
                Save as draft (publish later)
              </label>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowNewAssessmentDialog(false)}
              className="border-gray-700"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateAssessment}
              disabled={!newAssessmentTitle || !newAssessmentCourse || !newAssessmentType}
              className="bg-primary-700 hover:bg-primary-600"
            >
              {newAssessmentSaveAsDraft ? "Save Draft" : "Create Assessment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeacherAssessments; 