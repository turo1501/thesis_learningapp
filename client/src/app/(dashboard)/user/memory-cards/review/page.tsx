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
  AlertTriangle
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
      return () => clearTimeout(timer);
    }
  }, [reviewComplete]);

  if (!isLoaded) return <Loading />;
  
  if (isLoadingDueCards) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh]">
        <div className="text-indigo-500 animate-pulse">
          <Brain className="h-16 w-16" />
        </div>
        <h2 className="mt-4 text-xl font-semibold">Loading your review session...</h2>
        <p className="mt-2 text-gray-500">Preparing your memory cards</p>
      </div>
    );
  }

  if (dueCardsError || errorDetails) {
    const isDeckNotFound = errorDetails?.toLowerCase().includes("deck not found");
    
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="text-amber-500 mb-4">
          <AlertTriangle className="h-16 w-16" />
        </div>
        <h2 className="text-2xl font-bold mb-2">
          {isDeckNotFound ? "Deck Not Found" : "Error Loading Review Cards"}
        </h2>
        <p className="text-gray-600 mb-6 text-center max-w-md">
          {isDeckNotFound 
            ? "The deck you're trying to review could not be found. It may have been deleted or you might not have access to it."
            : `We encountered a problem loading your review cards: ${errorDetails || "Unknown error"}`
          }
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            onClick={() => router.push("/user/memory-cards")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Return to Memory Cards
          </Button>
          {isDeckNotFound && (
            <Link href="/user/memory-cards/new">
              <Button variant="outline">
                Create New Deck
              </Button>
            </Link>
          )}
        </div>
      </div>
    );
  }

  if (!dueCards || dueCards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="text-indigo-500 mb-4">
          <CheckCircle2 className="h-16 w-16" />
        </div>
        <h2 className="text-2xl font-bold mb-2">No cards due for review</h2>
        <p className="text-gray-600 mb-6 text-center max-w-md">
          You're all caught up! There are no cards due for review at this time.
          Come back later or add more cards to your deck.
        </p>
        <Button 
          onClick={() => router.push(deckId ? `/user/memory-cards/${deckId}` : "/user/memory-cards")}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          Return to {deckId ? "Deck" : "Memory Cards"}
        </Button>
      </div>
    );
  }

  if (reviewComplete) {
    return (
      <div className="w-full max-w-5xl mx-auto px-4 py-8">
        {showCompletionConfetti && <Confetti duration={5000} particleCount={150} />}
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <div className="relative inline-block">
              <Award className="h-24 w-24 text-yellow-500" />
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
                <Sparkles className="h-24 w-24 text-yellow-400" />
              </motion.div>
            </div>
          </motion.div>

          <motion.h1 
            className="text-3xl font-bold mb-2"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Great job!
          </motion.h1>
          
          <motion.p 
            className="text-xl text-gray-600 mb-8"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            You've completed your review session
          </motion.p>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl w-full mb-10"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col items-center">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full mb-3">
                <Target className="h-6 w-6 text-blue-500" />
              </div>
              <div className="text-3xl font-bold">{calculateAccuracy()}%</div>
              <div className="text-sm text-gray-500">Accuracy</div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col items-center">
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full mb-3">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              </div>
              <div className="text-3xl font-bold">{correctCount}</div>
              <div className="text-sm text-gray-500">Correct Answers</div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col items-center">
              <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full mb-3">
                <Clock className="h-6 w-6 text-purple-500" />
              </div>
              <div className="text-3xl font-bold">{formatTime(sessionDuration)}</div>
              <div className="text-sm text-gray-500">Time Spent</div>
            </div>
          </motion.div>

          <motion.div 
            className="flex flex-col sm:flex-row gap-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <Button 
              onClick={handleContinueReview} 
              disabled={totalDue <= 0}
              className={cn(
                "flex items-center",
                totalDue > 0 ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "bg-gray-200 text-gray-500"
              )}
            >
              {totalDue > 0 ? (
                <>
                  <Gift className="mr-2 h-4 w-4" />
                  Review More Cards ({totalDue})
                </>
              ) : (
                "No More Cards Due"
              )}
            </Button>
            
            <Button 
              onClick={handleFinishReview} 
              variant="outline"
              className="flex items-center"
            >
              <ArrowRight className="mr-2 h-4 w-4" />
              Return to Deck
            </Button>
          </motion.div>
        </div>
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
    <div className="w-full max-w-5xl mx-auto px-4 py-16">
      <div className="flex justify-between items-center mb-12">
        <Button
          variant="ghost"
          onClick={handleFinishReview}
          className="text-gray-500"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Exit Review
        </Button>
        
        <div className="flex items-center">
          <div className="flex items-center mr-6 text-gray-600">
            <Clock className="mr-2 h-5 w-5" />
            <span className="font-mono">{formatTime(sessionDuration)}</span>
          </div>
          <div className="text-sm font-medium">
            Card {cardIndex + 1} of {dueCards.length}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {currentCard && (
            <motion.div
              key={currentCard.cardId}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
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