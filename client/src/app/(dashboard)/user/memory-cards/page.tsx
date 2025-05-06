"use client";

import React, { useState } from 'react';
import { toast } from "sonner";
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MemoryCardForm, MemoryCardFormValues } from '@/components/memory-cards/MemoryCardForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusIcon, FilterIcon, SearchIcon, Brain, BookOpen, Calendar, SortAscIcon, Loader2 } from 'lucide-react';
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Memory Cards</h1>
          <p className="text-gray-500 mt-1">Create and manage your memory cards</p>
        </div>
        
        {/* Stats Cards */}
        {decks.length > 0 && (
          <div className="flex gap-4 w-full md:w-auto">
            <Card key="total-cards-card" className="w-full md:w-auto">
              <CardContent className="p-4 flex gap-3 items-center">
                <div key="icon-container" className="bg-blue-500/20 p-2 rounded-full">
                  <Brain className="h-5 w-5 text-blue-500" />
                </div>
                <div key="text-container">
                  <p className="text-sm text-muted-foreground">Total Cards</p>
                  <p className="text-xl font-bold">{totalCards}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card key="success-rate-card" className="w-full md:w-auto">
              <CardContent className="p-4 flex gap-3 items-center">
                <div key="icon-container" className="bg-green-500/20 p-2 rounded-full">
                  <SortAscIcon className="h-5 w-5 text-green-500" />
                </div>
                <div key="text-container">
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                  <p className="text-xl font-bold">{overallSuccessRate}%</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <TabsList>
            <TabsTrigger value="all">All Decks</TabsTrigger>
            <TabsTrigger value="create">Create New</TabsTrigger>
          </TabsList>
          
          {activeTab === "all" && (
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:flex-initial">
                <SearchIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search decks..." 
                  className="pl-8 w-full md:w-[250px]" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <FilterIcon className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => setSortOrder("newest")}
                    className={sortOrder === "newest" ? "bg-accent" : ""}
                  >
                    Newest
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setSortOrder("oldest")}
                    className={sortOrder === "oldest" ? "bg-accent" : ""}
                  >
                    Oldest
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setSortOrder("name")}
                    className={sortOrder === "name" ? "bg-accent" : ""}
                  >
                    Name (A-Z)
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setSortOrder("success")}
                    className={sortOrder === "success" ? "bg-accent" : ""}
                  >
                    Success Rate
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        <TabsContent value="all" className="space-y-6">
          {filteredDecks.length === 0 ? (
            <NoResults
              title="No memory card decks found"
              description={searchTerm ? "Try adjusting your search terms" : "Create your first memory card deck"}
              icon={Brain}
              actionText="Create Deck"
              onAction={() => setActiveTab("create")}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredDecks.map((deck) => {
                const successRate = deck.totalReviews > 0 
                  ? Math.round((deck.correctReviews / deck.totalReviews) * 100) 
                  : 0;
                
                // Format date
                const createdDate = new Date(deck.createdAt);
                const formattedDate = createdDate.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                });
                
                return (
                  <Card 
                    key={deck.deckId} 
                    className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow border border-gray-800"
                    onClick={() => router.push(`/user/memory-cards/${deck.deckId}`)}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="truncate text-lg font-medium">
                        {deck.title}
                      </CardTitle>
                      {deck.description && (
                        <CardDescription className="line-clamp-2">
                          {deck.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                    
                    <CardContent className="pb-4">
                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-muted-foreground mb-1">
                          <span key="success-rate-label">Success Rate</span>
                          <span key="success-rate-value">{successRate}%</span>
                        </div>
                        <Progress 
                          value={successRate} 
                          className={cn("h-2", {
                            "bg-primary/20": deck.totalReviews === 0,
                            "[&>div]:bg-green-500": successRate >= 80,
                            "[&>div]:bg-yellow-500": successRate >= 60 && successRate < 80,
                            "[&>div]:bg-orange-500": successRate >= 40 && successRate < 60,
                            "[&>div]:bg-red-500": successRate < 40 && deck.totalReviews > 0,
                          })}
                        />
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex gap-4">
                          <div key="cards-count" className="text-center">
                            <p className="text-xl font-semibold">{deck.cards.length}</p>
                            <p className="text-xs text-muted-foreground">Cards</p>
                          </div>
                          
                          <div key="reviews-count" className="text-center">
                            <p className="text-xl font-semibold">{deck.totalReviews}</p>
                            <p className="text-xs text-muted-foreground">Reviews</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="pt-0 flex justify-between items-center border-t border-gray-800 pt-3">
                      <div key="date-info" className="flex items-center text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formattedDate}
                      </div>
                      
                      <Button 
                        key="review-button"
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/user/memory-cards/review?deckId=${deck.deckId}`);
                        }}
                        className="text-xs"
                      >
                        Review
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="create">
          {isCreatingBatch ? (
            <Card className="w-full max-w-md mx-auto p-6">
              <div className="flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <h3 className="text-xl font-medium">Creating Cards...</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Please wait while we process {batchInfo.count > 0 ? `${batchInfo.count}` : 'your'} cards. 
                  This may take a moment for AI-enhanced card sets.
                </p>
              </div>
            </Card>
          ) : (
            <MemoryCardForm onSubmit={handleCreateCard} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 
 
 