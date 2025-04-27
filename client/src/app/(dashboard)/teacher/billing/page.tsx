"use client";

import Header from "@/components/Header";
import Loading from "@/components/Loading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatPrice } from "@/lib/utils";
import { useGetTransactionsQuery } from "@/state/api";
import { useUser } from "@clerk/nextjs";
import {
  Download,
  Calendar,
  CreditCard,
  Users,
  Bookmark,
  Search,
  User,
  Mail,
  BookOpen,
  DollarSign,
} from "lucide-react";
import React, { useState } from "react";

// Simulated enrolled student type
type EnrolledStudent = {
  id: string;
  name: string;
  email: string;
  courseName: string;
  courseId: string;
  enrollmentDate: string;
  paymentAmount: number;
  paymentMethod: string;
};

const TeacherBilling = () => {
  const [paymentType, setPaymentType] = useState("all");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [activeTab, setActiveTab] = useState("students");
  const [searchTerm, setSearchTerm] = useState("");
  
  const { user, isLoaded } = useUser();
  const { data: transactions, isLoading: isLoadingTransactions } =
    useGetTransactionsQuery(user?.id || "", {
      skip: !isLoaded || !user,
    });

  // Mocked enrolled students data (would come from API)
  const enrolledStudents: EnrolledStudent[] = [
    {
      id: "student_1",
      name: "Alex Johnson",
      email: "alex.johnson@example.com",
      courseName: "Introduction to AI",
      courseId: "course_123",
      enrollmentDate: "2023-04-15",
      paymentAmount: 49.99,
      paymentMethod: "Credit Card",
    },
    {
      id: "student_2",
      name: "Sarah Thompson",
      email: "sarah.thompson@example.com",
      courseName: "Introduction to AI",
      courseId: "course_123",
      enrollmentDate: "2023-04-10",
      paymentAmount: 49.99,
      paymentMethod: "PayPal",
    },
    {
      id: "student_3",
      name: "Michael Brown",
      email: "michael.brown@example.com",
      courseName: "Modern Web Development",
      courseId: "course_456",
      enrollmentDate: "2023-04-20",
      paymentAmount: 59.99,
      paymentMethod: "Credit Card",
    },
    {
      id: "student_4",
      name: "Emily Davis",
      email: "emily.davis@example.com",
      courseName: "Modern Web Development",
      courseId: "course_456",
      enrollmentDate: "2023-04-05",
      paymentAmount: 59.99,
      paymentMethod: "Credit Card",
    },
    {
      id: "student_5",
      name: "David Wilson",
      email: "david.wilson@example.com",
      courseName: "Python Programming",
      courseId: "course_789",
      enrollmentDate: "2023-04-18",
      paymentAmount: 39.99,
      paymentMethod: "PayPal",
    },
  ];

  // Mock courses data
  const courses = [
    { id: "course_123", name: "Introduction to AI" },
    { id: "course_456", name: "Modern Web Development" },
    { id: "course_789", name: "Python Programming" },
  ];

  // Filter transactions
  const filteredTransactions =
    transactions?.filter((transaction) => {
      const matchesTypes =
        paymentType === "all" || transaction.paymentProvider === paymentType;
      return matchesTypes;
    }) || [];

  // Filter students
  const filteredStudents = enrolledStudents.filter((student) => {
    const matchesCourse = selectedCourse === "all" || student.courseId === selectedCourse;
    const matchesSearch = 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCourse && matchesSearch;
  });

  // Calculate total earnings
  const totalEarnings = enrolledStudents.reduce((total, student) => total + student.paymentAmount, 0);
  
  // Calculate students by course
  const studentsByCourse = courses.map(course => {
    const count = enrolledStudents.filter(student => student.courseId === course.id).length;
    return { ...course, studentCount: count };
  });

  if (!isLoaded) return <Loading />;
  if (!user) return <div>Please sign in to view your billing information.</div>;

  return (
    <div className="teacher-billing">
      <Header
        title="Billing & Students"
        subtitle="View enrolled students and payment information"
        rightElement={
          <Button
            variant="outline"
            className="bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700"
          >
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 mb-8">
        <Card className="p-6 bg-slate-900 border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-slate-200">Total Earnings</h3>
            <DollarSign className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-white">{formatPrice(totalEarnings)}</p>
          <p className="text-sm text-slate-400 mt-2">From {enrolledStudents.length} enrolled students</p>
        </Card>
        
        <Card className="p-6 bg-slate-900 border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-slate-200">Most Popular Course</h3>
            <BookOpen className="h-5 w-5 text-blue-500" />
          </div>
          {studentsByCourse.length > 0 && (
            <>
              <p className="text-xl font-semibold text-white">
                {studentsByCourse.sort((a, b) => b.studentCount - a.studentCount)[0].name}
              </p>
              <p className="text-sm text-slate-400 mt-2">
                {studentsByCourse.sort((a, b) => b.studentCount - a.studentCount)[0].studentCount} students enrolled
              </p>
            </>
          )}
        </Card>
        
        <Card className="p-6 bg-slate-900 border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-slate-200">Latest Enrollment</h3>
            <Calendar className="h-5 w-5 text-purple-500" />
          </div>
          {enrolledStudents.length > 0 && (
            <>
              <p className="text-xl font-semibold text-white">
                {
                  enrolledStudents
                    .sort((a, b) => new Date(b.enrollmentDate).getTime() - new Date(a.enrollmentDate).getTime())[0]
                    .name
                }
              </p>
              <p className="text-sm text-slate-400 mt-2">
                Enrolled on {
                  new Date(enrolledStudents
                    .sort((a, b) => new Date(b.enrollmentDate).getTime() - new Date(a.enrollmentDate).getTime())[0]
                    .enrollmentDate
                  ).toLocaleDateString()
                }
              </p>
            </>
          )}
        </Card>
      </div>

      <Tabs
        defaultValue="students"
        value={activeTab}
        onValueChange={setActiveTab}
        className="mt-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <TabsList className="bg-slate-800">
            <TabsTrigger
              value="students"
              className="data-[state=active]:bg-blue-600"
            >
              <Users className="h-4 w-4 mr-2" />
              Enrolled Students
            </TabsTrigger>
            <TabsTrigger
              value="transactions"
              className="data-[state=active]:bg-blue-600"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Payment History
            </TabsTrigger>
          </TabsList>

          <div className="flex flex-col sm:flex-row gap-3">
            {activeTab === "students" && (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search students..."
                    className="bg-slate-800 border border-slate-700 rounded-md py-2 pl-10 pr-4 text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200">
                    <SelectValue placeholder="All Courses" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-700">
                    <SelectItem value="all">All Courses</SelectItem>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}
            
            {activeTab === "transactions" && (
          <Select value={paymentType} onValueChange={setPaymentType}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200">
              <SelectValue placeholder="Payment Type" />
            </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="stripe">Stripe</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
            </SelectContent>
          </Select>
            )}
          </div>
        </div>

        <TabsContent value="students" className="mt-0">
          <Card className="bg-slate-900 border-slate-700 overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-800">
                <TableRow className="hover:bg-slate-800/80 border-slate-700">
                  <TableHead className="text-slate-300">Student</TableHead>
                  <TableHead className="text-slate-300">Course</TableHead>
                  <TableHead className="text-slate-300">Enrollment Date</TableHead>
                  <TableHead className="text-slate-300">Payment</TableHead>
                  <TableHead className="text-slate-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <TableRow
                      key={student.id}
                      className="hover:bg-slate-800/50 border-slate-700"
                    >
                      <TableCell>
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs text-white mr-3">
                            {student.name.split(" ").map(n => n[0]).join("")}
                          </div>
                          <div>
                            <div className="font-medium text-white">{student.name}</div>
                            <div className="text-xs text-slate-400">{student.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-blue-600 hover:bg-blue-700">
                          <BookOpen className="h-3 w-3 mr-1" />
                          {student.courseName}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {new Date(student.enrollmentDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-green-500 font-medium">
                        {formatPrice(student.paymentAmount)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-slate-400 hover:text-white hover:bg-slate-800"
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-slate-400 hover:text-white hover:bg-slate-800"
                          >
                            <User className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-slate-400">
                      No students found matching your criteria
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="mt-0">
          <Card className="bg-slate-900 border-slate-700 overflow-hidden">
            {isLoadingTransactions ? (
              <div className="p-8">
                <Loading />
        </div>
            ) : (
              <Table>
                <TableHeader className="bg-slate-800">
                  <TableRow className="hover:bg-slate-800/80 border-slate-700">
                    <TableHead className="text-slate-300">Date</TableHead>
                    <TableHead className="text-slate-300">Amount</TableHead>
                    <TableHead className="text-slate-300">Payment Method</TableHead>
                    <TableHead className="text-slate-300">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((transaction) => (
                      <TableRow
                        key={transaction.transactionId}
                        className="hover:bg-slate-800/50 border-slate-700"
                      >
                        <TableCell className="text-slate-300">
                          {new Date(transaction.dateTime).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-green-500 font-medium">
                          {formatPrice(transaction.amount)}
                        </TableCell>
                        <TableCell className="text-slate-300">
                          <div className="flex items-center">
                            <CreditCard className="h-4 w-4 mr-2 text-slate-400" />
                            {transaction.paymentProvider}
      </div>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-green-600/20 text-green-500 hover:bg-green-600/30">
                            Successful
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-8 text-slate-400"
                      >
                        No transactions to display
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TeacherBilling;