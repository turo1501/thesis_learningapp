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
} from "recharts";
import { Users, BookOpen, DollarSign, ArrowUpRight } from "lucide-react";
import Header from "@/components/Header";

// Sample data for demonstration
const userActivityData = [
  { name: "Jan", students: 400, teachers: 240 },
  { name: "Feb", students: 300, teachers: 139 },
  { name: "Mar", students: 200, teachers: 980 },
  { name: "Apr", students: 278, teachers: 390 },
  { name: "May", students: 189, teachers: 480 },
  { name: "Jun", students: 239, teachers: 380 },
  { name: "Jul", students: 349, teachers: 430 },
];

const revenueData = [
  { name: "Jan", amount: 4000 },
  { name: "Feb", amount: 3000 },
  { name: "Mar", amount: 5000 },
  { name: "Apr", amount: 2780 },
  { name: "May", amount: 1890 },
  { name: "Jun", amount: 2390 },
  { name: "Jul", amount: 3490 },
];

const AdminDashboard = () => {
  return (
    <div className="space-y-6">
      <Header 
        title="Admin Dashboard" 
        subtitle="Overview of your learning platform"
      />

      {/* Key Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-customgreys-secondarybg border-none shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-customgreys-dirtyGrey">
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">1,284</div>
              <div className="p-2 bg-green-500/20 rounded-full">
                <Users className="h-5 w-5 text-green-500" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-green-500 text-sm">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              <span>12% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-customgreys-secondarybg border-none shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-customgreys-dirtyGrey">
              Total Courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">346</div>
              <div className="p-2 bg-blue-500/20 rounded-full">
                <BookOpen className="h-5 w-5 text-blue-500" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-green-500 text-sm">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              <span>8% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-customgreys-secondarybg border-none shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-customgreys-dirtyGrey">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">$143,289</div>
              <div className="p-2 bg-indigo-500/20 rounded-full">
                <DollarSign className="h-5 w-5 text-indigo-500" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-green-500 text-sm">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              <span>23% from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-customgreys-secondarybg border-none shadow-md">
          <CardHeader>
            <CardTitle>User Activity</CardTitle>
            <CardDescription>
              Monthly user activity by role
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={userActivityData}
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
                  />
                  <Legend />
                  <Bar dataKey="students" fill="#8884d8" name="Students" />
                  <Bar dataKey="teachers" fill="#82ca9d" name="Teachers" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-customgreys-secondarybg border-none shadow-md">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>
              Monthly revenue in USD
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={revenueData}
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
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    name="Revenue"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Table */}
      <Card className="bg-customgreys-secondarybg border-none shadow-md">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest actions across the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 font-medium">User</th>
                  <th className="text-left py-3 px-4 font-medium">Action</th>
                  <th className="text-left py-3 px-4 font-medium">Resource</th>
                  <th className="text-left py-3 px-4 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-700">
                  <td className="py-3 px-4">John Doe</td>
                  <td className="py-3 px-4">Purchased</td>
                  <td className="py-3 px-4">Advanced JavaScript Course</td>
                  <td className="py-3 px-4">Today, 10:25 AM</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-3 px-4">Sarah Smith</td>
                  <td className="py-3 px-4">Created</td>
                  <td className="py-3 px-4">Python for Beginners</td>
                  <td className="py-3 px-4">Yesterday, 2:40 PM</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-3 px-4">Robert Johnson</td>
                  <td className="py-3 px-4">Submitted</td>
                  <td className="py-3 px-4">Blog post for review</td>
                  <td className="py-3 px-4">Yesterday, 1:12 PM</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-3 px-4">Emily Davis</td>
                  <td className="py-3 px-4">Registered</td>
                  <td className="py-3 px-4">New account</td>
                  <td className="py-3 px-4">Apr 2, 2025</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Michael Brown</td>
                  <td className="py-3 px-4">Changed</td>
                  <td className="py-3 px-4">Role from Student to Teacher</td>
                  <td className="py-3 px-4">Apr 1, 2025</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard; 

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
} from "recharts";
import { Users, BookOpen, DollarSign, ArrowUpRight } from "lucide-react";
import Header from "@/components/Header";

// Sample data for demonstration
const userActivityData = [
  { name: "Jan", students: 400, teachers: 240 },
  { name: "Feb", students: 300, teachers: 139 },
  { name: "Mar", students: 200, teachers: 980 },
  { name: "Apr", students: 278, teachers: 390 },
  { name: "May", students: 189, teachers: 480 },
  { name: "Jun", students: 239, teachers: 380 },
  { name: "Jul", students: 349, teachers: 430 },
];

const revenueData = [
  { name: "Jan", amount: 4000 },
  { name: "Feb", amount: 3000 },
  { name: "Mar", amount: 5000 },
  { name: "Apr", amount: 2780 },
  { name: "May", amount: 1890 },
  { name: "Jun", amount: 2390 },
  { name: "Jul", amount: 3490 },
];

const AdminDashboard = () => {
  return (
    <div className="space-y-6">
      <Header 
        title="Admin Dashboard" 
        subtitle="Overview of your learning platform"
      />

      {/* Key Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-customgreys-secondarybg border-none shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-customgreys-dirtyGrey">
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">1,284</div>
              <div className="p-2 bg-green-500/20 rounded-full">
                <Users className="h-5 w-5 text-green-500" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-green-500 text-sm">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              <span>12% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-customgreys-secondarybg border-none shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-customgreys-dirtyGrey">
              Total Courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">346</div>
              <div className="p-2 bg-blue-500/20 rounded-full">
                <BookOpen className="h-5 w-5 text-blue-500" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-green-500 text-sm">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              <span>8% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-customgreys-secondarybg border-none shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-customgreys-dirtyGrey">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">$143,289</div>
              <div className="p-2 bg-indigo-500/20 rounded-full">
                <DollarSign className="h-5 w-5 text-indigo-500" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-green-500 text-sm">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              <span>23% from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-customgreys-secondarybg border-none shadow-md">
          <CardHeader>
            <CardTitle>User Activity</CardTitle>
            <CardDescription>
              Monthly user activity by role
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={userActivityData}
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
                  />
                  <Legend />
                  <Bar dataKey="students" fill="#8884d8" name="Students" />
                  <Bar dataKey="teachers" fill="#82ca9d" name="Teachers" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-customgreys-secondarybg border-none shadow-md">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>
              Monthly revenue in USD
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={revenueData}
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
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    name="Revenue"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Table */}
      <Card className="bg-customgreys-secondarybg border-none shadow-md">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest actions across the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 font-medium">User</th>
                  <th className="text-left py-3 px-4 font-medium">Action</th>
                  <th className="text-left py-3 px-4 font-medium">Resource</th>
                  <th className="text-left py-3 px-4 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-700">
                  <td className="py-3 px-4">John Doe</td>
                  <td className="py-3 px-4">Purchased</td>
                  <td className="py-3 px-4">Advanced JavaScript Course</td>
                  <td className="py-3 px-4">Today, 10:25 AM</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-3 px-4">Sarah Smith</td>
                  <td className="py-3 px-4">Created</td>
                  <td className="py-3 px-4">Python for Beginners</td>
                  <td className="py-3 px-4">Yesterday, 2:40 PM</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-3 px-4">Robert Johnson</td>
                  <td className="py-3 px-4">Submitted</td>
                  <td className="py-3 px-4">Blog post for review</td>
                  <td className="py-3 px-4">Yesterday, 1:12 PM</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-3 px-4">Emily Davis</td>
                  <td className="py-3 px-4">Registered</td>
                  <td className="py-3 px-4">New account</td>
                  <td className="py-3 px-4">Apr 2, 2025</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Michael Brown</td>
                  <td className="py-3 px-4">Changed</td>
                  <td className="py-3 px-4">Role from Student to Teacher</td>
                  <td className="py-3 px-4">Apr 1, 2025</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard; 