import { Request, Response } from "express";
import { getAuth } from "@clerk/express";
import CourseReview from "../models/courseReviewModel";
import Course from "../models/courseModel";
import UserCourseProgress from "../models/userCourseProgressModel";
import { v4 as uuidv4 } from "uuid";

// Get all reviews for a course
export const getCourseReviews = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { courseId } = req.params;
  
  try {
    // Query reviews for the specific course
    const reviews = await CourseReview.query("courseId")
      .eq(courseId)
      .exec();
    
    // Return the reviews
    res.json({
      message: "Course reviews retrieved successfully",
      data: reviews || []
    });
  } catch (error) {
    console.error("Error retrieving course reviews:", error);
    res.status(500).json({
      message: "Error retrieving course reviews",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

// Create a new review
export const createCourseReview = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { courseId } = req.params;
  const auth = getAuth(req);
  const userId = auth.userId;
  
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  
  try {
    // Check if course exists
    const course = await Course.get(courseId);
    
    if (!course) {
      res.status(404).json({ message: "Course not found" });
      return;
    }
    
    // Check if the user is enrolled in the course
    const userEnrolled = course.enrollments?.some((enrollment: any) => 
      enrollment.userId === userId
    );
    
    if (!userEnrolled) {
      res.status(403).json({ 
        message: "You must be enrolled in the course to review it" 
      });
      return;
    }
    
    // Check if user already reviewed this course
    const existingReview = await CourseReview.query()
      .where("userId").eq(userId)
      .where("courseId").eq(courseId)
      .exec();
    
    if (existingReview && existingReview.length > 0) {
      res.status(400).json({ 
        message: "You have already reviewed this course",
        reviewId: existingReview[0].id
      });
      return;
    }
    
    // Get user course progress to determine completion status
    const userProgress = await UserCourseProgress.query()
      .where("userId").eq(userId)
      .where("courseId").eq(courseId)
      .exec();
    
    const progressPercentage = userProgress && userProgress.length > 0 
      ? userProgress[0].overallProgress 
      : 0;
    
    const isCompletedReview = progressPercentage >= 100;
    
    // Extract review data from request body
    const { 
      rating, 
      reviewText, 
      contentQuality, 
      instructorEngagement, 
      courseStructure,
      userName,
      userImage
    } = req.body;
    
    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      res.status(400).json({ message: "Invalid rating. Must be between 1 and 5" });
      return;
    }
    
    // Create the review
    const newReview = new CourseReview({
      id: uuidv4(),
      userId,
      courseId,
      userName,
      userImage,
      rating,
      reviewText,
      contentQuality,
      instructorEngagement,
      courseStructure,
      progressPercentage,
      isCompletedReview,
      verifiedPurchase: true,
      helpfulCount: 0,
      helpfulUsers: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    // Save the review
    await newReview.save();
    
    res.status(201).json({
      message: "Review created successfully",
      data: newReview
    });
  } catch (error) {
    console.error("Error creating course review:", error);
    res.status(500).json({
      message: "Error creating course review",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

// Update an existing review
export const updateCourseReview = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { reviewId } = req.params;
  const auth = getAuth(req);
  const userId = auth.userId;
  
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  
  try {
    // Get the review
    const review = await CourseReview.get(reviewId);
    
    if (!review) {
      res.status(404).json({ message: "Review not found" });
      return;
    }
    
    // Check if the user is the owner of the review
    if (review.userId !== userId) {
      res.status(403).json({ 
        message: "You can only update your own reviews" 
      });
      return;
    }
    
    // Extract update data from request body
    const { 
      rating, 
      reviewText, 
      contentQuality, 
      instructorEngagement, 
      courseStructure 
    } = req.body;
    
    // Update fields if provided
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        res.status(400).json({ message: "Invalid rating. Must be between 1 and 5" });
        return;
      }
      review.rating = rating;
    }
    
    if (reviewText !== undefined) review.reviewText = reviewText;
    if (contentQuality !== undefined) review.contentQuality = contentQuality;
    if (instructorEngagement !== undefined) review.instructorEngagement = instructorEngagement;
    if (courseStructure !== undefined) review.courseStructure = courseStructure;
    
    // Update timestamp
    review.updatedAt = new Date().toISOString();
    
    // Save the updated review
    await review.save();
    
    res.json({
      message: "Review updated successfully",
      data: review
    });
  } catch (error) {
    console.error("Error updating course review:", error);
    res.status(500).json({
      message: "Error updating course review",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

// Delete a review
export const deleteCourseReview = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { reviewId } = req.params;
  const auth = getAuth(req);
  const userId = auth.userId;
  
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  
  try {
    // Get the review
    const review = await CourseReview.get(reviewId);
    
    if (!review) {
      res.status(404).json({ message: "Review not found" });
      return;
    }
    
    // Check if the user is the owner of the review or an admin
    if (review.userId !== userId && !auth.sessionClaims?.admin) {
      res.status(403).json({ 
        message: "You can only delete your own reviews" 
      });
      return;
    }
    
    // Delete the review
    await CourseReview.delete(reviewId);
    
    res.json({
      message: "Review deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting course review:", error);
    res.status(500).json({
      message: "Error deleting course review",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

// Mark a review as helpful or unhelpful
export const markReviewHelpful = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { reviewId } = req.params;
  const { helpful } = req.body;
  const auth = getAuth(req);
  const userId = auth.userId;
  
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  
  try {
    // Get the review
    const review = await CourseReview.get(reviewId);
    
    if (!review) {
      res.status(404).json({ message: "Review not found" });
      return;
    }
    
    // Prevent users from marking their own reviews
    if (review.userId === userId) {
      res.status(400).json({ 
        message: "You cannot mark your own review as helpful" 
      });
      return;
    }
    
    // Initialize helpfulUsers array if it doesn't exist
    if (!review.helpfulUsers) {
      review.helpfulUsers = [];
    }
    
    const hasMarked = review.helpfulUsers.includes(userId);
    
    if (helpful) {
      // If user already marked as helpful, do nothing
      if (hasMarked) {
        res.json({
          message: "Review already marked as helpful",
          data: review
        });
        return;
      }
      
      // Add user to helpfulUsers and increment count
      review.helpfulUsers.push(userId);
      review.helpfulCount = (review.helpfulCount || 0) + 1;
    } else {
      // If user hasn't marked as helpful, do nothing
      if (!hasMarked) {
        res.json({
          message: "Review was not previously marked as helpful",
          data: review
        });
        return;
      }
      
      // Remove user from helpfulUsers and decrement count
      review.helpfulUsers = review.helpfulUsers.filter((id: string) => id !== userId);
      review.helpfulCount = (review.helpfulCount || 1) - 1;
    }
    
    // Save the updated review
    await review.save();
    
    res.json({
      message: helpful ? "Review marked as helpful" : "Review unmarked as helpful",
      data: review
    });
  } catch (error) {
    console.error("Error marking review as helpful:", error);
    res.status(500).json({
      message: "Error marking review as helpful",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

// Get course rating stats
export const getCourseRatingStats = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { courseId } = req.params;
  
  try {
    // Query reviews for the specific course
    const reviews = await CourseReview.query("courseId")
      .eq(courseId)
      .exec();
    
    // If no reviews, return zeros
    if (!reviews || reviews.length === 0) {
      res.json({
        message: "No reviews found for this course",
        data: {
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: {
            "5": 0,
            "4": 0,
            "3": 0,
            "2": 0,
            "1": 0
          },
          categoryRatings: {
            contentQuality: 0,
            instructorEngagement: 0,
            courseStructure: 0
          }
        }
      });
      return;
    }
    
    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;
    
    // Calculate rating distribution
    const ratingDistribution = {
      "5": 0,
      "4": 0,
      "3": 0,
      "2": 0,
      "1": 0
    };
    
    reviews.forEach(review => {
      const rating = String(review.rating) as keyof typeof ratingDistribution;
      ratingDistribution[rating]++;
    });
    
    // Calculate category ratings
    let contentQualityTotal = 0;
    let contentQualityCount = 0;
    let instructorEngagementTotal = 0;
    let instructorEngagementCount = 0;
    let courseStructureTotal = 0;
    let courseStructureCount = 0;
    
    reviews.forEach(review => {
      if (review.contentQuality) {
        contentQualityTotal += review.contentQuality;
        contentQualityCount++;
      }
      if (review.instructorEngagement) {
        instructorEngagementTotal += review.instructorEngagement;
        instructorEngagementCount++;
      }
      if (review.courseStructure) {
        courseStructureTotal += review.courseStructure;
        courseStructureCount++;
      }
    });
    
    const categoryRatings = {
      contentQuality: contentQualityCount > 0 ? contentQualityTotal / contentQualityCount : 0,
      instructorEngagement: instructorEngagementCount > 0 ? instructorEngagementTotal / instructorEngagementCount : 0,
      courseStructure: courseStructureCount > 0 ? courseStructureTotal / courseStructureCount : 0
    };
    
    // Return the stats
    res.json({
      message: "Course rating statistics retrieved successfully",
      data: {
        averageRating,
        totalReviews: reviews.length,
        ratingDistribution,
        categoryRatings
      }
    });
  } catch (error) {
    console.error("Error retrieving course rating stats:", error);
    res.status(500).json({
      message: "Error retrieving course rating stats",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
}; 