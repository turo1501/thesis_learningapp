"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import PublicBlogList from '@/components/blog/PublicBlogList';
import { Heading, Text } from '@/components/ui/typography';
import { Button } from '@/components/ui/button';
import { ChevronRight, LightbulbIcon, BookOpenCheck, Users, Plus, ArrowRight, TrendingUp, Search } from 'lucide-react';

export default function BlogPage() {
  const router = useRouter();
  const { isSignedIn, user } = useUser();
  
  const handleCreatePost = () => {
    router.push('/user/blog');
  };
  
  return (
    <div className="min-h-screen bg-customgreys-primarybg text-white">
      {/* Hero Section with 3D Effect */}
      <div className="relative overflow-hidden bg-customgreys-secondarybg">
        {/* 3D Grid Effect */}
        <div className="absolute inset-0 bg-[url('/blog-pattern.svg')] opacity-5 transform-gpu scale-150"></div>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-primary-900/90 via-customgreys-secondarybg/80 to-transparent"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 right-10 w-24 h-24 rounded-full bg-primary-600/10 blur-xl"></div>
        <div className="absolute bottom-40 left-10 w-32 h-32 rounded-full bg-primary-700/10 blur-xl"></div>
        
        <div className="container mx-auto px-4 py-20 sm:py-28 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block rounded-full bg-customgreys-darkGrey px-4 py-1.5 text-sm font-medium text-primary-400 backdrop-blur-sm mb-6 border border-primary-800/40">
              <span className="mr-2 inline-block w-2 h-2 rounded-full bg-primary-500 animate-pulse"></span>
              Knowledge Hub
            </div>
            
            <Heading as="h1" className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-br from-white via-primary-300 to-primary-500">
              Explore Our Knowledge Blog
            </Heading>
            
            <Text className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Discover expert insights, innovative ideas, and practical solutions from our community of learners and educators.
            </Text>
            
            <div className="mt-12 flex flex-wrap gap-5 justify-center">
              <Link href="#latest-posts" 
                className="group relative inline-flex h-12 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-customgreys-primarybg">
                <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#9181fa_0%,#4237ca_50%,#9181fa_100%)]" />
                <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-customgreys-darkGrey px-8 py-1 text-sm font-medium text-white backdrop-blur-3xl">
                  Explore Latest Posts
                  <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
              
              {isSignedIn && (
                <Button 
                  onClick={handleCreatePost}
                  variant="default"
                  className="h-12 rounded-full bg-primary-700 hover:bg-primary-600 text-white border border-primary-600/40 px-8"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Post
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 150" className="w-full text-customgreys-primarybg fill-current">
            <path d="M0,128L48,117.3C96,107,192,85,288,90.7C384,96,480,128,576,133.3C672,139,768,117,864,90.7C960,64,1056,32,1152,32C1248,32,1344,64,1392,80L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </div>
      
      
      
      {/* Latest Posts Section */}
      <div id="latest-posts" className="container mx-auto px-4 py-16 scroll-mt-24">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="px-4 py-1 bg-primary-900/30 inline-block rounded-full text-xs font-medium text-primary-400 mb-3">
              Latest Publications
            </div>
            <Heading as="h2" className="text-3xl md:text-4xl font-bold text-white">
              Trending Articles
            </Heading>
            <Text className="mt-4 text-gray-400 max-w-2xl">
              Explore our collection of expert-written articles, in-depth tutorials, and insightful stories from our community of educators and students.
            </Text>
          </div>
          
          {isSignedIn && (
            <Button 
              onClick={handleCreatePost}
              variant="outline"
              className="md:mb-1 flex items-center gap-2 border-primary-700 bg-customgreys-darkGrey hover:bg-customgreys-darkerGrey text-primary-400"
            >
              <Plus className="h-4 w-4" />
              Write a Post
            </Button>
          )}
        </div>
        
        <PublicBlogList />
      </div>
      
      
    </div>
  );
} 