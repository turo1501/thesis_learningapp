"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useGetCoursesQuery, useCreateAssignmentMutation } from "@/state/api";
import { format } from "date-fns";
import { CalendarIcon, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import Header from "@/components/Header";
import { toast } from "sonner";

const formSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  courseId: z.string().min(1, { message: "Course is required" }),
  dueDate: z.date({ required_error: "Due date is required" }),
  points: z.number().min(1, { message: "Points must be at least 1" }),
});

export default function CreateAssignmentPage() {
  const router = useRouter();
  const { user } = useUser();
  const { data: courses = [], isLoading: isLoadingCourses } = useGetCoursesQuery({ category: "" });
  const [createAssignment, { isLoading }] = useCreateAssignmentMutation();
  
  // Filter courses where the teacher is the owner
  const teacherCourses = courses.filter(course => course.teacherId === user?.id);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      courseId: "",
      points: 10,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await createAssignment({
        courseId: values.courseId,
        title: values.title,
        description: values.description,
        dueDate: values.dueDate.toISOString(),
        points: values.points,
      }).unwrap();
      
      toast.success("Assignment created successfully");
      router.push("/teacher/assignments");
    } catch (error) {
      console.error("Failed to create assignment:", error);
      toast.error("Failed to create assignment");
    }
  }

  // Function to check if a date is in the past
  const isPastDate = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <div className="create-assignment">
      <div className="flex items-center gap-5 mb-5">
        <button
          className="flex items-center border border-slate-700 rounded-lg p-2 gap-2 cursor-pointer hover:bg-slate-800 text-slate-300"
          onClick={() => router.push("/teacher/assignments")}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Assignments</span>
        </button>
      </div>

      <Header 
        title="Create Assignment" 
        subtitle="Create a new assignment for your students" 
      />

      <Card className="mt-6 bg-slate-800 border-slate-700">
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-200">Assignment Title</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter a title for your assignment" 
                        {...field} 
                        className="bg-slate-900 border-slate-700 text-slate-200"
                      />
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
                    <FormLabel className="text-slate-200">Assignment Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Provide detailed instructions for your students" 
                        {...field} 
                        rows={5}
                        className="bg-slate-900 border-slate-700 text-slate-200 resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="courseId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200">Course</FormLabel>
                      <Select 
                        disabled={isLoadingCourses} 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-200">
                            <SelectValue placeholder="Select a course" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-slate-900 border-slate-700 text-slate-200">
                          {teacherCourses.map(course => (
                            <SelectItem key={course.courseId} value={course.courseId} className="cursor-pointer">
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
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-slate-200">Due Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal bg-slate-900 border-slate-700 text-slate-200",
                                !field.value && "text-slate-500"
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
                        <PopoverContent className="w-auto p-0 bg-slate-900 border-slate-700" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                            disabled={[{ before: new Date() }]}
                            className="bg-slate-900 text-slate-200"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="points"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200">Points</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value))}
                          className="bg-slate-900 border-slate-700 text-slate-200"
                        />
                      </FormControl>
                      <FormDescription className="text-slate-400">
                        Maximum points for this assignment
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/teacher/assignments")}
                  className="border-slate-700 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating..." : "Create Assignment"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
} 