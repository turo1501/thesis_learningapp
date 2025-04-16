"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useGetCoursesQuery, useCreateMeetingMutation } from "@/state/api";
import { format } from "date-fns";
import { 
  CalendarIcon, 
  ArrowLeft, 
  Clock, 
  Plus, 
  Trash, 
  Users 
} from "lucide-react";

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

// Define Course type locally instead of importing
type Course = {
  courseId: string;
  teacherId: string;
  teacherName: string;
  title: string;
  description?: string;
  category: string;
  image?: string;
  price?: number;
  level: "Beginner" | "Intermediate" | "Advanced";
  status: "Draft" | "Published";
  sections: any[];
  enrollments?: Array<{
    userId: string;
    userName?: string;
    userEmail?: string;
  }>;
};

// Define API response type
interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

const formSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters" }),
  description: z.string().optional(),
  courseId: z.string().min(1, { message: "Course is required" }),
  date: z.date({ required_error: "Meeting date is required" }),
  startTime: z.string().min(1, { message: "Start time is required" }),
  duration: z.number().min(5, { message: "Duration must be at least 5 minutes" }),
  type: z.enum(["individual", "group"]),
  meetingLink: z.string().optional(),
  location: z.string().optional(),
});

type Participant = {
  studentId: string;
  studentName: string;
  studentEmail: string;
  status?: "confirmed" | "pending" | "cancelled";
};

