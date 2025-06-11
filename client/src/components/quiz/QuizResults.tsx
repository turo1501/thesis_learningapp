"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { 
  Trophy,
  CheckCircle,
  XCircle,
  Clock,
  Target,
  Star,
  TrendingUp,
  Award,
  BookOpen,
  RefreshCw,
  Home,
  BarChart3,
  Lightbulb,
  ChevronRight,
  Download,
  Share2,
  MessageCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QuizOption {
  optionId: string;
  text: string;
  isCorrect?: boolean;
  explanation?: string;
}

interface QuizQuestion {
  questionId: string;
  type: "multiple-choice" | "true-false" | "fill-in-blank" | "short-answer";
  question: string;
  options?: QuizOption[];
  correctAnswer?: string;
  points: number;
  difficulty: "easy" | "medium" | "hard";
  explanation?: string;
  hints?: string[];
}

interface QuizSubmissionAnswer {
  questionId: string;
  userAnswer?: string;
  selectedOptions?: string[];
  isCorrect: boolean;
  pointsEarned: number;
  timeSpent?: number;
  hintsUsed?: number;
}

interface QuizSubmission {
  submissionId: string;
  userId: string;
  quizId: string;
  attemptNumber: number;
  answers: QuizSubmissionAnswer[];
  score: number;
  percentage: number;
  totalPoints: number;
  passed: boolean;
  timeSpent: number;
  status: "completed" | "timed-out";
  startedAt: string;
  completedAt?: string;
  feedback?: {
    overallFeedback?: string;
    strengthAreas?: string[];
    improvementAreas?: string[];
    suggestedResources?: string[];
    nextSteps?: string;
  };
}

interface Quiz {
  quizId: string;
  title: string;
  description?: string;
  questions: QuizQuestion[];
  settings: {
    passingScore?: number;
    allowRetake?: boolean;
    maxAttempts?: number;
    showCorrectAnswers?: boolean;
    showExplanations?: boolean;
  };
  totalPoints: number;
}

interface QuizResultsProps {
  quiz: Quiz;
  submission: QuizSubmission;
  onRetake?: () => void;
  onBackToCourse?: () => void;
  onShareResults?: () => void;
  className?: string;
}

