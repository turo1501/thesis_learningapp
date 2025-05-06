"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { ChevronLeft, BookOpen, Sparkles, AlertCircle, Loader2 } from "lucide-react";
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
import { cn } from "@/lib/utils";

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

  // Watch the generateCards field to conditionally render UI
  const generateCards = form.watch("generateCards");
  
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
                    <Sparkles className={cn(
                      "memory-cards-create__ai-icon",
                      generateCards && "text-yellow-400 animate-pulse"
                    )} />
                    <div>
                      <h3 className="memory-cards-create__ai-title">
                        AI Memory Card Generation
                      </h3>
                      <p className="memory-cards-create__ai-description">
                        Let our DeepSeek AI analyze your course content and generate high-quality flashcards
                      </p>
                    </div>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="generateCards"
                    render={({ field }) => (
                      <FormItem className={cn(
                        "flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4",
                        field.value && "bg-indigo-50 border-indigo-200"
                      )}>
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="memory-cards-create__checkbox"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className={cn(
                            "memory-cards-create__checkbox-label",
                            field.value && "font-bold text-indigo-700"
                          )}>
                            Enable AI card generation
                          </FormLabel>
                          <FormDescription>
                            Our DeepSeek AI model will analyze your completed course content and generate 
                            flashcards tailored to your learning needs
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  {generateCards && (
                    <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-md">
                      <div className="flex items-start">
                        <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium text-amber-800">About AI Generation</h4>
                          <p className="text-sm text-amber-700 mt-1">
                            AI card generation analyzes your completed course materials and creates flashcards 
                            automatically. This process can take up to 1 minute as our DeepSeek AI model works 
                            to create high-quality learning materials.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              
              <CardFooter>
                <Button 
                  type="submit" 
                  className={cn(
                    "memory-cards-create__submit-button",
                    generateCards && "bg-gradient-to-r from-indigo-600 to-purple-600"
                  )}
                  disabled={isSubmitting || isCreatingDeck || isGeneratingCards || isLoadingCourses}
                >
                  {isSubmitting || isGeneratingCards ? (
                    <div className="flex items-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {generateCards ? "Generating AI Cards..." : "Creating Deck..."}
                    </div>
                  ) : (
                    generateCards ? "Create Deck with AI Cards" : "Create Empty Deck"
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
              
              <h4 className="memory-cards-create__info-subtitle">AI Generation:</h4>
              <p className="memory-cards-create__info-text">
                Our DeepSeek AI system analyzes course content you've completed and automatically generates 
                relevant memory cards to test your knowledge. The AI creates questions that promote deeper 
                understanding rather than simple memorization.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateDeckPage; 
 
 
 
 
 