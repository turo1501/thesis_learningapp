"use client";

import React, { useState, useEffect } from 'react';
import { useGetBlogPostsQuery, useModerateBlogPostMutation } from '@/state/api';
import { Button } from '@/components/ui/button';
import { Heading, Text } from '@/components/ui/typography';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { format as dateFormat } from 'date-fns';

export default function ModerationPage() {
  const [moderationComment, setModerationComment] = useState('');
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [moderationAction, setModerationAction] = useState<'publish' | 'reject' | null>(null);
  
  // Fetch posts with "pending" status with cache disabled
  const { data, isLoading, refetch } = useGetBlogPostsQuery(
    { status: 'pending' },
    { 
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
      refetchOnReconnect: true
    }
  );
  
  const [moderatePost, { isLoading: isModerateLoading }] = useModerateBlogPostMutation();
  
  // Log data whenever it changes
  useEffect(() => {
    console.log("Moderation data:", data);
  }, [data]);
  
  // Force refresh on mount
  useEffect(() => {
    console.log("Moderation page mounted, fetching data");
    refetch();
  }, [refetch]);
  
  const handleRefresh = () => {
    console.log("Manual refresh triggered");
    refetch();
    toast.info("Refreshing post list...");
  };
  
  const handleModeratePost = async () => {
    if (!selectedPostId || !moderationAction) return;
    
    try {
      await moderatePost({
        postId: selectedPostId,
        status: moderationAction === 'publish' ? 'published' : 'rejected',
        moderationComment: moderationComment,
      }).unwrap();
      
      toast.success(
        moderationAction === 'publish' 
          ? 'Post has been published successfully' 
          : 'Post has been rejected'
      );
      
      // Reset state
      setSelectedPostId(null);
      setModerationComment('');
      setModerationAction(null);
      
      // Refresh the list
      refetch();
    } catch (error) {
      toast.error('Failed to moderate post');
    }
  };
  
  return (
    <div className="container py-8">
      <div className="flex justify-between items-start mb-6">
        <div>
          <Heading as="h1" className="text-3xl font-bold">Blog Post Moderation</Heading>
          <Text className="text-customgreys-dirtyGrey mt-1">
            Review and approve student blog posts before they are published
          </Text>
        </div>
        
        <Button 
          variant="outline" 
          onClick={handleRefresh}
          className="flex items-center"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center my-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-6">
          {!data || !data.posts || data.posts.length === 0 ? (
            <Card className="p-6 text-center">
              <Text className="text-customgreys-dirtyGrey">No pending posts to moderate</Text>
            </Card>
          ) : (
            data.posts.map((post) => (
              <Card key={post.postId} className="overflow-hidden">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl mb-1">{post.title}</CardTitle>
                      <Text className="text-sm text-customgreys-dirtyGrey">
                        By {post.userName} • {dateFormat(new Date(post.createdAt), 'MMM d, yyyy')}
                      </Text>
                    </div>
                    <div className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                      Pending
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-3">
                    <div className="flex gap-2 mb-2">
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                        {post.category}
                      </span>
                      {post.tags?.map((tag, i) => (
                        <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="prose prose-sm max-w-none mb-4">
                    {/* Show a preview of the content */}
                    <Text>
                      {post.content.length > 300 
                        ? `${post.content.substring(0, 300)}...` 
                        : post.content}
                    </Text>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2 border-t pt-4">
                  {/* Reject Dialog */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="text-red-500 border-red-200 hover:bg-red-50"
                        onClick={() => {
                          setSelectedPostId(post.postId);
                          setModerationAction('reject');
                        }}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Reject this post?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will prevent the post from being published. Please provide feedback to the student.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <Textarea
                        placeholder="Reason for rejection (optional)"
                        className="mt-2" 
                        value={moderationComment}
                        onChange={(e) => setModerationComment(e.target.value)}
                      />
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => {
                          setSelectedPostId(null);
                          setModerationComment('');
                          setModerationAction(null);
                        }}>
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-600 hover:bg-red-700 text-white"
                          onClick={handleModeratePost}
                          disabled={isModerateLoading}
                        >
                          {isModerateLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Reject Post
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  
                  {/* Approve Dialog */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        className="text-white"
                        onClick={() => {
                          setSelectedPostId(post.postId);
                          setModerationAction('publish');
                        }}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Publish
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Publish this post?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will make the post visible to all users. You can provide additional feedback to the student.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <Textarea
                        placeholder="Feedback comments (optional)"
                        className="mt-2" 
                        value={moderationComment}
                        onChange={(e) => setModerationComment(e.target.value)}
                      />
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => {
                          setSelectedPostId(null);
                          setModerationComment('');
                          setModerationAction(null);
                        }}>
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleModeratePost}
                          disabled={isModerateLoading}
                        >
                          {isModerateLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Publish Post
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}