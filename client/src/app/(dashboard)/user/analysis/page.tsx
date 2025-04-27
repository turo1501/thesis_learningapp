"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import {
  Award,
  BookOpen,
  Calendar,
  Clock,
  Target,
  TrendingUp,
  CheckCircle,
  BrainCircuit,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

// Sample data for demonstration
const timeSpentData = [
  { name: "Mon", hours: 2.5 },
  { name: "Tue", hours: 1.8 },
  { name: "Wed", hours: 3.2 },
  { name: "Thu", hours: 2.1 },
  { name: "Fri", hours: 1.5 },
  { name: "Sat", hours: 4.3 },
  { name: "Sun", hours: 3.7 },
];

const subjectProgressData = [
  { subject: "JavaScript", progress: 78 },
  { subject: "Python", progress: 65 },
  { subject: "React", progress: 82 },
  { subject: "CSS", progress: 90 },
  { subject: "Node.js", progress: 45 },
];

const completionRateData = [
  { name: "Completed", value: 68 },
  { name: "In Progress", value: 22 },
  { name: "Not Started", value: 10 },
];

const skillsData = [
  { subject: "Problem Solving", A: 80, fullMark: 100 },
  { subject: "Algorithms", A: 65, fullMark: 100 },
  { subject: "Data Structures", A: 70, fullMark: 100 },
  { subject: "Testing", A: 50, fullMark: 100 },
  { subject: "Code Quality", A: 75, fullMark: 100 },
  { subject: "Documentation", A: 60, fullMark: 100 },
];

const quizScoresData = [
  { name: "Quiz 1", score: 85 },
  { name: "Quiz 2", score: 92 },
  { name: "Quiz 3", score: 78 },
  { name: "Quiz 4", score: 88 },
  { name: "Quiz 5", score: 95 },
  { name: "Quiz 6", score: 82 },
];

const streakData = [
  { day: "M", isCompleted: true },
  { day: "T", isCompleted: true },
  { day: "W", isCompleted: true },
  { day: "T", isCompleted: false },
  { day: "F", isCompleted: true },
  { day: "S", isCompleted: true },
  { day: "S", isCompleted: true },
];

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe'];

