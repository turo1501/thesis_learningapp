"use client";

import Header from "@/components/Header";
import Loading from "@/components/Loading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Filter,
  MessageSquare,
  ThumbsUp,
} from "lucide-react";
import React, { useState } from "react";

type BlogPost = {
  id: string;
  title: string;
  author: string;
  authorId: string;
  date: string;
  status: "pending" | "approved" | "rejected";
  excerpt: string;
  likes: number;
  comments: number;
  tags: string[];
};

const BlogApproval = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState("all");

  // Mock data - would be fetched from API
  const blogPosts: BlogPost[] = [
    {
      id: "1",
      title: "The Future of AI in Education",
      author: "John Doe",
      authorId: "user_123",
      date: "2023-04-01",
      status: "pending",
      excerpt: "Exploring how artificial intelligence is reshaping modern education systems and learning methodologies.",
      likes: 45,
      comments: 12,
      tags: ["AI", "Education", "Technology"],
    },
    {
      id: "2",
      title: "10 Tips for Online Course Creation",
      author: "Jane Smith",
      authorId: "user_456",
      date: "2023-04-02",
      status: "pending",
      excerpt: "A comprehensive guide for teachers looking to create engaging online courses.",
      likes: 23,
      comments: 8,
      tags: ["Teaching", "Online Learning", "Course Design"],
    },
    {
      id: "3",
      title: "The Psychology of Remote Learning",
      author: "Michael Brown",
      authorId: "user_789",
      date: "2023-04-03",
      status: "pending",
      excerpt: "Understanding the psychological impacts and benefits of remote educational environments.",
      likes: 67,
      comments: 21,
      tags: ["Psychology", "Remote Learning", "Study"],
    },
    {
      id: "4",
      title: "Blockchain for Educational Certifications",
      author: "Lisa Johnson",
      authorId: "user_321",
      date: "2023-04-03",
      status: "approved",
      excerpt: "How blockchain technology can revolutionize the way educational achievements are certified and verified.",
      likes: 32,
      comments: 15,
      tags: ["Blockchain", "Certification", "Technology"],
    },
    {
      id: "5",
      title: "Gamification in the Virtual Classroom",
      author: "David Wilson",
      authorId: "user_654",
      date: "2023-04-04",
      status: "rejected",
      excerpt: "Implementing game mechanics in virtual learning environments to boost student engagement.",
      likes: 12,
      comments: 7,
      tags: ["Gamification", "Education", "Engagement"],
    },
  ];

  const filteredPosts = blogPosts.filter((post) => {
    if (filter === "all") return true;
    return post.status === filter;
  });

  const handleApprove = (postId: string) => {
    // Here you would call an API to approve the post
    console.log(`Approving post ${postId}`);
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 500); // Simulate API call
  };

  const handleReject = (postId: string) => {
    // Here you would call an API to reject the post
    console.log(`Rejecting post ${postId}`);
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 500); // Simulate API call
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "approved":
        return (
          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  if (isLoading) return <Loading />;

  return (
    <div className="blog-approval">
      <Header
        title="Blog Post Approval"
        subtitle="Review and manage blog post submissions"
        rightElement={
          <div className="flex items-center gap-3">
            <div className="bg-slate-800 p-2 rounded-md flex items-center gap-2">
              <Filter size={14} className="text-slate-400" />
              <select
                className="bg-transparent text-sm border-none focus:outline-none text-white"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Posts</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        }
      />

      <div className="blog-approval__content mt-6 space-y-4">
        {filteredPosts.length === 0 ? (
          <Card className="p-8 text-center text-slate-400">
            <p>No blog posts found matching the selected filter.</p>
          </Card>
        ) : (
          filteredPosts.map((post) => (
            <Card key={post.id} className="p-6 bg-slate-900 border-slate-700">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    {renderStatusBadge(post.status)}
                    {post.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="bg-blue-500/10 text-blue-400 border-blue-500/20"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <h2 className="text-xl font-semibold text-white mb-2">{post.title}</h2>
                  <p className="text-slate-400 mb-3">{post.excerpt}</p>
                  <div className="flex items-center text-xs text-slate-500 mb-4">
                    <span className="mr-3">By {post.author}</span>
                    <span>{new Date(post.date).toLocaleDateString()}</span>
                    <div className="flex items-center ml-auto">
                      <ThumbsUp className="h-3 w-3 mr-1" />
                      <span className="mr-3">{post.likes}</span>
                      <MessageSquare className="h-3 w-3 mr-1" />
                      <span>{post.comments}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-row md:flex-col gap-2 self-end md:self-center">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Preview
                  </Button>
                  
                  {post.status === "pending" && (
                    <>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleApprove(post.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-red-600/10 text-red-500 border-red-600/20 hover:bg-red-600/20"
                        onClick={() => handleReject(post.id)}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default BlogApproval;
