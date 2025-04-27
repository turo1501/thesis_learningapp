"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  ArrowLeft,
  CalendarDays,
  Clock,
  FileText,
  CheckCircle,
  X,
  Edit2,
  Eye,
  Download,
  MoreVertical,
  Trash2,
  Users,
  Link as LinkIcon,
  Pencil,
  Shield,
  MoreHorizontal,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";

import {
  useGetAssignmentByIdQuery,
  useUpdateAssignmentMutation,
  useGetAssignmentSubmissionsQuery,
  useGradeSubmissionMutation,
  Assignment,
  Submission,
  Attachment,
} from "@/state/api/assignmentApi";

// Status Badges
const StatusBadge = ({ status }: { status: string }) => {
  const getStatusBadgeProps = () => {
    switch (status) {
      case "active":
        return { variant: "default", label: "Active", className: "bg-green-600" };
      case "closed":
        return { variant: "secondary", label: "Closed", className: "bg-gray-600" };
      case "draft":
        return { variant: "outline", label: "Draft", className: "bg-amber-600" };
      default:
        return { variant: "secondary", label: status, className: "" };
    }
  };

  const { label, className } = getStatusBadgeProps();

  return <Badge className={className}>{label}</Badge>;
};

// Submission Status Badge
const SubmissionStatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case "submitted":
      return <Badge className="bg-green-600">Submitted</Badge>;
    case "late":
      return <Badge className="bg-amber-600">Late</Badge>;
    case "graded":
      return <Badge className="bg-blue-600">Graded</Badge>;
    case "not_submitted":
      return <Badge variant="outline" className="text-gray-400">Not Submitted</Badge>;
    default:
      return null;
  }
};

// Form schema for grading
const gradeFormSchema = z.object({
  grade: z.number().min(0, "Grade must be positive"),
  feedback: z.string().optional(),
});

