"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useGenerateAICourseMutation, useCheckAIStatusQuery } from "@/state/api";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { AlertCircle, BrainCircuit, Loader2, AlertTriangle } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const formSchema = z.object({
  topicTitle: z.string().min(3, "Topic title must be at least 3 characters").max(100),
  targetAudience: z.string().optional(),
  difficultyLevel: z.enum(["beginner", "intermediate", "advanced"]),
  keyPoints: z.string().optional(),
  courseLength: z.enum(["short", "medium", "long"]),
});

type FormValues = z.infer<typeof formSchema>;

const AIGenerationLoadingState = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = [
    "Analyzing your input...",
    "Creating course structure...",
    "Generating section content...",
    "Refining chapter details...",
    "Finalizing your course..."
  ];
  
  useEffect(() => {
    // Simulate AI generation steps progression
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        // Loop through steps but spend more time on later steps
        const newStep = prev + 1;
        return newStep < steps.length ? newStep : prev;
      });
    }, 2000); // Update every 2 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="space-y-3">
      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500"
          style={{ width: `${Math.min(100, (currentStep + 1) * 20)}%` }}
        />
      </div>
      <p className="text-sm font-medium">{steps[currentStep]}</p>
      <p className="text-xs text-muted-foreground">
        This may take a minute. We're using AI to generate quality content for your course.
      </p>
    </div>
  );
};

// Add AI Status component
const AIStatusCheck = () => {
  const { data: aiStatus, isLoading, error } = useCheckAIStatusQuery();
  
  if (isLoading) return null; // Don't show anything while loading
  
  // Display warning if there's an issue with the Deepseek API
  if (aiStatus && aiStatus.status === "insufficient_balance") {
    return (
      <Alert variant="warning" className="max-w-3xl mx-auto mt-4 bg-amber-50 border-amber-200">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-800">Deepseek API Balance Warning</AlertTitle>
        <AlertDescription className="text-amber-700">
          The Deepseek AI account has insufficient balance. The system will fall back to the mock generator in development mode, 
          but this feature may be unavailable in production. Please contact the administrator.
        </AlertDescription>
      </Alert>
    );
  }
  
  if (error || (aiStatus && aiStatus.status && aiStatus.status !== "operational" && !aiStatus.usingMock)) {
    return (
      <Alert variant="warning" className="max-w-3xl mx-auto mt-4 bg-amber-50 border-amber-200">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-800">AI Service Warning</AlertTitle>
        <AlertDescription className="text-amber-700">
          {aiStatus?.error || "The Deepseek AI service is currently experiencing issues."}
          {aiStatus?.usingMock ? " The system will use a mock generator instead." : " This feature may be temporarily unavailable."}
        </AlertDescription>
      </Alert>
    );
  }
  
  return null;
};

