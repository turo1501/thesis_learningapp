"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Lightbulb, 
  ArrowRight, 
  ArrowLeft,
  Target,
  Timer,
  Trophy,
  AlertCircle,
  BookOpen,
  Star,
  Zap,
  Brain,
  HelpCircle,
  RotateCcw,
  Flag
} from "lucide-react";
import { toast } from "react-toastify";
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
  timeLimit?: number;
  imageUrl?: string;
  videoUrl?: string;
}

interface Quiz {
  quizId: string;
  title: string;
  description?: string;
  instructions?: string;
  questions: QuizQuestion[];
  settings: {
    timeLimit?: number;
    shuffleQuestions?: boolean;
    shuffleOptions?: boolean;
    showResultsImmediately?: boolean;
    allowRetake?: boolean;
    maxAttempts?: number;
    passingScore?: number;
    showCorrectAnswers?: boolean;
    showExplanations?: boolean;
  };
  totalPoints: number;
  difficulty: string;
}

interface QuizSubmission {
  submissionId: string;
  userId: string;
  quizId: string;
  attemptNumber: number;
  answers: any[];
  score: number;
  percentage: number;
  totalPoints: number;
  passed: boolean;
  timeSpent: number;
  status: "in-progress" | "completed" | "timed-out" | "abandoned";
  startedAt: string;
}

interface QuizPlayerProps {
  quiz: Quiz;
  onComplete: (submission: QuizSubmission) => void;
  onExit: () => void;
  className?: string;
}

