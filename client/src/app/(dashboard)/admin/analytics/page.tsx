"use client";

import React, { useState, useEffect } from "react";
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
import { 
  useGetDashboardStatsQuery, 
  useGetMonthlyRevenueQuery,
  useGetAnalyticsSummaryQuery,
  useGetUserAnalyticsQuery,
  useGetCourseAnalyticsQuery,
  useGetRevenueAnalyticsQuery,
  useGetPlatformAnalyticsQuery
} from "@/state/api";
import Loading from "@/components/Loading";

// Colors for pie chart
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

// Define types for our chart data
interface CourseEnrollmentItem {
  name: string;
  value: number;
}

interface RevenueDataItem {
  month: string;
  revenue: number;
}

interface UserActivity {
  type: string;
  userId: string;
  user?: {
    name: string;
    imageUrl: string | null;
  };
  date: string;
  data?: any;
}

const AnalyticsPage = () => {
  const [timeRange, setTimeRange] = useState("6months");

  // Fetch analytics data
  const { data: dashboardStats, isLoading: isStatsLoading } = useGetDashboardStatsQuery();
  const { data: monthlyRevenue, isLoading: isRevenueLoading } = useGetMonthlyRevenueQuery();
  const { data: analyticsSummary, isLoading: isSummaryLoading } = useGetAnalyticsSummaryQuery(timeRange);
  const { data: userAnalytics, isLoading: isUserAnalyticsLoading } = useGetUserAnalyticsQuery(timeRange);
  const { data: courseAnalytics, isLoading: isCourseAnalyticsLoading } = useGetCourseAnalyticsQuery(timeRange);
  const { data: revenueAnalytics, isLoading: isRevenueAnalyticsLoading } = useGetRevenueAnalyticsQuery(timeRange);
  const { data: platformAnalytics, isLoading: isPlatformAnalyticsLoading } = useGetPlatformAnalyticsQuery(timeRange);
  
  // Show loading state if any data is still loading
  const isLoading = 
    isStatsLoading || 
    isRevenueLoading || 
    isSummaryLoading || 
    isUserAnalyticsLoading || 
    isCourseAnalyticsLoading || 
    isRevenueAnalyticsLoading || 
    isPlatformAnalyticsLoading;

  // Debug log to see data structure
  useEffect(() => {
    if (dashboardStats?.data) {
      console.log("Dashboard stats data:", dashboardStats.data);
    }
    if (analyticsSummary) {
      console.log("Analytics summary:", analyticsSummary);
    }
  }, [dashboardStats, analyticsSummary]);

  if (isLoading) {
    return <Loading />;
  }

  // Helper function to check if growth is positive
  const isPositive = (value: number | string) => {
    if (typeof value === 'string') {
      return value.startsWith('+');
    }
    return value > 0;
  };

  // Prepare data for the view
  const stats = [
    {
      title: "Total Users",
      value: dashboardStats?.data?.users?.total ? dashboardStats.data.users.total.toLocaleString() : "0",
      change: dashboardStats?.data?.users?.growth || "+0%",
      changeValue: dashboardStats?.data?.users?.growthValue || 0,
      icon: <Users className="h-6 w-6 text-blue-500" />,
      iconBg: "bg-blue-500/20",
      hoverBorder: "hover:border-blue-500/30",
    },
    {
      title: "Active Courses",
      value: dashboardStats?.data?.courses?.total ? dashboardStats.data.courses.total.toLocaleString() : "0",
      change: dashboardStats?.data?.courses?.growth || "+0%",
      changeValue: dashboardStats?.data?.courses?.growthValue || 0,
      icon: <BookOpen className="h-6 w-6 text-green-500" />,
      iconBg: "bg-green-500/20",
      hoverBorder: "hover:border-green-500/30",
    },
    {
      title: "Enrollments",
      value: analyticsSummary?.enrollments?.total ? analyticsSummary.enrollments.total.toLocaleString() : "0",
      change: analyticsSummary?.enrollments?.growth || "+0%",
      changeValue: analyticsSummary?.enrollments?.growthValue || 0,
      icon: <TrendingUp className="h-6 w-6 text-purple-500" />,
      iconBg: "bg-purple-500/20",
      hoverBorder: "hover:border-purple-500/30",
    },
    {
      title: "Revenue",
      value: `$${dashboardStats?.data?.revenue?.total ? dashboardStats.data.revenue.total.toLocaleString() : "0"}`,
      change: dashboardStats?.data?.revenue?.growth || "+0%",
      changeValue: dashboardStats?.data?.revenue?.growthValue || 0,
      icon: <DollarSign className="h-6 w-6 text-yellow-500" />,
      iconBg: "bg-yellow-500/20",
      hoverBorder: "hover:border-yellow-500/30",
    },
  ];

  // Prepare user growth data
  const userGrowthData = userAnalytics?.userGrowth || [];

  // Prepare revenue data
  const revenueData = monthlyRevenue?.data || [];

  // Prepare course enrollment data
  const courseEnrollmentData = courseAnalytics?.enrollmentByCategory || [];

  // Prepare course activity data
  const courseActivityData = platformAnalytics?.dailyActiveUsers || [];

  return (
    <div className="analytics-dashboard pb-8">
      <Header
        title="Analytics Dashboard"
        subtitle="Comprehensive data insights and platform statistics"
        rightElement={
          <div className="flex items-center gap-3">
            <Select defaultValue={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px] bg-slate-800 border-slate-700 text-white">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-white">
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="3months">Last 3 months</SelectItem>
                <SelectItem value="6months">Last 6 months</SelectItem>
                <SelectItem value="1year">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="flex items-center gap-2 bg-slate-800 border-slate-700 text-white hover:bg-slate-700">
              <Download className="h-4 w-4" />
              <span>Export</span>
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </div>
        }
      />

      {/* Key Metrics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card 
            key={index} 
            className={`bg-slate-800 border-slate-700 ${stat.hoverBorder} transition-colors`}
          >
            <CardContent className="py-6 px-5">
              <div className="flex justify-between items-center mb-4">
                <div className={`p-3 rounded-lg ${stat.iconBg}`}>
                  {stat.icon}
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  isPositive(stat.changeValue) 
                    ? 'bg-green-900/40 text-green-400' 
                    : 'bg-red-900/40 text-red-400'
                }`}>
                  {stat.change}
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-400">{stat.title}</p>
                <h2 className="text-2xl font-bold text-white">{stat.value}</h2>
              </div>
            </CardContent>
          </Card>
        ))}
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
                          border: "1px solid #333",
                          borderRadius: "4px",
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
                          border: "1px solid #333",
                          borderRadius: "4px",
                        }}
                        formatter={(value) => [`$${value}`, "Revenue"]}
                      />
                      <Bar
                        dataKey="revenue"
                        fill="#8884d8"
                        background={{ fill: "#444" }}
                      >
                        {revenueData.map((item: RevenueDataItem, index: number) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={`#${Math.floor(
                              Math.random() * 16777215
                            ).toString(16)}`}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg font-medium flex items-center justify-between">
                  <span>Course Enrollments by Category</span>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <FileSpreadsheet size={16} />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
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
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {courseEnrollmentData.map((item: CourseEnrollmentItem, index: number) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1e1e1e",
                          border: "1px solid #333",
                          borderRadius: "4px",
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
                          border: "1px solid #333",
                          borderRadius: "4px",
                        }}
                      />
                      <Bar dataKey="activeUsers" fill="#0088FE" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg font-medium">
                  User Registration Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={userAnalytics?.registrationTrend || []}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                      <XAxis dataKey="date" stroke="#888" />
                      <YAxis stroke="#888" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1e1e1e",
                          border: "1px solid #333",
                          borderRadius: "4px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#0088FE"
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg font-medium">
                  User Role Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={userAnalytics?.roleDistribution || []}
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
                        {(userAnalytics?.roleDistribution || []).map((item: CourseEnrollmentItem, index: number) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1e1e1e",
                          border: "1px solid #333",
                          borderRadius: "4px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="courses" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg font-medium">
                  Course Creation Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={courseAnalytics?.creationTrend || []}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                      <XAxis dataKey="date" stroke="#888" />
                      <YAxis stroke="#888" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1e1e1e",
                          border: "1px solid #333",
                          borderRadius: "4px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#00C49F"
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg font-medium">
                  Completion Rates by Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={courseAnalytics?.completionRates || []}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 80,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                      <XAxis type="number" stroke="#888" />
                      <YAxis dataKey="category" type="category" stroke="#888" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1e1e1e",
                          border: "1px solid #333",
                          borderRadius: "4px",
                        }}
                        formatter={(value) => [`${value}%`, "Completion Rate"]}
                      />
                      <Bar dataKey="rate" fill="#FFBB28" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg font-medium">
                  Revenue by Course Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={revenueAnalytics?.revenueByCategory || []}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                      <XAxis dataKey="category" stroke="#888" />
                      <YAxis stroke="#888" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1e1e1e",
                          border: "1px solid #333",
                          borderRadius: "4px",
                        }}
                        formatter={(value) => [`$${value}`, "Revenue"]}
                      />
                      <Bar dataKey="revenue" fill="#FF8042" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg font-medium">
                  Annual Revenue Forecast
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={revenueAnalytics?.revenueForecast || []}
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
                          border: "1px solid #333",
                          borderRadius: "4px",
                        }}
                        formatter={(value) => [`$${value}`, "Forecast"]}
                      />
                      <Line
                        type="monotone"
                        dataKey="actual"
                        stroke="#0088FE"
                        strokeWidth={2}
                        dot={{ r: 5 }}
                        name="Actual"
                      />
                      <Line
                        type="monotone"
                        dataKey="forecast"
                        stroke="#FF8042"
                        strokeDasharray="5 5"
                        strokeWidth={2}
                        dot={{ r: 5 }}
                        name="Forecast"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsPage; 