"use client";

import React, { useState } from 'react';
import { toast } from "sonner";
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MemoryCardForm, MemoryCardFormValues } from '@/components/memory-cards/MemoryCardForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusIcon, FilterIcon, SearchIcon, Brain, BookOpen, Calendar, SortAscIcon, Loader2, Target, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useMemoryCards } from '@/hooks/useMemoryCards';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import Loading from '@/components/Loading';
import NoResults from '@/components/NoResults';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useAddCardMutation, useAddCardsBatchMutation } from '@/state/api';
import { motion, AnimatePresence } from 'framer-motion';

export default function MemoryCardsPage() {
  const { userId } = useCurrentUser();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "name" | "success">("newest");
  const [isCreatingBatch, setIsCreatingBatch] = useState(false);
  const [addCard] = useAddCardMutation();
  const [addCardsBatch] = useAddCardsBatchMutation();
  const [batchInfo, setBatchInfo] = useState<{ count: number }>({ count: 0 });
  const [hoveredDeckId, setHoveredDeckId] = useState<string | null>(null);
  const [showCreateAnimation, setShowCreateAnimation] = useState(false);
  
  // Helper to ensure we have a valid userId
  const ensureUserId = (): string | null => {
    if (!userId) {
      toast.error("You must be signed in to create memory cards");
      return null;
    }
    return userId;
  };
  
  const {
    decks,
    isLoadingDecks,
    decksError,
    handleAddDeck,
    handleCreateDeck,
  } = useMemoryCards({
    userId,
    skipInitialFetch: !userId,
  });
  
  // Sort and filter decks based on search term and sort criteria
  const filteredDecks = decks
    .filter(deck => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        deck.title.toLowerCase().includes(searchLower) || 
        (deck.description && deck.description.toLowerCase().includes(searchLower))
      );
    })
    .sort((a, b) => {
      switch (sortOrder) {
        case "newest":
          return b.createdAt - a.createdAt;
        case "oldest":
          return a.createdAt - b.createdAt;
        case "name":
          return a.title.localeCompare(b.title);
        case "success":
          const aSuccessRate = a.totalReviews > 0 
            ? (a.correctReviews / a.totalReviews) 
            : 0;
          const bSuccessRate = b.totalReviews > 0 
            ? (b.correctReviews / b.totalReviews) 
            : 0;
          return bSuccessRate - aSuccessRate;
        default:
          return 0;
      }
    });

  // Handle single card flow with improved error handling and waiting for API operations
  const handleSingleCardCreation = async (values: MemoryCardFormValues) => {
    console.log('Creating single card with values:', values);
    
    const validUserId = ensureUserId();
    if (!validUserId) return;
    
    // Create a new deck first
    const newDeckResult = await handleAddDeck({
      courseId: values.courseId ?? '',
      title: values.question.length > 20 
        ? `${values.question.substring(0, 20)}...` 
        : values.question,
      description: 'Memory cards created from form',
    });
    
    console.log('Created deck result:', newDeckResult);
    
    // Extract deckId correctly from response structure - handle any response format
    let deckId: string | null = null;
    
    // Check various possible response structures
    if (newDeckResult) {
      if (typeof newDeckResult === 'object') {
        // Try to extract deckId from different possible locations in the response
        if ('deckId' in newDeckResult) {
          deckId = newDeckResult.deckId as string;
        } else if ((newDeckResult as any).data && typeof (newDeckResult as any).data === 'object' && 'deckId' in (newDeckResult as any).data) {
          deckId = ((newDeckResult as any).data as any).deckId;
        } else if ('id' in (newDeckResult as any)) {
          deckId = (newDeckResult as any).id as string;
        }
      }
    }
    
    // Log more detailed debug info
    console.log('Extracted deckId:', deckId);
    
    if (!deckId) {
      toast.error("Failed to create deck for the card");
      console.error("Could not extract deckId from response:", newDeckResult);
      return;
    }
    
    // Convert difficultyLevel from string enum to number
    const difficultyMap: Record<string, number> = {
      'easy': 1,
      'medium': 3,
      'hard': 5
    };
    
    const numericDifficulty = values.difficultyLevel ? 
      difficultyMap[values.difficultyLevel as string] || 3 : 3;
    
    // Add the card to the newly created deck
    console.log('Adding card to deck:', deckId);
    
    try {
      const addCardResult = await addCard({
        userId: validUserId,
        deckId: deckId,
        question: values.question,
        answer: values.answer,
        sectionId: values.sectionId || 'default',
        chapterId: values.chapterId || 'default',
        difficultyLevel: numericDifficulty,
        lastReviewed: Date.now(),
        nextReviewDue: Date.now() + 24 * 60 * 60 * 1000,
        repetitionCount: 0,
        correctCount: 0,
        incorrectCount: 0
      }).unwrap();
      
      console.log('Card added successfully:', addCardResult);
      
      toast.success("Card created successfully");
      
      // Wait a moment for the API to process the card addition and make it available
      // This helps with race condition where the card might not be immediately available for review
      setTimeout(() => {
        router.push(`/user/memory-cards/${deckId}`);
      }, 1200); // Increased delay to give API more time
    } catch (error) {
      console.error('Error adding card to deck:', error);
      toast.error("Failed to add card to the deck");
      
      // Even if card addition fails, navigate to the empty deck so user can try again
      setTimeout(() => {
        router.push(`/user/memory-cards/${deckId}`);
      }, 1000);
    }
  };

  // Handle batch card creation with improved error handling
  const handleBatchCardCreation = async (values: MemoryCardFormValues[]) => {
    const validUserId = ensureUserId();
    if (!validUserId) return;
    
    // Use common metadata from the first card for the deck
    const firstCard = values[0];
    const courseId = firstCard.courseId ?? '';
    
    // Create a better title for the deck based on card count 
    let deckTitle = '';
    if (values.length === 1) {
      deckTitle = firstCard.question.length > 20 
        ? `${firstCard.question.substring(0, 20)}...` 
        : firstCard.question;
    } else {
      // If we have multiple cards, include how many are in the deck
      const baseTitle = firstCard.question.length > 15
        ? `${firstCard.question.substring(0, 15)}...`
        : firstCard.question;
      deckTitle = `${baseTitle} (${values.length} cards)`;
    }
    
    console.log(`Creating deck "${deckTitle}" with ${values.length} cards`);
    
    // Create a deck with generateCards flag set to false since we'll add cards manually
    const createDeckResult = await handleCreateDeck({
      courseId,
      title: deckTitle,
      description: values.length > 1 ? 'AI-enhanced memory cards' : 'Memory cards created from form',
      generateCards: false,
    });
    
    console.log('Created deck result:', createDeckResult);
    
    // Extract deck ID correctly - handle any response format
    let deckId: string | null = null;
    
    // Check various possible response structures
    if (createDeckResult) {
      if (typeof createDeckResult === 'object') {
        // Try to extract deckId from different possible locations in the response
        if ('deckId' in createDeckResult) {
          deckId = createDeckResult.deckId as string;
        } else if ((createDeckResult as any).data && typeof (createDeckResult as any).data === 'object' && 'deckId' in (createDeckResult as any).data) {
          deckId = ((createDeckResult as any).data as any).deckId;
        } else if ('id' in (createDeckResult as any)) {
          deckId = (createDeckResult as any).id as string;
        }
      }
    }
    
    console.log('Extracted deckId:', deckId);
    
    if (!deckId) {
      toast.error("Failed to create deck");
      console.error("Could not extract deckId from response:", createDeckResult);
      return;
    }
    
    // Add cards using batch API
    try {
      // Display loading message
      toast.loading(`Adding ${values.length} cards to deck...`);
      
      // Prepare cards for batch API
      const cardsForBatch = values.map(card => {
        // Convert difficultyLevel from string enum to number
        const difficultyMap: Record<string, number> = {
          'easy': 1,
          'medium': 3,
          'hard': 5
        };
        
        const numericDifficulty = card.difficultyLevel ? 
          difficultyMap[card.difficultyLevel as string] || 3 : 3;
        
        return {
          question: card.question,
          answer: card.answer,
          sectionId: card.sectionId || 'default',
          chapterId: card.chapterId || 'default',
          difficultyLevel: numericDifficulty,
        };
      });
      
      // Send batch request
      const result = await addCardsBatch({
        userId: validUserId,
        deckId,
        cards: cardsForBatch
      }).unwrap();
      
      toast.dismiss();
      
      const cardsAdded = result.cardsAdded || values.length;
      toast.success(`Created deck with ${cardsAdded} cards`);
      
      // Add a small delay to ensure the cards are processed before navigating
      setTimeout(() => {
        router.push(`/user/memory-cards/${deckId}`);
      }, 1000);
    } catch (error) {
      toast.dismiss();
      console.error('Error in batch card creation:', error);
      toast.error(`Error creating cards batch. Please try again.`);
    }
  };

  // Handle batch card form submission correctly
  const handleCreateCard = async (values: MemoryCardFormValues | MemoryCardFormValues[]) => {
    const validUserId = ensureUserId();
    if (!validUserId) return;
    
    try {
      // Check if we have an array of cards (batch mode) or a single card
      if (Array.isArray(values)) {
        // Verify the array is not empty
        if (values.length === 0) {
          toast.error("No cards found to create. Please add at least one card.");
          return;
        }
        
        console.log(`Creating batch of ${values.length} cards`);
        
        // If we have more than one card but we detect they're from AI generation (same metadata),
        // we want to add them to the same deck instead of creating multiple decks
        if (values.length > 1) {
          // Check if they all have same metadata
          const sameMetadata = values.every(card => 
            card.courseId === values[0].courseId &&
            card.chapterId === values[0].chapterId &&
            card.sectionId === values[0].sectionId
          );
          
          if (sameMetadata) {
            console.log('Detected multiple cards with same metadata - likely AI generated alternatives');
            
            setIsCreatingBatch(true);
            setBatchInfo({ count: values.length });
            await handleBatchCardCreation(values);
            setIsCreatingBatch(false);
            return;
          }
        }
        
        setIsCreatingBatch(true);
        setBatchInfo({ count: values.length });
        await handleBatchCardCreation(values);
        setIsCreatingBatch(false);
      } else {
        // Verify the single card has required fields
        if (!values.question || !values.answer) {
          toast.error("Question and answer are required fields.");
          return;
        }
        
        console.log('Creating single card');
        // Single card flow
        await handleSingleCardCreation(values);
      }
    } catch (error) {
      setIsCreatingBatch(false);
      console.error('Error creating memory card:', error);
      toast.error("Failed to create memory card. Please try again.");
    }
  };

  // Calculate overall statistics
  const totalCards = decks.reduce((total, deck) => {
    // Ensure deck.cards is an array before accessing length
    const cardsCount = deck.cards && Array.isArray(deck.cards) ? deck.cards.length : 0;
    return total + cardsCount;
  }, 0);
  const totalReviews = decks.reduce((total, deck) => total + (deck.totalReviews || 0), 0);
  const correctReviews = decks.reduce((total, deck) => total + (deck.correctReviews || 0), 0);
  const overallSuccessRate = totalReviews > 0 
    ? Math.round((correctReviews / totalReviews) * 100) 
    : 0;

  if (isLoadingDecks) {
    return <Loading />;
  }

  if (decksError) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center h-64">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium text-center mb-2">Error Loading Memory Cards</h3>
              <p className="text-center text-muted-foreground">
                {decksError.toString()}
              </p>
              <div className="flex justify-center mt-4">
                <Button onClick={() => window.location.reload()}>Try Again</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      <motion.div 
        className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Memory Cards</h1>
          <p className="text-gray-500 mt-1">Create and manage your flashcards for effective learning</p>
        </div>
        
        {/* Stats Cards */}
        {decks.length > 0 && (
          <div className="flex gap-4 w-full md:w-auto">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="w-full md:w-auto"
            >
              <Card key="total-cards-card" className="w-full md:w-auto backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 border-none shadow-lg">
                <CardContent className="p-4 flex gap-3 items-center">
                  <div key="icon-container" className="bg-gradient-to-br from-blue-500 to-indigo-500 p-2 rounded-full">
                    <Brain className="h-5 w-5 text-white" />
                  </div>
                  <div key="text-container">
                    <p className="text-sm text-muted-foreground">Total Cards</p>
                    <motion.p 
                      className="text-xl font-bold"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      {totalCards}
                    </motion.p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="w-full md:w-auto"
            >
              <Card key="success-rate-card" className="w-full md:w-auto backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 border-none shadow-lg">
                <CardContent className="p-4 flex gap-3 items-center">
                  <div key="icon-container" className="bg-gradient-to-br from-green-500 to-emerald-500 p-2 rounded-full">
                    <SortAscIcon className="h-5 w-5 text-white" />
                  </div>
                  <div key="text-container">
                    <p className="text-sm text-muted-foreground">Success Rate</p>
                    <div className="flex items-center gap-2">
                      <motion.p 
                        className="text-xl font-bold"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        {overallSuccessRate}%
                      </motion.p>
                      <motion.div 
                        className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden"
                        initial={{ width: 0 }}
                        animate={{ width: "4rem" }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                      >
                        <div 
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-500" 
                          style={{ width: `${overallSuccessRate}%` }}
                        />
                      </motion.div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}
      </motion.div>

      <Tabs defaultValue="all" onValueChange={(value) => {
        setActiveTab(value);
        if (value === "create") {
          setShowCreateAnimation(true);
        } else {
          setShowCreateAnimation(false);
        }
      }}>
        <motion.div 
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <TabsList className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 p-1 rounded-lg">
            <TabsTrigger 
              value="all"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white transition-all duration-300"
            >
              All Decks
            </TabsTrigger>
            <TabsTrigger 
              value="create"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white transition-all duration-300"
            >
              Create New
            </TabsTrigger>
          </TabsList>
          
          {activeTab === "all" && (
            <motion.div 
              className="flex items-center gap-2 w-full md:w-auto"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative flex-1 md:flex-initial">
                <SearchIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search decks..." 
                  className="pl-8 w-full md:w-[250px] rounded-full focus:ring-2 ring-indigo-200 border-gray-200 transition-all duration-300" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="rounded-full w-9 h-9 border-gray-200 hover:bg-indigo-50 transition-colors">
                    <FilterIcon className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl shadow-lg border-gray-200 w-48">
                  <DropdownMenuLabel className="text-xs font-medium text-gray-500">Sort By</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => setSortOrder("newest")}
                    className={cn(
                      "cursor-pointer transition-colors",
                      sortOrder === "newest" ? "bg-indigo-50 text-indigo-600 font-medium" : ""
                    )}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Newest
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setSortOrder("oldest")}
                    className={cn(
                      "cursor-pointer transition-colors",
                      sortOrder === "oldest" ? "bg-indigo-50 text-indigo-600 font-medium" : ""
                    )}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Oldest
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setSortOrder("name")}
                    className={cn(
                      "cursor-pointer transition-colors",
                      sortOrder === "name" ? "bg-indigo-50 text-indigo-600 font-medium" : ""
                    )}
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Name (A-Z)
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setSortOrder("success")}
                    className={cn(
                      "cursor-pointer transition-colors",
                      sortOrder === "success" ? "bg-indigo-50 text-indigo-600 font-medium" : ""
                    )}
                  >
                    <Target className="h-4 w-4 mr-2" />
                    Success Rate
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </motion.div>
          )}
        </motion.div>

        <TabsContent value="all" className="space-y-6">
          {filteredDecks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <NoResults
                title="No memory card decks found"
                description={searchTerm ? "Try adjusting your search terms" : "Create your first memory card deck"}
                icon={Brain}
                actionText="Create Deck"
                onAction={() => setActiveTab("create")}
              />
            </motion.div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <AnimatePresence>
                {filteredDecks.map((deck) => {
                  const successRate = deck.totalReviews > 0 
                    ? Math.round((deck.correctReviews / deck.totalReviews) * 100) 
                    : 0;
                  
                  const cardsCount = deck.cards && Array.isArray(deck.cards) ? deck.cards.length : 0;
                  const isHovered = hoveredDeckId === deck.deckId;
                  
                  // Helper to determine if the deck has AI content
                  const hasAIContent = deck.cards?.some(card => card.aiGenerated === true);
                  
                  return (
                    <motion.div
                      key={deck.deckId}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      whileHover={{ y: -5 }}
                      transition={{ duration: 0.3 }}
                      onHoverStart={() => setHoveredDeckId(deck.deckId)}
                      onHoverEnd={() => setHoveredDeckId(null)}
                    >
                      <Card className={cn(
                        "h-full overflow-hidden relative group transition-all duration-300 cursor-pointer",
                        isHovered ? "shadow-xl border-indigo-200" : "",
                        hasAIContent ? "bg-gradient-to-br from-white to-indigo-50 dark:from-gray-800 dark:to-indigo-950" : ""
                      )}>
                        <CardHeader className="pb-2">
                          <CardTitle className="flex items-center gap-2 text-xl font-bold">
                            {deck.title}
                            {hasAIContent && (
                              <motion.div
                                animate={{ 
                                  scale: [1, 1.1, 1],
                                  rotate: [0, 5, 0, -5, 0]
                                }}
                                transition={{ duration: 3, repeat: Infinity }}
                              >
                                <Sparkles className="h-4 w-4 text-indigo-500" />
                              </motion.div>
                            )}
                          </CardTitle>
                          <CardDescription className="line-clamp-2">
                            {deck.description || "Memory cards created from form"}
                          </CardDescription>
                        </CardHeader>
                        
                        <CardContent className="pb-2">
                          <div className="flex justify-between items-center mb-2">
                            <div className="text-xs font-medium text-gray-500">Success Rate</div>
                            <div className="text-xs font-medium">{successRate}%</div>
                          </div>
                          <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden mb-4">
                            <motion.div 
                              className={cn(
                                "h-full transition-all",
                                successRate >= 80 ? "bg-green-500" : 
                                successRate >= 50 ? "bg-yellow-500" : 
                                "bg-red-500"
                              )}
                              initial={{ width: 0 }}
                              animate={{ width: `${successRate}%` }}
                              transition={{ duration: 1, delay: 0.2 }}
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-center">
                            <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-xl">
                              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{cardsCount}</div>
                              <div className="text-xs text-gray-500">Cards</div>
                            </div>
                            <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-xl">
                              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{deck.totalReviews || 0}</div>
                              <div className="text-xs text-gray-500">Reviews</div>
                            </div>
                          </div>
                        </CardContent>
                        
                        <CardFooter className="flex justify-between pt-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-xs bg-white hover:bg-indigo-50 transition-colors"
                            onClick={() => router.push(`/user/memory-cards/${deck.deckId}`)}
                          >
                            View Deck
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            className="text-xs bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white transition-all"
                            onClick={() => router.push(`/user/memory-cards/review?deckId=${deck.deckId}`)}
                          >
                            Review
                          </Button>
                        </CardFooter>
                        
                        {/* Animated background effect for AI-generated decks */}
                        {hasAIContent && (
                          <motion.div 
                            className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full opacity-20 z-0"
                            animate={{ 
                              scale: [1, 1.2, 1],
                              rotate: [0, 180],
                              background: [
                                "radial-gradient(circle, rgba(99,102,241,0.8) 0%, rgba(99,102,241,0) 70%)",
                                "radial-gradient(circle, rgba(79,70,229,0.8) 0%, rgba(79,70,229,0) 70%)",
                                "radial-gradient(circle, rgba(99,102,241,0.8) 0%, rgba(99,102,241,0) 70%)"
                              ]
                            }}
                            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                          />
                        )}
                        
                        {/* Creation date */}
                        <div className="absolute top-2 right-2 text-xs text-gray-400 opacity-70">
                          {new Date(deck.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </TabsContent>

        <TabsContent value="create">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: showCreateAnimation ? 1 : 0, 
              y: showCreateAnimation ? 0 : 20
            }}
            transition={{ duration: 0.5 }}
            className="flex flex-col lg:flex-row gap-6"
          >
            <div className="flex-1">
              <MemoryCardForm onSubmit={handleCreateCard} />
            </div>
            
            <div className="w-full lg:w-1/3">
              <Card className="sticky top-24 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-gray-800 dark:to-indigo-900/30 border-none shadow-lg overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 -mt-20 -mr-20 rounded-full bg-indigo-100 dark:bg-indigo-900/20" />
                <div className="absolute bottom-0 left-0 w-24 h-24 -mb-12 -ml-12 rounded-full bg-blue-100 dark:bg-blue-900/20" />
                
                <CardHeader className="relative z-10">
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-indigo-600" />
                    Memory Card Tips
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="relative z-10">
                  <motion.ul 
                    className="space-y-3 text-sm"
                    initial="hidden"
                    animate="visible"
                    variants={{
                      visible: {
                        transition: {
                          staggerChildren: 0.1
                        }
                      },
                      hidden: {}
                    }}
                  >
                    <motion.li 
                      className="flex items-start gap-2"
                      variants={{
                        visible: { opacity: 1, x: 0 },
                        hidden: { opacity: 0, x: -20 }
                      }}
                    >
                      <div className="mt-0.5 flex-shrink-0 h-5 w-5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-xs font-bold text-indigo-700 dark:text-indigo-400">1</div>
                      <p>Keep questions clear and concise to help with quick recall.</p>
                    </motion.li>
                    <motion.li 
                      className="flex items-start gap-2"
                      variants={{
                        visible: { opacity: 1, x: 0 },
                        hidden: { opacity: 0, x: -20 }
                      }}
                    >
                      <div className="mt-0.5 flex-shrink-0 h-5 w-5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-xs font-bold text-indigo-700 dark:text-indigo-400">2</div>
                      <p>Use our AI to generate multiple variations of cards and improve learning.</p>
                    </motion.li>
                    <motion.li 
                      className="flex items-start gap-2"
                      variants={{
                        visible: { opacity: 1, x: 0 },
                        hidden: { opacity: 0, x: -20 }
                      }}
                    >
                      <div className="mt-0.5 flex-shrink-0 h-5 w-5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-xs font-bold text-indigo-700 dark:text-indigo-400">3</div>
                      <p>Regular review sessions are more effective than cramming everything at once.</p>
                    </motion.li>
                    <motion.li 
                      className="flex items-start gap-2"
                      variants={{
                        visible: { opacity: 1, x: 0 },
                        hidden: { opacity: 0, x: -20 }
                      }}
                    >
                      <div className="mt-0.5 flex-shrink-0 h-5 w-5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-xs font-bold text-indigo-700 dark:text-indigo-400">4</div>
                      <p>Spaced repetition helps move information from short-term to long-term memory.</p>
                    </motion.li>
                  </motion.ul>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 
 
 