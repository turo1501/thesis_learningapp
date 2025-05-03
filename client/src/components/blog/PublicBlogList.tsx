"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useGetBlogPostsQuery } from '@/state/api';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heading, Text } from '@/components/ui/typography';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CalendarIcon, BookOpen } from 'lucide-react';

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'programming', label: 'Programming' },
  { value: 'design', label: 'Design' },
  { value: 'data-science', label: 'Data Science' },
  { value: 'ai', label: 'Artificial Intelligence' },
  { value: 'web-development', label: 'Web Development' },
  { value: 'mobile-development', label: 'Mobile Development' },
  { value: 'devops', label: 'DevOps' },
  { value: 'career', label: 'Career Advice' },
];

export default function PublicBlogList() {
  const [category, setCategory] = useState<string>('all');
  const [page, setPage] = useState(1);
  const pageSize = 6;
  
  const { data, isLoading, isFetching, error } = useGetBlogPostsQuery({
    status: 'published',
    category: category !== 'all' ? category : undefined,
    limit: pageSize,
  });
  
  const router = useRouter();
  
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

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <Heading as="h2" className="text-xl">
            {category === 'all' ? 'All Posts' : `${categories.find(c => c.value === category)?.label}`}
          </Heading>
          <Text className="text-customgreys-dirtyGrey">
            {isLoading ? 'Loading...' : `${data?.count || 0} posts found`}
          </Text>
        </div>
        
        <div className="w-full md:w-auto">
          <Select value={category} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {error ? (
        <div className="p-6 text-center bg-red-50 rounded-lg">
          <Text className="text-red-500">
            Error loading blog posts. Please try again later.
          </Text>
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.posts && Array.isArray(data.posts) && data.posts.length > 0 ? (
              data.posts.map((post) => (
                <Card key={post.postId} className="overflow-hidden flex flex-col h-full">
                  {post.featuredImage && (
                    <div className="relative h-48 w-full">
                      <Image 
                        src={post.featuredImage.startsWith('/') 
                          ? post.featuredImage 
                          : post.featuredImage.includes('://') 
                            ? post.featuredImage 
                            : `https://picsum.photos/800/600?random=${post.postId}`} 
                        alt={post.title}
                        className="object-cover"
                        fill
                        onError={(e) => {
                          // If image fails to load, replace with a placeholder
                          const imgElement = e.currentTarget as HTMLImageElement;
                          imgElement.src = `https://picsum.photos/800/600?random=${post.postId}`;
                        }}
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="line-clamp-2 text-xl">
                      <Link href={`/blog/${post.postId}`} className="hover:text-primary-600 transition-colors">
                        {post.title}
                      </Link>
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-customgreys-dirtyGrey">
                      <CalendarIcon size={14} />
                      <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <Text className="line-clamp-3 text-customgreys-dirtyGrey">
                      {truncateText(post.content, 30)}
                    </Text>
                    
                    <div className="flex items-center gap-2 mt-4">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={post.userAvatar} alt={post.userName} />
                        <AvatarFallback>
                          {post.userName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <Text className="text-sm font-medium">{post.userName}</Text>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => router.push(`/blog/${post.postId}`)}
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      Read More
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full p-6 text-center bg-customgreys-foreground rounded-lg">
                <Text>No blog posts found for this category.</Text>
              </div>
            )}
          </div>
          
          {data?.lastKey && (
            <div className="flex justify-center mt-8">
              <Button 
                onClick={() => setPage(prev => prev + 1)}
                disabled={isFetching || !data?.lastKey}
                variant="outline"
              >
                {isFetching ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
} 