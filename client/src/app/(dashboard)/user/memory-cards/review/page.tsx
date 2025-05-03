"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { 
  ChevronLeft, 
  Brain, 
  Clock, 
  Award, 
  Target, 
  CheckCircle2, 
  XCircle,
  Gift,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  Home,
  Bookmark,
  CalendarClock,
  TrendingUp,
  Flame,
  Trophy,
  Zap,
  Star
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useMemoryCardReview } from "@/hooks/useMemoryCardReview";
import Loading from "@/components/Loading";
import { toast } from "sonner";
import { Confetti } from "@/components/ui/Confetti";
import ModernReviewCard from "@/components/memory-cards/ModernReviewCard";
import { cn } from "@/lib/utils";
import Link from "next/link";

const MemoryCardReviewPage = () => {
  const searchParams = useSearchParams();
  const deckId = searchParams.get("deckId");
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [showCompletionConfetti, setShowCompletionConfetti] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [reviewStreak, setReviewStreak] = useState(0);
  const [showMotivation, setShowMotivation] = useState(false);
  const [motivationMessage, setMotivationMessage] = useState("");

  const {
    dueCards,
    currentCard,
    cardIndex,
    isFlipped,
    reviewComplete,
    correctCount,
    sessionDuration,
    totalDue,
    isLoadingDueCards,
    isSubmittingReview,
    dueCardsError,
    errorMessage,
    formatTime,
    calculateAccuracy,
    handleFlipCard,
    handleRateCard,
    handleFinishReview,
    handleContinueReview,
  } = useMemoryCardReview({
    userId: user?.id || null,
    deckId: deckId || undefined,
  });

  // Extract error details
  useEffect(() => {
    if (dueCardsError) {
      console.error("Due cards error:", dueCardsError);
      
      // Try to extract a meaningful error message
      let message = "Failed to load review cards";
      if (typeof dueCardsError === 'object' && dueCardsError !== null) {
        // @ts-ignore - error object structure may vary
        if (dueCardsError.data?.message) {
          // @ts-ignore
          message = dueCardsError.data.message;
        // @ts-ignore
        } else if (dueCardsError.error) {
          // @ts-ignore
          message = dueCardsError.error;
        }
      }
      
      // Set error details for display
      setErrorDetails(message);
      
      // Show toast notification
      toast.error(message);
    }
  }, [dueCardsError]);

  useEffect(() => {
    if (errorMessage) {
      setErrorDetails(errorMessage);
    }
  }, [errorMessage]);

  useEffect(() => {
    if (reviewComplete) {
      setShowCompletionConfetti(true);
      const timer = setTimeout(() => setShowCompletionConfetti(false), 5000);

      // Calculate streak based on accuracy
      const accuracy = calculateAccuracy();
      if (accuracy > 80) {
        setReviewStreak(prev => prev + 1);
        localStorage.setItem('reviewStreak', String(reviewStreak + 1));
      }
      
      return () => clearTimeout(timer);
    }
  }, [reviewComplete, calculateAccuracy]);

  // Load previous streak
  useEffect(() => {
    const storedStreak = localStorage.getItem('reviewStreak');
    if (storedStreak) {
      setReviewStreak(parseInt(storedStreak, 10));
    }
  }, []);

  // Motivation messages
  useEffect(() => {
    if (cardIndex > 0 && cardIndex % 3 === 0 && !reviewComplete && !showMotivation) {
      const messages = [
        "You're making great progress! Keep it up! 🎯",
        "Your brain is getting stronger with each card! 💪",
        "Learning takes consistency - you're doing great! ✨",
        "Memory champions are made one card at a time! 🏆"
      ];
      setMotivationMessage(messages[Math.floor(Math.random() * messages.length)]);
      setShowMotivation(true);
      
      const timer = setTimeout(() => {
        setShowMotivation(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [cardIndex, reviewComplete, showMotivation]);

  if (!isLoaded) return <Loading />;
  
  if (isLoadingDueCards) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div 
          className="relative"
          animate={{ 
            scale: [1, 1.05, 1],
          }}
          transition={{ 
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut" 
          }}
        >
          <div className="absolute -inset-8 rounded-full bg-indigo-100 dark:bg-indigo-900/20 blur-xl opacity-70" />
          <div className="relative text-indigo-500">
            <Brain className="h-20 w-20" />
          </div>
        </motion.div>
        <motion.h2 
          className="mt-8 text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Loading your review session...
        </motion.h2>
        <motion.p 
          className="mt-2 text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          Preparing your personalized learning experience
        </motion.p>
        
        <motion.div 
          className="mt-6 w-48 h-1 bg-gray-200 rounded-full overflow-hidden"
          initial={{ width: 0 }}
          animate={{ width: "12rem" }}
          transition={{ delay: 0.7, duration: 0.8 }}
        >
          <motion.div 
            className="h-full bg-gradient-to-r from-indigo-600 to-blue-600"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>
      </div>
    );
  }

  if (dueCardsError || errorDetails) {
    const isDeckNotFound = errorDetails?.toLowerCase().includes("deck not found");
    
    return (
      <motion.div 
        className="flex flex-col items-center justify-center min-h-[70vh]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="text-amber-500 mb-6"
          initial={{ scale: 0, rotate: 180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            type: "spring",
            stiffness: 260,
            damping: 20,
            duration: 0.6
          }}
        >
          <AlertTriangle className="h-24 w-24" />
        </motion.div>
        <motion.h2 
          className="text-2xl md:text-3xl font-bold mb-3 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {isDeckNotFound ? "Deck Not Found" : "Error Loading Review Cards"}
        </motion.h2>
        <motion.p 
          className="text-gray-600 mb-8 text-center max-w-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          {isDeckNotFound 
            ? "The deck you're trying to review could not be found. It may have been deleted or you might not have access to it."
            : `We encountered a problem loading your review cards: ${errorDetails || "Unknown error"}`
          }
        </motion.p>
        <motion.div 
          className="flex flex-col sm:flex-row gap-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <Button 
            onClick={() => router.push("/user/memory-cards")}
            className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white transition-all flex items-center gap-2"
            size="lg"
          >
            <Home className="h-4 w-4" />
            Return to Memory Cards
          </Button>
          {isDeckNotFound && (
            <Link href="/user/memory-cards/create">
              <Button variant="outline" size="lg" className="gap-2">
                <Bookmark className="h-4 w-4" />
                Create New Deck
              </Button>
            </Link>
          )}
        </motion.div>
      </motion.div>
    );
  }

  if (!dueCards || dueCards.length === 0) {
    return (
      <motion.div 
        className="flex flex-col items-center justify-center min-h-[70vh]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="relative mb-8"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ 
            type: "spring",
            stiffness: 260,
            damping: 20 
          }}
        >
          <motion.div 
            className="absolute inset-0 rounded-full"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5],
              background: [
                "radial-gradient(circle, rgba(99,102,241,0.3) 0%, rgba(99,102,241,0) 70%)",
                "radial-gradient(circle, rgba(79,70,229,0.3) 0%, rgba(79,70,229,0) 70%)",
                "radial-gradient(circle, rgba(99,102,241,0.3) 0%, rgba(99,102,241,0) 70%)"
              ]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut" 
            }}
          />
          <CheckCircle2 className="h-24 w-24 text-green-500 relative z-10" />
        </motion.div>
        
        <motion.h2 
          className="text-2xl md:text-3xl font-bold mb-3 text-center bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          You're all caught up!
        </motion.h2>
        
        <motion.p 
          className="text-gray-600 mb-8 text-center max-w-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          You've reviewed all the cards due for today. Great job maintaining your study schedule!
        </motion.p>
        
        <motion.div 
          className="flex flex-col sm:flex-row gap-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <Button 
            onClick={() => router.push(deckId ? `/user/memory-cards/${deckId}` : "/user/memory-cards")}
            className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white transition-all flex items-center gap-2"
            size="lg"
          >
            <ArrowRight className="h-4 w-4" />
            Return to {deckId ? "Deck" : "Memory Cards"}
          </Button>
          
          <Link href="/user/memory-cards/create">
            <Button variant="outline" size="lg" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Create New Cards
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    );
  }

  if (reviewComplete) {
    return (
      <div className="w-full max-w-5xl mx-auto px-4 py-8">
        {showCompletionConfetti && <Confetti duration={5000} particleCount={200} />}
        <motion.div 
          className="flex flex-col items-center justify-center min-h-[70vh] text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              type: "spring",
              stiffness: 260,
              damping: 20 
            }}
            className="mb-8 relative"
          >
            <div className="relative inline-block">
              <Trophy className="h-28 w-28 text-yellow-500" />
              <motion.div
                className="absolute inset-0"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.8, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Sparkles className="h-28 w-28 text-yellow-400" />
              </motion.div>
            </div>
            
            {/* Animated stars around the trophy */}
            <motion.div
              className="absolute top-0 right-0 -mr-6 -mt-4"
              animate={{ 
                rotate: 360,
                scale: [1, 1.2, 1]
              }}
              transition={{ 
                rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }}
            >
              <Star className="h-6 w-6 text-yellow-400" />
            </motion.div>
            <motion.div
              className="absolute bottom-0 left-0 -ml-6 -mb-4"
              animate={{ 
                rotate: -360,
                scale: [1, 1.2, 1]
              }}
              transition={{ 
                rotate: { duration: 25, repeat: Infinity, ease: "linear" },
                scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
              }}
            >
              <Star className="h-5 w-5 text-yellow-400" />
            </motion.div>
          </motion.div>

          <motion.h1 
            className="text-3xl md:text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-amber-500"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Review Complete!
          </motion.h1>
          
          <motion.p 
            className="text-xl text-gray-600 mb-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Excellent work strengthening your memory
          </motion.p>
          
          {reviewStreak > 1 && (
            <motion.div
              className="mb-6 flex items-center gap-2 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 px-4 py-2 rounded-full"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <Flame className="h-5 w-5 text-orange-500" />
              <span className="font-medium text-orange-700 dark:text-orange-400">{reviewStreak} day streak!</span>
            </motion.div>
          )}

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl w-full mb-10"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <motion.div 
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-indigo-100 dark:border-indigo-900/30"
              whileHover={{ y: -5, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
              transition={{ duration: 0.2 }}
            >
              <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-500" />
              <div className="p-6 flex flex-col items-center">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full mb-3">
                  <Target className="h-6 w-6 text-blue-500" />
                </div>
                <div className="text-3xl font-bold">{calculateAccuracy()}%</div>
                <div className="text-sm text-gray-500">Accuracy</div>
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-green-100 dark:border-green-900/30"
              whileHover={{ y: -5, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
              transition={{ duration: 0.2 }}
            >
              <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-500" />
              <div className="p-6 flex flex-col items-center">
                <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full mb-3">
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                </div>
                <div className="text-3xl font-bold">{correctCount}</div>
                <div className="text-sm text-gray-500">Correct Answers</div>
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-purple-100 dark:border-purple-900/30"
              whileHover={{ y: -5, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
              transition={{ duration: 0.2 }}
            >
              <div className="h-2 bg-gradient-to-r from-purple-500 to-violet-500" />
              <div className="p-6 flex flex-col items-center">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full mb-3">
                  <Clock className="h-6 w-6 text-purple-500" />
                </div>
                <div className="text-3xl font-bold">{formatTime(sessionDuration)}</div>
                <div className="text-sm text-gray-500">Time Spent</div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div 
            className="flex flex-col sm:flex-row gap-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            {totalDue > 0 && (
              <Button 
                onClick={handleContinueReview} 
                className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white transition-all flex items-center gap-2"
                size="lg"
              >
                <Zap className="h-4 w-4" />
                Review More Cards ({totalDue})
              </Button>
            )}
            
            <Button 
              onClick={handleFinishReview} 
              variant={totalDue > 0 ? "outline" : "default"}
              size="lg"
              className={cn(
                "flex items-center gap-2",
                !totalDue && "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white"
              )}
            >
              <ArrowRight className="h-4 w-4" />
              Return to Deck
            </Button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Ensure we have a valid current card before rendering
  if (!currentCard) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="text-amber-500 mb-4">
          <AlertTriangle className="h-16 w-16" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Card Data Error</h2>
        <p className="text-gray-600 mb-6 text-center max-w-md">
          We encountered an issue with the current card data. 
          Please try reloading the page or returning to your memory cards.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            onClick={() => window.location.reload()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Reload
          </Button>
          <Button 
            onClick={() => router.push("/user/memory-cards")}
            variant="outline"
          >
            Return to Memory Cards
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      <motion.div 
        className="flex justify-between items-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Button
          variant="ghost"
          onClick={handleFinishReview}
          className="text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Exit Review
        </Button>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center text-gray-600 bg-gray-50 dark:bg-gray-800/50 px-3 py-1.5 rounded-full">
            <Clock className="mr-2 h-4 w-4 text-indigo-500" />
            <span className="font-mono text-sm font-medium">{formatTime(sessionDuration)}</span>
          </div>
          <div className="flex items-center bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-full">
            <TrendingUp className="mr-2 h-4 w-4 text-indigo-500" />
            <span className="font-medium text-sm">
              {cardIndex + 1} / {dueCards.length}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Progress bar */}
      <motion.div 
        className="w-full h-1 bg-gray-200 rounded-full mb-10 overflow-hidden"
        initial={{ width: 0 }}
        animate={{ width: "100%" }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="h-full bg-gradient-to-r from-indigo-500 to-blue-500"
          initial={{ width: "0%" }}
          animate={{ width: `${((cardIndex) / dueCards.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>

      {/* Motivation message */}
      <AnimatePresence>
        {showMotivation && (
          <motion.div 
            className="flex justify-center mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/30 px-6 py-3 rounded-lg flex items-center gap-3 shadow-md">
              <Sparkles className="h-5 w-5 text-indigo-500" />
              <p className="text-indigo-700 dark:text-indigo-300 font-medium">{motivationMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {currentCard && (
            <motion.div
              key={currentCard.cardId}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ 
                type: "spring",
                stiffness: 300,
                damping: 30,
                duration: 0.5 
              }}
              className="w-full"
            >
              <ModernReviewCard
                card={currentCard}
                onRate={handleRateCard}
                isSubmitting={isSubmittingReview}
                totalRemaining={dueCards.length}
                currentPosition={cardIndex + 1}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MemoryCardReviewPage; 