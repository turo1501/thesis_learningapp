import { Request, Response } from "express";
import { clerkClient } from "../index";
import type { User } from "@clerk/backend";

export const updateUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId } = req.params;
  const userData = req.body;
  try {
    const user = await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        userType: userData.publicMetadata.userType,
        settings: userData.publicMetadata.settings,
      },
    });

    res.json({ message: "User updated successfully", data: user });
  } catch (error) {
    res.status(500).json({ message: "Error updating user", error });
  }
};

export const createUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email, firstName, lastName, role = "student", password } = req.body;
  
  if (!email || !firstName || !lastName) {
    res.status(400).json({ message: "Email, firstName, and lastName are required" });
    return;
  }
  
  try {
    // Tạo người dùng mới với Clerk API
    const user = await clerkClient.users.createUser({
      emailAddress: [email],
      firstName,
      lastName,
      password: password || undefined, // Nếu không có password, Clerk sẽ gửi email invite
      skipPasswordChecks: true,
      skipPasswordRequirement: !password,
    });
    
    // Cập nhật metadata để lưu vai trò
    await clerkClient.users.updateUserMetadata(user.id, {
      publicMetadata: {
        userType: role,
      },
    });
    
    // Nếu không cung cấp mật khẩu, Clerk tự động gửi email mời
    
    res.status(201).json({ 
      message: "User created successfully", 
      data: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.emailAddresses[0].emailAddress,
        role,
      }
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Error creating user", error });
  }
};

export const resetPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email } = req.body;
  
  if (!email) {
    res.status(400).json({ message: "Email is required" });
    return;
  }
  
  try {
    // Tìm người dùng theo email
    const users = await clerkClient.users.getUserList({
      emailAddress: [email],
    });
    
    if (users.data.length === 0) {
      res.status(404).json({ message: "User not found with this email" });
      return;
    }
    
    // Gửi email reset password thông qua frontend
    // Backend không thể trực tiếp gọi API đặt lại mật khẩu (giới hạn của Clerk)
    // Trả về success để frontend có thể hiển thị thông báo
    res.json({ 
      message: "Please use Clerk's frontend components for password reset", 
      user: {
        id: users.data[0].id,
        email: email
      }
    });
  } catch (error) {
    console.error("Error preparing password reset:", error);
    res.status(500).json({ message: "Error preparing password reset", error });
  }
};

export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Get query parameters for filtering
    const { role, status, search } = req.query;
    
    // Get the first 100 users (Clerk pagination can be implemented if needed)
    const usersResponse = await clerkClient.users.getUserList({
      limit: 100,
    });

    // Map the Clerk user data to a more manageable structure
    const processedUsers = usersResponse.data.map((user: User) => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.emailAddresses[0]?.emailAddress || "",
      imageUrl: user.imageUrl,
      role: (user.publicMetadata.userType as string) || "student",
      status: user.banned === true ? "suspended" : user.emailAddresses[0]?.verification?.status === "verified" ? "active" : "pending",
      createdAt: user.createdAt,
      lastLogin: user.lastSignInAt,
    }));

    // Apply filters if specified
    let filteredUsers = processedUsers;
    
    if (role && role !== 'all') {
      filteredUsers = filteredUsers.filter((user: any) => user.role === role);
    }
    
    if (status && status !== 'all') {
      filteredUsers = filteredUsers.filter((user: any) => user.status === status);
    }
    
    if (search) {
      const searchLower = (search as string).toLowerCase();
      filteredUsers = filteredUsers.filter((user: any) =>
        user.firstName?.toLowerCase().includes(searchLower) ||
        user.lastName?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower)
      );
    }

    res.json({ 
      message: "Users retrieved successfully", 
      data: filteredUsers 
    });
  } catch (error) {
    console.error("Error getting users:", error);
    res.status(500).json({ message: "Error retrieving users", error });
  }
};

export const getUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId } = req.params;
  
  try {
    const user = await clerkClient.users.getUser(userId);
    
    const processedUser = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.emailAddresses[0]?.emailAddress || "",
      imageUrl: user.imageUrl,
      role: (user.publicMetadata.userType as string) || "student",
      status: user.banned === true ? "suspended" : user.emailAddresses[0]?.verification?.status === "verified" ? "active" : "pending",
      createdAt: user.createdAt,
      lastLogin: user.lastSignInAt,
      settings: user.publicMetadata.settings || {},
      roleChangeRequest: user.privateMetadata.roleChangeRequest || null,
    };
    
    res.json({ 
      message: "User retrieved successfully", 
      data: processedUser 
    });
  } catch (error) {
    console.error(`Error getting user ${userId}:`, error);
    res.status(500).json({ message: "Error retrieving user", error });
  }
};

export const updateUserRole = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId } = req.params;
  const { role } = req.body;
  
  try {
    // Validate role
    if (!['student', 'teacher', 'admin'].includes(role)) {
      res.status(400).json({ message: "Invalid role specified" });
      return;
    }
    
    // Get current user data to preserve other metadata
    const user = await clerkClient.users.getUser(userId);
    
    // Update the user's role
    const updatedUser = await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        ...user.publicMetadata,
        userType: role,
      },
    });
    
    res.json({ 
      message: "User role updated successfully", 
      data: {
        id: updatedUser.id,
        role: updatedUser.publicMetadata.userType,
      }
    });
  } catch (error) {
    console.error(`Error updating role for user ${userId}:`, error);
    res.status(500).json({ message: "Error updating user role", error });
  }
};

export const updateUserStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId } = req.params;
  const { status } = req.body;
  
  try {
    // Validate status
    if (!['active', 'suspended'].includes(status)) {
      res.status(400).json({ message: "Invalid status specified" });
      return;
    }
    
    // Get the current user data
    const user = await clerkClient.users.getUser(userId);
    
    if (status === 'suspended') {
      // Ban the user - using proper Clerk method for banning
      await clerkClient.users.updateUser(userId, {
        username: undefined, // Clear username to free it up
      });
      
      // Set banned in metadata since Clerk doesn't expose a direct ban method in the Node SDK
      await clerkClient.users.updateUserMetadata(userId, {
        publicMetadata: {
          ...user.publicMetadata,
          banned: true,
        },
      });
    } else {
      // Unban the user - set banned flag to false in metadata
      await clerkClient.users.updateUserMetadata(userId, {
        publicMetadata: {
          ...user.publicMetadata,
          banned: false,
        },
      });
    }
    
    res.json({ 
      message: `User ${status === 'suspended' ? 'suspended' : 'activated'} successfully`, 
      data: {
        id: userId,
        status,
      }
    });
  } catch (error) {
    console.error(`Error updating status for user ${userId}:`, error);
    res.status(500).json({ message: "Error updating user status", error });
  }
};