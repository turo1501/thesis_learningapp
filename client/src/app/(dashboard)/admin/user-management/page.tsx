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
  Search,
  Filter,
  UserCog,
  MoreHorizontal,
  Mail,
  Lock,
  UserX,
  CheckCircle,
  AlertCircle,
  User,
  Users,
  Pencil,
} from "lucide-react";
import { format } from "date-fns";
import React, { useState } from "react";

type UserData = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "student" | "teacher" | "admin";
  status: "active" | "pending" | "suspended";
  createdAt: string;
  lastLogin?: string;
  courses?: number;
  profileImage?: string;
};

const UserManagement = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Mock data - would be fetched from API
  const users: UserData[] = [
    {
      id: "user_123",
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      role: "student",
      status: "active",
      createdAt: "2023-01-15",
      lastLogin: "2023-04-30",
      courses: 3,
    },
    {
      id: "user_124",
      firstName: "Jane",
      lastName: "Smith",
      email: "jane.smith@example.com",
      role: "teacher",
      status: "active",
      createdAt: "2023-01-10",
      lastLogin: "2023-05-01",
      courses: 2,
    },
    {
      id: "user_125",
      firstName: "Michael",
      lastName: "Brown",
      email: "michael.brown@example.com",
      role: "student",
      status: "pending",
      createdAt: "2023-04-28",
    },
    {
      id: "user_126",
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah.johnson@example.com",
      role: "teacher",
      status: "suspended",
      createdAt: "2023-02-15",
      lastLogin: "2023-03-10",
      courses: 4,
    },
    {
      id: "user_127",
      firstName: "David",
      lastName: "Wilson",
      email: "david.wilson@example.com",
      role: "admin",
      status: "active",
      createdAt: "2022-11-10",
      lastLogin: "2023-05-01",
    },
    {
      id: "user_128",
      firstName: "Emily",
      lastName: "Davis",
      email: "emily.davis@example.com",
      role: "student",
      status: "active",
      createdAt: "2023-03-05",
      lastLogin: "2023-04-20",
      courses: 2,
    },
    {
      id: "user_129",
      firstName: "Robert",
      lastName: "Miller",
      email: "robert.miller@example.com",
      role: "teacher",
      status: "active",
      createdAt: "2022-12-12",
      lastLogin: "2023-04-25",
      courses: 1,
    },
  ];

  const filteredUsers = users.filter((user) => {
    // Filter by search term
    const matchesSearch =
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    // Filter by role
    const matchesRole = selectedRole === "all" || user.role === selectedRole;

    // Filter by status
    const matchesStatus =
      selectedStatus === "all" || user.status === selectedStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleRoleChange = async (userId: string, newRole: string) => {
    setIsLoading(true);
    console.log(`Changing user ${userId} role to ${newRole}`);
    // Here you would call the Clerk API to update the user role
    setTimeout(() => setIsLoading(false), 500); // Simulate API call
  };

  const handleStatusChange = async (userId: string, newStatus: string) => {
    setIsLoading(true);
    console.log(`Changing user ${userId} status to ${newStatus}`);
    // Here you would call an API to update the user status
    setTimeout(() => setIsLoading(false), 500); // Simulate API call
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return (
          <Badge className="bg-purple-600 hover:bg-purple-700">
            <UserCog className="h-3 w-3 mr-1" />
            Admin
          </Badge>
        );
      case "teacher":
        return (
          <Badge className="bg-blue-600 hover:bg-blue-700">
            <Users className="h-3 w-3 mr-1" />
            Teacher
          </Badge>
        );
      case "student":
        return (
          <Badge className="bg-green-600 hover:bg-green-700">
            <User className="h-3 w-3 mr-1" />
            Student
          </Badge>
        );
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge
            variant="outline"
            className="bg-green-500/10 text-green-500 border-green-500/20"
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        );
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
          >
            <AlertCircle className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "suspended":
        return (
          <Badge
            variant="outline"
            className="bg-red-500/10 text-red-500 border-red-500/20"
          >
            <UserX className="h-3 w-3 mr-1" />
            Suspended
          </Badge>
        );
      default:
        return null;
    }
  };

  if (isLoading) return <Loading />;

  return (
    <div className="user-management">
      <Header
        title="User Management"
        subtitle="Manage users and their roles"
        rightElement={
          <Button className="bg-blue-600 hover:bg-blue-700">
            <User className="h-4 w-4 mr-1" />
            Add New User
          </Button>
        }
      />

      <div className="user-management__filters mt-6 mb-8 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by name or email"
            className="w-full bg-slate-800 border border-slate-700 rounded-md py-2 pl-10 pr-4 text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-3">
          <div className="bg-slate-800 p-2 rounded-md flex items-center gap-2 border border-slate-700">
            <Filter size={18} className="text-slate-400" />
            <select
              className="bg-transparent text-sm border-none focus:outline-none text-white"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="student">Students</option>
              <option value="teacher">Teachers</option>
              <option value="admin">Admins</option>
            </select>
          </div>
          <div className="bg-slate-800 p-2 rounded-md flex items-center gap-2 border border-slate-700">
            <Filter size={18} className="text-slate-400" />
            <select
              className="bg-transparent text-sm border-none focus:outline-none text-white"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <Card className="p-8 text-center text-slate-400">
          <p>No users found matching your filters.</p>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-800">
                <th className="p-4 text-left text-sm font-medium text-slate-300 border-b border-slate-700">
                  User
                </th>
                <th className="p-4 text-left text-sm font-medium text-slate-300 border-b border-slate-700">
                  Role
                </th>
                <th className="p-4 text-left text-sm font-medium text-slate-300 border-b border-slate-700">
                  Status
                </th>
                <th className="p-4 text-left text-sm font-medium text-slate-300 border-b border-slate-700">
                  Created
                </th>
                <th className="p-4 text-left text-sm font-medium text-slate-300 border-b border-slate-700">
                  Last Login
                </th>
                <th className="p-4 text-left text-sm font-medium text-slate-300 border-b border-slate-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-slate-700 hover:bg-slate-800/50"
                >
                  <td className="p-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-medium mr-3">
                        {user.firstName[0]}
                        {user.lastName[0]}
                      </div>
                      <div>
                        <div className="font-medium text-white">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-slate-400">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">{getRoleBadge(user.role)}</td>
                  <td className="p-4">{getStatusBadge(user.status)}</td>
                  <td className="p-4 text-slate-300">
                    {format(new Date(user.createdAt), "MMM dd, yyyy")}
                  </td>
                  <td className="p-4 text-slate-300">
                    {user.lastLogin
                      ? format(new Date(user.lastLogin), "MMM dd, yyyy")
                      : "Never"}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-slate-800 border-slate-700 hover:bg-slate-700"
                      >
                        <Pencil size={14} className="mr-1" />
                        Edit
                      </Button>
                      <div className="relative group">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="bg-transparent hover:bg-slate-700 text-slate-400"
                        >
                          <MoreHorizontal size={16} />
                        </Button>
                        <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-md shadow-lg z-10 hidden group-hover:block">
                          <ul className="py-1">
                            <li>
                              <button className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 flex items-center">
                                <Mail size={14} className="mr-2" />
                                Send Email
                              </button>
                            </li>
                            <li>
                              <button className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 flex items-center">
                                <Lock size={14} className="mr-2" />
                                Reset Password
                              </button>
                            </li>
                            {user.status !== "suspended" && (
                              <li>
                                <button
                                  className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-slate-800 flex items-center"
                                  onClick={() =>
                                    handleStatusChange(user.id, "suspended")
                                  }
                                >
                                  <UserX size={14} className="mr-2" />
                                  Suspend Account
                                </button>
                              </li>
                            )}
                            {user.status === "suspended" && (
                              <li>
                                <button
                                  className="w-full text-left px-4 py-2 text-sm text-green-500 hover:bg-slate-800 flex items-center"
                                  onClick={() =>
                                    handleStatusChange(user.id, "active")
                                  }
                                >
                                  <CheckCircle size={14} className="mr-2" />
                                  Reactivate Account
                                </button>
                              </li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
