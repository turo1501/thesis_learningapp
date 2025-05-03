import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  CheckCircle, 
  AlertCircle, 
  Bookmark, 
  Loader2 
} from "lucide-react";
import { format as dateFormat } from "date-fns";
import { toast } from "sonner";

interface AssignmentSubmission {
  studentId: string;
  studentName: string;
  submissionDate: string;
  content: string;
  grade?: number;
  feedback?: string;
  status: "submitted" | "graded";
}

interface SubmissionGraderProps {
  submission: AssignmentSubmission;
  maxPoints: number;
  assignmentId: string;
  onGradeSubmit: (
    studentId: string, 
    grade: number, 
    feedback: string
  ) => Promise<void>;
  isSubmitting?: boolean;
}

const FEEDBACK_TEMPLATES = [
  {
    label: "Excellent",
    text: "Excellent work! Your submission demonstrates a comprehensive understanding of the material and exceeds the assignment requirements."
  },
  {
    label: "Good",
    text: "Good job! Your work shows a solid understanding of the concepts covered in this assignment."
  },
  {
    label: "Needs Improvement",
    text: "Your submission shows effort, but there are areas that need improvement. Please review the following points:"
  },
  {
    label: "Incomplete",
    text: "Your submission is incomplete and missing some key elements required by the assignment. Please address the following:"
  }
];

const SubmissionGrader: React.FC<SubmissionGraderProps> = ({
  submission,
  maxPoints,
  assignmentId,
  onGradeSubmit,
  isSubmitting = false
}) => {
  const [grade, setGrade] = useState<number>(submission.grade || 0);
  const [feedback, setFeedback] = useState<string>(submission.feedback || "");
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [showTemplates, setShowTemplates] = useState<boolean>(false);
  
  // Update state when submission changes
  useEffect(() => {
    setGrade(submission.grade || 0);
    setFeedback(submission.feedback || "");
  }, [submission]);
  
  const handleTemplateSelect = (index: number) => {
    setSelectedTemplate(index);
    setFeedback(FEEDBACK_TEMPLATES[index].text);
  };
  
  const handleGradeSubmit = async () => {
    try {
      await onGradeSubmit(submission.studentId, grade, feedback);
      toast.success("Grade submitted successfully");
    } catch (error) {
      console.error("Error submitting grade:", error);
      toast.error("Failed to submit grade");
    }
  };
  
  // Calculate percentage for visual indicators
  const gradePercentage = Math.min(100, Math.max(0, (grade / maxPoints) * 100));
  
  // Determine grade class based on percentage
  const getGradeClass = () => {
    if (gradePercentage >= 90) return "text-green-400";
    if (gradePercentage >= 70) return "text-blue-400";
    if (gradePercentage >= 50) return "text-yellow-400";
    return "text-red-400";
  };
  
  return (
    <Card className="bg-slate-800 border-slate-700 mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`p-2 rounded-full mr-3 ${submission.status === "graded" ? "bg-green-500/20" : "bg-blue-500/20"}`}>
              <User className={`h-5 w-5 ${submission.status === "graded" ? "text-green-500" : "text-blue-500"}`} />
            </div>
            <div>
              <CardTitle className="text-xl">{submission.studentName}</CardTitle>
              <p className="text-sm text-slate-400">
                Submitted: {dateFormat(new Date(submission.submissionDate), "MMM dd, yyyy h:mm a")}
              </p>
            </div>
          </div>
          <Badge className={submission.status === "graded" ? "bg-green-600" : "bg-orange-600"}>
            {submission.status === "graded" ? (
              <><CheckCircle className="h-3.5 w-3.5 mr-1" /> Graded</>
            ) : (
              <><AlertCircle className="h-3.5 w-3.5 mr-1" /> Pending</>
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="text-sm font-medium text-slate-400 mb-2 block">Student Submission</Label>
          <div className="bg-slate-900 p-4 rounded-md text-slate-300 max-h-80 overflow-y-auto whitespace-pre-wrap">
            {submission.content}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1 space-y-2">
            <Label htmlFor="grade" className="flex justify-between">
              <span>Grade</span>
              <span className="text-slate-400">/{maxPoints}</span>
            </Label>
            <div className="flex space-x-4 items-center">
              <Input
                id="grade"
                type="number"
                min="0"
                max={maxPoints}
                value={grade}
                onChange={(e) => setGrade(Number(e.target.value))}
                className="bg-slate-900 border-slate-700 text-white w-20"
              />
              <div className={`text-lg font-bold ${getGradeClass()}`}>
                {gradePercentage.toFixed(0)}%
              </div>
            </div>
            <Slider
              value={[grade]}
              max={maxPoints}
              step={1}
              onValueChange={(values: number[]) => setGrade(values[0])}
              className="py-2"
            />
            <div className="flex justify-between text-xs text-slate-400">
              <span>0</span>
              <span>{maxPoints}</span>
            </div>
          </div>
          
          <div className="md:col-span-3 space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="feedback">Feedback</Label>
              <Button 
                variant="outline" 
                size="sm"
                className="text-xs border-slate-700 hover:bg-slate-700"
                onClick={() => setShowTemplates(!showTemplates)}
              >
                {showTemplates ? 'Hide Templates' : 'Show Templates'}
              </Button>
            </div>
            
            {showTemplates && (
              <div className="grid grid-cols-2 gap-2 mb-2">
                {FEEDBACK_TEMPLATES.map((template, idx) => (
                  <Button
                    key={idx}
                    type="button"
                    variant="outline"
                    size="sm"
                    className={`justify-start text-left h-auto py-2 border-slate-700 hover:bg-slate-700 ${
                      selectedTemplate === idx ? 'border-blue-500 bg-blue-900/20' : ''
                    }`}
                    onClick={() => handleTemplateSelect(idx)}
                  >
                    <div>
                      <div className="font-medium">{template.label}</div>
                      <div className="text-xs text-slate-400 truncate max-w-[200px]">
                        {template.text.substring(0, 30)}...
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            )}
            
            <Textarea
              id="feedback"
              placeholder="Provide feedback to the student..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="bg-slate-900 border-slate-700 text-white min-h-[150px] resize-none"
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          {submission.status === "graded" ? (
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isSubmitting}
              onClick={handleGradeSubmit}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Bookmark className="mr-2 h-4 w-4" />
                  Update Grade
                </>
              )}
            </Button>
          ) : (
            <Button
              className="bg-green-600 hover:bg-green-700"
              disabled={isSubmitting}
              onClick={handleGradeSubmit}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Submit Grade
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SubmissionGrader; 