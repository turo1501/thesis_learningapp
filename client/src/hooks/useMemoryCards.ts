import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { 
  useGetUserDecksQuery, 
  useGetDeckQuery,
  useCreateDeckMutation,
  useDeleteDeckMutation,
  useAddCardMutation,
  useUpdateCardMutation,
  useDeleteCardMutation,
  useGenerateCardsFromCourseMutation,
  MemoryCardDeck,
  MemoryCard
} from '@/state/api';

// Define response type for clarity
type SimpleDeck = MemoryCardDeck & {
  type: "simple";
};

type DeckWithGeneratedCards = {
  deck: MemoryCardDeck;
  cardsGenerated: number;
  type: "generated";
};

type CreateDeckResult = SimpleDeck | DeckWithGeneratedCards | null;

interface UseMemoryCardsOptions {
  userId?: string | null;
  deckId?: string | null;
  skipInitialFetch?: boolean;
}

export const useMemoryCards = ({ userId, deckId, skipInitialFetch = false }: UseMemoryCardsOptions = {}) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortBy, setSortBy] = useState<"created" | "difficulty" | "performance">("created");
  const [isCardFormOpen, setIsCardFormOpen] = useState<boolean>(false);
  const [editingCard, setEditingCard] = useState<MemoryCard | null>(null);
  const [isGeneratingCards, setIsGeneratingCards] = useState<boolean>(false);
  
  // Query to get user decks
  const {
    data: decksData,
    isLoading: isLoadingDecks,
    error: decksError,
    refetch: refetchDecks,
  } = useGetUserDecksQuery(userId || "", {
    skip: !userId || skipInitialFetch,
  });
  
  // Query to get a specific deck
  const {
    data: deckData,
    isLoading: isLoadingDeck,
    error: deckError,
    refetch: refetchDeck,
  } = useGetDeckQuery(
    { userId: userId || "", deckId: deckId || "" },
    { skip: !userId || !deckId || skipInitialFetch }
  );
  
  // Define mutations
  const [createDeck] = useCreateDeckMutation();
  const [deleteDeck] = useDeleteDeckMutation();
  const [addCard] = useAddCardMutation();
  const [updateCard] = useUpdateCardMutation();
  const [deleteCard] = useDeleteCardMutation();
  const [generateCards] = useGenerateCardsFromCourseMutation();
  
  // Get the deck if deckId is provided
  const deck = deckData || null;
  
  // Enhanced logging for debugging
  useEffect(() => {
    if (deckData) {
      console.log('Received deck data:', JSON.stringify({
        deckId: deckData.deckId,
        title: deckData.title,
        cardsLength: Array.isArray(deckData.cards) ? deckData.cards.length : 'cards not an array',
        cardsType: deckData.cards ? typeof deckData.cards : 'cards property missing',
        fullData: deckData
      }, null, 2));
    }
  }, [deckData]);
  
  // Extract cards from deck data with enhanced error handling
  const extractCards = (deckData: any): MemoryCard[] => {
    if (!deckData) {
      console.log('No deck data provided to extractCards');
      return [];
    }
    
    console.log('Extracting cards from deck data:', 
      typeof deckData, 
      deckData ? `Has cards: ${!!deckData.cards}` : 'null data'
    );
    
    // If data has a nested 'data' property structure (common in some API responses)
    if (deckData.data && deckData.data.cards) {
      console.log('Found cards in nested data property', 
        Array.isArray(deckData.data.cards) ? deckData.data.cards.length : 'not an array');
      
      if (Array.isArray(deckData.data.cards)) {
        return deckData.data.cards;
      }
    }
    
    // Direct cards access
    if (deckData.cards) {
      if (Array.isArray(deckData.cards)) {
        console.log('Found cards in direct cards property', deckData.cards.length);
        return deckData.cards;
      } else {
        console.warn('Cards property exists but is not an array:', typeof deckData.cards);
        
        // Try to parse cards if it's a string (sometimes APIs return stringified JSON)
        if (typeof deckData.cards === 'string') {
          try {
            const parsedCards = JSON.parse(deckData.cards);
            if (Array.isArray(parsedCards)) {
              console.log('Parsed cards from string', parsedCards.length);
              return parsedCards;
            } else {
              console.warn('Parsed cards is not an array:', typeof parsedCards);
            }
          } catch (e) {
            console.error('Failed to parse cards string:', e);
          }
        }
        
        // Last resort - convert to array if it's an object with numeric keys
        if (typeof deckData.cards === 'object' && deckData.cards !== null) {
          try {
            const cardValues = Object.values(deckData.cards);
            if (Array.isArray(cardValues) && cardValues.length > 0) {
              console.log('Converted object cards to array', cardValues.length);
              return cardValues as MemoryCard[];
            }
          } catch (e) {
            console.error('Failed to convert cards object to array:', e);
          }
        }
      }
    }
    
    // If we've reached here, log a warning and return empty array
    console.warn('No valid cards found in deck data. Full deck data:', JSON.stringify(deckData, null, 2));
    return [];
  };
  
  // Sort and filter cards based on search term and sort criteria with enhanced error handling
  const deckCards = extractCards(deck);
  const filteredCards = deckCards
    .filter((card) => {
      // Skip invalid cards
      if (!card || typeof card !== 'object') {
        console.warn('Invalid card found in deck:', card);
        return false;
      }
      
      if (!searchTerm) return true;
      
      const searchTermLower = searchTerm.toLowerCase();
      // Handle potential undefined values safely
      const question = (card.question || '').toLowerCase();
      const answer = (card.answer || '').toLowerCase();
      return question.includes(searchTermLower) || answer.includes(searchTermLower);
    })
    .sort((a, b) => {
      // Default sorting if cards are invalid
      if (!a || !b) return 0;
      
      if (sortBy === "created") {
        // Sort by lastReviewed time or fallback to current time if not available
        const aTime = a.lastReviewed || Date.now();
        const bTime = b.lastReviewed || Date.now();
        return bTime - aTime; // Descending order - newest first
      } else if (sortBy === "difficulty") {
        const aDifficulty = typeof a.difficultyLevel === 'number' ? a.difficultyLevel : 3;
        const bDifficulty = typeof b.difficultyLevel === 'number' ? b.difficultyLevel : 3;
        return bDifficulty - aDifficulty; // Higher difficulty first
      } else {
        // Performance sorting - cards with lower success rate first
        const aReps = typeof a.repetitionCount === 'number' ? a.repetitionCount : 0;
        const bReps = typeof b.repetitionCount === 'number' ? b.repetitionCount : 0;
        
        // Avoid division by zero
        if (aReps === 0 && bReps === 0) return 0;
        if (aReps === 0) return -1; // Cards never reviewed should come first
        if (bReps === 0) return 1;
        
        // Calculate success rates safely
        const aCorrect = typeof a.correctCount === 'number' ? a.correctCount : 0;
        const bCorrect = typeof b.correctCount === 'number' ? b.correctCount : 0;
        
        const aSuccessRate = aReps > 0 ? aCorrect / aReps : 0;
        const bSuccessRate = bReps > 0 ? bCorrect / bReps : 0;
        
        return aSuccessRate - bSuccessRate; // Lower success rate first
      }
    });
  
  // Helper function to validate and ensure card data is complete with proper type handling
  const validateCardData = <T extends Partial<MemoryCard>>(cardData: T): T => {
    return {
      ...cardData,
      // Ensure required fields have values
      question: cardData.question || '',
      answer: cardData.answer || '',
      sectionId: cardData.sectionId || 'default',
      chapterId: cardData.chapterId || 'default',
      difficultyLevel: cardData.difficultyLevel || 3,
      lastReviewed: cardData.lastReviewed || Date.now(),
      nextReviewDue: cardData.nextReviewDue || (Date.now() + 24 * 60 * 60 * 1000),
      repetitionCount: cardData.repetitionCount ?? 0,
      correctCount: cardData.correctCount ?? 0,
      incorrectCount: cardData.incorrectCount ?? 0,
    } as T; // Cast back to original type
  };
  
  // Handler for adding a new deck
  const handleAddDeck = async (deckData: { courseId: string; title: string; description?: string }): Promise<SimpleDeck | null> => {
    if (!userId) return null;
    
    try {
      const result = await createDeck({
        userId,
        courseId: deckData.courseId,
        title: deckData.title,
        description: deckData.description,
      }).unwrap();
      
      toast.success("Deck created successfully");
      refetchDecks();
      
      // Return the deck with type metadata
      return { ...result, type: "simple" };
    } catch (error) {
      console.error("Error creating deck:", error);
      toast.error("Failed to create deck");
      return null;
    }
  };
  
  // Handler for updating a deck
  const handleUpdateDeck = async (deckId: string, deckData: { title: string; description?: string }) => {
    if (!userId) return;
    
    try {
      // Since there's no specific updateDeck mutation, we'll log this limitation
      console.warn("Update deck functionality not fully implemented in API");
      
      // Create a new deck with the updated information
      await createDeck({
        userId,
        courseId: deck?.courseId || '', // Use the existing courseId
        title: deckData.title,
        description: deckData.description,
      }).unwrap();
      
      toast.success("Deck updated successfully");
      refetchDeck();
    } catch (error) {
      console.error("Error updating deck:", error);
      toast.error("Failed to update deck");
    }
  };
  
  // Handler for deleting a deck
  const handleDeleteDeck = async (deckId: string) => {
    if (!userId) return;
    
    try {
      await deleteDeck({
        userId,
        deckId,
      }).unwrap();
      
      toast.success("Deck deleted successfully");
      refetchDecks();
      router.push("/user/memory-cards");
    } catch (error) {
      console.error("Error deleting deck:", error);
      toast.error("Failed to delete deck");
    }
  };
  
  // Handler for adding a card to the deck
  const handleAddCard = async (cardData: Omit<MemoryCard, "cardId" | "repetitionCount" | "correctCount" | "incorrectCount">) => {
    if (!userId || !deckId) {
      console.error("Cannot add card: missing userId or deckId", { userId, deckId });
      toast.error("Cannot add card: missing required user or deck information");
      return null;
    }
    
    console.log("Adding card with data:", JSON.stringify(cardData, null, 2));
    
    try {
      // Validate and ensure we have all required fields
      if (!cardData.question || !cardData.answer) {
        console.error("Invalid card data: missing required fields", cardData);
        toast.error("Card requires both question and answer");
        return null;
      }
      
      // Validate and create a complete card object with all required fields
      const validatedCard = validateCardData({
        ...cardData,
        repetitionCount: 0,
        correctCount: 0,
        incorrectCount: 0,
      });
      
      console.log("Validated card data:", JSON.stringify(validatedCard, null, 2));
      
      // Add the card to the deck
      const response = await addCard({
        userId,
        deckId,
        ...validatedCard
      }).unwrap();
      
      console.log("Card added successfully, API response:", JSON.stringify(response, null, 2));
      
      // Show success message
      toast.success("Card added successfully");
      
      // Force a refresh of the deck data
      console.log("Refreshing deck data...");
      await refetchDeck();
      
      // Log the updated deck data after refresh
      console.log("Current deck data after refresh:", 
        deckData ? `Deck contains ${deckData.cards?.length || 0} cards` : "Deck data not available");
      
      // Return the response for further processing if needed
      return response;
    } catch (error: any) {
      console.error("Error adding card:", error);
      const errorMessage = error.data?.message || (typeof error.message === 'string' ? error.message : "Failed to add card");
      console.error("Detailed error information:", { 
        status: error.status, 
        data: error.data, 
        message: error.message 
      });
      toast.error(errorMessage);
      return null;
    }
  };
  
  // Handler for updating a card
  const handleUpdateCard = async (cardData: Partial<MemoryCard> & { cardId: string }) => {
    if (!userId || !deckId) return;
    
    try {
      // For updates, we need to ensure cardId is present
      const updatedCardData = {
        ...cardData, // Keep the cardId and other existing fields
        // Only add defaults for missing fields
        ...(cardData.lastReviewed === undefined && { lastReviewed: Date.now() }),
        ...(cardData.nextReviewDue === undefined && { nextReviewDue: Date.now() + 24 * 60 * 60 * 1000 }),
      };
      
      await updateCard({
        userId,
        deckId,
        ...updatedCardData,
      }).unwrap();
      
      toast.success("Card updated successfully");
      setEditingCard(null);
      setIsCardFormOpen(false);
      refetchDeck();
    } catch (error: any) {
      console.error("Error updating card:", error);
      
      let errorMessage = "Failed to update card";
      
      // Try to extract a more specific error message
      if (error.data && error.data.message) {
        errorMessage = error.data.message;
      } else if (error.error) {
        errorMessage = error.error;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      toast.error(errorMessage);
    }
  };
  
  // Handler for deleting a card
  const handleDeleteCard = async (cardId: string) => {
    if (!userId || !deckId) return;
    
    try {
      await deleteCard({
        userId,
        deckId,
        cardId,
      }).unwrap();
      
      toast.success("Card deleted successfully");
      refetchDeck();
    } catch (error: any) {
      console.error("Error deleting card:", error);
      
      let errorMessage = "Failed to delete card";
      
      // Try to extract a more specific error message
      if (error.data && error.data.message) {
        errorMessage = error.data.message;
      } else if (error.error) {
        errorMessage = error.error;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      toast.error(errorMessage);
    }
  };
  
  // Handler for generating cards from course content
  const handleGenerateCards = async (params: {
    courseId: string;
    chapterIds: string[];
  }) => {
    if (!userId) {
      console.error("Cannot generate cards: missing userId", { userId });
      toast.error("Cannot generate cards: missing user information");
      return null;
    }

    if (!params.courseId) {
      console.error("Cannot generate cards: missing courseId", params);
      toast.error("Please select a course to generate cards from");
      return null;
    }

    if (!params.chapterIds || params.chapterIds.length === 0) {
      console.error("Cannot generate cards: no chapters selected", params);
      toast.error("Please select at least one chapter to generate cards from");
      return null;
    }

    console.log("Generating cards with parameters:", {
      userId,
      courseId: params.courseId,
      chapterCount: params.chapterIds.length,
      chapterIds: params.chapterIds
    });
    
    // Set loading state
    setIsGeneratingCards(true);
    
    try {
      // Log the request
      console.log("Sending request to generate cards from course:", params.courseId);
      
      // Create a title for the deck based on selected chapters
      const deckTitle = deck?.title || `Generated Cards - ${new Date().toLocaleDateString()}`;
      
      // Generate the cards
      const response = await generateCards({
        userId,
        courseId: params.courseId,
        deckTitle: deckTitle,
        deckDescription: `Auto-generated from ${params.chapterIds.length} chapter(s)`
      }).unwrap();
      
      console.log("Cards generated successfully, API response:", JSON.stringify(response, null, 2));
      
      // After generating the cards, we need to add them to the deck separately
      // This part would require additional API implementation to handle chapter IDs
      
      // Show success message with the count of generated cards
      const generatedCount = response.cardsGenerated || 0;
      toast.success(`Generated ${generatedCount} ${generatedCount === 1 ? 'card' : 'cards'} successfully`);
      
      // Force a refresh of the deck data if we have a deckId
      if (deckId) {
        console.log("Refreshing deck data after generation...");
        await refetchDeck();
        
        // Log the updated deck data after refresh
        console.log("Current deck data after refresh:", 
          deckData ? `Deck now contains ${deckData.cards?.length || 0} cards` : "Deck data not available");
      }
      
      // Return a properly typed response
      return {
        deck: response.deck,
        cardsGenerated: generatedCount,
        type: "generated"
      } as DeckWithGeneratedCards;
    } catch (error: any) {
      console.error("Error generating cards:", error);
      const errorDetail = {
        status: error?.status,
        data: error?.data,
        message: error?.message,
        params: params
      };
      console.error("Detailed error information:", errorDetail);
      
      // Determine the most user-friendly error message
      let errorMessage = "Failed to generate cards";
      
      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.message) {
        // If the error is a timeout or network error, provide a more specific message
        if (typeof error.message === 'string') {
          if (error.message.includes("timeout")) {
            errorMessage = "Request timed out while generating cards. This process can take time for complex content.";
          } else if (error.message.includes("network")) {
            errorMessage = "Network error while generating cards. Please check your connection and try again.";
          } else {
            errorMessage = error.message;
          }
        }
      }
      
      toast.error(errorMessage);
      return null;
    } finally {
      setIsGeneratingCards(false);
      console.log("Generation process completed, loading state reset");
    }
  };
  
  // Backward compatibility function for the create page
  const handleCreateDeck = async (data: { 
    courseId: string; 
    title: string; 
    description?: string;
    generateCards?: boolean;
  }): Promise<CreateDeckResult> => {
    if (!userId) return null;
    
    try {
      if (data.generateCards) {
        // Generate cards from course content
        return await handleGenerateCards({
          courseId: data.courseId,
          chapterIds: [],
        });
      } else {
        // Create an empty deck
        return await handleAddDeck({
          courseId: data.courseId,
          title: data.title,
          description: data.description,
        });
      }
    } catch (error) {
      console.error("Error creating deck:", error);
      toast.error("Failed to create deck");
      return null;
    }
  };
  
  return {
    // Data
    decks: decksData || [],
    deck,
    filteredCards,
    searchTerm,
    sortBy,
    isCardFormOpen,
    editingCard,
    isGeneratingCards,
    
    // Loading and error states
    isLoadingDecks,
    isLoadingDeck,
    decksError,
    deckError,
    
    // State setters
    setSearchTerm,
    setSortBy,
    setIsCardFormOpen,
    setEditingCard,
    setIsGeneratingCards,
    
    // Action handlers
    handleAddDeck,
    handleUpdateDeck,
    handleDeleteDeck,
    handleAddCard,
    handleUpdateCard,
    handleDeleteCard,
    handleGenerateCards,
    handleCreateDeck,
    
    // Loading states for mutations (for backward compatibility)
    isCreatingDeck: false,
    
    // Refetch functions
    refetchDecks,
    refetchDeck,
  };
}; 