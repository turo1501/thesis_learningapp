"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Plus,
  Search,
  ArrowRightCircle,
  SortAsc,
  Brain,
  Sparkles,
  LayoutGrid,
  Filter,
  Target,
  AlarmCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import Header from "@/components/Header";
import Loading from "@/components/Loading";
import NoResults from "@/components/NoResults";
import { useMemoryCards } from "@/hooks/useMemoryCards";
import { MemoryCard } from "@/state/api";
import ModernMemoryCard from "@/components/memory-cards/ModernMemoryCard";
import { cn } from "@/lib/utils";

// Card form validation schema
const cardFormSchema = z.object({
  question: z.string().min(1, "Question is required"),
  answer: z.string().min(1, "Answer is required"),
  sectionId: z.string().default("default"),
  chapterId: z.string().default("default"),
  difficultyLevel: z.number().min(1).max(5).default(3),
  lastReviewed: z.number().optional().default(() => Date.now()),
  nextReviewDue: z.number().optional().default(() => Date.now() + 24 * 60 * 60 * 1000)
});

type CardFormValues = z.infer<typeof cardFormSchema>;

const DeckDetailPage = ({ params }: { params: Promise<{ deckId: string }> }) => {
  const resolvedParams = React.use(params);
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [editingCard, setEditingCard] = useState<MemoryCard | null>(null);
  const [deletingCard, setDeletingCard] = useState<MemoryCard | null>(null);
  
  const {
    deck,
    filteredCards,
    searchTerm,
    sortBy,
    isCardFormOpen,
    isLoadingDeck,
    deckError,
    setSearchTerm,
    setSortBy,
    setIsCardFormOpen,
    handleDeleteDeck,
    handleAddCard,
    handleUpdateCard,
    handleDeleteCard,
  } = useMemoryCards({ 
    userId: user?.id || null,
    deckId: resolvedParams.deckId,
    skipInitialFetch: !isLoaded || !user
  });
  
  // Initialize form 
  const form = useForm<CardFormValues>({
    resolver: zodResolver(cardFormSchema),
    defaultValues: {
      question: "",
      answer: "",
      sectionId: "",
      chapterId: "",
      difficultyLevel: 3,
    },
  });
  
  // Reset form when editingCard changes
  useEffect(() => {
    if (editingCard) {
      form.reset({
        question: editingCard.question || "",
        answer: editingCard.answer || "",
        sectionId: editingCard.sectionId || "",
        chapterId: editingCard.chapterId || "",
        difficultyLevel: editingCard.difficultyLevel || 3,
      });
    } else {
      form.reset({
        question: "",
        answer: "",
        sectionId: "",
        chapterId: "",
        difficultyLevel: 3,
      });
    }
  }, [editingCard, form]);
  
  const handleSortChange = (field: "created" | "difficulty" | "performance") => {
    setSortBy(field);
  };
  
  const onSubmitCard = async (values: CardFormValues) => {
    if (!user) return;
    
    if (editingCard) {
      // Update existing card
      await handleUpdateCard({
        cardId: editingCard.cardId,
        ...values,
      });
    } else {
      // Add new card
      await handleAddCard(values);
    }
    
    // Reset form and close dialog
    form.reset();
    setIsCardFormOpen(false);
  };
  
  const handleNavigateBack = () => {
    router.push("/user/memory-cards", { scroll: false });
  };
  
  const handleStartReview = () => {
    router.push(`/user/memory-cards/review?deckId=${resolvedParams.deckId}`, { scroll: false });
  };
  
  const confirmDeleteDeck = () => {
    handleDeleteDeck(resolvedParams.deckId);
    setIsDeleteDialogOpen(false);
  };
  
  if (!isLoaded) return <Loading />;
  if (!user) return <div>Please sign in to view your memory cards.</div>;
  if (isLoadingDeck) return <Loading />;
  if (deckError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-8">
        <div className="text-red-500 text-5xl mb-4">
          <Brain />
        </div>
        <h1 className="text-2xl font-bold mb-2">Unable to load deck</h1>
        <p className="text-gray-600 mb-6">There was a problem loading this deck. Please try again later.</p>
        <Button onClick={handleNavigateBack}>Return to Decks</Button>
      </div>
    );
  }
  
  if (!deck) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-8">
        <div className="text-indigo-500 text-5xl mb-4">
          <Brain />
        </div>
        <h1 className="text-2xl font-bold mb-2">Deck not found</h1>
        <p className="text-gray-600 mb-6">The deck you're looking for doesn't exist or has been deleted.</p>
        <Button onClick={handleNavigateBack}>Return to Decks</Button>
      </div>
    );
  }
  
  // Ensure cards array exists with fallback to empty array
  const cards = deck.cards || [];
  
  // Calculate stats with null-safe operations
  const totalCards = cards.length;
  const reviewedCards = cards.filter(card => (card.repetitionCount || 0) > 0).length;
  const accuracy = (deck.totalReviews || 0) > 0
    ? Math.round(((deck.correctReviews || 0) / deck.totalReviews) * 100)
    : 0;
  
  // Helper function to safely render cards
  const renderCards = () => {
    if (filteredCards.length === 0) {
      if (searchTerm) {
        return (
          <NoResults
            title="No cards found"
            description="Try adjusting your search term or add a new card that matches your search."
            actionText="Clear Search"
            onAction={() => setSearchTerm('')}
          />
        );
      }
      
      return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-indigo-500 mb-4"
          >
            <Sparkles className="h-16 w-16" />
          </motion.div>
          <h2 className="text-2xl font-bold mb-2 text-center">Time to add your first card!</h2>
          <p className="text-gray-600 mb-6 text-center max-w-md">
            Start building your memory deck by adding questions and answers you want to remember.
          </p>
          <Button 
            size="lg"
            onClick={() => setIsCardFormOpen(true)}
            className="flex items-center"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Your First Card
          </Button>
        </div>
      );
    }
    
    return (
      <motion.div
        className="memory-card-grid"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <AnimatePresence>
          {filteredCards.map((card, index) => (
            <motion.div
              key={card.cardId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                transition: { delay: index * 0.05, duration: 0.3 }
              }}
              exit={{ opacity: 0, scale: 0.9 }}
              layout
            >
              <ModernMemoryCard
                card={card}
                onEdit={() => {
                  setEditingCard(card);
                  setIsCardFormOpen(true);
                }}
                onDelete={() => {
                  setDeletingCard(card);
                  setShowDeleteConfirmation(true);
                }}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    );
  };
  
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col">
        <div className="flex items-center mb-8">
          <Button
            variant="outline"
            size="sm"
            className="mr-4"
            onClick={handleNavigateBack}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Decks
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{deck.title || "Untitled Deck"}</h1>
            <p className="text-gray-500">{deck.description || "Memory cards for this course"}</p>
          </div>
          <Button
            className={cn(
              "bg-indigo-600 hover:bg-indigo-700 text-white",
              totalCards > 0 && "review-button-pulse"
            )}
            onClick={handleStartReview}
            disabled={totalCards === 0}
          >
            Start Review
            <ArrowRightCircle className="ml-2 h-4 w-4" />
          </Button>
        </div>
        
        <div className="memory-card-stats">
          <motion.div 
            className="memory-card-stat"
            whileHover={{ y: -5 }}
          >
            <div className="memory-card-stat-number">{totalCards}</div>
            <div className="memory-card-stat-label">Total Cards</div>
            <LayoutGrid className="text-indigo-400 h-10 w-10 absolute -z-10 opacity-10 right-2 bottom-2" />
          </motion.div>
          
          <motion.div 
            className="memory-card-stat"
            whileHover={{ y: -5 }}
          >
            <div className="memory-card-stat-number">{reviewedCards}</div>
            <div className="memory-card-stat-label">Reviewed</div>
            <AlarmCheck className="text-blue-400 h-10 w-10 absolute -z-10 opacity-10 right-2 bottom-2" />
          </motion.div>
          
          <motion.div 
            className="memory-card-stat"
            whileHover={{ y: -5 }}
          >
            <div className="memory-card-stat-number">{accuracy}%</div>
            <div className="memory-card-stat-label">Success Rate</div>
            <Target className="text-green-400 h-10 w-10 absolute -z-10 opacity-10 right-2 bottom-2" />
          </motion.div>
          
          <motion.div 
            className="memory-card-stat"
            whileHover={{ y: -5 }}
          >
            <div className="memory-card-stat-number">{deck.totalReviews || 0}</div>
            <div className="memory-card-stat-label">Review Sessions</div>
            <Brain className="text-purple-400 h-10 w-10 absolute -z-10 opacity-10 right-2 bottom-2" />
          </motion.div>
        </div>
        
        <div className="flex justify-between items-center mb-6">
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search cards..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-full"
            />
          </div>
          
          <div className="flex space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center">
                  <Filter className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Sort:</span> {sortBy === "created" ? "Date Added" : sortBy === "difficulty" ? "Difficulty" : "Performance"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleSortChange("created")}>
                  Date Added
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSortChange("difficulty")}>
                  Difficulty
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSortChange("performance")}>
                  Performance
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Dialog open={isCardFormOpen} onOpenChange={setIsCardFormOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Card
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md mx-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingCard ? "Edit Card" : "Add New Card"}
                  </DialogTitle>
                  <DialogDescription>
                    Create a question and answer pair for your memory card.
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmitCard)}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="question"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Question</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter the question"
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="answer"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Answer</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter the answer"
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="difficultyLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Difficulty Level</FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={(value) => field.onChange(parseInt(value))}
                              defaultValue={field.value.toString()}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select difficulty" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">Very Easy</SelectItem>
                                <SelectItem value="2">Easy</SelectItem>
                                <SelectItem value="3">Medium</SelectItem>
                                <SelectItem value="4">Hard</SelectItem>
                                <SelectItem value="5">Very Hard</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormDescription>
                            Select the difficulty level of this memory card
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="sectionId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Section ID</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Section ID"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="chapterId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Chapter ID</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Chapter ID"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <DialogFooter className="mt-6">
                      <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                        {editingCard ? "Update Card" : "Add Card"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
            
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="text-red-500 border-red-200 hover:bg-red-50"
                >
                  Delete Deck
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this deck?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. All {totalCards} cards in this deck will be permanently deleted.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={confirmDeleteDeck}
                    className="bg-red-500 hover:bg-red-600 text-white"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        
        {/* Render memory cards */}
        {renderCards()}
        
        {/* Card deletion confirmation */}
        <AlertDialog open={showDeleteConfirmation} onOpenChange={setShowDeleteConfirmation}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this card?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This card will be permanently deleted from your deck.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeletingCard(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (deletingCard?.cardId) {
                    handleDeleteCard(deletingCard.cardId);
                    setShowDeleteConfirmation(false);
                    setDeletingCard(null);
                  }
                }}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default DeckDetailPage; 