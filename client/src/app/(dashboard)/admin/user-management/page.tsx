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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
  X,
  ArrowRight,
  Bell,
} from "lucide-react";
import { format } from "date-fns";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { api } from "@/state/api";
import { useAppSelector } from "@/state/redux";
import { useUser, useAuth } from "@clerk/nextjs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type UserData = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "student" | "teacher" | "admin";
  status: "active" | "pending" | "suspended";
  createdAt: string;
  lastLogin?: string;
  imageUrl?: string;
};

const roleChangeSchema = z.object({
  role: z.enum(["student", "teacher", "admin"], {
    required_error: "You need to select a role",
  }),
  notes: z.string().optional(),
});

const passwordResetSchema = z.object({
  email: z.string().email("Must be a valid email"),
});

const addUserSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["student", "teacher", "admin"], {
    required_error: "You need to select a role",
  }),
  password: z.string().optional(),
  sendInvite: z.boolean().default(true),
});

// Add the schema for role change approval/rejection
const roleChangeResponseSchema = z.object({
  rejectionReason: z.string().optional(),
});

// Thêm interface để phù hợp với API response format
interface UserDataResponse {
  data?: UserData[];
  success?: boolean;
  [key: string]: any;
}

const UserManagement = () => {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"role" | "password" | "suspend" | "activate">("role");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isRoleChangeDialogOpen, setIsRoleChangeDialogOpen] = useState(false);
  const [selectedRoleChangeRequest, setSelectedRoleChangeRequest] = useState<any>(null);
  const [roleChangeAction, setRoleChangeAction] = useState<"approve" | "reject">("approve");

  const { user: currentUser, isLoaded: isUserLoaded } = useUser();
  const { getToken } = useAuth();
  
  // Log current user info
  useEffect(() => {
    if (isUserLoaded && currentUser) {
      console.log("Current User:", currentUser);
      console.log("User Role:", currentUser.publicMetadata.userType);
    }
  }, [isUserLoaded, currentUser]);

  // Function to make current user an admin (for testing)
  const makeCurrentUserAdmin = async () => {
    if (!isUserLoaded || !currentUser) return;
    
    try {
      // Lấy token từ Clerk theo cách đúng trong Next.js
      const token = await getToken();
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/clerk/${currentUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          publicMetadata: {
            userType: 'admin',
            settings: currentUser.publicMetadata.settings || {}
          }
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("User updated to admin:", data);
        toast.success("You are now an admin! Reload the page.");
        setTimeout(() => window.location.reload(), 2000);
      } else {
        const error = await response.json();
        console.error("Failed to make user admin:", error);
        toast.error("Failed to update role to admin");
      }
    } catch (error) {
      console.error("Error making user admin:", error);
      toast.error("Error updating user role");
    }
  };
  
  // Add button to give user admin rights for testing purposes
  const AdminRoleDebugButton = () => {
    if (!isUserLoaded || !currentUser) return null;
    
    return (
      <Button
        onClick={makeCurrentUserAdmin}
        className="bg-red-600 hover:bg-red-700 mt-4"
      >
        Make Me Admin (Debug)
      </Button>
    );
  };

  // Form for role changes
  const roleForm = useForm<z.infer<typeof roleChangeSchema>>({
    resolver: zodResolver(roleChangeSchema),
    defaultValues: {
      role: "student",
      notes: "",
    },
  });

  // Form for password reset
  const passwordForm = useForm<z.infer<typeof passwordResetSchema>>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: {
      email: "",
    },
  });

  // Form for adding a new user
  const addUserForm = useForm<z.infer<typeof addUserSchema>>({
    resolver: zodResolver(addUserSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      role: "student",
      password: "",
      sendInvite: true,
    },
  });

  // Form for handling rejection reason
  const rejectForm = useForm<z.infer<typeof roleChangeResponseSchema>>({
    resolver: zodResolver(roleChangeResponseSchema),
    defaultValues: {
      rejectionReason: "",
    },
  });

  // Get users from API
  const {
    data: usersData,
    isLoading: isUsersLoading,
    isError,
    refetch,
  } = api.useGetUsersQuery({
    role: selectedRole !== "all" ? selectedRole : undefined,
    status: selectedStatus !== "all" ? selectedStatus : undefined,
    search: searchTerm !== "" ? searchTerm : undefined,
  });

  // Debug data structure
  useEffect(() => {
    if (usersData) {
      console.log("Users data from API:", usersData);
    }
  }, [usersData]);

  // Ensure users array is properly extracted from API response
  const users = React.useMemo(() => {
    if (usersData && Array.isArray(usersData)) {
      return usersData as UserData[];
    } else if (usersData && typeof usersData === 'object' && 'data' in usersData) {
      return (usersData as UserDataResponse).data || [];
    } else {
      return [] as UserData[];
    }
  }, [usersData]);

  // Get pending role change requests
  const {
    data: pendingRoleChangeRequests,
    isLoading: isPendingRequestsLoading,
    refetch: refetchRoleChangeRequests,
  } = api.useGetPendingRoleChangeRequestsQuery();

  // API mutations
  const [updateUserRole] = api.useUpdateUserRoleMutation();
  const [updateUserStatus] = api.useUpdateUserStatusMutation();
  const [createUser] = api.useCreateUserMutation();
  const [resetUserPassword] = api.useResetUserPasswordMutation();
  const [approveRoleChange] = api.useApproveRoleChangeMutation();
  const [rejectRoleChange] = api.useRejectRoleChangeMutation();

  // Method to open dialog for different actions
  const openDialog = (
    user: UserData,
    type: "role" | "password" | "suspend" | "activate"
  ) => {
    // Kiểm tra nếu dialog đang mở với cùng một user và type
    if (isDialogOpen && selectedUser?.id === user.id && dialogType === type) {
      // Dialog đã mở, không cần làm gì thêm
      return;
    }
    
    // Nếu dialog đang mở với user hoặc type khác, đóng trước khi mở lại
    if (isDialogOpen) {
      setIsDialogOpen(false);
      // Sử dụng timeout để đảm bảo dialog đóng hoàn toàn trước khi mở lại
      setTimeout(() => {
        setSelectedUser(user);
        setDialogType(type);
        
        // Set default form values based on the user
        if (type === "role") {
          roleForm.setValue("role", user.role);
        } else if (type === "password") {
          passwordForm.setValue("email", user.email);
        }
        
        setIsDialogOpen(true);
      }, 100);
    } else {
      // Dialog chưa mở, mở bình thường
      setSelectedUser(user);
      setDialogType(type);
      
      // Set default form values based on the user
      if (type === "role") {
        roleForm.setValue("role", user.role);
      } else if (type === "password") {
        passwordForm.setValue("email", user.email);
      }
      
      setIsDialogOpen(true);
    }
  };

  // Handle role change submission
  const handleRoleChange = async (values: z.infer<typeof roleChangeSchema>) => {
    if (!selectedUser) return;
    
    setIsSubmitting(true);
    try {
      await updateUserRole({
        userId: selectedUser.id,
        role: values.role,
      }).unwrap();
      
      toast.success(`Role updated successfully for ${selectedUser.firstName} ${selectedUser.lastName}`);
      roleForm.reset();
      setIsDialogOpen(false);
      refetch();
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Failed to update role. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle password reset submission
  const handlePasswordReset = async (values: z.infer<typeof passwordResetSchema>) => {
    if (!selectedUser) return;
    
    setIsSubmitting(true);
    console.log("Attempting password reset for:", values.email);
    
    try {
      const response = await resetUserPassword({ email: values.email }).unwrap();
      console.log("Password reset response:", response);
      
      // Đóng dialog trước khi hiển thị thông báo toast
      // Điều này sẽ ngăn không cho UI bị treo
      closeDialog();
      
      // Sau khi đóng dialog, mới hiển thị toast thông báo
      if (response && response.success) {
        toast.success(response.message || `Password reset initiated for ${values.email}`);
        
        // Nếu có redirectUrl, thêm nút để redirect trong toast
        if (response.redirectUrl) {
          toast.success(
            <div>
              <p>Password reset link is ready.</p>
              <button 
                onClick={() => window.open(response.redirectUrl, '_blank')}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-full"
              >
                Go to Reset Password Page
              </button>
            </div>,
            { duration: 8000 }
          );
        }
      } else {
        toast.success(`Password reset email sent to ${values.email}`);
      }
      
      // Reset form sau khi xử lý thành công
      passwordForm.reset();
    } catch (error: any) {
      // Đóng dialog trước khi hiển thị thông báo lỗi
      closeDialog();
      
      console.error("Error resetting password:", error);
      
      // Hiển thị thông báo lỗi cụ thể hơn
      if (error.status === 404) {
        toast.error("Reset password endpoint not found. Please contact the administrator.");
      } else if (error.status === 401 || error.status === 403) {
        toast.error("You don't have permission to perform this action.");
      } else {
        toast.error(error.data?.message || "Failed to reset password. Please try again.");
      }
    } finally {
      // Đảm bảo set submitting về false
      setIsSubmitting(false);
    }
  };

  // Method to close dialog properly with cleanup
  const closeDialog = () => {
    // Đóng dialog UI
    setIsDialogOpen(false);
    
    // Reset submitting state immediately
    setIsSubmitting(false);
    
    // Tạm thời vô hiệu hóa tất cả các DOM event trong quá trình đóng dialog
    // Điều này ngăn không cho người dùng tương tác trong quá trình đóng dialog
    const overlay = document.querySelector('[data-state="open"][role="dialog"]');
    if (overlay) {
      const existingPointerEvents = overlay.getAttribute('style') || '';
      overlay.setAttribute('style', `${existingPointerEvents}; pointer-events: none;`);
    }
    
    // Thực hiện cleanup state sau khi dialog đã đóng hoàn toàn
    setTimeout(() => {
      if (overlay) {
        // Khôi phục pointer events
        overlay.removeAttribute('style');
      }
      
      // Chỉ thực hiện reset các form đã submit
      if (dialogType === "password") {
        passwordForm.reset();
      } else if (dialogType === "role") {
        roleForm.reset();
      }
    }, 200);
  };

  // Handle status change (suspend/activate)
  const handleStatusChange = async (userId: string, newStatus: "active" | "suspended") => {
    try {
      await updateUserStatus({
        userId,
        status: newStatus,
      }).unwrap();
      
      toast.success(`User ${newStatus === "active" ? "activated" : "suspended"} successfully`);
      setIsDialogOpen(false);
      refetch();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error(`Failed to ${newStatus === "active" ? "activate" : "suspend"} user. Please try again.`);
    }
  };

  // Handle adding a new user
  const handleAddUser = async (values: z.infer<typeof addUserSchema>) => {
    setIsSubmitting(true);
    try {
      await createUser(values).unwrap();
      toast.success("User created successfully");
      addUserForm.reset();
      setIsAddUserDialogOpen(false);
      refetch();
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error("Failed to create user. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle role change request approval
  const handleApproveRoleChange = async (userId: string) => {
    setIsSubmitting(true);
    try {
      await approveRoleChange(userId).unwrap();
      toast.success("Role change request approved successfully");
      setIsRoleChangeDialogOpen(false);
      refetchRoleChangeRequests();
      refetch(); // Refresh user list to see updated roles
    } catch (error) {
      console.error("Error approving role change:", error);
      toast.error("Failed to approve role change request");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle role change request rejection
  const handleRejectRoleChange = async (values: z.infer<typeof roleChangeResponseSchema>) => {
    if (!selectedRoleChangeRequest) return;
    
    setIsSubmitting(true);
    try {
      await rejectRoleChange({
        userId: selectedRoleChangeRequest.userId,
        rejectionReason: values.rejectionReason || "Request rejected by administrator",
      }).unwrap();
      
      toast.success("Role change request rejected");
      rejectForm.reset();
      setIsRoleChangeDialogOpen(false);
      refetchRoleChangeRequests();
    } catch (error) {
      console.error("Error rejecting role change:", error);
      toast.error("Failed to reject role change request");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get role badge component
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

  // Get status badge component
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

  // Format Date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Never";
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch (error) {
      return "Invalid date";
    }
  };

  if (isError) {
    return (
      <div className="user-management">
        <Header
          title="User Management"
          subtitle="Manage user accounts, permissions and roles"
          rightElement={
            <Button
              onClick={() => setIsAddUserDialogOpen(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <User className="mr-1 h-4 w-4" />
              Add User
            </Button>
          }
        />
        <Card className="p-8 text-center text-red-400 bg-red-900/20 border border-red-900/50">
          <AlertCircle className="h-10 w-10 mx-auto mb-4 text-red-400" />
          <h3 className="text-xl font-semibold mb-2">Error Loading Users</h3>
          <p>There was an error loading user data. Please try again later or contact support.</p>
        </Card>
      </div>
    );
  }

  if (isUsersLoading) {
    return (
      <div className="user-management">
        <Header
          title="User Management"
          subtitle="Manage user accounts, permissions and roles"
        />
        <Loading />
      </div>
    );
  }

  return (
    <div className="user-management">
      <Header
        title="User Management"
        subtitle="Manage users and their roles"
        rightElement={
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setIsAddUserDialogOpen(true)}
          >
            <User className="h-4 w-4 mr-1" />
            Add New User
          </Button>
        }
      />

      {/* Add a notification badge for role change requests */}
      {pendingRoleChangeRequests && pendingRoleChangeRequests.length > 0 && (
        <div className="mt-6 mb-2">
          <Card className="bg-amber-600/10 border-amber-600/30 p-4">
            <div className="flex items-center">
              <Bell className="h-5 w-5 text-amber-500 mr-2" />
              <div className="text-amber-500 font-medium">
                {pendingRoleChangeRequests.length} pending role change {pendingRoleChangeRequests.length === 1 ? 'request' : 'requests'} require your attention
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Add Tabs for Users and Role Change Requests */}
      <Tabs defaultValue="users" className="mt-6">
        <TabsList className="bg-slate-800 border-slate-700 p-1">
          <TabsTrigger value="users" className="data-[state=active]:bg-slate-700">
            All Users
          </TabsTrigger>
          <TabsTrigger value="role-requests" className="data-[state=active]:bg-slate-700 relative">
            Role Change Requests
            {pendingRoleChangeRequests && pendingRoleChangeRequests.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {pendingRoleChangeRequests.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-6">
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

          {users.length > 0 ? (
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
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-slate-700 hover:bg-slate-800/50"
                    >
                      <td className="p-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-medium mr-3 overflow-hidden">
                            {user.imageUrl ? (
                              <img 
                                src={user.imageUrl} 
                                alt={`${user.firstName} ${user.lastName}`}
                                className="w-full h-full object-cover" 
                              />
                            ) : (
                              <>
                                {user.firstName?.[0] || ''}
                                {user.lastName?.[0] || ''}
                              </>
                            )}
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
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="p-4 text-slate-300">
                        {formatDate(user.lastLogin)}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-slate-800 border-slate-700 hover:bg-slate-700"
                            onClick={() => openDialog(user, "role")}
                          >
                            <Pencil size={14} className="mr-1" />
                            Edit
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="bg-transparent hover:bg-slate-700 text-slate-400"
                                aria-label="User actions menu"
                              >
                                <MoreHorizontal size={16} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent 
                              align="end" 
                              className="bg-slate-900 border-slate-700"
                              onCloseAutoFocus={(e) => {
                                // Ngăn behavior mặc định để tránh giữ focus sau khi đóng
                                e.preventDefault();
                              }}
                            >
                              <DropdownMenuLabel>User Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator className="bg-slate-700" />
                              <DropdownMenuItem onClick={() => openDialog(user, "password")} className="cursor-pointer">
                                <Lock size={14} className="mr-2" />
                                Reset Password
                              </DropdownMenuItem>
                              {user.status !== "suspended" ? (
                                <DropdownMenuItem onClick={() => openDialog(user, "suspend")} className="cursor-pointer text-red-500 focus:text-red-500">
                                  <UserX size={14} className="mr-2" />
                                  Suspend Account
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onClick={() => openDialog(user, "activate")} className="cursor-pointer text-green-500 focus:text-green-500">
                                  <CheckCircle size={14} className="mr-2" />
                                  Reactivate Account
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Card className="p-8 text-center text-slate-400">
              <p>{isUsersLoading ? "Loading users..." : "No users found matching your filters."}</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="role-requests" className="mt-6">
          {isPendingRequestsLoading ? (
            <Loading />
          ) : pendingRoleChangeRequests && pendingRoleChangeRequests.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-800">
                    <th className="p-4 text-left text-sm font-medium text-slate-300 border-b border-slate-700">
                      User
                    </th>
                    <th className="p-4 text-left text-sm font-medium text-slate-300 border-b border-slate-700">
                      Current Role
                    </th>
                    <th className="p-4 text-left text-sm font-medium text-slate-300 border-b border-slate-700">
                      Requested Role
                    </th>
                    <th className="p-4 text-left text-sm font-medium text-slate-300 border-b border-slate-700">
                      Requested At
                    </th>
                    <th className="p-4 text-left text-sm font-medium text-slate-300 border-b border-slate-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pendingRoleChangeRequests.map((request) => (
                    <tr
                      key={request.userId}
                      className="border-b border-slate-700 hover:bg-slate-800/50"
                    >
                      <td className="p-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-medium mr-3 overflow-hidden">
                            {request.imageUrl ? (
                              <img 
                                src={request.imageUrl} 
                                alt={`${request.firstName} ${request.lastName}`}
                                className="w-full h-full object-cover" 
                              />
                            ) : (
                              <>
                                {request.firstName?.[0] || ''}
                                {request.lastName?.[0] || ''}
                              </>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-white">
                              {request.firstName} {request.lastName}
                            </div>
                            <div className="text-sm text-slate-400">
                              {request.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">{getRoleBadge(request.currentRole)}</td>
                      <td className="p-4">
                        <div className="flex items-center">
                          <ArrowRight className="h-4 w-4 text-slate-500 mr-2" />
                          {getRoleBadge(request.requestedRole)}
                        </div>
                      </td>
                      <td className="p-4 text-slate-300">
                        {formatDate(request.requestedAt)}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => {
                              setSelectedRoleChangeRequest(request);
                              setRoleChangeAction("approve");
                              setIsRoleChangeDialogOpen(true);
                            }}
                          >
                            <CheckCircle size={14} className="mr-1" />
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-slate-800 border-slate-700 hover:bg-slate-700"
                            onClick={() => {
                              setSelectedRoleChangeRequest(request);
                              setRoleChangeAction("reject");
                              setIsRoleChangeDialogOpen(true);
                            }}
                          >
                            <X size={14} className="mr-1" />
                            Reject
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Card className="p-8 text-center text-slate-400">
              <p>No pending role change requests.</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialogs for different user actions */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-slate-900 text-white border-slate-700">
          <DialogHeader>
            <DialogTitle>
              {dialogType === "role" && "Change User Role"}
              {dialogType === "password" && "Reset User Password"}
              {dialogType === "suspend" && "Suspend User Account"}
              {dialogType === "activate" && "Reactivate User Account"}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {dialogType === "role" && "Update the role for this user"}
              {dialogType === "password" && "Send a password reset email to this user"}
              {dialogType === "suspend" && "Temporarily disable this user's account"}
              {dialogType === "activate" && "Reactivate this suspended user's account"}
            </DialogDescription>
          </DialogHeader>

          {/* Role change form */}
          {dialogType === "role" && selectedUser && (
            <Form {...roleForm}>
              <form onSubmit={roleForm.handleSubmit(handleRoleChange)} className="space-y-6">
                <div className="mb-4">
                  <p className="text-sm mb-2">
                    Changing role for: <span className="font-semibold">{selectedUser.firstName} {selectedUser.lastName}</span>
                  </p>
                </div>
                
                <FormField
                  control={roleForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-slate-800 border-slate-700">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          <SelectItem value="student">Student</SelectItem>
                          <SelectItem value="teacher">Teacher</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription className="text-slate-400">
                        This will change the user's permissions in the system
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={roleForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add any notes about this role change"
                          className="bg-slate-800 border-slate-700"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    className="bg-slate-800 border-slate-700 hover:bg-slate-700"
                    onClick={closeDialog}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Updating..." : "Update Role"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          )}

          {/* Password reset form */}
          {dialogType === "password" && selectedUser && (
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(handlePasswordReset)} className="space-y-6">
                <div className="mb-4">
                  <p className="text-sm mb-2">
                    Sending password reset email to:
                  </p>
                  <p className="font-semibold">{selectedUser.email}</p>
                </div>
                
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    className="bg-slate-800 border-slate-700 hover:bg-slate-700"
                    onClick={closeDialog}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Sending..." : "Send Reset Email"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          )}

          {/* Suspend account confirmation */}
          {dialogType === "suspend" && selectedUser && (
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-sm">
                  Are you sure you want to suspend the account for:
                </p>
                <p className="font-semibold">{selectedUser.firstName} {selectedUser.lastName}</p>
                <p className="text-sm text-slate-400">
                  This will prevent the user from logging in until their account is reactivated.
                </p>
              </div>
              
              <DialogFooter>
                <Button
                  variant="outline"
                  className="bg-slate-800 border-slate-700 hover:bg-slate-700"
                  onClick={closeDialog}
                >
                  Cancel
                </Button>
                <Button 
                  className="bg-red-600 hover:bg-red-700"
                  onClick={() => handleStatusChange(selectedUser.id, "suspended")}
                >
                  Suspend Account
                </Button>
              </DialogFooter>
            </div>
          )}

          {/* Reactivate account confirmation */}
          {dialogType === "activate" && selectedUser && (
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-sm">
                  Are you sure you want to reactivate the account for:
                </p>
                <p className="font-semibold">{selectedUser.firstName} {selectedUser.lastName}</p>
                <p className="text-sm text-slate-400">
                  This will restore the user's access to the platform.
                </p>
              </div>
              
              <DialogFooter>
                <Button
                  variant="outline"
                  className="bg-slate-800 border-slate-700 hover:bg-slate-700"
                  onClick={closeDialog}
                >
                  Cancel
                </Button>
                <Button 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => handleStatusChange(selectedUser.id, "active")}
                >
                  Reactivate Account
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add button to give user admin rights for testing purposes */}
      <AdminRoleDebugButton />

      {/* Dialog for adding a new user */}
      <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
        <DialogContent className="bg-slate-900 text-white border-slate-700">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription className="text-slate-400">
              Create a new user account
            </DialogDescription>
          </DialogHeader>

          <Form {...addUserForm}>
            <form onSubmit={addUserForm.handleSubmit(handleAddUser)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={addUserForm.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="John"
                          className="bg-slate-800 border-slate-700"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addUserForm.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Doe"
                          className="bg-slate-800 border-slate-700"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={addUserForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="john.doe@example.com"
                        className="bg-slate-800 border-slate-700"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={addUserForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-slate-800 border-slate-700">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="teacher">Teacher</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-slate-400">
                      This determines the user's permissions
                    </FormDescription>
                  </FormItem>
                )}
              />
              
              <FormField
                control={addUserForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Leave empty to send invite email"
                        className="bg-slate-800 border-slate-700"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription className="text-slate-400">
                      If left empty, an invite will be sent to the user
                    </FormDescription>
                  </FormItem>
                )}
              />
              
              <FormField
                control={addUserForm.control}
                name="sendInvite"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-slate-700 p-4">
                    <FormControl>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 rounded border-slate-700 bg-slate-800"
                        />
                        <span>Send invite email</span>
                      </div>
                    </FormControl>
                    <FormDescription className="text-slate-400 mt-0">
                      Email the user with instructions to set up their account
                    </FormDescription>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  className="bg-slate-800 border-slate-700 hover:bg-slate-700"
                  onClick={() => setIsAddUserDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating..." : "Create User"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Add Role Change Approval/Rejection Dialog */}
      <Dialog open={isRoleChangeDialogOpen} onOpenChange={setIsRoleChangeDialogOpen}>
        <DialogContent className="bg-slate-900 text-white border-slate-700">
          <DialogHeader>
            <DialogTitle>
              {roleChangeAction === "approve" 
                ? "Approve Role Change Request" 
                : "Reject Role Change Request"}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {roleChangeAction === "approve" 
                ? "Approve this user's request to change roles" 
                : "Reject this user's request to change roles"}
            </DialogDescription>
          </DialogHeader>

          {selectedRoleChangeRequest && (
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm mb-2">
                  User: <span className="font-semibold">{selectedRoleChangeRequest.firstName} {selectedRoleChangeRequest.lastName}</span>
                </p>
                <div className="flex items-center">
                  <div className="mr-2">Current role:</div>
                  {getRoleBadge(selectedRoleChangeRequest.currentRole)}
                </div>
                <div className="flex items-center">
                  <div className="mr-2">Requested role:</div>
                  {getRoleBadge(selectedRoleChangeRequest.requestedRole)}
                </div>
              </div>

              <div className="bg-slate-800/50 p-4 rounded-md">
                <p className="text-sm font-medium text-slate-300 mb-2">Reason for request:</p>
                <p className="text-sm text-slate-400">{selectedRoleChangeRequest.reason}</p>
              </div>

              {roleChangeAction === "approve" ? (
                <DialogFooter>
                  <Button
                    variant="outline"
                    className="bg-slate-800 border-slate-700 hover:bg-slate-700"
                    onClick={() => setIsRoleChangeDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="bg-green-600 hover:bg-green-700"
                    disabled={isSubmitting}
                    onClick={() => handleApproveRoleChange(selectedRoleChangeRequest.userId)}
                  >
                    {isSubmitting ? "Approving..." : "Approve Role Change"}
                  </Button>
                </DialogFooter>
              ) : (
                <Form {...rejectForm}>
                  <form onSubmit={rejectForm.handleSubmit(handleRejectRoleChange)} className="space-y-4">
                    <FormField
                      control={rejectForm.control}
                      name="rejectionReason"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rejection Reason (Optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Explain why you're rejecting this request"
                              className="bg-slate-800 border-slate-700"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        className="bg-slate-800 border-slate-700 hover:bg-slate-700"
                        onClick={() => setIsRoleChangeDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit"
                        className="bg-red-600 hover:bg-red-700"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Rejecting..." : "Reject Request"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;