const QuizResults: React.FC<QuizResultsProps> = ({
  quiz,
  submission,
  onRetake,
  onBackToCourse,
  onShareResults,
  className
}) => {
  // Calculate statistics
  const correctAnswers = submission.answers.filter(a => a.isCorrect).length;
  const totalQuestions = quiz.questions.length;
  const accuracy = (correctAnswers / totalQuestions) * 100;
  const averageTimePerQuestion = submission.timeSpent / totalQuestions;
  const hintsUsed = submission.answers.reduce((sum, a) => sum + (a.hintsUsed || 0), 0);
  
  // Performance level calculation
  const getPerformanceLevel = (percentage: number) => {
    if (percentage >= 90) return { level: "Excellent", color: "text-green-500", bg: "bg-green-500/10" };
    if (percentage >= 80) return { level: "Good", color: "text-blue-500", bg: "bg-blue-500/10" };
    if (percentage >= 70) return { level: "Fair", color: "text-yellow-500", bg: "bg-yellow-500/10" };
    if (percentage >= 60) return { level: "Poor", color: "text-orange-500", bg: "bg-orange-500/10" };
    return { level: "Fail", color: "text-red-500", bg: "bg-red-500/10" };
  };

  const performance = getPerformanceLevel(submission.percentage);

  // Format time display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "text-green-500";
      case "medium": return "text-yellow-500";
      case "hard": return "text-red-500";
      default: return "text-gray-500";
    }
  };

  // Render question result
  const renderQuestionResult = (question: QuizQuestion, answer: QuizSubmissionAnswer, index: number) => {
    const userAnswerText = question.type === "multiple-choice" || question.type === "true-false"
      ? question.options?.find(opt => answer.selectedOptions?.includes(opt.optionId))?.text
      : answer.userAnswer;

    const correctAnswerText = question.type === "multiple-choice" || question.type === "true-false"
      ? question.options?.find(opt => opt.isCorrect)?.text
      : question.correctAnswer;

    return (
      <motion.div
        key={question.questionId}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
      >
        <Card className={cn(
          "bg-customgreys-darkGrey/50 border-2",
          answer.isCorrect ? "border-green-500/30" : "border-red-500/30"
        )}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-white font-bold",
                  answer.isCorrect ? "bg-green-500" : "bg-red-500"
                )}>
                  {answer.isCorrect ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <XCircle className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-medium">Question {index + 1}</h4>
                  <p className="text-customgreys-dirtyGrey text-sm">{question.question}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Badge className={getDifficultyColor(question.difficulty)} variant="outline">
                  {question.difficulty}
                </Badge>
                <Badge variant="outline" className="text-customgreys-dirtyGrey">
                  {answer.pointsEarned}/{question.points} pts
                </Badge>
                {answer.timeSpent && (
                  <Badge variant="outline" className="text-customgreys-dirtyGrey">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatTime(answer.timeSpent)}
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* User Answer */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-customgreys-dirtyGrey text-sm">Your Answer:</span>
                <Badge className={answer.isCorrect ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}>
                  {userAnswerText || "No answer"}
                </Badge>
              </div>
              
              {!answer.isCorrect && quiz.settings.showCorrectAnswers && (
                <div className="flex items-center space-x-2">
                  <span className="text-customgreys-dirtyGrey text-sm">Correct Answer:</span>
                  <Badge className="bg-green-500/20 text-green-400">
                    {correctAnswerText}
                  </Badge>
                </div>
              )}
            </div>

            {/* Explanation */}
            {quiz.settings.showExplanations && question.explanation && (
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-blue-400" />
                  <span className="text-blue-400 font-medium">Explanation</span>
                </div>
                <p className="text-customgreys-dirtyGrey text-sm">{question.explanation}</p>
              </div>
            )}

            {/* Hints Used */}
            {answer.hintsUsed && answer.hintsUsed > 0 && (
              <div className="text-customgreys-dirtyGrey text-sm">
                💡 {answer.hintsUsed} hint{answer.hintsUsed > 1 ? 's' : ''} used
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <motion.div 
      className={cn("max-w-4xl mx-auto", className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <Card className="bg-customgreys-secondarybg border-customgreys-darkGrey/50 mb-6">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            {submission.passed ? (
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
                <Trophy className="w-10 h-10 text-green-500" />
              </div>
            ) : (
              <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center">
                <Target className="w-10 h-10 text-red-500" />
              </div>
            )}
          </div>
          
          <CardTitle className="text-3xl font-bold text-white mb-2">
            Quiz {submission.passed ? "Completed!" : "Results"}
          </CardTitle>
          
          <p className="text-customgreys-dirtyGrey text-lg mb-4">{quiz.title}</p>
          
          <div className="flex items-center justify-center space-x-4">
            <Badge className={cn("px-4 py-2 text-lg", performance.color, performance.bg)}>
              {performance.level}
            </Badge>
            {submission.passed && (
              <Badge className="bg-green-500/20 text-green-400 px-4 py-2 text-lg">
                ✅ Passed
              </Badge>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Score Overview */}
      <Card className="bg-customgreys-secondarybg border-customgreys-darkGrey/50 mb-6">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Score Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Final Score */}
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">
                {submission.percentage.toFixed(1)}%
              </div>
              <div className="text-customgreys-dirtyGrey">Final Score</div>
              <Progress value={submission.percentage} className="mt-2 h-2 bg-customgreys-darkGrey" />
            </div>

            {/* Points Earned */}
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">
                {submission.score}/{quiz.totalPoints}
              </div>
              <div className="text-customgreys-dirtyGrey">Points Earned</div>
              <div className="mt-2 text-sm text-primary-400">
                {((submission.score / quiz.totalPoints) * 100).toFixed(0)}% of total
              </div>
            </div>

            {/* Correct Answers */}
            <div className="text-center">
              <div className="text-4xl font-bold text-green-400 mb-2">
                {correctAnswers}/{totalQuestions}
              </div>
              <div className="text-customgreys-dirtyGrey">Correct Answers</div>
              <div className="mt-2 text-sm text-green-400">
                {accuracy.toFixed(1)}% accuracy
              </div>
            </div>

            {/* Time Spent */}
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-400 mb-2">
                {formatTime(submission.timeSpent)}
              </div>
              <div className="text-customgreys-dirtyGrey">Time Spent</div>
              <div className="mt-2 text-sm text-blue-400">
                {formatTime(Math.round(averageTimePerQuestion))}/question
              </div>
            </div>
          </div>
          
          {/* Passing Score Indicator */}
          {quiz.settings.passingScore && (
            <div className="mt-6 p-4 bg-customgreys-darkGrey/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white">Passing Score</span>
                <span className="text-customgreys-dirtyGrey">{quiz.settings.passingScore}%</span>
              </div>
              <Progress 
                value={quiz.settings.passingScore} 
                className="h-2 bg-customgreys-darkGrey mb-2" 
              />
              <div className="flex items-center justify-between text-sm">
                <span className={submission.passed ? "text-green-400" : "text-red-400"}>
                  {submission.passed ? "✅ Passed" : "❌ Not Passed"}
                </span>
                <span className="text-customgreys-dirtyGrey">
                  Need {quiz.settings.passingScore - submission.percentage > 0 
                    ? `${(quiz.settings.passingScore - submission.percentage).toFixed(1)}% more`
                    : "Requirement met"
                  }
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Insights */}
      {submission.feedback && (
        <Card className="bg-customgreys-secondarybg border-customgreys-darkGrey/50 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Performance Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {submission.feedback.overallFeedback && (
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <h4 className="text-blue-400 font-medium mb-2">Overall Feedback</h4>
                <p className="text-customgreys-dirtyGrey">{submission.feedback.overallFeedback}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Strengths */}
              {submission.feedback.strengthAreas && submission.feedback.strengthAreas.length > 0 && (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <h4 className="text-green-400 font-medium mb-3 flex items-center">
                    <Star className="w-4 h-4 mr-2" />
                    Strengths
                  </h4>
                  <ul className="space-y-1">
                    {submission.feedback.strengthAreas.map((strength, index) => (
                      <li key={index} className="text-customgreys-dirtyGrey text-sm flex items-center">
                        <CheckCircle className="w-3 h-3 mr-2 text-green-400" />
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Areas for Improvement */}
              {submission.feedback.improvementAreas && submission.feedback.improvementAreas.length > 0 && (
                <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                  <h4 className="text-orange-400 font-medium mb-3 flex items-center">
                    <Target className="w-4 h-4 mr-2" />
                    Areas for Improvement
                  </h4>
                  <ul className="space-y-1">
                    {submission.feedback.improvementAreas.map((area, index) => (
                      <li key={index} className="text-customgreys-dirtyGrey text-sm flex items-center">
                        <ChevronRight className="w-3 h-3 mr-2 text-orange-400" />
                        {area}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Suggested Resources */}
            {submission.feedback.suggestedResources && submission.feedback.suggestedResources.length > 0 && (
              <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                <h4 className="text-purple-400 font-medium mb-3 flex items-center">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Suggested Resources
                </h4>
                <ul className="space-y-2">
                  {submission.feedback.suggestedResources.map((resource, index) => (
                    <li key={index} className="text-customgreys-dirtyGrey text-sm flex items-center">
                      <BookOpen className="w-3 h-3 mr-2 text-purple-400" />
                      {resource}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Next Steps */}
            {submission.feedback.nextSteps && (
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <h4 className="text-blue-400 font-medium mb-2 flex items-center">
                  <ChevronRight className="w-4 h-4 mr-2" />
                  Next Steps
                </h4>
                <p className="text-customgreys-dirtyGrey text-sm">{submission.feedback.nextSteps}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Question Review */}
      <Card className="bg-customgreys-secondarybg border-customgreys-darkGrey/50 mb-6">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <MessageCircle className="w-5 h-5 mr-2" />
            Question Review
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {quiz.questions.map((question, index) => {
            const answer = submission.answers.find(a => a.questionId === question.questionId);
            return answer ? renderQuestionResult(question, answer, index) : null;
          })}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card className="bg-customgreys-secondarybg border-customgreys-darkGrey/50">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center justify-center gap-4">
            {onBackToCourse && (
              <Button
                onClick={onBackToCourse}
                className="bg-primary-600 hover:bg-primary-700"
              >
                <Home className="w-4 h-4 mr-2" />
                Back to Course
              </Button>
            )}

            {onRetake && quiz.settings.allowRetake && submission.attemptNumber < (quiz.settings.maxAttempts || 999) && (
              <Button
                onClick={onRetake}
                variant="outline"
                className="bg-transparent border-customgreys-darkGrey"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retake Quiz
              </Button>
            )}

            {onShareResults && (
              <Button
                onClick={onShareResults}
                variant="outline"
                className="bg-transparent border-customgreys-darkGrey"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share Results
              </Button>
            )}

            <Button
              variant="outline"
              className="bg-transparent border-customgreys-darkGrey"
              onClick={() => window.print()}
            >
              <Download className="w-4 h-4 mr-2" />
              Download Results
            </Button>
          </div>

          {/* Attempt Info */}
          <div className="mt-6 pt-4 border-t border-customgreys-darkGrey">
            <div className="text-center text-customgreys-dirtyGrey text-sm space-y-1">
              <p>Attempt {submission.attemptNumber} of {quiz.settings.maxAttempts || "unlimited"}</p>
              <p>Completed on {new Date(submission.completedAt || submission.startedAt).toLocaleDateString()}</p>
              {hintsUsed > 0 && <p>{hintsUsed} hints used during this attempt</p>}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default QuizResults; 