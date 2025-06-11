import { Request, Response } from "express";
import { getAuth } from "@clerk/express";
import UserCourseProgress from "../models/userCourseProgressModel";
import Course from "../models/courseModel";
import { v4 as uuidv4 } from "uuid";

// Define interfaces for progress data
interface ChapterProgress {
  chapterId: string;
  completed: boolean;
}

interface SectionProgress {
  sectionId: string;
  chapters: ChapterProgress[];
}

interface ProgressUpdateData {
  sections: SectionProgress[];
}

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
    // Use scan instead of query to avoid index dependency issues
    // Filter by userId to get user's enrolled courses
    const enrolledCourses = await UserCourseProgress.scan("userId").eq(userId).exec();
    
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
    
    // If it's a validation error related to index, try alternative approach
    if (error instanceof Error && error.message.includes("index")) {
      try {
        console.log("Index error detected, falling back to scan all records");
        
        // Fallback: scan all records and filter client-side
        const allProgress = await UserCourseProgress.scan().exec();
        const userProgress = allProgress.filter((item: any) => item.userId === userId);
        
        if (!userProgress || userProgress.length === 0) {
          res.json({
            message: "No enrolled courses found",
            data: []
          });
          return;
        }
        
        const courseIds = userProgress.map((item: any) => item.courseId);
        
        if (!courseIds.length) {
          res.json({
            message: "No valid course IDs found in enrollments",
            data: []
          });
          return;
        }
        
        try {
          const courses = await Course.batchGet(courseIds);
          res.json({
            message: "Enrolled courses retrieved successfully (fallback method)",
            data: courses || []
          });
        } catch (courseError) {
          console.error("Error fetching course details in fallback:", courseError);
          res.json({
            message: "Error retrieving course details",
            data: []
          });
        }
      } catch (fallbackError) {
        console.error("Fallback method also failed:", fallbackError);
        res.json({
          message: "Error retrieving enrolled courses",
          data: []
        });
      }
    } else {
      // Return an empty array instead of an error to prevent client errors
      res.json({
        message: "Error retrieving enrolled courses",
        data: []
      });
    }
  }
};

export const getUserCourseProgress = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId, courseId } = req.params;
  
  try {
    // Get the current authenticated user from Clerk
    const auth = getAuth(req);
    
    // If userId is not the authenticated user, check if the authenticated user is the course teacher
    if (userId !== auth.userId) {
      const course = await Course.get(courseId);
      
      if (!course) {
        res.status(404).json({ message: "Course not found" });
        return;
      }
      
      // If the authenticated user is not the course teacher, deny access
      if (course.teacherId !== auth.userId) {
        res.status(403).json({ 
          message: "You don't have permission to access this user's course progress" 
        });
        return;
      }
      
      // If user is the teacher of this course and trying to preview, 
      // return a dummy progress object for preview purposes
      res.json({
        message: "Preview mode: Dummy progress returned for teacher",
        data: {
          userId,
          courseId,
          isPreview: true,
          sections: course.sections?.map((section: any) => ({
            sectionId: section.sectionId,
            chapters: section.chapters?.map((chapter: any) => ({
              chapterId: chapter.chapterId,
              completed: false
            })) || []
          })) || []
        }
      });
      return;
    }
    
    // Try to find existing progress using scan instead of query to avoid index issues
    let progress;
    try {
      progress = await UserCourseProgress.scan()
        .where("userId").eq(userId)
        .where("courseId").eq(courseId)
        .exec();
    } catch (scanError) {
      console.log("Scan failed, trying alternative approach");
      // Fallback: scan all and filter client-side
      const allProgress = await UserCourseProgress.scan().exec();
      progress = allProgress.filter((item: any) => 
        item.userId === userId && item.courseId === courseId
      );
    }
    
    if (progress && progress.length > 0) {
      res.json({
        message: "Course progress retrieved successfully",
        data: progress[0]
      });
      return;
    }
    
    // If no progress found, get the course to create initial progress structure
    const course = await Course.get(courseId);
    
    if (!course) {
      res.status(404).json({ message: "Course not found" });
      return;
    }
    
    // Create initial progress structure
    const initialProgress = new UserCourseProgress({
      id: uuidv4(),
      userId,
      courseId,
      sections: course.sections?.map((section: any) => ({
        sectionId: section.sectionId,
        chapters: section.chapters?.map((chapter: any) => ({
          chapterId: chapter.chapterId,
          completed: false
        })) || []
      })) || []
    });
    
    // Save new progress
    await initialProgress.save();
    
    res.json({
      message: "Initial course progress created successfully",
      data: initialProgress
    });
  } catch (error) {
    console.error("Error getting user course progress:", error);
    res.status(500).json({ 
      message: "Error retrieving course progress", 
      error: error instanceof Error ? error.message : "Unknown error" 
    });
  }
};