// Main component
const AssignmentDetail = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const assignmentId = params.id as string;
  const isEditMode = searchParams.get("edit") === "true";

  const [activeTab, setActiveTab] = useState("submissions");
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [isFormChanged, setIsFormChanged] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPoints, setEditPoints] = useState(0);
  const [editStatus, setEditStatus] = useState<"active" | "closed" | "draft">("active");

  // Fetch assignment data
  const {
    data: assignment,
    isLoading,
    isError,
    refetch: refetchAssignment,
  } = useGetAssignmentByIdQuery(assignmentId);

  // Fetch submissions
  const {
    data: submissionsData = [],
    isLoading: isLoadingSubmissions,
    refetch: refetchSubmissions,
  } = useGetAssignmentSubmissionsQuery(assignmentId);

  // Mutations
  const [updateAssignment, { isLoading: isUpdating }] = useUpdateAssignmentMutation();
  const [updateGrade, { isLoading: isGrading }] = useGradeSubmissionMutation();

  // Form for grading
  const gradeForm = useForm<z.infer<typeof gradeFormSchema>>({
    resolver: zodResolver(gradeFormSchema),
    defaultValues: {
      grade: 0,
      feedback: "",
    },
  });

  useEffect(() => {
    if (assignment) {
      setEditTitle(assignment.title);
      setEditDescription(assignment.description);
      setEditPoints(assignment.points);
      setEditStatus(assignment.status);
    }
  }, [assignment]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError || !assignment) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <h2 className="text-xl font-semibold mb-2">Assignment Not Found</h2>
        <p className="text-gray-400 mb-6">The assignment you are looking for doesn't exist or you don't have access to it.</p>
        <Button onClick={() => router.push("/teacher/assignments")}>
          Back to Assignments
        </Button>
      </div>
    );
  }

  const submissions = submissionsData || [];
  const submissionRate = assignment.totalStudents 
    ? Math.round((submissions.length / assignment.totalStudents) * 100) 
    : 0;

  const handleStatusChange = async (newStatus: "active" | "closed" | "draft") => {
    try {
      await updateAssignment({
        id: assignmentId,
        data: { status: newStatus },
      }).unwrap();
      
      toast.success(`Assignment ${newStatus === 'active' ? 'activated' : newStatus === 'closed' ? 'closed' : 'saved as draft'}`);
      refetchAssignment();
    } catch (error) {
      toast.error("Failed to update assignment status");
    }
  };

  const handleSaveEdit = async () => {
    try {
      await updateAssignment({
        id: assignmentId,
        data: {
          title: editTitle,
          description: editDescription,
          points: editPoints,
          status: editStatus,
        },
      }).unwrap();
      
      toast.success("Assignment updated successfully");
      router.push(`/teacher/assignments/${assignmentId}`);
    } catch (error) {
      toast.error("Failed to update assignment");
    }
  };

  const openGradeModal = (submission: Submission) => {
    setSelectedSubmission(submission);
    gradeForm.reset({
      grade: submission.grade || 0,
      feedback: submission.feedback || "",
    });
    setGradeDialogOpen(true);
  };

  // Type-safe implementation for the date format
  const formatDate = (dateString?: string) => {
    if (!dateString) return "No date";
    return format(new Date(dateString), "MMM d, yyyy");
  };

  // Handle grading submission with proper error handling
  const handleGradeSubmission = async (values: z.infer<typeof gradeFormSchema>) => {
    if (!selectedSubmission) return;
    
    try {
      await updateGrade({
        submissionId: selectedSubmission.id,
        grade: values.grade,
        feedback: values.feedback,
      }).unwrap();
      
      toast.success("Submission graded successfully");
      setGradeDialogOpen(false);
      refetchSubmissions();
    } catch (error) {
      console.error("Error grading submission:", error);
      toast.error("Failed to grade submission");
    }
  };

  // Helper function to format attachment name
  const formatAttachmentName = (attachment: Attachment): string => {
    return attachment.name || "Untitled";
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header with back button and title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => router.push("/teacher/assignments")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Assignment Details</h1>
            <p className="text-sm text-gray-400">{assignment.title}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <StatusBadge status={assignment.status} />
          {!isEditMode && (
            <Button 
              variant="outline" 
              onClick={() => router.push(`/teacher/assignments/${assignmentId}?edit=true`)}
            >
              <Edit2 className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}
        </div>
      </div>
      
      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assignment details */}
        <div className="lg:col-span-2 space-y-6">
          {isEditMode ? (
            <Card className="bg-customgreys-secondarybg border-gray-700">
              <CardHeader>
                <CardTitle>Edit Assignment</CardTitle>
                <CardDescription>
                  Make changes to the assignment details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input 
                    value={editTitle}
                    onChange={(e) => {
                      setEditTitle(e.target.value);
                      setIsFormChanged(true);
                    }}
                    className="bg-customgreys-primarybg border-gray-700"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea 
                    value={editDescription}
                    onChange={(e) => {
                      setEditDescription(e.target.value);
                      setIsFormChanged(true);
                    }}
                    className="bg-customgreys-primarybg border-gray-700 min-h-[150px]"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Points</label>
                    <Input 
                      type="number"
                      value={editPoints}
                      onChange={(e) => {
                        setEditPoints(Number(e.target.value));
                        setIsFormChanged(true);
                      }}
                      className="bg-customgreys-primarybg border-gray-700"
                      min={0}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <Select 
                      value={editStatus}
                      onValueChange={(value: "active" | "closed" | "draft") => {
                        setEditStatus(value);
                        setIsFormChanged(true);
                      }}
                    >
                      <SelectTrigger className="bg-customgreys-primarybg border-gray-700">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent className="bg-customgreys-primarybg border-gray-700">
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t border-gray-700 pt-4 flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => router.push(`/teacher/assignments/${assignmentId}`)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveEdit}
                  disabled={!isFormChanged || isUpdating}
                >
                  {isUpdating ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <Card className="bg-customgreys-secondarybg border-gray-700">
              <CardHeader>
                <CardTitle>{assignment.title}</CardTitle>
                <div className="flex flex-wrap gap-2 text-sm text-gray-400">
                  <div className="flex items-center">
                    <CalendarDays className="mr-2 h-4 w-4 text-primary-500" />
                    <span>Created {formatDate(assignment.createdAt)}</span>
                  </div>
                  {assignment.deadline && (
                    <div className="flex items-center">
                      <Clock className="mr-2 h-4 w-4 text-amber-500" />
                      <span>Due {formatDate(assignment.deadline)}</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <FileText className="mr-2 h-4 w-4 text-blue-500" />
                    <span>{assignment.points} points</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Description</h3>
                  <div className="p-4 bg-customgreys-primarybg rounded-md">
                    <p className="text-gray-300 whitespace-pre-line">{assignment.description}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Attachments</h3>
                  {assignment.attachments && assignment.attachments.length > 0 ? (
                    <div className="space-y-2">
                      {assignment.attachments.map((attachment, index) => (
                        <div 
                          key={index} 
                          className="flex items-center justify-between p-3 bg-customgreys-primarybg rounded-md"
                        >
                          <div className="flex items-center">
                            <FileText className="h-5 w-5 text-primary-500 mr-3" />
                            <span className="text-sm truncate max-w-md">
                              {formatAttachmentName(attachment)}
                            </span>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm">No attachments</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
          
          {!isEditMode && (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-customgreys-secondarybg border-b border-gray-700 rounded-none p-0 h-12 w-full">
                <TabsTrigger
                  value="submissions"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary-500 data-[state=active]:bg-transparent px-6 flex-1"
                >
                  Submissions
                </TabsTrigger>
                <TabsTrigger
                  value="analytics"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary-500 data-[state=active]:bg-transparent px-6 flex-1"
                >
                  Analytics
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="submissions" className="pt-6">
                <Card className="bg-customgreys-secondarybg border-gray-700">
                  <CardHeader>
                    <CardTitle>Student Submissions</CardTitle>
                    <CardDescription>
                      {submissions.length} submission{submissions.length !== 1 ? 's' : ''} received
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingSubmissions ? (
                      <div className="text-center py-8">
                        <p>Loading submissions...</p>
                      </div>
                    ) : submissions.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-400">No submissions yet</p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow className="border-gray-700 hover:bg-transparent">
                            <TableHead className="text-gray-400">Student</TableHead>
                            <TableHead className="text-gray-400">Submitted</TableHead>
                            <TableHead className="text-gray-400">Status</TableHead>
                            <TableHead className="text-gray-400 text-right">Grade</TableHead>
                            <TableHead className="w-[80px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {submissions.map((submission: Submission) => (
                            <TableRow 
                              key={submission.id} 
                              className="border-gray-700 hover:bg-customgreys-primarybg"
                            >
                              <TableCell className="font-medium">
                                {submission.studentId}
                              </TableCell>
                              <TableCell>{formatDate(submission.submittedAt)}</TableCell>
                              <TableCell>
                                <SubmissionStatusBadge status={submission.status} />
                              </TableCell>
                              <TableCell className="text-right">
                                {submission.grade !== null ? `${submission.grade}/${assignment.points}` : "-"}
                              </TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent className="bg-customgreys-primarybg border-gray-700">
                                    <DropdownMenuItem onClick={() => router.push(`/teacher/assignments/${assignmentId}/submission/${submission.id}`)}>
                                      <Eye className="mr-2 h-4 w-4" />
                                      View
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => openGradeModal(submission)}>
                                      <Pencil className="mr-2 h-4 w-4" />
                                      Grade
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="analytics" className="pt-6">
                <Card className="bg-customgreys-secondarybg border-gray-700">
                  <CardHeader>
                    <CardTitle>Assignment Analytics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <p className="text-sm text-gray-400 mb-2">Submission progress</p>
                      <Progress value={submissionRate} className="h-2 bg-gray-700" 
                        indicatorClassName={submissionRate >= 70 ? "bg-green-500" : submissionRate >= 30 ? "bg-amber-500" : "bg-red-500"} 
                      />
                      <p className="text-xs text-gray-500 mt-1">{submissionRate}% of students have submitted</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-400">Total Students</p>
                        <p className="text-2xl font-medium">
                          {assignment.totalStudents}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Average Grade</p>
                        <p className="text-2xl font-medium">
                          {submissions.length > 0 && submissions.some((s: Submission) => s.status === "graded")
                            ? `${Math.round(
                                submissions
                                  .filter((s: Submission) => s.status === "graded")
                                  .reduce((acc: number, s: Submission) => acc + (s.grade || 0), 0) / 
                                submissions.filter((s: Submission) => s.status === "graded").length
                              )}/${assignment.points}`
                            : "No grades yet"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">On-time Submissions</p>
                        <p className="text-2xl font-medium">
                          {submissions.filter((s: Submission) => s.status !== "late").length} / {assignment.totalStudents}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Late Submissions</p>
                        <p className="text-2xl font-medium">
                          {submissions.filter((s: Submission) => s.status === "late").length}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Pending</p>
                        <p className="text-2xl font-medium">
                          {(assignment.totalStudents || 0) - submissions.length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {!isEditMode && (
            <>
              <Card className="bg-customgreys-secondarybg border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg">Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {assignment.status === "active" ? (
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => handleStatusChange("closed")}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Close Assignment
                    </Button>
                  ) : assignment.status === "closed" ? (
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => handleStatusChange("active")}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Reopen Assignment
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => handleStatusChange("active")}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Publish Assignment
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => router.push(`/teacher/assignments/${assignmentId}?edit=true`)}
                  >
                    <Edit2 className="mr-2 h-4 w-4" />
                    Edit Assignment
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="bg-customgreys-secondarybg border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg">Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col">
                    <div className="flex justify-between py-2 border-b border-gray-700">
                      <span className="text-gray-400">Total Students</span>
                      <span>{assignment.totalStudents}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-700">
                      <span className="text-gray-400">Submissions</span>
                      <span>{submissions.length}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-700">
                      <span className="text-gray-400">Graded</span>
                      <span>{submissions.filter((s: Submission) => s.status === "graded").length}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-700">
                      <span className="text-gray-400">Points</span>
                      <span>{assignment.points}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-400">Status</span>
                      <StatusBadge status={assignment.status} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
      
      {/* Grade submission dialog */}
      <Dialog open={gradeDialogOpen} onOpenChange={setGradeDialogOpen}>
        <DialogContent className="bg-customgreys-primarybg border-gray-700 max-w-md">
          <DialogHeader>
            <DialogTitle>Grade Submission</DialogTitle>
            <DialogDescription>
              Student's submission for {assignment.title}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...gradeForm}>
            <form onSubmit={gradeForm.handleSubmit(handleGradeSubmission)} className="space-y-4">
              <FormField
                control={gradeForm.control}
                name="grade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grade (out of {assignment.points})</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        className="bg-customgreys-secondarybg border-gray-700"
                        min={0}
                        max={assignment.points}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter a grade between 0 and {assignment.points}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={gradeForm.control}
                name="feedback"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Feedback</FormLabel>
                    <FormControl>
                      <Textarea
                        className="bg-customgreys-secondarybg border-gray-700 min-h-[100px]"
                        placeholder="Provide feedback to the student"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setGradeDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isGrading}>
                  {isGrading ? "Saving..." : "Save Grade"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AssignmentDetail; 