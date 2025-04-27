import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import PublicBlogList from '@/components/blog/PublicBlogList';
import { Heading, Text } from '@/components/ui/typography';

export const metadata: Metadata = {
  title: 'Knowledge Blog - Share and Learn',
  description: 'Explore blog posts shared by our students and teachers about their learning experiences and knowledge.',
};

export default function BlogPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="mb-12 text-center">
        <Heading as="h1" className="mb-4">Knowledge Sharing Blog</Heading>
        <Text className="text-lg max-w-3xl mx-auto">
          Explore blog posts shared by our students and teachers about their learning experiences, 
          programming tips, design insights, and more. Get inspired and learn from others in the community.
        </Text>
      </div>
      
      <PublicBlogList />
    </div>
  );
} 