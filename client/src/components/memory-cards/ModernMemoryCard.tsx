"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Pencil, 
  Trash2, 
  BarChart2, 
  ThumbsUp, 
  ThumbsDown, 
  Award, 
  Star,
  BookOpen,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MemoryCard } from "@/state/api";
import { cn } from "@/lib/utils";

interface ModernMemoryCardProps {
  card: MemoryCard;
  onEdit: () => void;
  onDelete: () => void;
  className?: string;
}

const ModernMemoryCard: React.FC<ModernMemoryCardProps> = ({
  card,
  onEdit,
  onDelete,
  className
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Ensure card has all required properties with safe defaults
  const safeCard = {
    cardId: card.cardId || 'unknown',
    question: card.question || 'No question provided',
    answer: card.answer || 'No answer provided',
    difficultyLevel: card.difficultyLevel || 0,
    repetitionCount: card.repetitionCount || 0,
    correctCount: card.correctCount || 0,
    incorrectCount: card.incorrectCount || 0,
  };

  // Calculate performance stats with safe access
  const repetitionCount = safeCard.repetitionCount;
  const correctCount = safeCard.correctCount;
  const incorrectCount = safeCard.incorrectCount;
  
  const successRate = repetitionCount > 0
    ? Math.round((correctCount / repetitionCount) * 100)
    : 0;
  
  // Get performance data
  const getPerformanceLabel = () => {
    if (repetitionCount === 0) return "New";
    if (successRate >= 80) return "High";
    if (successRate >= 50) return "Medium";
    return "Low";
  };
  
  const getDifficultyColor = () => {
    const level = safeCard.difficultyLevel;
    if (level <= 1) return "text-green-500";
    if (level === 2) return "text-blue-500";
    if (level === 3) return "text-yellow-500";
    if (level === 4) return "text-orange-500";
    return "text-red-500";
  };

  const getDifficultyLabel = () => {
    const level = safeCard.difficultyLevel;
    if (level <= 1) return "Very Easy";
    if (level === 2) return "Easy";
    if (level === 3) return "Medium";
    if (level === 4) return "Hard";
    return "Very Hard";
  };
  
  const getPerformanceColor = () => {
    if (repetitionCount === 0) return "text-gray-500";
    if (successRate >= 80) return "text-green-500";
    if (successRate >= 50) return "text-yellow-500";
    return "text-red-500";
  };

  // Flip card on click
  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  // Reset card flip on unmount or card change
  useEffect(() => {
    return () => setIsFlipped(false);
  }, [card.cardId]);

  // Animation variants
  const cardVariants = {
    front: {
      rotateY: 0,
      transition: { duration: 0.5, ease: "easeInOut" }
    },
    back: {
      rotateY: 180,
      transition: { duration: 0.5, ease: "easeInOut" }
    },
    hover: {
      y: -10,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: { duration: 0.2, ease: "easeInOut" }
    },
    normal: {
      y: 0,
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      transition: { duration: 0.2, ease: "easeInOut" }
    }
  };

  return (
    <motion.div
      ref={cardRef}
      className={cn(
        "perspective-1000 w-full md:w-[350px] h-[220px] cursor-pointer group",
        className
      )}
      initial="normal"
      whileHover="hover"
      variants={cardVariants}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <motion.div
        className="relative w-full h-full preserve-3d transition-transform duration-500"
        animate={isFlipped ? "back" : "front"}
        variants={cardVariants}
      >
        {/* Front side of card */}
        <motion.div
          className={cn(
            "absolute inset-0 backface-hidden rounded-xl border bg-white dark:bg-gray-800 p-6 overflow-hidden",
            "shadow-lg flex flex-col justify-between",
            isFlipped && "pointer-events-none"
          )}
          onClick={handleFlip}
        >
          <div className="flex justify-between items-start">
            <div className="relative z-10 flex items-center space-x-2">
              <div className={cn("h-2 w-2 rounded-full", getDifficultyColor())} />
              <span className={cn("text-xs font-medium", getDifficultyColor())}>
                {getDifficultyLabel()}
              </span>
            </div>
            {repetitionCount > 0 && (
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                <span>{repetitionCount} reviews</span>
              </div>
            )}
          </div>
          
          <div className="flex-grow flex items-center justify-center my-2">
            <h3 className="text-center text-lg font-medium leading-tight break-words">
              {safeCard.question}
            </h3>
          </div>
          
          <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center">
              {repetitionCount > 0 ? (
                <div className={cn("text-xs font-medium flex items-center", getPerformanceColor())}>
                  <Award className="h-3 w-3 mr-1" />
                  {getPerformanceLabel()} success rate
                </div>
              ) : (
                <div className="text-xs font-medium text-indigo-500 flex items-center">
                  <BookOpen className="h-3 w-3 mr-1" />
                  New card
                </div>
              )}
            </div>
            <div className="text-xs text-gray-500">
              Tap to flip
            </div>
          </div>

          {/* Visual indicators for difficulty */}
          <div className="absolute top-0 right-0 h-16 w-16 opacity-5">
            {Array.from({ length: Math.min(safeCard.difficultyLevel, 5) }).map((_, i) => (
              <Star 
                key={i} 
                className={cn(
                  "absolute h-16 w-16 transform -rotate-12",
                  getDifficultyColor()
                )} 
                style={{ 
                  opacity: 0.07 + (i * 0.05),
                  top: i * 2,
                  right: i * 2
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* Back side of card */}
        <motion.div
          className={cn(
            "absolute inset-0 backface-hidden rounded-xl border bg-white dark:bg-gray-800 p-6",
            "shadow-lg flex flex-col justify-between rotateY-180",
            !isFlipped && "pointer-events-none"
          )}
          onClick={handleFlip}
        >
          <div className="flex justify-between items-start">
            <div className="text-xs font-medium text-green-500">Answer</div>
            {isHovered && (
              <div className="flex space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                >
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-red-100 dark:hover:bg-red-900 text-red-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
          
          <div className="flex-grow flex items-center justify-center my-2">
            <p className="text-center text-lg font-medium leading-tight break-words">
              {safeCard.answer}
            </p>
          </div>
          
          <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-700">
            <div className="flex space-x-3">
              {correctCount > 0 && (
                <div className="flex items-center text-green-500 text-xs">
                  <ThumbsUp className="h-3 w-3 mr-1" />
                  <span>{correctCount}</span>
                </div>
              )}
              {incorrectCount > 0 && (
                <div className="flex items-center text-red-500 text-xs">
                  <ThumbsDown className="h-3 w-3 mr-1" />
                  <span>{incorrectCount}</span>
                </div>
              )}
            </div>
            <div className="text-xs text-gray-500">
              Tap to flip back
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default ModernMemoryCard; 