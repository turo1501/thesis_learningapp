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
  Clock,
  Sparkles,
  Brain,
  Lightbulb,
  Zap,
  Copy,
  Share2,
  MoreHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MemoryCard } from "@/state/api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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
  const [showAIGlow, setShowAIGlow] = useState(false);
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
    aiGenerated: card.aiGenerated ?? false, // Add AIGenerated flag with default
  };

  // Detect if this is likely an AI-generated card based on question/answer structure
  // We'll use this as a fallback if the aiGenerated flag isn't explicitly set
  const detectAiGenerated = () => {
    if (safeCard.aiGenerated) return true;
    
    // Look for patterns common in AI-generated cards
    const question = safeCard.question.toLowerCase();
    const answer = safeCard.answer.toLowerCase();
    
    // Check for question structures typical of AI-generated content
    const hasAiQuestionPattern = 
      question.includes("explain") || 
      question.includes("what is") ||
      question.includes("define") || 
      question.includes("describe") ||
      question.includes("how does") ||
      (question.length > 40 && question.includes("?"));
    
    // Check for answer structures typical of AI-generated content
    const hasAiAnswerPattern =
      answer.length > 60 && 
      (answer.includes("is a") || 
       answer.includes("refers to") ||
       answer.includes("means") ||
       answer.includes("the process"));
    
    return hasAiQuestionPattern && hasAiAnswerPattern;
  };
  
  const isAiGenerated = detectAiGenerated();

  // Activate the AI glow effect periodically for AI-generated cards
  useEffect(() => {
    if (isAiGenerated) {
      const interval = setInterval(() => {
        setShowAIGlow(true);
        setTimeout(() => setShowAIGlow(false), 2000);
      }, 10000);
      
      return () => clearInterval(interval);
    }
  }, [isAiGenerated]);

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

  // Function to copy card content to clipboard
  const copyToClipboard = (e: React.MouseEvent) => {
    e.stopPropagation();
    const textToCopy = `Question: ${safeCard.question}\nAnswer: ${safeCard.answer}`;
    navigator.clipboard.writeText(textToCopy);
    toast.success("Card copied to clipboard");
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
      transition: { duration: 0.7, ease: [0.23, 1, 0.32, 1] }
    },
    back: {
      rotateY: 180,
      transition: { duration: 0.7, ease: [0.23, 1, 0.32, 1] }
    },
    hover: {
      y: -10,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: { duration: 0.3, ease: "easeInOut" }
    },
    normal: {
      y: 0,
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      transition: { duration: 0.3, ease: "easeInOut" }
    }
  };
  
  // Card content animation variants
  const contentVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        delay: 0.2,
        duration: 0.3,
      }
    }
  };

  // Determine background style based on card type
  const getCardBackground = () => {
    if (isAiGenerated) {
      return "bg-gradient-to-br from-white via-white to-indigo-50 dark:from-gray-800 dark:via-gray-800 dark:to-indigo-950";
    }
    return "bg-white dark:bg-gray-800";
  };

  return (
    <motion.div
      ref={cardRef}
      className={cn(
        "perspective-1000 w-full md:w-[380px] h-[250px] cursor-pointer group",
        className,
        isAiGenerated && "ai-generated-card"
      )}
      initial="normal"
      whileHover="hover"
      variants={cardVariants}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Glow effect for AI cards */}
      {isAiGenerated && showAIGlow && (
        <motion.div 
          className="absolute -inset-4 bg-indigo-300/20 dark:bg-indigo-600/20 rounded-xl blur-xl z-0"
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: [0, 0.8, 0],
            scale: [0.9, 1.05, 0.9]
          }}
          transition={{ 
            duration: 2,
            ease: "easeInOut" 
          }}
        />
      )}
      
      <motion.div
        className="relative w-full h-full preserve-3d transition-transform duration-500"
        animate={isFlipped ? "back" : "front"}
        variants={cardVariants}
      >
        {/* Front side of card */}
        <motion.div
          className={cn(
            "absolute inset-0 backface-hidden rounded-xl border-2 p-6 overflow-hidden",
            "shadow-lg flex flex-col justify-between",
            isFlipped && "pointer-events-none",
            getCardBackground(),
            isAiGenerated ? "border-indigo-200 dark:border-indigo-800" : "border-gray-200 dark:border-gray-700"
          )}
          onClick={handleFlip}
        >
          <motion.div className="flex justify-between items-start" variants={contentVariants} initial="hidden" animate="visible">
            <div className="relative z-10 flex items-center space-x-2">
              <div className={cn("h-2 w-2 rounded-full", getDifficultyColor())} />
              <span className={cn("text-xs font-medium", getDifficultyColor())}>
                {getDifficultyLabel()}
              </span>
              
              {isAiGenerated && (
                <div className="ml-2 flex items-center bg-indigo-100 dark:bg-indigo-900 rounded-full px-2 py-0.5">
                  <Sparkles className="h-3 w-3 text-indigo-500 dark:text-indigo-400 mr-1" />
                  <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300">AI</span>
                </div>
              )}
            </div>
            
            <div className="flex space-x-2">
              {repetitionCount > 0 && (
                <div className="flex items-center space-x-1 text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                  <Clock className="h-3 w-3" />
                  <span>{repetitionCount}</span>
                </div>
              )}
              
              {isHovered && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 rounded-full p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[160px]">
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      onEdit();
                    }}>
                      <Pencil className="mr-2 h-3.5 w-3.5" />
                      <span>Edit</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => copyToClipboard(e)}>
                      <Copy className="mr-2 h-3.5 w-3.5" />
                      <span>Copy</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      onDelete();
                    }} className="text-red-500 hover:text-red-600 focus:text-red-600">
                      <Trash2 className="mr-2 h-3.5 w-3.5" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </motion.div>
          
          <motion.div 
            className="flex-grow flex items-center justify-center my-2 px-2"
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-center text-lg font-medium leading-tight break-words">
              {safeCard.question}
            </h3>
          </motion.div>
          
          <motion.div 
            className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-700"
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
          >
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
            
            <motion.div 
              className="text-xs text-gray-500 flex items-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <Zap className="h-3 w-3 mr-1" />
              Tap to flip
            </motion.div>
          </motion.div>

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
          
          {/* AI indicator decoration */}
          {isAiGenerated && (
            <div className="absolute -bottom-4 -right-4 h-16 w-16">
              <motion.div 
                className="absolute bottom-6 right-6"
                animate={{ 
                  scale: [0.95, 1.05, 0.95],
                  opacity: [0.3, 0.5, 0.3]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Sparkles className="h-6 w-6 text-indigo-300 opacity-50" />
              </motion.div>
            </div>
          )}
        </motion.div>

        {/* Back side of card */}
        <motion.div
          className={cn(
            "absolute inset-0 backface-hidden rounded-xl border-2 p-6",
            "shadow-lg flex flex-col justify-between rotateY-180",
            !isFlipped && "pointer-events-none",
            getCardBackground(),
            isAiGenerated ? "border-indigo-200 dark:border-indigo-800" : "border-gray-200 dark:border-gray-700"
          )}
          onClick={handleFlip}
        >
          <motion.div 
            className="flex justify-between items-start"
            variants={contentVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="flex items-center">
              <div className="text-xs font-medium text-green-500 flex items-center">
                <Lightbulb className="h-3 w-3 mr-1" />
                Answer
              </div>
              {isAiGenerated && (
                <div className="ml-2 flex items-center bg-indigo-100 dark:bg-indigo-900 rounded-full px-2 py-0.5">
                  <Sparkles className="h-3 w-3 text-indigo-500 dark:text-indigo-400 mr-1" />
                  <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300">AI Generated</span>
                </div>
              )}
            </div>
            
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
          </motion.div>
          
          <motion.div 
            className="flex-grow flex items-center justify-center my-2 px-2"
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
          >
            <p className="text-center text-lg font-medium leading-tight break-words">
              {safeCard.answer}
            </p>
          </motion.div>
          
          <motion.div 
            className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-700"
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
          >
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
            
            <motion.div 
              className="text-xs text-gray-500 flex items-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <Zap className="h-3 w-3 mr-1" />
              Tap to flip back
            </motion.div>
          </motion.div>
          
          {/* Subtle decorative elements for AI-generated content */}
          {isAiGenerated && (
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
                  animate={{ 
                    rotate: 360,
                  }}
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
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default ModernMemoryCard; 