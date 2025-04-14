"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { CheckCircle, User, GraduationCap, UserCog, Info } from "lucide-react";
import { api, useRequestRoleChangeMutation } from "@/state/api";

const RequestRoleChange = () => {
  const { user, isLoaded } = useUser();
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [requestSent, setRequestSent] = useState<boolean>(false);

  // API mutation hook
  const [requestRoleChange] = useRequestRoleChangeMutation();

  if (!isLoaded || !user) return null;

  const currentUserType = user.publicMetadata.userType as string || "student";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Call the actual API endpoint
      await requestRoleChange({
        userId: user.id,
        requestedRole: selectedRole,
        reason,
      }).unwrap();
      
      setRequestSent(true);
      toast.success("Role change request submitted successfully");
    } catch (error) {
      console.error("Error submitting role change request", error);
      toast.error("Failed to submit role change request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCurrentRoleBadge = () => {
    switch (currentUserType) {
      case "student":
        return (
          <Badge className="bg-green-600 hover:bg-green-700">
            <User className="h-3 w-3 mr-1" />
            Student
          </Badge>
        );
      case "teacher":
        return (
          <Badge className="bg-blue-600 hover:bg-blue-700">
            <GraduationCap className="h-3 w-3 mr-1" />
            Teacher
          </Badge>
        );
      case "admin":
        return (
          <Badge className="bg-purple-600 hover:bg-purple-700">
            <UserCog className="h-3 w-3 mr-1" />
            Admin
          </Badge>
        );
      default:
        return (
          <Badge>
            <User className="h-3 w-3 mr-1" />
            {currentUserType}
          </Badge>
        );
    }
  };

  if (requestSent) {
    return (
      <Card className="p-6 bg-slate-900 border-slate-700">
        <div className="flex flex-col items-center justify-center text-center py-6">
          <div className="bg-green-600/20 p-4 rounded-full mb-4">
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Request Submitted</h3>
          <p className="text-slate-400 mb-6 max-w-md">
            Your request to change your role to <span className="font-medium text-white">{selectedRole}</span> has been submitted. 
            Our team will review your request and get back to you soon.
          </p>
          <Button
            variant="outline"
            className="bg-slate-800 border-slate-700 hover:bg-slate-700"
            onClick={() => setRequestSent(false)}
          >
            Submit Another Request
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-slate-900 border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">Request Role Change</h3>
        <div>{getCurrentRoleBadge()}</div>
      </div>

      <div className="bg-slate-800/50 p-4 rounded-md mb-6 flex items-start">
        <Info className="h-5 w-5 text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-slate-300">
          If you would like to change your role on the platform, please submit a request using the form below. 
          Our administrators will review your request and take appropriate action.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-slate-300 mb-2">
              Requested Role
            </label>
            <Select
              value={selectedRole}
              onValueChange={setSelectedRole}
              required
            >
              <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700">
                {currentUserType !== "teacher" && (
                  <SelectItem value="teacher">Teacher</SelectItem>
                )}
                {currentUserType !== "admin" && (
                  <SelectItem value="admin">Administrator</SelectItem>
                )}
                {currentUserType !== "student" && (
                  <SelectItem value="student">Student</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-slate-300 mb-2">
              Reason for Request
            </label>
            <Textarea
              id="reason"
              placeholder="Please explain why you are requesting this role change..."
              className="bg-slate-800 border-slate-700 text-slate-200 resize-none min-h-[120px]"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 w-full"
            disabled={isSubmitting || !selectedRole || !reason}
          >
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default RequestRoleChange;