const LearningAnalysis = () => {
  const currentStreak = 5; // Example streak value
  
  return (
    <div className="space-y-6">
      <Header 
        title="Learning Analysis" 
        subtitle="Track your learning progress and performance"
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-customgreys-secondarybg border-none shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-customgreys-dirtyGrey">
              Total Learning Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">19.1h</div>
              <div className="p-2 bg-indigo-500/20 rounded-full">
                <Clock className="h-5 w-5 text-indigo-500" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-green-500 text-sm">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>15% from last week</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-customgreys-secondarybg border-none shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-customgreys-dirtyGrey">
              Courses Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">8/12</div>
              <div className="p-2 bg-green-500/20 rounded-full">
                <BookOpen className="h-5 w-5 text-green-500" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <Progress value={66} className="h-2" />
            </div>
            <div className="text-gray-400 text-xs mt-2">
              4 courses remaining
            </div>
          </CardContent>
        </Card>

        <Card className="bg-customgreys-secondarybg border-none shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-customgreys-dirtyGrey">
              Current Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{currentStreak} days</div>
              <div className="p-2 bg-amber-500/20 rounded-full">
                <Target className="h-5 w-5 text-amber-500" />
              </div>
            </div>
            <div className="flex justify-between mt-4">
              {streakData.map((day, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className="text-xs text-gray-500 mb-1">{day.day}</div>
                  <div 
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      day.isCompleted 
                        ? 'bg-amber-500 text-black' 
                        : 'bg-gray-700 text-gray-500'
                    }`}
                  >
                    {day.isCompleted && <CheckCircle className="w-4 h-4" />}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-customgreys-secondarybg border-none shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-customgreys-dirtyGrey">
              Average Quiz Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">87%</div>
              <div className="p-2 bg-blue-500/20 rounded-full">
                <Award className="h-5 w-5 text-blue-500" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-green-500 text-sm">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>3% improvement</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="engagement" className="w-full">
        <TabsList className="bg-customgreys-secondarybg mb-6">
          <TabsTrigger 
            value="engagement" 
            className="data-[state=active]:bg-primary-700"
          >
            Engagement
          </TabsTrigger>
          <TabsTrigger 
            value="progress" 
            className="data-[state=active]:bg-primary-700"
          >
            Progress
          </TabsTrigger>
          <TabsTrigger 
            value="performance" 
            className="data-[state=active]:bg-primary-700"
          >
            Performance
          </TabsTrigger>
          <TabsTrigger 
            value="skills" 
            className="data-[state=active]:bg-primary-700"
          >
            Skills
          </TabsTrigger>
        </TabsList>

        {/* Engagement Tab */}
        <TabsContent value="engagement" className="space-y-6">
          <Card className="bg-customgreys-secondarybg border-none shadow-md">
            <CardHeader>
              <CardTitle>Weekly Learning Time</CardTitle>
              <CardDescription>
                Hours spent learning each day of the week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={timeSpentData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="name" stroke="#888" />
                    <YAxis stroke="#888" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#333', border: 'none' }}
                      formatter={(value) => [`${value} hours`, 'Time Spent']}
                    />
                    <Legend />
                    <Bar 
                      dataKey="hours" 
                      name="Hours Spent" 
                      fill="#8884d8" 
                      radius={[4, 4, 0, 0]} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-customgreys-secondarybg border-none shadow-md">
              <CardHeader>
                <CardTitle>Completion Rate</CardTitle>
                <CardDescription>
                  Overall course completion status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={completionRateData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {completionRateData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#333', border: 'none' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-customgreys-secondarybg border-none shadow-md">
              <CardHeader>
                <CardTitle>Subject Progress</CardTitle>
                <CardDescription>
                  Progress across different subjects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {subjectProgressData.map((subject, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">{subject.subject}</span>
                        <span className="text-sm text-gray-400">{subject.progress}%</span>
                      </div>
                      <Progress value={subject.progress} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <Card className="bg-customgreys-secondarybg border-none shadow-md">
            <CardHeader>
              <CardTitle>Quiz Performance</CardTitle>
              <CardDescription>
                Scores from recent quizzes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={quizScoresData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="name" stroke="#888" />
                    <YAxis domain={[0, 100]} stroke="#888" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#333', border: 'none' }}
                      formatter={(value) => [`${value}%`, 'Score']}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#82ca9d"
                      activeDot={{ r: 8 }}
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Skills Tab */}
        <TabsContent value="skills" className="space-y-6">
          <Card className="bg-customgreys-secondarybg border-none shadow-md">
            <CardHeader>
              <CardTitle>Skills Assessment</CardTitle>
              <CardDescription>
                Your competency across different skills
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillsData}>
                    <PolarGrid stroke="#555" />
                    <PolarAngleAxis dataKey="subject" stroke="#888" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#888" />
                    <Radar
                      name="Skills"
                      dataKey="A"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.6}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#333', border: 'none' }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recommendations Section */}
      <Card className="bg-customgreys-secondarybg border-none shadow-md">
        <CardHeader>
          <CardTitle>Personalized Recommendations</CardTitle>
          <CardDescription>
            Based on your learning patterns and progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-customgreys-primarybg rounded-lg">
              <div className="p-2 bg-blue-500/20 rounded-full">
                <BookOpen className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Continue "Advanced React Patterns"</h3>
                <p className="text-sm text-gray-400">You're 68% through this course. Just 2 more chapters to complete!</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-customgreys-primarybg rounded-lg">
              <div className="p-2 bg-amber-500/20 rounded-full">
                <Target className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Improve Testing Skills</h3>
                <p className="text-sm text-gray-400">Your testing skills are lower than other areas. Consider taking the "JavaScript Testing Fundamentals" course.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-customgreys-primarybg rounded-lg">
              <div className="p-2 bg-green-500/20 rounded-full">
                <BrainCircuit className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Review Memory Cards</h3>
                <p className="text-sm text-gray-400">You have 24 memory cards due for review. Reviewing them will help reinforce your learning.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LearningAnalysis; 