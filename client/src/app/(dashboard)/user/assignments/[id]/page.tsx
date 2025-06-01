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
  Download,
  Upload,
  X,
  FileUp,
  ClipboardCheck,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import useFileUpload, { FileWithPreview } from "@/hooks/useFileUpload";

export default function AssignmentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const assignmentId = params.id as string;
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isClient, setIsClient] = useState(false);
  
  const { user, isLoaded } = useUser();
  const userId = user?.id;
  
  const { data: assignment, isLoading, refetch } = useGetAssignmentQuery(assignmentId);
  const [submitAssignment, { isLoading: isSubmitting }] = useSubmitAssignmentMutation();
  
  const [submissionContent, setSubmissionContent] = useState("");
  const [currentTab, setCurrentTab] = useState("content");
  
  // Use our custom file upload hook
  const { 
    uploadedFiles, 
    isUploading, 
    handleFileChange: onFileChange, 
    removeFile,
    uploadFiles 
  } = useFileUpload();
  
  // File change handler that uses our hook
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFileChange(e, fileInputRef);
  };
  
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
    
    if (!submissionContent.trim() && uploadedFiles.length === 0) {
      toast.error("Please enter your submission content or upload files");
      return;
    }
    
    try {
      // Upload all files first
      const fileUrls = await uploadFiles();
      
      // Now submit the assignment with content and file URLs
      await submitAssignment({
        assignmentId,
        content: submissionContent,
        attachments: fileUrls
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
  
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
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
  const timeRemaining = new Date(assignment.dueDate).getTime() - new Date().getTime();
  const daysRemaining = Math.max(0, Math.floor(timeRemaining / (1000 * 60 * 60 * 24)));
  const hoursRemaining = Math.max(0, Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
  
  // Calculate time remaining percentage
  const totalDuration = 14 * 24 * 60 * 60 * 1000; // Assuming 14 days is typical assignment duration
  const percentageRemaining = Math.min(100, Math.max(0, (timeRemaining / totalDuration) * 100));
  
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
      <div className="flex items-center justify-between mb-5">
        <button
          className="flex items-center border border-slate-700 rounded-lg p-2 gap-2 cursor-pointer hover:bg-slate-800 text-slate-300"
          onClick={handleBack}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Assignments</span>
        </button>
        
        {!isSubmitted && !isOverdue && (
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-amber-500" />
            <span className="text-amber-400 font-medium">
              {daysRemaining > 0 ? `${daysRemaining} days ` : ""}
              {hoursRemaining} hours remaining
            </span>
          </div>
        )}
      </div>
      
      <Header 
        title={assignment.title} 
        subtitle="Assignment details" 
      />
      
      <Card className="bg-slate-800 border-slate-700 overflow-hidden">
        {!isSubmitted && !isOverdue && (
          <div className="relative w-full h-1 bg-slate-700">
            <div 
              className={cn(
                "absolute left-0 top-0 h-full transition-all", 
                percentageRemaining > 70 ? "bg-green-500" : 
                percentageRemaining > 30 ? "bg-amber-500" : "bg-red-500"
              )} 
              style={{width: `${percentageRemaining}%`}}
            />
          </div>
        )}
        <CardHeader className="pb-2">
          <div className="flex flex-wrap gap-2 mb-2">
            {assignment.courseId && (
              <Badge className="bg-blue-600">
                <BookOpen className="h-3 w-3 mr-1" />
                Course Assignment
              </Badge>
            )}
            <Badge variant="outline" className={cn(
              "border-slate-700",
              isOverdue ? "bg-red-900/30 text-red-400" : 
              "bg-slate-900"
            )}>
              <Calendar className="h-3 w-3 mr-1" />
              Due: {dateFormat(new Date(assignment.dueDate), "MMM dd, yyyy")}
            </Badge>
            {isSubmitted && (
              <Badge className={isGraded ? "bg-green-600" : "bg-amber-600"}>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {assignment.attachments.map((attachment: string, index: number) => (
                  <a 
                    key={index}
                    href={attachment}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-3 border border-slate-700 rounded-lg bg-slate-900 hover:bg-slate-800 transition-colors"
                  >
                    <FileText className="h-5 w-5 text-blue-400 mr-3 flex-shrink-0" />
                    <span className="text-slate-300 truncate mr-2">
                      {attachment.split('/').pop()}
                    </span>
                    <Download className="h-4 w-4 text-slate-400 ml-auto flex-shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}
          
          <Separator className="my-6 bg-slate-700" />
          
          {isSubmitted ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <ClipboardCheck className="h-5 w-5 mr-2 text-blue-400" />
                  Your Submission
                </h3>
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
                    
                    {/* Show user submission attachments if any */}
                    {userSubmission.attachments && userSubmission.attachments.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-slate-400 mb-2">Files</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {userSubmission.attachments.map((attachment: string, index: number) => (
                            <a 
                              key={index}
                              href={attachment}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center p-2 border border-blue-800/30 rounded-md bg-blue-900/10 hover:bg-blue-900/20 transition-colors"
                            >
                              <FileText className="h-4 w-4 text-blue-400 mr-2 flex-shrink-0" />
                              <span className="text-slate-300 truncate mr-2">
                                {attachment.split('/').pop()}
                              </span>
                              <Download className="h-3 w-3 text-slate-400 ml-auto flex-shrink-0" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="bg-slate-800 p-4 rounded-lg text-slate-300 whitespace-pre-wrap">
                      {userSubmission.content}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {isGraded && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-green-500 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Feedback
                  </h3>
                  <Card className="bg-green-500/10 border border-green-500/20">
                    <CardContent className="p-4">
                      <div className="mb-4">
                        <h5 className="font-medium text-white mb-2">Grade</h5>
                        <div className="flex items-center space-x-4">
                          <div className="text-2xl font-bold text-green-400">
                            {userSubmission.grade}/{assignment.points}
                          </div>
                          <div className="flex-1">
                            <Progress 
                              value={(userSubmission.grade / assignment.points) * 100} 
                              className="h-2.5 bg-slate-800"
                              style={{
                                '--progress-foreground': (userSubmission.grade / assignment.points) > 0.7 
                                  ? 'hsl(142.1, 76.2%, 36.3%)' // green-600
                                  : (userSubmission.grade / assignment.points) > 0.4 
                                    ? 'hsl(47.9, 95.8%, 53.1%)' // yellow-500
                                    : 'hsl(0, 72.2%, 50.6%)' // red-500
                              } as React.CSSProperties}
                            />
                            <div className="flex justify-between text-xs text-slate-400 mt-1">
                              <span>0</span>
                              <span>{assignment.points}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="font-medium text-white mb-2">Teacher Comments</h5>
                        {userSubmission.feedback ? (
                          <div className="bg-slate-800/50 p-4 rounded-md text-slate-300 whitespace-pre-wrap">
                            {userSubmission.feedback}
                          </div>
                        ) : (
                          <p className="text-slate-400">No written feedback provided.</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          ) : (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <FileUp className="h-5 w-5 mr-2 text-blue-400" />
                Submit Your Assignment
              </h3>
              
              <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
                <Tabs 
                  defaultValue="content" 
                  className="w-full"
                  value={currentTab}
                  onValueChange={setCurrentTab}
                >
                  <TabsList className="grid grid-cols-2 bg-slate-900 mb-4">
                    <TabsTrigger value="content" className="data-[state=active]:bg-blue-600">
                      Answer
                    </TabsTrigger>
                    <TabsTrigger value="files" className="data-[state=active]:bg-blue-600 relative">
                      Files
                      {uploadedFiles.length > 0 && (
                        <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-blue-500 text-xs">
                          {uploadedFiles.length}
                        </Badge>
                      )}
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="content" className="mt-0">
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
                  </TabsContent>
                  
                  <TabsContent value="files" className="mt-0">
                    <div className="space-y-4">
                      <div 
                        onClick={triggerFileInput}
                        className="border-2 border-dashed border-slate-700 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors"
                      >
                        <Upload className="h-10 w-10 text-slate-500 mb-2" />
                        <p className="text-center text-slate-400">
                          <span className="font-medium text-blue-400">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                          PDF, Word, Images, or any other relevant files
                        </p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          className="hidden"
                          onChange={handleFileChange}
                          multiple
                        />
                      </div>
                      
                      {uploadedFiles.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium">Uploaded Files</h4>
                          {uploadedFiles.map(file => (
                            <div 
                              key={file.id}
                              className="flex items-center p-3 border border-slate-700 rounded-lg bg-slate-900"
                            >
                              <div className="mr-3 flex-shrink-0">
                                {file.uploadStatus === 'uploading' ? (
                                  <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />
                                ) : file.uploadStatus === 'success' ? (
                                  <CheckCircle className="h-5 w-5 text-green-500" />
                                ) : file.uploadStatus === 'error' ? (
                                  <AlertCircle className="h-5 w-5 text-red-500" />
                                ) : (
                                  <FileText className="h-5 w-5 text-slate-400" />
                                )}
                              </div>
                              
                              <div className="flex-1 mr-2">
                                <p className="text-sm font-medium text-slate-300 truncate">{file.name}</p>
                                <p className="text-xs text-slate-500">
                                  {(file.size / 1024).toFixed(0)} KB
                                </p>
                                
                                {file.uploadStatus === 'uploading' && (
                                  <Progress
                                    value={file.progress}
                                    className="h-1 mt-1 bg-slate-800"
                                    style={{
                                      '--progress-foreground': 'hsl(221.2, 83.2%, 53.3%)' // blue-500
                                    } as React.CSSProperties}
                                  />
                                )}
                              </div>
                              
                              <button
                                type="button"
                                onClick={() => removeFile(file.id)}
                                className="p-1 rounded-full hover:bg-slate-800"
                                disabled={file.uploadStatus === 'uploading'}
                              >
                                <X className="h-4 w-4 text-slate-400" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
                
                <CardFooter className="px-0 pt-4 pb-0 flex justify-between items-center">
                  <div className="text-sm text-slate-400">
                    {!isOverdue ? (
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-amber-500" />
                        Due: {dateFormat(new Date(assignment.dueDate), "MMM dd, yyyy")}
                      </span>
                    ) : (
                      <span className="flex items-center text-red-400">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        Assignment is overdue
                      </span>
                    )}
                  </div>
                  <Button 
                    type="submit" 
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={isSubmitting || isUploading || isOverdue}
                  >
                    {isSubmitting || isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {isUploading ? "Uploading files..." : "Submitting..."}
                      </>
                    ) : (
                      "Submit Assignment"
                    )}
                  </Button>
                </CardFooter>
              </form>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 