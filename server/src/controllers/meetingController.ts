import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import Meeting from "../models/meetingModel";
import { getAuth } from "@clerk/express";

// Type for extending Request to include authenticated user
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    name?: string;
    email?: string;
    imageUrl?: string;
    role?: "student" | "teacher" | "admin";
  };
}

/**
 * Get all meetings for a teacher
 */
export const getTeacherMeetings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { teacherId } = req.params;
    const { userId } = getAuth(req);
    
    if (!teacherId) {
      res.status(400).json({ message: "Teacher ID is required" });
      return;
    }
    
    // Check if user is requesting their own meetings
    if (teacherId !== userId) {
      res.status(403).json({ message: "Access denied" });
      return;
    }
    
    const meetings = await Meeting.scan("teacherId").eq(teacherId).exec();
    
    res.status(200).json(meetings);
  } catch (error: any) {
    console.error("Error getting teacher meetings:", error);
    res.status(500).json({ 
      message: "Failed to get teacher meetings", 
      error: error.message 
    });
  }
};

/**
 * Get all meetings for a student
 */
export const getStudentMeetings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params;
    const { userId } = getAuth(req);
    
    if (!studentId) {
      res.status(400).json({ message: "Student ID is required" });
      return;
    }
    
    // Check if user is requesting their own meetings
    if (studentId !== userId) {
      res.status(403).json({ message: "Access denied" });
      return;
    }
    
    // Scan all meetings and filter for those that include the student
    const allMeetings = await Meeting.scan().exec();
    
    // Filter meetings where the student is a participant
    const studentMeetings = allMeetings.filter((meeting: any) => {
      return meeting.participants.some((p: any) => p.studentId === studentId);
    });
    
    res.status(200).json(studentMeetings);
  } catch (error: any) {
    console.error("Error getting student meetings:", error);
    res.status(500).json({ 
      message: "Failed to get student meetings", 
      error: error.message 
    });
  }
};

/**
 * Get all meetings for a course
 */
export const getCourseMeetings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    
    if (!courseId) {
      res.status(400).json({ message: "Course ID is required" });
      return;
    }
    
    const meetings = await Meeting.scan("courseId").eq(courseId).exec();
    
    res.status(200).json(meetings);
  } catch (error: any) {
    console.error("Error getting course meetings:", error);
    res.status(500).json({ 
      message: "Failed to get course meetings", 
      error: error.message 
    });
  }
};

/**
 * Get a single meeting by ID
 */
export const getMeeting = async (req: Request, res: Response): Promise<void> => {
  try {
    const { meetingId } = req.params;
    const { userId } = getAuth(req);
    
    if (!meetingId) {
      res.status(400).json({ message: "Meeting ID is required" });
      return;
    }
    
    const meeting = await Meeting.get(meetingId);
    
    if (!meeting) {
      res.status(404).json({ message: "Meeting not found" });
      return;
    }
    
    // Check if the user is the teacher or a participant in the meeting
    const isTeacher = meeting.teacherId === userId;
    const isParticipant = meeting.participants.some((p: any) => p.studentId === userId);
    
    if (!isTeacher && !isParticipant) {
      res.status(403).json({ message: "Access denied" });
      return;
    }
    
    res.status(200).json(meeting);
  } catch (error: any) {
    console.error("Error getting meeting:", error);
    res.status(500).json({ 
      message: "Failed to get meeting", 
      error: error.message 
    });
  }
};

/**
 * Create a new meeting
 */
export const createMeeting = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { userId } = getAuth(req);
    const { 
      title, 
      description, 
      courseId,
      courseName,
      date, 
      startTime, 
      duration, 
      type,
      meetingLink,
      location,
      participants 
    } = req.body;
    
    if (!title || !date || !startTime || !duration || !type) {
      res.status(400).json({ 
        message: "Title, date, start time, duration, and type are required" 
      });
      return;
    }
    
    // Ensure only teachers can create meetings
    if (req.user?.role !== "teacher" && req.user?.role !== "admin") {
      res.status(403).json({ message: "Only teachers can create meetings" });
      return;
    }
    
    const meeting = new Meeting({
      meetingId: uuidv4(),
      teacherId: userId,
      teacherName: req.user?.name || "Unknown Teacher",
      title,
      description: description || "",
      courseId: courseId || null,
      courseName: courseName || null,
      date,
      startTime,
      duration,
      type,
      status: participants && participants.length > 0 ? "pending" : "scheduled",
      meetingLink: meetingLink || null,
      location: location || null,
      participants: participants || [],
      notes: "",
      recordings: []
    });
    
    await meeting.save();
    
    res.status(201).json(meeting);
  } catch (error: any) {
    console.error("Error creating meeting:", error);
    res.status(500).json({ 
      message: "Failed to create meeting", 
      error: error.message 
    });
  }
};

