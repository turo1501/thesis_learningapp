"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  Calendar,
  Clock,
  FileText,
  Download,
  CheckCircle,
  MessageSquare,
  PenLine,
  Eye,
  AlertTriangle,
} from "lucide-react";
import { format } from "date-fns";

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
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

import { useUser } from "@clerk/nextjs";
import { 
  useGetSubmissionByIdQuery, 
  useGetAssignmentByIdQuery,
  useGradeSubmissionMutation,
  Assignment,
  Submission,
  Attachment
} from "@/state/api/assignmentApi";

// Add the formatAttachmentName function
const formatAttachmentName = (attachment: Attachment | string): string => {
  if (typeof attachment === 'string') {
    const parts = attachment.split('/');
    return parts[parts.length - 1] || attachment;
  }
  return attachment.name;
};

// Helper function to format dates safely
const formatDate = (dateString?: string) => {
  if (!dateString) return "Unknown date";
  return format(new Date(dateString), "MMM d, yyyy 'at' h:mm a");
};

const SubmissionDetail = () => {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  
  const assignmentId = params.id as string;
  const submissionId = params.submissionId as string;
  
  const [editMode, setEditMode] = useState(false);
  const [grade, setGrade] = useState(0);
  const [feedback, setFeedback] = useState("");
  
  const { 
    data: submission, 
    isLoading, 
    isError,
    refetch
  } = useGetSubmissionByIdQuery({ assignmentId, submissionId });
  
  const { 
    data: assignment,
    isLoading: isLoadingAssignment
  } = useGetAssignmentByIdQuery(assignmentId);
  
  const [updateGrade, { isLoading: isUpdating }] = useGradeSubmissionMutation();
  
  useEffect(() => {
    if (submission) {
      setGrade(submission.grade || 0);
      setFeedback(submission.feedback || "");
    }
  }, [submission]);
  
  // Fix for the Progress component
  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 60) return "bg-amber-500";
    return "bg-red-500";
  };
  
  if (isLoading || isLoadingAssignment) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" disabled>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Skeleton className="h-8 w-64 bg-gray-700" />
        </div>
        
        <Card className="bg-customgreys-secondarybg border-gray-700">
          <CardHeader>
            <Skeleton className="h-7 w-96 bg-gray-700 mb-2" />
            <Skeleton className="h-5 w-48 bg-gray-700" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-32 w-full bg-gray-700" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-12 w-full bg-gray-700" />
              <Skeleton className="h-12 w-full bg-gray-700" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (isError || !submission || !assignment) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Submission Not Found</h2>
        <p className="text-gray-400 mb-6">The submission you are looking for doesn't exist or you don't have access to it.</p>
        <Button onClick={() => router.push(`/teacher/assignments/${assignmentId}`)}>
          Back to Assignment
        </Button>
      </div>
    );
  }
  
  const getSubmissionStatus = () => {
    switch (submission.status) {
      case "submitted":
        return <Badge className="bg-green-600">Submitted</Badge>;
      case "late":
        return <Badge className="bg-amber-600">Late</Badge>;
      case "graded":
        return <Badge className="bg-blue-600">Graded</Badge>;
      default:
        return null;
    }
  };
  
  const handleSaveGrade = async () => {
    if (grade > assignment.points) {
      toast.error(`Grade cannot exceed maximum points (${assignment.points})`);
      return;
    }
    
    try {
      await updateGrade({
        submissionId,
        grade,
        feedback,
      }).unwrap();
      
      toast.success("Submission graded successfully");
      setEditMode(false);
      refetch();
    } catch (error) {
      toast.error("Failed to update grade");
    }
  };
  
  // Calculate score as percentage
  const scorePercentage = Math.round((submission.grade || 0) / assignment.points * 100);
  
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => router.push(`/teacher/assignments/${assignmentId}`)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Student Submission</h1>
            <p className="text-sm text-gray-400">
              {assignment.title}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {getSubmissionStatus()}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-customgreys-secondarybg border-gray-700">
            <CardHeader>
              <CardTitle>Submission Content</CardTitle>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Clock className="h-4 w-4" />
                <span>Submitted {formatDate(submission.submittedAt)}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-customgreys-primarybg rounded-md">
                <p className="whitespace-pre-line text-gray-300">
                  {submission.content || "No content provided in this submission."}
                </p>
              </div>
              
              {submission.attachments && submission.attachments.length > 0 ? (
                <div>
                  <h3 className="text-sm font-medium mb-2">Attachments</h3>
                  <div className="space-y-2">
                    {submission.attachments.map((attachment, index) => (
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
                </div>
              ) : (
                <p className="text-gray-400 text-sm">No files attached to this submission</p>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card className="bg-customgreys-secondarybg border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg">Student Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary-700">
                    {submission.studentName?.charAt(0) || submission.studentId?.charAt(0) || "S"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {submission.studentName || "Student"}
                  </p>
                  <p className="text-sm text-gray-400">{submission.studentId}</p>
                </div>
              </div>
              
              <Separator className="bg-gray-700" />
              
              <div>
                <h3 className="text-sm font-medium mb-2">Assignment Details</h3>
                <div className="text-sm">
                  <div className="flex justify-between py-1">
                    <span className="text-gray-400">Assignment:</span>
                    <span>{assignment.title}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-400">Due Date:</span>
                    <span>
                      {assignment.deadline
                        ? formatDate(assignment.deadline)
                        : "No deadline"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-400">Points:</span>
                    <span>{assignment.points}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-400">Status:</span>
                    <span>{submission.status}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-customgreys-secondarybg border-gray-700">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Grading</CardTitle>
                {submission.status === "graded" && !editMode && (
                  <Button variant="outline" size="sm" onClick={() => setEditMode(true)}>
                    <PenLine className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                )}
                {submission.status !== "graded" && !editMode && (
                  <Button variant="default" size="sm" onClick={() => setEditMode(true)}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Grade
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {editMode ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Grade (out of {assignment.points})
                    </label>
                    <Input 
                      type="number"
                      value={grade}
                      onChange={(e) => setGrade(Number(e.target.value))}
                      className="bg-customgreys-primarybg border-gray-700"
                      min={0}
                      max={assignment.points}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Feedback
                    </label>
                    <Textarea 
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      className="bg-customgreys-primarybg border-gray-700 min-h-[100px]"
                      placeholder="Provide feedback for the student"
                    />
                  </div>
                  
                  <div className="flex justify-end gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setEditMode(false);
                        setGrade(submission.grade || 0);
                        setFeedback(submission.feedback || "");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSaveGrade}
                      disabled={isUpdating}
                    >
                      {isUpdating ? "Saving..." : "Save Grade"}
                    </Button>
                  </div>
                </div>
              ) : submission.status === "graded" ? (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-medium">Score</p>
                      <p className="text-lg font-semibold">
                        {submission.grade} / {assignment.points}
                      </p>
                    </div>
                    <Progress 
                      value={scorePercentage} 
                      className={`h-2 bg-gray-700 [&>div]:${getScoreColor(scorePercentage)}`}
                    />
                    <p className="text-xs text-gray-500 mt-1">{scorePercentage}%</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium mb-2">Feedback</p>
                    {submission.feedback ? (
                      <div className="p-3 bg-customgreys-primarybg rounded-md">
                        <div className="flex items-start gap-3">
                          <MessageSquare className="h-4 w-4 text-primary-500 mt-0.5" />
                          <p className="text-sm text-gray-300 whitespace-pre-line">
                            {submission.feedback}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">No feedback provided</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <PenLine className="h-12 w-12 mx-auto text-gray-500 mb-4" />
                  <p className="text-gray-400">
                    This submission has not been graded yet
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SubmissionDetail; 