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
  CheckCircle,
  Clock,
  BookOpen,
  Users,
  Filter,
  FileText,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";
import React, { useState } from "react";

type Assignment = {
  id: string;
  title: string;
  courseId: string;
  courseName: string;
  dueDate: string;
  status: "active" | "upcoming" | "past";
  description: string;
  totalStudents: number;
  submittedCount: number;
  gradedCount: number;
};

const TeacherAssignments = () => {
  const [selectedTab, setSelectedTab] = useState("active");

  // Mock data - would be fetched from API
  const assignments: Assignment[] = [
    {
      id: "1",
      title: "Midterm Project: AI Implementation",
      courseId: "course_123",
      courseName: "Introduction to AI",
      dueDate: "2023-05-15",
      status: "active",
      description:
        "Implement a simple machine learning algorithm to solve a real-world problem.",
      totalStudents: 32,
      submittedCount: 18,
      gradedCount: 12,
    },
    {
      id: "2",
      title: "Final Essay: Web Development Trends",
      courseId: "course_456",
      courseName: "Modern Web Development",
      dueDate: "2023-05-20",
      status: "active",
      description:
        "Write a 2000-word essay on current trends in web development.",
      totalStudents: 45,
      submittedCount: 10,
      gradedCount: 5,
    },
    {
      id: "3",
      title: "Research Project: Neural Networks",
      courseId: "course_123",
      courseName: "Introduction to AI",
      dueDate: "2023-06-10",
      status: "upcoming",
      description:
        "Research and present a paper on applications of neural networks.",
      totalStudents: 32,
      submittedCount: 0,
      gradedCount: 0,
    },
    {
      id: "4",
      title: "Team Exercise: Responsive UI Design",
      courseId: "course_456",
      courseName: "Modern Web Development",
      dueDate: "2023-06-15",
      status: "upcoming",
      description:
        "Create a responsive UI design for a mobile application as a team.",
      totalStudents: 45,
      submittedCount: 0,
      gradedCount: 0,
    },
    {
      id: "5",
      title: "Quiz: Python Basics",
      courseId: "course_789",
      courseName: "Python Programming",
      dueDate: "2023-04-10",
      status: "past",
      description: "A quiz covering Python fundamentals and syntax.",
      totalStudents: 28,
      submittedCount: 25,
      gradedCount: 25,
    },
  ];

  const filteredAssignments = assignments.filter(
    (assignment) => assignment.status === selectedTab
  );

  return (
    <div className="teacher-assignments">
      <Header
        title="Assignments"
        subtitle="Create and manage student assignments"
        rightElement={
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus size={16} className="mr-1" />
            Create Assignment
          </Button>
        }
      />

      <Tabs
        defaultValue="active"
        value={selectedTab}
        onValueChange={setSelectedTab}
        className="mt-6"
      >
        <div className="flex items-center justify-between mb-6">
          <TabsList className="bg-slate-800">
            <TabsTrigger
              value="active"
              className="data-[state=active]:bg-blue-600"
            >
              Active
            </TabsTrigger>
            <TabsTrigger
              value="upcoming"
              className="data-[state=active]:bg-blue-600"
            >
              Upcoming
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
              <select className="bg-transparent text-sm border-none focus:outline-none text-white">
                <option value="all">All Courses</option>
                <option value="course_123">Introduction to AI</option>
                <option value="course_456">Modern Web Development</option>
                <option value="course_789">Python Programming</option>
              </select>
            </div>
          </div>
        </div>

        <TabsContent value="active" className="mt-0">
          <div className="space-y-4">
            {renderAssignmentsList(filteredAssignments)}
          </div>
        </TabsContent>

        <TabsContent value="upcoming" className="mt-0">
          <div className="space-y-4">
            {renderAssignmentsList(filteredAssignments)}
          </div>
        </TabsContent>

        <TabsContent value="past" className="mt-0">
          <div className="space-y-4">
            {renderAssignmentsList(filteredAssignments)}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const renderAssignmentsList = (assignments: Assignment[]) => {
  if (assignments.length === 0) {
    return (
      <Card className="p-8 text-center text-slate-400">
        <p>No assignments found in this category.</p>
      </Card>
    );
  }

  return assignments.map((assignment) => (
    <Card
      key={assignment.id}
      className="p-6 bg-slate-900 border-slate-700 hover:border-blue-600/40 transition-colors cursor-pointer"
    >
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-blue-600 hover:bg-blue-700">
              <BookOpen className="h-3 w-3 mr-1" />
              {assignment.courseName}
            </Badge>
            <Badge
              variant="outline"
              className="bg-slate-800 text-slate-300 border-slate-700"
            >
              <Calendar className="h-3 w-3 mr-1" />
              Due: {format(new Date(assignment.dueDate), "MMM dd, yyyy")}
            </Badge>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            {assignment.title}
          </h3>
          <p className="text-slate-400 mb-4">{assignment.description}</p>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center text-slate-400">
              <Users className="h-4 w-4 mr-1 text-slate-500" />
              <span>{assignment.totalStudents} Students</span>
            </div>
            <div className="flex items-center text-green-500">
              <CheckCircle className="h-4 w-4 mr-1" />
              <span>
                {assignment.submittedCount} Submitted (
                {Math.round(
                  (assignment.submittedCount / assignment.totalStudents) * 100
                )}
                %)
              </span>
            </div>
            <div className="flex items-center text-orange-500">
              <FileText className="h-4 w-4 mr-1" />
              <span>
                {assignment.gradedCount} Graded (
                {Math.round(
                  (assignment.gradedCount / assignment.submittedCount) * 100 || 0
                )}
                %)
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-row md:flex-col gap-2 self-end md:self-center">
          <Button
            variant="outline"
            className="bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700"
          >
            View Details
          </Button>
          {assignment.status === "active" && (
            <Button className="bg-orange-600 hover:bg-orange-700 text-white">
              Grade Submissions
            </Button>
          )}
          {assignment.status === "upcoming" && (
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              Edit Assignment
            </Button>
          )}
        </div>
      </div>
    </Card>
  ));
};

export default TeacherAssignments;
