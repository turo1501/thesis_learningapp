"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Brain,
  Lightbulb,
  Clock,
  BarChart2,
  ThumbsUp,
  ThumbsDown,
  Target,
  Calendar,
  Volume2,
  Copy,
  Share2,
  Pencil,
  Play,
  X,
  Zap,
  Star,
  Award
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MemoryCard } from "@/state/api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import ModernMemoryCard from "./ModernMemoryCard";

interface MemoryCardPreviewDialogProps {
  card: MemoryCard | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onStartReview?: () => void;
  showActions?: boolean;
}

const MemoryCardPreviewDialog: React.FC<MemoryCardPreviewDialogProps> = ({
  card,
  isOpen,
  onClose,
  onEdit,
  onStartReview,
  showActions = true,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  if (!card) return null;

  // Enhanced card stats
  const totalAttempts = (card.correctCount || 0) + (card.incorrectCount || 0);
  const successRate = totalAttempts > 0 ? Math.round(((card.correctCount || 0) / totalAttempts) * 100) : 0;
  const isAIGenerated = card.aiGenerated || false;

  // Due status calculation
  const getDueStatus = () => {
    if (!card.nextReviewDue) return { label: "New Card", color: "bg-blue-100 text-blue-800", icon: "📝" };
    
    const now = Date.now();
    const timeDiff = card.nextReviewDue - now;
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    
    if (daysDiff < 0) return { label: "Overdue", color: "bg-red-100 text-red-800", icon: "⚠️" };
    if (daysDiff === 0) return { label: "Due Today", color: "bg-orange-100 text-orange-800", icon: "📅" };
    if (daysDiff === 1) return { label: "Due Tomorrow", color: "bg-yellow-100 text-yellow-800", icon: "📆" };
    return { label: `Due in ${daysDiff} days`, color: "bg-green-100 text-green-800", icon: "⏰" };
  };

  const dueStatus = getDueStatus();

  // Difficulty mapping
  const getDifficultyInfo = () => {
    const level = card.difficultyLevel || 1;
    const difficultyMap = {
      1: { label: "Beginner", color: "bg-green-100 text-green-800", icon: "🟢" },
      2: { label: "Intermediate", color: "bg-blue-100 text-blue-800", icon: "🔵" },
      3: { label: "Advanced", color: "bg-yellow-100 text-yellow-800", icon: "🟡" },
      4: { label: "Expert", color: "bg-orange-100 text-orange-800", icon: "🟠" },
      5: { label: "Master", color: "bg-red-100 text-red-800", icon: "🔴" }
    };
    
    return difficultyMap[level as keyof typeof difficultyMap] || difficultyMap[1];
  };

  const difficultyInfo = getDifficultyInfo();

  // Performance indicator
  const getPerformanceInfo = () => {
    if (totalAttempts === 0) return { label: "Not Reviewed", color: "bg-gray-100 text-gray-800", icon: "❓" };
    
    if (successRate >= 90) return { label: "Excellent", color: "bg-emerald-100 text-emerald-800", icon: "🏆" };
    if (successRate >= 75) return { label: "Good", color: "bg-green-100 text-green-800", icon: "✅" };
    if (successRate >= 60) return { label: "Fair", color: "bg-yellow-100 text-yellow-800", icon: "⚡" };
    return { label: "Needs Work", color: "bg-red-100 text-red-800", icon: "💪" };
  };

  const performanceInfo = getPerformanceInfo();

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

  // Copy card content
  const handleCopyCard = async () => {
    const cardText = `Q: ${card.question}\nA: ${card.answer}`;
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
      text: `Q: ${card.question}\nA: ${card.answer}`,
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

  // Format date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-6">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                <Brain className="h-6 w-6 text-indigo-600" />
                Memory Card Preview
                {isAIGenerated && (
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="flex items-center bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-full px-3 py-1 border border-indigo-200 dark:border-indigo-800"
                  >
                    <Sparkles className="h-4 w-4 text-indigo-500 dark:text-indigo-400 mr-1" />
                    <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">AI Generated</span>
                  </motion.div>
                )}
              </DialogTitle>
              <DialogDescription className="text-base mt-2">
                Preview and interact with this memory card
              </DialogDescription>
            </div>
            
            {showActions && (
              <div className="flex gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => handlePlayAudio(card.question)}>
                        <Volume2 className={cn("h-4 w-4", isPlaying && "animate-pulse")} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Read Question Aloud</TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" onClick={handleCopyCard}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Copy Card</TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" onClick={handleShareCard}>
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Share Card</TooltipContent>
                  </Tooltip>
                  
                  {onEdit && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="sm" onClick={onEdit}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Edit Card</TooltipContent>
                    </Tooltip>
                  )}
                  
                  {onStartReview && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button size="sm" onClick={onStartReview} className="bg-indigo-600 hover:bg-indigo-700">
                          <Play className="h-4 w-4 mr-2" />
                          Review
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Start Review Session</TooltipContent>
                    </Tooltip>
                  )}
                </TooltipProvider>
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card Preview - Takes 2/3 of space on large screens */}
          <div className="lg:col-span-2">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 min-h-[400px] flex items-center justify-center">
              <ModernMemoryCard
                card={card}
                onEdit={() => onEdit?.()}
                onDelete={() => {}} // Empty function since we don't delete from preview
                showActions={false}
                isPreviewMode={true}
                className="max-w-md"
              />
            </div>
          </div>

          {/* Card Stats and Info - Takes 1/3 of space */}
          <div className="space-y-6">
            {/* Status Badges */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <BarChart2 className="h-5 w-5 text-gray-600" />
                Card Status
              </h3>
              
              <div className="space-y-2">
                <Badge className={cn("w-full justify-start text-sm py-2", dueStatus.color)}>
                  <span className="mr-2">{dueStatus.icon}</span>
                  {dueStatus.label}
                </Badge>
                
                <Badge className={cn("w-full justify-start text-sm py-2", difficultyInfo.color)}>
                  <span className="mr-2">{difficultyInfo.icon}</span>
                  {difficultyInfo.label} Level
                </Badge>
                
                <Badge className={cn("w-full justify-start text-sm py-2", performanceInfo.color)}>
                  <span className="mr-2">{performanceInfo.icon}</span>
                  {performanceInfo.label} Performance
                </Badge>
              </div>
            </div>

            {/* Performance Statistics */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Target className="h-5 w-5 text-gray-600" />
                Statistics
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-center">
                  <div className="flex items-center justify-center mb-1">
                    <ThumbsUp className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-300">Correct</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">{card.correctCount || 0}</div>
                </div>
                
                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg text-center">
                  <div className="flex items-center justify-center mb-1">
                    <ThumbsDown className="h-4 w-4 text-red-600 mr-1" />
                    <span className="text-sm font-medium text-red-700 dark:text-red-300">Incorrect</span>
                  </div>
                  <div className="text-2xl font-bold text-red-600">{card.incorrectCount || 0}</div>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Clock className="h-4 w-4 text-blue-600 mr-1" />
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Reviews</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">{card.repetitionCount || 0}</div>
                </div>
                
                <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Award className="h-4 w-4 text-purple-600 mr-1" />
                    <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Success</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-600">{successRate}%</div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gray-600" />
                Timeline
              </h3>
              
              <div className="space-y-3 text-sm">
                {card.lastReviewed && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-400">Last Reviewed</span>
                    <span className="font-medium">{formatDate(card.lastReviewed)}</span>
                  </div>
                )}
                
                {card.nextReviewDue && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-400">Next Review Due</span>
                    <span className="font-medium">{formatDate(card.nextReviewDue)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            {showActions && (
              <div className="space-y-3">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Zap className="h-5 w-5 text-gray-600" />
                  Quick Actions
                </h3>
                
                <div className="space-y-2">
                  {onStartReview && (
                    <Button 
                      onClick={onStartReview} 
                      className="w-full bg-indigo-600 hover:bg-indigo-700"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Review Session
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline" 
                    onClick={() => handlePlayAudio(`${card.question}. ${card.answer}`)}
                    className="w-full"
                    disabled={isPlaying}
                  >
                    <Volume2 className={cn("h-4 w-4 mr-2", isPlaying && "animate-pulse")} />
                    Play Full Card
                  </Button>
                  
                  {onEdit && (
                    <Button variant="outline" onClick={onEdit} className="w-full">
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit Card
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Card Content Display */}
        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Question */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-lg flex items-center gap-2">
                  <Brain className="h-5 w-5 text-blue-600" />
                  Question
                </h4>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handlePlayAudio(card.question)}
                  disabled={isPlaying}
                >
                  <Volume2 className={cn("h-4 w-4", isPlaying && "animate-pulse")} />
                </Button>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                  {card.question}
                </p>
              </div>
            </div>

            {/* Answer */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-lg flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-green-600" />
                  Answer
                </h4>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handlePlayAudio(card.answer)}
                  disabled={isPlaying}
                >
                  <Volume2 className={cn("h-4 w-4", isPlaying && "animate-pulse")} />
                </Button>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                  {card.answer}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* AI Generation Notice */}
        {isAIGenerated && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 rounded-full">
                <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h5 className="font-medium text-indigo-900 dark:text-indigo-100">AI-Generated Content</h5>
                <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-1">
                  This card was automatically generated using artificial intelligence to help you learn more effectively.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MemoryCardPreviewDialog; 