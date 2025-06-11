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
  MoreHorizontal,
  Timer,
  Target,
  TrendingUp,
  Eye,
  Play,
  Volume2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MemoryCard } from "@/state/api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ModernMemoryCardProps {
  card: MemoryCard;
  onEdit: () => void;
  onDelete: () => void;
  onPreview?: () => void;
  onStartReview?: () => void;
  className?: string;
  showActions?: boolean;
  isPreviewMode?: boolean;
}

const ModernMemoryCard: React.FC<ModernMemoryCardProps> = ({
  card,
  onEdit,
  onDelete,
  onPreview,
  onStartReview,
  className,
  showActions = true,
  isPreviewMode = false
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showAIGlow, setShowAIGlow] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
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
    aiGenerated: card.aiGenerated ?? false,
    lastReviewed: card.lastReviewed || 0,
    nextReviewDue: card.nextReviewDue || 0,
  };

  // Detect if this is likely an AI-generated card
  const detectAiGenerated = () => {
    if (safeCard.aiGenerated) return true;
    
    const question = safeCard.question.toLowerCase();
    const answer = safeCard.answer.toLowerCase();
    
    const hasAiQuestionPattern = 
      question.includes("explain") || 
      question.includes("what is") ||
      question.includes("define") || 
      question.includes("describe") ||
      question.includes("how does") ||
      (question.length > 40 && question.includes("?"));
    
    const hasAiAnswerPattern =
      answer.length > 60 && 
      (answer.includes("is a") || 
       answer.includes("refers to") ||
       answer.includes("means") ||
       answer.includes("the process"));
    
    return hasAiQuestionPattern && hasAiAnswerPattern;
  };
  
  const isAiGenerated = detectAiGenerated();

  // Enhanced AI glow effect
  useEffect(() => {
    if (isAiGenerated && isHovered) {
      setShowAIGlow(true);
      const timer = setTimeout(() => setShowAIGlow(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isAiGenerated, isHovered]);

  // Performance calculations
  const { correctCount, incorrectCount, repetitionCount } = safeCard;
  const totalAttempts = correctCount + incorrectCount;
  const successRate = totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 0;
  
  // Difficulty color mapping
  const getDifficultyColor = () => {
    const level = safeCard.difficultyLevel;
    if (level <= 1) return "text-green-500 bg-green-50 border-green-200";
    if (level <= 2) return "text-yellow-500 bg-yellow-50 border-yellow-200";
    if (level <= 3) return "text-orange-500 bg-orange-50 border-orange-200";
    return "text-red-500 bg-red-50 border-red-200";
  };

  const getDifficultyLabel = () => {
    const level = safeCard.difficultyLevel;
    if (level <= 1) return "Easy";
    if (level <= 2) return "Medium";
    if (level <= 3) return "Hard";
    return "Expert";
  };

  const getPerformanceColor = () => {
    if (successRate >= 80) return "text-green-600";
    if (successRate >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getPerformanceLabel = () => {
    if (successRate >= 80) return `${successRate}% - Excellent`;
    if (successRate >= 60) return `${successRate}% - Good`;
    return `${successRate}% - Needs Work`;
  };

  // Enhanced due status
  const getDueStatus = () => {
    if (!safeCard.nextReviewDue) return { label: "New", color: "text-blue-500", bgColor: "bg-blue-50" };
    
    const now = Date.now();
    const timeDiff = safeCard.nextReviewDue - now;
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    
    if (daysDiff < 0) return { label: "Overdue", color: "text-red-500", bgColor: "bg-red-50" };
    if (daysDiff === 0) return { label: "Due Today", color: "text-orange-500", bgColor: "bg-orange-50" };
    if (daysDiff === 1) return { label: "Due Tomorrow", color: "text-yellow-500", bgColor: "bg-yellow-50" };
    return { label: `Due in ${daysDiff}d`, color: "text-green-500", bgColor: "bg-green-50" };
  };

  const dueStatus = getDueStatus();

  // Text-to-speech functionality
  const handlePlayAudio = (text: string) => {
    if (isPlaying) return;
    
    if ('speechSynthesis' in window) {
      setIsPlaying(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
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

  // Copy to clipboard
  const handleCopyCard = async () => {
    const cardText = `Q: ${safeCard.question}\nA: ${safeCard.answer}`;
    try {
      await navigator.clipboard.writeText(cardText);
      toast.success("Card copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy card");
    }
  };

  // Share card
  const handleShareCard = async () => {
    const shareData = {
      title: "Memory Card",
      text: `Q: ${safeCard.question}\nA: ${safeCard.answer}`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        handleCopyCard(); // Fallback to copy
      }
    } else {
      handleCopyCard(); // Fallback to copy
    }
  };

  // Flip card on click (only if not in preview mode)
  const handleFlip = () => {
    if (!isPreviewMode) {
      setIsFlipped(!isFlipped);
    }
  };

  // Reset card flip on unmount or card change
  useEffect(() => {
    return () => setIsFlipped(false);
  }, [card.cardId]);

  // Enhanced animation variants
  const cardVariants = {
    front: {
      rotateY: 0,
      transition: { duration: 0.6, ease: [0.25, 1, 0.5, 1] }
    },
    back: {
      rotateY: 180,
      transition: { duration: 0.6, ease: [0.25, 1, 0.5, 1] }
    },
    hover: {
      y: -8,
      scale: 1.02,
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
      transition: { duration: 0.3, ease: "easeOut" }
    },
    normal: {
      y: 0,
      scale: 1,
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
      transition: { duration: 0.3, ease: "easeOut" }
    }
  };
  
  const contentVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  // Enhanced background style
  const getCardBackground = () => {
    if (isAiGenerated) {
      return "bg-gradient-to-br from-white via-white to-indigo-50/70 dark:from-gray-800 dark:via-gray-800 dark:to-indigo-950/70";
    }
    return "bg-white dark:bg-gray-800";
  };

  return (
    <TooltipProvider>
      <motion.div
        ref={cardRef}
        className={cn(
          "perspective-1000 w-full max-w-sm h-[280px] cursor-pointer group relative",
          className,
          isAiGenerated && "ai-generated-card",
          isPreviewMode && "cursor-default"
        )}
        initial="normal"
        whileHover={!isPreviewMode ? "hover" : undefined}
        variants={cardVariants}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        {/* Enhanced AI glow effect */}
        <AnimatePresence>
          {isAiGenerated && showAIGlow && (
            <motion.div 
              className="absolute -inset-6 bg-gradient-to-r from-indigo-300/30 via-purple-300/30 to-indigo-300/30 dark:from-indigo-600/30 dark:via-purple-600/30 dark:to-indigo-600/30 rounded-2xl blur-xl z-0"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: [0, 1, 0],
                scale: [0.8, 1.1, 0.8],
                rotate: [0, 180, 360]
              }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ 
                duration: 3,
                ease: "easeInOut",
                times: [0, 0.5, 1]
              }}
            />
          )}
        </AnimatePresence>
        
        <motion.div
          className="relative w-full h-full preserve-3d transition-transform duration-600"
          animate={isFlipped ? "back" : "front"}
          variants={cardVariants}
        >
          {/* Front side of card */}
          <motion.div
            className={cn(
              "absolute inset-0 backface-hidden rounded-xl border-2 p-5 overflow-hidden",
              "shadow-lg flex flex-col justify-between backdrop-blur-sm",
              isFlipped && "pointer-events-none",
              getCardBackground(),
              isAiGenerated ? "border-indigo-200/60 dark:border-indigo-800/60" : "border-gray-200 dark:border-gray-700",
              !isPreviewMode && "hover:border-indigo-300 dark:hover:border-indigo-700"
            )}
            onClick={handleFlip}
          >
            {/* Header with enhanced info */}
            <motion.div 
              className="flex justify-between items-start mb-3" 
              variants={contentVariants} 
              initial="hidden" 
              animate="visible"
            >
              <div className="flex items-center gap-2 flex-wrap">
                {/* Difficulty indicator */}
                <div className={cn("px-2 py-1 rounded-full text-xs font-medium border", getDifficultyColor())}>
                  {getDifficultyLabel()}
                </div>
                
                {/* AI Generated badge */}
                {isAiGenerated && (
                  <Tooltip>
                    <TooltipTrigger>
                      <div className="flex items-center bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-full px-2 py-1 border border-indigo-200 dark:border-indigo-800">
                        <Sparkles className="h-3 w-3 text-indigo-500 dark:text-indigo-400 mr-1" />
                        <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300">AI</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>AI Generated Content</p>
                    </TooltipContent>
                  </Tooltip>
                )}

                {/* Due status */}
                <div className={cn("px-2 py-1 rounded-full text-xs font-medium", dueStatus.bgColor, dueStatus.color)}>
                  {dueStatus.label}
                </div>
              </div>
              
              {/* Actions dropdown */}
              {showActions && isHovered && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="z-10"
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      {onPreview && (
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onPreview(); }}>
                          <Eye className="mr-2 h-4 w-4" />
                          Preview
                        </DropdownMenuItem>
                      )}
                      {onStartReview && (
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onStartReview(); }}>
                          <Play className="mr-2 h-4 w-4" />
                          Start Review
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handlePlayAudio(safeCard.question); }}>
                        <Volume2 className="mr-2 h-4 w-4" />
                        Play Question
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleCopyCard(); }}>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Card
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleShareCard(); }}>
                        <Share2 className="mr-2 h-4 w-4" />
                        Share
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={(e) => { e.stopPropagation(); onDelete(); }}
                        className="text-red-600 dark:text-red-400"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </motion.div>
              )}
            </motion.div>
            
            {/* Question content */}
            <motion.div 
              className="flex-grow flex items-center justify-center px-2 py-4"
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.1 }}
            >
              <h3 className="text-center text-lg font-medium leading-tight break-words line-clamp-4">
                {safeCard.question}
              </h3>
            </motion.div>
            
            {/* Enhanced footer with performance metrics */}
            <motion.div 
              className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-700"
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-3">
                {repetitionCount > 0 ? (
                  <div className={cn("text-xs font-medium flex items-center", getPerformanceColor())}>
                    <Target className="h-3 w-3 mr-1" />
                    {successRate}%
                  </div>
                ) : (
                  <div className="text-xs font-medium text-indigo-500 flex items-center">
                    <BookOpen className="h-3 w-3 mr-1" />
                    New
                  </div>
                )}
                
                {repetitionCount > 0 && (
                  <div className="text-xs text-gray-500 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {repetitionCount}x
                  </div>
                )}
              </div>
              
              {!isPreviewMode && (
                <motion.div 
                  className="text-xs text-gray-500 flex items-center opacity-70 group-hover:opacity-100 transition-opacity"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Zap className="h-3 w-3 mr-1" />
                  Tap to flip
                </motion.div>
              )}
            </motion.div>

            {/* Enhanced visual indicators */}
            <div className="absolute top-0 right-0 h-20 w-20 opacity-5 pointer-events-none">
              {Array.from({ length: Math.min(safeCard.difficultyLevel, 5) }).map((_, i) => (
                <Star 
                  key={i} 
                  className={cn(
                    "absolute h-16 w-16 transform -rotate-12",
                    getDifficultyColor()
                  )} 
                  style={{ 
                    opacity: 0.05 + (i * 0.03),
                    top: i * 2,
                    right: i * 2
                  }}
                />
              ))}
            </div>
            
            {/* Enhanced AI indicator decoration */}
            {isAiGenerated && (
              <div className="absolute -bottom-6 -right-6 h-20 w-20 pointer-events-none">
                <motion.div 
                  className="absolute bottom-8 right-8"
                  animate={{ 
                    scale: [0.9, 1.1, 0.9],
                    opacity: [0.2, 0.6, 0.2],
                    rotate: [0, 180, 360]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Sparkles className="h-8 w-8 text-indigo-300/60" />
                </motion.div>
              </div>
            )}
          </motion.div>

          {/* Back side of card */}
          <motion.div
            className={cn(
              "absolute inset-0 backface-hidden rounded-xl border-2 p-5",
              "shadow-lg flex flex-col justify-between rotateY-180 backdrop-blur-sm",
              !isFlipped && "pointer-events-none",
              getCardBackground(),
              isAiGenerated ? "border-indigo-200/60 dark:border-indigo-800/60" : "border-gray-200 dark:border-gray-700"
            )}
            onClick={handleFlip}
          >
            {/* Answer header */}
            <motion.div 
              className="flex justify-between items-start mb-3"
              variants={contentVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="flex items-center gap-2">
                <div className="text-xs font-medium text-green-500 flex items-center bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
                  <Lightbulb className="h-3 w-3 mr-1" />
                  Answer
                </div>
                {isAiGenerated && (
                  <div className="flex items-center bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-full px-2 py-1 border border-indigo-200 dark:border-indigo-800">
                    <Sparkles className="h-3 w-3 text-indigo-500 dark:text-indigo-400 mr-1" />
                    <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300">AI Generated</span>
                  </div>
                )}
              </div>
              
              {/* Back side actions */}
              {showActions && isHovered && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex gap-1"
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayAudio(safeCard.answer);
                        }}
                      >
                        <Volume2 className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Play Answer</TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit();
                        }}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Edit Card</TooltipContent>
                  </Tooltip>
                </motion.div>
              )}
            </motion.div>
            
            {/* Answer content */}
            <motion.div 
              className="flex-grow flex items-center justify-center px-2 py-4"
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.1 }}
            >
              <p className="text-center text-lg font-medium leading-tight break-words line-clamp-5">
                {safeCard.answer}
              </p>
            </motion.div>
            
            {/* Enhanced back footer with stats */}
            <motion.div 
              className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-700"
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.2 }}
            >
              <div className="flex gap-4">
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
                {totalAttempts > 0 && (
                  <div className={cn("flex items-center text-xs", getPerformanceColor())}>
                    <BarChart2 className="h-3 w-3 mr-1" />
                    <span>{successRate}%</span>
                  </div>
                )}
              </div>
              
              {!isPreviewMode && (
                <motion.div 
                  className="text-xs text-gray-500 flex items-center opacity-70"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Zap className="h-3 w-3 mr-1" />
                  Tap to flip back
                </motion.div>
              )}
            </motion.div>
            
            {/* Enhanced decorative elements */}
            {isAiGenerated && (
              <div className="absolute -bottom-6 -right-6 h-20 w-20 pointer-events-none overflow-hidden">
                <motion.div 
                  className="absolute bottom-8 right-8 opacity-20"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, -90, 0],
                    opacity: [0.2, 0.5, 0.2]
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Brain className="h-8 w-8 text-indigo-400" />
                </motion.div>
              </div>
            )}
          </motion.div>
        </motion.div>
      </motion.div>
    </TooltipProvider>
  );
};

export default ModernMemoryCard; 