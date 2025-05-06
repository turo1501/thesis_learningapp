"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  UserCog, 
  CheckCircle, 
  AlertCircle,
  User,
  ChevronDown
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

// Sample user data for demonstration
const sampleUsers = [
  {
    id: "usr_1",
    name: "John Doe",
    email: "john.doe@example.com",
    role: "student",
    status: "active",
    joinedDate: "2023-01-15",
    avatar: "/avatars/john.jpg",
  },
  {
    id: "usr_2",
    name: "Sarah Smith",
    email: "sarah.smith@example.com",
    role: "teacher",
    status: "active",
    joinedDate: "2023-02-23",
    avatar: "/avatars/sarah.jpg",
  },
  {
    id: "usr_3",
    name: "Robert Johnson",
    email: "robert.johnson@example.com",
    role: "student",
    status: "inactive",
    joinedDate: "2023-03-10",
    avatar: "/avatars/robert.jpg",
  },
  {
    id: "usr_4",
    name: "Emily Davis",
    email: "emily.davis@example.com",
    role: "admin",
    status: "active",
    joinedDate: "2023-01-05",
    avatar: "/avatars/emily.jpg",
  },
  {
    id: "usr_5",
    name: "Michael Brown",
    email: "michael.brown@example.com",
    role: "teacher",
    status: "active",
    joinedDate: "2023-04-18",
    avatar: "/avatars/michael.jpg",
  },
];

const UsersManagement = () => {
  const [users, setUsers] = useState(sampleUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Filter users based on search and filters
  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });
  
  // Function to update user role
  const handleRoleChange = (userId: string, newRole: string) => {
    // In a real app, this would call an API to update the role in Clerk
    setUsers(users.map(user => 
      user.id === userId ? {...user, role: newRole} : user
    ));
    
    toast.success(`User role updated to ${newRole}`);
  };
  
  // Function to update user status
  const handleStatusChange = (userId: string, newStatus: string) => {
    setUsers(users.map(user => 
      user.id === userId ? {...user, status: newStatus} : user
    ));
    
    toast.success(`User status updated to ${newStatus}`);
  };

  return (
    <div className="space-y-6">
      <Header
        title="Users Management"
        subtitle="Manage users and their roles"
        rightElement={
          <Button className="bg-primary-700 hover:bg-primary-600">
            <User className="mr-2 h-4 w-4" />
            Add New User
          </Button>
        }
      />

      {/* Filters */}
      <Card className="bg-customgreys-secondarybg border-none shadow-md">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-customgreys-dirtyGrey" />
              <Input
                placeholder="Search users..."
                className="pl-10 bg-customgreys-primarybg border-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-4">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[160px] bg-customgreys-primarybg border-none">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent className="bg-customgreys-primarybg border-gray-700">
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px] bg-customgreys-primarybg border-none">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-customgreys-primarybg border-gray-700">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="bg-customgreys-secondarybg border-none shadow-md">
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            {filteredUsers.length} users found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 font-medium">User</th>
                  <th className="text-left py-3 px-4 font-medium">Email</th>
                  <th className="text-left py-3 px-4 font-medium">Role</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Joined Date</th>
                  <th className="text-left py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-700">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <Avatar className="h-8 w-8 mr-2">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback className="bg-primary-700">
                            {user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{user.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-400">{user.email}</td>
                    <td className="py-3 px-4">
                      <span 
                        className={
                          user.role === "admin" 
                            ? "text-indigo-400" 
                            : user.role === "teacher" 
                            ? "text-green-400"
                            : "text-blue-400"
                        }
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        {user.status === "active" ? (
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-amber-500 mr-2" />
                        )}
                        {user.status}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-400">{user.joinedDate}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 border-gray-700 bg-customgreys-primarybg">
                              <UserCog className="h-4 w-4 mr-2" />
                              Role
                              <ChevronDown className="h-4 w-4 ml-2" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-customgreys-primarybg border-gray-700">
                            <DropdownMenuItem 
                              onClick={() => handleRoleChange(user.id, "student")}
                              className="cursor-pointer"
                            >
                              Student
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleRoleChange(user.id, "teacher")}
                              className="cursor-pointer"
                            >
                              Teacher
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleRoleChange(user.id, "admin")}
                              className="cursor-pointer"
                            >
                              Admin
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 border-gray-700 bg-customgreys-primarybg">
                              {user.status === "active" ? (
                                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                              ) : (
                                <AlertCircle className="h-4 w-4 mr-2 text-amber-500" />
                              )}
                              Status
                              <ChevronDown className="h-4 w-4 ml-2" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-customgreys-primarybg border-gray-700">
                            <DropdownMenuItem 
                              onClick={() => handleStatusChange(user.id, "active")}
                              className="cursor-pointer"
                            >
                              Active
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleStatusChange(user.id, "inactive")}
                              className="cursor-pointer"
                            >
                              Inactive
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UsersManagement; 