"use client";

import React, { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useGetBlogPostsQuery } from '@/state/api';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Heading, Text } from '@/components/ui/typography';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Pencil, BookOpen } from 'lucide-react';
import { BlogPost } from '@/state/api';
import StudentPostList from '@/components/blog/StudentPostList';
import CreateEditPostDialog from '@/components/blog/CreateEditPostDialog';

export default function StudentBlogPage() {
  const { user } = useUser();
  const userId = user?.id;
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [postToEdit, setPostToEdit] = useState<BlogPost | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  
  const { data: myPosts, isLoading } = useGetBlogPostsQuery({
    userId: userId,
  }, {
    skip: !userId,
  });
  
  // Count posts by status
  const draftCount = myPosts?.posts.filter(post => post.status === 'draft').length || 0;
  const pendingCount = myPosts?.posts.filter(post => post.status === 'pending').length || 0;
  const publishedCount = myPosts?.posts.filter(post => post.status === 'published').length || 0;
  const rejectedCount = myPosts?.posts.filter(post => post.status === 'rejected').length || 0;
  
  const handleCreatePost = () => {
    setPostToEdit(null);
    setIsCreateDialogOpen(true);
  };
  
  const handleEditPost = (post: BlogPost) => {
    setPostToEdit(post);
    setIsCreateDialogOpen(true);
  };
  
  const handleCloseDialog = () => {
    setIsCreateDialogOpen(false);
    setPostToEdit(null);
  };

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <Heading as="h1" className="text-3xl font-bold">My Blog Posts</Heading>
          <Text className="text-customgreys-dirtyGrey mt-1">
            Share your knowledge and achievements with the community
          </Text>
        </div>
        
        <Button onClick={handleCreatePost}>
          <Plus className="mr-2 h-4 w-4" />
          Create New Post
        </Button>
      </div>
      
      <Separator className="my-6" />
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-8">
          <TabsTrigger value="all">
            All Posts 
            <span className="ml-2 inline-block px-2 py-0.5 text-xs rounded-full bg-customgreys-foreground">
              {myPosts?.posts.length || 0}
            </span>
          </TabsTrigger>
          <TabsTrigger value="draft">
            Drafts
            <span className="ml-2 inline-block px-2 py-0.5 text-xs rounded-full bg-customgreys-foreground">
              {draftCount}
            </span>
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending Review
            <span className="ml-2 inline-block px-2 py-0.5 text-xs rounded-full bg-customgreys-foreground">
              {pendingCount}
            </span>
          </TabsTrigger>
          <TabsTrigger value="published">
            Published
            <span className="ml-2 inline-block px-2 py-0.5 text-xs rounded-full bg-customgreys-foreground">
              {publishedCount}
            </span>
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected
            <span className="ml-2 inline-block px-2 py-0.5 text-xs rounded-full bg-customgreys-foreground">
              {rejectedCount}
            </span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <StudentPostList 
            posts={myPosts?.posts || []} 
            isLoading={isLoading}
            onEditPost={handleEditPost}
            filter="all"
          />
        </TabsContent>
        
        <TabsContent value="draft">
          <StudentPostList 
            posts={myPosts?.posts.filter(post => post.status === 'draft') || []} 
            isLoading={isLoading}
            onEditPost={handleEditPost}
            filter="draft"
          />
        </TabsContent>
        
        <TabsContent value="pending">
          <StudentPostList 
            posts={myPosts?.posts.filter(post => post.status === 'pending') || []} 
            isLoading={isLoading}
            onEditPost={handleEditPost}
            filter="pending"
          />
        </TabsContent>
        
        <TabsContent value="published">
          <StudentPostList 
            posts={myPosts?.posts.filter(post => post.status === 'published') || []} 
            isLoading={isLoading}
            onEditPost={handleEditPost}
            filter="published"
          />
        </TabsContent>
        
        <TabsContent value="rejected">
          <StudentPostList 
            posts={myPosts?.posts.filter(post => post.status === 'rejected') || []} 
            isLoading={isLoading}
            onEditPost={handleEditPost}
            filter="rejected"
          />
        </TabsContent>
      </Tabs>
      
      <CreateEditPostDialog 
        open={isCreateDialogOpen} 
        post={postToEdit} 
        onClose={handleCloseDialog} 
      />
    </div>
  );
} 