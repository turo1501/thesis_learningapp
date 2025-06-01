"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  AreaChart,
  Area,
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
import APIErrorMessage from "@/components/APIErrorMessage";
import { generateMockAnalyticsData } from "@/lib/utils";

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
  const [dataErrors, setDataErrors] = useState<string[]>([]);
  const [useMockData, setUseMockData] = useState<boolean>(true); // Always use mock data for now

  // Generate mock data
  const mockData = useMemo(() => generateMockAnalyticsData(), []);
  
  // Prepare all chart data with mock data immediately
  // Define these before any useEffect hooks to avoid reference errors
  const registrationTrendData = mockData.registrationTrend;
  const courseCreationTrend = mockData.courseCreationTrend;
  const completionRates = mockData.completionRates;
  const revenueByCategoryData = mockData.revenueByCategory;
  const revenueForecastData = mockData.revenueForecast;

  // Fetch analytics data with proper error handling
  const { data: dashboardStats, isLoading: isStatsLoading, error: statsError, refetch: refetchStats } = useGetDashboardStatsQuery();
  const { data: monthlyRevenue, isLoading: isRevenueLoading, error: revenueError, refetch: refetchRevenue } = useGetMonthlyRevenueQuery();
  const { data: analyticsSummary, isLoading: isSummaryLoading, error: summaryError, refetch: refetchSummary } = useGetAnalyticsSummaryQuery(timeRange);
  const { data: userAnalytics, isLoading: isUserAnalyticsLoading, error: userError, refetch: refetchUserAnalytics } = useGetUserAnalyticsQuery(timeRange);
  const { data: courseAnalytics, isLoading: isCourseAnalyticsLoading, error: courseError, refetch: refetchCourseAnalytics } = useGetCourseAnalyticsQuery(timeRange);
  const { data: revenueAnalytics, isLoading: isRevenueAnalyticsLoading, error: revenueAnalyticsError, refetch: refetchRevenueAnalytics } = useGetRevenueAnalyticsQuery(timeRange);
  const { data: platformAnalytics, isLoading: isPlatformAnalyticsLoading, error: platformError, refetch: refetchPlatformAnalytics } = useGetPlatformAnalyticsQuery(timeRange);
  
  // Track and collect errors
  useEffect(() => {
    const errors = [];
    if (statsError) errors.push("Failed to load dashboard statistics");
    if (revenueError) errors.push("Failed to load revenue data");
    if (summaryError) errors.push("Failed to load analytics summary");
    if (userError) errors.push("Failed to load user analytics");
    if (courseError) errors.push("Failed to load course analytics");
    if (revenueAnalyticsError) errors.push("Failed to load revenue analytics");
    if (platformError) errors.push("Failed to load platform analytics");
    
    setDataErrors(errors);
    // Enable mock data if we have errors or missing data
    setUseMockData(errors.length > 0 || !dashboardStats || !userAnalytics || !courseAnalytics || !revenueAnalytics);
  }, [statsError, revenueError, summaryError, userError, courseError, revenueAnalyticsError, platformError, 
      dashboardStats, userAnalytics, courseAnalytics, revenueAnalytics]);
  
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
    if (dashboardStats) {
      console.log("Dashboard stats data:", dashboardStats);
    }
    if (analyticsSummary) {
      console.log("Analytics summary:", analyticsSummary);
    }
    if (userAnalytics) {
      console.log("User analytics:", userAnalytics);
    }
    if (courseAnalytics) {
      console.log("Course analytics:", courseAnalytics);
    }
    if (revenueAnalytics) {
      console.log("Revenue analytics:", revenueAnalytics);
    }
    
    // Log the available mock data for debugging
    console.log("Mock data available:", {
      userRegistration: mockData.registrationTrend,
      courseCreation: mockData.courseCreationTrend,
      completionRates: mockData.completionRates,
      revenueByCategory: mockData.revenueByCategory,
      revenueForecast: mockData.revenueForecast
    });
    
    // Always force mock data for specific charts that are still empty
    const forceUseMockData = true;
    
    if (forceUseMockData || !registrationTrendData || registrationTrendData.length === 0) {
      console.log("Using mock data for registration trend");
    }
    
    if (forceUseMockData || !courseCreationTrend || courseCreationTrend.length === 0) {
      console.log("Using mock data for course creation trend");
    }
    
    if (forceUseMockData || !completionRates || completionRates.length === 0) {
      console.log("Using mock data for completion rates");
    }
    
    if (forceUseMockData || !revenueByCategoryData || revenueByCategoryData.length === 0) {
      console.log("Using mock data for revenue by category");
    }
    
    if (forceUseMockData || !revenueForecastData || revenueForecastData.length === 0) {
      console.log("Using mock data for revenue forecast");
    }
    
  }, [dashboardStats, analyticsSummary, userAnalytics, courseAnalytics, revenueAnalytics, 
      mockData, registrationTrendData, courseCreationTrend, completionRates, 
      revenueByCategoryData, revenueForecastData]);

  // Function to refresh all data
  const refreshAllData = () => {
    refetchStats();
    refetchRevenue();
    refetchSummary();
    refetchUserAnalytics();
    refetchCourseAnalytics();
    refetchRevenueAnalytics();
    refetchPlatformAnalytics();
  };

  if (isLoading && !useMockData) {
    return <Loading />;
  }

  // Safely access nested properties
  const getNestedProperty = (obj: any, path: string, defaultValue: any = null) => {
    const keys = path.split('.');
    let result = obj;
    
    for (const key of keys) {
      if (result === null || result === undefined || typeof result !== 'object') {
        return defaultValue;
      }
      result = result[key];
    }
    
    return result !== undefined ? result : defaultValue;
  };

  // Helper function to check if growth is positive
  const isPositive = (value: number | string) => {
    if (typeof value === 'string') {
      return value.startsWith('+');
    }
    return value > 0;
  };

  // Extract stats data from response or use mock data
  const statsData = useMockData ? 
    {
      users: { total: 11, growth: '+22.2%', growthValue: 22.2 },
      courses: { total: 13, growth: '+8.3%', growthValue: 8.3 },
      revenue: { total: 50114988, growth: '+10.5%', growthValue: 10.5 }
    } : 
    (dashboardStats || {});
  
  // Prepare user growth data with safety and mock data fallback
  const userGrowthData = useMockData 
    ? mockData.userGrowth 
    : (getNestedProperty(userAnalytics, 'userGrowth', mockData.userGrowth));

  // Prepare revenue data with safety and mock data fallback
  const revenueData = useMockData 
    ? mockData.revenueByMonth 
    : (getNestedProperty(revenueAnalytics, 'revenueByMonth', mockData.revenueByMonth));

  // Prepare course enrollment data with safety and mock data fallback
  const courseEnrollmentData = useMockData 
    ? mockData.enrollmentByCategory
    : (getNestedProperty(courseAnalytics, 'enrollmentByCategory', mockData.enrollmentByCategory));
    
  // Prepare course activity data with safety and mock data fallback
  const courseActivityData = useMockData 
    ? mockData.dailyActiveUsers
    : (getNestedProperty(platformAnalytics, 'dailyActiveUsers', mockData.dailyActiveUsers));
    
  // Prepare user type data with mock data fallback
  const userTypesData = useMockData
    ? mockData.userTypes
    : (getNestedProperty(userAnalytics, 'usersByRole', mockData.userTypes));
    
  // Prepare data for the view with better error handling
  const stats = [
    {
      title: "Total Users",
      value: getNestedProperty(statsData, 'users.total', 0).toLocaleString(),
      change: getNestedProperty(statsData, 'users.growth', '+0%'),
      changeValue: getNestedProperty(statsData, 'users.growthValue', 0),
      icon: <Users className="h-6 w-6 text-blue-500" />,
      iconBg: "bg-blue-500/20",
      hoverBorder: "hover:border-blue-500/30",
    },
    {
      title: "Active Courses",
      value: getNestedProperty(statsData, 'courses.total', 0).toLocaleString(),
      change: getNestedProperty(statsData, 'courses.growth', '+0%'),
      changeValue: getNestedProperty(statsData, 'courses.growthValue', 0),
      icon: <BookOpen className="h-6 w-6 text-green-500" />,
      iconBg: "bg-green-500/20",
      hoverBorder: "hover:border-green-500/30",
    },
    {
      title: "Enrollments",
      value: getNestedProperty(analyticsSummary, 'enrollments.total', 0).toLocaleString(),
      change: getNestedProperty(analyticsSummary, 'enrollments.growth', '+0%'),
      changeValue: getNestedProperty(analyticsSummary, 'enrollments.growthValue', 0),
      icon: <TrendingUp className="h-6 w-6 text-purple-500" />,
      iconBg: "bg-purple-500/20",
      hoverBorder: "hover:border-purple-500/30",
    },
    {
      title: "Revenue",
      value: `$${getNestedProperty(statsData, 'revenue.total', 0).toLocaleString()}`,
      change: getNestedProperty(statsData, 'revenue.growth', '+0%'),
      changeValue: getNestedProperty(statsData, 'revenue.growthValue', 0),
      icon: <DollarSign className="h-6 w-6 text-yellow-500" />,
      iconBg: "bg-yellow-500/20",
      hoverBorder: "hover:border-yellow-500/30",
    },
  ];

  return (
    <div className="analytics-dashboard pb-8 px-1 md:px-4">
      <Header
        title="Analytics Dashboard"
        subtitle="Comprehensive data insights and platform statistics"
        rightElement={
          <div className="flex items-center gap-3">
            <Select defaultValue={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px] bg-slate-800/70 border-slate-700/50 text-white hover:bg-slate-800 transition-all">
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
            <Button variant="outline" className="flex items-center gap-2 bg-slate-800/70 border-slate-700/50 text-white hover:bg-slate-800 transition-all">
              <Download className="h-4 w-4" />
              <span>Export</span>
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </div>
        }
      />

      {/* Display any data errors */}
      <APIErrorMessage errors={dataErrors} title="Analytics Data Issues" />
      
      {/* Display mock data notification */}
      {useMockData && (
        <div className="bg-blue-950/50 border border-blue-900/50 text-blue-300 px-4 py-3 rounded-lg mb-5 flex items-center justify-between">
          <div>
            <p className="font-medium mb-1">Using mock data for visualization</p>
            <p className="text-sm opacity-80">
              The following charts are currently displaying mock data: 
              User Registration Trends, Course Creation Trends, Completion Rates by Category, 
              Revenue Distribution, and Revenue Forecast.
            </p>
          </div>
          <Button 
            variant="outline" 
            className="bg-blue-900/30 border-blue-800/50 text-blue-200 hover:bg-blue-900/50"
            onClick={refreshAllData}
          >
            Refresh Data
          </Button>
        </div>
      )}

      {/* Key Metrics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        {stats.map((stat, index) => (
          <Card 
            key={index} 
            className="overflow-hidden bg-slate-800/50 hover:bg-slate-800/70 border-slate-700/50 hover:border-slate-700 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-3">
                <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${stat.iconBg} bg-gradient-to-br ${
                  index === 0 ? "from-blue-600/20 to-blue-700/20 text-blue-500" :
                  index === 1 ? "from-emerald-600/20 to-emerald-700/20 text-emerald-500" :
                  index === 2 ? "from-purple-600/20 to-purple-700/20 text-purple-500" :
                  "from-amber-600/20 to-amber-700/20 text-amber-500"
                }`}>
                  {stat.icon}
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                  isPositive(stat.changeValue) 
                    ? 'bg-green-500/10 text-green-400' 
                    : 'bg-red-500/10 text-red-400'
                }`}>
                  {stat.change}
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-400">{stat.title}</p>
                <h2 className="text-2xl font-bold text-white">{stat.value}</h2>
              </div>
            </div>
            <div className={`h-1 w-full bg-gradient-to-r ${
              index === 0 ? "from-blue-600 to-blue-500" :
              index === 1 ? "from-emerald-600 to-emerald-500" :
              index === 2 ? "from-purple-600 to-purple-500" :
              "from-amber-600 to-amber-500"
            }`}></div>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="overview" className="mt-6">
        <TabsList className="bg-slate-800/70 border border-slate-700/50 w-full flex justify-start p-1 mb-6 rounded-xl overflow-hidden">
          <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white flex-1 max-w-[150px] rounded-lg">
            Overview
          </TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white flex-1 max-w-[150px] rounded-lg">
            Users
          </TabsTrigger>
          <TabsTrigger value="courses" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white flex-1 max-w-[150px] rounded-lg">
            Courses
          </TabsTrigger>
          <TabsTrigger value="revenue" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white flex-1 max-w-[150px] rounded-lg">
            Revenue
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card className="bg-slate-800/50 border-slate-700/50 overflow-hidden shadow-md">
              <CardHeader className="py-5 px-6 border-b border-slate-700/50 flex flex-row items-center justify-between">
                <div className="space-y-0.5">
                  <CardTitle className="text-white text-lg font-medium">User Growth</CardTitle>
                  <p className="text-slate-400 text-sm">Student and teacher growth trends</p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-700/50">
                  <FileSpreadsheet size={16} className="text-blue-500" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {userGrowthData && userGrowthData.length > 0 ? (
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
                        <defs>
                          <linearGradient id="studentGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="teacherGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                        <XAxis 
                          dataKey="month" 
                          stroke="#94a3b8" 
                          tick={{fill: '#94a3b8'}}
                          axisLine={{ stroke: '#475569' }}
                          tickLine={{ stroke: '#475569' }}
                        />
                        <YAxis 
                          stroke="#94a3b8" 
                          tick={{fill: '#94a3b8'}}
                          axisLine={{ stroke: '#475569' }}
                          tickLine={{ stroke: '#475569' }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1e293b",
                            border: "1px solid #334155",
                            borderRadius: "8px",
                            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                            padding: "12px",
                            color: "#e2e8f0"
                          }}
                        />
                        <Legend 
                          wrapperStyle={{
                            paddingTop: "20px"
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="students"
                          stroke="#3b82f6"
                          strokeWidth={3}
                          dot={{fill: '#3b82f6', r: 4, strokeWidth: 0}}
                          activeDot={{fill: '#60a5fa', r: 6, stroke: '#3b82f6', strokeWidth: 2}}
                          name="Students"
                          fillOpacity={0.2}
                          fill="url(#studentGradient)"
                        />
                        <Line
                          type="monotone"
                          dataKey="teachers"
                          stroke="#10b981"
                          strokeWidth={3}
                          dot={{fill: '#10b981', r: 4, strokeWidth: 0}}
                          activeDot={{fill: '#34d399', r: 6, stroke: '#10b981', strokeWidth: 2}}
                          name="Teachers"
                          fillOpacity={0.2}
                          fill="url(#teacherGradient)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-400">
                      No user growth data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700/50 overflow-hidden shadow-md">
              <CardHeader className="py-5 px-6 border-b border-slate-700/50 flex flex-row items-center justify-between">
                <div className="space-y-0.5">
                  <CardTitle className="text-white text-lg font-medium">Revenue Trend</CardTitle>
                  <p className="text-slate-400 text-sm">Monthly revenue performance</p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-700/50">
                  <FileSpreadsheet size={16} className="text-amber-500" />
                </Button>
              </CardHeader>
              <CardContent className="p-6 pt-5">
                <div className="h-[300px]">
                  {revenueData && revenueData.length > 0 ? (
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
                        <defs>
                          {revenueData && Array.isArray(revenueData) && revenueData.map((entry: RevenueDataItem, index: number) => (
                            <linearGradient 
                              key={`gradient-${index}`} 
                              id={`colorRevenue${index}`} 
                              x1="0" 
                              y1="0" 
                              x2="0" 
                              y2="1"
                            >
                              <stop 
                                offset="5%" 
                                stopColor={COLORS[index % COLORS.length]} 
                                stopOpacity={0.9}
                              />
                              <stop 
                                offset="95%" 
                                stopColor={COLORS[index % COLORS.length]} 
                                stopOpacity={0.6}
                              />
                            </linearGradient>
                          ))}
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                        <XAxis 
                          dataKey="month" 
                          stroke="#94a3b8" 
                          tick={{fill: '#94a3b8'}}
                          axisLine={{ stroke: '#475569' }}
                          tickLine={{ stroke: '#475569' }}
                        />
                        <YAxis 
                          stroke="#94a3b8" 
                          tick={{fill: '#94a3b8'}}
                          axisLine={{ stroke: '#475569' }}
                          tickLine={{ stroke: '#475569' }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1e293b",
                            border: "1px solid #334155",
                            borderRadius: "8px",
                            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                            padding: "12px",
                            color: "#e2e8f0"
                          }}
                          formatter={(value) => [`$${value}`, "Revenue"]}
                        />
                        <Bar
                          dataKey="revenue"
                          background={{ fill: "#1e293b" }}
                          radius={[4, 4, 0, 0]}
                        >
                          {revenueData && Array.isArray(revenueData) ? revenueData.map((item: RevenueDataItem, index: number) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={`url(#colorRevenue${index})`}
                            />
                          )) : null}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-400">
                      No revenue data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700/50 overflow-hidden shadow-md">
              <CardHeader className="py-5 px-6 border-b border-slate-700/50 flex flex-row items-center justify-between">
                <div className="space-y-0.5">
                  <CardTitle className="text-white text-lg font-medium">Course Enrollments by Category</CardTitle>
                  <p className="text-slate-400 text-sm">Distribution across subject areas</p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-700/50">
                  <FileSpreadsheet size={16} className="text-purple-500" />
                </Button>
              </CardHeader>
              <CardContent className="p-6 pt-5">
                <div className="h-[300px]">
                  {courseEnrollmentData && courseEnrollmentData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={courseEnrollmentData}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                          paddingAngle={2}
                        >
                          {courseEnrollmentData.map((item: CourseEnrollmentItem, index: number) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                              stroke="rgba(0,0,0,0.1)"
                              strokeWidth={1}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1e293b",
                            border: "1px solid #334155",
                            borderRadius: "8px",
                            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                            padding: "12px",
                            color: "#e2e8f0"
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-400">
                      No course enrollment data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700/50 overflow-hidden shadow-md">
              <CardHeader className="py-5 px-6 border-b border-slate-700/50 flex flex-row items-center justify-between">
                <div className="space-y-0.5">
                  <CardTitle className="text-white text-lg font-medium">Daily Active Users</CardTitle>
                  <p className="text-slate-400 text-sm">Platform engagement metrics</p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-700/50">
                  <FileSpreadsheet size={16} className="text-emerald-500" />
                </Button>
              </CardHeader>
              <CardContent className="p-6 pt-5">
                <div className="h-[300px]">
                  {courseActivityData && courseActivityData.length > 0 ? (
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
                        <defs>
                          <linearGradient id="activeUsersGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.6}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                        <XAxis 
                          dataKey="day" 
                          stroke="#94a3b8" 
                          tick={{fill: '#94a3b8'}}
                          axisLine={{ stroke: '#475569' }}
                          tickLine={{ stroke: '#475569' }}
                        />
                        <YAxis 
                          stroke="#94a3b8" 
                          tick={{fill: '#94a3b8'}}
                          axisLine={{ stroke: '#475569' }}
                          tickLine={{ stroke: '#475569' }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1e293b",
                            border: "1px solid #334155",
                            borderRadius: "8px",
                            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                            padding: "12px",
                            color: "#e2e8f0"
                          }}
                        />
                        <Bar 
                          dataKey="activeUsers" 
                          fill="url(#activeUsersGradient)" 
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-400">
                      No activity data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card className="bg-slate-800/50 border-slate-700/50 overflow-hidden shadow-md">
              <CardHeader className="py-5 px-6 border-b border-slate-700/50 flex flex-row items-center justify-between">
                <div className="space-y-0.5">
                  <CardTitle className="text-white text-lg font-medium">User Registration Trends</CardTitle>
                  <p className="text-slate-400 text-sm">New signups over time</p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-700/50">
                  <FileSpreadsheet size={16} className="text-blue-500" />
                </Button>
              </CardHeader>
              <CardContent className="p-6 pt-5">
                <div className="h-[300px]">
                  {registrationTrendData && registrationTrendData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={registrationTrendData}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <defs>
                          <linearGradient id="registrationGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                        <XAxis 
                          dataKey="date" 
                          stroke="#94a3b8" 
                          tick={{fill: '#94a3b8'}}
                          axisLine={{ stroke: '#475569' }}
                          tickLine={{ stroke: '#475569' }}
                        />
                        <YAxis 
                          stroke="#94a3b8" 
                          tick={{fill: '#94a3b8'}}
                          axisLine={{ stroke: '#475569' }}
                          tickLine={{ stroke: '#475569' }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1e293b",
                            border: "1px solid #334155",
                            borderRadius: "8px",
                            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                            padding: "12px",
                            color: "#e2e8f0"
                          }}
                          formatter={(value) => [`${value} new users`, 'Registrations']}
                          labelFormatter={(label) => `Date: ${label}`}
                        />
                        <Line
                          type="monotone"
                          dataKey="registrations"
                          stroke="#3b82f6"
                          strokeWidth={3}
                          dot={{fill: '#3b82f6', r: 4, strokeWidth: 0}}
                          activeDot={{fill: '#60a5fa', r: 6, stroke: '#3b82f6', strokeWidth: 2}}
                          name="New Users"
                          fillOpacity={0.2}
                          fill="url(#registrationGradient)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-400">
                      No registration data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/50 border-slate-700/50 overflow-hidden shadow-md">
              <CardHeader className="py-5 px-6 border-b border-slate-700/50 flex flex-row items-center justify-between">
                <div className="space-y-0.5">
                  <CardTitle className="text-white text-lg font-medium">User Role Distribution</CardTitle>
                  <p className="text-slate-400 text-sm">Breakdown by user types</p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-700/50">
                  <FileSpreadsheet size={16} className="text-blue-500" />
                </Button>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-[300px] flex items-center justify-center">
                  {userTypesData && userTypesData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={userTypesData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={120}
                          innerRadius={60}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          paddingAngle={3}
                        >
                          {userTypesData.map((item: { name: string, value: number }, index: number) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1e293b",
                            border: "1px solid #334155",
                            borderRadius: "8px",
                            color: "#e2e8f0"
                          }}
                          formatter={(value: any, name: any) => [`${value} users`, name]}
                        />
                        <Legend
                          verticalAlign="bottom"
                          height={36}
                          formatter={(value: any, entry: any, index: any) => (
                            <span style={{ color: '#94a3b8' }}>{value}</span>
                          )}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-slate-400">
                      No user distribution data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="courses" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card className="bg-slate-800/50 border-slate-700/50 overflow-hidden shadow-md">
              <CardHeader className="py-5 px-6 border-b border-slate-700/50 flex flex-row items-center justify-between">
                <div className="space-y-0.5">
                  <CardTitle className="text-white text-lg font-medium">Course Creation Trend</CardTitle>
                  <p className="text-slate-400 text-sm">Course creation trends over time</p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-700/50">
                  <FileSpreadsheet size={16} className="text-green-500" />
                </Button>
              </CardHeader>
              <CardContent className="p-6 pt-5">
                <div className="h-[300px]">
                  {courseCreationTrend && courseCreationTrend.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={courseCreationTrend}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <defs>
                          <linearGradient id="courseGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                        <XAxis 
                          dataKey="date" 
                          stroke="#94a3b8" 
                          tick={{fill: '#94a3b8'}}
                          axisLine={{ stroke: '#475569' }}
                          tickLine={{ stroke: '#475569' }}
                        />
                        <YAxis 
                          stroke="#94a3b8" 
                          tick={{fill: '#94a3b8'}}
                          axisLine={{ stroke: '#475569' }}
                          tickLine={{ stroke: '#475569' }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1e293b",
                            border: "1px solid #334155",
                            borderRadius: "8px",
                            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                            padding: "12px",
                            color: "#e2e8f0"
                          }}
                          formatter={(value: any) => [`${value} courses`, 'New Courses']}
                          labelFormatter={(label) => `Date: ${label}`}
                        />
                        <Area
                          type="monotone"
                          dataKey="courses"
                          stroke="#10b981"
                          strokeWidth={3}
                          fillOpacity={0.3}
                          fill="url(#courseGradient)"
                          dot={{fill: '#10b981', r: 4, strokeWidth: 0}}
                          activeDot={{fill: '#34d399', r: 6, stroke: '#10b981', strokeWidth: 2}}
                          name="Courses"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-400">
                      No course creation data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700/50 overflow-hidden shadow-md">
              <CardHeader className="py-5 px-6 border-b border-slate-700/50 flex flex-row items-center justify-between">
                <div className="space-y-0.5">
                  <CardTitle className="text-white text-lg font-medium">Completion Rates by Category</CardTitle>
                  <p className="text-slate-400 text-sm">Completion rates across course categories</p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-700/50">
                  <FileSpreadsheet size={16} className="text-purple-500" />
                </Button>
              </CardHeader>
              <CardContent className="p-6 pt-5">
                <div className="h-[300px]">
                  {completionRates && completionRates.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        layout="vertical"
                        data={completionRates}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 100,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                        <XAxis 
                          type="number" 
                          domain={[0, 100]}
                          stroke="#94a3b8" 
                          tick={{fill: '#94a3b8'}}
                          axisLine={{ stroke: '#475569' }}
                          tickLine={{ stroke: '#475569' }}
                          tickFormatter={(value) => `${value}%`}
                        />
                        <YAxis 
                          dataKey="category" 
                          type="category"
                          stroke="#94a3b8" 
                          tick={{fill: '#94a3b8'}}
                          axisLine={{ stroke: '#475569' }}
                          tickLine={{ stroke: '#475569' }}
                          width={80}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1e293b",
                            border: "1px solid #334155",
                            borderRadius: "8px",
                            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                            padding: "12px",
                            color: "#e2e8f0"
                          }}
                          formatter={(value: any) => [`${value}%`, 'Completion Rate']}
                        />
                        <Bar 
                          dataKey="rate" 
                          fill="#a855f7" 
                          radius={[0, 4, 4, 0]}
                          barSize={20}
                          name="Completion Rate"
                        >
                          {completionRates.map((entry: any, index: number) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={`rgba(168, 85, 247, ${0.5 + (entry.rate / 200)})`} 
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-400">
                      No completion rate data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card className="bg-slate-800/50 border-slate-700/50 overflow-hidden shadow-md">
              <CardHeader className="py-5 px-6 border-b border-slate-700/50 flex flex-row items-center justify-between">
                <div className="space-y-0.5">
                  <CardTitle className="text-white text-lg font-medium">Revenue Distribution</CardTitle>
                  <p className="text-slate-400 text-sm">Revenue distribution across course categories</p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-700/50">
                  <FileSpreadsheet size={16} className="text-amber-500" />
                </Button>
              </CardHeader>
              <CardContent className="p-6 pt-5">
                <div className="h-[300px]">
                  {revenueByCategoryData && revenueByCategoryData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={revenueByCategoryData}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                        <XAxis 
                          dataKey="category" 
                          stroke="#94a3b8" 
                          tick={{fill: '#94a3b8'}}
                          axisLine={{ stroke: '#475569' }}
                          tickLine={{ stroke: '#475569' }}
                          interval={0}
                          angle={-45}
                          textAnchor="end"
                          height={60}
                          tickMargin={5}
                        />
                        <YAxis 
                          stroke="#94a3b8" 
                          tick={{fill: '#94a3b8'}}
                          axisLine={{ stroke: '#475569' }}
                          tickLine={{ stroke: '#475569' }}
                          tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1e293b",
                            border: "1px solid #334155",
                            borderRadius: "8px",
                            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                            padding: "12px",
                            color: "#e2e8f0"
                          }}
                          formatter={(value: any) => [`$${(value / 1000000).toFixed(2)}M`, 'Revenue']}
                        />
                        <Bar 
                          dataKey="value" 
                          fill="#f59e0b"
                          name="Revenue"
                          radius={[4, 4, 0, 0]}
                          barSize={30}
                        >
                          {revenueByCategoryData.map((entry: any, index: number) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={`rgba(245, 158, 11, ${0.6 + (index * 0.05)})`} 
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-400">
                      No revenue distribution data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700/50 overflow-hidden shadow-md">
              <CardHeader className="py-5 px-6 border-b border-slate-700/50 flex flex-row items-center justify-between">
                <div className="space-y-0.5">
                  <CardTitle className="text-white text-lg font-medium">Revenue Forecast</CardTitle>
                  <p className="text-slate-400 text-sm">Revenue forecast for the next year</p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-700/50">
                  <FileSpreadsheet size={16} className="text-amber-500" />
                </Button>
              </CardHeader>
              <CardContent className="p-6 pt-5">
                <div className="h-[300px]">
                  {revenueForecastData && revenueForecastData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={revenueForecastData}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <defs>
                          <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                        <XAxis 
                          dataKey="month" 
                          stroke="#94a3b8" 
                          tick={{fill: '#94a3b8'}}
                          axisLine={{ stroke: '#475569' }}
                          tickLine={{ stroke: '#475569' }}
                        />
                        <YAxis 
                          stroke="#94a3b8" 
                          tick={{fill: '#94a3b8'}}
                          axisLine={{ stroke: '#475569' }}
                          tickLine={{ stroke: '#475569' }}
                          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1e293b",
                            border: "1px solid #334155",
                            borderRadius: "8px",
                            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                            padding: "12px",
                            color: "#e2e8f0"
                          }}
                          formatter={(value: any) => {
                            if (value === null) return ['-', ''];
                            return [`$${(value / 1000).toFixed(1)}k`, ''];
                          }}
                        />
                        <Legend 
                          verticalAlign="top"
                          height={36}
                          wrapperStyle={{
                            paddingBottom: '10px',
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="forecasted"
                          stroke="#f59e0b"
                          strokeWidth={2}
                          dot={{fill: '#f59e0b', r: 4, strokeWidth: 0}}
                          activeDot={{fill: '#fbbf24', r: 6, stroke: '#f59e0b', strokeWidth: 2}}
                          name="Forecasted Revenue"
                          fillOpacity={0.2}
                          fill="url(#forecastGradient)"
                          strokeDasharray="5 5"
                        />
                        <Area
                          type="monotone"
                          dataKey="actual"
                          stroke="#14b8a6"
                          strokeWidth={3}
                          dot={{fill: '#14b8a6', r: 4, strokeWidth: 0}}
                          activeDot={{fill: '#5eead4', r: 6, stroke: '#14b8a6', strokeWidth: 2}}
                          name="Actual Revenue"
                          fillOpacity={0.2}
                          fill="url(#actualGradient)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-400">
                      No revenue forecast data available
                    </div>
                  )}
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