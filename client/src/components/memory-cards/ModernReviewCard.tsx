"use client";

import React, { useState, useEffect } from "react";
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
  BadgeCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
}

const ModernReviewCard: React.FC<ModernReviewCardProps> = ({
  card,
  onRate,
  isSubmitting,
  totalRemaining,
  currentPosition,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [isAIGenerated, setIsAIGenerated] = useState(false);

  // Reset flip state when card changes
  useEffect(() => {
    setIsFlipped(false);
    setSelectedRating(null);
    setError(null);
    setShowHint(false);
    setResponseTime(null);
    setStartTime(Date.now());
    
    // Set AI generation detection
    setIsAIGenerated(!!card?.aiGenerated || detectAIGenerated());
  }, [card?.cardId]);
  
  // Detect if the card appears to be AI generated if the flag isn't explicitly set
  const detectAIGenerated = () => {
    if (!card) return false;
    
    // Check for specific patterns in questions that suggest AI generation
    const question = card.question?.toLowerCase() || '';
    return (
      question.includes("explain") || 
      question.includes("define in your own words") || 
      question.includes("what is meant by") ||
      (question.length > 40 && card.answer?.length > 100)
    );
  };

  // Show hint after 30 seconds if not flipped
  useEffect(() => {
    if (!isFlipped && !showHint) {
      const timer = setTimeout(() => {
        setShowHint(true);
      }, 30000);
      return () => clearTimeout(timer);
    }
  }, [isFlipped, showHint]);

  // Enhanced debugging for card data
  useEffect(() => {
    // Log when card changes
    console.log('Card data for review:', {
      hasCard: !!card,
      cardId: card?.cardId,
      hasQuestion: !!card?.question,
      hasAnswer: !!card?.answer
    });
  }, [card]);

  // Enhanced validation of card data
  useEffect(() => {
    if (!card) {
      setError("Card data is missing");
      return;
    }
    
    if (!card.question) {
      setError("Card is missing a question");
      return;
    }
    
    if (!card.answer) {
      setError("Card is missing an answer");
      return;
    }
    
    if (!card.cardId) {
      setError("Card is missing a cardId");
      return;
    }
    
    // Clear any error if card data is valid
    setError(null);
  }, [card]);

  // Show confetti animation for correct answers
  useEffect(() => {
    if (selectedRating !== null && selectedRating >= 3) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [selectedRating]);

  const handleFlip = () => {
    if (error) return; // Don't allow flipping if there's an error
    if (!isFlipped) {
      // Record response time when card is flipped to see answer
      setResponseTime(Date.now() - startTime);
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
      
      // Show feedback based on rating
      if (difficultyRating >= 4) {
        toast.success("You've mastered this card! 🎉", { 
          position: "top-center",
          duration: 1500
        });
      } else if (difficultyRating === 3) {
        toast("Good job! Keep reviewing to improve", { 
          icon: "👍",
          position: "top-center",
          duration: 1500
        });
      }
    } catch (err) {
      console.error("Error rating card:", err);
      setError("Failed to submit your rating. Please try again.");
    }
  };

  // Format response time in seconds
  const formatResponseTime = (ms: number | null) => {
    if (ms === null) return null;
    return (ms / 1000).toFixed(1);
  };

  // Determine difficulty display based on card.difficultyLevel if available
  const getDifficultyLabel = () => {
    if (!card?.difficultyLevel) return null;
    
    switch (card.difficultyLevel) {
      case 1: return { label: "Easy", color: "bg-green-100 text-green-800" };
      case 2: return { label: "Medium", color: "bg-yellow-100 text-yellow-800" };
      case 3: return { label: "Hard", color: "bg-red-100 text-red-800" };
      default: return null;
    }
  };

  const difficultyInfo = getDifficultyLabel();

  // Rating options aligned with the API values
  const ratings = [
    { 
      label: "Hard", 
      value: 1, 
      color: "bg-gradient-to-br from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600", 
      icon: <ThumbsDown className="mr-2 h-4 w-4" />,
      description: "Need to review again soon"
    },
    { 
      label: "Good", 
      value: 3, 
      color: "bg-gradient-to-br from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600", 
      icon: <RefreshCw className="mr-2 h-4 w-4" />,
      description: "Challenging but remembered"
    },
    { 
      label: "Easy", 
      value: 5, 
      color: "bg-gradient-to-br from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600", 
      icon: <ThumbsUp className="mr-2 h-4 w-4" />,
      description: "Knew it perfectly"
    },
  ];

  // Progress bar percentage
  const progressPercentage = (currentPosition / totalRemaining) * 100;

  // If there's an error with the card data, show error state
  if (error) {
    return (
      <div className="w-full">
        <Card className="bg-white dark:bg-gray-800 shadow-xl p-8 min-h-[400px] flex flex-col items-center justify-center">
          <XCircle className="h-16 w-16 text-red-500 mb-4" />
          <h3 className="text-xl font-medium text-center mb-4">Error</h3>
          <p className="text-gray-500 text-center mb-6">{error}</p>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200 transition-all"
          >
            Reload
          </Button>
        </Card>
      </div>
    );
  }

  // Ensure we have card data
  if (!card || !card.question || !card.answer) {
    return (
      <div className="w-full">
        <Card className="bg-white dark:bg-gray-800 shadow-xl p-8 min-h-[400px] flex flex-col items-center justify-center">
          <Brain className="h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-xl font-medium text-center mb-4">Card Not Available</h3>
          <p className="text-gray-500 text-center mb-6">This card appears to be missing or incomplete.</p>
        </Card>
      </div>
    );
  }

  return (
    <>
      {showConfetti && <Confetti duration={2000} particleCount={100} />}
      <div className="w-full">
        <div className="mb-6 w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-indigo-600 to-blue-600 transition-all duration-300 ease-in-out" 
            style={{ width: `${progressPercentage}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        <div className="w-full perspective-1200">
          <motion.div
            className="relative w-full transition-all duration-300"
            style={{ transformStyle: "preserve-3d", cursor: "pointer" }}
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ 
              duration: 0.6, 
              ease: [0.16, 1, 0.3, 1], // Spring-like ease
              type: "tween"
            }}
          >
            {/* Card Front (Question) */}
            <motion.div
              className="absolute w-full h-full"
              style={{ 
                backfaceVisibility: "hidden",
                visibility: isFlipped ? "hidden" : "visible"
              }}
            >
              <Card className={cn(
                "bg-white dark:bg-gray-800 shadow-xl p-8 min-h-[400px] flex flex-col justify-between border-2",
                isAIGenerated ? "border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-white via-white to-indigo-50 dark:from-gray-800 dark:via-gray-800 dark:to-indigo-950" 
                : "border-gray-200 dark:border-gray-700"
              )}>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 bg-indigo-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-500">Question</span>
                      
                      {isAIGenerated && (
                        <div className="flex items-center bg-indigo-100 dark:bg-indigo-900/40 rounded-full px-2 py-0.5">
                          <Sparkles className="h-3 w-3 text-indigo-500 dark:text-indigo-400 mr-1" />
                          <span className="text-xs font-medium text-indigo-700 dark:text-indigo-400">AI</span>
                        </div>
                      )}
                    </div>
                    
                    {difficultyInfo && (
                      <span className={`text-xs px-2 py-1 rounded-full ${difficultyInfo.color}`}>
                        {difficultyInfo.label}
                      </span>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleFlip}
                      className="text-gray-500 hover:text-indigo-600 transition-colors group"
                    >
                      <motion.div
                        animate={{ rotate: isFlipped ? 180 : 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        <Rotate3D className="h-5 w-5 group-hover:rotate-180 transition-transform duration-500" />
                      </motion.div>
                      <span className="ml-1 text-xs">Flip</span>
                    </Button>
                  </div>
                  
                  <div className="text-center py-6 px-4">
                    <motion.h3 
                      className="text-2xl font-medium"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                    >
                      {card.question}
                    </motion.h3>
                    
                    {showHint && !isFlipped && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="mt-6 text-sm text-indigo-600 dark:text-indigo-400 flex items-center justify-center"
                      >
                        <Lightbulb className="h-4 w-4 mr-2" />
                        <span>Tip: Click the card or the button below to reveal the answer</span>
                      </motion.div>
                    )}
                  </div>
                </div>
                
                <div className="mt-8 flex justify-center">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      onClick={handleFlip}
                      className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                    >
                      <Zap className="h-4 w-4" />
                      Reveal Answer
                    </Button>
                  </motion.div>
                </div>
                
                {/* Decorative elements for AI cards */}
                {isAIGenerated && (
                  <motion.div 
                    className="absolute -bottom-6 -right-6 h-24 w-24 pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                  >
                    <svg viewBox="0 0 100 100" className="w-full h-full text-indigo-500">
                      <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="0.5" />
                      <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="0.3" />
                      <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="0.2" />
                      <motion.path 
                        d="M50,10 A40,40 0 0,1 90,50" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="0.5"
                        strokeLinecap="round"
                        animate={{ rotate: 360 }}
                        transition={{ 
                          duration: 20, 
                          repeat: Infinity,
                          ease: "linear"
                        }}
                        style={{ transformOrigin: "center" }}
                      />
                    </svg>
                  </motion.div>
                )}
              </Card>
            </motion.div>

            {/* Card Back (Answer) */}
            <motion.div
              className="absolute w-full h-full"
              style={{ 
                backfaceVisibility: "hidden", 
                transform: "rotateY(180deg)",
                visibility: isFlipped ? "visible" : "hidden"
              }}
            >
              <Card className={cn(
                "bg-white dark:bg-gray-800 shadow-xl p-8 min-h-[400px] flex flex-col justify-between border-2",
                isAIGenerated ? "border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-white via-white to-indigo-50 dark:from-gray-800 dark:via-gray-800 dark:to-indigo-950" 
                : "border-gray-200 dark:border-gray-700"
              )}>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-500">Answer</span>
                      
                      {isAIGenerated && (
                        <div className="flex items-center bg-indigo-100 dark:bg-indigo-900/40 rounded-full px-2 py-0.5">
                          <Sparkles className="h-3 w-3 text-indigo-500 dark:text-indigo-400 mr-1" />
                          <span className="text-xs font-medium text-indigo-700 dark:text-indigo-400">AI Generated</span>
                        </div>
                      )}
                    </div>
                    
                    {responseTime && (
                      <div className="flex items-center bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                        <Timer className="h-3 w-3 text-gray-500 mr-1" />
                        <span className="text-xs font-medium text-gray-500">{formatResponseTime(responseTime)}s</span>
                      </div>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleFlip}
                      className="text-gray-500 hover:text-indigo-600 transition-colors group"
                    >
                      <motion.div
                        animate={{ rotate: isFlipped ? 0 : 180 }}
                        transition={{ duration: 0.5 }}
                      >
                        <Rotate3D className="h-5 w-5 group-hover:-rotate-180 transition-transform duration-500" />
                      </motion.div>
                      <span className="ml-1 text-xs">Flip</span>
                    </Button>
                  </div>
                  
                  <div className="text-center py-6 px-4">
                    <motion.p 
                      className="text-2xl font-medium"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      {card.answer}
                    </motion.p>
                  </div>
                </div>

                <div className="mt-8">
                  <motion.p 
                    className="text-center text-sm text-gray-500 mb-4 font-medium"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                  >
                    How well did you remember this?
                  </motion.p>
                  
                  <motion.div 
                    className="grid grid-cols-3 gap-3"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    {ratings.map((rating, index) => (
                      <motion.div
                        key={rating.value}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + (index * 0.1), duration: 0.3 }}
                        whileHover={{ scale: 1.05, y: -5 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          onClick={() => handleRateCard(rating.value)}
                          disabled={isSubmitting || selectedRating !== null}
                          className={cn(
                            "relative text-white transition-all w-full flex flex-col py-3 h-auto",
                            rating.color,
                            selectedRating === rating.value && "ring-2 ring-offset-2 ring-indigo-300",
                            (isSubmitting || selectedRating !== null) && "opacity-70 cursor-not-allowed"
                          )}
                        >
                          <div className="flex items-center justify-center mb-1">
                            {rating.icon}
                            <span>{rating.label}</span>
                            
                            {/* Checkmark animation when selected */}
                            {selectedRating === rating.value && (
                              <motion.div 
                                className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 500, damping: 15 }}
                              >
                                <BadgeCheck className="h-4 w-4 text-white" />
                              </motion.div>
                            )}
                          </div>
                          <span className="text-xs opacity-80">{rating.description}</span>
                        </Button>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default ModernReviewCard; 