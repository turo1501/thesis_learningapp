import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CourseContentSelector } from './CourseContentSelector';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Brain, HelpCircle, Loader2, Plus, Sparkles, Trash } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useGenerateAIAlternativesMutation } from '@/state/api';
import { toast } from 'sonner';

// Form validation schema for single card
export const singleCardSchema = z.object({
  question: z.string().min(3, "Question must be at least 3 characters"),
  answer: z.string().min(3, "Answer must be at least 3 characters"),
  courseId: z.string().optional(),
  sectionId: z.string().optional(),
  chapterId: z.string().optional(),
  tags: z.string().optional(),
  difficultyLevel: z.enum(["easy", "medium", "hard"]).optional(),
});

// Schema for batch mode with multiple cards
const batchCardsSchema = z.object({
  batchInput: z.string().min(5, { message: 'Please enter at least one question-answer pair' }),
  courseId: z.string().optional(),
  sectionId: z.string().optional(),
  chapterId: z.string().optional(),
  tags: z.string().optional(),
  difficultyLevel: z.enum(["easy", "medium", "hard"]).optional(),
});

// Schema for multiple cards entry
const multipleCardsSchema = z.array(
  z.object({
    question: z.string().min(3, { message: 'Question must be at least 3 characters' }),
    answer: z.string().min(1, { message: 'Answer is required' }),
    difficultyLevel: z.enum(["easy", "medium", "hard"]).optional(),
  })
).min(1, { message: 'At least one card is required' });

export type MemoryCardFormValues = z.infer<typeof singleCardSchema>;
export type BatchMemoryCardFormValues = z.infer<typeof batchCardsSchema>;

interface MemoryCardFormProps {
  initialValues?: Partial<MemoryCardFormValues>;
  onSubmit: (values: MemoryCardFormValues | MemoryCardFormValues[]) => void;
  isSubmitting?: boolean;
  title?: string;
}

