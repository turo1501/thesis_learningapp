"use client";

import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Calendar,
  Clock,
  Plus,
  Video,
  User,
  Users,
  MessageSquare,
  Clipboard,
  X,
  Check,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import React, { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useGetTeacherMeetingsQuery, useUpdateMeetingMutation, useDeleteMeetingMutation } from "@/state/api";
import { toast } from "sonner";

// Define necessary types directly to avoid import errors
type MeetingParticipant = {
  studentId: string;
  studentName: string;
  studentEmail: string;
  status: "confirmed" | "pending" | "cancelled";
};

type Meeting = {
  meetingId: string;
  teacherId: string;
  teacherName: string;
  title: string;
  description?: string;
  courseId?: string;
  courseName?: string;
  date: string;
  startTime: string;
  duration: number;
  type: "individual" | "group";
  status: "scheduled" | "completed" | "cancelled" | "pending";
  meetingLink?: string;
  location?: string;
  notes?: string;
  participants: MeetingParticipant[];
  recordings?: string[];
  createdAt?: string;
  updatedAt?: string;
};

// Define the API response type
interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

const TeacherMeetings = () => {
  const [selectedTab, setSelectedTab] = useState("scheduled");
  const router = useRouter();
  const { user } = useUser();
  const { data: meetingsData, isLoading, isError, refetch } = useGetTeacherMeetingsQuery(
    user?.id || "",
    { skip: !user?.id }
  );
  const [updateMeeting] = useUpdateMeetingMutation();
  const [deleteMeeting] = useDeleteMeetingMutation();

  // Process meetings data
  const meetings = useMemo(() => {
    if (!meetingsData) return [] as Meeting[];
    
    // Handle both array responses and object responses with data property
    if (Array.isArray(meetingsData)) {
      return meetingsData as Meeting[];
    } else if (typeof meetingsData === 'object' && meetingsData !== null) {
      // For object responses that might have a data property
      const data = (meetingsData as unknown as ApiResponse<Meeting[]>).data;
      return Array.isArray(data) ? data : [] as Meeting[];
    }
    
    return [] as Meeting[];
  }, [meetingsData]);

  // Group meetings by status
  const groupedMeetings = useMemo(() => {
    const upcoming = meetings.filter(meeting => 
      meeting.status === "scheduled" && new Date(meeting.date) >= new Date()
    );
    
    const pending = meetings.filter(meeting => 
      meeting.status === "pending"
    );
    
    const past = meetings.filter(meeting => 
      meeting.status === "completed" || 
      (meeting.status === "scheduled" && new Date(meeting.date) < new Date())
    );
    
    return {
      scheduled: upcoming,
      pending,
      completed: past,
    };
  }, [meetings]);

  // Handler for joining meeting
  const handleJoinMeeting = useCallback((meetingLink: string) => {
    if (meetingLink) {
      window.open(meetingLink, '_blank');
    } else {
      toast.error("No meeting link available");
    }
  }, []);

  // Handler for accepting/declining meetings
  const handleMeetingResponse = useCallback(async (meetingId: string, status: "scheduled" | "cancelled") => {
    try {
      await updateMeeting({
        meetingId,
        status
      }).unwrap();
      
      toast.success(`Meeting ${status === "scheduled" ? "accepted" : "declined"}`);
      refetch();
    } catch (error) {
      console.error("Failed to update meeting:", error);
      toast.error("Failed to update meeting status");
    }
  }, [updateMeeting, refetch]);

  // Handler for sending messages to students
  const handleMessageStudents = useCallback((meetingId: string) => {
    // This would typically open a messaging interface or send email
    toast.info("Messaging functionality not yet implemented");
  }, []);

  // Handler for adding notes to a meeting
  const handleAddNotes = useCallback((meetingId: string) => {
    router.push(`/teacher/meetings/${meetingId}/notes`);
  }, [router]);

  if (isError) {
    return (
      <div className="p-8">
        <div className="text-red-500 bg-red-100 p-4 rounded-md">
          Error loading meetings. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="teacher-meetings">
      <Header
        title="Meetings"
        subtitle="Schedule and manage meetings with students"
        rightElement={
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => router.push("/teacher/meetings/create")}
          >
            <Plus size={16} className="mr-1" />
            Schedule Meeting
          </Button>
        }
      />

      <Tabs
        defaultValue="scheduled"
        value={selectedTab}
        onValueChange={setSelectedTab}
        className="mt-6"
      >
        <div className="flex items-center justify-between mb-6">
          <TabsList className="bg-slate-800">
            <TabsTrigger
              value="scheduled"
              className="data-[state=active]:bg-blue-600"
            >
              Upcoming
            </TabsTrigger>
            <TabsTrigger
              value="pending"
              className="data-[state=active]:bg-blue-600"
            >
              Pending
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className="data-[state=active]:bg-blue-600"
            >
              Past
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
            >
              <Calendar className="h-4 w-4 mr-1" />
              View Calendar
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center p-12">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            <span className="ml-3 text-slate-500">Loading meetings...</span>
          </div>
        ) : (
          <>
            <TabsContent value="scheduled" className="mt-0">
          <div className="space-y-4">
                {renderMeetingsList(
                  groupedMeetings.scheduled,
                  "scheduled",
                  handleJoinMeeting,
                  handleMessageStudents
                )}
          </div>
        </TabsContent>

        <TabsContent value="pending" className="mt-0">
          <div className="space-y-4">
                {renderMeetingsList(
                  groupedMeetings.pending,
                  "pending",
                  handleJoinMeeting,
                  handleMessageStudents,
                  handleMeetingResponse
                )}
          </div>
        </TabsContent>

            <TabsContent value="completed" className="mt-0">
          <div className="space-y-4">
                {renderMeetingsList(
                  groupedMeetings.completed,
                  "completed",
                  handleJoinMeeting,
                  handleMessageStudents,
                  undefined,
                  handleAddNotes
                )}
          </div>
        </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
};

const renderMeetingsList = (
  meetings: Meeting[],
  status: string,
  handleJoinMeeting: (meetingLink: string) => void,
  handleMessageStudents: (meetingId: string) => void,
  handleMeetingResponse?: (meetingId: string, status: "scheduled" | "cancelled") => void,
  handleAddNotes?: (meetingId: string) => void
) => {
  if (meetings.length === 0) {
    return (
      <Card className="p-8 text-center text-slate-400">
        <p>No meetings found in this category.</p>
      </Card>
    );
  }

  return meetings.map((meeting) => (
    <Card
      key={meeting.meetingId}
      className="p-6 bg-slate-900 border-slate-700 hover:border-blue-600/40 transition-colors"
    >
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge
              className={
                meeting.type === "individual"
                  ? "bg-purple-600 hover:bg-purple-700"
                  : "bg-green-600 hover:bg-green-700"
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

          {meeting.participants && meeting.participants.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-slate-400 mb-2">Students</h4>
            <div className="flex flex-wrap items-center gap-2">
                {meeting.participants.map((participant) => (
                <div
                    key={participant.studentId}
                  className="flex items-center bg-slate-800 px-2 py-1 rounded-md text-sm"
                >
                  <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs text-white mr-2">
                      {participant.studentName
                      .split(" ")
                        .map((n: string) => n[0])
                      .join("")}
                  </div>
                    <span className="text-slate-300">{participant.studentName}</span>
                </div>
              ))}
            </div>
          </div>
          )}

          {meeting.notes && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-slate-400 mb-1">Notes</h4>
              <p className="text-slate-300 text-sm">{meeting.notes}</p>
            </div>
          )}
        </div>
        <div className="flex flex-row md:flex-col gap-2 self-end md:self-center">
          {status === "scheduled" && (
            <>
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => handleJoinMeeting(meeting.meetingLink || "")}
                disabled={!meeting.meetingLink}
              >
                <Video className="h-4 w-4 mr-1" />
                Join Meeting
              </Button>
              <Button
                variant="outline"
                className="bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700"
                onClick={() => handleMessageStudents(meeting.meetingId)}
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                Message Students
              </Button>
            </>
          )}

          {status === "pending" && (
            <>
              <Button 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => handleMeetingResponse && handleMeetingResponse(meeting.meetingId, "scheduled")}
              >
                <Check className="h-4 w-4 mr-1" />
                Accept
              </Button>
              <Button 
                className="bg-red-600 hover:bg-red-700"
                onClick={() => handleMeetingResponse && handleMeetingResponse(meeting.meetingId, "cancelled")}
              >
                <X className="h-4 w-4 mr-1" />
                Decline
              </Button>
            </>
          )}

          {status === "completed" && (
            <Button
              variant="outline"
              className="bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700"
              onClick={() => handleAddNotes && handleAddNotes(meeting.meetingId)}
            >
              <Clipboard className="h-4 w-4 mr-1" />
              Add Notes
            </Button>
          )}
        </div>
      </div>
    </Card>
  ));
};

export default TeacherMeetings;
