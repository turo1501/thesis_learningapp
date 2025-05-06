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
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Tag, Clock, Share2, Bookmark, Twitter, Facebook, Linkedin, MessageCircle, AlertCircle, ChevronLeft, Home, BookOpen } from 'lucide-react';

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
      <div className="min-h-screen bg-customgreys-primarybg text-white pt-24 px-4">
        <div className="max-w-[1600px] w-[100%] mx-auto">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-12"
          >
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 px-4 py-2 lg:px-5 lg:py-2.5 2xl:px-6 2xl:py-3 rounded-full bg-customgreys-darkGrey/50 backdrop-blur-sm text-white border border-customgreys-darkerGrey/40 hover:bg-customgreys-darkGrey transition-all group lg:text-lg"
            >
              <Home className="h-4 w-4 lg:h-5 lg:w-5 2xl:h-6 2xl:w-6 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Link>
          </motion.div>
          
          <div className="max-w-3xl mx-auto text-center p-8 lg:p-12 2xl:p-16 bg-customgreys-darkGrey rounded-xl border border-customgreys-darkerGrey shadow-lg">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center justify-center w-16 h-16 lg:w-20 lg:h-20 2xl:w-24 2xl:h-24 rounded-full bg-primary-900/30 text-primary-400 mb-6 lg:mb-8"
            >
              <AlertCircle className="h-8 w-8 lg:h-10 lg:w-10 2xl:h-12 2xl:w-12" />
            </motion.div>
            <Heading as="h1" className="text-white mb-4 lg:mb-6 text-2xl lg:text-3xl 2xl:text-4xl">Post Not Found</Heading>
            <Text className="mb-6 lg:mb-8 2xl:mb-10 text-gray-400 lg:text-lg 2xl:text-xl">The blog post you're looking for doesn't exist or you don't have permission to view it.</Text>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button 
                onClick={() => router.push('/blog')}
                className="rounded-full bg-primary-800 hover:bg-primary-700 text-white px-6 py-2 lg:px-8 lg:py-3 2xl:px-10 2xl:py-4 lg:text-lg 2xl:text-xl"
              >
                <ArrowLeft className="mr-2 h-4 w-4 lg:h-5 lg:w-5 2xl:h-6 2xl:w-6" />
                Back to Blog
              </Button>
              
              <Button 
                onClick={() => router.push('/')}
                className="rounded-full bg-customgreys-darkGrey border border-customgreys-darkerGrey hover:bg-customgreys-secondarybg text-white px-6 py-2 lg:px-8 lg:py-3 2xl:px-10 2xl:py-4 lg:text-lg 2xl:text-xl"
              >
                <Home className="mr-2 h-4 w-4 lg:h-5 lg:w-5 2xl:h-6 2xl:w-6" />
                Go to Homepage
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-customgreys-primarybg text-white pt-24 px-4">
        <div className="max-w-[1600px] w-[100%] mx-auto">
          {/* Back Button Skeleton */}
          <div className="mb-12">
            <Skeleton className="h-10 w-40 lg:h-12 lg:w-48 rounded-full bg-customgreys-darkGrey" />
          </div>
          
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 lg:h-12 lg:w-12 rounded-full bg-customgreys-darkGrey" />
              <div>
                <Skeleton className="h-4 w-32 lg:h-5 lg:w-40 bg-customgreys-darkGrey" />
                <Skeleton className="h-3 w-20 lg:h-4 lg:w-24 mt-1 bg-customgreys-darkGrey" />
              </div>
            </div>
            <Skeleton className="h-12 w-full lg:h-16 bg-customgreys-darkGrey" />
            <Skeleton className="h-6 w-1/3 lg:h-8 mx-auto bg-customgreys-darkGrey" />
            <Skeleton className="h-80 lg:h-96 w-full rounded-xl bg-customgreys-darkGrey" />
            <div className="space-y-4">
              <Skeleton className="h-4 lg:h-5 w-full bg-customgreys-darkGrey" />
              <Skeleton className="h-4 lg:h-5 w-full bg-customgreys-darkGrey" />
              <Skeleton className="h-4 lg:h-5 w-2/3 bg-customgreys-darkGrey" />
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!post) {
    return (
      <div className="min-h-screen bg-customgreys-primarybg text-white pt-24 px-4">
        <div className="max-w-[1600px] w-[100%] mx-auto">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-12"
          >
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 px-4 py-2 lg:px-5 lg:py-2.5 2xl:px-6 2xl:py-3 rounded-full bg-customgreys-darkGrey/50 backdrop-blur-sm text-white border border-customgreys-darkerGrey/40 hover:bg-customgreys-darkGrey transition-all group lg:text-lg"
            >
              <Home className="h-4 w-4 lg:h-5 lg:w-5 2xl:h-6 2xl:w-6 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Link>
          </motion.div>
          
          <div className="max-w-3xl mx-auto text-center p-8 lg:p-12 2xl:p-16 bg-customgreys-darkGrey rounded-xl border border-customgreys-darkerGrey shadow-lg">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center justify-center w-16 h-16 lg:w-20 lg:h-20 2xl:w-24 2xl:h-24 rounded-full bg-primary-900/30 text-primary-400 mb-6 lg:mb-8"
            >
              <AlertCircle className="h-8 w-8 lg:h-10 lg:w-10 2xl:h-12 2xl:w-12" />
            </motion.div>
            <Heading as="h1" className="text-white mb-4 lg:mb-6 text-2xl lg:text-3xl 2xl:text-4xl">Post Not Found</Heading>
            <Text className="mb-6 lg:mb-8 2xl:mb-10 text-gray-400 lg:text-lg 2xl:text-xl">The blog post you're looking for could not be found.</Text>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button 
                onClick={() => router.push('/blog')}
                className="rounded-full bg-primary-800 hover:bg-primary-700 text-white px-6 py-2 lg:px-8 lg:py-3 2xl:px-10 2xl:py-4 lg:text-lg 2xl:text-xl"
              >
                <ArrowLeft className="mr-2 h-4 w-4 lg:h-5 lg:w-5 2xl:h-6 2xl:w-6" />
                Back to Blog
              </Button>
              
              <Button 
                onClick={() => router.push('/')}
                className="rounded-full bg-customgreys-darkGrey border border-customgreys-darkerGrey hover:bg-customgreys-secondarybg text-white px-6 py-2 lg:px-8 lg:py-3 2xl:px-10 2xl:py-4 lg:text-lg 2xl:text-xl"
              >
                <Home className="mr-2 h-4 w-4 lg:h-5 lg:w-5 2xl:h-6 2xl:w-6" />
                Go to Homepage
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Reading Progress Bar */}
      <div 
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-primary-600 to-primary-400 z-50 transition-all duration-100 ease-out"
        style={{ width: `${readingProgress * 100}%` }}
      />
      
      <div className="min-h-screen bg-customgreys-primarybg text-white pt-16 2xl:pt-20">
        {/* Navigation Buttons - Fixed */}
        <div className="fixed top-24 lg:top-28 2xl:top-32 left-4 lg:left-8 2xl:left-12 z-20 space-y-3 lg:space-y-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Link href="/" scroll={false}>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-10 w-10 lg:h-12 lg:w-12 2xl:h-14 2xl:w-14 rounded-full bg-customgreys-darkGrey/80 backdrop-blur-sm border border-customgreys-darkerGrey/40 text-white hover:bg-customgreys-darkGrey shadow-lg"
                title="Back to Home"
              >
                <Home className="h-5 w-5 lg:h-6 lg:w-6 2xl:h-7 2xl:w-7" />
              </Button>
            </Link>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Link href="/blog" scroll={false}>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-10 w-10 lg:h-12 lg:w-12 2xl:h-14 2xl:w-14 rounded-full bg-customgreys-darkGrey/80 backdrop-blur-sm border border-customgreys-darkerGrey/40 text-white hover:bg-customgreys-darkGrey shadow-lg"
                title="Back to Blog"
              >
                <BookOpen className="h-5 w-5 lg:h-6 lg:w-6 2xl:h-7 2xl:w-7" />
              </Button>
            </Link>
          </motion.div>
        </div>
        
        <div className="max-w-[1600px] w-[100%] mx-auto px-4 py-8 lg:py-12 2xl:py-16">
          <div className="max-w-4xl mx-auto">
            <motion.article 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-customgreys-darkGrey rounded-2xl overflow-hidden border border-customgreys-darkerGrey shadow-xl shadow-black/10"
            >
              {/* Featured Image */}
              {post.featuredImage && (
                <div className="relative h-[350px] md:h-[450px] lg:h-[500px] 2xl:h-[600px] w-full overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-customgreys-darkGrey to-transparent opacity-60 z-10" />
                  <Image 
                    src={
                      !post.featuredImage || 
                      post.featuredImage.includes('/user/blog') ||
                      post.featuredImage.includes('localhost') ||
                      post.featuredImage.startsWith('/') 
                        ? `https://picsum.photos/1600/900?random=${post.postId}` 
                      : post.featuredImage.includes('://') 
                        ? post.featuredImage 
                        : `https://picsum.photos/1600/900?random=${post.postId}`
                    } 
                    alt={post.title}
                    className="object-cover transform-gpu transition-transform duration-20000 ease-out hover:scale-105"
                    fill
                    priority
                    unoptimized={true}
                    onError={(e) => {
                      // If image fails to load, replace with a placeholder
                      const imgElement = e.currentTarget as HTMLImageElement;
                      
                      // Prevent infinite loops by checking if we're already using a placeholder
                      if (!imgElement.src.includes('picsum.photos')) {
                        imgElement.src = `https://picsum.photos/1600/900?random=${post.postId}`;
                      }
                    }}
                  />
                  
                  {/* Category and reading time overlays */}
                  <div className="absolute top-6 left-6 z-20 flex gap-3">
                    <Badge className="bg-primary-800/80 hover:bg-primary-800/80 text-white border-none backdrop-blur-sm px-4 py-1.5 lg:px-5 lg:py-2 2xl:px-6 2xl:py-2.5 rounded-full">
                      {post.category}
                    </Badge>
                  </div>
                  
                  <div className="absolute top-6 right-6 z-20">
                    <div className="flex items-center gap-1 rounded-full bg-black/50 px-3 py-1.5 lg:px-4 lg:py-2 2xl:px-5 2xl:py-2.5 text-xs lg:text-sm 2xl:text-base text-white backdrop-blur-sm">
                      <Clock className="h-3 w-3 lg:h-4 lg:w-4 2xl:h-5 2xl:w-5 text-primary-400" />
                      <span>{calculateReadTime(post.content)} min read</span>
                    </div>
                  </div>
                  
                  {/* Title overlay */}
                  <div className="absolute bottom-0 left-0 right-0 z-20 p-6 lg:p-8 2xl:p-10 bg-gradient-to-t from-customgreys-darkGrey to-transparent">
                    <Heading as="h1" className="text-3xl md:text-4xl lg:text-5xl 2xl:text-6xl font-bold text-white">
                      {post.title}
                    </Heading>
                  </div>
                </div>
              )}
              
              <div className="p-6 md:p-8 lg:p-10 2xl:p-12">
                {/* Author and Date */}
                <div className="flex items-center flex-wrap gap-4 mb-8 lg:mb-10">
                  <div className="flex items-center">
                    <Avatar className="h-12 w-12 lg:h-14 lg:w-14 2xl:h-16 2xl:w-16 border-2 border-primary-700/30 shadow-sm mr-4">
                      <AvatarImage src={post.userAvatar} alt={post.userName} />
                      <AvatarFallback className="bg-primary-900/50 text-primary-200 text-lg lg:text-xl 2xl:text-2xl">
                        {post.userName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <Text className="font-medium text-white text-lg lg:text-xl 2xl:text-2xl">{post.userName}</Text>
                      <div className="flex items-center text-sm lg:text-base 2xl:text-lg text-gray-400">
                        <Calendar className="mr-1 h-3.5 w-3.5 lg:h-4 lg:w-4 2xl:h-5 2xl:w-5" />
                        {formatDate(post.publishedAt || post.createdAt)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 lg:gap-3 ml-auto">
                    <Button variant="ghost" size="icon" className="h-9 w-9 lg:h-10 lg:w-10 2xl:h-12 2xl:w-12 rounded-full text-gray-400 hover:text-white hover:bg-primary-900/30" title="Share on Twitter">
                      <Twitter className="h-4 w-4 lg:h-5 lg:w-5 2xl:h-6 2xl:w-6" />
                      <span className="sr-only">Share on Twitter</span>
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 lg:h-10 lg:w-10 2xl:h-12 2xl:w-12 rounded-full text-gray-400 hover:text-white hover:bg-primary-900/30" title="Share on Facebook">
                      <Facebook className="h-4 w-4 lg:h-5 lg:w-5 2xl:h-6 2xl:w-6" />
                      <span className="sr-only">Share on Facebook</span>
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 lg:h-10 lg:w-10 2xl:h-12 2xl:w-12 rounded-full text-gray-400 hover:text-white hover:bg-primary-900/30" title="Share on LinkedIn">
                      <Linkedin className="h-4 w-4 lg:h-5 lg:w-5 2xl:h-6 2xl:w-6" />
                      <span className="sr-only">Share on LinkedIn</span>
                    </Button>
                  </div>
                </div>
                
                <Separator className="mb-8 lg:mb-10 bg-customgreys-darkerGrey/70" />
                
                {/* Post Content */}
                <div className="prose prose-lg lg:prose-xl 2xl:prose-2xl max-w-none prose-headings:text-white prose-headings:font-bold prose-p:text-gray-300 prose-a:text-primary-400 prose-strong:text-white prose-strong:font-semibold prose-code:text-primary-300 prose-code:bg-customgreys-primarybg prose-code:px-1 prose-code:py-0.5 prose-code:rounded">
                  {post.content.split('\n').map((paragraph, index) => (
                    paragraph ? <p key={index}>{paragraph}</p> : <br key={index} />
                  ))}
                </div>
                
                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 lg:gap-3 mt-10 lg:mt-12 2xl:mt-16">
                    <span className="text-sm lg:text-base 2xl:text-lg font-medium text-gray-400 flex items-center">
                      <Tag className="h-3.5 w-3.5 lg:h-4 lg:w-4 2xl:h-5 2xl:w-5 mr-1 lg:mr-2" />
                      Tags:
                    </span>
                    {post.tags.map((tag: string) => (
                      <Badge key={tag} variant="outline" className="bg-customgreys-secondarybg/30 hover:bg-customgreys-secondarybg/50 border-customgreys-darkerGrey text-gray-300 lg:text-lg">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </motion.article>
            
            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <div className="mt-16 lg:mt-20 2xl:mt-24">
                <Heading as="h2" className="text-2xl lg:text-3xl 2xl:text-4xl font-bold mb-8 lg:mb-10 text-white">Related Posts</Heading>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 2xl:gap-10">
                  {relatedPosts.map((relPost: any) => (
                    <motion.div
                      key={relPost.postId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Card className="h-full overflow-hidden border group transition-all duration-300 hover:shadow-xl bg-customgreys-darkGrey border-customgreys-darkerGrey hover:border-primary-700/50">
                        <div className="relative h-48 lg:h-56 2xl:h-64 w-full overflow-hidden">
                          <Image 
                            src={
                              !relPost.featuredImage || 
                              relPost.featuredImage.includes('/user/blog') ||
                              relPost.featuredImage.includes('localhost') ||
                              relPost.featuredImage.startsWith('/') 
                                ? `https://picsum.photos/800/600?random=${relPost.postId}` 
                                : relPost.featuredImage
                            }
                            alt={relPost.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            unoptimized={true}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-customgreys-darkGrey to-transparent opacity-60"></div>
                        </div>
                        <CardContent className="p-5 lg:p-6 2xl:p-8">
                          <Link 
                            href={`/blog/${relPost.postId}`} 
                            className="text-lg lg:text-xl 2xl:text-2xl font-bold text-white hover:text-primary-400 transition-colors line-clamp-2 mb-2 lg:mb-3 block"
                          >
                            {relPost.title}
                          </Link>
                          <div className="flex items-center text-sm lg:text-base 2xl:text-lg text-gray-400 mb-3 lg:mb-4">
                            <Calendar className="h-3.5 w-3.5 lg:h-4 lg:w-4 2xl:h-5 2xl:w-5 mr-1.5" />
                            {formatDate(relPost.publishedAt || relPost.createdAt)}
                          </div>
                          <Text className="text-gray-400 line-clamp-2">{relPost.content}</Text>
                        </CardContent>
                        <CardFooter className="p-5 lg:p-6 2xl:p-8 pt-0 lg:pt-0 2xl:pt-0">
                          <Link 
                            href={`/blog/${relPost.postId}`}
                            className="text-primary-400 hover:text-primary-300 transition-colors flex items-center text-sm lg:text-base 2xl:text-lg"
                          >
                            Read more
                            <ChevronLeft className="h-4 w-4 lg:h-5 lg:w-5 2xl:h-6 2xl:w-6 rotate-180 ml-1 lg:ml-2" />
                          </Link>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Back to Blog button */}
            <div className="flex justify-center mt-16 lg:mt-20 2xl:mt-24">
              <Button 
                onClick={() => router.push('/blog')}
                className="rounded-full px-6 py-3 lg:px-8 lg:py-4 2xl:px-10 2xl:py-5 bg-primary-800 hover:bg-primary-700 text-white text-lg lg:text-xl 2xl:text-2xl"
              >
                <ArrowLeft className="mr-2 lg:mr-3 h-5 w-5 lg:h-6 lg:w-6 2xl:h-7 2xl:w-7" />
                Back to All Blog Posts
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 