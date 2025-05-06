"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useGetBlogPostsQuery } from '@/state/api';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heading, Text } from '@/components/ui/typography';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CalendarIcon, BookOpen, Search, TagIcon, Clock, TrendingUp, AlertCircle } from 'lucide-react';

const categories = [
  { value: 'all', label: 'All Categories', icon: <TagIcon className="h-4 w-4" /> },
  { value: 'programming', label: 'Programming', icon: <TrendingUp className="h-4 w-4" /> },
  { value: 'design', label: 'Design', icon: <TrendingUp className="h-4 w-4" /> },
  { value: 'data-science', label: 'Data Science', icon: <TrendingUp className="h-4 w-4" /> },
  { value: 'ai', label: 'Artificial Intelligence', icon: <TrendingUp className="h-4 w-4" /> },
  { value: 'web-development', label: 'Web Development', icon: <TrendingUp className="h-4 w-4" /> },
  { value: 'mobile-development', label: 'Mobile Development', icon: <TrendingUp className="h-4 w-4" /> },
  { value: 'devops', label: 'DevOps', icon: <TrendingUp className="h-4 w-4" /> },
  { value: 'career', label: 'Career Advice', icon: <TrendingUp className="h-4 w-4" /> },
];

export default function PublicBlogList() {
  const [category, setCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [page, setPage] = useState(1);
  const [filteredPosts, setFilteredPosts] = useState<any[]>([]);
  const pageSize = 9;
  
  const { data, isLoading, isFetching, error } = useGetBlogPostsQuery({
    endpoint: 'published',
    category: category !== 'all' ? category : undefined,
    limit: 50, // Get more posts and filter client-side for better UX
  });
  
  const router = useRouter();
  
  // Filter posts based on search query
  useEffect(() => {
    if (data?.posts && Array.isArray(data.posts)) {
      if (!searchQuery) {
        setFilteredPosts(data.posts);
      } else {
        const query = searchQuery.toLowerCase();
        const filtered = data.posts.filter(post => 
          post.title.toLowerCase().includes(query) || 
          post.content.toLowerCase().includes(query) ||
          post.userName.toLowerCase().includes(query) ||
          (post.tags && post.tags.some(tag => tag.toLowerCase().includes(query)))
        );
        setFilteredPosts(filtered);
      }
      setPage(1); // Reset to first page on filter change
    }
  }, [searchQuery, data]);
  
  const handleCategoryChange = (value: string) => {
    setCategory(value);
    setPage(1);
  };
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Function to truncate text to a certain number of words
  const truncateText = (text: string, maxWords: number) => {
    const words = text.split(' ');
    if (words.length > maxWords) {
      return words.slice(0, maxWords).join(' ') + '...';
    }
    return text;
  };

  // Calculate pagination
  const totalPosts = filteredPosts?.length || 0;
  const totalPages = Math.ceil(totalPosts / pageSize);
  const currentPosts = filteredPosts?.slice((page - 1) * pageSize, page * pageSize) || [];
  
  // Time to read estimate
  const calculateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    const readTime = Math.ceil(words / wordsPerMinute);
    return readTime < 1 ? 1 : readTime;
  };

  return (
    <div className="space-y-8">
      {/* Search and Filter Controls */}
      <div className="rounded-xl bg-customgreys-darkGrey p-4 border border-customgreys-darkerGrey shadow-lg shadow-black/10">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search posts by title, content, or author..."
              className="pl-10 bg-customgreys-primarybg border-customgreys-darkerGrey text-white placeholder:text-gray-500 focus:border-primary-700"
            />
          </div>
          
          <Tabs defaultValue="all" value={category} onValueChange={handleCategoryChange} className="w-full md:w-auto">
            <TabsList className="grid grid-cols-3 md:grid-cols-5 h-auto p-1 bg-customgreys-primarybg">
              <TabsTrigger value="all" className="text-xs md:text-sm py-1.5 data-[state=active]:bg-primary-800 data-[state=active]:text-white">All</TabsTrigger>
              <TabsTrigger value="programming" className="text-xs md:text-sm py-1.5 data-[state=active]:bg-primary-800 data-[state=active]:text-white">Programming</TabsTrigger>
              <TabsTrigger value="design" className="text-xs md:text-sm py-1.5 data-[state=active]:bg-primary-800 data-[state=active]:text-white">Design</TabsTrigger>
              <TabsTrigger value="ai" className="text-xs md:text-sm py-1.5 data-[state=active]:bg-primary-800 data-[state=active]:text-white">AI</TabsTrigger>
              <TabsTrigger value="career" className="text-xs md:text-sm py-1.5 data-[state=active]:bg-primary-800 data-[state=active]:text-white">Career</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      {/* Results Counter */}
      <div className="flex items-center justify-between">
        <div>
          <Text className="text-sm text-gray-400">
            {isLoading ? 'Loading...' : `Showing ${filteredPosts.length > 0 ? (page - 1) * pageSize + 1 : 0}-${Math.min(page * pageSize, totalPosts)} of ${totalPosts} posts`}
          </Text>
        </div>
        
        {category !== 'all' && (
          <Badge variant="outline" className="capitalize flex gap-1 items-center bg-primary-900/20 border-primary-700/30 text-primary-400">
            <TagIcon className="h-3 w-3" />
            {category}
          </Badge>
        )}
      </div>
      
      {error ? (
        <div className="p-8 text-center bg-customgreys-darkGrey rounded-xl border border-customgreys-darkerGrey shadow-lg shadow-black/10">
          <Text className="text-white flex flex-col items-center gap-2">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary-900/30 text-primary-400">
              <AlertCircle className="h-5 w-5" />
            </span>
            Error loading blog posts. Please try again later.
          </Text>
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden bg-customgreys-darkGrey border-customgreys-darkerGrey">
              <Skeleton className="h-48 w-full bg-customgreys-secondarybg" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4 bg-customgreys-secondarybg" />
                <Skeleton className="h-4 w-1/2 bg-customgreys-secondarybg" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2 bg-customgreys-secondarybg" />
                <Skeleton className="h-4 w-full mb-2 bg-customgreys-secondarybg" />
                <Skeleton className="h-4 w-3/4 bg-customgreys-secondarybg" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {currentPosts.length === 0 ? (
            <div className="col-span-full p-8 text-center bg-customgreys-darkGrey rounded-xl border border-customgreys-darkerGrey shadow-lg shadow-black/10">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary-900/30 mb-4">
                <Search className="h-6 w-6 text-primary-400" />
              </div>
              <Text className="text-lg font-medium text-white">No posts found</Text>
              <Text className="text-gray-400 mt-1">
                {searchQuery 
                  ? `No results for "${searchQuery}". Try a different search term.` 
                  : `No posts found in the ${category !== 'all' ? category : ''} category.`}
              </Text>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentPosts.map((post) => (
                  <Card key={post.postId} className="overflow-hidden flex flex-col h-full border group transition-all duration-300 hover:shadow-xl bg-customgreys-darkGrey border-customgreys-darkerGrey hover:border-primary-700/50 shadow-lg shadow-black/10">
                    {/* Image Section */}
                    <div className="relative h-56 w-full overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-customgreys-darkGrey to-transparent opacity-60 z-10"></div>
                      <Image 
                        src={
                          !post.featuredImage || 
                          post.featuredImage.includes('/user/blog') ||
                          post.featuredImage.includes('localhost') ||
                          post.featuredImage.startsWith('/')
                            ? `https://picsum.photos/800/600?random=${post.postId}` 
                          : post.featuredImage.includes('://') 
                            ? post.featuredImage 
                              : `https://picsum.photos/800/600?random=${post.postId}`
                        } 
                        alt={post.title}
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        fill
                        unoptimized={true}
                        onError={(e) => {
                          // If image fails to load, replace with a placeholder
                          const imgElement = e.currentTarget as HTMLImageElement;
                          
                          // Prevent infinite loops by checking if we're already using a placeholder
                          if (!imgElement.src.includes('picsum.photos')) {
                          imgElement.src = `https://picsum.photos/800/600?random=${post.postId}`;
                          }
                        }}
                      />
                      
                      {/* Category Badge */}
                      <div className="absolute top-4 left-4 z-20">
                        <Badge className="capitalize bg-primary-800/80 hover:bg-primary-800/80 text-white border-none backdrop-blur-sm">
                          {post.category}
                        </Badge>
                      </div>
                      
                      {/* Reading Time Badge */}
                      <div className="absolute top-4 right-4 z-20">
                        <div className="flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-xs text-white backdrop-blur-sm">
                          <Clock className="h-3 w-3 text-primary-400" />
                          <span>{calculateReadTime(post.content)} min read</span>
                        </div>
                      </div>
                    </div>
                    
                    <CardHeader className="pb-3">
                      <CardTitle className="line-clamp-2 text-xl font-bold">
                        <Link href={`/blog/${post.postId}`} className="text-white hover:text-primary-400 transition-colors">
                        {post.title}
                      </Link>
                    </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-gray-400 mt-2">
                      <CalendarIcon size={14} />
                      <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                    </div>
                  </CardHeader>
                    
                    <CardContent className="flex-grow pb-3">
                      <Text className="line-clamp-3 text-gray-400">
                        {truncateText(post.content, 25)}
                    </Text>
                    </CardContent>
                    
                    <CardFooter className="flex items-center justify-between pt-4 border-t border-customgreys-darkerGrey">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8 border-2 border-customgreys-darkerGrey shadow-sm">
                        <AvatarImage src={post.userAvatar} alt={post.userName} />
                          <AvatarFallback className="bg-primary-900/50 text-primary-200">
                          {post.userName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                        <Text className="text-sm font-medium text-gray-300">{post.userName}</Text>
                    </div>
                      
                    <Button 
                        variant="ghost" 
                      size="sm" 
                        className="text-primary-400 hover:text-primary-300 hover:bg-primary-900/20 p-0 h-auto"
                      onClick={() => router.push(`/blog/${post.postId}`)}
                    >
                        Read more
                        <BookOpen className="ml-1 h-3.5 w-3.5" />
                    </Button>
                  </CardFooter>
                </Card>
                ))}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-10">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                    className="h-9 w-9 p-0 bg-customgreys-darkGrey border-customgreys-darkerGrey text-gray-300 hover:bg-customgreys-secondarybg hover:text-white disabled:text-gray-600"
                  >
                    &laquo;
                  </Button>
                  
                  {[...Array(totalPages)].map((_, i) => (
                    <Button
                      key={i}
                      variant={page === i + 1 ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPage(i + 1)}
                      className={page === i + 1 
                        ? "h-9 w-9 p-0 bg-primary-800 text-white hover:bg-primary-700 border-primary-700/50" 
                        : "h-9 w-9 p-0 bg-customgreys-darkGrey border-customgreys-darkerGrey text-gray-300 hover:bg-customgreys-secondarybg hover:text-white"
                      }
                    >
                      {i + 1}
                    </Button>
                  ))}
                  
              <Button 
                variant="outline"
                    size="sm"
                    onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={page === totalPages}
                    className="h-9 w-9 p-0 bg-customgreys-darkGrey border-customgreys-darkerGrey text-gray-300 hover:bg-customgreys-secondarybg hover:text-white disabled:text-gray-600"
              >
                    &raquo;
              </Button>
            </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
} 