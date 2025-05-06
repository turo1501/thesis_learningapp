"use client";

import Header from "@/components/Header";
import Loading from "@/components/Loading";
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
  Video,
  User,
  Users,
  MessageSquare,
  Check,
  X,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { format as dateFormat } from "date-fns";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useGetStudentMeetingsQuery, useRespondToMeetingMutation } from "@/state/api";
import { toast } from "sonner";

const StudentMeetings = () => {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState("upcoming");
  const { user, isLoaded } = useUser();
  const { data: meetings, isLoading, refetch } = useGetStudentMeetingsQuery(
    user?.id || "", 
    { skip: !isLoaded || !user }
  );
  const [respondToMeeting] = useRespondToMeetingMutation();

  if (!isLoaded || isLoading) return <Loading />;
  if (!meetings) return <div>No meetings found.</div>;

  // Filter meetings based on status and the current tab
  const pendingMeetings = meetings.filter((meeting) => 
    meeting.status === "pending" || 
    meeting.participants.find(p => p.studentId === user?.id)?.status === "pending"
  );
  
  const upcomingMeetings = meetings.filter((meeting) => 
    meeting.status === "scheduled" && 
    new Date(meeting.date + "T" + meeting.startTime) > new Date() &&
    meeting.participants.find(p => p.studentId === user?.id)?.status === "confirmed"
  );
  
  const pastMeetings = meetings.filter((meeting) => 
    (meeting.status === "completed" || 
    (meeting.status === "scheduled" && new Date(meeting.date + "T" + meeting.startTime) < new Date())) &&
    meeting.participants.find(p => p.studentId === user?.id)?.status === "confirmed"
  );

  const handleRespond = async (meetingId: string, response: "confirmed" | "cancelled") => {
    try {
      await respondToMeeting({ meetingId, response }).unwrap();
      toast.success(`Meeting ${response === "confirmed" ? "accepted" : "declined"}`);
      refetch();
    } catch (error) {
      toast.error("Failed to respond to meeting");
      console.error(error);
    }
  };

  // Handler to view meeting details
  const handleViewMeeting = (meetingId: string) => {
    router.push(`/user/meetings/${meetingId}`);
  };

  // Filter meetings based on the selected tab
  const filteredMeetings = 
    selectedTab === "pending" 
      ? pendingMeetings 
      : selectedTab === "upcoming" 
        ? upcomingMeetings 
        : pastMeetings;

  return (
    <div className="student-meetings">
      <Header
        title="Meetings"
        subtitle="View and manage meeting invitations from teachers"
      />

      <Tabs
        defaultValue="upcoming"
        value={selectedTab}
        onValueChange={setSelectedTab}
        className="mt-6"
      >
        <div className="flex items-center justify-between mb-6">
          <TabsList className="bg-slate-800">
            <TabsTrigger
              value="upcoming"
              className="data-[state=active]:bg-blue-600"
            >
              Upcoming
              {upcomingMeetings.length > 0 && (
                <span className="ml-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {upcomingMeetings.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="pending"
              className="data-[state=active]:bg-blue-600"
            >
              Pending
              {pendingMeetings.length > 0 && (
                <span className="ml-2 bg-yellow-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {pendingMeetings.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="past"
              className="data-[state=active]:bg-blue-600"
            >
              Past
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="upcoming" className="mt-0">
          <div className="space-y-4">
            {renderMeetingsList(filteredMeetings, "upcoming", handleRespond, handleViewMeeting)}
          </div>
        </TabsContent>

        <TabsContent value="pending" className="mt-0">
          <div className="space-y-4">
            {renderMeetingsList(filteredMeetings, "pending", handleRespond, handleViewMeeting)}
          </div>
        </TabsContent>

        <TabsContent value="past" className="mt-0">
          <div className="space-y-4">
            {renderMeetingsList(filteredMeetings, "past", handleRespond, handleViewMeeting)}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const renderMeetingsList = (
  meetings: Meeting[], 
  status: string,
  handleRespond: (meetingId: string, response: "confirmed" | "cancelled") => void,
  handleViewMeeting: (meetingId: string) => void
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
          <h3 className="text-xl font-semibold text-white mb-2 hover:text-primary-400 cursor-pointer" onClick={() => handleViewMeeting(meeting.meetingId)}>
            {meeting.title}
          </h3>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm mb-4">
            <div className="flex items-center text-slate-300">
              <Calendar className="h-4 w-4 mr-1 text-slate-500" />
              <span>
                {dateFormat(new Date(meeting.date), "EEEE, MMMM dd, yyyy")}
              </span>
            </div>
            <div className="flex items-center text-slate-300">
              <Clock className="h-4 w-4 mr-1 text-slate-500" />
              <span>
                {meeting.startTime} ({meeting.duration} minutes)
              </span>
            </div>
          </div>

          <div className="mb-4">
            <h4 className="text-sm font-medium text-slate-400 mb-2">Teacher</h4>
            <div className="flex items-center text-slate-300">
              <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs text-white mr-2">
                {meeting.teacherName[0]}
              </div>
              <span>{meeting.teacherName}</span>
            </div>
          </div>

          {meeting.description && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-slate-400 mb-1">Description</h4>
              <p className="text-slate-300 text-sm">{meeting.description}</p>
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
          {status === "upcoming" && meeting.meetingLink && (
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Video className="h-4 w-4 mr-1" />
              <a 
                href={meeting.meetingLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center"
              >
                Join Meeting
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </Button>
          )}

          {status === "pending" && (
            <>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => handleRespond(meeting.meetingId, "confirmed")}
              >
                <Check className="h-4 w-4 mr-1" />
                Accept
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700"
                onClick={() => handleRespond(meeting.meetingId, "cancelled")}
              >
                <X className="h-4 w-4 mr-1" />
                Decline
              </Button>
            </>
          )}

          <Button
            variant="outline"
            className="border-slate-700 hover:bg-slate-800"
            onClick={() => handleViewMeeting(meeting.meetingId)}
          >
            View Details
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </Card>
  ));
};

export default StudentMeetings; 