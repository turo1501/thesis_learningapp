"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Download,
  CreditCard,
  DollarSign,
  TrendingUp,
  Clock,
  FileText,
  Filter,
  ChevronDown,
  Eye,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Sample data for financial charts
const revenueData = [
  { month: "Jan", revenue: 15240 },
  { month: "Feb", revenue: 18500 },
  { month: "Mar", revenue: 22350 },
  { month: "Apr", revenue: 21200 },
  { month: "May", revenue: 24800 },
  { month: "Jun", revenue: 28900 },
  { month: "Jul", revenue: 32500 },
];

const courseRevenueData = [
  { name: "JavaScript Course", value: 28 },
  { name: "React Course", value: 22 },
  { name: "Python Course", value: 18 },
  { name: "Web Design", value: 12 },
  { name: "Others", value: 20 },
];

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe'];

// Sample transactions data
const transactions = [
  {
    id: "trx_1",
    user: {
      id: "user_1",
      name: "John Smith",
      email: "john.smith@example.com",
      avatar: "/avatars/user1.jpg",
    },
    amount: 89.99,
    course: "Complete JavaScript from Zero to Expert",
    status: "completed",
    paymentMethod: "credit_card",
    cardLast4: "4242",
    date: "2025-03-15T14:30:00Z",
  },
  {
    id: "trx_2",
    user: {
      id: "user_2",
      name: "Emily Johnson",
      email: "emily.johnson@example.com",
      avatar: "/avatars/user2.jpg",
    },
    amount: 99.99,
    course: "React - The Complete Guide",
    status: "completed",
    paymentMethod: "paypal",
    date: "2025-03-14T10:15:00Z",
  },
  {
    id: "trx_3",
    user: {
      id: "user_3",
      name: "Michael Brown",
      email: "michael.brown@example.com",
      avatar: "/avatars/user3.jpg",
    },
    amount: 119.99,
    course: "Python for Data Science and Machine Learning",
    status: "pending",
    paymentMethod: "credit_card",
    cardLast4: "5678",
    date: "2025-03-16T09:45:00Z",
  },
  {
    id: "trx_4",
    user: {
      id: "user_4",
      name: "Sarah Davis",
      email: "sarah.davis@example.com",
      avatar: "/avatars/user4.jpg",
    },
    amount: 149.99,
    course: "AWS Certified Solutions Architect",
    status: "failed",
    paymentMethod: "credit_card",
    cardLast4: "1234",
    date: "2025-03-15T16:20:00Z",
  },
  {
    id: "trx_5",
    user: {
      id: "user_5",
      name: "David Wilson",
      email: "david.wilson@example.com",
      avatar: "/avatars/user5.jpg",
    },
    amount: 199.99,
    course: "Full Stack Web Development Bootcamp",
    status: "refunded",
    paymentMethod: "paypal",
    date: "2025-03-10T11:30:00Z",
  },
];

const PaymentsManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  
  // Calculate financial summaries
  const totalRevenue = transactions
    .filter(t => t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);
    
  const pendingRevenue = transactions
    .filter(t => t.status === "pending")
    .reduce((sum, t) => sum + t.amount, 0);
  
  const refundedAmount = transactions
    .filter(t => t.status === "refunded")
    .reduce((sum, t) => sum + t.amount, 0);
  
  // Filter transactions based on search and filters
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.course.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || transaction.status === statusFilter;
    
    // Date filtering logic (simplified for this example)
    let matchesDate = true;
    const transactionDate = new Date(transaction.date);
    const now = new Date();
    
    if (dateFilter === "today") {
      matchesDate = transactionDate.toDateString() === now.toDateString();
    } else if (dateFilter === "this_week") {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      matchesDate = transactionDate >= weekStart;
    } else if (dateFilter === "this_month") {
      matchesDate = 
        transactionDate.getMonth() === now.getMonth() && 
        transactionDate.getFullYear() === now.getFullYear();
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });
  
  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  // Helper function to get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-600">Completed</Badge>;
      case "pending":
        return <Badge className="bg-amber-500">Pending</Badge>;
      case "failed":
        return <Badge className="bg-red-600">Failed</Badge>;
      case "refunded":
        return <Badge className="bg-blue-600">Refunded</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };
  
  // Helper function to get payment method icon
  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "credit_card":
        return <CreditCard className="h-4 w-4 text-gray-400" />;
      case "paypal":
        return <DollarSign className="h-4 w-4 text-blue-400" />;
      default:
        return <FileText className="h-4 w-4 text-gray-400" />;
    }
  };
  
  return (
    <div className="space-y-6">
      <Header 
        title="Payments Management" 
        subtitle="Monitor transactions and financial metrics"
        rightElement={
          <Button className="bg-primary-700 hover:bg-primary-600">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        }
      />
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-customgreys-secondarybg border-none shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-customgreys-dirtyGrey">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
              <div className="p-2 bg-green-500/20 rounded-full">
                <DollarSign className="h-5 w-5 text-green-500" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-green-500 text-sm">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>18% from last month</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-customgreys-secondarybg border-none shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-customgreys-dirtyGrey">
              Pending Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{formatCurrency(pendingRevenue)}</div>
              <div className="p-2 bg-amber-500/20 rounded-full">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-amber-500 text-sm">
              <span>{transactions.filter(t => t.status === "pending").length} transactions pending</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-customgreys-secondarybg border-none shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-customgreys-dirtyGrey">
              Refunds
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{formatCurrency(refundedAmount)}</div>
              <div className="p-2 bg-blue-500/20 rounded-full">
                <CreditCard className="h-5 w-5 text-blue-500" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-gray-400 text-sm">
              <span>Refund rate: {Math.round((refundedAmount / (totalRevenue + refundedAmount)) * 100)}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="bg-customgreys-secondarybg mb-6">
          <TabsTrigger 
            value="transactions" 
            className="data-[state=active]:bg-primary-700"
          >
            Transactions
          </TabsTrigger>
          <TabsTrigger 
            value="analytics" 
            className="data-[state=active]:bg-primary-700"
          >
            Analytics
          </TabsTrigger>
        </TabsList>
        
        {/* Transactions Tab */}
        <TabsContent value="transactions">
          {/* Filters */}
          <Card className="bg-customgreys-secondarybg border-none shadow-md mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-customgreys-dirtyGrey" />
                  <Input
                    placeholder="Search transactions..."
                    className="pl-10 bg-customgreys-primarybg border-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex gap-4">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[160px] bg-customgreys-primarybg border-none">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent className="bg-customgreys-primarybg border-gray-700">
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger className="w-[160px] bg-customgreys-primarybg border-none">
                      <SelectValue placeholder="Filter by date" />
                    </SelectTrigger>
                    <SelectContent className="bg-customgreys-primarybg border-gray-700">
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="this_week">This Week</SelectItem>
                      <SelectItem value="this_month">This Month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Transactions Table */}
          <Card className="bg-customgreys-secondarybg border-none shadow-md">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4 font-medium">Customer</th>
                      <th className="text-left py-3 px-4 font-medium">Amount</th>
                      <th className="text-left py-3 px-4 font-medium">Course</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                      <th className="text-left py-3 px-4 font-medium">Payment Method</th>
                      <th className="text-left py-3 px-4 font-medium">Date</th>
                      <th className="text-right py-3 px-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.length > 0 ? (
                      filteredTransactions.map((transaction) => (
                        <tr key={transaction.id} className="border-b border-gray-700">
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <Avatar className="h-8 w-8 mr-2">
                                <AvatarImage src={transaction.user.avatar} alt={transaction.user.name} />
                                <AvatarFallback className="bg-primary-700">
                                  {transaction.user.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{transaction.user.name}</div>
                                <div className="text-xs text-gray-400">{transaction.user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-semibold text-primary-500">
                            {formatCurrency(transaction.amount)}
                          </td>
                          <td className="py-3 px-4 text-gray-300 max-w-[200px] truncate">
                            {transaction.course}
                          </td>
                          <td className="py-3 px-4">
                            {getStatusBadge(transaction.status)}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              {getPaymentMethodIcon(transaction.paymentMethod)}
                              <span className="ml-2">
                                {transaction.paymentMethod === "credit_card" 
                                  ? `•••• ${transaction.cardLast4}` 
                                  : "PayPal"}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-400">
                            {format(new Date(transaction.date), "MMM d, yyyy")}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-customgreys-primarybg border-gray-700">
                                <DropdownMenuItem className="cursor-pointer flex items-center">
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                
                                {transaction.status === "pending" && (
                                  <DropdownMenuItem className="cursor-pointer flex items-center text-green-500">
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Mark as Completed
                                  </DropdownMenuItem>
                                )}
                                
                                {transaction.status === "completed" && (
                                  <DropdownMenuItem className="cursor-pointer flex items-center text-blue-500">
                                    <CreditCard className="mr-2 h-4 w-4" />
                                    Issue Refund
                                  </DropdownMenuItem>
                                )}
                                
                                {transaction.status === "failed" && (
                                  <DropdownMenuItem className="cursor-pointer flex items-center text-amber-500">
                                    <AlertCircle className="mr-2 h-4 w-4" />
                                    Contact Customer
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="text-center py-6 text-gray-400">
                          No transactions found matching your filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-customgreys-secondarybg border-none shadow-md">
              <CardHeader>
                <CardTitle>Monthly Revenue</CardTitle>
                <CardDescription>Revenue trend over the past 7 months</CardDescription>
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
                      <XAxis dataKey="month" stroke="#888" />
                      <YAxis stroke="#888" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#333', border: 'none' }}
                        formatter={(value) => [`$${value}`, 'Revenue']}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        name="Revenue"
                        stroke="#8884d8"
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-customgreys-secondarybg border-none shadow-md">
              <CardHeader>
                <CardTitle>Revenue by Course</CardTitle>
                <CardDescription>Distribution of revenue across top courses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={courseRevenueData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {courseRevenueData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#333', border: 'none' }}
                      />
                    </PieChart>
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

export default PaymentsManagement;