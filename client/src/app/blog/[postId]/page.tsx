"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useGetBlogPostQuery, useGetBlogPostsQuery } from '@/state/api';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Heading, Text } from '@/components/ui/typography';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Calendar, Tag, Clock, Share2, Bookmark, Twitter, Facebook, Linkedin, MessageCircle, AlertCircle, ChevronLeft } from 'lucide-react';

export default function BlogPostPage() {
  const { postId } = useParams();
  const router = useRouter();
  const [readingProgress, setReadingProgress] = useState(0);
  
  // No authentication required for published posts
  const { data: post, isLoading, error } = useGetBlogPostQuery(postId as string);
  
  // Get related posts based on category
  const { data: relatedPostsData } = useGetBlogPostsQuery({
    endpoint: 'published',
    category: post?.category,
    limit: 3,
  }, { skip: !post?.category });
  
  // Filter out the current post from related posts
  const relatedPosts = relatedPostsData?.posts?.filter(p => p.postId !== postId).slice(0, 3) || [];
  
  // Reading progress tracking
  useEffect(() => {
    const updateReadingProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const readingProgress = scrollTop / docHeight;
      setReadingProgress(readingProgress);
    };

    window.addEventListener('scroll', updateReadingProgress);
    return () => window.removeEventListener('scroll', updateReadingProgress);
  }, []);
  
  // Calculate reading time
  const calculateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content?.split(/\s+/).length || 0;
    const readTime = Math.ceil(words / wordsPerMinute);
    return readTime < 1 ? 1 : readTime;
  };
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  if (error) {
    return (
      <div className="min-h-screen bg-customgreys-primarybg text-white py-12 px-4">
        <div className="max-w-3xl mx-auto text-center p-8 bg-customgreys-darkGrey rounded-xl border border-customgreys-darkerGrey shadow-lg">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-900/30 text-primary-400 mb-6">
            <AlertCircle className="h-8 w-8" />
          </div>
          <Heading as="h1" className="text-white mb-4">Post Not Found</Heading>
          <Text className="mb-6 text-gray-400">The blog post you're looking for doesn't exist or you don't have permission to view it.</Text>
          <Button 
            onClick={() => router.push('/blog')}
            className="rounded-full bg-primary-800 hover:bg-primary-700 text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Button>
        </div>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-customgreys-primarybg text-white py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full bg-customgreys-darkGrey" />
            <div>
              <Skeleton className="h-4 w-32 bg-customgreys-darkGrey" />
              <Skeleton className="h-3 w-20 mt-1 bg-customgreys-darkGrey" />
            </div>
          </div>
          <Skeleton className="h-12 w-full bg-customgreys-darkGrey" />
          <Skeleton className="h-6 w-1/3 mx-auto bg-customgreys-darkGrey" />
          <Skeleton className="h-80 w-full rounded-xl bg-customgreys-darkGrey" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full bg-customgreys-darkGrey" />
            <Skeleton className="h-4 w-full bg-customgreys-darkGrey" />
            <Skeleton className="h-4 w-2/3 bg-customgreys-darkGrey" />
          </div>
        </div>
      </div>
    );
  }
  
  if (!post) {
    return (
      <div className="min-h-screen bg-customgreys-primarybg text-white py-12 px-4">
        <div className="max-w-3xl mx-auto text-center p-8 bg-customgreys-darkGrey rounded-xl border border-customgreys-darkerGrey shadow-lg">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-900/30 text-primary-400 mb-6">
            <AlertCircle className="h-8 w-8" />
          </div>
          <Heading as="h1" className="text-white mb-4">Post Not Found</Heading>
          <Text className="mb-6 text-gray-400">The blog post you're looking for could not be found.</Text>
          <Button 
            onClick={() => router.push('/blog')}
            className="rounded-full bg-primary-800 hover:bg-primary-700 text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Reading Progress Bar */}
      <div 
        className="fixed top-0 left-0 h-1 bg-primary-600 z-50 transition-all duration-100 ease-out"
        style={{ width: `${readingProgress * 100}%` }}
      />
      
      <div className="min-h-screen bg-customgreys-primarybg text-white">
        <div className="container mx-auto px-4 py-12">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mb-8 group text-gray-300 hover:text-white hover:bg-customgreys-darkGrey"
            onClick={() => router.push('/blog')}
          >
            <ChevronLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to Blog
          </Button>
          
          <div className="max-w-4xl mx-auto">
            <article className="bg-customgreys-darkGrey rounded-2xl overflow-hidden border border-customgreys-darkerGrey shadow-lg shadow-black/10">
              {/* Featured Image */}
              {post.featuredImage && (
                <div className="relative h-[450px] w-full overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-customgreys-darkGrey to-transparent opacity-60 z-10" />
                  <Image 
                    src={
                      !post.featuredImage || 
                      post.featuredImage.includes('/user/blog') ||
                      post.featuredImage.includes('localhost') ||
                      post.featuredImage.startsWith('/') 
                        ? `https://picsum.photos/1200/800?random=${post.postId}` 
                        : post.featuredImage.includes('://') 
                          ? post.featuredImage 
                          : `https://picsum.photos/1200/800?random=${post.postId}`
                    } 
                    alt={post.title}
                    className="object-cover"
                    fill
                    priority
                    unoptimized={true}
                    onError={(e) => {
                      // If image fails to load, replace with a placeholder
                      const imgElement = e.currentTarget as HTMLImageElement;
                      
                      // Prevent infinite loops by checking if we're already using a placeholder
                      if (!imgElement.src.includes('picsum.photos')) {
                        imgElement.src = `https://picsum.photos/1200/800?random=${post.postId}`;
                      }
                    }}
                  />
                  
                  {/* Category and reading time overlays */}
                  <div className="absolute top-6 left-6 z-20 flex gap-3">
                    <Badge className="bg-primary-800/80 hover:bg-primary-800/80 text-white border-none backdrop-blur-sm px-4 py-1.5 rounded-full">
                      {post.category}
                    </Badge>
                  </div>
                  
                  <div className="absolute top-6 right-6 z-20">
                    <div className="flex items-center gap-1 rounded-full bg-black/50 px-3 py-1.5 text-xs text-white backdrop-blur-sm">
                      <Clock className="h-3 w-3 text-primary-400" />
                      <span>{calculateReadTime(post.content)} min read</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="p-8 md:p-12">
                {/* Post Title */}
                <Heading as="h1" className="text-3xl md:text-4xl font-bold mb-6 text-white">{post.title}</Heading>
                
                {/* Author and Date */}
                <div className="flex items-center flex-wrap gap-4 mb-8">
                  <div className="flex items-center">
                    <Avatar className="h-12 w-12 border-2 border-primary-700/30 shadow-sm mr-4">
                      <AvatarImage src={post.userAvatar} alt={post.userName} />
                      <AvatarFallback className="bg-primary-900/50 text-primary-200">
                        {post.userName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <Text className="font-medium text-white text-lg">{post.userName}</Text>
                      <div className="flex items-center text-sm text-gray-400">
                        <Calendar className="mr-1 h-3.5 w-3.5" />
                        {formatDate(post.publishedAt || post.createdAt)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-auto">
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-gray-400 hover:text-white hover:bg-primary-900/30" title="Share on Twitter">
                      <Twitter className="h-4 w-4" />
                      <span className="sr-only">Share on Twitter</span>
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-gray-400 hover:text-white hover:bg-primary-900/30" title="Share on Facebook">
                      <Facebook className="h-4 w-4" />
                      <span className="sr-only">Share on Facebook</span>
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-gray-400 hover:text-white hover:bg-primary-900/30" title="Share on LinkedIn">
                      <Linkedin className="h-4 w-4" />
                      <span className="sr-only">Share on LinkedIn</span>
                    </Button>
                  </div>
                </div>
                
                <Separator className="mb-8 bg-customgreys-darkerGrey/70" />
                
                {/* Post Content */}
                <div className="prose prose-lg max-w-none prose-headings:text-white prose-headings:font-bold prose-p:text-gray-300 prose-a:text-primary-400 prose-strong:text-white prose-strong:font-semibold prose-code:text-primary-300 prose-code:bg-customgreys-primarybg prose-code:px-1 prose-code:py-0.5 prose-code:rounded">
                  {post.content.split('\n').map((paragraph, index) => (
                    paragraph ? <p key={index}>{paragraph}</p> : <br key={index} />
                  ))}
                </div>
                
                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-10">
                    <span className="text-sm font-medium text-gray-400 flex items-center">
                      <Tag className="h-3.5 w-3.5 mr-1" />
                      Tags:
                    </span>
                    {post.tags.map((tag) => (
                      <Badge 
                        key={tag} 
                        variant="outline"
                        className="text-xs font-normal border-primary-700/30 text-primary-300 bg-primary-900/20 rounded-full"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
                
                {/* Actions Bar */}
                <div className="flex items-center justify-between mt-10 pt-6 border-t border-customgreys-darkerGrey/70">
                  <Button variant="outline" size="sm" className="gap-2 bg-transparent border-primary-700/30 text-primary-400 hover:bg-primary-900/20 hover:text-primary-300 rounded-full px-5">
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                  
                  <Button variant="outline" size="sm" className="gap-2 bg-transparent border-primary-700/30 text-primary-400 hover:bg-primary-900/20 hover:text-primary-300 rounded-full px-5">
                    <Bookmark className="h-4 w-4" />
                    Save
                  </Button>
                </div>
              </div>
            </article>
            
            {/* Author Bio */}
            <div className="mt-12 bg-gradient-to-r from-customgreys-darkGrey to-customgreys-secondarybg p-8 rounded-2xl border border-customgreys-darkerGrey shadow-lg shadow-black/10">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <Avatar className="h-20 w-20 border-2 border-primary-700/30">
                  <AvatarImage src={post.userAvatar} alt={post.userName} />
                  <AvatarFallback className="bg-primary-900/50 text-primary-200 text-xl">
                    {post.userName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-xl font-bold text-white mb-2">About {post.userName}</h3>
                  <p className="text-gray-300 mb-4">
                    {post.userName} is a passionate educator and content creator in the learning community. With expertise in {post.category}, they contribute valuable insights to help others grow.
                  </p>
                  <Button variant="outline" size="sm" className="rounded-full bg-transparent border-primary-700/30 text-primary-400 hover:bg-primary-900/20 hover:text-primary-300">
                    View Profile
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <div className="mt-16">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <div className="px-3 py-1 bg-primary-900/30 inline-block rounded-full text-xs font-medium text-primary-400 mb-2">
                      Discover More
                    </div>
                    <h2 className="text-2xl font-bold text-white">Related Articles</h2>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedPosts.map((relatedPost) => (
                    <Card key={relatedPost.postId} className="overflow-hidden h-full flex flex-col bg-customgreys-darkGrey border-customgreys-darkerGrey hover:border-primary-700/50 transition-all duration-300 hover:shadow-lg shadow-black/10">
                      <div className="relative h-48 w-full">
                        <div className="absolute inset-0 bg-gradient-to-t from-customgreys-darkGrey to-transparent opacity-60 z-10" />
                        <Image 
                          src={
                            !relatedPost.featuredImage || 
                            relatedPost.featuredImage.includes('/user/blog') ||
                            relatedPost.featuredImage.includes('localhost') ||
                            relatedPost.featuredImage.startsWith('/') 
                              ? `https://picsum.photos/800/600?random=${relatedPost.postId}` 
                              : relatedPost.featuredImage.includes('://') 
                                ? relatedPost.featuredImage 
                                : `https://picsum.photos/800/600?random=${relatedPost.postId}`
                          } 
                          alt={relatedPost.title}
                          className="object-cover"
                          fill
                          unoptimized={true}
                        />
                        
                        {/* Category overlay */}
                        <div className="absolute top-3 left-3 z-20">
                          <Badge className="bg-primary-800/70 hover:bg-primary-800/70 text-white border-none backdrop-blur-sm text-xs">
                            {relatedPost.category}
                          </Badge>
                        </div>
                      </div>
                      
                      <CardContent className="flex-grow pt-6">
                        <Link href={`/blog/${relatedPost.postId}`} className="block group">
                          <h3 className="text-lg font-semibold line-clamp-2 text-white group-hover:text-primary-400 transition-colors">{relatedPost.title}</h3>
                        </Link>
                        <p className="mt-2 text-gray-400 text-sm line-clamp-2">
                          {relatedPost.content.substring(0, 100)}...
                        </p>
                      </CardContent>
                      
                      <CardFooter className="pt-0 pb-6">
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar className="mr-1 h-3 w-3" />
                          <span>{formatDate(relatedPost.publishedAt || relatedPost.createdAt)}</span>
                          
                          <span className="mx-2">•</span>
                          
                          <Clock className="mr-1 h-3 w-3" />
                          <span>{calculateReadTime(relatedPost.content)} min read</span>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
} 