export const updateUserCourseProgress = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId, courseId } = req.params;
  const progressData = req.body as ProgressUpdateData;
  
  try {
    // Authenticate user
    const auth = getAuth(req);
    
    if (userId !== auth.userId) {
      res.status(403).json({ 
        message: "You don't have permission to update this user's course progress" 
      });
      return;
    }
    
    // Find existing progress using scan instead of query to avoid index issues
    let existingProgress;
    try {
      existingProgress = await UserCourseProgress.scan()
        .where("userId").eq(userId)
        .where("courseId").eq(courseId)
        .exec();
    } catch (scanError) {
      console.log("Scan failed in updateUserCourseProgress, trying alternative approach");
      // Fallback: scan all and filter client-side
      const allProgress = await UserCourseProgress.scan().exec();
      existingProgress = allProgress.filter((item: any) => 
        item.userId === userId && item.courseId === courseId
      );
    }
    
    if (!existingProgress || existingProgress.length === 0) {
      // Create new progress
      const newProgress = new UserCourseProgress({
        id: uuidv4(),
        userId,
        courseId,
        sections: progressData.sections || []
      });
      
      await newProgress.save();
      
      res.json({
        message: "Course progress created successfully",
        data: newProgress
      });
      return;
    }
    
    // Update existing progress
    const currentProgress = existingProgress[0];
    
    // Update sections and chapters based on the request
    if (progressData.sections) {
      progressData.sections.forEach((newSection: SectionProgress) => {
        // Find existing section or create it
        let existingSection = currentProgress.sections?.find(
          (s: any) => s.sectionId === newSection.sectionId
        );
        
        if (!existingSection) {
          if (!currentProgress.sections) {
            currentProgress.sections = [];
          }
          
          existingSection = {
            sectionId: newSection.sectionId,
            chapters: []
          };
          
          currentProgress.sections.push(existingSection);
        }
        
        // Update chapters in the section
        if (newSection.chapters) {
          newSection.chapters.forEach((newChapter: ChapterProgress) => {
            // Find existing chapter or create it
            let existingChapter = existingSection?.chapters?.find(
              (c: any) => c.chapterId === newChapter.chapterId
            );
            
            if (!existingChapter) {
              if (!existingSection?.chapters) {
                existingSection.chapters = [];
              }
              
              existingChapter = {
                chapterId: newChapter.chapterId,
                completed: newChapter.completed || false
              };
              
              existingSection?.chapters?.push(existingChapter);
            } else {
              // Update existing chapter
              existingChapter.completed = newChapter.completed;
            }
          });
        }
      });
    }
    
    // Save updated progress
    await currentProgress.save();
    
    res.json({
      message: "Course progress updated successfully",
      data: currentProgress
    });
  } catch (error) {
    console.error("Error updating user course progress:", error);
    res.status(500).json({ 
      message: "Error updating course progress", 
      error: error instanceof Error ? error.message : "Unknown error" 
    });
  }
};