export default function CreateMeetingPage() {
  const router = useRouter();
  const { user } = useUser();
  const { data: coursesData = [], isLoading: isLoadingCourses } = useGetCoursesQuery({ category: "" });
  const [createMeeting, { isLoading }] = useCreateMeetingMutation();
  
  // Handle courses data properly
  const courses = useMemo(() => {
    // Handle different response formats
    if (Array.isArray(coursesData)) {
      return coursesData as Course[];
    } else if (typeof coursesData === 'object' && coursesData !== null) {
      // For object responses that might have a data property
      const data = (coursesData as unknown as ApiResponse<Course[]>).data;
      return Array.isArray(data) ? data : [] as Course[];
    }
    return [] as Course[];
  }, [coursesData]);
  
  // Filter courses where the teacher is the owner
  const teacherCourses = useMemo(() => {
    return courses.filter(course => course.teacherId === user?.id);
  }, [courses, user?.id]);
  
  // State for participants
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [selectedCourseStudents, setSelectedCourseStudents] = useState<Participant[]>([]);
  const [isClient, setIsClient] = useState(false);

  // Use useEffect to handle client-side only code
  useEffect(() => {
    setIsClient(true);
    // Set date only on client-side to avoid hydration mismatch
    if (!form.getValues().date) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      form.setValue('date', tomorrow);
    }
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      courseId: "",
      type: "individual",
      duration: 30,
    },
  });

  // When course changes, update available students
  const onCourseChange = (courseId: string) => {
    form.setValue("courseId", courseId);
    
    // Get students enrolled in this course
    const course = teacherCourses.find(c => c.courseId === courseId);
    if (course && course.enrollments && course.enrollments.length > 0) {
      const students = course.enrollments.map((enrollment) => ({
        studentId: enrollment.userId,
        studentName: enrollment.userName || 'Unknown Student',
        studentEmail: enrollment.userEmail || 'unknown@example.com',
      }));
      setSelectedCourseStudents(students);
    } else {
      setSelectedCourseStudents([]);
    }
  };
  
  // Add a participant
  const addParticipant = () => {
    if (!studentName || !studentEmail) {
      toast.error("Please provide both student name and email");
      return;
    }
    
    const newParticipant = {
      studentId: `manual-${Date.now()}`, // Generate a temporary ID
      studentName,
      studentEmail,
      status: "pending" as const,
    };
    
    setParticipants([...participants, newParticipant]);
    setStudentName("");
    setStudentEmail("");
  };
  
  // Add a student from the course
  const addStudentFromCourse = (student: Participant) => {
    // Check if student is already added
    if (participants.some(p => p.studentId === student.studentId)) {
      toast.error("This student is already added to the meeting");
      return;
    }
    
    // Add status field to the participant
    const newParticipant = {
      ...student,
      status: "pending" as const
    };
    
    setParticipants([...participants, newParticipant]);
  };
  
  // Remove a participant
  const removeParticipant = (index: number) => {
    setParticipants(participants.filter((_, i) => i !== index));
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (participants.length === 0) {
        toast.error("Please add at least one participant to the meeting");
        return;
      }

      // Find course name for reference
      const course = teacherCourses.find(c => c.courseId === values.courseId);
      
      // Extract values and prepare payload with correct types
      const { date, ...otherValues } = values;
      
      // Format the participants to match the expected format
      const formattedParticipants = participants.map(p => ({
        studentId: p.studentId,
        studentName: p.studentName,
        studentEmail: p.studentEmail,
        status: p.status || "pending"
      }));
      
      await createMeeting({
        ...otherValues,
        date: date.toISOString(), // Convert Date to string
        courseName: course?.title || "",
        participants: formattedParticipants
      }).unwrap();
      
      toast.success("Meeting created successfully");
      router.push("/teacher/meetings");
    } catch (error) {
      console.error("Failed to create meeting:", error);
      toast.error("Failed to create meeting");
    }
  }

  // Fix the disabled function in the Calendar component
  const isPastDate = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  // Only render the form on the client to prevent hydration errors
  if (!isClient) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="create-meeting">
      <div className="flex items-center gap-5 mb-5">
        <button
          className="flex items-center border border-slate-700 rounded-lg p-2 gap-2 cursor-pointer hover:bg-slate-800 text-slate-300"
          onClick={() => router.push("/teacher/meetings")}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Meetings</span>
        </button>
      </div>

      <Header 
        title="Create Meeting" 
        subtitle="Schedule a new meeting with your students" 
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
                    <FormLabel className="text-slate-200">Meeting Title</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter a title for your meeting" 
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
                    <FormLabel className="text-slate-200">Meeting Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Provide details about this meeting" 
                        {...field} 
                        rows={3}
                        className="bg-slate-900 border-slate-700 text-slate-200 resize-none"
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
                      <FormLabel className="text-slate-200">Course</FormLabel>
                      <Select 
                        disabled={isLoadingCourses} 
                        onValueChange={onCourseChange}
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
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200">Meeting Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-200">
                            <SelectValue placeholder="Select meeting type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-slate-900 border-slate-700 text-slate-200">
                          <SelectItem value="individual">Individual</SelectItem>
                          <SelectItem value="group">Group</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription className="text-slate-400">
                        Individual meetings are one-on-one, group meetings include multiple students
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-slate-200">Meeting Date</FormLabel>
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
                          {isClient && (
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                              disabled={[{ before: new Date() }]}
                              className="bg-slate-900 text-slate-200"
                            />
                          )}
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200">Start Time</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input
                            type="time"
                            {...field}
                            className="bg-slate-900 border-slate-700 text-slate-200"
                          />
                        </FormControl>
                        <Clock className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200">Duration (minutes)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={5}
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value))}
                          className="bg-slate-900 border-slate-700 text-slate-200"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="meetingLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-200">Meeting Link (optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://meet.google.com/..." 
                        {...field} 
                        value={field.value || ""}
                        className="bg-slate-900 border-slate-700 text-slate-200"
                      />
                    </FormControl>
                    <FormDescription className="text-slate-400">
                      URL to the video meeting (Zoom, Google Meet, etc.)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-200">Location (optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Office 302, Online, etc." 
                        {...field}
                        value={field.value || ""} 
                        className="bg-slate-900 border-slate-700 text-slate-200"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <h3 className="text-lg font-medium text-slate-200 mb-4">Participants</h3>
                
                {selectedCourseStudents.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-slate-300 mb-2">Add from course students</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {selectedCourseStudents.map(student => (
                        <div 
                          key={student.studentId}
                          className="flex items-center justify-between bg-slate-900 p-2 rounded-md"
                        >
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-2 text-slate-400" />
                            <span className="text-sm text-slate-300">{student.studentName}</span>
                          </div>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => addStudentFromCourse(student)}
                            className="h-7 text-blue-400 hover:text-blue-300 hover:bg-blue-950/30"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="text-sm font-medium text-slate-300 mb-1 block">Student Name</label>
                    <Input 
                      placeholder="Jane Doe" 
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      className="bg-slate-900 border-slate-700 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-300 mb-1 block">Student Email</label>
                    <Input 
                      placeholder="jane@example.com" 
                      value={studentEmail}
                      onChange={(e) => setStudentEmail(e.target.value)}
                      className="bg-slate-900 border-slate-700 text-slate-200"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button 
                      type="button"
                      onClick={addParticipant}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Participant
                    </Button>
                  </div>
                </div>
                
                {participants.length > 0 ? (
                  <div className="space-y-2 mb-4">
                    <h4 className="text-sm font-medium text-slate-300 mb-2">Added Participants</h4>
                    {participants.map((participant, index) => (
                      <div 
                        key={index}
                        className="flex justify-between items-center bg-slate-900 p-3 rounded-md"
                      >
                        <div>
                          <p className="text-slate-200">{participant.studentName}</p>
                          <p className="text-xs text-slate-400">{participant.studentEmail}</p>
                        </div>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => removeParticipant(index)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-950/30"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-4 bg-slate-900 rounded-md mb-4">
                    <p className="text-slate-400">No participants added yet</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/teacher/meetings")}
                  className="border-slate-700 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isLoading || participants.length === 0}
                >
                  {isLoading ? "Creating..." : "Create Meeting"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
} 
                      onClick={addParticipant}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Participant
                    </Button>
                  </div>
                </div>
                
                {participants.length > 0 ? (
                  <div className="space-y-2 mb-4">
                    <h4 className="text-sm font-medium text-slate-300 mb-2">Added Participants</h4>
                    {participants.map((participant, index) => (
                      <div 
                        key={index}
                        className="flex justify-between items-center bg-slate-900 p-3 rounded-md"
                      >
                        <div>
                          <p className="text-slate-200">{participant.studentName}</p>
                          <p className="text-xs text-slate-400">{participant.studentEmail}</p>
                        </div>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => removeParticipant(index)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-950/30"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-4 bg-slate-900 rounded-md mb-4">
                    <p className="text-slate-400">No participants added yet</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/teacher/meetings")}
                  className="border-slate-700 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isLoading || participants.length === 0}
                >
                  {isLoading ? "Creating..." : "Create Meeting"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
} 