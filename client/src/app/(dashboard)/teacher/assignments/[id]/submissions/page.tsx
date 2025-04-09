"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import { 
  useGetAssignmentQuery, 
  useGradeSubmissionMutation 
} from "@/state/api";
import { ArrowLeft, Calendar, FileText, User, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function AssignmentSubmissionsPage() {
  const router = useRouter();
  const params = useParams();
  const assignmentId = params.id as string;
  
  const { data: assignment, isLoading, error } = useGetAssignmentQuery(assignmentId);
  const [gradeSubmission, { isLoading: isGrading }] = useGradeSubmissionMutation();
  
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<{
    studentId: string;
    studentName: string;
    content: string;
  } | null>(null);
  const [grade, setGrade] = useState<string>("0");
  const [feedback, setFeedback] = useState<string>("");

  const handleBack = () => {
    router.push("/teacher/assignments");
  };

  const handleGradeSubmission = async () => {
    if (!selectedSubmission) return;
    
    try {
      await gradeSubmission({
        assignmentId,
        studentId: selectedSubmission.studentId,
        grade: parseInt(grade),
        feedback
      }).unwrap();
      
      toast.success("Submission graded successfully");
      setGradeDialogOpen(false);
      setSelectedSubmission(null);
      setGrade("0");
      setFeedback("");
    } catch (error) {
      console.error("Failed to grade submission:", error);
      toast.error("Failed to grade submission");
    }
  };

  const openGradeDialog = (submission: any) => {
    setSelectedSubmission(submission);
    // If submission is already graded, pre-fill the form
    if (submission.grade) {
      setGrade(submission.grade.toString());
      setFeedback(submission.feedback || "");
    } else {
      setGrade("0");
      setFeedback("");
    }
    setGradeDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="text-center py-10">
        <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Error Loading Assignment</h2>
        <p className="text-slate-400 mb-6">
          We couldn't load this assignment. It may have been deleted or you don't have permission to view it.
        </p>
        <Button onClick={handleBack}>Back to Assignments</Button>
      </div>
    );
  }

  const pendingSubmissions = assignment.submissions?.filter(
    (sub: any) => sub.status === "submitted"
  ) || [];
  
  const gradedSubmissions = assignment.submissions?.filter(
    (sub: any) => sub.status === "graded"
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-5 mb-5">
        <button
          className="flex items-center border border-slate-700 rounded-lg p-2 gap-2 cursor-pointer hover:bg-slate-800 text-slate-300"
          onClick={handleBack}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Assignments</span>
        </button>
      </div>

      <Header 
        title="Assignment Submissions" 
        subtitle={assignment.title} 
      />
      
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-2">
          <div className="flex flex-wrap gap-2 mb-2">
            <Badge className="bg-blue-600">
              <FileText className="h-3 w-3 mr-1" />
              {assignment.courseId}
            </Badge>
            <Badge variant="outline" className="bg-slate-900 border-slate-700">
              <Calendar className="h-3 w-3 mr-1" />
              Due: {format(new Date(assignment.dueDate), "MMM dd, yyyy")}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-slate-400">
            <div className="flex items-center">
              <span className="font-semibold mr-1">Points:</span> {assignment.points}
            </div>
            <div className="flex items-center">
              <span className="font-semibold mr-1">Submissions:</span>
              {assignment.submissions?.length || 0}
            </div>
            <div className="flex items-center">
              <span className="font-semibold mr-1">Graded:</span>
              {gradedSubmissions.length} / {assignment.submissions?.length || 0}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-slate-300">{assignment.description}</p>
          </div>
          
          <Separator className="my-6 bg-slate-700" />
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Submissions</h3>
            
            {assignment.submissions?.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <FileText className="h-10 w-10 mx-auto mb-3 text-slate-500" />
                <p>No submissions yet</p>
              </div>
            ) : (
              <div className="space-y-6">
                {pendingSubmissions.length > 0 && (
                  <div>
                    <h4 className="text-md font-medium mb-3 text-orange-400 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Pending Submissions ({pendingSubmissions.length})
                    </h4>
                    <div className="space-y-3">
                      {pendingSubmissions.map((submission: any) => (
                        <Card key={submission.studentId} className="bg-slate-900 border-slate-700">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center">
                                <div className="bg-blue-500/20 p-2 rounded-full mr-3">
                                  <User className="h-5 w-5 text-blue-500" />
                                </div>
                                <div>
                                  <h5 className="font-medium">{submission.studentName}</h5>
                                  <p className="text-sm text-slate-400">
                                    Submitted: {format(new Date(submission.submissionDate), "MMM dd, yyyy h:mm a")}
                                  </p>
                                </div>
                              </div>
                              <Button 
                                className="bg-orange-600 hover:bg-orange-700"
                                onClick={() => openGradeDialog(submission)}
                              >
                                Grade
                              </Button>
                            </div>
                            <div className="mt-3 bg-slate-800 p-3 rounded-md text-slate-300">
                              <p className="whitespace-pre-wrap">{submission.content}</p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
                
                {gradedSubmissions.length > 0 && (
                  <div>
                    <h4 className="text-md font-medium mb-3 text-green-400 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Graded Submissions ({gradedSubmissions.length})
                    </h4>
                    <div className="space-y-3">
                      {gradedSubmissions.map((submission: any) => (
                        <Card key={submission.studentId} className="bg-slate-900 border-slate-700">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center">
                                <div className="bg-green-500/20 p-2 rounded-full mr-3">
                                  <User className="h-5 w-5 text-green-500" />
                                </div>
                                <div>
                                  <h5 className="font-medium">{submission.studentName}</h5>
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    <span className="text-sm text-slate-400">
                                      Submitted: {format(new Date(submission.submissionDate), "MMM dd, yyyy")}
                                    </span>
                                    <span className="text-sm text-green-500 font-medium">
                                      Grade: {submission.grade}/{assignment.points}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <Button 
                                variant="outline"
                                className="border-slate-700 hover:bg-slate-800"
                                onClick={() => openGradeDialog(submission)}
                              >
                                Update Grade
                              </Button>
                            </div>
                            <div className="mt-3 bg-slate-800 p-3 rounded-md text-slate-300">
                              <p className="whitespace-pre-wrap">{submission.content}</p>
                            </div>
                            {submission.feedback && (
                              <div className="mt-3 bg-green-500/10 border border-green-500/20 p-3 rounded-md">
                                <h6 className="text-sm font-medium text-green-400 mb-1">Feedback</h6>
                                <p className="text-sm text-slate-300 whitespace-pre-wrap">{submission.feedback}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Grade Submission Dialog */}
      <Dialog open={gradeDialogOpen} onOpenChange={setGradeDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>Grade Submission</DialogTitle>
            <DialogDescription className="text-slate-400">
              Provide a grade and feedback for {selectedSubmission?.studentName}'s submission.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="submission-content">Submission</Label>
              <div className="bg-slate-900 p-3 rounded-lg text-slate-300 max-h-60 overflow-y-auto">
                <p className="whitespace-pre-wrap">{selectedSubmission?.content}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2 col-span-1">
                <Label htmlFor="grade">Grade (out of {assignment.points})</Label>
                <Input
                  id="grade"
                  type="number"
                  min="0"
                  max={assignment.points}
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="bg-slate-900 border-slate-700 text-white"
                />
              </div>
              
              <div className="space-y-2 col-span-3">
                <Label htmlFor="feedback">Feedback</Label>
                <Textarea
                  id="feedback"
                  placeholder="Provide feedback to the student..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="bg-slate-900 border-slate-700 text-white min-h-[100px] resize-none"
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setGradeDialogOpen(false)}
              className="border-slate-700 hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleGradeSubmission}
              className="bg-green-600 hover:bg-green-700"
              disabled={isGrading}
            >
              {isGrading ? "Submitting..." : "Submit Grade"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 