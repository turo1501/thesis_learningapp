"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import PublicBlogList from '@/components/blog/PublicBlogList';
import { Heading, Text } from '@/components/ui/typography';
import { ArrowLeft, BookOpen, RssIcon, TrendingUp } from 'lucide-react';

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-customgreys-primarybg pb-20">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-customgreys-primarybg via-primary-900/10 to-customgreys-primarybg">
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-gradient-to-br from-primary-900/10 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-gradient-to-tl from-indigo-900/10 to-transparent rounded-full blur-3xl" />
          <div className="absolute inset-0 bg-[url('/pattern.svg')] bg-repeat opacity-5" />
        </div>
        
        {/* Back to Home Button */}
        <div className="max-w-[1600px] w-[100%] mx-auto px-4 pt-8 lg:pt-10 relative">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 px-4 py-2 lg:px-5 lg:py-2.5 2xl:px-6 2xl:py-3 rounded-full bg-customgreys-darkGrey/50 backdrop-blur-sm text-white border border-customgreys-darkerGrey/40 hover:bg-customgreys-darkGrey transition-all group lg:text-lg"
            >
              <ArrowLeft className="h-4 w-4 lg:h-5 lg:w-5 2xl:h-6 2xl:w-6 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Link>
          </motion.div>
        </div>
        
        <div className="max-w-[1600px] w-[100%] mx-auto px-4 pt-12 pb-16 lg:pt-16 lg:pb-24 2xl:pt-20 2xl:pb-32 relative">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex items-center justify-center gap-2 bg-primary-900/30 rounded-full px-4 py-2 lg:px-5 lg:py-2.5 2xl:px-6 2xl:py-3 text-sm lg:text-base 2xl:text-lg mb-6 lg:mb-8 2xl:mb-10 border border-primary-700/20 mx-auto w-fit"
            >
              <RssIcon className="w-4 h-4 lg:w-5 lg:h-5 2xl:w-6 2xl:h-6 text-primary-400" />
              <span className="text-primary-300">Curated articles for learners</span>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Heading as="h1" className="text-4xl lg:text-5xl 2xl:text-6xl font-bold mb-6 lg:mb-8 2xl:mb-10 text-white">
                Knowledge <span className="bg-gradient-to-r from-primary-400 to-indigo-400 text-transparent bg-clip-text">Sharing Blog</span>
              </Heading>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Text className="text-lg lg:text-xl 2xl:text-2xl text-customgreys-dirtyGrey max-w-3xl lg:max-w-4xl 2xl:max-w-5xl mx-auto">
                Explore blog posts shared by our students and teachers about their learning experiences, 
                programming tips, design insights, and more. Get inspired and learn from others in the community.
              </Text>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Stats Section */}
      <div className="max-w-[1600px] w-[100%] mx-auto px-4 -mt-12 lg:-mt-16 2xl:-mt-20 relative z-10 mb-16 lg:mb-20 2xl:mb-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 2xl:gap-10"
        >
          <div className="bg-customgreys-darkGrey/80 backdrop-blur-sm rounded-xl p-6 lg:p-8 2xl:p-10 border border-customgreys-darkerGrey/40 shadow-lg flex items-center">
            <div className="w-12 h-12 lg:w-16 lg:h-16 2xl:w-20 2xl:h-20 rounded-full bg-primary-900/20 flex items-center justify-center mr-4 lg:mr-6">
              <BookOpen className="w-6 h-6 lg:w-8 lg:h-8 2xl:w-10 2xl:h-10 text-primary-400" />
            </div>
            <div>
              <p className="text-3xl lg:text-4xl 2xl:text-5xl font-bold mb-1 lg:mb-2 text-white">100+</p>
              <p className="text-sm lg:text-base 2xl:text-lg text-customgreys-dirtyGrey">Articles Published</p>
            </div>
          </div>
          
          <div className="bg-customgreys-darkGrey/80 backdrop-blur-sm rounded-xl p-6 lg:p-8 2xl:p-10 border border-customgreys-darkerGrey/40 shadow-lg flex items-center">
            <div className="w-12 h-12 lg:w-16 lg:h-16 2xl:w-20 2xl:h-20 rounded-full bg-primary-900/20 flex items-center justify-center mr-4 lg:mr-6">
              <TrendingUp className="w-6 h-6 lg:w-8 lg:h-8 2xl:w-10 2xl:h-10 text-primary-400" />
            </div>
            <div>
              <p className="text-3xl lg:text-4xl 2xl:text-5xl font-bold mb-1 lg:mb-2 text-white">10K+</p>
              <p className="text-sm lg:text-base 2xl:text-lg text-customgreys-dirtyGrey">Monthly Reads</p>
            </div>
          </div>
          
          <div className="bg-customgreys-darkGrey/80 backdrop-blur-sm rounded-xl p-6 lg:p-8 2xl:p-10 border border-customgreys-darkerGrey/40 shadow-lg flex items-center sm:col-span-2 lg:col-span-1">
            <div className="w-12 h-12 lg:w-16 lg:h-16 2xl:w-20 2xl:h-20 rounded-full bg-primary-900/20 flex items-center justify-center mr-4 lg:mr-6">
              <RssIcon className="w-6 h-6 lg:w-8 lg:h-8 2xl:w-10 2xl:h-10 text-primary-400" />
            </div>
            <div>
              <p className="text-3xl lg:text-4xl 2xl:text-5xl font-bold mb-1 lg:mb-2 text-white">8</p>
              <p className="text-sm lg:text-base 2xl:text-lg text-customgreys-dirtyGrey">Categories</p>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Blog List Section */}
      <div className="max-w-[1600px] w-[100%] mx-auto px-4">
        <PublicBlogList />
      </div>
    </div>
  );
} 