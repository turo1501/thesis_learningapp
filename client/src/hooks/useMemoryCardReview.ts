import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { 
  useGetDueCardsQuery,
  useSubmitCardReviewMutation,
  MemoryCard
} from '@/state/api';

interface UseMemoryCardReviewOptions {
  userId?: string | null;
  deckId?: string;
  courseId?: string;
  limit?: number;
}

export const useMemoryCardReview = ({
  userId,
  deckId,
  courseId,
  limit = 20
}: UseMemoryCardReviewOptions = {}) => {
  const router = useRouter();
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [reviewComplete, setReviewComplete] = useState(false);
  const [reviewedCards, setReviewedCards] = useState<MemoryCard[]>([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Add helpful debug logs
  useEffect(() => {
    console.log('Memory card review params:', { userId, deckId, courseId, limit });
  }, [userId, deckId, courseId, limit]);
  
  // Get cards for review
  const {
    data: dueCardsData,
    isLoading: isLoadingDueCards,
    error: dueCardsError,
    refetch: refetchDueCards,
    isFetching: isFetchingDueCards
  } = useGetDueCardsQuery(
    {
      userId: userId || '',
      deckId: deckId, // Pass deckId directly to the API
      courseId: courseId,
      limit,
    },
    {
      skip: !userId,
      // Add safer error handling for malformed responses
      refetchOnMountOrArgChange: true,
      refetchOnFocus: false,
    }
  );
  
  // Safely extract due cards with fallback to empty array
  const dueCards = dueCardsData?.dueCards || [];
  
  // Log the received data for debugging
  useEffect(() => {
    if (dueCardsData) {
      console.log('Due cards data received:', 
        { totalDue: dueCardsData.totalDue, cardCount: dueCards.length });
    }
  }, [dueCardsData, dueCards.length]);
  
  // Handle API errors
  useEffect(() => {
    if (dueCardsError) {
      console.error('Error fetching due cards:', dueCardsError);
      let message = 'Failed to load review cards';
      
      // Extract more specific error message if available
      if (typeof dueCardsError === 'object' && dueCardsError !== null) {
        // @ts-ignore - error object structure may vary
        if (dueCardsError.status === 404) {
          message = 'This deck does not exist or has no cards due for review';
          
          // Check for more detailed message in the error response
          // @ts-ignore
          if (dueCardsError.data?.message) {
            // @ts-ignore
            const apiMessage = dueCardsError.data.message;
            if (apiMessage.includes('Deck not found')) {
              message = 'The deck you are trying to review does not exist';
            } else if (apiMessage.includes('No due cards')) {
              message = 'No cards are currently due for review in this deck';
            }
          }
        } else {
          // @ts-ignore
          if (dueCardsError.data?.message) {
            // @ts-ignore
            message = dueCardsError.data.message;
          // @ts-ignore
          } else if (dueCardsError.error) {
            // @ts-ignore
            message = dueCardsError.error;
          }
        }
      }
      
      setErrorMessage(message);
      
      // Only show toast for non-404 errors, as 404 is handled specially in UI
      if (!(typeof dueCardsError === 'object' && 
           dueCardsError !== null && 
           'status' in dueCardsError && 
           dueCardsError.status === 404)) {
        toast.error(message);
      }
    }
  }, [dueCardsError]);
  
  const [submitReview, { isLoading: isSubmittingReview }] = useSubmitCardReviewMutation();
  
  // Initialize session timer, making sure to start it only when data is successfully loaded
  useEffect(() => {
    if (dueCards.length > 0 && !sessionStartTime && !isLoadingDueCards && !isFetchingDueCards) {
      console.log('Starting review session with', dueCards.length, 'cards');
      
      // Log details of the first card for debugging
      if (dueCards[0]) {
        console.log('First card details:', {
          cardId: dueCards[0].cardId,
          question: dueCards[0].question?.substring(0, 30) + (dueCards[0].question?.length > 30 ? '...' : ''),
          hasAnswer: !!dueCards[0].answer,
          deckId: dueCards[0].deckId,
        });
      }
      
      setSessionStartTime(Date.now());
      
      // Set up timer to track session duration
      timerRef.current = setInterval(() => {
        if (sessionStartTime) {
          setSessionDuration(Math.floor((Date.now() - sessionStartTime) / 1000));
        }
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [dueCards, sessionStartTime, isLoadingDueCards, isFetchingDueCards]);
  
  // Force refetch if no cards are found initially but deckId is provided
  // This helps with race conditions where a deck was just created
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    
    if (!isLoadingDueCards && !isFetchingDueCards && dueCards.length === 0 && deckId) {
      console.log('No cards found initially but deckId is provided, scheduling refetch');
      
      // Check if we already have an error indicating deck not found
      const isDeckNotFound = dueCardsError && 
        typeof dueCardsError === 'object' && 
        'status' in dueCardsError && 
        dueCardsError.status === 404;
      
      if (isDeckNotFound) {
        console.log('Deck not found (404), skipping refetch');
        // Set an appropriate error message
        setErrorMessage('This deck does not exist or has no cards available for review');
        return;
      }
      
      // Increased timeout to give backend more time to process cards
      timeoutId = setTimeout(() => {
        console.log('Performing scheduled refetch for deckId:', deckId);
        
        // First verify if the deck exists by checking for associated decks
        // This helps prevent 404 errors when trying to review a non-existent deck
        refetchDueCards().catch(error => {
          console.error('Error during refetch:', error);
          if (error.status === 404) {
            setErrorMessage('This deck does not exist or has no cards available for review');
            toast.error('Cannot find the requested deck for review');
          }
        });
      }, 2500); // Increased delay for better reliability
    }
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [dueCards.length, deckId, isLoadingDueCards, isFetchingDueCards, refetchDueCards, dueCardsError]);
  
  // Reset card index if it's out of bounds
  useEffect(() => {
    if (dueCards.length > 0 && cardIndex >= dueCards.length) {
      console.log('Card index out of bounds, resetting to 0');
      setCardIndex(0);
    }
  }, [dueCards.length, cardIndex]);
  
  // Current card being reviewed with safety check
  const currentCard = dueCards.length > 0 && cardIndex < dueCards.length 
    ? dueCards[cardIndex] 
    : null;
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  const handleFlipCard = () => {
    setIsFlipped(true);
  };
  
  const handleRateCard = async (difficultyRating: number) => {
    if (!userId || !currentCard) {
      console.error('Cannot rate card: userId or currentCard is missing', { userId, cardIndex, hasCurrentCard: !!currentCard });
      toast.error('Cannot rate card: missing required data');
      return;
    }
    
    // Ensure we have a valid deckId to submit the review
    const cardDeckId = currentCard.deckId || deckId;
    if (!cardDeckId) {
      console.error('Cannot rate card: missing deckId', { currentCard });
      toast.error('Cannot rate card: missing deck information');
      return;
    }
    
    try {
      console.log('Submitting card review:', { 
        cardId: currentCard.cardId,
        deckId: cardDeckId,
        difficultyRating
      });
      
      // Check if rating indicates correctness (1=hard/incorrect, 3=medium, 5=easy/correct)
      // Align with ModernReviewCard ratings (1=hard, 3=good, 5=easy)
      const isCorrect = difficultyRating >= 3;
      
      // Add to correct count if the user got it right
      if (isCorrect) {
        setCorrectCount((prev) => prev + 1);
      }
      
      // Submit the review to the API
      await submitReview({
        userId,
        deckId: cardDeckId,
        cardId: currentCard.cardId,
        difficultyRating,
        isCorrect,
      }).unwrap();
      
      // Add current card to reviewed cards
      setReviewedCards((prev) => [...prev, currentCard]);
      
      // Move to next card or end review if no more cards
      if (cardIndex + 1 < dueCards.length) {
        setCardIndex((prev) => prev + 1);
        setIsFlipped(false);
      } else {
        setReviewComplete(true);
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review. Please try again.');
    }
  };
  
  const handleFinishReview = () => {
    router.push(deckId ? `/user/memory-cards/${deckId}` : '/user/memory-cards', { scroll: false });
  };
  
  const handleContinueReview = () => {
    // Refetch due cards to get a fresh set
    refetchDueCards().then((result) => {
      console.log('Refetched due cards:', result);
      if (result.isSuccess && result.data?.dueCards?.length > 0) {
        setCardIndex(0);
        setIsFlipped(false);
        setReviewComplete(false);
        setReviewedCards([]);
        setCorrectCount(0);
        setSessionStartTime(Date.now());
        setSessionDuration(0);
      } else {
        // Handle the case when no more cards are available
        toast.info('No more cards available for review right now.');
        handleFinishReview();
      }
    }).catch(error => {
      console.error('Error refreshing due cards:', error);
      toast.error('Failed to load more cards for review');
    });
  };
  
  const calculateAccuracy = () => {
    return reviewedCards.length > 0 
      ? Math.round((correctCount / reviewedCards.length) * 100) 
      : 0;
  };
  
  // Additional helper to check if a specific deck exists
  const isDeckAvailable = !isLoadingDueCards && !dueCardsError && dueCards.length > 0;
  
  return {
    // Data
    dueCards,
    currentCard,
    cardIndex,
    isFlipped,
    reviewComplete,
    reviewedCards,
    correctCount,
    sessionDuration,
    totalDue: dueCardsData?.totalDue || 0,
    errorMessage,
    isDeckAvailable,
    
    // Loading states
    isLoadingDueCards: isLoadingDueCards || isFetchingDueCards,
    isSubmittingReview,
    
    // Error state
    dueCardsError,
    
    // Helper methods
    formatTime,
    calculateAccuracy,
    
    // Actions
    handleFlipCard,
    handleRateCard,
    handleFinishReview,
    handleContinueReview,
  };
}; 