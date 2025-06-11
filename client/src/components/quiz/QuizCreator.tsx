"use client";

import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Trash2, 
  Eye, 
  Settings, 
  Clock, 
  Shuffle, 
  CheckCircle, 
  Target,
  Save,
  FileText,
  HelpCircle,
  Lightbulb,
  Brain,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Copy,
  Zap,
  BookOpen,
  GraduationCap,
  Trophy,
  Timer
} from "lucide-react";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";
import { useCreateQuizMutation } from "@/state/api";
import { v4 as uuidv4 } from "uuid";

interface QuizOption {
  optionId: string;
  text: string;
  isCorrect: boolean;
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

interface QuizSettings {
  timeLimit?: number;
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
  showResultsImmediately?: boolean;
  allowRetake?: boolean;
  maxAttempts?: number;
  passingScore?: number;
  showCorrectAnswers?: boolean;
  showExplanations?: boolean;
}

interface QuizCreatorProps {
  courseId: string;
  sectionId: string;
  chapterId: string;
  onSave: (quiz: any) => void;
  onCancel: () => void;
  className?: string;
}

const QuizCreator: React.FC<QuizCreatorProps> = ({
  courseId,
  sectionId,
  chapterId,
  onSave,
  onCancel,
  className
}) => {
  // Quiz basic info
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [instructions, setInstructions] = useState<string>("");
  
  // Quiz questions
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  
  // Quiz settings
  const [settings, setSettings] = useState<QuizSettings>({
    timeLimit: 30,
    shuffleQuestions: false,
    shuffleOptions: true,
    showResultsImmediately: true,
    allowRetake: true,
    maxAttempts: 3,
    passingScore: 70,
    showCorrectAnswers: true,
    showExplanations: true,
  });
  
  // UI state
  const [activeTab, setActiveTab] = useState<"questions" | "settings" | "preview">("questions");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  const [createQuiz] = useCreateQuizMutation();

  // Create new question
  const createNewQuestion = useCallback((type: QuizQuestion['type'] = "multiple-choice") => {
    const newQuestion: QuizQuestion = {
      questionId: uuidv4(),
      type,
      question: "",
      points: 1,
      difficulty: "medium",
      options: type === "multiple-choice" ? [
        { optionId: uuidv4(), text: "", isCorrect: false },
        { optionId: uuidv4(), text: "", isCorrect: false },
        { optionId: uuidv4(), text: "", isCorrect: false },
        { optionId: uuidv4(), text: "", isCorrect: false },
      ] : type === "true-false" ? [
        { optionId: "true", text: "True", isCorrect: false },
        { optionId: "false", text: "False", isCorrect: false },
      ] : undefined,
      correctAnswer: type === "fill-in-blank" || type === "short-answer" ? "" : undefined,
      hints: [],
    };
    return newQuestion;
  }, []);

  // Add new question
  const addQuestion = useCallback((type: QuizQuestion['type'] = "multiple-choice") => {
    const newQuestion = createNewQuestion(type);
    setQuestions(prev => [...prev, newQuestion]);
    setCurrentQuestionIndex(questions.length);
  }, [questions.length, createNewQuestion]);

  // Update question
  const updateQuestion = useCallback((index: number, updates: Partial<QuizQuestion>) => {
    setQuestions(prev => prev.map((q, i) => i === index ? { ...q, ...updates } : q));
  }, []);

  // Delete question
  const deleteQuestion = useCallback((index: number) => {
    setQuestions(prev => prev.filter((_, i) => i !== index));
    if (currentQuestionIndex >= questions.length - 1) {
      setCurrentQuestionIndex(Math.max(0, questions.length - 2));
    }
  }, [currentQuestionIndex, questions.length]);

  // Move question
  const moveQuestion = useCallback((index: number, direction: "up" | "down") => {
    if (direction === "up" && index > 0) {
      setQuestions(prev => {
        const newQuestions = [...prev];
        [newQuestions[index - 1], newQuestions[index]] = [newQuestions[index], newQuestions[index - 1]];
        return newQuestions;
      });
      setCurrentQuestionIndex(index - 1);
    } else if (direction === "down" && index < questions.length - 1) {
      setQuestions(prev => {
        const newQuestions = [...prev];
        [newQuestions[index], newQuestions[index + 1]] = [newQuestions[index + 1], newQuestions[index]];
        return newQuestions;
      });
      setCurrentQuestionIndex(index + 1);
    }
  }, [questions.length]);

  // Duplicate question
  const duplicateQuestion = useCallback((index: number) => {
    const questionToDuplicate = questions[index];
    const duplicatedQuestion: QuizQuestion = {
      ...questionToDuplicate,
      questionId: uuidv4(),
      question: `${questionToDuplicate.question} (Copy)`,
      options: questionToDuplicate.options?.map(opt => ({ ...opt, optionId: uuidv4() })),
    };
    setQuestions(prev => [
      ...prev.slice(0, index + 1),
      duplicatedQuestion,
      ...prev.slice(index + 1)
    ]);
  }, [questions]);

  // Update option
  const updateOption = useCallback((questionIndex: number, optionIndex: number, updates: Partial<QuizOption>) => {
    setQuestions(prev => prev.map((q, qi) => {
      if (qi === questionIndex) {
        return {
          ...q,
          options: q.options?.map((opt, oi) => oi === optionIndex ? { ...opt, ...updates } : opt)
        };
      }
      return q;
    }));
  }, []);

  // Add option
  const addOption = useCallback((questionIndex: number) => {
    const newOption: QuizOption = {
      optionId: uuidv4(),
      text: "",
      isCorrect: false,
    };
    setQuestions(prev => prev.map((q, qi) => {
      if (qi === questionIndex) {
        return {
          ...q,
          options: [...(q.options || []), newOption]
        };
      }
      return q;
    }));
  }, []);

  // Remove option
  const removeOption = useCallback((questionIndex: number, optionIndex: number) => {
    setQuestions(prev => prev.map((q, qi) => {
      if (qi === questionIndex) {
        return {
          ...q,
          options: q.options?.filter((_, oi) => oi !== optionIndex)
        };
      }
      return q;
    }));
  }, []);

  // Set correct answer for multiple choice
  const setCorrectAnswer = useCallback((questionIndex: number, optionIndex: number) => {
    setQuestions(prev => prev.map((q, qi) => {
      if (qi === questionIndex) {
        return {
          ...q,
          options: q.options?.map((opt, oi) => ({ ...opt, isCorrect: oi === optionIndex }))
        };
      }
      return q;
    }));
  }, []);

  // Add hint
  const addHint = useCallback((questionIndex: number) => {
    setQuestions(prev => prev.map((q, qi) => {
      if (qi === questionIndex) {
        return {
          ...q,
          hints: [...(q.hints || []), ""]
        };
      }
      return q;
    }));
  }, []);

  // Update hint
  const updateHint = useCallback((questionIndex: number, hintIndex: number, hint: string) => {
    setQuestions(prev => prev.map((q, qi) => {
      if (qi === questionIndex) {
        return {
          ...q,
          hints: q.hints?.map((h, hi) => hi === hintIndex ? hint : h)
        };
      }
      return q;
    }));
  }, []);

  // Remove hint
  const removeHint = useCallback((questionIndex: number, hintIndex: number) => {
    setQuestions(prev => prev.map((q, qi) => {
      if (qi === questionIndex) {
        return {
          ...q,
          hints: q.hints?.filter((_, hi) => hi !== hintIndex)
        };
      }
      return q;
    }));
  }, []);

  // Validate quiz
  const validateQuiz = useCallback(() => {
    if (!title.trim()) {
      toast.error("Quiz title is required");
      return false;
    }

    if (questions.length === 0) {
      toast.error("At least one question is required");
      return false;
    }

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      
      if (!question.question.trim()) {
        toast.error(`Question ${i + 1} text is required`);
        return false;
      }

      if (question.type === "multiple-choice") {
        if (!question.options || question.options.length < 2) {
          toast.error(`Question ${i + 1} must have at least 2 options`);
          return false;
        }

        const hasCorrectAnswer = question.options.some(opt => opt.isCorrect);
        if (!hasCorrectAnswer) {
          toast.error(`Question ${i + 1} must have at least one correct answer`);
          return false;
        }

        const emptyOptions = question.options.filter(opt => !opt.text.trim());
        if (emptyOptions.length > 0) {
          toast.error(`Question ${i + 1} has empty options`);
          return false;
        }
      }

      if (question.type === "true-false") {
        const hasCorrectAnswer = question.options?.some(opt => opt.isCorrect);
        if (!hasCorrectAnswer) {
          toast.error(`Question ${i + 1} must have a correct answer selected`);
          return false;
        }
      }

      if ((question.type === "fill-in-blank" || question.type === "short-answer") && !question.correctAnswer?.trim()) {
        toast.error(`Question ${i + 1} must have a correct answer`);
        return false;
      }
    }

    return true;
  }, [title, questions]);

