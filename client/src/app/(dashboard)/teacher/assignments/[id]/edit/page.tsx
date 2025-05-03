"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
  useGetCoursesQuery, 
  useUpdateAssignmentMutation, 
  useGetUploadAssignmentFileUrlMutation, 
  useGetAssignmentQuery 
} from "@/state/api";
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
  Save,
  FileText,
  Link as LinkIcon,
  ExternalLink
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
import { useUser } from "@clerk/nextjs";
import { format, parse } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

// Define validation schema
const assignmentSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  courseId: z.string().min(1, "Please select a course"),
  dueDate: z.string().min(1, "Due date is required"),
  points: z.coerce.number().min(0, "Points must be a positive number"),
  status: z.enum(["draft", "published", "archived"]),
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

interface Assignment {
  assignmentId: string;
  courseId: string;
  teacherId: string;
  title: string;
  description: string;
  dueDate: string;
  points: number;
  status: "draft" | "published" | "archived";
  submissions: any[];
  attachments: Array<{ name: string; url: string }>;
  createdAt?: string;
  updatedAt?: string;
}

const EditAssignmentPage = () => {
  const router = useRouter();
  const params = useParams();
  const assignmentId = params.id as string;
  
  const [files, setFiles] = useState<File[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<{ name: string; url: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useUser();
  const [isClient, setIsClient] = useState(false);
  
  // Ensure client-side only rendering for date pickers
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Fetch the assignment for editing
  const { 
    data: assignmentData, 
    isLoading: isLoadingAssignment, 
    error: assignmentError 
  } = useGetAssignmentQuery(assignmentId, {
    skip: !assignmentId
  });
  
  // Fetch courses for the dropdown
  const { 
    data: coursesData, 
    isLoading: isLoadingCourses, 
    error: coursesError 
  } = useGetCoursesQuery({});
  
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
  
  // Update assignment mutation
  const [updateAssignment, { isLoading: isUpdating }] = useUpdateAssignmentMutation();

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
  
  // Populate form with assignment data when it's loaded
  useEffect(() => {
    if (assignmentData) {
      try {
        const assignment = assignmentData as unknown as Assignment;
        
        // Format the date to match the expected input format YYYY-MM-DD
        const dueDateStr = assignment.dueDate;
        
        // Try to parse and format the date
        let formattedDate = dueDateStr;
        try {
          // If it's a date string like 2023-05-01
          const date = new Date(dueDateStr);
          if (!isNaN(date.getTime())) {
            formattedDate = format(date, "yyyy-MM-dd");
          }
        } catch (err) {
          console.error("Error formatting date:", err);
        }
        
        form.reset({
          title: assignment.title,
          description: assignment.description,
          courseId: assignment.courseId,
          dueDate: formattedDate,
          points: assignment.points,
          status: assignment.status,
        });
        
        // Set existing attachments
        if (Array.isArray(assignment.attachments)) {
          setExistingAttachments(assignment.attachments);
        } else if (typeof assignment.attachments === 'object' && assignment.attachments !== null) {
          // Handle the case where attachments might be an object
          setExistingAttachments(Object.values(assignment.attachments));
        } else {
          setExistingAttachments([]);
        }
      } catch (error) {
        console.error("Error populating form:", error);
        toast.error("Error loading assignment data");
      }
    }
  }, [assignmentData, form]);

  // Set minimum date for due date (today)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const minDate = today.toISOString().slice(0, 16);
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };
  
  // Remove file from new files
  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  // Remove an existing attachment
  const removeExistingAttachment = (index: number) => {
    setExistingAttachments(prev => prev.filter((_, i) => i !== index));
  };
  
  // Upload all files and get their URLs
  const uploadAllFiles = async () => {
    if (files.length === 0) {
      return [];
    }
    
    setIsUploading(true);
    const uploadedAttachments = [];
    
    try {
      for (const file of files) {
        // Get pre-signed URL from the server
        const response = await getUploadUrl({
          fileName: file.name,
          fileType: file.type,
        }).unwrap();
        
        // Upload file directly to S3
        await fetch(response.uploadUrl, {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": file.type,
          },
        });
        
        // Add file info to attachments
        uploadedAttachments.push({
          name: file.name,
          url: response.fileUrl,
        });
      }
      
      return uploadedAttachments;
    } catch (error) {
      console.error("Error uploading files:", error);
      toast.error("Failed to upload one or more files");
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
      
      // First upload all files to S3
      const uploadedAttachments = await uploadAllFiles();
      
      // Combine existing and new attachments
      const allAttachments = [...existingAttachments, ...uploadedAttachments];
      
      const assignmentData = {
        assignmentId,
        ...data,
        teacherId: user.id,
        dueDate: format(new Date(data.dueDate), "yyyy-MM-dd"),
        attachments: allAttachments,
      };
      
      console.log("Updating assignment with data:", assignmentData);
      
      // Submit to API
      await updateAssignment(assignmentData).unwrap();
      
      toast.success(
        data.status === "published" 
          ? "Assignment updated and published successfully" 
          : "Assignment updated successfully"
      );
      
      // Navigate to the assignment details page
      setTimeout(() => {
        router.push(`/teacher/assignments/${assignmentId}`);
      }, 500);
      
    } catch (err: any) {
      toast.error(`Failed to update assignment: ${err.message || "Unknown error"}`);
      console.error("Assignment update error:", err);
    }
  };

  if (isLoadingAssignment || isLoadingCourses) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
      </div>
    );
  }

  if (assignmentError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Error Loading Assignment</h1>
        <p className="text-gray-600 mb-4">
          There was an error loading the assignment data. Please try again.
        </p>
        <Button onClick={() => router.push("/teacher/assignments")}>
          Return to Assignments
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <Header 
        title="Edit Assignment" 
        subtitle="Update the details of this assignment"
      />
      
      <div className="flex justify-between items-center mb-6">
        <Button
          variant="outline"
          size="sm"
        onClick={() => router.push(`/teacher/assignments/${assignmentId}`)}
      >
          <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Assignment
        </Button>
      </div>
      
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Edit Assignment Details</CardTitle>
          <CardDescription>
            Update information and materials for this assignment. Students will see these changes.
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
                    <FormLabel>Assignment Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter a descriptive title" {...field} />
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
                        placeholder="Explain what students need to do" 
                        rows={5} 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="courseId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a course" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {teacherCourses.map((course) => (
                            <SelectItem key={course.courseId} value={course.courseId}>
                              {course.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="points"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Points</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={0} 
                          placeholder="Assignment point value" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                format(new Date(field.value), "PPP")
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
                            onSelect={(day) => field.onChange(day ? format(day, "yyyy-MM-dd") : "")}
                            disabled={{ before: new Date() }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
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
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="draft">Draft (not visible to students)</SelectItem>
                          <SelectItem value="published">Published (visible to students)</SelectItem>
                          <SelectItem value="archived">Archived (hidden from active view)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="space-y-4">
                <Label htmlFor="attachments">Attachments</Label>
                
                {/* Existing attachments */}
                {existingAttachments.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-500">Current Attachments</h4>
                    <div className="space-y-2">
                      {existingAttachments.map((attachment, index) => (
                        <div 
                          key={`existing-${index}`} 
                          className="flex items-center justify-between p-2 border rounded bg-gray-50"
                        >
                          <div className="flex items-center">
                            <LinkIcon className="h-4 w-4 mr-2 text-blue-500" />
                            <span className="text-sm truncate max-w-xs">
                              {attachment.name}
                            </span>
                          </div>
                          <div className="flex space-x-2">
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm"
                              onClick={() => window.open(attachment.url, "_blank")}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm"
                              onClick={() => removeExistingAttachment(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* New files to upload */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-500">Add New Files</h4>
                    <Label 
                      htmlFor="file-upload" 
                      className="cursor-pointer text-sm text-blue-500 hover:text-blue-700 flex items-center"
                    >
                      <FilePlus className="h-4 w-4 mr-1" />
                      Add File
                    </Label>
                    <Input
                      id="file-upload"
                      type="file"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                  
                  {files.length > 0 && (
                    <div className="space-y-2">
                      {files.map((file, index) => (
                        <div 
                          key={`new-${index}`} 
                          className="flex items-center justify-between p-2 border rounded bg-blue-50"
                        >
                          <span className="text-sm truncate max-w-xs">
                            {file.name}
                          </span>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm"
                            onClick={() => removeFile(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/teacher/assignments/${assignmentId}`)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isUpdating || isUploading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {(isUpdating || isUploading) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Changes
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditAssignmentPage;