"use client";

import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CircleUser,
  BookOpen,
  FileText,
  ShieldCheck,
  TrendingUp,
  DollarSign,
  Activity,
  ChevronRight,
  LogIn,
  UserPlus,
  CheckCircle,
  FileSpreadsheet,
  AlertTriangle,
  Users,
  Bell,
  BarChart4,
  Layers
} from "lucide-react";
import {
  Legend
} from "recharts";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useGetDashboardStatsQuery, useGetPendingActionsQuery, useGetMonthlyRevenueQuery, useGetRecentUserActivitiesQuery, useGetUserAnalyticsQuery } from "@/state/api";
import Loading from "@/components/Loading";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateTime, formatRelativeTime } from "@/lib/utils";
import APIErrorMessage from "@/components/APIErrorMessage";

// Define interface for UserActivity
interface UserActivity {
  type: string;
  user?: {
    name: string;
    imageUrl?: string | null;
    role?: string;
  };
  date: string;
  data?: any;
}

// Define interface for UserGrowth data
interface UserGrowthData {
  month: string;
  students: number;
  teachers: number;
}

const AdminDashboard = () => {
  // Time range state for analytics
  const [timeRange, setTimeRange] = useState("6months");
  
  // State to track data loading errors
  const [dataErrors, setDataErrors] = useState<string[]>([]);

  // Fetch real data from API with better error handling
  const { 
    data: dashboardStats, 
    isLoading: isStatsLoading,
    error: statsError
  } = useGetDashboardStatsQuery();
  
  const { 
    data: pendingActions, 
    isLoading: isPendingLoading,
    error: pendingError
  } = useGetPendingActionsQuery();
  
  const { 
    data: monthlyRevenue, 
    isLoading: isRevenueLoading,
    error: revenueError
  } = useGetMonthlyRevenueQuery();
  
  const { 
    data: recentActivities, 
    isLoading: isActivitiesLoading,
    error: activitiesError
  } = useGetRecentUserActivitiesQuery();
  
  // Fetch user analytics data for user growth chart
  const {
    data: userAnalytics,
    isLoading: isUserAnalyticsLoading,
    error: userAnalyticsError
  } = useGetUserAnalyticsQuery(timeRange);

  // Track and collect errors
  useEffect(() => {
    const errors = [];
    if (statsError) errors.push("Failed to load dashboard statistics");
    if (pendingError) errors.push("Failed to load pending actions");
    if (revenueError) errors.push("Failed to load revenue data");
    if (activitiesError) errors.push("Failed to load recent activities");
    if (userAnalyticsError) errors.push("Failed to load user analytics data");
    
    setDataErrors(errors);
  }, [statsError, pendingError, revenueError, activitiesError, userAnalyticsError]);

  // Show loading state while data is being fetched
  if (isStatsLoading || isPendingLoading || isRevenueLoading || isActivitiesLoading || isUserAnalyticsLoading) {
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

  // Extract stats data from response
  const statsData = dashboardStats || {};
  
  // Format the stats data from API with additional safety
  const stats = [
    {
      title: "Total Users",
      value: getNestedProperty(statsData, 'users.total', 0).toLocaleString(),
      icon: <CircleUser className="h-5 w-5" />,
      change: getNestedProperty(statsData, 'users.growth', '+0%'),
      changeValue: getNestedProperty(statsData, 'users.growthValue', 0),
      link: "/admin/user-management",
      color: "from-blue-600/20 to-blue-700/20 text-blue-500"
    },
    {
      title: "Total Courses",
      value: getNestedProperty(statsData, 'courses.total', 0).toLocaleString(),
      icon: <BookOpen className="h-5 w-5" />,
      change: getNestedProperty(statsData, 'courses.growth', '+0%'),
      changeValue: getNestedProperty(statsData, 'courses.growthValue', 0),
      link: "/admin/courses",
      color: "from-emerald-600/20 to-emerald-700/20 text-emerald-500"
    },
    {
      title: "Blog Posts",
      value: getNestedProperty(statsData, 'blogPosts.total', 0).toLocaleString(),
      icon: <FileText className="h-5 w-5" />,
      change: getNestedProperty(statsData, 'blogPosts.growth', '+0%'),
      changeValue: getNestedProperty(statsData, 'blogPosts.growthValue', 0),
      link: "/admin/blog-approval",
      color: "from-purple-600/20 to-purple-700/20 text-purple-500"
    },
    {
      title: "Revenue",
      value: `$${getNestedProperty(statsData, 'revenue.total', 0).toLocaleString()}`,
      icon: <DollarSign className="h-5 w-5" />,
      change: getNestedProperty(statsData, 'revenue.growth', '+0%'),
      changeValue: getNestedProperty(statsData, 'revenue.growthValue', 0),
      link: "/admin/analytics",
      color: "from-amber-600/20 to-amber-700/20 text-amber-500"
    },
  ];

  // Extract pending actions data
  const pendingActionsData = pendingActions || {};
  
  // Get pending actions data from API with safety checks
  const pendingActionItems = [
    {
      title: "Blog Posts Awaiting Approval",
      count: getNestedProperty(pendingActionsData, 'pendingPosts', 0),
      link: "/admin/blog-approval",
      icon: <FileText className="h-4 w-4" />,
      color: "text-purple-500 bg-purple-500/10"
    },
    {
      title: "New User Registrations",
      count: getNestedProperty(pendingActionsData, 'newUsers', 0),
      link: "/admin/user-management",
      icon: <UserPlus className="h-4 w-4" />,
      color: "text-blue-500 bg-blue-500/10"
    },
    {
      title: "New Courses Submissions",
      count: getNestedProperty(pendingActionsData, 'newCourses', 0),
      link: "/admin/courses",
      icon: <BookOpen className="h-4 w-4" />,
      color: "text-emerald-500 bg-emerald-500/10"
    },
  ];

  // Get user growth data for chart with safety
  const userGrowthData = Array.isArray(getNestedProperty(userAnalytics, 'userGrowth', [])) 
    ? getNestedProperty(userAnalytics, 'userGrowth', []) 
    : [];

  // Format activity data with safety - ensure it's an array
  const activities = Array.isArray(recentActivities) ? recentActivities.slice(0, 5) : [];

  return (
    <div className="admin-dashboard px-1 md:px-4">
      <Header
        title="Admin Dashboard"
        subtitle="Manage platform operations and monitor key metrics"
        rightElement={
          <Link href="/admin/analytics">
            <button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-2.5 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg">
              <BarChart4 size={16} />
              <span className="font-medium">Detailed Analytics</span>
            </button>
          </Link>
        }
      />

      {/* Display any data errors */}
      <APIErrorMessage errors={dataErrors} />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        {stats.map((stat, index) => (
          <Link href={stat.link} key={index} className="block">
            <Card className="overflow-hidden bg-slate-800/50 hover:bg-slate-800/70 border-slate-700/50 hover:border-slate-700 transition-all duration-300 shadow-md hover:shadow-lg">
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color}`}>
                    {stat.icon}
                  </div>
                  <div className={`flex items-center text-xs font-medium px-2.5 py-1 rounded-full ${
                    isPositive(stat.changeValue) 
                      ? 'bg-green-500/10 text-green-400' 
                      : 'bg-red-500/10 text-red-400'
                  }`}>
                    {stat.change}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-400 mb-1">{stat.title}</p>
                  <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
                </div>
              </div>
              <div className={`h-1 w-full bg-gradient-to-r ${stat.color}`}></div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-6">
        {/* User Growth Chart */}
        <Card className="lg:col-span-8 bg-slate-800/50 border-slate-700/50 overflow-hidden shadow-md">
          <CardHeader className="py-5 px-6 border-b border-slate-700/50 flex flex-row items-center justify-between">
            <div className="space-y-0.5">
              <CardTitle className="text-white text-lg font-medium">User Growth</CardTitle>
              <p className="text-slate-400 text-sm">Student and teacher growth trends</p>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-5">
            <div className="h-[300px]">
              {userGrowthData && userGrowthData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={userGrowthData}>
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
                        borderColor: "#334155",
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
                <div className="h-full flex items-center justify-center">
                  <p className="text-slate-400">No user growth data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pending Actions */}
        <Card className="lg:col-span-4 bg-slate-800/50 border-slate-700/50 overflow-hidden shadow-md">
          <CardHeader className="py-5 px-6 border-b border-slate-700/50 flex flex-row items-center justify-between">
            <div className="space-y-0.5">
              <CardTitle className="text-white text-lg font-medium">Pending Actions</CardTitle>
              <p className="text-slate-400 text-sm">Items requiring attention</p>
            </div>
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-500/10">
              <Bell className="h-4 w-4 text-orange-500" />
          </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-700/50">
            {pendingActionItems.map((action, index) => (
              <Link href={action.link} key={index}>
                  <div className="flex items-center justify-between p-5 hover:bg-slate-700/20 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${action.color}`}>
                        {action.icon}
                      </div>
                      <span className="text-slate-300 font-medium">{action.title}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="bg-orange-600/20 text-orange-400 text-xs font-medium px-2.5 py-1 rounded-full">
                    {action.count}
                  </span>
                      <ChevronRight className="h-4 w-4 text-slate-500" />
                    </div>
                </div>
              </Link>
            ))}
          </div>
            <div className="p-5 border-t border-slate-700/50">
              <Link href="/admin/activity-logs">
                <Button variant="outline" className="w-full bg-slate-700/20 border-slate-600/50 hover:bg-slate-700/40 text-slate-300 flex items-center justify-center gap-2">
                  <Activity className="h-4 w-4" />
                  <span>View All Activities</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent User Activities */}
      <Card className="mb-8 bg-slate-800/50 border-slate-700/50 overflow-hidden shadow-md">
        <CardHeader className="py-5 px-6 border-b border-slate-700/50 flex flex-row items-center justify-between">
          <div className="space-y-0.5">
            <CardTitle className="text-white text-lg font-medium">Recent User Activities</CardTitle>
            <p className="text-slate-400 text-sm">Latest platform interactions</p>
          </div>
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/10">
            <Layers className="h-4 w-4 text-blue-500" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
            {activities && activities.length > 0 ? (
            <div className="divide-y divide-slate-700/30">
              {activities.map((activity: UserActivity, index: number) => (
                <div key={index} className="p-5 hover:bg-slate-700/20 transition-colors">
                  <div className="flex justify-between items-center gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 ${
                        activity.type === 'enrollment' ? 'bg-gradient-to-br from-green-600 to-green-700' :
                        activity.type === 'blog' ? 'bg-gradient-to-br from-purple-600 to-purple-700' :
                        activity.type === 'payment' ? 'bg-gradient-to-br from-amber-600 to-amber-700' :
                        activity.type === 'login' ? 'bg-gradient-to-br from-blue-600 to-blue-700' :
                        activity.type === 'registration' ? 'bg-gradient-to-br from-emerald-600 to-emerald-700' :
                        activity.type === 'course_completion' ? 'bg-gradient-to-br from-cyan-600 to-cyan-700' :
                        'bg-gradient-to-br from-slate-600 to-slate-700'
                      }`}>
                        {activity.type === 'enrollment' && <BookOpen size={18} />}
                        {activity.type === 'blog' && <FileText size={18} />}
                        {activity.type === 'payment' && <DollarSign size={18} />}
                        {activity.type === 'login' && <LogIn size={18} />}
                        {activity.type === 'registration' && <UserPlus size={18} />}
                        {activity.type === 'course_completion' && <CheckCircle size={18} />}
                        {!['enrollment', 'blog', 'payment', 'login', 'registration', 'course_completion'].includes(activity.type) && <Activity size={18} />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-slate-200 font-medium truncate">{activity.user?.name || 'Unknown User'}</p>
                          {activity.user?.role && (
                            <Badge className={`
                              ${activity.user.role === 'admin' ? 'bg-red-500/10 text-red-400 border-red-400/20' : 
                                activity.user.role === 'teacher' ? 'bg-amber-500/10 text-amber-400 border-amber-400/20' : 
                                  'bg-blue-500/10 text-blue-400 border-blue-400/20'}
                            `}>
                              {activity.user.role}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 truncate">
                          {activity.type === 'enrollment' && (
                            <span>Enrolled in <span className="text-green-400 font-medium">{activity.data?.courseTitle || 'a course'}</span></span>
                          )}
                          {activity.type === 'blog' && (
                            <span>Created blog post: <span className="text-purple-400 font-medium">{activity.data?.title || 'Untitled'}</span></span>
                          )}
                          {activity.type === 'payment' && (
                            <span>Made a payment of <span className="text-amber-400 font-medium">${activity.data?.amount || 0}</span> for {activity.data?.purpose || 'course'}</span>
                          )}
                          {activity.type === 'login' && (
                            <span>Logged in from <span className="text-blue-400 font-medium">{activity.data?.device || 'unknown device'}</span></span>
                          )}
                          {activity.type === 'registration' && (
                            <span>Registered a new account</span>
                          )}
                          {activity.type === 'course_completion' && (
                            <span>Completed course <span className="text-emerald-400 font-medium">{activity.data?.courseTitle || 'Unknown'}</span></span>
                          )}
                          {!['enrollment', 'blog', 'payment', 'login', 'registration', 'course_completion'].includes(activity.type) && (
                            <span>{activity.type.replace('_', ' ')} activity</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-xs text-slate-500 whitespace-nowrap">
                        {activity.date ? formatRelativeTime(new Date(activity.date)) : 'Unknown time'}
                      </span>
                      <Badge variant="outline" className="bg-slate-800/50 border-slate-700 text-slate-400 text-[10px]">
                        {activity.date ? formatDateTime(new Date(activity.date)) : 'N/A'}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            ) : (
              <div className="text-center text-slate-500 py-10">
              <Activity className="h-10 w-10 mx-auto mb-3 opacity-60" />
                <p>No recent activities found</p>
              </div>
            )}
            {activities && activities.length > 0 && (
            <div className="p-5 border-t border-slate-700/50 text-center">
                <Link href="/admin/activity-logs">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md hover:shadow-lg">
                    View All Activities
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
            </div>
            )}
        </CardContent>
        </Card>
    </div>
  );
};

export default AdminDashboard;