export const MemoryCardForm: React.FC<MemoryCardFormProps> = ({
  initialValues = {},
  onSubmit,
  isSubmitting = false,
  title = 'Create Memory Card',
}) => {
  const { userId } = useCurrentUser();
  const [isAIEnabled, setIsAIEnabled] = useState(false);
  const [mode, setMode] = useState<'single' | 'batch' | 'multiple'>('single');
  const [cards, setCards] = useState<{ question: string; answer: string }[]>([{ question: '', answer: '' }]);
  const [aiAlternatives, setAiAlternatives] = useState<{ question: string; answer: string }[]>([]);
  
  // Initialize the form with react-hook-form for single card
  const singleForm = useForm<MemoryCardFormValues>({
    resolver: zodResolver(singleCardSchema),
    defaultValues: {
      question: initialValues.question || '',
      answer: initialValues.answer || '',
      courseId: initialValues.courseId || '',
      sectionId: initialValues.sectionId || '',
      chapterId: initialValues.chapterId || '',
      tags: initialValues.tags || '',
      difficultyLevel: initialValues.difficultyLevel || 'medium',
    },
  });
  
  // Form for batch input
  const batchForm = useForm<BatchMemoryCardFormValues>({
    resolver: zodResolver(batchCardsSchema),
    defaultValues: {
      batchInput: '',
      courseId: initialValues.courseId || '',
      sectionId: initialValues.sectionId || '',
      chapterId: initialValues.chapterId || '',
      tags: initialValues.tags || '',
      difficultyLevel: initialValues.difficultyLevel || 'medium',
    },
  });
  
  // Form for multiple card entry
  const multipleForm = useForm({
    resolver: zodResolver(
      z.object({
        cards: multipleCardsSchema,
        courseId: z.string().optional(),
        sectionId: z.string().optional(),
        chapterId: z.string().optional(),
        tags: z.string().optional(),
      })
    ),
    defaultValues: {
      cards: [{ question: '', answer: '', difficultyLevel: 'medium' }],
      courseId: initialValues.courseId || '',
      sectionId: initialValues.sectionId || '',
      chapterId: initialValues.chapterId || '',
      tags: initialValues.tags || '',
    },
  });

  // RTK Query hook for AI alternatives
  const [generateAIAlternatives, { isLoading: isGeneratingAI }] = useGenerateAIAlternativesMutation();

  // Handle single card form submission
  const handleSingleSubmit = singleForm.handleSubmit((data) => {
    onSubmit(data);
  });
  
  // Handle batch card form submission
  const handleBatchSubmit = batchForm.handleSubmit((data) => {
    // Parse the batch input into an array of cards
    const lines = data.batchInput.split('\n');
    const parsedCards: MemoryCardFormValues[] = [];
    
    // Ensure difficultyLevel is of the correct type
    const difficulty = data.difficultyLevel as "easy" | "medium" | "hard" | undefined;
    
    for (let i = 0; i < lines.length; i += 2) {
      const question = lines[i]?.trim();
      const answer = lines[i + 1]?.trim();
      
      if (question && answer) {
        parsedCards.push({
          question,
          answer,
          courseId: data.courseId,
          sectionId: data.sectionId,
          chapterId: data.chapterId,
          tags: data.tags,
          difficultyLevel: difficulty,
        });
      }
    }
    
    if (parsedCards.length > 0) {
      onSubmit(parsedCards);
    }
  });
  
  // Handle multiple cards submission
  const handleMultipleSubmit = multipleForm.handleSubmit((data) => {
    // Make sure we have cards to submit
    if (!data.cards || !Array.isArray(data.cards) || data.cards.length === 0) {
      toast.error("No cards found to submit");
      console.error("Empty or invalid cards array:", data.cards);
      return;
    }
    
    // Log current form data for debugging
    console.log('Submitting multiple cards form with data:', {
      cardCount: data.cards.length,
      firstCard: data.cards[0],
      metadata: {
        courseId: data.courseId,
        sectionId: data.sectionId,
        chapterId: data.chapterId,
        tags: data.tags
      }
    });
    
    // Create array of cards with metadata
    const formattedCards = data.cards.map(card => {
      // Skip invalid cards
      if (!card || !card.question || !card.answer) {
        console.warn('Skipping invalid card:', card);
        return null;
      }
      
      // Ensure difficultyLevel is of the correct type
      const difficulty = card.difficultyLevel as "easy" | "medium" | "hard" | undefined;
      
      return {
        question: card.question,
        answer: card.answer,
        courseId: data.courseId,
        sectionId: data.sectionId,
        chapterId: data.chapterId,
        tags: data.tags,
        difficultyLevel: difficulty || 'medium',
      };
    }).filter(Boolean) as MemoryCardFormValues[]; // Remove any null entries
    
    if (formattedCards.length === 0) {
      toast.error("No valid cards to submit");
      return;
    }
    
    // Log the final cards that will be submitted
    console.log(`Submitting ${formattedCards.length} formatted cards`);
    
    // Submit the cards
    onSubmit(formattedCards);
  });
  
  // Add a new card in multiple mode
  const addCard = () => {
    try {
      // Get current cards array
      const currentCards = multipleForm.getValues('cards') || [];
      
      console.log('Adding new card to multiple cards array. Current count:', currentCards.length);
      
      // Create a new card with default values
      const newCard = { 
        question: '', 
        answer: '', 
        difficultyLevel: 'medium' as "easy" | "medium" | "hard" 
      };
      
      // Add the new card to the array
      const updatedCards = [...currentCards, newCard];
      
      // Update the form with the new array
      multipleForm.setValue('cards', updatedCards, { 
        shouldValidate: false, 
        shouldDirty: true,
        shouldTouch: true 
      });
      
      // Log the updated cards array
      console.log('Updated cards array:', updatedCards.length, 'cards');
      
      // Scroll to the new card after the DOM has updated
      setTimeout(() => {
        const cardsContainer = document.querySelector('.space-y-6');
        if (cardsContainer) {
          cardsContainer.scrollTop = cardsContainer.scrollHeight;
        }
      }, 100);
    } catch (error) {
      console.error('Error adding new card:', error);
      toast.error('Failed to add new card. Please try again.');
    }
  };
  
  // Remove a card in multiple mode
  const removeCard = (index: number) => {
    if (!multipleForm) {
      console.error('Form not initialized');
      return;
    }
    
    try {
      // Get current cards from the form
      const cards = multipleForm.getValues('cards');
      if (!cards || !Array.isArray(cards)) {
        console.error('Invalid cards array:', cards);
        return;
      }
      
      // Validate index
      if (index < 0 || index >= cards.length) {
        console.error(`Invalid index ${index} for removal. Cards length: ${cards.length}`);
        return;
      }
      
      // Don't allow removing the last card
      if (cards.length <= 1) {
        console.log('Cannot remove the last card');
        toast.info('You must have at least one card');
        return;
      }
      
      console.log(`Removing card at index ${index}. Current count: ${cards.length}`);
      
      // Create a new array without the card at the specified index
      const updatedCards = [...cards];
      updatedCards.splice(index, 1);
      
      // Update the form
      multipleForm.setValue('cards', updatedCards, { 
        shouldValidate: true, 
        shouldDirty: true,
        shouldTouch: true 
      });
      
      console.log('Updated cards array after removal:', updatedCards.length, 'cards');
    } catch (error) {
      console.error('Error removing card:', error);
      toast.error('Failed to remove card. Please try again.');
    }
  };

  // Generate AI alternatives for a single card
  const handleGenerateAIAlternatives = async () => {
    if (!userId) {
      toast.error("You must be signed in to use AI features");
      return;
    }

    // Get the current question and answer based on mode
    let question = '';
    let answer = '';

    if (mode === 'single') {
      question = singleForm.getValues('question');
      answer = singleForm.getValues('answer');
    } else if (mode === 'multiple') {
      // Use the first card in multiple mode
      const cards = multipleForm.getValues().cards;
      if (cards && cards.length > 0) {
        question = cards[0].question;
        answer = cards[0].answer;
      }
    } else {
      // For batch mode, we don't support AI generation
      toast.error("AI generation is only available for single card and multiple cards modes");
      return;
    }

    // Validate the question and answer
    if (!question || question.length < 3) {
      toast.error("Please enter a valid question (at least 3 characters)");
      return;
    }

    if (!answer || answer.length < 3) {
      toast.error("Please enter a valid answer (at least 3 characters)");
      return;
    }

    console.log('Generating AI alternatives for:', { question, answer });
    
    try {
      // Call the API to generate alternatives
      toast.loading("Generating alternatives...");
      
      const result = await generateAIAlternatives({
        userId,
        question,
        answer,
        count: 3 // Request 3 alternatives
      }).unwrap();

      toast.dismiss();
      console.log('AI alternatives generated:', result);
      
      if (!result.alternatives || !Array.isArray(result.alternatives) || result.alternatives.length === 0) {
        console.warn('No alternatives returned from API', result);
        toast.error("No alternative cards were generated. Please try again with a different question/answer.");
        return;
      }

      // Update the state with the alternatives
      setAiAlternatives(result.alternatives || []);
      
      // Switch to multiple mode if not already in it
      if (mode !== 'multiple') {
        console.log('Switching to multiple mode');
        setMode('multiple');
        
        // If in single mode, populate the first card in multiple mode
        if (mode === 'single') {
          // Create the initial card array
          const initialCards = [{
            question,
            answer,
            difficultyLevel: singleForm.getValues('difficultyLevel') || 'medium'
          }];
          
          console.log('Setting initial card for multiple mode:', initialCards);
          
          // Set the cards in the form
          multipleForm.setValue('cards', initialCards, {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true
          });
          
          // Copy over course data
          multipleForm.setValue('courseId', singleForm.getValues('courseId') || '');
          multipleForm.setValue('sectionId', singleForm.getValues('sectionId') || '');
          multipleForm.setValue('chapterId', singleForm.getValues('chapterId') || '');
          multipleForm.setValue('tags', singleForm.getValues('tags') || '');
        }
      }
      
      // Wait a moment for the UI to update and show alternatives section
      setTimeout(() => {
        // Focus on the alternatives section
        const alternativesSection = document.querySelector('.space-y-3');
        if (alternativesSection) {
          alternativesSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
      
      toast.success(`Generated ${result.alternatives.length} alternative questions and answers`);
    } catch (error) {
      toast.dismiss();
      console.error('Error generating AI alternatives:', error);
      
      // Provide more specific error messages
      if (error && typeof error === 'object' && 'status' in error) {
        if ((error as any).status === 429) {
          toast.error("Too many requests. Please wait a moment before trying again.");
        } else if ((error as any).status === 503) {
          toast.error("AI service is currently unavailable. Please try again later.");
        } else {
          toast.error(`Failed to generate alternatives: ${(error as any).data?.message || 'Unknown error'}`);
        }
      } else {
        toast.error("Failed to generate alternatives. Please try again.");
      }
    }
  };

  // Add an AI-generated alternative to multiple cards
  const addAIAlternative = (alternative: { question: string; answer: string }) => {
    if (!multipleForm) {
      console.error('Form not initialized');
      toast.error('Cannot add alternative: form not ready');
      return;
    }
    
    try {
      // Validate the alternative data
      if (!alternative || !alternative.question || !alternative.answer) {
        console.error('Invalid alternative data:', alternative);
        toast.error('Cannot add invalid alternative card');
        return;
      }
      
      // Get current cards array
      const existingCards = multipleForm.getValues('cards');
      if (!existingCards || !Array.isArray(existingCards)) {
        console.error('Invalid existing cards array:', existingCards);
        return;
      }
      
      console.log(`Adding AI alternative as new card. Current count: ${existingCards.length}`);
      
      // Create new card with the alternative data
      const newCard = { 
        question: alternative.question, 
        answer: alternative.answer,
        difficultyLevel: 'medium' as "easy" | "medium" | "hard"
      };
      
      // Add the alternative as a new card
      const updatedCards = [...existingCards, newCard];
      
      // Update the form state with the new card
      multipleForm.setValue('cards', updatedCards, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true 
      });
      
      // Force form update to ensure UI reflects new card
      setTimeout(() => {
        // Force a re-render by updating form state
        const currentCards = multipleForm.getValues('cards');
        multipleForm.setValue('cards', [...currentCards], { 
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true
        });
        
        // Log updated card count for debugging
        console.log('Updated card count after re-render:', multipleForm.getValues('cards').length);
      }, 50);
      
      // Remove from alternatives list to prevent duplicates
      setAiAlternatives(prev => prev.filter(a => 
        a.question !== alternative.question || a.answer !== alternative.answer
      ));
      
      console.log('Updated cards after adding alternative:', updatedCards.length);
      toast.success("Alternative added as a new card");
      
      // Scroll to the new card after a moment for DOM update
      setTimeout(() => {
        const cardsContainer = document.querySelector('.space-y-6');
        if (cardsContainer) {
          cardsContainer.scrollTop = cardsContainer.scrollHeight;
        }
      }, 100);
    } catch (error) {
      console.error('Error adding AI alternative:', error);
      toast.error('Failed to add alternative card. Please try again.');
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      
      <Tabs defaultValue="single" onValueChange={(value) => setMode(value as 'single' | 'batch' | 'multiple')}>
        <TabsList className="mx-6 mb-2">
          <TabsTrigger value="single">Single Card</TabsTrigger>
          <TabsTrigger value="multiple">Multiple Cards</TabsTrigger>
          <TabsTrigger value="batch">Batch Input</TabsTrigger>
        </TabsList>
        
        <TabsContent value="single">
          <Form {...singleForm}>
            <form onSubmit={handleSingleSubmit}>
              <CardContent className="space-y-6">
                {/* Question Field */}
                <FormField
                  control={singleForm.control}
                  name="question"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Question</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter your question here..."
                          className="min-h-16 resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Answer Field */}
                <FormField
                  control={singleForm.control}
                  name="answer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Answer</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter the answer here..."
                          className="min-h-16 resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Difficulty Level */}
                <FormField
                  control={singleForm.control}
                  name="difficultyLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Difficulty Level</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value || "medium"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select difficulty" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Choose the difficulty level for this card
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Tags Field */}
                <FormField
                  control={singleForm.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags (comma-separated)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. math, algebra, functions"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Course Content Selector */}
                <div className="pt-4">
                  <h3 className="text-lg font-medium mb-2">Course Content (Optional)</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Link this card to specific course content to organize your cards better.
                  </p>
                  <CourseContentSelector form={singleForm} />
                </div>
                
                {/* AI Generation Toggle */}
                <div className="flex items-center space-x-2 pt-4">
                  <Switch 
                    id="ai-generation" 
                    checked={isAIEnabled}
                    onCheckedChange={setIsAIEnabled}
                  />
                  <label htmlFor="ai-generation" className="text-sm font-medium leading-none cursor-pointer">
                    Use AI to generate alternative questions and answers
                  </label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">AI will analyze your question/answer and suggest variations to help you study the same concept from different angles.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                {/* AI Generation Button (visible when toggle is on) */}
                {isAIEnabled && (
                  <div className="pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleGenerateAIAlternatives}
                      disabled={isGeneratingAI}
                      className="w-full"
                    >
                      {isGeneratingAI ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating alternatives...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Generate alternative cards
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>

              <CardFooter className="flex justify-end space-x-2">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Save Card'}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </TabsContent>
        
        <TabsContent value="multiple">
          <Form {...multipleForm}>
            <form onSubmit={handleMultipleSubmit}>
              <CardContent className="space-y-6">
                {/* AI-generated alternatives section */}
                {aiAlternatives.length > 0 && (
                  <div className="p-4 border rounded-md bg-secondary/10 space-y-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      <h3 className="font-medium">AI-Generated Alternatives</h3>
                    </div>
                    
                    <div className="space-y-3">
                      {aiAlternatives.map((alternative, idx) => (
                        <div key={idx} className="p-3 bg-background rounded-md border">
                          <div className="mb-2">
                            <p className="text-sm font-semibold">Question:</p>
                            <p className="text-sm">{alternative.question}</p>
                          </div>
                          <div className="mb-2">
                            <p className="text-sm font-semibold">Answer:</p>
                            <p className="text-sm">{alternative.answer}</p>
                          </div>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={() => addAIAlternative(alternative)}
                            className="w-full mt-2"
                          >
                            <Plus className="mr-1 h-3 w-3" /> Add as card
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Multiple cards input */}
                <div className="space-y-6">
                  {multipleForm.getValues().cards?.map((card, index) => (
                    <div key={index} className="p-4 border rounded-md relative">
                      <div className="absolute right-2 top-2">
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removeCard(index)}
                          disabled={multipleForm.getValues().cards?.length === 1}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <h3 className="font-medium mb-4">Card {index + 1}</h3>
                      
                      {/* Question */}
                      <div className="mb-4">
                        <FormField
                          control={multipleForm.control}
                          name={`cards.${index}.question`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Question</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Enter your question here..."
                                  className="min-h-16"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      {/* Answer */}
                      <div>
                        <FormField
                          control={multipleForm.control}
                          name={`cards.${index}.answer`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Answer</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Enter the answer here..."
                                  className="min-h-16"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Difficulty Level for multiple cards */}
                      <div className="mt-4">
                        <FormField
                          control={multipleForm.control}
                          name={`cards.${index}.difficultyLevel`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Difficulty Level</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value || "medium"}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select difficulty" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="easy">Easy</SelectItem>
                                  <SelectItem value="medium">Medium</SelectItem>
                                  <SelectItem value="hard">Hard</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  ))}
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={addCard}
                    className="w-full"
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Another Card
                  </Button>
                </div>
                
                {/* Tags Field */}
                <FormField
                  control={multipleForm.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags (comma-separated)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. math, algebra, functions"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Course Content Selector */}
                <div className="pt-4">
                  <h3 className="text-lg font-medium mb-2">Course Content (Optional)</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Link these cards to specific course content to organize your cards better.
                  </p>
                  <CourseContentSelector form={multipleForm} />
                </div>

                {/* AI Generation Button (only visible when there are cards) */}
                {multipleForm.getValues().cards?.length > 0 && (
                  <div className="pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleGenerateAIAlternatives}
                      disabled={isGeneratingAI}
                      className="w-full"
                    >
                      {isGeneratingAI ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating alternatives...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Generate alternative cards from first card
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>

              <CardFooter className="flex justify-end space-x-2">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Save Cards'}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </TabsContent>
        
        <TabsContent value="batch">
          <Form {...batchForm}>
            <form onSubmit={handleBatchSubmit}>
              <CardContent className="space-y-6">
                {/* Batch Input Instructions */}
                <Alert className="mb-4 bg-amber-50/5 border-amber-200/20">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  <AlertDescription className="text-sm">
                    Enter your questions and answers in pairs with each question and answer on a separate line.
                    For example:
                    <pre className="bg-amber-50/10 p-2 mt-2 rounded text-xs overflow-auto">
                      What is the capital of France?{"\n"}
                      Paris{"\n"}
                      How many planets are in our solar system?{"\n"}
                      Eight
                    </pre>
                  </AlertDescription>
                </Alert>
                
                {/* Batch Input Field */}
                <FormField
                  control={batchForm.control}
                  name="batchInput"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cards Input</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter your questions and answers here..."
                          className="min-h-[300px] font-mono"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Put each question and answer on a separate line, with the answer directly following its question.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Tags Field */}
                <FormField
                  control={batchForm.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags (comma-separated)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. math, algebra, functions"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Difficulty Level for batch cards */}
                <FormField
                  control={batchForm.control}
                  name="difficultyLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Difficulty Level</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value || "medium"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select difficulty" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        All batch cards will have this difficulty level
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Course Content Selector */}
                <div className="pt-4">
                  <h3 className="text-lg font-medium mb-2">Course Content (Optional)</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Link these cards to specific course content to organize your cards better.
                  </p>
                  <CourseContentSelector form={batchForm} />
                </div>
              </CardContent>

              <CardFooter className="flex justify-end space-x-2">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Processing...' : 'Create Cards'}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </TabsContent>
      </Tabs>
    </Card>
  );
}; 
 
 