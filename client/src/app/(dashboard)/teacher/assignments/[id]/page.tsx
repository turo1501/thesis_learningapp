"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
  useGetAssignmentQuery, 
  useUpdateAssignmentMutation, 
  useDeleteAssignmentMutation 
} from "@/state/api";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Clock,
  Loader2,
  BookOpen,
  FileText,
  CheckCircle,
  AlertCircle,
  Trash2,
  Edit,
  ArrowLeft,
  Download,
  Eye,
  Send,
} from "lucide-react";
import { format } from "date-fns";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import Link from "next/link";

// Define Assignment type 
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

const AssignmentDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const assignmentId = params.id as string;
  const [selectedTab, setSelectedTab] = useState("details");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Redirect if assignment ID is invalid
  useEffect(() => {
    if (!assignmentId || assignmentId === "undefined") {
      router.push("/teacher/assignments");
      return;
    }
  }, [assignmentId, router]);

  // Fetch assignment details (skip if ID is invalid)
  const { data: assignment, isLoading, error, refetch } = useGetAssignmentQuery(assignmentId, {
    skip: !assignmentId || assignmentId === "undefined"
  });
  
  // Mutations
  const [updateAssignment, { isLoading: isUpdating }] = useUpdateAssignmentMutation();
  const [deleteAssignment, { isLoading: isDeleting }] = useDeleteAssignmentMutation();

  // Handle status change
  const handleStatusChange = async (newStatus: "draft" | "published" | "archived") => {
    if (!assignment) return;
    
    try {
      await updateAssignment({
        assignmentId: assignment.assignmentId,
        courseId: assignment.courseId,
        status: newStatus
      }).unwrap();
      
      toast.success(`Assignment ${newStatus === "published" ? "published" : newStatus === "archived" ? "archived" : "saved as draft"}`);
      refetch();
    } catch (err) {
      toast.error("Failed to update assignment status");
      console.error(err);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!assignment) return;
    
    try {
      await deleteAssignment(assignment.assignmentId).unwrap();
      toast.success("Assignment deleted successfully");
      router.push("/teacher/assignments");
    } catch (err) {
      toast.error("Failed to delete assignment");
      console.error(err);
    }
  };

  // Handle edit
  const handleEdit = () => {
    router.push(`/teacher/assignments/edit/${assignmentId}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="p-8">
        <div className="text-red-500 bg-red-100 p-4 rounded-md flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>Error loading assignment details. Please try again later.</span>
        </div>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => router.push("/teacher/assignments")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Assignments
        </Button>
      </div>
    );
  }

  const submittedCount = assignment.submissions.length;
  const gradedCount = assignment.submissions.filter(sub => sub.status === "graded").length;
  const isPastDue = new Date(assignment.dueDate) < new Date();
  const daysLeft = Math.ceil((new Date(assignment.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="assignment-detail-page">
      <Header
        title={assignment.title}
        subtitle={`Assignment for course`}
        rightElement={
          <div className="flex items-center gap-2">
            <Button 
              variant="outline"
              className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
              onClick={() => router.push("/teacher/assignments")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            
            <Button 
              variant="outline"
              className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
              onClick={handleEdit}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700">
                  Status: {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  onClick={() => handleStatusChange("draft")}
                  disabled={assignment.status === "draft"}
                >
                  Save as Draft
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleStatusChange("published")}
                  disabled={assignment.status === "published"}
                >
                  Publish
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleStatusChange("archived")}
                  disabled={assignment.status === "archived"}
                >
                  Archive
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button
              variant="destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        }
      />

      <div className="mt-6 flex flex-col md:flex-row gap-6">
        <div className="md:w-2/3">
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="bg-slate-800">
              <TabsTrigger 
                value="details" 
                className="data-[state=active]:bg-blue-600"
              >
                Details
              </TabsTrigger>
              <TabsTrigger 
                value="submissions" 
                className="data-[state=active]:bg-blue-600"
              >
                Submissions ({submittedCount})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="mt-6">
              <Card className="p-6 bg-slate-900 border-slate-700">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-4">Description</h3>
                  <p className="text-slate-400 whitespace-pre-wrap">{assignment.description}</p>
                </div>
                
                {assignment.attachments.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold mb-4">Attachments</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {assignment.attachments.map((attachment, index) => (
                        <div 
                          key={index}
                          className="p-3 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-between"
                        >
                          <div className="flex items-center">
                            <FileText className="h-5 w-5 text-blue-400 mr-2" />
                            <span className="truncate">{attachment.split('/').pop()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button className="text-slate-400 hover:text-blue-400">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="text-slate-400 hover:text-blue-400">
                              <Download className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </TabsContent>
            
            <TabsContent value="submissions" className="mt-6">
              <Card className="p-6 bg-slate-900 border-slate-700">
                {submittedCount === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-400">No submissions yet.</p>
                    {!isPastDue && (
                      <p className="text-slate-500 mt-2">
                        There are {daysLeft} days left until the due date.
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-semibold">Student Submissions</h3>
                      <div className="flex items-center gap-4">
                        <div className="text-sm text-slate-400">
                          <span className="font-medium">{gradedCount}</span> of <span className="font-medium">{submittedCount}</span> graded
                        </div>
                        {submittedCount > 0 && gradedCount < submittedCount && (
                          <Button
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={() => router.push(`/teacher/assignments/${assignmentId}/grade`)}
                          >
                            Grade All
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {assignment.submissions.map((submission) => (
                        <div 
                          key={submission.studentId}
                          className="p-4 rounded-md bg-slate-800 border border-slate-700 flex flex-col sm:flex-row justify-between"
                        >
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{submission.studentName}</h4>
                              <Badge className={submission.status === "graded" ? "bg-green-600" : "bg-yellow-600"}>
                                {submission.status === "graded" ? "Graded" : "Submitted"}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-400">
                              Submitted: {format(new Date(submission.submissionDate), "MMM dd, yyyy 'at' h:mm a")}
                            </p>
                            {submission.status === "graded" && (
                              <p className="text-sm text-green-400 mt-1">
                                Grade: {submission.grade} / {assignment.points} points
                              </p>
                            )}
                          </div>
                          <div className="mt-3 sm:mt-0">
                            <Button
                              variant="outline"
                              className="bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
                              onClick={() => router.push(`/teacher/assignments/${assignmentId}/submissions/${submission.studentId}`)}
                            >
                              {submission.status === "graded" ? "Review" : "Grade"}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="md:w-1/3">
          <Card className="p-6 bg-slate-900 border-slate-700">
            <h3 className="text-lg font-medium mb-4">Assignment Details</h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center mb-1">
                  <Calendar className="h-4 w-4 text-slate-400 mr-2" />
                  <span className="text-sm text-slate-400">Due Date</span>
                </div>
                <p className="font-medium">{format(new Date(assignment.dueDate), "MMM dd, yyyy 'at' h:mm a")}</p>
                {!isPastDue && (
                  <p className="text-sm text-slate-400 mt-1">
                    {daysLeft} {daysLeft === 1 ? "day" : "days"} left
                  </p>
                )}
                {isPastDue && (
                  <p className="text-sm text-red-400 mt-1">
                    Past due by {Math.abs(daysLeft)} {Math.abs(daysLeft) === 1 ? "day" : "days"}
                  </p>
                )}
              </div>
              
              <div>
                <div className="flex items-center mb-1">
                  <FileText className="h-4 w-4 text-slate-400 mr-2" />
                  <span className="text-sm text-slate-400">Points</span>
                </div>
                <p className="font-medium">{assignment.points} {assignment.points === 1 ? "point" : "points"}</p>
              </div>
              
              <div>
                <div className="flex items-center mb-1">
                  <CheckCircle className="h-4 w-4 text-slate-400 mr-2" />
                  <span className="text-sm text-slate-400">Submissions</span>
                </div>
                <p className="font-medium">{submittedCount} submitted</p>
                {submittedCount > 0 && (
                  <p className="text-sm text-slate-400 mt-1">{gradedCount} graded ({Math.round((gradedCount / submittedCount) * 100)}%)</p>
                )}
              </div>
              
              <div>
                <div className="flex items-center mb-1">
                  <BookOpen className="h-4 w-4 text-slate-400 mr-2" />
                  <span className="text-sm text-slate-400">Course</span>
                </div>
                <Link 
                  href={`/teacher/courses/${assignment.courseId}`}
                  className="font-medium text-blue-400 hover:text-blue-300"
                >
                  View Course
                </Link>
              </div>
              
              <div>
                <div className="flex items-center mb-1">
                  <Clock className="h-4 w-4 text-slate-400 mr-2" />
                  <span className="text-sm text-slate-400">Created</span>
                </div>
                <p className="font-medium">{format(new Date(assignment.createdAt || new Date()), "MMM dd, yyyy")}</p>
                {assignment.updatedAt && assignment.updatedAt !== assignment.createdAt && (
                  <p className="text-sm text-slate-400 mt-1">
                    Updated: {format(new Date(assignment.updatedAt), "MMM dd, yyyy")}
                  </p>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle>Delete Assignment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this assignment? This action cannot be undone.
              {submittedCount > 0 && (
                <div className="mt-2 text-yellow-400">
                  Warning: This assignment has {submittedCount} student submissions that will also be deleted.
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Assignment"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AssignmentDetailPage; 