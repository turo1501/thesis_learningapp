"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useGetMeetingQuery, useUpdateMeetingMutation, useDeleteMeetingMutation } from "@/state/api";
import { format } from "date-fns";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Edit, 
  Trash, 
  User, 
  Users, 
  Video, 
  MessageSquare,
  MapPin, 
  Link2,
  Clipboard,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ErrorBoundary from "@/components/ErrorBoundary";
import ClientOnlyProvider from "@/components/ClientOnlyProvider";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function MeetingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const meetingId = params.meetingId as string;
  
  const { data: meeting, isLoading, error, refetch } = useGetMeetingQuery(meetingId);
  const [updateMeeting] = useUpdateMeetingMutation();
  const [deleteMeeting] = useDeleteMeetingMutation();

  // Helper to check if meeting is in the past
  const isPastMeeting = () => {
    if (!meeting) return false;
    const meetingDate = new Date(meeting.date);
    return meetingDate < new Date();
  };

  // Join meeting handler
  const handleJoinMeeting = () => {
    if (meeting?.meetingLink) {
      window.open(meeting.meetingLink, '_blank');
    } else {
      toast.error("No meeting link available");
    }
  };

  // Message students handler
  const handleMessageStudents = () => {
    toast.info("Messaging functionality not yet implemented");
  };

  // Cancel meeting handler
  const handleCancelMeeting = async () => {
    try {
      await updateMeeting({
        meetingId,
        status: "cancelled"
      }).unwrap();
      
      toast.success("Meeting cancelled successfully");
      refetch();
    } catch (error) {
      console.error("Failed to cancel meeting:", error);
      toast.error("Failed to cancel meeting");
    }
  };

  // Delete meeting handler
  const handleDeleteMeeting = async () => {
    try {
      await deleteMeeting(meetingId).unwrap();
      
      toast.success("Meeting deleted successfully");
      router.push("/teacher/meetings");
    } catch (error) {
      console.error("Failed to delete meeting:", error);
      toast.error("Failed to delete meeting");
    }
  };

  // Add notes handler
  const handleAddNotes = () => {
    router.push(`/teacher/meetings/${meetingId}/notes`);
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

  const isMeetingCancelled = meeting.status === "cancelled";
  const isMeetingCompleted = meeting.status === "completed" || (meeting.status === "scheduled" && isPastMeeting());

  return (
    <ErrorBoundary>
      <div className="meeting-detail">
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
          title="Meeting Details"
          subtitle={isMeetingCancelled ? "This meeting has been cancelled" : "View and manage meeting information"}
        />
        
        {isMeetingCancelled && (
          <div className="bg-red-900/30 border border-red-500/50 rounded-md p-3 mb-6 flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-200">This meeting has been cancelled.</span>
          </div>
        )}

        <Card className={cn(
          "mt-6 bg-slate-800 border-slate-700",
          isMeetingCancelled && "opacity-75"
        )}>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
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
                  <Badge
                    className={
                      meeting.status === "scheduled"
                        ? "bg-blue-600"
                        : meeting.status === "completed"
                        ? "bg-green-600"
                        : meeting.status === "pending"
                        ? "bg-yellow-600"
                        : "bg-red-600"
                    }
                  >
                    {meeting.status === "scheduled"
                      ? "Scheduled"
                      : meeting.status === "completed"
                      ? "Completed"
                      : meeting.status === "pending"
                      ? "Pending"
                      : "Cancelled"}
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

                <h2 className="text-2xl font-semibold text-white mb-4">
                  {meeting.title}
                </h2>

                <ClientOnlyProvider>
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
                </ClientOnlyProvider>

                {meeting.description && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-slate-400 mb-2">Description</h3>
                    <div className="bg-slate-900 rounded-md p-3 text-slate-300">
                      {meeting.description}
                    </div>
                  </div>
                )}

                {meeting.participants && meeting.participants.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-slate-400 mb-2">
                      Participants ({meeting.participants.length})
                    </h3>
                    <div className="space-y-2">
                      {meeting.participants.map((participant: {
                        studentId: string;
                        studentName: string;
                        studentEmail: string;
                        status: "confirmed" | "pending" | "cancelled";
                      }) => (
                        <div
                          key={participant.studentId}
                          className="flex items-center justify-between bg-slate-900 p-3 rounded-md"
                        >
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs text-white mr-3">
                              {participant.studentName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </div>
                            <div>
                              <div className="text-slate-200">{participant.studentName}</div>
                              <div className="text-xs text-slate-400">{participant.studentEmail}</div>
                            </div>
                          </div>
                          <Badge
                            className={
                              participant.status === "confirmed"
                                ? "bg-green-600/30 text-green-200 border-green-600"
                                : participant.status === "cancelled"
                                ? "bg-red-600/30 text-red-200 border-red-600"
                                : "bg-yellow-600/30 text-yellow-200 border-yellow-600"
                            }
                            variant="outline"
                          >
                            {participant.status === "confirmed"
                              ? "Confirmed"
                              : participant.status === "cancelled"
                              ? "Declined"
                              : "Pending"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {meeting.notes && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-slate-400 mb-2">Notes</h3>
                    <div className="bg-slate-900 rounded-md p-3 text-slate-300 whitespace-pre-wrap">
                      {meeting.notes}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3 md:w-60">
                {!isMeetingCancelled && !isMeetingCompleted && (
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
                    
                    <Button 
                      className="w-full"
                      variant="outline"
                      onClick={handleMessageStudents}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Message Participants
                    </Button>
                    
                    <Button 
                      className="w-full"
                      variant="outline"
                      onClick={() => router.push(`/teacher/meetings/${meetingId}/edit`)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Meeting
                    </Button>
                  </>
                )}
                
                {isMeetingCompleted && !meeting.notes && (
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={handleAddNotes}
                  >
                    <Clipboard className="h-4 w-4 mr-2" />
                    Add Notes
                  </Button>
                )}
                
                {isMeetingCompleted && meeting.notes && (
                  <Button 
                    className="w-full"
                    variant="outline"
                    onClick={handleAddNotes}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Notes
                  </Button>
                )}
                
                {!isMeetingCancelled && !isMeetingCompleted && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        className="w-full"
                        variant="outline"
                      >
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Cancel Meeting
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-slate-900 border-slate-700">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-slate-200">Cancel Meeting</AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-400">
                          Are you sure you want to cancel this meeting? All participants will be notified.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="border-slate-700 text-slate-200 hover:bg-slate-800">
                          No, Keep Meeting
                        </AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-600 hover:bg-red-700 text-white"
                          onClick={handleCancelMeeting}
                        >
                          Yes, Cancel Meeting
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      className="w-full border-red-800/30 bg-red-900/20 text-red-200 hover:bg-red-900/30"
                      variant="outline"
                    >
                      <Trash className="h-4 w-4 mr-2" />
                      Delete Meeting
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-slate-900 border-slate-700">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-slate-200">Delete Meeting</AlertDialogTitle>
                      <AlertDialogDescription className="text-slate-400">
                        Are you sure you want to delete this meeting? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="border-slate-700 text-slate-200 hover:bg-slate-800">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-600 hover:bg-red-700 text-white"
                        onClick={handleDeleteMeeting}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ErrorBoundary>
  );
}

