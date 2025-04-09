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
} from "lucide-react";
import Link from "next/link";
import React from "react";

const AdminDashboard = () => {
  const stats = [
    {
      title: "Total Users",
      value: "4,235",
      icon: <CircleUser className="h-8 w-8" />,
      change: "+12%",
      link: "/admin/user-management",
    },
    {
      title: "Total Courses",
      value: "845",
      icon: <BookOpen className="h-8 w-8" />,
      change: "+7.2%",
      link: "/admin/courses",
    },
    {
      title: "Blog Posts",
      value: "325",
      icon: <FileText className="h-8 w-8" />,
      change: "+14.6%",
      link: "/admin/blog-approval",
    },
    {
      title: "Revenue",
      value: "$41,282",
      icon: <DollarSign className="h-8 w-8" />,
      change: "+22.5%",
      link: "/admin/analytics",
    },
  ];

  const pendingActions = [
    {
      title: "Blog Posts Awaiting Approval",
      count: 15,
      link: "/admin/blog-approval",
    },
    {
      title: "New User Registrations",
      count: 32,
      link: "/admin/user-management",
    },
    {
      title: "New Courses Submissions",
      count: 8,
      link: "/admin/courses",
    },
  ];

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
                  <span className="text-xs font-medium bg-green-900/40 text-green-400 px-2 py-1 rounded-full mt-2 inline-block">
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
            {pendingActions.map((action, index) => (
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
          <div className="h-64 flex items-center justify-center">
            <div className="w-full h-full bg-slate-800/50 rounded-md flex items-center justify-center text-slate-500">
              Revenue chart will be displayed here
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 mb-8">
        <Card className="p-6 bg-slate-900 border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recent User Activities</h2>
            <CircleUser className="h-5 w-5 text-blue-500" />
          </div>
          <div className="h-64 flex items-center justify-center">
            <div className="w-full h-full bg-slate-800/50 rounded-md flex items-center justify-center text-slate-500">
              User activity timeline will be displayed here
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
