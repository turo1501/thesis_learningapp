"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import { useGetMeetingQuery, useRespondToMeetingMutation } from "@/state/api";
import { format } from "date-fns";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Video, 
  MessageSquare,
  MapPin, 
  Link2,
  User,
  CheckCircle,
  XCircle
} from "lucide-react";
import { toast } from "sonner";

import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Loading from "@/components/Loading";

export default function StudentMeetingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const meetingId = params.meetingId as string;
  
  const { data: meeting, isLoading, error } = useGetMeetingQuery(meetingId);
  const [respondToMeeting] = useRespondToMeetingMutation();

  // Join meeting handler
  const handleJoinMeeting = () => {
    if (meeting?.meetingLink) {
      window.open(meeting.meetingLink, '_blank');
    } else {
      toast.error("No meeting link available");
    }
  };

  // Copy meeting link to clipboard
  const handleCopyLink = () => {
    if (meeting?.meetingLink) {
      navigator.clipboard.writeText(meeting.meetingLink);
      toast.success("Meeting link copied to clipboard");
    } else {
      toast.error("No meeting link available");
    }
  };

  // Handler for accepting/declining meeting
  const handleRespond = async (response: "confirmed" | "cancelled") => {
    try {
      await respondToMeeting({ meetingId, response }).unwrap();
      toast.success(`Meeting ${response === "confirmed" ? "accepted" : "declined"}`);
    } catch (error) {
      console.error("Failed to respond to meeting:", error);
      toast.error("Failed to respond to meeting");
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error || !meeting) {
    return (
      <div className="p-8">
        <div className="text-red-500 bg-red-100 p-4 rounded-md">
          Error loading meeting details. The meeting may not exist or you don't have access to it.
        </div>
        <Button
          className="mt-4"
          variant="outline"
          onClick={() => router.push("/user/meetings")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Meetings
        </Button>
      </div>
    );
  }

  // Check if meeting is in the past
  const isMeetingPast = new Date(meeting.date) < new Date();
  
  // Get current participation status
  const isPending = meeting.status === "pending" || 
    meeting.participants.some(p => p.status === "pending");
  
  return (
    <div className="student-meeting-detail">
      <div className="flex items-center gap-5 mb-5">
        <button
          className="flex items-center border border-slate-700 rounded-lg p-2 gap-2 cursor-pointer hover:bg-slate-800 text-slate-300"
          onClick={() => router.push("/user/meetings")}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Meetings</span>
        </button>
      </div>

      <Header 
        title="Meeting Details" 
        subtitle="View and manage your meeting invitation" 
      />

      <Card className="mt-6 bg-slate-900 border-slate-700">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
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
                    <User className="h-3 w-3 mr-1" />
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
                <Badge
                  className={
                    meeting.status === "scheduled"
                      ? "bg-blue-600"
                      : meeting.status === "completed"
                      ? "bg-green-600"
                      : meeting.status === "cancelled"
                      ? "bg-red-600"
                      : "bg-yellow-600"
                  }
                >
                  {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
                </Badge>
              </div>

              <h2 className="text-2xl font-semibold text-white mb-4">
                {meeting.title}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center text-slate-300">
                  <Calendar className="h-4 w-4 mr-2 text-slate-400" />
                  <span>{format(new Date(meeting.date), "EEEE, MMMM dd, yyyy")}</span>
                </div>
                
                <div className="flex items-center text-slate-300">
                  <Clock className="h-4 w-4 mr-2 text-slate-400" />
                  <span>{meeting.startTime} ({meeting.duration} minutes)</span>
                </div>
                
                {meeting.location && (
                  <div className="flex items-center text-slate-300">
                    <MapPin className="h-4 w-4 mr-2 text-slate-400" />
                    <span>{meeting.location}</span>
                  </div>
                )}
                
                {meeting.meetingLink && (
                  <div className="flex items-center text-slate-300">
                    <Link2 className="h-4 w-4 mr-2 text-slate-400" />
                    <span className="truncate">{meeting.meetingLink}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-2 h-6 px-2 text-blue-400"
                      onClick={handleCopyLink}
                    >
                      Copy
                    </Button>
                  </div>
                )}
              </div>

              {meeting.description && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-slate-400 mb-2">Description</h3>
                  <div className="bg-slate-800 rounded-md p-3 text-slate-300">
                    {meeting.description}
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-sm font-medium text-slate-400 mb-2">Teacher</h3>
                <div className="bg-slate-800 rounded-md p-3 flex items-center">
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs text-white mr-3">
                    {meeting.teacherName[0]}
                  </div>
                  <div>
                    <div className="text-slate-200">{meeting.teacherName}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full lg:w-64 flex flex-col gap-3">
              {!isMeetingPast && meeting.status !== "cancelled" && (
                <>
                  {meeting.meetingLink && (
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={handleJoinMeeting}
                    >
                      <Video className="h-4 w-4 mr-2" />
                      Join Meeting
                    </Button>
                  )}
                  
                  {isPending && (
                    <div className="flex flex-col gap-2">
                      <Button 
                        className="w-full bg-green-600 hover:bg-green-700"
                        onClick={() => handleRespond("confirmed")}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Accept Meeting
                      </Button>
                      
                      <Button 
                        className="w-full bg-red-600 hover:bg-red-700"
                        onClick={() => handleRespond("cancelled")}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Decline Meeting
                      </Button>
                    </div>
                  )}
                </>
              )}
              
              <Button 
                className="w-full"
                variant="outline"
                onClick={() => router.push('/user/meetings')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to All Meetings
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 