"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useGetMeetingQuery, useAddMeetingNotesMutation } from "@/state/api";
import { format } from "date-fns";
import { ArrowLeft, Calendar, Clock, Save, User, Users } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  notes: z.string().min(1, { message: "Notes cannot be empty" }),
});

export default function MeetingNotesPage() {
  const router = useRouter();
  const params = useParams();
  const meetingId = params.meetingId as string;
  const [isClient, setIsClient] = useState(false);
  
  const { data: meeting, isLoading, error } = useGetMeetingQuery(meetingId);
  const [addMeetingNotes, { isLoading: isSubmitting }] = useAddMeetingNotesMutation();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      notes: "",
    },
  });

  // Ensure client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (meeting && meeting.notes) {
      form.setValue("notes", meeting.notes);
    }
  }, [meeting, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await addMeetingNotes({
        meetingId: meetingId,
        notes: values.notes,
      }).unwrap();
      
      toast.success("Meeting notes added successfully");
      router.push("/teacher/meetings");
    } catch (error) {
      console.error("Failed to add notes:", error);
      toast.error("Failed to add meeting notes");
    }
  };

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
  
  // Only render form on client to prevent hydration errors
  if (!isClient) {
    return <div className="p-8 text-center">Loading form...</div>;
  }

  return (
    <div className="meeting-notes">
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
        title="Meeting Notes"
        subtitle="Add or edit notes for this meeting"
      />

      <Card className="mt-6 bg-slate-800 border-slate-700">
        <CardContent className="pt-6">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Badge
                className={
                  meeting.type === "individual"
                    ? "bg-purple-600"
                    : "bg-green-600"
                }
              >
                {meeting.type === "individual" ? (
                  <User className="h-3 w-3 mr-1" />
                ) : (
                  <Users className="h-3 w-3 mr-1" />
                )}
                {meeting.type === "individual" ? "Individual" : "Group"}
              </Badge>
              {meeting.courseName && (
                <Badge
                  variant="outline"
                  className="bg-slate-800 text-slate-300 border-slate-700"
                >
                  {meeting.courseName}
                </Badge>
              )}
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {meeting.title}
            </h3>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm mb-4">
              <div className="flex items-center text-slate-300">
                <Calendar className="h-4 w-4 mr-1 text-slate-500" />
                <span>
                  {format(new Date(meeting.date), "EEEE, MMMM dd, yyyy")}
                </span>
              </div>
              <div className="flex items-center text-slate-300">
                <Clock className="h-4 w-4 mr-1 text-slate-500" />
                <span>
                  {meeting.startTime} ({meeting.duration} minutes)
                </span>
              </div>
            </div>

            {meeting.description && (
              <div className="mb-4 p-3 bg-slate-900 rounded-md">
                <h4 className="text-sm font-medium text-slate-400 mb-1">Description</h4>
                <p className="text-slate-300">{meeting.description}</p>
              </div>
            )}

            {meeting.participants && meeting.participants.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-slate-400 mb-2">Participants</h4>
                <div className="flex flex-wrap items-center gap-2">
                  {meeting.participants.map((participant: {
                    studentId: string;
                    studentName: string;
                    studentEmail: string;
                    status: string;
                  }) => (
                    <div
                      key={participant.studentId}
                      className="flex items-center bg-slate-900 px-2 py-1 rounded-md text-sm"
                    >
                      <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs text-white mr-2">
                        {participant.studentName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <span className="text-slate-300">{participant.studentName}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-200">Meeting Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add detailed notes about what was discussed in the meeting..."
                        className="bg-slate-900 border-slate-700 text-slate-200 min-h-[200px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSubmitting ? "Saving..." : "Save Notes"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
} 
