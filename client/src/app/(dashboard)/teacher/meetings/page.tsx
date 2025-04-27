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
} from "lucide-react";
import { format } from "date-fns";
import React, { useState } from "react";

type Meeting = {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: number;
  type: "individual" | "group";
  status: "upcoming" | "past" | "pending";
  students: {
    id: string;
    name: string;
    avatar?: string;
  }[];
  course?: {
    id: string;
    name: string;
  };
  meetingLink?: string;
  notes?: string;
};

const TeacherMeetings = () => {
  const [selectedTab, setSelectedTab] = useState("upcoming");

  // Mock data - would be fetched from API
  const meetings: Meeting[] = [
    {
      id: "1",
      title: "Project Guidance Session",
      date: "2023-05-10",
      time: "14:00",
      duration: 30,
      type: "individual",
      status: "upcoming",
      students: [
        {
          id: "student_1",
          name: "Alex Johnson",
          avatar: "/avatars/student1.png",
        },
      ],
      course: {
        id: "course_123",
        name: "Introduction to AI",
      },
      meetingLink: "https://meet.example.com/abc123",
    },
    {
      id: "2",
      title: "Final Project Discussion",
      date: "2023-05-12",
      time: "15:30",
      duration: 45,
      type: "group",
      status: "upcoming",
      students: [
        {
          id: "student_2",
          name: "Michael Smith",
          avatar: "/avatars/student2.png",
        },
        {
          id: "student_3",
          name: "Emily Davis",
          avatar: "/avatars/student3.png",
        },
        {
          id: "student_4",
          name: "Robert Wilson",
          avatar: "/avatars/student4.png",
        },
      ],
      course: {
        id: "course_456",
        name: "Modern Web Development",
      },
      meetingLink: "https://meet.example.com/def456",
    },
    {
      id: "3",
      title: "Midterm Review Session",
      date: "2023-04-25",
      time: "13:00",
      duration: 60,
      type: "group",
      status: "past",
      students: [
        {
          id: "student_5",
          name: "Sarah Thompson",
          avatar: "/avatars/student5.png",
        },
        {
          id: "student_6",
          name: "James Brown",
          avatar: "/avatars/student6.png",
        },
        {
          id: "student_7",
          name: "Jessica Martin",
          avatar: "/avatars/student7.png",
        },
      ],
      course: {
        id: "course_123",
        name: "Introduction to AI",
      },
      notes:
        "Covered key concepts for midterm, students requested more practice problems.",
    },
    {
      id: "4",
      title: "Office Hours: Assignment Help",
      date: "2023-04-28",
      time: "16:00",
      duration: 30,
      type: "individual",
      status: "past",
      students: [
        {
          id: "student_8",
          name: "David Lee",
          avatar: "/avatars/student8.png",
        },
      ],
      course: {
        id: "course_789",
        name: "Python Programming",
      },
      notes:
        "Helped with debugging recursive functions and performance optimization.",
    },
    {
      id: "5",
      title: "Course Advising Session",
      date: "2023-05-08",
      time: "10:00",
      duration: 20,
      type: "individual",
      status: "pending",
      students: [
        {
          id: "student_9",
          name: "Emma Wilson",
          avatar: "/avatars/student9.png",
        },
      ],
    },
    {
      id: "6",
      title: "Group Project Progress Review",
      date: "2023-05-15",
      time: "11:30",
      duration: 45,
      type: "group",
      status: "pending",
      students: [
        {
          id: "student_10",
          name: "Ryan Garcia",
          avatar: "/avatars/student10.png",
        },
        {
          id: "student_11",
          name: "Olivia Moore",
          avatar: "/avatars/student11.png",
        },
        {
          id: "student_12",
          name: "Daniel Kim",
          avatar: "/avatars/student12.png",
        },
      ],
      course: {
        id: "course_456",
        name: "Modern Web Development",
      },
    },
  ];

  const filteredMeetings = meetings.filter(
    (meeting) => meeting.status === selectedTab
  );

  return (
    <div className="teacher-meetings">
      <Header
        title="Meetings"
        subtitle="Schedule and manage meetings with students"
        rightElement={
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus size={16} className="mr-1" />
            Schedule Meeting
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
              value="pending"
              className="data-[state=active]:bg-blue-600"
            >
              Pending
            </TabsTrigger>
            <TabsTrigger
              value="past"
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

        <TabsContent value="upcoming" className="mt-0">
          <div className="space-y-4">
            {renderMeetingsList(filteredMeetings, "upcoming")}
          </div>
        </TabsContent>

        <TabsContent value="pending" className="mt-0">
          <div className="space-y-4">
            {renderMeetingsList(filteredMeetings, "pending")}
          </div>
        </TabsContent>

        <TabsContent value="past" className="mt-0">
          <div className="space-y-4">
            {renderMeetingsList(filteredMeetings, "past")}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const renderMeetingsList = (meetings: Meeting[], status: string) => {
  if (meetings.length === 0) {
    return (
      <Card className="p-8 text-center text-slate-400">
        <p>No meetings found in this category.</p>
      </Card>
    );
  }

  return meetings.map((meeting) => (
    <Card
      key={meeting.id}
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
            {meeting.course && (
              <Badge
                variant="outline"
                className="bg-slate-800 text-slate-300 border-slate-700"
              >
                {meeting.course.name}
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
                {meeting.time} ({meeting.duration} minutes)
              </span>
            </div>
          </div>

          <div className="mb-4">
            <h4 className="text-sm font-medium text-slate-400 mb-2">Students</h4>
            <div className="flex flex-wrap items-center gap-2">
              {meeting.students.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center bg-slate-800 px-2 py-1 rounded-md text-sm"
                >
                  <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs text-white mr-2">
                    {student.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <span className="text-slate-300">{student.name}</span>
                </div>
              ))}
            </div>
          </div>

          {meeting.notes && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-slate-400 mb-1">Notes</h4>
              <p className="text-slate-300 text-sm">{meeting.notes}</p>
            </div>
          )}
        </div>
        <div className="flex flex-row md:flex-col gap-2 self-end md:self-center">
          {status === "upcoming" && (
            <>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Video className="h-4 w-4 mr-1" />
                Join Meeting
              </Button>
              <Button
                variant="outline"
                className="bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700"
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                Message Students
              </Button>
            </>
          )}

          {status === "pending" && (
            <>
              <Button className="bg-green-600 hover:bg-green-700">
                <Check className="h-4 w-4 mr-1" />
                Accept
              </Button>
              <Button className="bg-red-600 hover:bg-red-700">
                <X className="h-4 w-4 mr-1" />
                Decline
              </Button>
            </>
          )}

          {status === "past" && (
            <Button
              variant="outline"
              className="bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700"
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
