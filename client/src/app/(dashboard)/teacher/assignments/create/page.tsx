"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useGetCoursesQuery, useCreateAssignmentMutation, useGetUploadAssignmentFileUrlMutation } from "@/state/api";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  AlertCircle,
  ArrowLeft,
  Calendar,
  Upload,
  Trash2,
  FilePlus,
  Save
} from "lucide-react";
import { toast } from "sonner";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useUser, useAuth } from "@clerk/nextjs";
import { uploadAssignmentFile } from "@/lib/utils";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

// Define attachment type
interface Attachment {
  name: string;
  url: string;
}

const assignmentSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  courseId: z.string().min(1, "Please select a course"),
  dueDate: z.string().min(1, "Due date is required"),
  points: z.number().min(0, "Points must be a positive number"),
  status: z.enum(["draft", "published"]),
});

type AssignmentFormValues = z.infer<typeof assignmentSchema>;

interface Course {
  courseId: string;
  title: string;
  description?: string;
  teacherId: string;
  category: string;
  courseCode?: string;
  status: string;
  level: string;
}

interface ApiResponse<T> {
  data: T;
  message?: string;
  success?: boolean;
}

interface UploadUrlResponse {
  uploadUrl: string;
  fileUrl: string;
}

const CreateAssignmentPage = () => {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useUser();
  const { userId } = useAuth();
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Fetch courses for the dropdown
  const { data: coursesData, isLoading: isLoadingCourses, error: coursesError } = useGetCoursesQuery({});
  
  // For file upload
  const [getUploadUrl] = useGetUploadAssignmentFileUrlMutation();
  
  // Extract courses from API response
  const courses = useMemo(() => {
    if (!coursesData) return [] as Course[];
    
    // Handle both array responses and object responses with data property
    if (Array.isArray(coursesData)) {
      return coursesData as Course[];
    } else if (typeof coursesData === 'object' && coursesData !== null) {
      // For object responses that might have a data property
      const data = (coursesData as unknown as ApiResponse<Course[]>).data;
      return Array.isArray(data) ? data : [] as Course[];
    }
    
    return [] as Course[];
  }, [coursesData]);

  // Filter courses where the current user is the teacher
  const teacherCourses = useMemo(() => {
    if (!user) return [] as Course[];
    return courses.filter(course => course.teacherId === user.id);
  }, [courses, user]);
  
  // Create assignment mutation
  const [createAssignment, { isLoading: isCreating }] = useCreateAssignmentMutation();

  // Set up form with validation
  const form = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      title: "",
      description: "",
      courseId: "",
      dueDate: "",
      points: 10,
      status: "draft",
    },
  });

  // Set minimum date for due date (today)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const minDate = today.toISOString().slice(0, 16);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };
  
  // Remove file
  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  // Upload all files and get their URLs
  const uploadAllFiles = async (): Promise<Attachment[]> => {
    if (files.length === 0) {
      return [];
    }
    
    setIsUploading(true);
    const uploadedAttachments: Attachment[] = [];
    
    try {
      for (const file of files) {
        // Get pre-signed URL from the server
        const response = await getUploadUrl({
          fileName: file.name,
          fileType: file.type,
        }).unwrap() as UploadUrlResponse;
        
        // Check if we received valid upload URL and file URL
        if (!response.uploadUrl || !response.fileUrl) {
          throw new Error("Failed to get valid upload URL");
        }
        
        // Upload file directly to S3
        const uploadResult = await fetch(response.uploadUrl, {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": file.type,
          },
        });
        
        if (!uploadResult.ok) {
          throw new Error(`Failed to upload file: ${uploadResult.statusText}`);
        }
        
        // Add file info to attachments
        uploadedAttachments.push({
          name: file.name,
          url: response.fileUrl,
        });
      }
      
      return uploadedAttachments;
    } catch (error) {
      console.error("Error uploading files:", error);
      toast.error(error instanceof Error 
        ? `Failed to upload files: ${error.message}` 
        : "Failed to upload files");
      throw error;
    } finally {
      setIsUploading(false);
    }
  };
  
  // Handle form submission
  const onSubmit = async (data: AssignmentFormValues) => {
    try {
      if (!user) {
        toast.error("User authentication required");
        return;
      }
      
      let attachmentData: Attachment[] = [];
      
      // First upload all files to S3 if there are any
      if (files.length > 0) {
        toast.info("Uploading files...");
        attachmentData = await uploadAllFiles();
      }
      
      const assignmentData = {
        ...data,
        teacherId: user.id,
        dueDate: format(new Date(data.dueDate), "yyyy-MM-dd"),
        attachments: attachmentData,
      };
      
      // Submit to API
      await createAssignment(assignmentData).unwrap();
      
      toast.success(
        data.status === "published" 
          ? "Assignment published successfully" 
          : "Assignment saved as draft"
      );
      
      // Navigate to the assignments list
      router.push("/teacher/assignments");
      
    } catch (err: any) {
      const errorMessage = err.data?.message || err.message || "Unknown error";
      toast.error(`Failed to create assignment: ${errorMessage}`);
      console.error("Assignment creation error:", err);
    }
  };

  if (!isClient) {
    return (
      <div className="container mx-auto py-10 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mr-2" />
        <span>Loading form...</span>
      </div>
    );
  }

  if (isLoadingCourses) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
      </div>
    );
  }

  if (coursesError) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-2">Failed to load courses</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-5xl mx-auto">
        <CardHeader>
          <CardTitle>Create Assignment</CardTitle>
          <CardDescription>
            Create a new assignment for your students
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter assignment title" {...field} />
                    </FormControl>
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
                        placeholder="Enter assignment details, requirements, etc." 
                        className="min-h-32" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="courseId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course</FormLabel>
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
                          {teacherCourses.length === 0 ? (
                            <SelectItem value="no-courses" disabled>
                              No courses available
                            </SelectItem>
                          ) : (
                            teacherCourses.map((course) => (
                              <SelectItem key={course.courseId} value={course.courseId}>
                                {course.title}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Due Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <DayPicker
                            mode="single"
                            selected={field.value ? new Date(field.value) : undefined}
                            onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="points"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Points</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="100" 
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="files">Attachments</Label>
                  <div className="mt-2">
                    <div className="flex items-center">
                      <Label 
                        htmlFor="file-upload" 
                        className="cursor-pointer bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 px-4 py-2 rounded-md flex items-center transition-colors"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Add Files
                      </Label>
                      <Input 
                        id="file-upload" 
                        type="file" 
                        multiple 
                        onChange={handleFileChange} 
                        className="hidden"
                      />
                    </div>
                  </div>
                  
                  {files.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {files.map((file, index) => (
                        <div 
                          key={index}
                          className="p-3 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-between"
                        >
                          <div className="flex items-center">
                            <FilePlus className="h-5 w-5 text-blue-400 mr-2" />
                            <span className="truncate max-w-[200px] md:max-w-md">{file.name}</span>
                            <span className="text-xs text-slate-400 ml-2">
                              {(file.size / 1024).toFixed(0)} KB
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                            className="text-red-400 hover:text-red-300 hover:bg-transparent"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 pt-4">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/teacher/assignments")}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={isCreating || isUploading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {(isCreating || isUploading) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isUploading ? "Uploading Files..." : isCreating ? "Creating..." : "Create Assignment"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateAssignmentPage; 