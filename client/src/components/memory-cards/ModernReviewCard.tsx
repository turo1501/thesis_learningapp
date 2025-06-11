"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ThumbsUp, 
  ThumbsDown, 
  Brain, 
  ArrowRight,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  XCircle,
  Rotate3D,
  Zap,
  Star,
  Lightbulb,
  Timer,
  BadgeCheck,
  Volume2,
  AlertTriangle,
  Award,
  Target,
  TrendingUp,
  Flame,
  Trophy,
  Eye,
  Clock,
  BarChart2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MemoryCard } from "@/state/api";
import { cn } from "@/lib/utils";
import { Confetti } from '@/components/ui/Confetti';
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface ModernReviewCardProps {
  card: MemoryCard;
  onRate: (difficultyRating: number) => void;
  isSubmitting: boolean;
  totalRemaining: number;
  currentPosition: number;
  sessionStats?: {
    correct: number;
    incorrect: number;
    streak: number;
    averageTime: number;
  };
}

const ModernReviewCard: React.FC<ModernReviewCardProps> = ({
  card,
  onRate,
  isSubmitting,
  totalRemaining,
  currentPosition,
  sessionStats,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [isAIGenerated, setIsAIGenerated] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPerformanceTip, setShowPerformanceTip] = useState(false);
  const [confidenceLevel, setConfidenceLevel] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Enhanced reset when card changes
  useEffect(() => {
    setIsFlipped(false);
    setSelectedRating(null);
    setError(null);
    setShowHint(false);
    setResponseTime(null);
    setConfidenceLevel(null);
    setShowPerformanceTip(false);
    setStartTime(Date.now());
    
    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    // Enhanced AI generation detection
    setIsAIGenerated(!!card?.aiGenerated || detectAIGenerated());
  }, [card?.cardId]);
  
  // Enhanced AI detection
  const detectAIGenerated = () => {
    if (!card) return false;
    
    const question = card.question?.toLowerCase() || '';
    const answer = card.answer?.toLowerCase() || '';
    
    const aiPatterns = [
      /explain\s+(in\s+detail|the\s+concept|how)/,
      /what\s+is\s+meant\s+by/,
      /define\s+(and\s+explain|the\s+term)/,
      /describe\s+the\s+(process|concept|relationship)/,
      /compare\s+and\s+contrast/,
      /analyze\s+the/
    ];
    
    const hasAiQuestionPattern = aiPatterns.some(pattern => pattern.test(question));
    const hasComplexAnswer = answer.length > 100 && 
      (answer.includes('refers to') || answer.includes('is a type of') || answer.includes('can be defined as'));
    
    return hasAiQuestionPattern && hasComplexAnswer;
  };

  // Show hint after 30 seconds if not flipped
  useEffect(() => {
    if (!isFlipped && !showHint) {
      timerRef.current = setTimeout(() => {
        setShowHint(true);
        toast("💡 Need a hint? Take your time to think through the answer!", {
          duration: 3000,
          position: "top-center"
        });
      }, 30000);
    }
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isFlipped, showHint]);

  // Enhanced validation
  useEffect(() => {
    if (!card) {
      setError("Card data is missing");
      return;
    }
    
    if (!card.question?.trim()) {
      setError("Card is missing a question");
      return;
    }
    
    if (!card.answer?.trim()) {
      setError("Card is missing an answer");
      return;
    }
    
    if (!card.cardId) {
      setError("Card is missing a cardId");
      return;
    }
    
    setError(null);
  }, [card]);

  // Enhanced confetti for excellent performance
  useEffect(() => {
    if (selectedRating !== null && selectedRating >= 4) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [selectedRating]);

  // Text-to-speech functionality
  const handlePlayAudio = (text: string, rate: number = 0.8) => {
    if (isPlaying) return;
    
    if ('speechSynthesis' in window) {
      setIsPlaying(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => {
        setIsPlaying(false);
        toast.error("Speech synthesis not available");
      };
      
      speechSynthesis.speak(utterance);
    } else {
      toast.error("Text-to-speech not supported in this browser");
    }
  };

  const handleFlip = () => {
    if (error) return;
    
    if (!isFlipped) {
      // Record response time when card is flipped to see answer
      const timeTaken = Date.now() - startTime;
      setResponseTime(timeTaken);
      
      // Show performance tip based on response time
      if (timeTaken < 5000) {
        setShowPerformanceTip(true);
        toast.success("⚡ Quick thinking! That was fast!", { position: "top-center", duration: 2000 });
      } else if (timeTaken > 30000) {
        toast("🤔 Take your time - deep thinking leads to better learning!", { position: "top-center", duration: 2000 });
      }
    }
    setIsFlipped(!isFlipped);
  };

  const handleRateCard = (difficultyRating: number) => {
    if (!card || error) {
      console.error("Cannot rate card due to error or missing data", { error, hasCard: !!card });
      return;
    }
    
    try {
      console.log(`Rating card ${card.cardId} with difficulty ${difficultyRating}`);
      setSelectedRating(difficultyRating);
      onRate(difficultyRating);
      
      // Enhanced feedback based on rating and performance
      const messages = {
        1: { text: "Don't worry! Repetition is key to mastery 💪", icon: "🔄" },
        2: { text: "Getting better! Keep practicing this concept 📚", icon: "📈" },
        3: { text: "Good job! You're making solid progress 👍", icon: "✅" },
        4: { text: "Excellent! You've got this concept down 🌟", icon: "⭐" },
        5: { text: "Perfect! This knowledge is locked in! 🎯", icon: "🏆" }
      };

      const message = messages[difficultyRating as keyof typeof messages] || messages[3];
      
      toast.success(message.text, { 
        position: "top-center",
        duration: 2000,
        icon: message.icon
      });
      
    } catch (err) {
      console.error("Error rating card:", err);
      setError("Failed to submit your rating. Please try again.");
    }
  };

  // Confidence level handler
  const handleConfidenceSelect = (level: number) => {
    setConfidenceLevel(level);
  };

  // Format response time
  const formatResponseTime = (ms: number | null) => {
    if (ms === null) return null;
    return (ms / 1000).toFixed(1);
  };

  // Enhanced difficulty display
  const getDifficultyInfo = () => {
    if (!card?.difficultyLevel) return null;
    
    const difficultyMap = {
      1: { label: "Beginner", color: "bg-green-100 text-green-800 border-green-200", icon: "🟢" },
      2: { label: "Intermediate", color: "bg-blue-100 text-blue-800 border-blue-200", icon: "🔵" },
      3: { label: "Advanced", color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: "🟡" },
      4: { label: "Expert", color: "bg-orange-100 text-orange-800 border-orange-200", icon: "🟠" },
      5: { label: "Master", color: "bg-red-100 text-red-800 border-red-200", icon: "🔴" }
    };
    
    return difficultyMap[card.difficultyLevel as keyof typeof difficultyMap] || difficultyMap[3];
  };

  const difficultyInfo = getDifficultyInfo();

  // Enhanced rating options with better UX
  const ratings = [
    { 
      label: "Again", 
      value: 1, 
      color: "bg-gradient-to-br from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white shadow-lg", 
      icon: <RefreshCw className="mr-2 h-4 w-4" />,
      description: "I need to see this again soon",
      shortcut: "1"
    },
    { 
      label: "Hard", 
      value: 2, 
      color: "bg-gradient-to-br from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg", 
      icon: <ThumbsDown className="mr-2 h-4 w-4" />,
      description: "Difficult, but I got it eventually",
      shortcut: "2"
    },
    { 
      label: "Good", 
      value: 3, 
      color: "bg-gradient-to-br from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white shadow-lg", 
      icon: <CheckCircle2 className="mr-2 h-4 w-4" />,
      description: "Correct with some effort",
      shortcut: "3"
    },
    { 
      label: "Easy", 
      value: 4, 
      color: "bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg", 
      icon: <ThumbsUp className="mr-2 h-4 w-4" />,
      description: "I knew this well",
      shortcut: "4"
    },
    { 
      label: "Perfect", 
      value: 5, 
      color: "bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg", 
      icon: <Trophy className="mr-2 h-4 w-4" />,
      description: "Effortless and immediate recall",
      shortcut: "5"
    },
  ];

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!isFlipped) {
        if (event.code === 'Space' || event.key === ' ') {
          event.preventDefault();
          handleFlip();
        }
      } else {
        const num = parseInt(event.key);
        if (num >= 1 && num <= 5) {
          event.preventDefault();
          handleRateCard(num);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isFlipped, card]);

  // Progress calculation
  const progressPercentage = totalRemaining > 0 ? (currentPosition / totalRemaining) * 100 : 0;

  // Performance indicators
  const getPerformanceIndicator = () => {
    if (!sessionStats) return null;
    
    const { correct, incorrect, streak } = sessionStats;
    const total = correct + incorrect;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
    
    return {
      accuracy,
      streak,
      total,
      isOnFire: streak >= 5,
      isStruggling: accuracy < 60 && total >= 3
    };
  };

  const performance = getPerformanceIndicator();

  if (error) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <Card className="bg-white dark:bg-gray-800 shadow-xl p-8 min-h-[500px] flex flex-col items-center justify-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <XCircle className="h-20 w-20 text-red-500 mb-6 mx-auto" />
            <h3 className="text-2xl font-semibold text-center mb-4">Oops! Something went wrong</h3>
            <p className="text-gray-500 text-center mb-8 max-w-md">{error}</p>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
              className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200 transition-all"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reload Page
            </Button>
          </motion.div>
        </Card>
      </div>
    );
  }

  if (!card?.question || !card?.answer) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <Card className="bg-white dark:bg-gray-800 shadow-xl p-8 min-h-[500px] flex flex-col items-center justify-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <Brain className="h-20 w-20 text-gray-300 mb-6 mx-auto" />
            <h3 className="text-2xl font-semibold text-center mb-4">Card Loading</h3>
            <p className="text-gray-500 text-center mb-6">Please wait while we prepare your next card...</p>
          </motion.div>
        </Card>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <motion.div 
        className="w-full max-w-2xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Enhanced Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Card {currentPosition} of {totalRemaining}
            </span>
            
            {/* Performance indicators */}
            {performance && (
              <div className="flex items-center gap-2">
                {performance.isOnFire && (
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="flex items-center text-orange-500 text-sm font-medium"
                  >
                    <Flame className="h-4 w-4 mr-1" />
                    {performance.streak} streak!
                  </motion.div>
                )}
                
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {performance.accuracy}% accuracy
                </div>
              </div>
            )}
          </div>
          
          <Progress 
            value={progressPercentage} 
            className="h-2 bg-gray-200 dark:bg-gray-700"
          />
        </div>

        {/* Enhanced Card Container */}
        <motion.div
          className="perspective-1000 w-full h-[600px] cursor-pointer"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="relative w-full h-full preserve-3d transition-transform duration-700"
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Question Side */}
            <motion.div
              className={cn(
                "absolute inset-0 backface-hidden rounded-2xl border-2 p-8 overflow-hidden",
                "shadow-2xl flex flex-col justify-between bg-gradient-to-br",
                isAIGenerated 
                  ? "from-white via-indigo-50/30 to-purple-50/30 dark:from-gray-800 dark:via-indigo-950/30 dark:to-purple-950/30 border-indigo-200 dark:border-indigo-800" 
                  : "from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-gray-200 dark:border-gray-700",
                !isFlipped ? "pointer-events-auto" : "pointer-events-none"
              )}
              onClick={handleFlip}
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-blue-100 dark:bg-blue-900/20 px-3 py-2 rounded-full">
                    <Brain className="h-4 w-4 text-blue-600 dark:text-blue-400 mr-2" />
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Question</span>
                  </div>
                  
                  {difficultyInfo && (
                    <div className={cn("px-3 py-2 rounded-full text-xs font-medium border", difficultyInfo.color)}>
                      <span className="mr-1">{difficultyInfo.icon}</span>
                      {difficultyInfo.label}
                    </div>
                  )}
                  
                  {isAIGenerated && (
                    <motion.div
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="flex items-center bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-full px-3 py-2 border border-indigo-200 dark:border-indigo-800"
                    >
                      <Sparkles className="h-4 w-4 text-indigo-500 dark:text-indigo-400 mr-1" />
                      <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300">AI Generated</span>
                    </motion.div>
                  )}
                </div>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayAudio(card.question, 0.9);
                      }}
                      disabled={isPlaying}
                      className="bg-white/80 dark:bg-gray-800/80 shadow-sm"
                    >
                      <Volume2 className={cn("h-4 w-4", isPlaying && "animate-pulse")} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Read Question Aloud</TooltipContent>
                </Tooltip>
              </div>

              {/* Question Content */}
              <div className="flex-grow flex items-center justify-center px-4 py-8">
                <motion.h2 
                  className="text-center text-2xl font-semibold leading-relaxed break-words max-w-full"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {card.question}
                </motion.h2>
              </div>

              {/* Footer */}
              <div className="flex justify-between items-center pt-6 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-4">
                  {showHint && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center text-amber-600 dark:text-amber-400 text-sm bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-full"
                    >
                      <Lightbulb className="h-4 w-4 mr-2" />
                      Take your time to think
                    </motion.div>
                  )}
                  
                  {responseTime && (
                    <div className="flex items-center text-gray-500 text-sm">
                      <Timer className="h-4 w-4 mr-1" />
                      Thinking time: {formatResponseTime(responseTime)}s
                    </div>
                  )}
                </div>
                
                <motion.div 
                  className="flex items-center text-indigo-600 dark:text-indigo-400 text-sm font-medium bg-indigo-50 dark:bg-indigo-900/20 px-4 py-2 rounded-full"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Click to reveal answer
                </motion.div>
              </div>

              {/* Subtle background decoration */}
              {isAIGenerated && (
                <div className="absolute top-4 right-4 opacity-5 pointer-events-none">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="h-24 w-24 text-indigo-500" />
                  </motion.div>
                </div>
              )}
            </motion.div>

            {/* Answer Side */}
            <motion.div
              className={cn(
                "absolute inset-0 backface-hidden rounded-2xl border-2 p-8 overflow-hidden rotateY-180",
                "shadow-2xl flex flex-col justify-between bg-gradient-to-br",
                isAIGenerated 
                  ? "from-green-50 via-emerald-50/30 to-green-50 dark:from-gray-800 dark:via-emerald-950/30 dark:to-gray-800 border-green-200 dark:border-green-800" 
                  : "from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-900 border-green-200 dark:border-green-700",
                isFlipped ? "pointer-events-auto" : "pointer-events-none"
              )}
            >
              {/* Answer Header */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-green-100 dark:bg-green-900/20 px-3 py-2 rounded-full">
                    <Lightbulb className="h-4 w-4 text-green-600 dark:text-green-400 mr-2" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-300">Answer</span>
                  </div>
                  
                  {responseTime && (
                    <div className="flex items-center bg-blue-100 dark:bg-blue-900/20 px-3 py-2 rounded-full">
                      <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400 mr-1" />
                      <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                        {formatResponseTime(responseTime)}s
                      </span>
                    </div>
                  )}
                </div>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayAudio(card.answer, 0.8);
                      }}
                      disabled={isPlaying}
                      className="bg-white/80 dark:bg-gray-800/80 shadow-sm"
                    >
                      <Volume2 className={cn("h-4 w-4", isPlaying && "animate-pulse")} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Read Answer Aloud</TooltipContent>
                </Tooltip>
              </div>

              {/* Answer Content */}
              <div className="flex-grow flex items-center justify-center px-4 py-8">
                <motion.div 
                  className="text-center text-xl font-medium leading-relaxed break-words max-w-full"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {card.answer}
                </motion.div>
              </div>

              {/* Confidence Level Selector */}
              {isFlipped && !selectedRating && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6"
                >
                  <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-3">
                    How confident were you with your answer?
                  </p>
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <Button
                        key={level}
                        variant={confidenceLevel === level ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleConfidenceSelect(level)}
                        className="w-10 h-10 p-0"
                      >
                        {level}
                      </Button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Rating Buttons */}
              {isFlipped && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-4"
                >
                  <p className="text-center text-lg font-medium text-gray-800 dark:text-gray-200 mb-6">
                    How well did you know this?
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                    {ratings.map((rating) => (
                      <motion.div key={rating.value} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              onClick={() => handleRateCard(rating.value)}
                              disabled={isSubmitting}
                              className={cn(
                                "w-full h-16 flex flex-col items-center justify-center text-center transition-all duration-200",
                                "hover:shadow-xl hover:-translate-y-1",
                                rating.color,
                                selectedRating === rating.value && "ring-4 ring-white ring-opacity-60",
                                isSubmitting && "opacity-50 cursor-not-allowed"
                              )}
                            >
                              <div className="flex items-center mb-1">
                                {rating.icon}
                                <span className="font-semibold">{rating.label}</span>
                              </div>
                              <span className="text-xs opacity-90">({rating.shortcut})</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <p className="max-w-xs text-center">{rating.description}</p>
                            <p className="text-xs mt-1 opacity-75">Keyboard: {rating.shortcut}</p>
                          </TooltipContent>
                        </Tooltip>
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* Keyboard shortcuts hint */}
                  <motion.p 
                    className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                  >
                    💡 Tip: Use keyboard numbers 1-5 for quick rating
                  </motion.p>
                </motion.div>
              )}

              {/* Enhanced background decoration */}
              <div className="absolute bottom-4 right-4 opacity-5 pointer-events-none">
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 180, 360]
                  }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                >
                  <CheckCircle2 className="h-24 w-24 text-green-500" />
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Enhanced Confetti */}
        <AnimatePresence>
          {showConfetti && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 pointer-events-none z-50"
            >
              <Confetti />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Performance feedback */}
        {showPerformanceTip && responseTime && responseTime < 5000 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-4 text-center"
          >
            <div className="inline-flex items-center bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 px-4 py-2 rounded-full text-sm">
              <Zap className="h-4 w-4 mr-2" />
              Lightning fast! Quick recall shows mastery
            </div>
          </motion.div>
        )}
      </motion.div>
    </TooltipProvider>
  );
};

export default ModernReviewCard; 