"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import { 
  useGetAssignmentQuery, 
  useGradeSubmissionMutation 
} from "@/state/api";
import { ArrowLeft, Calendar, FileText, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format as dateFormat } from "date-fns";
import { toast } from "sonner";
import SubmissionGrader from "@/components/assignment/SubmissionGrader";

export default function StudentSubmissionPage() {
  const router = useRouter();
  const params = useParams();
  const assignmentId = params.id as string;
  const studentId = params.studentId as string;
  
  const { data: assignment, isLoading, error } = useGetAssignmentQuery(assignmentId);
  const [gradeSubmission, { isLoading: isGrading }] = useGradeSubmissionMutation();
  const [studentSubmission, setStudentSubmission] = useState<any>(null);

  // Extract the specific student's submission once assignment data is loaded
  useEffect(() => {
    if (assignment && assignment.submissions) {
      const submission = assignment.submissions.find(
        (sub: any) => sub.studentId === studentId
      );
      
      if (submission) {
        setStudentSubmission(submission);
      }
    }
  }, [assignment, studentId]);

  const handleBack = () => {
    router.push(`/teacher/assignments/${assignmentId}/submissions`);
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
        <Button onClick={handleBack}>Back to Submissions</Button>
      </div>
    );
  }

  if (!studentSubmission) {
    return (
      <div className="text-center py-10">
        <AlertCircle className="h-10 w-10 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Submission Not Found</h2>
        <p className="text-slate-400 mb-6">
          We couldn't find this student's submission. It may have been removed or you don't have access to it.
        </p>
        <Button onClick={handleBack}>Back to Submissions</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-5 mb-5">
        <button
          className="flex items-center border border-slate-700 rounded-lg p-2 gap-2 cursor-pointer hover:bg-slate-800 text-slate-300"
          onClick={handleBack}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Submissions</span>
        </button>
      </div>

      <Header 
        title={`${studentSubmission.studentName}'s Submission`}
        subtitle={assignment.title}
      />
      
      <div className="flex flex-col space-y-2 mb-4">
        <div className="flex gap-2">
          <Badge className="bg-blue-600">
            <FileText className="h-3 w-3 mr-1" />
            {assignment.courseId}
          </Badge>
          <Badge variant="outline" className="bg-slate-900 border-slate-700">
            <Calendar className="h-3 w-3 mr-1" />
            Due: {dateFormat(new Date(assignment.dueDate), "MMM dd, yyyy")}
          </Badge>
        </div>
        <p className="text-sm text-slate-400">
          <span className="font-medium">Points:</span> {assignment.points}
        </p>
      </div>
      
      <SubmissionGrader
        submission={studentSubmission}
        maxPoints={assignment.points}
        assignmentId={assignmentId}
        onGradeSubmit={handleGradeSubmission}
        isSubmitting={isGrading}
      />
      
      <Card className="bg-slate-800 border-slate-700 p-4">
        <h3 className="text-lg font-semibold mb-3">Assignment Information</h3>
        <div className="mb-4">
          <h4 className="text-sm font-medium text-slate-400 mb-2">Description</h4>
          <p className="text-slate-300 whitespace-pre-wrap">{assignment.description}</p>
        </div>
        
        {assignment.attachments && assignment.attachments.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-slate-400 mb-2">Attachments</h4>
            <div className="flex flex-wrap gap-2">
              {assignment.attachments.map((attachment: string, index: number) => (
                <Badge key={index} variant="outline" className="bg-slate-700">
                  {attachment.split('/').pop()}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
} 