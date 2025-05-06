"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { ChevronLeft, BookOpen, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter 
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState } from "react";
import { toast } from "sonner";
import Loading from "@/components/Loading";
import Header from "@/components/Header";
import { useMemoryCards } from "@/hooks/useMemoryCards";
import { useGetUserEnrolledCoursesQuery } from "@/state/api";

// Form validation schema
const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  description: z.string().max(500, "Description too long").optional(),
  courseId: z.string().min(1, "Course selection is required"),
  generateCards: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

const CreateDeckPage = () => {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  
  // Get enrolled courses
  const { 
    data: enrolledCourses = [],
    isLoading: isLoadingCourses,
    error: coursesError
  } = useGetUserEnrolledCoursesQuery(user?.id || "", {
    skip: !isLoaded || !user,
  });
  
  // Use memory cards hook
  const {
    handleCreateDeck,
    isCreatingDeck,
    isGeneratingCards,
  } = useMemoryCards({
    userId: user?.id || null,
    skipInitialFetch: true, // Skip fetching decks since we don't need them here
  });
  
  // Add loading state for form submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      courseId: "",
      generateCards: false,
    },
  });
  
  const onSubmit = async (values: FormValues) => {
    if (!user) {
      toast.error("You must be signed in to create a deck");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await handleCreateDeck({
        courseId: values.courseId,
        title: values.title,
        description: values.description,
        generateCards: values.generateCards,
      });
      
      if (!result) {
        toast.error("Failed to create deck");
        return;
      }
      
      if (result.type === "generated") {
        // Handle generated cards result
        toast.success(`Deck created with ${result.cardsGenerated} auto-generated cards`);
        router.push(`/user/memory-cards/${result.deck.deckId}`, { scroll: false });
      } else {
        // Handle simple deck result
        toast.success("Deck created successfully");
        router.push(`/user/memory-cards/${result.deckId}`, { scroll: false });
      }
    } catch (error) {
      console.error('Error creating deck:', error);
      toast.error('Failed to create deck');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const goBack = () => {
    router.push("/user/memory-cards", { scroll: false });
  };
  
  if (!isLoaded) return <Loading />;
  if (!user) return <div>Please sign in to create memory cards.</div>;
  
  return (
    <div className="memory-cards-create">
      <Header
        title="Create Memory Card Deck"
        subtitle="Create a new deck of memory cards to help with your learning"
        rightElement={
          <Button onClick={goBack} variant="outline" className="memory-cards-create__back-button">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Decks
          </Button>
        }
      />
      
      <div className="memory-cards-create__content">
        <Card className="memory-cards-create__form-card">
          <CardHeader>
            <CardTitle>Deck Information</CardTitle>
            <CardDescription>
              Enter the details for your new memory card deck
            </CardDescription>
          </CardHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent>
                <div className="memory-cards-create__form-grid">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deck Title*</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter a title for your deck" {...field} />
                        </FormControl>
                        <FormDescription>
                          A descriptive name for your memory cards
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Briefly describe the purpose of this deck" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Optional description of what these cards will help you learn
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="courseId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course*</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a course" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {isLoadingCourses ? (
                              <SelectItem value="loading" disabled>
                                Loading courses...
                              </SelectItem>
                            ) : enrolledCourses.length === 0 ? (
                              <SelectItem value="none" disabled>
                                No enrolled courses
                              </SelectItem>
                            ) : (
                              enrolledCourses.map((course) => (
                                <SelectItem key={course.courseId} value={course.courseId}>
                                  {course.title}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          These cards will be associated with your selected course
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <Separator className="my-6" />
                
                <div className="memory-cards-create__ai-section">
                  <div className="memory-cards-create__ai-header">
                    <Sparkles className="memory-cards-create__ai-icon" />
                    <div>
                      <h3 className="memory-cards-create__ai-title">
                        Auto-generate cards
                      </h3>
                      <p className="memory-cards-create__ai-description">
                        Automatically generate memory cards from your course content
                      </p>
                    </div>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="generateCards"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="memory-cards-create__checkbox"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="memory-cards-create__checkbox-label">
                            Enable auto-generation
                          </FormLabel>
                          <FormDescription>
                            Cards will be generated based on the content you've already completed in the course
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
              
              <CardFooter>
                <Button 
                  type="submit" 
                  className="memory-cards-create__submit-button"
                  disabled={isSubmitting || isCreatingDeck || isGeneratingCards || isLoadingCourses}
                >
                  {isSubmitting ? (
                    <>
                      {form.getValues("generateCards") ? "Generating Cards..." : "Creating Deck..."}
                    </>
                  ) : (
                    "Create Deck"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
        
        <div className="memory-cards-create__info">
          <Card className="memory-cards-create__info-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="mr-2 h-5 w-5" />
                About Memory Cards
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="memory-cards-create__info-text">
                Memory cards (or flashcards) help you remember key information from your courses using spaced repetition—a proven learning technique.
              </p>
              
              <h4 className="memory-cards-create__info-subtitle">How it works:</h4>
              <ul className="memory-cards-create__info-list">
                <li>Create cards with questions on one side, answers on the other</li>
                <li>Review cards regularly based on your performance</li>
                <li>Cards you find difficult will appear more frequently</li>
                <li>Easily recall important information during assignments and exams</li>
              </ul>
              
              <h4 className="memory-cards-create__info-subtitle">Auto-generation:</h4>
              <p className="memory-cards-create__info-text">
                Our system can analyze course content you've completed and automatically generate relevant memory cards to test your knowledge.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateDeckPage; 
 
 
 
 
 