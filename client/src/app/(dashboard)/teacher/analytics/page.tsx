"use client";

import React, { useState } from "react";
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
  AreaChart,
  Area,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import {
  Users,
  BookOpen,
  Award,
  Bell,
  Clock,
  TrendingUp,
  CircleAlert,
  Search,
  Download,
  Filter,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

// Sample data for demonstration
const classActivityData = [
  { month: "Jan", submissions: 45, attendance: 92, engagement: 78 },
  { month: "Feb", submissions: 52, attendance: 89, engagement: 81 },
  { month: "Mar", submissions: 48, attendance: 95, engagement: 76 },
  { month: "Apr", submissions: 61, attendance: 94, engagement: 85 },
  { month: "May", submissions: 55, attendance: 91, engagement: 82 },
  { month: "Jun", submissions: 67, attendance: 97, engagement: 88 },
];

const subjectPerformanceData = [
  { subject: "JavaScript", average: 78 },
  { subject: "Python", average: 84 },
  { subject: "React", average: 76 },
  { subject: "CSS", average: 92 },
  { subject: "Node.js", average: 68 },
];

const gradeDistributionData = [
  { name: "A", value: 32 },
  { name: "B", value: 45 },
  { name: "C", value: 18 },
  { name: "D", value: 4 },
  { name: "F", value: 1 },
];

const studentGrowthData = [
  { month: "Jan", students: 120 },
  { month: "Feb", students: 132 },
  { month: "Mar", students: 145 },
  { month: "Apr", students: 162 },
  { month: "May", students: 170 },
  { month: "Jun", students: 178 },
];

const studentsData = [
  {
    id: 1,
    name: "Michael Johnson",
    email: "michael.j@example.com",
    avatar: "/avatars/01.png",
    performance: 92,
    lastSubmission: "2 days ago",
    attendance: 96,
    status: "Active",
  },
  {
    id: 2,
    name: "Sarah Williams",
    email: "sarah.w@example.com",
    avatar: "/avatars/02.png",
    performance: 78,
    lastSubmission: "Yesterday",
    attendance: 88,
    status: "Active",
  },
  {
    id: 3,
    name: "David Brown",
    email: "david.b@example.com",
    avatar: "/avatars/03.png",
    performance: 85,
    lastSubmission: "5 days ago",
    attendance: 92,
    status: "Active",
  },
  {
    id: 4,
    name: "Emily Davis",
    email: "emily.d@example.com",
    avatar: "/avatars/04.png",
    performance: 62,
    lastSubmission: "1 week ago",
    attendance: 75,
    status: "At Risk",
  },
  {
    id: 5,
    name: "James Wilson",
    email: "james.w@example.com",
    avatar: "/avatars/05.png",
    performance: 94,
    lastSubmission: "Yesterday",
    attendance: 98,
    status: "Active",
  },
];

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe'];

const TeacherAnalytics = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  
  const filteredStudents = studentsData.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="space-y-6">
      <Header 
        title="Class Analytics" 
        subtitle="Track student performance and manage your classes effectively"
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-customgreys-secondarybg border-none shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-customgreys-dirtyGrey">
              Total Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">178</div>
              <div className="p-2 bg-indigo-500/20 rounded-full">
                <Users className="h-5 w-5 text-indigo-500" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-green-500 text-sm">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>4.7% increase this month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-customgreys-secondarybg border-none shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-customgreys-dirtyGrey">
              Course Completion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">72%</div>
              <div className="p-2 bg-green-500/20 rounded-full">
                <BookOpen className="h-5 w-5 text-green-500" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <Progress value={72} className="h-2" />
            </div>
            <div className="text-gray-400 text-xs mt-2">
              Average across all classes
            </div>
          </CardContent>
        </Card>

        <Card className="bg-customgreys-secondarybg border-none shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-customgreys-dirtyGrey">
              Average Grade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">B+ (86%)</div>
              <div className="p-2 bg-amber-500/20 rounded-full">
                <Award className="h-5 w-5 text-amber-500" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-green-500 text-sm">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>2.3% from last semester</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-customgreys-secondarybg border-none shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-customgreys-dirtyGrey">
              Students at Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">12</div>
              <div className="p-2 bg-red-500/20 rounded-full">
                <CircleAlert className="h-5 w-5 text-red-500" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-red-500 text-sm">
              <span>6.7% of total students</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Class Selector and Charts Section */}
      <div className="flex flex-col md:flex-row gap-4 items-start mb-6">
        <Select value={selectedClass} onValueChange={setSelectedClass}>
          <SelectTrigger className="w-full md:w-[240px] bg-customgreys-secondarybg border-none">
            <SelectValue placeholder="Select Class" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            <SelectItem value="js-101">JavaScript 101</SelectItem>
            <SelectItem value="react-basics">React Basics</SelectItem>
            <SelectItem value="python-intro">Python Introduction</SelectItem>
            <SelectItem value="web-dev">Web Development</SelectItem>
          </SelectContent>
        </Select>
        
        <div className="flex gap-2 ml-auto">
          <Button variant="outline" size="sm" className="bg-customgreys-secondarybg border-none">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="bg-customgreys-secondarybg mb-6">
          <TabsTrigger 
            value="performance" 
            className="data-[state=active]:bg-primary-700"
          >
            Performance
          </TabsTrigger>
          <TabsTrigger 
            value="attendance" 
            className="data-[state=active]:bg-primary-700"
          >
            Attendance
          </TabsTrigger>
          <TabsTrigger 
            value="engagement" 
            className="data-[state=active]:bg-primary-700"
          >
            Engagement
          </TabsTrigger>
          <TabsTrigger 
            value="growth" 
            className="data-[state=active]:bg-primary-700"
          >
            Growth
          </TabsTrigger>
        </TabsList>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-customgreys-secondarybg border-none shadow-md">
              <CardHeader>
                <CardTitle>Grade Distribution</CardTitle>
                <CardDescription>
                  Distribution of grades across all students
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={gradeDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {gradeDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#333', border: 'none' }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-customgreys-secondarybg border-none shadow-md">
              <CardHeader>
                <CardTitle>Subject Performance</CardTitle>
                <CardDescription>
                  Average scores across different subjects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={subjectPerformanceData}
                      layout="vertical"
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#444" horizontal={false} />
                      <XAxis type="number" domain={[0, 100]} stroke="#888" />
                      <YAxis dataKey="subject" type="category" stroke="#888" width={100} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#333', border: 'none' }}
                        formatter={(value) => [`${value}%`, 'Average Score']}
                      />
                      <Legend />
                      <Bar 
                        dataKey="average" 
                        name="Average Score" 
                        fill="#82ca9d" 
                        radius={[0, 4, 4, 0]} 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Attendance Tab */}
        <TabsContent value="attendance" className="space-y-6">
          <Card className="bg-customgreys-secondarybg border-none shadow-md">
            <CardHeader>
              <CardTitle>Class Attendance</CardTitle>
              <CardDescription>
                Monthly attendance rates for all classes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={classActivityData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="month" stroke="#888" />
                    <YAxis stroke="#888" domain={[60, 100]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#333', border: 'none' }}
                      formatter={(value) => [`${value}%`, 'Attendance']}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="attendance"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Engagement Tab */}
        <TabsContent value="engagement" className="space-y-6">
          <Card className="bg-customgreys-secondarybg border-none shadow-md">
            <CardHeader>
              <CardTitle>Student Engagement</CardTitle>
              <CardDescription>
                Monthly engagement metrics including submissions and participation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={classActivityData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="month" stroke="#888" />
                    <YAxis stroke="#888" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#333', border: 'none' }}
                    />
                    <Legend />
                    <Bar 
                      dataKey="submissions" 
                      name="Assignment Submissions" 
                      fill="#8884d8"
                      radius={[4, 4, 0, 0]} 
                    />
                    <Bar 
                      dataKey="engagement" 
                      name="Class Participation" 
                      fill="#82ca9d" 
                      radius={[4, 4, 0, 0]} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Growth Tab */}
        <TabsContent value="growth" className="space-y-6">
          <Card className="bg-customgreys-secondarybg border-none shadow-md">
            <CardHeader>
              <CardTitle>Student Growth</CardTitle>
              <CardDescription>
                Monthly student enrollment numbers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={studentGrowthData}
                    margin={{
                      top: 10,
                      right: 30,
                      left: 0,
                      bottom: 0,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="month" stroke="#888" />
                    <YAxis stroke="#888" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#333', border: 'none' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="students" 
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      fillOpacity={0.3} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Students Table */}
      <Card className="bg-customgreys-secondarybg border-none shadow-md">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Student Performance</CardTitle>
              <CardDescription>
                Track individual student progress and identify those who need assistance
              </CardDescription>
            </div>
            <div className="w-full sm:w-auto flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-customgreys-dirtyGrey" />
                <Input 
                  placeholder="Search students..." 
                  className="pl-8 bg-customgreys-primarybg border-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon" className="bg-customgreys-primarybg border-none">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-customgreys-primarybg">
                  <th className="text-left py-3 px-4 font-medium text-customgreys-dirtyGrey">Student</th>
                  <th className="text-left py-3 px-4 font-medium text-customgreys-dirtyGrey">Performance</th>
                  <th className="text-left py-3 px-4 font-medium text-customgreys-dirtyGrey">Last Submission</th>
                  <th className="text-left py-3 px-4 font-medium text-customgreys-dirtyGrey">Attendance</th>
                  <th className="text-left py-3 px-4 font-medium text-customgreys-dirtyGrey">Status</th>
                  <th className="text-right py-3 px-4 font-medium text-customgreys-dirtyGrey">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="border-b border-customgreys-primarybg hover:bg-customgreys-primarybg/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={student.avatar} alt={student.name} />
                          <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{student.name}</div>
                          <div className="text-sm text-customgreys-dirtyGrey">{student.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between">
                          <span className="text-sm">{student.performance}%</span>
                        </div>
                        <Progress 
                          value={student.performance} 
                          className={`h-2 ${
                            student.performance >= 80 ? "bg-green-500" : 
                            student.performance >= 60 ? "bg-amber-500" : "bg-red-500"
                          }`}
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm">{student.lastSubmission}</td>
                    <td className="py-3 px-4 text-sm">{student.attendance}%</td>
                    <td className="py-3 px-4">
                      <Badge variant={student.status === "Active" ? "success" : "destructive"}>
                        {student.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button variant="ghost" size="sm">
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* At-Risk Students */}
      <Card className="bg-customgreys-secondarybg border-none shadow-md">
        <CardHeader>
          <CardTitle>Intervention Needed</CardTitle>
          <CardDescription>
            Students who may need additional support
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-customgreys-primarybg rounded-lg">
              <div className="p-2 bg-red-500/20 rounded-full">
                <CircleAlert className="h-5 w-5 text-red-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Emily Davis</h3>
                  <Badge variant="destructive">At Risk</Badge>
                </div>
                <p className="text-sm text-gray-400 my-1">Has missed 3 consecutive assignments and attendance has dropped to 75%</p>
                <div className="flex gap-2 mt-2">
                  <Button variant="outline" size="sm" className="bg-customgreys-secondarybg border-none">
                    Send Message
                  </Button>
                  <Button size="sm">Schedule Meeting</Button>
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-customgreys-primarybg rounded-lg">
              <div className="p-2 bg-amber-500/20 rounded-full">
                <Bell className="h-5 w-5 text-amber-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Robert Taylor</h3>
                  <Badge variant="warning">Needs Attention</Badge>
                </div>
                <p className="text-sm text-gray-400 my-1">Quiz scores have dropped by 15% in the last month</p>
                <div className="flex gap-2 mt-2">
                  <Button variant="outline" size="sm" className="bg-customgreys-secondarybg border-none">
                    Send Message
                  </Button>
                  <Button size="sm">Schedule Meeting</Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherAnalytics; 