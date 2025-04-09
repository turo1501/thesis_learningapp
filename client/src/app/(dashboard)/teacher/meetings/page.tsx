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
  Plus,
  Clock,
  Calendar,
  Users,
  Filter,
  Video,
  CheckCircle,
  XCircle,
  CalendarDays,
  UserCheck,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import React, { useState, useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import { 
  useGetTeacherMeetingsQuery, 
  useGetCoursesQuery 
} from "@/state/api";
import Loading from "@/components/Loading";

const TeacherMeetings = () => {
  const [selectedTab, setSelectedTab] = useState("upcoming");
  const [courseFilter, setCourseFilter] = useState("all");
  const router = useRouter();
  const { user, isLoaded } = useUser();
  
  const { 
    data: meetings = [], 
    isLoading: isLoadingMeetings 
  } = useGetTeacherMeetingsQuery(
    user?.id || "",
    { skip: !isLoaded || !user }
  );
  
  const { 
    data: courses = [], 
    isLoading: isLoadingCourses 
  } = useGetCoursesQuery(
    { category: "" }, 
    { skip: !isLoaded || !user }
  );
  
  // Filter to only show teacher's courses
  const teacherCourses = useMemo(() => {
    return courses.filter(course => course.teacherId === user?.id);
  }, [courses, user?.id]);

  // Categorize meetings based on date
  const categorizedMeetings = useMemo(() => {
    const now = new Date();
    
    return meetings
      .filter(meeting => courseFilter === "all" || meeting.courseId === courseFilter)
      .map(meeting => {
        const meetingDateTime = new Date(`${meeting.date}T${meeting.startTime}`);
        let category = "upcoming";
        
        if (meeting.status === "completed") {
          category = "past";
        } else if (meetingDateTime < now) {
          category = "past";
        } else if (
          meetingDateTime.getTime() - now.getTime() < 24 * 60 * 60 * 1000 // Within 24 hours
        ) {
          category = "active";
        }
        
        return {
          ...meeting,
          category
        };
      });
  }, [meetings, courseFilter]);
  
  const filteredMeetings = useMemo(() => {
    return categorizedMeetings.filter(
      meeting => meeting.category === selectedTab
    );
  }, [categorizedMeetings, selectedTab]);

  const handleCreateMeeting = () => {
    router.push("/teacher/meetings/create");
  };

  const handleEditMeeting = (meetingId: string) => {
    router.push(`/teacher/meetings/${meetingId}`);
  };

  if (!isLoaded || isLoadingMeetings) return <Loading />;

  return (
    <div className="teacher-meetings">
      <Header
        title="Meetings"
        subtitle="Schedule and manage virtual meetings with students"
        rightElement={
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleCreateMeeting}
          >
            <Plus size={16} className="mr-1" />
            Create Meeting
          </Button>
        }
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
            </TabsTrigger>
            <TabsTrigger
              value="active"
              className="data-[state=active]:bg-blue-600"
            >
              Active
            </TabsTrigger>
            <TabsTrigger
              value="past"
              className="data-[state=active]:bg-blue-600"
            >
              Past
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-3">
            <div className="bg-slate-800 p-2 rounded-md flex items-center gap-2">
              <Filter size={14} className="text-slate-400" />
              <select 
                className="bg-transparent text-sm border-none focus:outline-none text-white"
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
              >
                <option value="all">All Courses</option>
                {teacherCourses.map(course => (
                  <option key={course.courseId} value={course.courseId}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <TabsContent value="upcoming" className="mt-0">
          <div className="space-y-4">
            {renderMeetingsList(filteredMeetings, handleEditMeeting)}
          </div>
        </TabsContent>

        <TabsContent value="active" className="mt-0">
          <div className="space-y-4">
            {renderMeetingsList(filteredMeetings, handleEditMeeting)}
          </div>
        </TabsContent>

        <TabsContent value="past" className="mt-0">
          <div className="space-y-4">
            {renderMeetingsList(filteredMeetings, handleEditMeeting)}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const renderMeetingsList = (
  meetings: any[], 
  onEditMeeting: (id: string) => void
) => {
  if (meetings.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-slate-400">No meetings found in this category</p>
      </div>
    );
  }

  return meetings.map((meeting) => {
    const confirmedParticipants = meeting.participants?.filter(
      (p: any) => p.status === "confirmed"
    ).length || 0;
    
    const totalParticipants = meeting.participants?.length || 0;
    const pendingParticipants = meeting.participants?.filter(
      (p: any) => p.status === "pending"
    ).length || 0;
    const declinedParticipants = meeting.participants?.filter(
      (p: any) => p.status === "cancelled"
    ).length || 0;
    
    const meetingDate = new Date(`${meeting.date}T${meeting.startTime}`);
    
    // Make sure we have a valid date before calculating endTime
    let endTimeDisplay;
    if (!isNaN(meetingDate.getTime())) {
      const endTime = new Date(meetingDate.getTime() + meeting.duration * 60000);
      endTimeDisplay = format(endTime, "h:mm a");
    } else {
      endTimeDisplay = "Invalid time";
    }
    
    return (
      <Card
        key={meeting.meetingId}
        className="p-6 bg-slate-800 border-slate-700 hover:border-slate-600 transition-all"
      >
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Video size={18} className="text-blue-500" />
              <h3 className="font-semibold text-lg">{meeting.title}</h3>
              {meeting.category === "active" && (
                <Badge className="bg-green-600 hover:bg-green-700">Active</Badge>
              )}
            </div>
            <p className="text-slate-400 text-sm">{meeting.description}</p>
            <div className="mt-4 flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Calendar size={14} className="text-slate-400" />
                <span>
                  {format(new Date(meeting.date), "MMM d, yyyy")}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock size={14} className="text-slate-400" />
                <span>
                  {meeting.startTime} - {endTimeDisplay}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users size={14} className="text-slate-400" />
                <span>
                  {confirmedParticipants} / {totalParticipants} attending
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 min-w-[140px]">
            {(meeting.category === "upcoming" || meeting.category === "active") && (
              <>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-sm"
                  onClick={() => onEditMeeting(meeting.meetingId)}
                >
                  Edit Meeting
                </Button>
                {meeting.meetingLink && (
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-sm"
                    asChild
                  >
                    <a href={meeting.meetingLink} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Join Meeting
                    </a>
                  </Button>
                )}
              </>
            )}
            {meeting.category === "past" && meeting.recordingLink && (
              <Button 
                size="sm" 
                variant="outline" 
                className="text-sm"
                asChild
              >
                <a href={meeting.recordingLink} target="_blank" rel="noopener noreferrer">
                  View Recording
                </a>
              </Button>
            )}
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-700">
          <div className="flex gap-4 flex-wrap">
            <div className="flex items-center gap-1 text-xs">
              <UserCheck size={14} className="text-green-500" />
              <span>{confirmedParticipants} accepted</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <XCircle size={14} className="text-red-500" />
              <span>{declinedParticipants} declined</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <Clock size={14} className="text-yellow-500" />
              <span>{pendingParticipants} pending</span>
            </div>
          </div>
        </div>
      </Card>
    );
  });
};

export default TeacherMeetings;
