"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDeleteBlogPostMutation, useUpdateBlogPostMutation, BlogPost } from '@/state/api';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/typography';
import { 
  MoreHorizontal, 
  Pencil, 
  Trash, 
  Eye, 
  Send, 
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface StudentPostListProps {
  posts: BlogPost[];
  isLoading: boolean;
  onEditPost: (post: BlogPost) => void;
  filter: string;
}

export default function StudentPostList({ 
  posts, 
  isLoading, 
  onEditPost,
  filter 
}: StudentPostListProps) {
  const router = useRouter();
  const [deletePostId, setDeletePostId] = useState<string | null>(null);
  const [submitPostId, setSubmitPostId] = useState<string | null>(null);
  
  const [deletePost] = useDeleteBlogPostMutation();
  const [updatePost] = useUpdateBlogPostMutation();
  
  const handleViewPost = (postId: string) => {
    router.push(`/blog/${postId}`);
  };
  
  const handleSubmitForReview = async (postId: string) => {
    try {
      await updatePost({
        postId,
        post: { status: 'pending' }
      }).unwrap();
      toast.success('Post submitted for review');
      setSubmitPostId(null);
    } catch (error) {
      toast.error('Failed to submit post for review');
    }
  };
  
  const handleDeletePost = async (postId: string) => {
    try {
      await deletePost(postId).unwrap();
      toast.success('Post deleted successfully');
      setDeletePostId(null);
    } catch (error) {
      toast.error('Failed to delete post');
    }
  };
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending Review</Badge>;
      case 'published':
        return <Badge variant="default" className="bg-green-600">Published</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12 bg-customgreys-foreground rounded-lg">
        <Text className="text-lg">
          {filter === 'all' 
            ? "You haven't created any blog posts yet." 
            : `You don't have any ${filter} posts.`}
        </Text>
        {filter === 'all' && (
          <Text className="text-customgreys-dirtyGrey mt-2">
            Start sharing your knowledge by creating your first post!
          </Text>
        )}
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.map((post) => (
            <TableRow key={post.postId}>
              <TableCell className="font-medium">{post.title}</TableCell>
              <TableCell>{post.category}</TableCell>
              <TableCell>{getStatusBadge(post.status)}</TableCell>
              <TableCell>{formatDate(post.updatedAt)}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEditPost(post)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleViewPost(post.postId)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </DropdownMenuItem>
                    {post.status === 'draft' && (
                      <DropdownMenuItem onClick={() => setSubmitPostId(post.postId)}>
                        <Send className="mr-2 h-4 w-4" />
                        Submit for Review
                      </DropdownMenuItem>
                    )}
                    {post.status === 'rejected' && post.moderationComment && (
                      <DropdownMenuItem
                        onSelect={(e) => {
                          e.preventDefault();
                          toast.info(
                            <div>
                              <h3 className="font-bold mb-1">Feedback from Moderator</h3>
                              <p>{post.moderationComment}</p>
                            </div>
                          );
                        }}
                      >
                        <AlertCircle className="mr-2 h-4 w-4" />
                        View Feedback
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem 
                      className="text-red-600" 
                      onClick={() => setDeletePostId(post.postId)}
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog 
        open={deletePostId !== null} 
        onOpenChange={(open) => !open && setDeletePostId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this post?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The post will be permanently deleted from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deletePostId && handleDeletePost(deletePostId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Submit for Review Confirmation Dialog */}
      <AlertDialog 
        open={submitPostId !== null} 
        onOpenChange={(open) => !open && setSubmitPostId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit for Teacher Review?</AlertDialogTitle>
            <AlertDialogDescription>
              Your post will be submitted to teachers for review. You won't be able to edit it while it's being reviewed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => submitPostId && handleSubmitForReview(submitPostId)}
            >
              Submit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 