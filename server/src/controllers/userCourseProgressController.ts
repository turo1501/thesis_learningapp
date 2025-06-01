import { Request, Response } from "express";
import { getAuth } from "@clerk/express";
import UserCourseProgress from "../models/userCourseProgressModel";
import Course from "../models/courseModel";
import { calculateOverallProgress } from "../utils/utils";
import { mergeSections } from "../utils/utils";

export const getUserEnrolledCourses = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId } = req.params;
  const auth = getAuth(req);

  if (!auth || auth.userId !== userId) {
    res.status(403).json({ message: "Access denied" });
    return;
  }

  try {
    const enrolledCourses = await UserCourseProgress.query("userId")
      .eq(userId)
      .exec();
    
    // Handle case when no enrollments are found
    if (!enrolledCourses || enrolledCourses.length === 0) {
      // Return empty array instead of error
      res.json({
        message: "No enrolled courses found",
        data: []
      });
      return;
    }
    
    // Extract course IDs from progress records
    const courseIds = enrolledCourses.map((item: any) => item.courseId);
    
    // Ensure we have valid course IDs
    if (!courseIds.length) {
      res.json({
        message: "No valid course IDs found in enrollments",
        data: []
      });
      return;
    }
    
    try {
      // Get course data for enrolled courses
      const courses = await Course.batchGet(courseIds);
      
      // Always return JSON with consistent format
      res.json({
        message: "Enrolled courses retrieved successfully",
        data: courses || [] // Ensure we always return an array
      });
    } catch (courseError) {
      console.error("Error fetching course details:", courseError);
      // Return empty array if course fetch fails
      res.json({
        message: "Error retrieving course details",
        data: []
      });
    }
  } catch (error) {
    console.error("Error retrieving enrolled courses:", error);
    // Return an empty array instead of an error to prevent client errors
    res.json({
      message: "Error retrieving enrolled courses",
      data: []
    });
  }
};

export const getUserCourseProgress = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId, courseId } = req.params;

  try {
    const progress = await UserCourseProgress.get({ userId, courseId });
    if (!progress) {
      res
        .status(404)
        .json({ message: "Course progress not found for this user" });
      return;
    }
    res.json({
      message: "Course progress retrieved successfully",
      data: progress,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving user course progress", error });
  }
};

export const updateUserCourseProgress = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId, courseId } = req.params;
  const progressData = req.body;

  try {
    let progress = await UserCourseProgress.get({ userId, courseId });

    if (!progress) {
      // If no progress exists, create initial progress
      progress = new UserCourseProgress({
        userId,
        courseId,
        enrollmentDate: new Date().toISOString(),
        overallProgress: 0,
        sections: progressData.sections || [],
        lastAccessedTimestamp: new Date().toISOString(),
      });
    } else {
      // Merge existing progress with new progress data
      progress.sections = mergeSections(
        progress.sections,
        progressData.sections || []
      );
      progress.lastAccessedTimestamp = new Date().toISOString();
      progress.overallProgress = calculateOverallProgress(progress.sections);
    }

    await progress.save();

    res.json({
      message: "",
      data: progress,
    });
  } catch (error) {
    console.error("Error updating progress:", error);
    res.status(500).json({
      message: "Error updating user course progress",
      error,
    });
  }
};