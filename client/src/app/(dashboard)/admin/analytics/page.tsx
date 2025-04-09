"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Users,
  BookOpen,
  DollarSign,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  FileSpreadsheet,
  ChevronDown,
} from "lucide-react";

// Mock data - would be replaced with API calls
const userGrowthData = [
  { month: "Jan", students: 120, teachers: 30 },
  { month: "Feb", students: 150, teachers: 35 },
  { month: "Mar", students: 200, teachers: 40 },
  { month: "Apr", students: 280, teachers: 45 },
  { month: "May", students: 350, teachers: 52 },
  { month: "Jun", students: 410, teachers: 60 },
];

const revenueData = [
  { month: "Jan", revenue: 15000 },
  { month: "Feb", revenue: 18500 },
  { month: "Mar", revenue: 22000 },
  { month: "Apr", revenue: 28500 },
  { month: "May", revenue: 32000 },
  { month: "Jun", revenue: 38000 },
];

const courseEnrollmentData = [
  { name: "Web Development", value: 35 },
  { name: "Data Science", value: 25 },
  { name: "Mobile App Dev", value: 20 },
  { name: "AI & ML", value: 15 },
  { name: "Other", value: 5 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

const courseActivityData = [
  { day: "Mon", activeUsers: 145 },
  { day: "Tue", activeUsers: 132 },
  { day: "Wed", activeUsers: 164 },
  { day: "Thu", activeUsers: 178 },
  { day: "Fri", activeUsers: 160 },
  { day: "Sat", activeUsers: 112 },
  { day: "Sun", activeUsers: 98 },
];

const AnalyticsPage = () => {
  const [timeRange, setTimeRange] = useState("6months");

  return (
    <div className="analytics-dashboard pb-8">
      <Header
        title="Analytics Dashboard"
        subtitle="Comprehensive data insights and platform statistics"
        rightElement={
          <div className="flex items-center gap-3">
            <Select defaultValue={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px] bg-slate-800 border-slate-700">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="3months">Last 3 months</SelectItem>
                <SelectItem value="6months">Last 6 months</SelectItem>
                <SelectItem value="1year">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2 bg-slate-800 border-slate-700">
              <Download size={16} />
              Export
              <ChevronDown size={14} />
            </Button>
          </div>
        }
      />

      {/* Key Metrics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        <Card className="bg-slate-800 border-slate-700 hover:border-blue-500/30 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="bg-blue-500/20 p-3 rounded-lg">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
              <div className="flex items-center gap-1 text-green-500 text-sm">
                <span>+12.5%</span>
                <ArrowUpRight size={14} />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-slate-400 text-sm font-medium">Total Users</h3>
              <div className="flex items-end gap-2 mt-1">
                <span className="text-2xl font-bold">2,854</span>
                <span className="text-slate-400 text-sm">users</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700 hover:border-green-500/30 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="bg-green-500/20 p-3 rounded-lg">
                <BookOpen className="h-6 w-6 text-green-500" />
              </div>
              <div className="flex items-center gap-1 text-green-500 text-sm">
                <span>+8.2%</span>
                <ArrowUpRight size={14} />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-slate-400 text-sm font-medium">Active Courses</h3>
              <div className="flex items-end gap-2 mt-1">
                <span className="text-2xl font-bold">186</span>
                <span className="text-slate-400 text-sm">courses</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700 hover:border-purple-500/30 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="bg-purple-500/20 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-500" />
              </div>
              <div className="flex items-center gap-1 text-green-500 text-sm">
                <span>+15.3%</span>
                <ArrowUpRight size={14} />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-slate-400 text-sm font-medium">Enrollments</h3>
              <div className="flex items-end gap-2 mt-1">
                <span className="text-2xl font-bold">5,642</span>
                <span className="text-slate-400 text-sm">this month</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700 hover:border-yellow-500/30 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="bg-yellow-500/20 p-3 rounded-lg">
                <DollarSign className="h-6 w-6 text-yellow-500" />
              </div>
              <div className="flex items-center gap-1 text-red-500 text-sm">
                <span>-2.4%</span>
                <ArrowDownRight size={14} />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-slate-400 text-sm font-medium">Revenue</h3>
              <div className="flex items-end gap-2 mt-1">
                <span className="text-2xl font-bold">$38,240</span>
                <span className="text-slate-400 text-sm">this month</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="overview" className="mt-8">
        <TabsList className="bg-slate-800 w-full flex justify-start p-1 mb-6">
          <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600 flex-1 max-w-[150px]">
            Overview
          </TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-blue-600 flex-1 max-w-[150px]">
            Users
          </TabsTrigger>
          <TabsTrigger value="courses" className="data-[state=active]:bg-blue-600 flex-1 max-w-[150px]">
            Courses
          </TabsTrigger>
          <TabsTrigger value="revenue" className="data-[state=active]:bg-blue-600 flex-1 max-w-[150px]">
            Revenue
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg font-medium flex items-center justify-between">
                  <span>User Growth</span>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <FileSpreadsheet size={16} />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={userGrowthData}
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
                        contentStyle={{
                          backgroundColor: "#1e1e1e",
                          border: "1px solid #444",
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="students"
                        stroke="#0088FE"
                        activeDot={{ r: 8 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="teachers"
                        stroke="#00C49F"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg font-medium flex items-center justify-between">
                  <span>Revenue Trend</span>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <FileSpreadsheet size={16} />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={revenueData}
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
                        contentStyle={{
                          backgroundColor: "#1e1e1e",
                          border: "1px solid #444",
                        }}
                        formatter={(value) => [`$${value}`, "Revenue"]}
                      />
                      <Legend />
                      <Bar
                        dataKey="revenue"
                        fill="#8884d8"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg font-medium flex items-center justify-between">
                  <span>Course Category Distribution</span>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <FileSpreadsheet size={16} />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={courseEnrollmentData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {courseEnrollmentData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1e1e1e",
                          border: "1px solid #444",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg font-medium flex items-center justify-between">
                  <span>Daily Active Users</span>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <FileSpreadsheet size={16} />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={courseActivityData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                      <XAxis dataKey="day" stroke="#888" />
                      <YAxis stroke="#888" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1e1e1e",
                          border: "1px solid #444",
                        }}
                      />
                      <Bar
                        dataKey="activeUsers"
                        fill="#00C49F"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="mt-0">
          <div className="grid grid-cols-1 gap-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg font-medium">User Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400 mb-4">Detailed user statistics will appear here.</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="courses" className="mt-0">
          <div className="grid grid-cols-1 gap-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg font-medium">Course Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400 mb-4">Detailed course statistics will appear here.</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="mt-0">
          <div className="grid grid-cols-1 gap-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg font-medium">Revenue Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400 mb-4">Detailed revenue statistics will appear here.</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Recent Activity Section */}
      <div className="mt-8">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="border-b border-slate-700">
            <CardTitle className="text-lg font-medium">Recent Platform Activity</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-700">
              {[1, 2, 3, 4, 5].map((_, index) => (
                <div key={index} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-500/20 p-2 rounded-full">
                      {index % 3 === 0 ? (
                        <Users className="h-5 w-5 text-blue-500" />
                      ) : index % 3 === 1 ? (
                        <BookOpen className="h-5 w-5 text-green-500" />
                      ) : (
                        <DollarSign className="h-5 w-5 text-yellow-500" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium">
                        {index % 3 === 0
                          ? "New user registered"
                          : index % 3 === 1
                          ? "New course published"
                          : "New payment received"}
                      </h4>
                      <p className="text-sm text-slate-400">
                        {index % 3 === 0
                          ? "John Doe registered as a new student"
                          : index % 3 === 1
                          ? "Web Development Masterclass published by Jane Smith"
                          : "Payment of $99.99 received for Python Course"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-slate-400 mr-1" />
                    <span className="text-sm text-slate-400">
                      {index === 0
                        ? "Just now"
                        : index === 1
                        ? "2 hours ago"
                        : index === 2
                        ? "5 hours ago"
                        : index === 3
                        ? "Yesterday"
                        : "2 days ago"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsPage; 