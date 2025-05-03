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
import { format as dateFormat } from "date-fns";
import { toast } from "sonner";
import SubmissionGrader from "@/components/assignment/SubmissionGrader";

export default function AssignmentSubmissionsPage() {
  const router = useRouter();
  const params = useParams();
  const assignmentId = params.id as string;
  
  const { data: assignment, isLoading, error } = useGetAssignmentQuery(assignmentId);
  const [gradeSubmission, { isLoading: isGrading }] = useGradeSubmissionMutation();

  const handleBack = () => {
    router.push("/teacher/assignments");
  };

  const handleGradeSubmission = async (studentId: string, grade: number, feedback: string) => {
    try {
      await gradeSubmission({
        assignmentId,
        studentId,
        grade,
        feedback
      }).unwrap();
      
      toast.success("Submission graded successfully");
    } catch (error) {
      console.error("Failed to grade submission:", error);
      toast.error("Failed to grade submission");
    }
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
              Due: {dateFormat(new Date(assignment.dueDate), "MMM dd, yyyy")}
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
                        <SubmissionGrader
                          key={submission.studentId}
                          submission={submission}
                          maxPoints={assignment.points}
                          assignmentId={assignmentId}
                          onGradeSubmit={handleGradeSubmission}
                          isSubmitting={isGrading}
                        />
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
                        <SubmissionGrader
                          key={submission.studentId}
                          submission={submission}
                          maxPoints={assignment.points}
                          assignmentId={assignmentId}
                          onGradeSubmit={handleGradeSubmission}
                          isSubmitting={isGrading}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 