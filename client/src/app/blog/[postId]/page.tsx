"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useGetBlogPostQuery } from '@/state/api';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Heading, Text } from '@/components/ui/typography';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Calendar, Tag } from 'lucide-react';

export default function BlogPostPage() {
  const { postId } = useParams();
  const router = useRouter();
  
  const { data: post, isLoading, error } = useGetBlogPostQuery(postId as string);
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  if (error) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-3xl mx-auto text-center p-8 bg-red-50 rounded-lg">
          <Heading as="h1" className="text-red-600 mb-4">Post Not Found</Heading>
          <Text className="mb-6">The blog post you're looking for doesn't exist or you don't have permission to view it.</Text>
          <Button onClick={() => router.push('/blog')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Button>
        </div>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-3xl mx-auto space-y-4">
          <Skeleton className="h-10 w-1/5" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-6 w-1/4 mx-auto" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }
  
  if (!post) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-3xl mx-auto text-center p-8 bg-red-50 rounded-lg">
          <Heading as="h1" className="text-red-600 mb-4">Post Not Found</Heading>
          <Text className="mb-6">The blog post you're looking for could not be found.</Text>
          <Button onClick={() => router.push('/blog')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Button 
          variant="ghost" 
          size="sm" 
          className="mb-6"
          onClick={() => router.push('/blog')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Blog
        </Button>
        
        <article className="space-y-8">
          <header className="space-y-4 text-center">
            <Heading as="h1" className="text-4xl font-bold">{post.title}</Heading>
            
            <div className="flex items-center justify-center gap-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={post.userAvatar} alt={post.userName} />
                <AvatarFallback>{post.userName.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <Text className="font-medium">{post.userName}</Text>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-4 text-customgreys-dirtyGrey text-sm">
              <div className="flex items-center">
                <Calendar className="mr-1 h-4 w-4" />
                {formatDate(post.publishedAt || post.createdAt)}
              </div>
              
              <div className="flex items-center">
                <Tag className="mr-1 h-4 w-4" />
                {post.category}
              </div>
            </div>
          </header>
          
          {post.featuredImage && (
            <div className="relative h-80 w-full overflow-hidden rounded-lg">
              <Image 
                src={post.featuredImage.startsWith('/') 
                  ? post.featuredImage 
                  : post.featuredImage.includes('://') 
                    ? post.featuredImage 
                    : `https://picsum.photos/1200/800?random=${post.postId}`} 
                alt={post.title}
                className="object-cover"
                fill
                priority
                onError={(e) => {
                  // If image fails to load, replace with a placeholder
                  const imgElement = e.currentTarget as HTMLImageElement;
                  imgElement.src = `https://picsum.photos/1200/800?random=${post.postId}`;
                }}
              />
            </div>
          )}
          
          <div className="prose prose-lg max-w-none dark:prose-invert">
            {/* Render the content with proper formatting */}
            {post.content.split('\n').map((paragraph, index) => (
              paragraph ? <p key={index}>{paragraph}</p> : <br key={index} />
            ))}
          </div>
          
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-6">
              {post.tags.map((tag) => (
                <span 
                  key={tag} 
                  className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </article>
      </div>
    </div>
  );
} 