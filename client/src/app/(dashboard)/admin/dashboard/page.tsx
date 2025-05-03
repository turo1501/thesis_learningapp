"use client";

import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
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
  CheckCircle
} from "lucide-react";
import Link from "next/link";
import React, { useEffect } from "react";
import { useGetDashboardStatsQuery, useGetPendingActionsQuery, useGetMonthlyRevenueQuery, useGetRecentUserActivitiesQuery } from "@/state/api";
import Loading from "@/components/Loading";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateTime, formatRelativeTime } from "@/lib/utils";

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

const AdminDashboard = () => {
  // Fetch real data from API
  const { data: dashboardStats, isLoading: isStatsLoading } = useGetDashboardStatsQuery();
  const { data: pendingActions, isLoading: isPendingLoading } = useGetPendingActionsQuery();
  const { data: monthlyRevenue, isLoading: isRevenueLoading } = useGetMonthlyRevenueQuery();
  const { data: recentActivities, isLoading: isActivitiesLoading } = useGetRecentUserActivitiesQuery();

  // Debug log to check API responses
  useEffect(() => {
    if (dashboardStats) {
      console.log("Dashboard stats:", dashboardStats);
    }
    if (pendingActions) {
      console.log("Pending actions:", pendingActions);
    }
    if (monthlyRevenue) {
      console.log("Monthly revenue:", monthlyRevenue);
    }
    if (recentActivities) {
      console.log("Recent activities:", recentActivities);
    }
  }, [dashboardStats, pendingActions, monthlyRevenue, recentActivities]);

  // Show loading state while data is being fetched
  if (isStatsLoading || isPendingLoading || isRevenueLoading || isActivitiesLoading) {
    return <Loading />;
  }

  // Format the stats data from API
  const stats = [
    {
      title: "Total Users",
      value: dashboardStats?.data?.users?.total.toLocaleString() || "0",
      icon: <CircleUser className="h-8 w-8" />,
      change: dashboardStats?.data?.users?.growth || "+0%",
      link: "/admin/user-management",
    },
    {
      title: "Total Courses",
      value: dashboardStats?.data?.courses?.total.toLocaleString() || "0",
      icon: <BookOpen className="h-8 w-8" />,
      change: dashboardStats?.data?.courses?.growth || "+0%",
      link: "/admin/courses",
    },
    {
      title: "Blog Posts",
      value: dashboardStats?.data?.blogPosts?.total.toLocaleString() || "0",
      icon: <FileText className="h-8 w-8" />,
      change: dashboardStats?.data?.blogPosts?.growth || "+0%",
      link: "/admin/blog-approval",
    },
    {
      title: "Revenue",
      value: `$${dashboardStats?.data?.revenue?.total.toLocaleString() || "0"}`,
      icon: <DollarSign className="h-8 w-8" />,
      change: dashboardStats?.data?.revenue?.growth || "+0%",
      link: "/admin/analytics",
    },
  ];

  // Get pending actions data from API
  const pendingActionItems = [
    {
      title: "Blog Posts Awaiting Approval",
      count: pendingActions?.data?.pendingPosts || 0,
      link: "/admin/blog-approval",
    },
    {
      title: "New User Registrations",
      count: pendingActions?.data?.newUsers || 0,
      link: "/admin/user-management",
    },
    {
      title: "New Courses Submissions",
      count: pendingActions?.data?.newCourses || 0,
      link: "/admin/courses",
    },
  ];

  // Get monthly revenue data for chart
  const revenueData = monthlyRevenue?.data || [];

  // Format activity data
  const activities = recentActivities?.data?.slice(0, 5) || [];

  return (
    <div className="admin-dashboard">
      <Header
        title="Admin Dashboard"
        subtitle="Manage platform operations and monitor key metrics"
        rightElement={
          <Link href="/admin/analytics">
            <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
              <TrendingUp size={16} />
              <span>Detailed Analytics</span>
            </button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Link href={stat.link} key={index} className="block">
            <Card className="p-6 hover:shadow-md transition-shadow bg-gradient-to-br from-slate-800 to-slate-900 text-white border-slate-700">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-slate-400">{stat.title}</p>
                  <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full mt-2 inline-block ${stat.change.startsWith('+') ? 'bg-green-900/40 text-green-400' : 'bg-red-900/40 text-red-400'}`}>
                    {stat.change}
                  </span>
                </div>
                <div className="p-3 bg-slate-700/50 rounded-lg">
                  {stat.icon}
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="p-6 bg-slate-900 border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Pending Actions</h2>
            <ShieldCheck className="h-5 w-5 text-orange-500" />
          </div>
          <div className="space-y-4">
            {pendingActionItems.map((action, index) => (
              <Link href={action.link} key={index}>
                <div className="flex items-center justify-between p-3 hover:bg-slate-800 rounded-md transition-colors cursor-pointer">
                  <span className="text-slate-300">{action.title}</span>
                  <span className="bg-orange-600/20 text-orange-500 text-xs font-medium px-2 py-1 rounded-full">
                    {action.count}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </Card>

        <Card className="p-6 bg-slate-900 border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Monthly Revenue</h2>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <div className="h-64">
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
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="month" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip 
                    formatter={(value) => [`$${value}`, 'Revenue']}
                    contentStyle={{
                      backgroundColor: "#1e1e1e",
                      border: "1px solid #333",
                      borderRadius: "4px",
                    }}
                  />
                  <Bar dataKey="revenue" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-500">
                Loading revenue data...
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 mb-8">
        <Card className="p-6 bg-slate-900 border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recent User Activities</h2>
            <CircleUser className="h-5 w-5 text-blue-500" />
          </div>
          <div className="space-y-4">
            {activities && activities.length > 0 ? (
              activities.map((activity: UserActivity, index: number) => (
                <div key={index} className="p-3 hover:bg-slate-800 rounded-md transition-colors border border-transparent hover:border-slate-700">
                  <div className="flex justify-between items-center gap-2">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 ${
                        activity.type === 'enrollment' ? 'bg-green-900/70' :
                        activity.type === 'blog' ? 'bg-purple-900/70' :
                        activity.type === 'payment' ? 'bg-yellow-900/70' :
                        activity.type === 'login' ? 'bg-blue-900/70' :
                        activity.type === 'registration' ? 'bg-emerald-900/70' :
                        'bg-slate-700'
                      }`}>
                        {activity.type === 'enrollment' && <BookOpen size={16} />}
                        {activity.type === 'blog' && <FileText size={16} />}
                        {activity.type === 'payment' && <DollarSign size={16} />}
                        {activity.type === 'login' && <LogIn size={16} />}
                        {activity.type === 'registration' && <UserPlus size={16} />}
                        {activity.type === 'course_completion' && <CheckCircle size={16} />}
                        {!['enrollment', 'blog', 'payment', 'login', 'registration', 'course_completion'].includes(activity.type) && <Activity size={16} />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-slate-300 font-medium truncate">{activity.user?.name || 'Unknown User'}</p>
                          {activity.user?.role && (
                            <Badge className={`
                              ${activity.user.role === 'admin' ? 'bg-red-900/30 text-red-400' : 
                                activity.user.role === 'teacher' ? 'bg-yellow-900/30 text-yellow-400' : 
                                  'bg-blue-900/30 text-blue-400'}
                            `}>
                              {activity.user.role}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 truncate">
                          {activity.type === 'enrollment' && (
                            <span>Enrolled in <span className="text-green-400">{activity.data?.courseTitle || 'a course'}</span></span>
                          )}
                          {activity.type === 'blog' && (
                            <span>Created blog post: <span className="text-purple-400">{activity.data?.title || 'Untitled'}</span></span>
                          )}
                          {activity.type === 'payment' && (
                            <span>Made a payment of <span className="text-yellow-400">${activity.data?.amount || 0}</span> for {activity.data?.purpose || 'course'}</span>
                          )}
                          {activity.type === 'login' && (
                            <span>Logged in from <span className="text-blue-400">{activity.data?.device || 'unknown device'}</span></span>
                          )}
                          {activity.type === 'registration' && (
                            <span>Registered a new account</span>
                          )}
                          {activity.type === 'course_completion' && (
                            <span>Completed course <span className="text-emerald-400">{activity.data?.courseTitle || 'Unknown'}</span></span>
                          )}
                          {!['enrollment', 'blog', 'payment', 'login', 'registration', 'course_completion'].includes(activity.type) && (
                            <span>{activity.type.replace('_', ' ')} activity</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs text-slate-500 whitespace-nowrap">
                        {formatRelativeTime(new Date(activity.date))}
                      </span>
                      <Badge variant="outline" className="bg-slate-800/50">
                        {formatDateTime(new Date(activity.date))}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-slate-500 py-10">
                <Activity className="h-10 w-10 mx-auto mb-2 opacity-60" />
                <p>No recent activities found</p>
              </div>
            )}
            {activities && activities.length > 0 && (
              <div className="pt-3 text-center border-t border-slate-800">
                <Link href="/admin/activity-logs">
                  <Button variant="outline" className="text-blue-400 hover:text-blue-300 border-slate-700 hover:bg-slate-800">
                    View All Activities
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
            </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
