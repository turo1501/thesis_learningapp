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
  Rotate3D
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MemoryCard } from "@/state/api";
import { cn } from "@/lib/utils";
import { Confetti } from '@/components/ui/Confetti';
import { Card } from "@/components/ui/card";

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

  // Reset flip state when card changes
  useEffect(() => {
    setIsFlipped(false);
    setSelectedRating(null);
    setError(null);
  }, [card?.cardId]);

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
    } catch (err) {
      console.error("Error rating card:", err);
      setError("Failed to submit your rating. Please try again.");
    }
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
    { label: "Hard", value: 1, color: "bg-red-500 hover:bg-red-600", icon: <ThumbsDown className="mr-2 h-4 w-4" /> },
    { label: "Good", value: 3, color: "bg-yellow-500 hover:bg-yellow-600", icon: <RefreshCw className="mr-2 h-4 w-4" /> },
    { label: "Easy", value: 5, color: "bg-green-500 hover:bg-green-600", icon: <ThumbsUp className="mr-2 h-4 w-4" /> },
  ];

  // Progress bar percentage
  const progressPercentage = (currentPosition / totalRemaining) * 100;

  // If there's an error with the card data, show error state
  if (error) {
    return (
      <div className="w-full">
        <Card className="bg-white dark:bg-gray-800 shadow-xl p-8 min-h-[350px] flex flex-col items-center justify-center">
          <XCircle className="h-16 w-16 text-red-500 mb-4" />
          <h3 className="text-xl font-medium text-center mb-4">Error</h3>
          <p className="text-gray-500 text-center mb-6">{error}</p>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200"
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
        <Card className="bg-white dark:bg-gray-800 shadow-xl p-8 min-h-[350px] flex flex-col items-center justify-center">
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
        <div className="mb-6 w-full bg-gray-200 h-2 rounded-full overflow-hidden">
          <div 
            className="h-full bg-indigo-600 transition-all duration-300 ease-in-out" 
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        <div className="w-full" style={{ perspective: "1000px" }}>
          <motion.div
            className="relative w-full transition-all duration-300"
            style={{ transformStyle: "preserve-3d", cursor: "pointer" }}
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          >
            {/* Card Front (Question) */}
            <motion.div
              className="absolute w-full h-full"
              style={{ 
                backfaceVisibility: "hidden",
                visibility: isFlipped ? "hidden" : "visible"
              }}
            >
              <Card className="bg-white dark:bg-gray-800 shadow-xl p-8 min-h-[350px] flex flex-col justify-between">
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center">
                      <div className="h-3 w-3 bg-indigo-500 rounded-full mr-2"></div>
                      <span className="text-sm font-medium text-gray-500">Question</span>
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
                      className="text-gray-500 hover:text-indigo-600"
                    >
                      <Rotate3D className="h-5 w-5" />
                      <span className="ml-1 text-xs">Flip</span>
                    </Button>
                  </div>
                  <div className="text-center py-6">
                    <h3 className="text-2xl font-medium">{card.question}</h3>
                  </div>
                </div>
                <div className="mt-8 flex justify-center">
                  <Button
                    variant="outline"
                    onClick={handleFlip}
                    className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200"
                  >
                    Reveal Answer
                  </Button>
                </div>
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
              <Card className="bg-white dark:bg-gray-800 shadow-xl p-8 min-h-[350px] flex flex-col justify-between">
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center">
                      <div className="h-3 w-3 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm font-medium text-gray-500">Answer</span>
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
                      className="text-gray-500 hover:text-indigo-600"
                    >
                      <Rotate3D className="h-5 w-5" />
                      <span className="ml-1 text-xs">Flip</span>
                    </Button>
                  </div>
                  <div className="text-center py-6">
                    <h3 className="text-2xl font-medium">{card.answer}</h3>
                  </div>
                </div>

                <div className="mt-8">
                  <p className="text-sm text-center text-gray-500 mb-4">How well did you remember this?</p>
                  <div className="grid grid-cols-3 gap-3">
                    {ratings.map((rating) => (
                      <Button
                        key={rating.value}
                        onClick={() => handleRateCard(rating.value)}
                        disabled={isSubmitting || selectedRating !== null}
                        className={cn(
                          "text-white transition-all",
                          rating.color,
                          selectedRating === rating.value && "ring-2 ring-offset-2 ring-indigo-500",
                          (isSubmitting || selectedRating !== null) && "opacity-70 cursor-not-allowed"
                        )}
                      >
                        {rating.icon}
                        {rating.label}
                      </Button>
                    ))}
                  </div>
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