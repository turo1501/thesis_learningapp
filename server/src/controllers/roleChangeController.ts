import { Request, Response } from "express";
import { clerkClient } from "../index";

export const requestRoleChange = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId, requestedRole, reason } = req.body;
  
  try {
    // Add requestedRole to user's private metadata
    await clerkClient.users.updateUserMetadata(userId, {
      privateMetadata: {
        roleChangeRequest: {
          requestedRole,
          reason,
          status: "pending",
          requestedAt: new Date().toISOString(),
        },
      },
    });

    res.json({ 
      success: true,
      message: "Role change request submitted successfully" 
    });
  } catch (error) {
    console.error("Error requesting role change:", error);
    res.status(500).json({ 
      success: false,
      message: "Error submitting role change request", 
      error 
    });
  }
};

export const approveRoleChange = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId } = req.params;
  
  try {
    // Get user data including metadata
    const user = await clerkClient.users.getUser(userId);
    const roleChangeRequest = user.privateMetadata.roleChangeRequest as {
      requestedRole: string;
      reason: string;
      status: string;
      requestedAt: string;
    };

    if (!roleChangeRequest || roleChangeRequest.status !== "pending") {
      res.status(400).json({ 
        success: false,
        message: "No pending role change request found" 
      });
      return;
    }

    // Update user's role in publicMetadata
    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        ...user.publicMetadata,
        userType: roleChangeRequest.requestedRole,
      },
      privateMetadata: {
        ...user.privateMetadata,
        roleChangeRequest: {
          ...roleChangeRequest,
          status: "approved",
          approvedAt: new Date().toISOString(),
        },
      },
    });

    res.json({ 
      success: true,
      message: "Role change request approved successfully" 
    });
  } catch (error) {
    console.error("Error approving role change:", error);
    res.status(500).json({ 
      success: false,
      message: "Error approving role change", 
      error 
    });
  }
};

export const rejectRoleChange = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId } = req.params;
  const { rejectionReason } = req.body;
  
  try {
    // Get user data including metadata
    const user = await clerkClient.users.getUser(userId);
    const roleChangeRequest = user.privateMetadata.roleChangeRequest as {
      requestedRole: string;
      reason: string;
      status: string;
      requestedAt: string;
    };

    if (!roleChangeRequest || roleChangeRequest.status !== "pending") {
      res.status(400).json({ 
        success: false,
        message: "No pending role change request found" 
      });
      return;
    }

    // Update the role change request status to rejected
    await clerkClient.users.updateUserMetadata(userId, {
      privateMetadata: {
        ...user.privateMetadata,
        roleChangeRequest: {
          ...roleChangeRequest,
          status: "rejected",
          rejectionReason,
          rejectedAt: new Date().toISOString(),
        },
      },
    });

    res.json({ 
      success: true,
      message: "Role change request rejected successfully" 
    });
  } catch (error) {
    console.error("Error rejecting role change:", error);
    res.status(500).json({ 
      success: false,
      message: "Error rejecting role change", 
      error 
    });
  }
};

export const getPendingRoleChangeRequests = async (
  _: Request,
  res: Response
): Promise<void> => {
  try {
    // Get all users
    const usersResponse = await clerkClient.users.getUserList({
      limit: 100,
    });
    
    // Filter and map users with pending role change requests
    const pendingRequests = usersResponse.data
      .filter(user => 
        user.privateMetadata.roleChangeRequest && 
        (user.privateMetadata.roleChangeRequest as any).status === "pending"
      )
      .map(user => {
        const roleRequest = user.privateMetadata.roleChangeRequest as {
          requestedRole: string;
          reason: string;
          status: string;
          requestedAt: string;
        };
        
        return {
          userId: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.emailAddresses[0]?.emailAddress || "",
          imageUrl: user.imageUrl,
          currentRole: user.publicMetadata.userType || "student",
          requestedRole: roleRequest.requestedRole,
          reason: roleRequest.reason,
          requestedAt: roleRequest.requestedAt,
        };
      });
    
    res.json({
      success: true,
      data: pendingRequests
    });
  } catch (error) {
    console.error("Error fetching pending role change requests:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching pending role change requests",
      error
    });
  }
};