/**
 * Update a meeting
 */
export const updateMeeting = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { meetingId } = req.params;
    const { userId } = getAuth(req);
    const updateData = req.body;
    
    // Get the existing meeting
    const meeting = await Meeting.get(meetingId);
    
    if (!meeting) {
      res.status(404).json({ message: "Meeting not found" });
      return;
    }
    
    // Check if the user is the teacher who created the meeting
    if (meeting.teacherId !== userId && req.user?.role !== "admin") {
      res.status(403).json({ 
        message: "You don't have permission to update this meeting" 
      });
      return;
    }
    
    // Apply updates
    Object.assign(meeting, updateData);
    
    // Save updated meeting
    await meeting.save();
    
    res.status(200).json(meeting);
  } catch (error: any) {
    console.error("Error updating meeting:", error);
    res.status(500).json({ 
      message: "Failed to update meeting", 
      error: error.message 
    });
  }
};

/**
 * Delete a meeting
 */
export const deleteMeeting = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { meetingId } = req.params;
    const { userId } = getAuth(req);
    
    // Get the meeting to check ownership
    const meeting = await Meeting.get(meetingId);
    
    if (!meeting) {
      res.status(404).json({ message: "Meeting not found" });
      return;
    }
    
    // Check if the user is the teacher who created the meeting
    if (meeting.teacherId !== userId && req.user?.role !== "admin") {
      res.status(403).json({ 
        message: "You don't have permission to delete this meeting" 
      });
      return;
    }
    
    // Delete the meeting
    await Meeting.delete(meetingId);
    
    res.status(200).json({ message: "Meeting deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting meeting:", error);
    res.status(500).json({ 
      message: "Failed to delete meeting", 
      error: error.message 
    });
  }
};

/**
 * Student responds to meeting invitation
 */
export const respondToMeeting = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { meetingId } = req.params;
    const { userId } = getAuth(req);
    const { response } = req.body; // 'confirmed' or 'cancelled'
    
    if (!response || (response !== 'confirmed' && response !== 'cancelled')) {
      res.status(400).json({ message: "Valid response (confirmed or cancelled) is required" });
      return;
    }
    
    // Get the meeting
    const meeting = await Meeting.get(meetingId);
    
    if (!meeting) {
      res.status(404).json({ message: "Meeting not found" });
      return;
    }
    
    // Find the participant
    const participantIndex = meeting.participants.findIndex(
      (p: any) => p.studentId === userId
    );
    
    if (participantIndex === -1) {
      res.status(404).json({ message: "You are not a participant in this meeting" });
      return;
    }
    
    // Update participant status
    meeting.participants[participantIndex].status = response;
    
    // Check if all participants have responded
    const allResponded = meeting.participants.every(
      (p: any) => p.status !== 'pending'
    );
    
    // If all have responded, update meeting status to scheduled or cancelled
    if (allResponded) {
      const anyConfirmed = meeting.participants.some(
        (p: any) => p.status === 'confirmed'
      );
      meeting.status = anyConfirmed ? 'scheduled' : 'cancelled';
    }
    
    // Save updated meeting
    await meeting.save();
    
    res.status(200).json({ message: `Meeting response updated to ${response}` });
  } catch (error: any) {
    console.error("Error responding to meeting:", error);
    res.status(500).json({ 
      message: "Failed to respond to meeting", 
      error: error.message 
    });
  }
};

/**
 * Add notes to a meeting (usually after it's completed)
 */
export const addMeetingNotes = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { meetingId } = req.params;
    const { userId } = getAuth(req);
    const { notes } = req.body;
    
    if (!notes) {
      res.status(400).json({ message: "Notes content is required" });
      return;
    }
    
    // Get the meeting
    const meeting = await Meeting.get(meetingId);
    
    if (!meeting) {
      res.status(404).json({ message: "Meeting not found" });
      return;
    }
    
    // Check if the user is the teacher who created the meeting
    if (meeting.teacherId !== userId && req.user?.role !== "admin") {
      res.status(403).json({ 
        message: "You don't have permission to add notes to this meeting" 
      });
      return;
    }
    
    // Update meeting notes
    meeting.notes = notes;
    
    // If meeting was scheduled, mark it as completed
    if (meeting.status === 'scheduled') {
      meeting.status = 'completed';
    }
    
    // Save updated meeting
    await meeting.save();
    
    res.status(200).json({ message: "Meeting notes added successfully" });
  } catch (error: any) {
    console.error("Error adding meeting notes:", error);
    res.status(500).json({ 
      message: "Failed to add meeting notes", 
      error: error.message 
    });
  }
}; 