const AICreateCoursePage = () => {
  const router = useRouter();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generateAICourse, { isError }] = useGenerateAICourseMutation();

  // Browser extension error handler - moved inside the component
  useEffect(() => {
    // This helps catch errors from browser extensions that might interfere
    // with our app, particularly those that use fabric.js or similar libraries
    const handleError = (event: ErrorEvent) => {
      // Check if the error is related to getActiveObject
      if (event.message && (
          event.message.includes('getActiveObject') || 
          event.message.includes('content.js') ||
          event.message.includes('Cannot read properties of undefined')
        )) {
        console.warn('Caught browser extension conflict:', event.message);
        console.warn('This error is being suppressed as it likely comes from a browser extension and not the application itself.');
        event.preventDefault();
        event.stopPropagation();
      }
    };

    // Add error event listener
    window.addEventListener('error', handleError);
    
    // Clean up
    return () => {
      window.removeEventListener('error', handleError);
    };
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topicTitle: "",
      targetAudience: "",
      difficultyLevel: "beginner",
      keyPoints: "",
      courseLength: "medium",
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (!user) {
      toast.error("You must be logged in to create a course");
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      const response = await generateAICourse({
        ...values,
        teacherId: user.id,
        teacherName: user.fullName || "Unknown Teacher",
      }).unwrap();
      
      console.log("AI course generation response:", response);
      
      // Enhanced response handling
      let courseData;
      // Handle nested data structure
      if (response && typeof response === 'object') {
        if (response.data?.data) {
          courseData = response.data.data;
        } else if (response.data) {
          courseData = response.data;
        } else {
          courseData = response;
        }
      } else {
        courseData = response;
      }
      
      console.log("Normalized course data:", courseData);
      
      // Check if we have a valid courseId in any of the possible response formats
      if (courseData && typeof courseData === 'object' && 
          (courseData.courseId || 
           (courseData.course && courseData.course.courseId) || 
           (courseData._id) || 
           (courseData.id))) {
        
        // Extract the course ID from whatever format it's in
        const courseId = courseData.courseId || 
                        (courseData.course && courseData.course.courseId) || 
                        courseData._id || 
                        courseData.id;
                        
        toast.success("AI course generated successfully!");
        router.push(`/teacher/courses/${courseId}`);
      } else {
        console.error("Invalid response structure:", response);
        throw new Error("Course ID not found in response");
      }
    } catch (error: any) {
      console.error("Error generating course:", error);
      
      let errorMessage = "Failed to generate course. Please try again.";
      
      if (error.data) {
        if (error.data.error && typeof error.data.error === 'string') {
          errorMessage = error.data.error;
        } else if (error.data.message) {
          errorMessage = error.data.message;
        }
        
        if (error.data.details && error.data.details.error) {
          const aiError = error.data.details.error;
          
          if (aiError.code === "model_not_found") {
            errorMessage = "The AI model is currently unavailable. Please try again later or contact support.";
          } else if (aiError.code === "rate_limit_exceeded") {
            errorMessage = "AI service rate limit exceeded. Please try again in a few minutes.";
          } else if (aiError.code === "invalid_api_key") {
            errorMessage = "Authentication issue with the AI service. Please contact support.";
          } else if (aiError.code === "server_error") {
            errorMessage = "The AI service is experiencing technical difficulties. Please try again later.";
          } else if (aiError.code === "timeout") {
            errorMessage = "The request to the AI service timed out. Please try again with a simpler request.";
          } else if (aiError.code === "insufficient_balance") {
            errorMessage = "The Deepseek AI account has insufficient credits. The system administrator needs to add credits to continue using this feature.";
          } else if (aiError.message) {
            errorMessage = `Deepseek AI Error: ${aiError.message}`;
          }
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      toast.error("Failed to generate course");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ai-course-create">
      <Header
        title="AI Course Creator"
        subtitle="Generate a complete course structure using AI"
      />

      <AIStatusCheck />

      {error && (
        <Alert variant="destructive" className="max-w-3xl mx-auto mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>
            {error.includes("rate limit") || error.includes("quota") ? "Rate Limit Exceeded" : 
             error.includes("timeout") ? "Request Timeout" :
             error.includes("model") ? "AI Service Error" : 
             error.includes("insufficient") || error.includes("balance") ? "Insufficient Credits" :
             error.includes("key") || error.includes("authentication") || error.includes("permission") ? "Authentication Error" : 
             "Error"}
          </AlertTitle>
          <AlertDescription>
            {error}
            {(error.includes("rate limit") || error.includes("quota") || error.includes("overloaded")) && (
              <div className="mt-2">
                <p className="text-sm">Please try again after a few minutes. The AI service is currently experiencing high demand.</p>
              </div>
            )}
            {error.includes("timeout") && (
              <div className="mt-2">
                <p className="text-sm">Your request was complex and took too long to process. Try again with fewer key points or a shorter course length.</p>
              </div>
            )}
            {error.includes("model") && (
              <div className="mt-2">
                <p className="text-sm">The Deepseek AI service is temporarily unavailable. The system will use a fallback model when possible.</p>
              </div>
            )}
            {error.includes("insufficient") && (
              <div className="mt-2">
                <p className="text-sm">The Deepseek AI account needs additional credits. Please contact the system administrator.</p>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      <Card className="max-w-3xl mx-auto mt-8 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
          <div className="flex items-center gap-2">
            <BrainCircuit size={24} />
            <CardTitle className="text-2xl">AI-Powered Course Generator</CardTitle>
          </div>
          <CardDescription className="text-gray-100">
            Create a professional course structure in seconds with AI assistance
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="topicTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Topic</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., JavaScript for Beginners, Digital Marketing Strategies"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter the main topic of your course
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="targetAudience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Audience</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Beginners interested in web development, Marketing professionals looking to enhance their skills"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Describe your ideal students (optional)
                    </FormDescription>
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
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose the difficulty level for your course
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="keyPoints"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Key Topics to Cover</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., DOM manipulation, async/await, React hooks"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      List important concepts you want to include (optional)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="courseLength"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Length</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select course length" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="short">Short (2-3 sections)</SelectItem>
                        <SelectItem value="medium">Medium (4-6 sections)</SelectItem>
                        <SelectItem value="long">Long (7+ sections)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose the approximate length of your course
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <CardFooter className="px-0 pt-6 flex justify-between">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Course...
                    </>
                  ) : (
                    <>
                      <BrainCircuit className="mr-2 h-4 w-4" />
                      Generate Course
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="mt-6">
          <AIGenerationLoadingState />
        </div>
      )}

      <div className="mt-10 mb-8 max-w-3xl mx-auto">
        <h3 className="text-xl font-semibold mb-4">What to Expect</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h4 className="font-medium text-indigo-600 mb-2">Complete Structure</h4>
            <p className="text-gray-600">Get a full course outline with sections and chapters</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h4 className="font-medium text-indigo-600 mb-2">Rich Content</h4>
            <p className="text-gray-600">AI generates detailed content for each chapter</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h4 className="font-medium text-indigo-600 mb-2">Fully Editable</h4>
            <p className="text-gray-600">Customize anything after generation to match your style</p>
          </div>
        </div>
        
        <div className="mt-6 bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-lg border border-indigo-100">
          <div className="flex items-center gap-2 mb-2">
            <BrainCircuit size={18} className="text-indigo-500" />
            <h4 className="font-medium text-indigo-700">Powered by Deepseek AI</h4>
          </div>
          <p className="text-sm text-gray-700">
            Our course generator uses Deepseek's advanced AI models to create high-quality, 
            structured educational content tailored to your specific needs. The generated 
            content serves as an excellent starting point that you can refine and expand.
          </p>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-white bg-opacity-70 p-3 rounded-md shadow-sm">
              <h5 className="text-sm font-medium text-indigo-700">Tips for Best Results</h5>
              <ul className="text-xs text-gray-600 list-disc list-inside mt-1 space-y-1">
                <li>Be specific with your course topic</li>
                <li>Include key concepts you want covered</li>
                <li>Choose appropriate difficulty level</li>
                <li>Define your target audience clearly</li>
              </ul>
            </div>
            <div className="bg-white bg-opacity-70 p-3 rounded-md shadow-sm">
              <h5 className="text-sm font-medium text-indigo-700">After Generation</h5>
              <ul className="text-xs text-gray-600 list-disc list-inside mt-1 space-y-1">
                <li>Review and edit content as needed</li>
                <li>Add your own examples and insights</li>
                <li>Create additional exercises</li>
                <li>Add multimedia content for better engagement</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AICreateCoursePage; 