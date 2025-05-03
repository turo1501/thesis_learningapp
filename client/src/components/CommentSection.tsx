"use client";

import { useState, useRef, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Send, Trash2, MessageSquare, AlertTriangle, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion"; 
import {
  useGetChapterCommentsQuery,
  useAddCommentMutation,
  useDeleteCommentMutation,
  Comment,
} from "@/state/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CommentSectionProps {
  courseId: string;
  sectionId: string;
  chapterId: string;
}

const CommentSection = ({ courseId, sectionId, chapterId }: CommentSectionProps) => {
  const { user, isSignedIn } = useUser();
  const [commentText, setCommentText] = useState("");
  const commentsEndRef = useRef<HTMLDivElement>(null);
  
  const {
    data: comments = [],
    isLoading,
    error,
    refetch
  } = useGetChapterCommentsQuery({ courseId, sectionId, chapterId });
  
  const [addComment, { isLoading: isAddingComment }] = useAddCommentMutation();
  const [deleteComment, { isLoading: isDeletingComment }] = useDeleteCommentMutation();

  // Scroll to bottom whenever comments change
  useEffect(() => {
    if (commentsEndRef.current) {
      commentsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [comments]);

  const handleSubmitComment = async () => {
    if (!commentText.trim()) return;
    
    try {
      await addComment({ courseId, sectionId, chapterId, text: commentText }).unwrap();
      setCommentText("");
      toast.success("Comment added successfully");
    } catch (error) {
      console.error("Failed to add comment:", error);
      toast.error("Failed to add comment. Please try again.");
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment({ courseId, sectionId, chapterId, commentId }).unwrap();
      toast.success("Comment deleted successfully");
    } catch (error) {
      console.error("Failed to delete comment:", error);
      toast.error("Failed to delete comment. Please try again.");
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return "unknown time ago";
    }
  };

  // Fix for when the user object hasn't fully loaded yet
  if (!isSignedIn) {
    return (
      <div className="rounded-lg bg-muted/20 p-6 text-center">
        <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-50" />
        <h3 className="text-lg font-medium mb-1">Join the conversation</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Please sign in to view and post comments
        </p>
      </div>
    );
  }

  return (
    <div className="comment-section bg-background rounded-lg border shadow-sm p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Discussion
          </h3>
          <p className="text-sm text-muted-foreground">
            {comments.length} {comments.length === 1 ? "comment" : "comments"}
          </p>
        </div>
        
        {error && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()}
            className="text-xs"
          >
            Retry
          </Button>
        )}
      </div>
      
      <div className="relative mb-6">
        <div className="flex gap-3 items-start">
          <Avatar className="h-9 w-9 border-2 border-primary/10">
            <AvatarImage src={user?.imageUrl} alt={user?.fullName || "User"} />
            <AvatarFallback>{(user?.fullName?.[0] || "U").toUpperCase()}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-2">
            <Textarea
              className="min-h-[80px] resize-none focus-visible:ring-primary"
              placeholder="Share your thoughts or questions..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              disabled={isAddingComment}
            />
            
            <div className="flex justify-end">
              <Button
                type="button"
                onClick={handleSubmitComment}
                disabled={!commentText.trim() || isAddingComment}
                className="gap-1.5"
              >
                {isAddingComment ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span>Post comment</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <Separator className="my-6" />
      
      <div className="comments-container max-h-[600px] overflow-y-auto pr-2">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
            <p className="text-sm text-muted-foreground">Loading comments...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertTriangle className="h-8 w-8 text-destructive mb-2" />
            <p className="text-sm font-medium mb-1">Failed to load comments</p>
            <p className="text-sm text-muted-foreground mb-4">Please try again later</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {comments.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-10"
              >
                <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
                <h3 className="text-lg font-medium mb-1">No comments yet</h3>
                <p className="text-sm text-muted-foreground">
                  Be the first to share your thoughts!
                </p>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment: Comment) => (
                  <motion.div
                    key={comment.commentId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className={cn(
                      "flex gap-3 p-4 rounded-lg transition-colors",
                      "hover:bg-muted/40 group relative"
                    )}
                  >
                    <Avatar className="h-8 w-8 mt-0.5 ring-2 ring-background">
                      <AvatarImage 
                        src={comment.userAvatar} 
                        alt={comment.userName || "User"} 
                      />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {(comment.userName?.[0] || "U").toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 space-y-1 min-w-0">
                      <div className="flex flex-wrap items-baseline gap-x-2">
                        <span className="font-medium text-sm">
                          {comment.userName || "User"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(comment.timestamp)}
                        </span>
                      </div>
                      
                      <p className="text-sm leading-relaxed break-words">{comment.text}</p>
                    </div>
                    
                    {user?.id === comment.userId && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 top-2"
                        onClick={() => handleDeleteComment(comment.commentId)}
                        disabled={isDeletingComment}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        )}
        <div ref={commentsEndRef} />
      </div>
    </div>
  );
};

export default CommentSection; 