  // Save quiz
  const saveQuiz = useCallback(async () => {
    if (!validateQuiz()) return;

    setIsLoading(true);
    try {
      const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
      
      const quizData = {
        courseId,
        sectionId,
        chapterId,
        title: title.trim(),
        description: description.trim() || undefined,
        instructions: instructions.trim() || undefined,
        questions,
        settings
      };

      const result = await createQuiz(quizData).unwrap();
      
      toast.success("Quiz created successfully! 🎉");
      onSave(result);
    } catch (error: any) {
      console.error("Error creating quiz:", error);
      toast.error(error?.data?.message || "Failed to create quiz");
    } finally {
      setIsLoading(false);
    }
  }, [validateQuiz, courseId, sectionId, chapterId, title, description, instructions, questions, settings, createQuiz, onSave]);

  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "text-green-500 bg-green-500/10 border-green-500/20";
      case "medium": return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
      case "hard": return "text-red-500 bg-red-500/10 border-red-500/20";
      default: return "text-gray-500 bg-gray-500/10 border-gray-500/20";
    }
  };

  // Get question type label
  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case "multiple-choice": return "Multiple Choice";
      case "true-false": return "True/False";
      case "fill-in-blank": return "Fill in the Blank";
      case "short-answer": return "Short Answer";
      default: return type;
    }
  };

  // Render question editor
  const renderQuestionEditor = () => {
    const question = questions[currentQuestionIndex];
    if (!question) return null;

    return (
      <motion.div
        key={question.questionId}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Question Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold">
              {currentQuestionIndex + 1}
            </div>
            <Select 
              value={question.type} 
              onValueChange={(type: any) => updateQuestion(currentQuestionIndex, { type })}
            >
              <SelectTrigger className="w-40 bg-customgreys-darkGrey border-customgreys-dirtyGrey">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                <SelectItem value="true-false">True/False</SelectItem>
                <SelectItem value="fill-in-blank">Fill in Blank</SelectItem>
                <SelectItem value="short-answer">Short Answer</SelectItem>
              </SelectContent>
            </Select>
            <Badge className={getDifficultyColor(question.difficulty)}>
              {question.difficulty}
            </Badge>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => moveQuestion(currentQuestionIndex, "up")}
              disabled={currentQuestionIndex === 0}
              className="bg-transparent border-customgreys-darkGrey"
            >
              <ArrowUp className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => moveQuestion(currentQuestionIndex, "down")}
              disabled={currentQuestionIndex === questions.length - 1}
              className="bg-transparent border-customgreys-darkGrey"
            >
              <ArrowDown className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => duplicateQuestion(currentQuestionIndex)}
              className="bg-transparent border-customgreys-darkGrey"
            >
              <Copy className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => deleteQuestion(currentQuestionIndex)}
              className="bg-transparent border-red-500 text-red-400 hover:bg-red-500/10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Question Text */}
        <div className="space-y-2">
          <Label className="text-white">Question</Label>
          <Textarea
            value={question.question}
            onChange={(e) => updateQuestion(currentQuestionIndex, { question: e.target.value })}
            placeholder="Enter your question here..."
            className="bg-customgreys-darkGrey border-customgreys-dirtyGrey text-white min-h-24"
          />
        </div>

        {/* Question Settings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-white">Points</Label>
            <Input
              type="number"
              value={question.points}
              onChange={(e) => updateQuestion(currentQuestionIndex, { points: parseInt(e.target.value) || 1 })}
              min={1}
              max={10}
              className="bg-customgreys-darkGrey border-customgreys-dirtyGrey text-white"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-white">Difficulty</Label>
            <Select 
              value={question.difficulty} 
              onValueChange={(difficulty: any) => updateQuestion(currentQuestionIndex, { difficulty })}
            >
              <SelectTrigger className="bg-customgreys-darkGrey border-customgreys-dirtyGrey">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-white">Time Limit (seconds)</Label>
            <Input
              type="number"
              value={question.timeLimit || ""}
              onChange={(e) => updateQuestion(currentQuestionIndex, { 
                timeLimit: e.target.value ? parseInt(e.target.value) : undefined 
              })}
              placeholder="No limit"
              className="bg-customgreys-darkGrey border-customgreys-dirtyGrey text-white"
            />
          </div>
        </div>

        {/* Question Options */}
        {(question.type === "multiple-choice" || question.type === "true-false") && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-white">Answer Options</Label>
              {question.type === "multiple-choice" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addOption(currentQuestionIndex)}
                  className="bg-transparent border-customgreys-darkGrey"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Option
                </Button>
              )}
            </div>

            <div className="space-y-3">
              {question.options?.map((option, optionIndex) => (
                <motion.div
                  key={option.optionId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn(
                    "flex items-center space-x-3 p-3 rounded-lg border-2",
                    option.isCorrect 
                      ? "border-green-500 bg-green-500/10" 
                      : "border-customgreys-darkGrey bg-customgreys-darkGrey/30"
                  )}
                >
                  <div className="flex-1 flex items-center space-x-3">
                    <div
                      className={cn(
                        "w-6 h-6 rounded-full border-2 cursor-pointer flex items-center justify-center",
                        option.isCorrect ? "border-green-500 bg-green-500" : "border-customgreys-dirtyGrey"
                      )}
                      onClick={() => setCorrectAnswer(currentQuestionIndex, optionIndex)}
                    >
                      {option.isCorrect && <CheckCircle className="w-4 h-4 text-white" />}
                    </div>
                    
                    <Input
                      value={option.text}
                      onChange={(e) => updateOption(currentQuestionIndex, optionIndex, { text: e.target.value })}
                      placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                      className="flex-1 bg-transparent border-none text-white"
                      disabled={question.type === "true-false"}
                    />
                  </div>

                  {question.type === "multiple-choice" && question.options && question.options.length > 2 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeOption(currentQuestionIndex, optionIndex)}
                      className="bg-transparent border-red-500 text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Fill in blank / Short answer */}
        {(question.type === "fill-in-blank" || question.type === "short-answer") && (
          <div className="space-y-2">
            <Label className="text-white">Correct Answer</Label>
            <Input
              value={question.correctAnswer || ""}
              onChange={(e) => updateQuestion(currentQuestionIndex, { correctAnswer: e.target.value })}
              placeholder="Enter the correct answer..."
              className="bg-customgreys-darkGrey border-customgreys-dirtyGrey text-white"
            />
          </div>
        )}

        {/* Explanation */}
        <div className="space-y-2">
          <Label className="text-white">Explanation (Optional)</Label>
          <Textarea
            value={question.explanation || ""}
            onChange={(e) => updateQuestion(currentQuestionIndex, { explanation: e.target.value })}
            placeholder="Explain why this is the correct answer..."
            className="bg-customgreys-darkGrey border-customgreys-dirtyGrey text-white"
          />
        </div>

        {/* Hints */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-white">Hints (Optional)</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addHint(currentQuestionIndex)}
              className="bg-transparent border-customgreys-darkGrey"
            >
              <Lightbulb className="w-4 h-4 mr-2" />
              Add Hint
            </Button>
          </div>

          {question.hints && question.hints.length > 0 && (
            <div className="space-y-3">
              {question.hints.map((hint, hintIndex) => (
                <div key={hintIndex} className="flex items-center space-x-3">
                  <Input
                    value={hint}
                    onChange={(e) => updateHint(currentQuestionIndex, hintIndex, e.target.value)}
                    placeholder={`Hint ${hintIndex + 1}`}
                    className="flex-1 bg-customgreys-darkGrey border-customgreys-dirtyGrey text-white"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeHint(currentQuestionIndex, hintIndex)}
                    className="bg-transparent border-red-500 text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  // Render settings tab
  const renderSettings = () => {
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-white">Quiz Settings</h3>
        
        {/* Time Settings */}
        <Card className="bg-customgreys-darkGrey/50 border-customgreys-darkGrey">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Time Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-white">Enable Time Limit</Label>
              <Switch
                checked={!!settings.timeLimit}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ 
                    ...prev, 
                    timeLimit: checked ? 30 : undefined 
                  }))
                }
              />
            </div>
            
            {settings.timeLimit && (
              <div className="space-y-2">
                <Label className="text-white">Time Limit: {settings.timeLimit} minutes</Label>
                <Slider
                  value={[settings.timeLimit]}
                  onValueChange={([value]) => setSettings(prev => ({ ...prev, timeLimit: value }))}
                  min={5}
                  max={180}
                  step={5}
                  className="w-full"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Question Settings */}
        <Card className="bg-customgreys-darkGrey/50 border-customgreys-darkGrey">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Shuffle className="w-5 h-5 mr-2" />
              Question Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-white">Shuffle Questions</Label>
              <Switch
                checked={settings.shuffleQuestions}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, shuffleQuestions: checked }))
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label className="text-white">Shuffle Answer Options</Label>
              <Switch
                checked={settings.shuffleOptions}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, shuffleOptions: checked }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Scoring Settings */}
        <Card className="bg-customgreys-darkGrey/50 border-customgreys-darkGrey">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Target className="w-5 h-5 mr-2" />
              Scoring Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-white">Passing Score: {settings.passingScore}%</Label>
              <Slider
                value={[settings.passingScore || 70]}
                onValueChange={([value]) => setSettings(prev => ({ ...prev, passingScore: value }))}
                min={0}
                max={100}
                step={5}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        {/* Attempt Settings */}
        <Card className="bg-customgreys-darkGrey/50 border-customgreys-darkGrey">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Trophy className="w-5 h-5 mr-2" />
              Attempt Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-white">Allow Retakes</Label>
              <Switch
                checked={settings.allowRetake}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, allowRetake: checked }))
                }
              />
            </div>
            
            {settings.allowRetake && (
              <div className="space-y-2">
                <Label className="text-white">Maximum Attempts: {settings.maxAttempts}</Label>
                <Slider
                  value={[settings.maxAttempts || 3]}
                  onValueChange={([value]) => setSettings(prev => ({ ...prev, maxAttempts: value }))}
                  min={1}
                  max={10}
                  step={1}
                  className="w-full"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Feedback Settings */}
        <Card className="bg-customgreys-darkGrey/50 border-customgreys-darkGrey">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Eye className="w-5 h-5 mr-2" />
              Feedback Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-white">Show Results Immediately</Label>
              <Switch
                checked={settings.showResultsImmediately}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, showResultsImmediately: checked }))
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label className="text-white">Show Correct Answers</Label>
              <Switch
                checked={settings.showCorrectAnswers}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, showCorrectAnswers: checked }))
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label className="text-white">Show Explanations</Label>
              <Switch
                checked={settings.showExplanations}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, showExplanations: checked }))
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <motion.div 
      className={cn("max-w-6xl mx-auto", className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <Card className="bg-customgreys-secondarybg border-customgreys-darkGrey/50 mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-primary-500" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-white">Create Quiz</CardTitle>
                <p className="text-customgreys-dirtyGrey">Design an engaging quiz for your students</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={onCancel}
                className="bg-transparent border-customgreys-darkGrey"
              >
                Cancel
              </Button>
              <Button
                onClick={saveQuiz}
                disabled={isLoading || !title.trim() || questions.length === 0}
                className="bg-primary-600 hover:bg-primary-700"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Quiz
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar - Quiz Info & Questions List */}
        <div className="lg:col-span-1 space-y-4">
          {/* Quiz Basic Info */}
          <Card className="bg-customgreys-secondarybg border-customgreys-darkGrey/50">
            <CardHeader>
              <CardTitle className="text-white">Quiz Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white">Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Quiz title..."
                  className="bg-customgreys-darkGrey border-customgreys-dirtyGrey text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-white">Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Quiz description..."
                  className="bg-customgreys-darkGrey border-customgreys-dirtyGrey text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-white">Instructions</Label>
                <Textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Instructions for students..."
                  className="bg-customgreys-darkGrey border-customgreys-dirtyGrey text-white"
                />
              </div>
            </CardContent>
          </Card>

          {/* Questions List */}
          <Card className="bg-customgreys-secondarybg border-customgreys-darkGrey/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Questions ({questions.length})</CardTitle>
                <div className="flex space-x-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addQuestion("multiple-choice")}
                    className="bg-transparent border-customgreys-darkGrey"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {questions.map((question, index) => (
                  <motion.div
                    key={question.questionId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={cn(
                      "p-3 rounded-lg border-2 cursor-pointer transition-all",
                      index === currentQuestionIndex
                        ? "border-primary-500 bg-primary-500/10"
                        : "border-customgreys-darkGrey bg-customgreys-darkGrey/30 hover:bg-customgreys-darkGrey/50"
                    )}
                    onClick={() => setCurrentQuestionIndex(index)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-white text-sm font-medium truncate">
                            {question.question || "Untitled Question"}
                          </p>
                          <p className="text-customgreys-dirtyGrey text-xs">
                            {getQuestionTypeLabel(question.type)} • {question.points} pts
                          </p>
                        </div>
                      </div>
                      <Badge className={getDifficultyColor(question.difficulty)} variant="outline">
                        {question.difficulty[0].toUpperCase()}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
                
                {questions.length === 0 && (
                  <div className="text-center py-8 text-customgreys-dirtyGrey">
                    <HelpCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No questions yet</p>
                    <p className="text-sm">Click + to add your first question</p>
                  </div>
                )}
              </div>
              
              {/* Add Question Buttons */}
              <div className="mt-4 space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addQuestion("multiple-choice")}
                  className="w-full bg-transparent border-customgreys-darkGrey text-left justify-start"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Multiple Choice
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addQuestion("true-false")}
                  className="w-full bg-transparent border-customgreys-darkGrey text-left justify-start"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  True/False
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addQuestion("fill-in-blank")}
                  className="w-full bg-transparent border-customgreys-darkGrey text-left justify-start"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Fill in Blank
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addQuestion("short-answer")}
                  className="w-full bg-transparent border-customgreys-darkGrey text-left justify-start"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Short Answer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          {/* Tabs */}
          <div className="flex space-x-2 mb-6">
            <Button
              variant={activeTab === "questions" ? "default" : "outline"}
              onClick={() => setActiveTab("questions")}
              className={cn(
                activeTab === "questions" 
                  ? "bg-primary-600 text-white" 
                  : "bg-transparent border-customgreys-darkGrey text-customgreys-dirtyGrey"
              )}
            >
              <FileText className="w-4 h-4 mr-2" />
              Questions
            </Button>
            <Button
              variant={activeTab === "settings" ? "default" : "outline"}
              onClick={() => setActiveTab("settings")}
              className={cn(
                activeTab === "settings" 
                  ? "bg-primary-600 text-white" 
                  : "bg-transparent border-customgreys-darkGrey text-customgreys-dirtyGrey"
              )}
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>

          {/* Content */}
          <Card className="bg-customgreys-secondarybg border-customgreys-darkGrey/50">
            <CardContent className="p-6">
              <AnimatePresence mode="wait">
                {activeTab === "questions" && (
                  <motion.div
                    key="questions"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    {questions.length > 0 ? renderQuestionEditor() : (
                      <div className="text-center py-12">
                        <Brain className="w-16 h-16 mx-auto mb-4 text-customgreys-dirtyGrey opacity-50" />
                        <h3 className="text-xl font-bold text-white mb-2">Start Creating Your Quiz</h3>
                        <p className="text-customgreys-dirtyGrey mb-6">
                          Add questions using the buttons in the sidebar to get started
                        </p>
                        <Button
                          onClick={() => addQuestion("multiple-choice")}
                          className="bg-primary-600 hover:bg-primary-700"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add First Question
                        </Button>
                      </div>
                    )}
                  </motion.div>
                )}
                
                {activeTab === "settings" && (
                  <motion.div
                    key="settings"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    {renderSettings()}
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};

export default QuizCreator; 