"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { format as dateFormat } from "date-fns";
import { 
  useGetAssignmentQuery, 
  useSubmitAssignmentMutation 
} from "@/state/api";
import { 
  ArrowLeft, 
  Calendar, 
  BookOpen, 
  User, 
  CheckCircle, 
  Loader2, 
  AlertCircle,
  FileText,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import Header from "@/components/Header";
import { toast } from "sonner";

export default function AssignmentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const assignmentId = params.id as string;
  const formRef = useRef<HTMLFormElement>(null);
  const [isClient, setIsClient] = useState(false);
  
  const { user, isLoaded } = useUser();
  const userId = user?.id;
  
  const { data: assignment, isLoading, refetch } = useGetAssignmentQuery(assignmentId);
  const [submitAssignment, { isLoading: isSubmitting }] = useSubmitAssignmentMutation();
  
  const [submissionContent, setSubmissionContent] = useState("");
  
  // Ensure client-side rendering for date formatting
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Get user's submission if it exists
  const userSubmission = assignment?.submissions?.find(
    (sub: any) => sub.studentId === userId
  );
  
  const isSubmitted = !!userSubmission;
  const isGraded = userSubmission?.status === "graded";
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!submissionContent.trim()) {
      toast.error("Please enter your submission content");
      return;
    }
    
    try {
      await submitAssignment({
        assignmentId,
        content: submissionContent
      }).unwrap();
      
      toast.success("Assignment submitted successfully");
      refetch(); // Refresh assignment data
    } catch (error) {
      console.error("Failed to submit assignment:", error);
      toast.error("Failed to submit assignment");
    }
  };
  
  const handleBack = () => {
    router.push("/user/assignments");
  };
  
  if (!isLoaded || isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
      </div>
    );
  }
  
  if (!assignment) {
    return (
      <div className="text-center py-10">
        <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Assignment Not Found</h2>
        <p className="text-slate-400 mb-6">
          We couldn't find this assignment. It may have been removed or you don't have access to it.
        </p>
        <Button onClick={handleBack}>Back to Assignments</Button>
      </div>
    );
  }
  
  const isOverdue = new Date(assignment.dueDate) < new Date() && !isSubmitted;
  
  // Prevent hydration errors with dates
  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
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
          <span>Back to Assignments</span>
        </button>
      </div>
      
      <Header 
        title={assignment.title} 
        subtitle="Assignment details" 
      />
      
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-2">
          <div className="flex flex-wrap gap-2 mb-2">
            {assignment.courseId && (
              <Badge className="bg-blue-600">
                <BookOpen className="h-3 w-3 mr-1" />
                Course Assignment
              </Badge>
            )}
            <Badge variant="outline" className="bg-slate-900 border-slate-700">
              <Calendar className="h-3 w-3 mr-1" />
              Due: {dateFormat(new Date(assignment.dueDate), "MMM dd, yyyy")}
            </Badge>
            {isSubmitted && (
              <Badge className={isGraded ? "bg-green-600" : "bg-yellow-600"}>
                {isGraded ? "Graded" : "Submitted"}
              </Badge>
            )}
            {isOverdue && (
              <Badge className="bg-red-600">
                Overdue
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-slate-400">
            <div className="flex items-center">
              <span className="font-semibold mr-1">Points:</span> {assignment.points}
            </div>
            <div className="flex items-center">
              <span className="font-semibold mr-1">Teacher:</span> {assignment.teacherId ? 'Assigned' : 'Unknown'}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Instructions</h3>
            <p className="text-slate-300 whitespace-pre-wrap">{assignment.description}</p>
          </div>
          
          {assignment.attachments && assignment.attachments.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Attachments</h3>
              <div className="space-y-2">
                {assignment.attachments.map((attachment: string, index: number) => (
                  <div key={index} className="flex items-center">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-blue-400 border-blue-400/20 hover:bg-blue-400/10"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {attachment.split('/').pop()}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <Separator className="my-6 bg-slate-700" />
          
          {isSubmitted ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Your Submission</h3>
                <Card className="bg-slate-900 border-slate-700">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className="bg-blue-500/20 p-2 rounded-full mr-3">
                          <User className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                          <h5 className="font-medium">{user?.fullName || 'You'}</h5>
                          <p className="text-sm text-slate-400">
                            Submitted: {dateFormat(new Date(userSubmission.submissionDate), "MMM dd, yyyy h:mm a")}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-slate-800 p-3 rounded-md text-slate-300 whitespace-pre-wrap">
                      {userSubmission.content}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {isGraded && (
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-green-500 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Feedback
                  </h3>
                  <Card className="bg-green-500/10 border border-green-500/20">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div>
                            <h5 className="font-medium text-green-400">Grade: {userSubmission.grade}/{assignment.points}</h5>
                          </div>
                        </div>
                      </div>
                      {userSubmission.feedback ? (
                        <div className="bg-slate-800/50 p-3 rounded-md text-slate-300 whitespace-pre-wrap">
                          {userSubmission.feedback}
                        </div>
                      ) : (
                        <p className="text-slate-400">No written feedback provided.</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          ) : (
            <div>
              <h3 className="text-lg font-semibold mb-4">Submit Your Assignment</h3>
              
              <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="submission-content" className="text-sm font-medium">
                    Your Answer:
                  </label>
                  <Textarea
                    id="submission-content"
                    placeholder="Enter your answer here..."
                    value={submissionContent}
                    onChange={(e) => setSubmissionContent(e.target.value)}
                    rows={10}
                    className="bg-slate-900 border-slate-700 text-white resize-y"
                  />
                </div>
                
                <div className="flex justify-end pt-2">
                  <Button 
                    type="submit" 
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Assignment"}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 