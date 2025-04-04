"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  PlusCircle,
  Search,
  Filter,
  FileText,
  Clock,
  CalendarClock,
  ClipboardCheck,
  CheckCircle2,
  Ban,
  Edit,
  Eye,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";

import Header from "@/components/shared/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
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