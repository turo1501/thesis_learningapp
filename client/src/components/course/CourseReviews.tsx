"use client";

import React, { useState } from "react";
import {
  useGetCourseReviewsQuery,
  useGetCourseRatingStatsQuery,
  useMarkReviewHelpfulMutation,
  CourseReview,
  CourseRatingStats,
} from "@/state/api";
import { Star, ThumbsUp, ThumbsDown, BarChart, Check, X, Award, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import ReviewForm from "./ReviewForm";

interface CourseReviewsProps {
  courseId: string;
}

// Helper to format dates
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const CourseReviews: React.FC<CourseReviewsProps> = ({ courseId }) => {
  const { user, isLoaded } = useUser();
  const [markReviewHelpful] = useMarkReviewHelpfulMutation();
  const [showReviewForm, setShowReviewForm] = useState(false);
  
  const {
    data: reviews,
    isLoading: isLoadingReviews,
    error: reviewsError,
  } = useGetCourseReviewsQuery(courseId);
  
  const {
    data: stats,
    isLoading: isLoadingStats,
    error: statsError,
  } = useGetCourseRatingStatsQuery(courseId);
  
  // Handle marking a review as helpful
  const handleMarkHelpful = async (reviewId: string, helpful: boolean) => {
    if (!user) {
      toast.error("You must be logged in to mark reviews as helpful");
      return;
    }
    
    try {
      await markReviewHelpful({ reviewId, helpful }).unwrap();
      toast.success(helpful ? "Review marked as helpful" : "Feedback removed");
    } catch (error) {
      toast.error("Error updating review helpfulness");
      console.error("Error marking review helpful:", error);
    }
  };
  
  // Check if the current user has already reviewed
  const hasUserReviewed = user && reviews?.some(review => review.userId === user.id);
  
  return (
    <div className="course-reviews">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Student Reviews</h2>
        
        {user && !hasUserReviewed && !showReviewForm && (
          <Button 
            onClick={() => setShowReviewForm(true)}
            className="bg-primary-600 hover:bg-primary-500"
          >
            Write a Review
          </Button>
        )}
      </div>
      
      {showReviewForm && (
        <div className="mb-8">
          <ReviewForm 
            courseId={courseId} 
            onCancel={() => setShowReviewForm(false)} 
            onSuccess={() => setShowReviewForm(false)} 
          />
        </div>
      )}
      
      {isLoadingStats ? (
        <RatingStatsSkeleton />
      ) : statsError ? (
        <div className="text-red-500 mb-6">Error loading rating statistics</div>
      ) : stats && (
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-customgreys-secondarybg border border-customgreys-darkGrey/60 rounded-xl p-6">
            <div className="flex items-center justify-center flex-col">
              <div className="text-4xl font-bold text-white mb-2">{stats.averageRating.toFixed(1)}</div>
              <div className="flex items-center mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "w-5 h-5",
                      star <= Math.round(stats.averageRating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-customgreys-dirtyGrey"
                    )}
                  />
                ))}
              </div>
              <div className="text-customgreys-dirtyGrey text-sm">
                Based on {stats.totalReviews} {stats.totalReviews === 1 ? "review" : "reviews"}
              </div>
            </div>
          </div>
          
          <div className="bg-customgreys-secondarybg border border-customgreys-darkGrey/60 rounded-xl p-6">
            <h3 className="text-white font-medium mb-3">Rating Distribution</h3>
            {Object.entries(stats.ratingDistribution)
              .reverse()
              .map(([rating, count]) => (
                <div key={rating} className="flex items-center mb-2">
                  <div className="text-customgreys-dirtyGrey w-8">{rating} ★</div>
                  <Progress
                    value={(count / stats.totalReviews) * 100 || 0}
                    className="h-2 flex-1 bg-customgreys-darkGrey mx-3"
                  />
                  <div className="text-customgreys-dirtyGrey w-8 text-right">{count}</div>
                </div>
              ))}
          </div>
          
          <div className="bg-customgreys-secondarybg border border-customgreys-darkGrey/60 rounded-xl p-6">
            <h3 className="text-white font-medium mb-4">Detailed Ratings</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-customgreys-dirtyGrey text-sm">Content Quality</span>
                  <span className="text-white text-sm">{stats.categoryRatings.contentQuality.toFixed(1)}</span>
                </div>
                <Progress
                  value={(stats.categoryRatings.contentQuality / 5) * 100}
                  className="h-1.5 bg-customgreys-darkGrey"
                />
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-customgreys-dirtyGrey text-sm">Instructor Engagement</span>
                  <span className="text-white text-sm">{stats.categoryRatings.instructorEngagement.toFixed(1)}</span>
                </div>
                <Progress
                  value={(stats.categoryRatings.instructorEngagement / 5) * 100}
                  className="h-1.5 bg-customgreys-darkGrey"
                />
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-customgreys-dirtyGrey text-sm">Course Structure</span>
                  <span className="text-white text-sm">{stats.categoryRatings.courseStructure.toFixed(1)}</span>
                </div>
                <Progress
                  value={(stats.categoryRatings.courseStructure / 5) * 100}
                  className="h-1.5 bg-customgreys-darkGrey"
                />
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-white">
          {reviews?.length ? 'Student Feedback' : 'No Reviews Yet'}
        </h3>
        
        {isLoadingReviews ? (
          <div className="space-y-6">
            <ReviewSkeleton />
            <ReviewSkeleton />
          </div>
        ) : reviewsError ? (
          <div className="bg-red-900/20 text-red-500 p-4 rounded-lg">
            Error loading reviews. Please try again later.
          </div>
        ) : reviews?.length === 0 ? (
          <div className="bg-customgreys-secondarybg border border-customgreys-darkGrey/60 rounded-xl p-8 text-center">
            <div className="text-4xl mb-3">⭐</div>
            <p className="text-white mb-2">No reviews yet</p>
            <p className="text-customgreys-dirtyGrey text-sm mb-4">
              Be the first to share your experience with this course
            </p>
            {user && !hasUserReviewed && !showReviewForm && (
              <Button 
                onClick={() => setShowReviewForm(true)}
                className="bg-primary-600 hover:bg-primary-500"
              >
                Write a Review
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {reviews?.map((review) => (
              <ReviewCard 
                key={review.id} 
                review={review} 
                onMarkHelpful={handleMarkHelpful}
                currentUserId={user?.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Individual review card component
const ReviewCard: React.FC<{ 
  review: CourseReview; 
  onMarkHelpful: (reviewId: string, helpful: boolean) => void;
  currentUserId?: string;
}> = ({ review, onMarkHelpful, currentUserId }) => {
  const isHelpfulByUser = review.helpfulUsers?.includes(currentUserId || '');
  
  return (
    <div className="bg-customgreys-secondarybg border border-customgreys-darkGrey/60 rounded-xl p-6">
      <div className="flex justify-between mb-4">
        <div className="flex items-center">
          <Avatar className="mr-3 h-10 w-10">
            <AvatarImage 
              src={review.userImage} 
              alt={review.userName} 
            />
            <AvatarFallback className="bg-primary-700 text-white">
              {review.userName?.charAt(0) || '?'}
            </AvatarFallback>
          </Avatar>
          
          <div>
            <div className="font-medium text-white">{review.userName}</div>
            <div className="flex items-center text-sm text-customgreys-dirtyGrey space-x-3">
              <time>{formatDate(review.createdAt)}</time>
              
              {review.verifiedPurchase && (
                <div className="flex items-center text-green-400 text-xs">
                  <Check className="w-3 h-3 mr-1" />
                  <span>Verified Purchase</span>
                </div>
              )}
              
              {review.isCompletedReview && (
                <div className="flex items-center text-blue-400 text-xs">
                  <Award className="w-3 h-3 mr-1" />
                  <span>Completed Course</span>
                </div>
              )}
              
              {!review.isCompletedReview && review.progressPercentage && review.progressPercentage > 0 && (
                <div className="flex items-center text-yellow-400 text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  <span>{Math.round(review.progressPercentage)}% Complete</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={cn(
                "w-4 h-4",
                star <= review.rating
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-customgreys-dirtyGrey"
              )}
            />
          ))}
        </div>
      </div>
      
      {review.reviewText && (
        <div className="text-white mb-4">{review.reviewText}</div>
      )}
      
      {(review.contentQuality || review.instructorEngagement || review.courseStructure) && (
        <div className="grid grid-cols-3 gap-3 mb-4">
          {review.contentQuality && (
            <div className="bg-customgreys-darkGrey/50 p-3 rounded-lg">
              <div className="text-customgreys-dirtyGrey text-xs mb-1">Content</div>
              <div className="flex items-center">
                <div className="text-white font-medium mr-2">{review.contentQuality}</div>
                <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              </div>
            </div>
          )}
          
          {review.instructorEngagement && (
            <div className="bg-customgreys-darkGrey/50 p-3 rounded-lg">
              <div className="text-customgreys-dirtyGrey text-xs mb-1">Instructor</div>
              <div className="flex items-center">
                <div className="text-white font-medium mr-2">{review.instructorEngagement}</div>
                <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              </div>
            </div>
          )}
          
          {review.courseStructure && (
            <div className="bg-customgreys-darkGrey/50 p-3 rounded-lg">
              <div className="text-customgreys-dirtyGrey text-xs mb-1">Structure</div>
              <div className="flex items-center">
                <div className="text-white font-medium mr-2">{review.courseStructure}</div>
                <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              </div>
            </div>
          )}
        </div>
      )}
      
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-customgreys-darkGrey/50">
        <div className="text-sm text-customgreys-dirtyGrey">
          {review.helpfulCount || 0} {review.helpfulCount === 1 ? 'person' : 'people'} found this helpful
        </div>
        
        {currentUserId && currentUserId !== review.userId && (
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMarkHelpful(review.id, !isHelpfulByUser)}
              className={cn(
                "text-customgreys-dirtyGrey hover:text-white",
                isHelpfulByUser && "text-green-500 hover:text-green-400"
              )}
            >
              {isHelpfulByUser ? (
                <>
                  <ThumbsUp className="w-4 h-4 mr-2 fill-green-500" />
                  Helpful
                </>
              ) : (
                <>
                  <ThumbsUp className="w-4 h-4 mr-2" />
                  Mark as Helpful
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

// Skeleton loaders
const RatingStatsSkeleton: React.FC = () => {
  return (
    <div className="grid md:grid-cols-3 gap-6 mb-8">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-customgreys-secondarybg border border-customgreys-darkGrey/60 rounded-xl p-6">
          <Skeleton className="h-24 w-full bg-customgreys-darkGrey/50" />
        </div>
      ))}
    </div>
  );
};

const ReviewSkeleton: React.FC = () => {
  return (
    <div className="bg-customgreys-secondarybg border border-customgreys-darkGrey/60 rounded-xl p-6">
      <div className="flex items-start mb-4">
        <Skeleton className="h-10 w-10 rounded-full bg-customgreys-darkGrey/50 mr-3" />
        <div className="flex-1">
          <Skeleton className="h-5 w-40 mb-2 bg-customgreys-darkGrey/50" />
          <Skeleton className="h-4 w-24 bg-customgreys-darkGrey/50" />
        </div>
        <Skeleton className="h-4 w-24 bg-customgreys-darkGrey/50" />
      </div>
      <Skeleton className="h-20 w-full mb-4 bg-customgreys-darkGrey/50" />
      <Skeleton className="h-10 w-full bg-customgreys-darkGrey/50" />
    </div>
  );
};

export default CourseReviews; 