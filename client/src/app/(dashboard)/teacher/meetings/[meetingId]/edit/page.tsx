"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useGetMeetingQuery, useUpdateMeetingMutation } from "@/state/api";
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

const formSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters" }),
  description: z.string().optional(),
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
  status: "confirmed" | "pending" | "cancelled";
};

export default function EditMeetingPage() {
  const router = useRouter();
  const params = useParams();
  const meetingId = params.meetingId as string;
  
  const { data: meeting, isLoading, error } = useGetMeetingQuery(meetingId);
  const [updateMeeting, { isLoading: isUpdating }] = useUpdateMeetingMutation();
  
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [isClient, setIsClient] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "individual",
      duration: 30,
    },
  });

  // Initialize the form with meeting data when it's loaded
  useEffect(() => {
    if (meeting) {
      form.reset({
        title: meeting.title,
        description: meeting.description || "",
        date: new Date(meeting.date),
        startTime: meeting.startTime,
        duration: meeting.duration,
        type: meeting.type,
        meetingLink: meeting.meetingLink || "",
        location: meeting.location || "",
      });
      
      if (meeting.participants) {
        // Ensure all participants have the proper type structure
        const typedParticipants = meeting.participants.map(p => ({
          studentId: p.studentId,
          studentName: p.studentName,
          studentEmail: p.studentEmail,
          status: p.status as "confirmed" | "pending" | "cancelled"
        }));
        setParticipants(typedParticipants);
      }
    }
  }, [meeting, form]);
  
  // Handle client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

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

      // Extract values and prepare payload with correct types
      const { date, ...otherValues } = values;
      
      await updateMeeting({
        meetingId,
        ...otherValues,
        date: date.toISOString(), // Convert Date to string
        participants,
      }).unwrap();
      
      toast.success("Meeting updated successfully");
      router.push(`/teacher/meetings/${meetingId}`);
    } catch (error) {
      console.error("Failed to update meeting:", error);
      toast.error("Failed to update meeting");
    }
  }

  if (isLoading) {
    return <div className="p-8 text-center">Loading meeting details...</div>;
  }

  if (error || !meeting) {
    return (
      <div className="p-8">
        <div className="text-red-500 bg-red-100 p-4 rounded-md">
          Error loading meeting details. Please try again later.
        </div>
        <Button
          className="mt-4"
          variant="outline"
          onClick={() => router.push("/teacher/meetings")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Meetings
        </Button>
      </div>
    );
  }

  // Only render the form on the client to prevent hydration errors
  if (!isClient) {
    return <div className="p-8 text-center">Loading form...</div>;
  }

  return (
    <div className="edit-meeting">
      <div className="flex items-center gap-5 mb-5">
        <button
          className="flex items-center border border-slate-700 rounded-lg p-2 gap-2 cursor-pointer hover:bg-slate-800 text-slate-300"
          onClick={() => router.push(`/teacher/meetings/${meetingId}`)}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Meeting</span>
        </button>
      </div>

      <Header 
        title="Edit Meeting" 
        subtitle="Update meeting details and participants" 
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

                <div className="flex flex-col">
                  <FormLabel className="text-slate-200 mb-2">Course</FormLabel>
                  <div className="bg-slate-900 border border-slate-700 rounded-md p-3 text-slate-300">
                    {meeting.courseName || "No course associated"}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Course cannot be changed after creation
                  </div>
                </div>
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
                          <div className="mt-1">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              participant.status === "confirmed" 
                                ? "bg-green-900/30 text-green-300" 
                                : participant.status === "cancelled" 
                                ? "bg-red-900/30 text-red-300"
                                : "bg-yellow-900/30 text-yellow-300"
                            }`}>
                              {participant.status === "confirmed" 
                                ? "Confirmed" 
                                : participant.status === "cancelled" 
                                ? "Declined"
                                : "Pending"}
                            </span>
                          </div>
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
                  onClick={() => router.push(`/teacher/meetings/${meetingId}`)}
                  className="border-slate-700 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isUpdating || participants.length === 0}
                >
                  {isUpdating ? "Updating..." : "Update Meeting"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
} 