const QuizPlayer: React.FC<QuizPlayerProps> = ({
  quiz,
  onComplete,
  onExit,
  className
}) => {
  // Quiz state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [submission, setSubmission] = useState<QuizSubmission | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  
  // Timer state
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);
  
  // UI state
  const [showHint, setShowHint] = useState(false);
  const [hintsUsed, setHintsUsed] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [questionFeedback, setQuestionFeedback] = useState<Record<string, any>>({});

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  // Initialize quiz timer
  useEffect(() => {
    if (quiz.settings.timeLimit && hasStarted) {
      setTimeRemaining(quiz.settings.timeLimit * 60); // Convert minutes to seconds
    }
  }, [quiz.settings.timeLimit, hasStarted]);

  // Quiz timer countdown
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0 || !hasStarted) return;

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null || prev <= 1) {
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining, hasStarted]);

  // Format time display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Start quiz
  const startQuiz = async () => {
    setIsLoading(true);
    try {
      // Call API to start quiz attempt
      const response = await fetch(`/api/quizzes/${quiz.quizId}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceInfo: {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            screenResolution: `${screen.width}x${screen.height}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
          }
        })
      });
      
      const data = await response.json();
      if (data.data) {
        setSubmission(data.data);
        setHasStarted(true);
        setQuestionStartTime(Date.now());
        toast.success("Quiz started! Good luck! 🍀");
      }
    } catch (error) {
      console.error("Error starting quiz:", error);
      toast.error("Failed to start quiz. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle answer change
  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  // Submit answer for current question
  const submitCurrentAnswer = async () => {
    if (!submission || !currentQuestion) return;

    const questionTimeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
    const answer = answers[currentQuestion.questionId];
    
    try {
      const response = await fetch(`/api/quizzes/submissions/${submission.submissionId}/answer`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: currentQuestion.questionId,
          userAnswer: currentQuestion.type === 'fill-in-blank' || currentQuestion.type === 'short-answer' 
            ? answer : undefined,
          selectedOptions: currentQuestion.type === 'multiple-choice' || currentQuestion.type === 'true-false'
            ? Array.isArray(answer) ? answer : [answer] : undefined,
          timeSpent: questionTimeSpent,
          hintsUsed: hintsUsed[currentQuestion.questionId] || 0
        })
      });

      const data = await response.json();
      
      if (quiz.settings.showResultsImmediately && data.data) {
        setQuestionFeedback(prev => ({
          ...prev,
          [currentQuestion.questionId]: data.data
        }));
      }

      setTotalTimeSpent(prev => prev + questionTimeSpent);
    } catch (error) {
      console.error("Error submitting answer:", error);
      toast.error("Failed to submit answer");
    }
  };

  // Navigate to next question
  const goToNextQuestion = async () => {
    await submitCurrentAnswer();
    
    if (isLastQuestion) {
      setShowConfirmation(true);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setQuestionStartTime(Date.now());
      setShowHint(false);
    }
  };

  // Navigate to previous question
  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setQuestionStartTime(Date.now());
      setShowHint(false);
    }
  };

  // Show hint for current question
  const showQuestionHint = () => {
    const questionId = currentQuestion.questionId;
    setHintsUsed(prev => ({
      ...prev,
      [questionId]: (prev[questionId] || 0) + 1
    }));
    setShowHint(true);
  };

  // Handle quiz timeout
  const handleTimeOut = () => {
    toast.warning("Time's up! Submitting your quiz...");
    completeQuiz();
  };

  // Complete quiz
  const completeQuiz = async () => {
    if (!submission) return;
    
    setIsSubmitting(true);
    try {
      // Submit current answer if not submitted
      await submitCurrentAnswer();

      const response = await fetch(`/api/quizzes/submissions/${submission.submissionId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          totalTimeSpent: totalTimeSpent + Math.floor((Date.now() - questionStartTime) / 1000)
        })
      });

      const data = await response.json();
      if (data.data) {
        onComplete(data.data.submission);
        if (data.data.passed) {
          toast.success(`🎉 Congratulations! You passed with ${data.data.percentage.toFixed(1)}%`);
        } else {
          toast.info(`Quiz completed. Score: ${data.data.percentage.toFixed(1)}%`);
        }
      }
    } catch (error) {
      console.error("Error completing quiz:", error);
      toast.error("Failed to complete quiz");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "text-green-500 bg-green-500/10 border-green-500/20";
      case "medium": return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
      case "hard": return "text-red-500 bg-red-500/10 border-red-500/20";
      default: return "text-gray-500 bg-gray-500/10 border-gray-500/20";
    }
  };

  // Render question input based on type
  const renderQuestionInput = () => {
    const questionId = currentQuestion.questionId;
    const currentAnswer = answers[questionId];

    switch (currentQuestion.type) {
      case "multiple-choice":
        return (
          <div className="space-y-3">
            {currentQuestion.options?.map((option, index) => (
              <motion.div
                key={option.optionId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "relative rounded-lg border-2 p-4 cursor-pointer transition-all hover:bg-customgreys-darkGrey/20",
                  currentAnswer === option.optionId 
                    ? "border-primary-500 bg-primary-500/10" 
                    : "border-customgreys-darkGrey/30"
                )}
                onClick={() => handleAnswerChange(questionId, option.optionId)}
              >
                <div className="flex items-center space-x-3">
                  <RadioGroupItem
                    value={option.optionId}
                    checked={currentAnswer === option.optionId}
                    className="border-2"
                  />
                  <Label className="flex-1 cursor-pointer text-white">
                    {option.text}
                  </Label>
                  <div className={cn(
                    "w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium",
                    currentAnswer === option.optionId 
                      ? "border-primary-500 bg-primary-500 text-white" 
                      : "border-customgreys-darkGrey text-customgreys-dirtyGrey"
                  )}>
                    {String.fromCharCode(65 + index)}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        );

      case "true-false":
        return (
          <div className="space-y-3">
            {[
              { id: "true", text: "True", color: "green" },
              { id: "false", text: "False", color: "red" }
            ].map((option, index) => (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "relative rounded-lg border-2 p-4 cursor-pointer transition-all hover:bg-customgreys-darkGrey/20",
                  currentAnswer === option.id 
                    ? `border-${option.color}-500 bg-${option.color}-500/10` 
                    : "border-customgreys-darkGrey/30"
                )}
                onClick={() => handleAnswerChange(questionId, option.id)}
              >
                <div className="flex items-center space-x-3">
                  <RadioGroupItem
                    value={option.id}
                    checked={currentAnswer === option.id}
                    className="border-2"
                  />
                  <Label className="flex-1 cursor-pointer text-white text-lg">
                    {option.text}
                  </Label>
                  {option.id === "true" ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-500" />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        );

      case "fill-in-blank":
      case "short-answer":
        return (
          <div className="space-y-4">
            {currentQuestion.type === "fill-in-blank" ? (
              <Input
                value={currentAnswer || ""}
                onChange={(e) => handleAnswerChange(questionId, e.target.value)}
                placeholder="Type your answer here..."
                className="bg-customgreys-darkGrey border-customgreys-dirtyGrey text-white text-lg p-4"
              />
            ) : (
              <Textarea
                value={currentAnswer || ""}
                onChange={(e) => handleAnswerChange(questionId, e.target.value)}
                placeholder="Type your answer here..."
                className="bg-customgreys-darkGrey border-customgreys-dirtyGrey text-white min-h-24"
              />
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (!hasStarted) {
    return (
      <motion.div 
        className={cn("max-w-4xl mx-auto", className)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-customgreys-secondarybg border-customgreys-darkGrey/50">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-primary-500" />
            </div>
            <CardTitle className="text-3xl font-bold text-white mb-2">{quiz.title}</CardTitle>
            {quiz.description && (
              <p className="text-customgreys-dirtyGrey text-lg">{quiz.description}</p>
            )}
          </CardHeader>
          
          <CardContent className="space-y-6">
            {quiz.instructions && (
              <Card className="bg-blue-500/10 border-blue-500/20">
                <CardContent className="p-4">
                  <h3 className="text-blue-400 font-medium mb-2 flex items-center">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Instructions
                  </h3>
                  <p className="text-customgreys-dirtyGrey">{quiz.instructions}</p>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-customgreys-darkGrey/50 rounded-lg p-4 text-center">
                <Target className="w-6 h-6 text-primary-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{quiz.questions.length}</div>
                <div className="text-sm text-customgreys-dirtyGrey">Questions</div>
              </div>
              
              <div className="bg-customgreys-darkGrey/50 rounded-lg p-4 text-center">
                <Trophy className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{quiz.totalPoints}</div>
                <div className="text-sm text-customgreys-dirtyGrey">Total Points</div>
              </div>
              
              <div className="bg-customgreys-darkGrey/50 rounded-lg p-4 text-center">
                {quiz.settings.timeLimit ? (
                  <>
                    <Timer className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{quiz.settings.timeLimit}</div>
                    <div className="text-sm text-customgreys-dirtyGrey">Minutes</div>
                  </>
                ) : (
                  <>
                    <Clock className="w-6 h-6 text-green-500 mx-auto mb-2" />
                    <div className="text-lg font-bold text-white">No Limit</div>
                    <div className="text-sm text-customgreys-dirtyGrey">Take your time</div>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <Button variant="outline" onClick={onExit} className="bg-transparent border-customgreys-darkGrey">
                Cancel
              </Button>
              
              <Button 
                onClick={startQuiz} 
                disabled={isLoading}
                className="bg-primary-600 hover:bg-primary-700 px-8"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Starting...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Start Quiz
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className={cn("max-w-4xl mx-auto", className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Quiz Header */}
      <Card className="bg-customgreys-secondarybg border-customgreys-darkGrey/50 mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-bold text-white">{quiz.title}</h2>
              <Badge className={getDifficultyColor(currentQuestion.difficulty)}>
                {currentQuestion.difficulty}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              {timeRemaining !== null && (
                <div className={cn(
                  "flex items-center space-x-2 px-3 py-1 rounded-full",
                  timeRemaining < 300 ? "bg-red-500/20 text-red-400" : "bg-customgreys-darkGrey text-customgreys-dirtyGrey"
                )}>
                  <Timer className="w-4 h-4" />
                  <span className="font-mono text-sm">{formatTime(timeRemaining)}</span>
                </div>
              )}
              
              <div className="text-sm text-customgreys-dirtyGrey">
                Question {currentQuestionIndex + 1} of {quiz.questions.length}
              </div>
            </div>
          </div>
          
          <Progress value={progress} className="h-2 bg-customgreys-darkGrey" />
        </CardContent>
      </Card>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-customgreys-secondarybg border-customgreys-darkGrey/50 mb-6">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold">
                      {currentQuestionIndex + 1}
                    </div>
                    <div className="text-sm text-customgreys-dirtyGrey">
                      {currentQuestion.points} {currentQuestion.points === 1 ? 'point' : 'points'}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-medium text-white leading-relaxed">
                    {currentQuestion.question}
                  </h3>
                </div>
                
                {currentQuestion.hints && currentQuestion.hints.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={showQuestionHint}
                    disabled={showHint}
                    className="bg-transparent border-customgreys-darkGrey text-customgreys-dirtyGrey hover:text-white"
                  >
                    <Lightbulb className="w-4 h-4 mr-2" />
                    Hint
                  </Button>
                )}
              </div>

              {showHint && currentQuestion.hints && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg"
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-yellow-500" />
                    <span className="text-yellow-400 font-medium">Hint</span>
                  </div>
                  <p className="text-customgreys-dirtyGrey">
                    {currentQuestion.hints[Math.min((hintsUsed[currentQuestion.questionId] || 1) - 1, currentQuestion.hints.length - 1)]}
                  </p>
                </motion.div>
              )}
            </CardHeader>
            
            <CardContent>
              {renderQuestionInput()}
              
              {questionFeedback[currentQuestion.questionId] && quiz.settings.showResultsImmediately && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "mt-4 p-3 rounded-lg border",
                    questionFeedback[currentQuestion.questionId].isCorrect
                      ? "bg-green-500/10 border-green-500/20"
                      : "bg-red-500/10 border-red-500/20"
                  )}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    {questionFeedback[currentQuestion.questionId].isCorrect ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span className={cn(
                      "font-medium",
                      questionFeedback[currentQuestion.questionId].isCorrect ? "text-green-400" : "text-red-400"
                    )}>
                      {questionFeedback[currentQuestion.questionId].isCorrect ? "Correct!" : "Incorrect"}
                    </span>
                  </div>
                  {questionFeedback[currentQuestion.questionId].explanation && (
                    <p className="text-customgreys-dirtyGrey">
                      {questionFeedback[currentQuestion.questionId].explanation}
                    </p>
                  )}
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <Card className="bg-customgreys-secondarybg border-customgreys-darkGrey/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={goToPreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className="bg-transparent border-customgreys-darkGrey"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-customgreys-dirtyGrey">
                {Object.keys(answers).length} of {quiz.questions.length} answered
              </span>
            </div>
            
            {isLastQuestion ? (
              <Button
                onClick={goToNextQuestion}
                className="bg-green-600 hover:bg-green-700"
              >
                <Flag className="w-4 h-4 mr-2" />
                Finish Quiz
              </Button>
            ) : (
              <Button
                onClick={goToNextQuestion}
                className="bg-primary-600 hover:bg-primary-700"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-customgreys-secondarybg rounded-xl p-6 max-w-md w-full border border-customgreys-darkGrey"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Flag className="w-8 h-8 text-green-500" />
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2">Submit Quiz?</h3>
                <p className="text-customgreys-dirtyGrey mb-6">
                  Are you sure you want to submit your quiz? You have answered{" "}
                  <span className="text-white font-medium">{Object.keys(answers).length}</span> out of{" "}
                  <span className="text-white font-medium">{quiz.questions.length}</span> questions.
                </p>
                
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowConfirmation(false)}
                    className="flex-1 bg-transparent border-customgreys-darkGrey"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={completeQuiz}
                    disabled={isSubmitting}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Quiz"
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default QuizPlayer; 