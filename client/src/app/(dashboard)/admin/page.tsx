"use client";

import { useState } from "react";
import {
  Users,
  BookOpen,
  BookOpenCheck,
  FileText,
  Calendar,
  BarChart3,
  Settings,
  Search,
  Plus,
  ArrowUpRight,
  ArrowDown,
  ArrowUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Sample data (would come from API in a real implementation)
const STATS = {
  totalUsers: 1254,
  activeUsers: 876,
  totalCourses: 48,
  activeCourses: 32,
  pendingAssignments: 18,
  platformUptime: 99.8,
};

const RECENT_USERS = [
  {
    id: "user1",
    name: "Alexander Johnson",
    email: "alex.johnson@example.com",
    role: "Student",
    status: "active",
    lastActive: "2 hours ago",
  },
  {
    id: "user2",
    name: "Maria Garcia",
    email: "maria.garcia@example.com",
    role: "Teacher",
    status: "active",
    lastActive: "10 minutes ago",
  },
  {
    id: "user3",
    name: "Jamal Williams",
    email: "j.williams@example.com",
    role: "Student",
    status: "inactive",
    lastActive: "3 days ago",
  },
  {
    id: "user4",
    name: "Sarah Chen",
    email: "sarah.c@example.com",
    role: "Teacher",
    status: "active",
    lastActive: "1 hour ago",
  },
  {
    id: "user5",
    name: "David Rodriguez",
    email: "david.r@example.com",
    role: "Student",
    status: "active",
    lastActive: "Just now",
  },
];

const COURSES = [
  {
    id: "course1",
    title: "Introduction to Web Development",
    instructor: "Maria Garcia",
    students: 32,
    progress: 68,
    status: "active",
  },
  {
    id: "course2",
    title: "Advanced JavaScript Frameworks",
    instructor: "Sarah Chen",
    students: 28,
    progress: 45,
    status: "active",
  },
  {
    id: "course3",
    title: "Python for Data Science",
    instructor: "Jamal Williams",
    students: 45,
    progress: 72,
    status: "active",
  },
  {
    id: "course4",
    title: "UX/UI Design Fundamentals",
    instructor: "Alex Thompson",
    students: 22,
    progress: 33,
    status: "pending",
  },
  {
    id: "course5",
    title: "Mobile App Development with React Native",
    instructor: "Maria Garcia",
    students: 36,
    progress: 51,
    status: "active",
  },
];

const ACTIVITY_LOG = [
  {
    id: "act1",
    action: "User Registered",
    details: "New student account created",
    timestamp: "2 hours ago",
    user: "Emma Wilson",
  },
  {
    id: "act2",
    action: "Course Created",
    details: "New course 'Blockchain Fundamentals' added",
    timestamp: "Yesterday",
    user: "Admin",
  },
  {
    id: "act3",
    action: "Assignment Graded",
    details: "32 submissions graded for Web Development",
    timestamp: "Yesterday",
    user: "Maria Garcia",
  },
  {
    id: "act4",
    action: "System Update",
    details: "Platform updated to version 2.4.0",
    timestamp: "3 days ago",
    user: "System",
  },
  {
    id: "act5",
    action: "User Suspended",
    details: "Account temporarily suspended due to violations",
    timestamp: "4 days ago",
    user: "Admin",
  },
];

const USAGE_TRENDS = [
  { month: "Jan", students: 780, teachers: 42 },
  { month: "Feb", students: 810, teachers: 44 },
  { month: "Mar", students: 860, teachers: 48 },
  { month: "Apr", students: 880, teachers: 51 },
  { month: "May", students: 940, teachers: 55 },
  { month: "Jun", students: 980, teachers: 58 },
];

const AdminDashboard = () => {
  const [currentTab, setCurrentTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-400 mt-1">
            Manage users, courses, and platform settings
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search..."
              className="pl-10 w-[250px] bg-customgreys-secondarybg border-gray-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-customgreys-secondarybg border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-3xl font-bold">{STATS.totalUsers}</p>
                <p className="text-sm text-gray-400">
                  {STATS.activeUsers} active users
                </p>
              </div>
              <div className="p-4 bg-customgreys-primarybg rounded-full">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-green-500">
              <ArrowUp className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">12% increase</span>
              <span className="text-xs text-gray-400 ml-2">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-customgreys-secondarybg border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-3xl font-bold">{STATS.totalCourses}</p>
                <p className="text-sm text-gray-400">
                  {STATS.activeCourses} active courses
                </p>
              </div>
              <div className="p-4 bg-customgreys-primarybg rounded-full">
                <BookOpen className="h-6 w-6 text-green-500" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-green-500">
              <ArrowUp className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">8% increase</span>
              <span className="text-xs text-gray-400 ml-2">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-customgreys-secondarybg border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Pending Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-3xl font-bold">{STATS.pendingAssignments}</p>
                <p className="text-sm text-gray-400">Requiring attention</p>
              </div>
              <div className="p-4 bg-customgreys-primarybg rounded-full">
                <FileText className="h-6 w-6 text-amber-500" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-red-500">
              <ArrowDown className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">3 outstanding</span>
              <span className="text-xs text-gray-400 ml-2">for > 48 hours</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-customgreys-secondarybg border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-3xl font-bold">{STATS.platformUptime}%</p>
                <p className="text-sm text-gray-400">Uptime this month</p>
              </div>
              <div className="p-4 bg-customgreys-primarybg rounded-full">
                <BarChart3 className="h-6 w-6 text-purple-500" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between mb-1">
                <span className="text-xs text-gray-400">System load</span>
                <span className="text-xs font-medium">42%</span>
              </div>
              <Progress
                value={42}
                className="h-1"
                indicatorClassName="bg-purple-500"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs
        defaultValue="overview"
        value={currentTab}
        onValueChange={setCurrentTab}
      >
        <TabsList className="bg-customgreys-secondarybg border-b border-gray-700 rounded-none p-0 h-12">
          <TabsTrigger
            value="overview"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary-500 data-[state=active]:bg-transparent px-6"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="users"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary-500 data-[state=active]:bg-transparent px-6"
          >
            Users
          </TabsTrigger>
          <TabsTrigger
            value="courses"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary-500 data-[state=active]:bg-transparent px-6"
          >
            Courses
          </TabsTrigger>
          <TabsTrigger
            value="activity"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary-500 data-[state=active]:bg-transparent px-6"
          >
            Activity Log
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="bg-customgreys-secondarybg border-gray-700">
                <CardHeader>
                  <CardTitle>Platform Usage Trends</CardTitle>
                  <CardDescription>
                    Users active on the platform over the last 6 months
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-end justify-between gap-2">
                    {USAGE_TRENDS.map((month) => (
                      <div key={month.month} className="flex flex-col items-center">
                        <div className="flex flex-col items-center space-y-1 w-16">
                          <div
                            className="w-full bg-blue-500 rounded-t"
                            style={{
                              height: `${(month.students / 1000) * 200}px`,
                            }}
                          ></div>
                          <div
                            className="w-full bg-green-500 rounded-t"
                            style={{ height: `${month.teachers}px` }}
                          ></div>
                        </div>
                        <span className="text-xs mt-2 text-gray-400">
                          {month.month}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-center mt-4 gap-6">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                      <span className="text-sm text-gray-400">Students</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                      <span className="text-sm text-gray-400">Teachers</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="bg-customgreys-secondarybg border-gray-700">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {ACTIVITY_LOG.slice(0, 3).map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start space-x-3 pb-3 border-b border-gray-700 last:border-0 last:pb-0"
                      >
                        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-customgreys-primarybg flex items-center justify-center">
                          {activity.action.includes("User") ? (
                            <Users className="h-4 w-4 text-blue-500" />
                          ) : activity.action.includes("Course") ? (
                            <BookOpen className="h-4 w-4 text-green-500" />
                          ) : activity.action.includes("Assignment") ? (
                            <FileText className="h-4 w-4 text-amber-500" />
                          ) : (
                            <Settings className="h-4 w-4 text-purple-500" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {activity.action}
                          </p>
                          <p className="text-xs text-gray-400">
                            {activity.details}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {activity.timestamp} by {activity.user}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full mt-4"
                    onClick={() => setCurrentTab("activity")}
                  >
                    View All Activity
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-customgreys-secondarybg border-gray-700">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setCurrentTab("users")}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Manage Users
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setCurrentTab("courses")}
                  >
                    <BookOpen className="mr-2 h-4 w-4" />
                    Manage Courses
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="mr-2 h-4 w-4" />
                    View Schedule
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="mr-2 h-4 w-4" />
                    System Settings
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="users" className="pt-6">
          <Card className="bg-customgreys-secondarybg border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  View and manage all platform users
                </CardDescription>
              </div>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700 hover:bg-transparent">
                    <TableHead className="text-gray-400">Name</TableHead>
                    <TableHead className="text-gray-400">Email</TableHead>
                    <TableHead className="text-gray-400">Role</TableHead>
                    <TableHead className="text-gray-400">Status</TableHead>
                    <TableHead className="text-gray-400">Last Active</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {RECENT_USERS.map((user) => (
                    <TableRow
                      key={user.id}
                      className="border-gray-700 hover:bg-customgreys-primarybg"
                    >
                      <TableCell className="font-medium">
                        {user.name}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            user.role === "Teacher"
                              ? "text-green-500 border-green-500"
                              : "text-blue-500 border-blue-500"
                          }
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            user.status === "active"
                              ? "bg-green-600"
                              : "bg-gray-600"
                          }
                        >
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.lastActive}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-customgreys-primarybg border-gray-700">
                            <DropdownMenuItem>View Profile</DropdownMenuItem>
                            <DropdownMenuItem>Edit User</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-500">
                              Suspend User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-between border-t border-gray-700 pt-4">
              <p className="text-sm text-gray-400">
                Showing 5 of {STATS.totalUsers} users
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="courses" className="pt-6">
          <Card className="bg-customgreys-secondarybg border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Course Management</CardTitle>
                <CardDescription>
                  View and manage all available courses
                </CardDescription>
              </div>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Course
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700 hover:bg-transparent">
                    <TableHead className="text-gray-400">Title</TableHead>
                    <TableHead className="text-gray-400">Instructor</TableHead>
                    <TableHead className="text-gray-400">Students</TableHead>
                    <TableHead className="text-gray-400">Progress</TableHead>
                    <TableHead className="text-gray-400">Status</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {COURSES.map((course) => (
                    <TableRow
                      key={course.id}
                      className="border-gray-700 hover:bg-customgreys-primarybg"
                    >
                      <TableCell className="font-medium">
                        {course.title}
                      </TableCell>
                      <TableCell>{course.instructor}</TableCell>
                      <TableCell>{course.students}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={course.progress}
                            className="h-2 w-28"
                            indicatorClassName={
                              course.progress > 66
                                ? "bg-green-500"
                                : course.progress > 33
                                ? "bg-amber-500"
                                : "bg-red-500"
                            }
                          />
                          <span className="text-xs">{course.progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            course.status === "active"
                              ? "bg-green-600"
                              : "bg-amber-600"
                          }
                        >
                          {course.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-customgreys-primarybg border-gray-700">
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Edit Course</DropdownMenuItem>
                            <DropdownMenuItem>View Students</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-500">
                              Deactivate
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-between border-t border-gray-700 pt-4">
              <p className="text-sm text-gray-400">
                Showing 5 of {STATS.totalCourses} courses
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="pt-6">
          <Card className="bg-customgreys-secondarybg border-gray-700">
            <CardHeader>
              <CardTitle>Activity Log</CardTitle>
              <CardDescription>
                Recent platform activities and system events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ACTIVITY_LOG.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start space-x-4 p-3 bg-customgreys-primarybg rounded-md"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-customgreys-secondarybg flex items-center justify-center">
                      {activity.action.includes("User") ? (
                        <Users className="h-5 w-5 text-blue-500" />
                      ) : activity.action.includes("Course") ? (
                        <BookOpen className="h-5 w-5 text-green-500" />
                      ) : activity.action.includes("Assignment") ? (
                        <FileText className="h-5 w-5 text-amber-500" />
                      ) : (
                        <Settings className="h-5 w-5 text-purple-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <p className="font-medium">{activity.action}</p>
                        <p className="text-sm text-gray-400">
                          {activity.timestamp}
                        </p>
                      </div>
                      <p className="text-sm text-gray-300 mt-1">
                        {activity.details}
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        By: {activity.user}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t border-gray-700 pt-4">
              <p className="text-sm text-gray-400">
                Showing 5 most recent activities
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard; 
 
 