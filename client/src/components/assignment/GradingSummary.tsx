import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle } from "lucide-react";
import { useRouter } from 'next/navigation';

interface AssignmentSubmission {
  studentId: string;
  studentName: string;
  submissionDate: string;
  content: string;
  grade?: number;
  feedback?: string;
  status: "submitted" | "graded";
}

interface GradingSummaryProps {
  assignmentId: string;
  points: number;
  submissions: AssignmentSubmission[];
}

const GradingSummary: React.FC<GradingSummaryProps> = ({ 
  assignmentId,
  points,
  submissions 
}) => {
  const router = useRouter();
  
  // Calculate stats
  const totalSubmissions = submissions.length;
  const gradedSubmissions = submissions.filter(sub => sub.status === "graded").length;
  const pendingSubmissions = totalSubmissions - gradedSubmissions;
  
  // Grade distribution helpers
  const getGradeCategory = (submission: AssignmentSubmission): string => {
    if (!submission.grade) return 'ungraded';
    const percentage = submission.grade / points;
    
    if (percentage >= 0.9) return 'excellent';
    if (percentage >= 0.7) return 'good';
    if (percentage >= 0.5) return 'fair';
    return 'poor';
  };
  
  // Count submissions in each grade category
  const excellentCount = submissions.filter(sub => getGradeCategory(sub) === 'excellent').length;
  const goodCount = submissions.filter(sub => getGradeCategory(sub) === 'good').length;
  const fairCount = submissions.filter(sub => getGradeCategory(sub) === 'fair').length;
  const poorCount = submissions.filter(sub => getGradeCategory(sub) === 'poor').length;
  
  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle>Grading Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-sm font-medium text-slate-400">Submissions</h3>
              <span className="text-lg font-bold text-white">{totalSubmissions}</span>
            </div>
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-slate-300 bg-slate-700">
                    Total Submissions
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-slate-300">
                    {totalSubmissions} submissions
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-sm font-medium text-slate-400">Grading Progress</h3>
              <span className="text-lg font-bold text-green-400">
                {gradedSubmissions}/{totalSubmissions}
              </span>
            </div>
            <div className="relative pt-1">
              <div className="overflow-hidden h-2 mb-2 text-xs flex rounded bg-slate-700">
                <div 
                  style={{ width: `${totalSubmissions > 0 ? (gradedSubmissions / totalSubmissions) * 100 : 0}%` }} 
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500">
                </div>
              </div>
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-300 bg-green-900">
                    Graded
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-green-300">
                    {totalSubmissions > 0 ? Math.round((gradedSubmissions / totalSubmissions) * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-sm font-medium text-slate-400">Grade Distribution</h3>
            </div>
            <div className="space-y-2">
              {gradedSubmissions === 0 ? (
                <p className="text-slate-400 text-sm">No grades yet</p>
              ) : (
                <>
                  <div className="flex items-center text-sm">
                    <span className="w-16 text-green-400">90-100%</span>
                    <div className="flex-1 mx-2">
                      <div className="bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-green-500 h-2" 
                          style={{ 
                            width: `${gradedSubmissions > 0 ? (excellentCount / gradedSubmissions) * 100 : 0}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                    <span className="w-5 text-right">{excellentCount}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="w-16 text-blue-400">70-89%</span>
                    <div className="flex-1 mx-2">
                      <div className="bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-blue-500 h-2" 
                          style={{ 
                            width: `${gradedSubmissions > 0 ? (goodCount / gradedSubmissions) * 100 : 0}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                    <span className="w-5 text-right">{goodCount}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="w-16 text-yellow-400">50-69%</span>
                    <div className="flex-1 mx-2">
                      <div className="bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-yellow-500 h-2" 
                          style={{ 
                            width: `${gradedSubmissions > 0 ? (fairCount / gradedSubmissions) * 100 : 0}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                    <span className="w-5 text-right">{fairCount}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="w-16 text-red-400">0-49%</span>
                    <div className="flex-1 mx-2">
                      <div className="bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-red-500 h-2" 
                          style={{ 
                            width: `${gradedSubmissions > 0 ? (poorCount / gradedSubmissions) * 100 : 0}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                    <span className="w-5 text-right">{poorCount}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <Button
            className="w-full bg-orange-600 hover:bg-orange-700"
            onClick={() => router.push(`/teacher/assignments/${assignmentId}/submissions`)}
          >
            {pendingSubmissions > 0 ? (
              <>
                <AlertCircle className="h-4 w-4 mr-2" />
                Grade Pending ({pendingSubmissions})
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                View All Submissions
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default GradingSummary; 