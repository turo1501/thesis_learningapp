import { Request, Response } from "express";
import Course from "../models/courseModel";
import { v4 as uuidv4 } from "uuid";
import { getAuth } from "@clerk/express";
import { clerkClient } from "../index";

// Add a comment to a chapter
export const addComment = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId } = getAuth(req);
  const { courseId, sectionId, chapterId } = req.params;
  const { text } = req.body;
  
  if (!text || text.trim() === "") {
    res.status(400).json({ message: "Comment text is required" });
    return;
  }

  try {
    const course = await Course.get(courseId);
    
    if (!course) {
      res.status(404).json({ message: "Course not found" });
      return;
    }

    // Find the relevant section and chapter
    const sectionIndex = course.sections.findIndex(
      (section: any) => section.sectionId === sectionId
    );

    if (sectionIndex === -1) {
      res.status(404).json({ message: "Section not found" });
      return;
    }

    const chapterIndex = course.sections[sectionIndex].chapters.findIndex(
      (chapter: any) => chapter.chapterId === chapterId
    );

    if (chapterIndex === -1) {
      res.status(404).json({ message: "Chapter not found" });
      return;
    }

    // Create the comment
    const newComment = {
      commentId: uuidv4(),
      userId: userId as string,
      text,
      timestamp: new Date().toISOString(),
    };

    // Initialize comments array if it doesn't exist
    if (!course.sections[sectionIndex].chapters[chapterIndex].comments) {
      course.sections[sectionIndex].chapters[chapterIndex].comments = [];
    }

    // Add comment to the chapter
    course.sections[sectionIndex].chapters[chapterIndex].comments.push(newComment);

    await course.save();
    
    res.status(201).json({
      message: "Comment added successfully",
      data: newComment,
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: "Error adding comment", error });
  }
};

// Get all comments for a chapter
export const getChapterComments = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { courseId, sectionId, chapterId } = req.params;

  try {
    const course = await Course.get(courseId);
    
    if (!course) {
      res.status(404).json({ message: "Course not found" });
      return;
    }

    // Find the relevant section and chapter
    const section = course.sections.find(
      (section: any) => section.sectionId === sectionId
    );

    if (!section) {
      res.status(404).json({ message: "Section not found" });
      return;
    }

    const chapter = section.chapters.find(
      (chapter: any) => chapter.chapterId === chapterId
    );

    if (!chapter) {
      res.status(404).json({ message: "Chapter not found" });
      return;
    }

    // Return the comments (or empty array if none exist)
    const comments = chapter.comments || [];
    
    // For each comment, fetch user info from Clerk to add user name and avatar
    const commentsWithUserInfo = await Promise.all(
      comments.map(async (comment: any) => {
        // Skip fetching user info if there's no userId
        if (!comment.userId) {
          return {
            ...comment,
            userName: "Unknown User",
            userAvatar: null
          };
        }
        
        try {
          // Fetch user info from Clerk
          const user = await clerkClient.users.getUser(comment.userId);
          
          return {
            ...comment,
            userName: user.firstName 
              ? `${user.firstName} ${user.lastName || ''}`.trim() 
              : "User",
            userAvatar: user.imageUrl
          };
        } catch (error) {
          console.error(`Error fetching user data for userId: ${comment.userId}`, error);
          return {
            ...comment,
            userName: "User",
            userAvatar: null
          };
        }
      })
    );
    
    res.json({
      message: "Comments retrieved successfully",
      data: commentsWithUserInfo,
    });
  } catch (error) {
    console.error("Error retrieving comments:", error);
    res.status(500).json({ message: "Error retrieving comments", error });
  }
};

// Delete a comment
export const deleteComment = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId } = getAuth(req);
  const { courseId, sectionId, chapterId, commentId } = req.params;

  try {
    const course = await Course.get(courseId);
    
    if (!course) {
      res.status(404).json({ message: "Course not found" });
      return;
    }

    // Find the relevant section and chapter
    const sectionIndex = course.sections.findIndex(
      (section: any) => section.sectionId === sectionId
    );

    if (sectionIndex === -1) {
      res.status(404).json({ message: "Section not found" });
      return;
    }

    const chapterIndex = course.sections[sectionIndex].chapters.findIndex(
      (chapter: any) => chapter.chapterId === chapterId
    );

    if (chapterIndex === -1) {
      res.status(404).json({ message: "Chapter not found" });
      return;
    }

    // Find the comment to delete
    const chapter = course.sections[sectionIndex].chapters[chapterIndex];
    
    if (!chapter.comments) {
      res.status(404).json({ message: "No comments found" });
      return;
    }
    
    const commentIndex = chapter.comments.findIndex(
      (comment: any) => comment.commentId === commentId
    );

    if (commentIndex === -1) {
      res.status(404).json({ message: "Comment not found" });
      return;
    }

    // Check if user is authorized to delete this comment
    const comment = chapter.comments[commentIndex];
    if (comment.userId !== userId && course.teacherId !== userId) {
      res.status(403).json({ message: "Not authorized to delete this comment" });
      return;
    }

    // Remove the comment
    chapter.comments.splice(commentIndex, 1);
    await course.save();
    
    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ message: "Error deleting comment", error });
  }
}; 