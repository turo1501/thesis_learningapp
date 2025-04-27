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
=======
import React, { useState } from "react";
import Header from "@/components/Header";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  CheckCircle,
  XCircle,
  Eye,
  FileText,
  Filter,
  Calendar,
  User,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";

// Define types for blog post management
interface Author {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  status: "pending" | "approved" | "rejected";
  author: Author;
  category: string;
  submittedDate: string;
  approvedDate?: string;
  rejectedDate?: string;
  rejectionReason?: string;
  readTime: string;
}

// Sample blog posts data for demonstration
const sampleBlogPosts: BlogPost[] = [
  {
    id: "blog_1",
    title: "Getting Started with React Hooks",
    excerpt: "Learn how to use React Hooks to simplify your components...",
    content: "React Hooks were introduced in React 16.8 to allow state and other React features to be used in functional components...",
    status: "pending",
    author: {
      id: "usr_2",
      name: "Sarah Smith",
      role: "teacher",
      avatar: "/avatars/sarah.jpg",
    },
    category: "Programming",
    submittedDate: "2025-03-25T10:30:00Z",
    readTime: "8 min",
  },
  {
    id: "blog_2",
    title: "Advanced CSS Grid Techniques",
    excerpt: "Discover powerful CSS Grid layouts for modern web design...",
    content: "CSS Grid Layout is a two-dimensional grid system designed specifically for laying out web pages...",
    status: "approved",
    author: {
      id: "usr_5",
      name: "Michael Brown",
      role: "teacher",
      avatar: "/avatars/michael.jpg",
    },
    category: "Web Design",
    submittedDate: "2025-03-20T14:15:00Z",
    approvedDate: "2025-03-22T09:45:00Z",
    readTime: "12 min",
  },
  {
    id: "blog_3",
    title: "Python for Data Science: A Beginner's Guide",
    excerpt: "Start your journey with Python for data analysis and visualization...",
    content: "Python has become the language of choice for data scientists for a variety of reasons...",
    status: "rejected",
    author: {
      id: "usr_2",
      name: "Sarah Smith",
      role: "teacher",
      avatar: "/avatars/sarah.jpg",
    },
    category: "Data Science",
    submittedDate: "2025-03-18T11:20:00Z",
    rejectedDate: "2025-03-19T16:30:00Z",
    rejectionReason: "Too similar to existing content. Please revise to add more unique insights.",
    readTime: "15 min",
  },
  {
    id: "blog_4",
    title: "Mastering TypeScript Generics",
    excerpt: "Unlock the full power of TypeScript with generics...",
    content: "TypeScript generics allow you to create reusable components and functions that work with various types...",
    status: "pending",
    author: {
      id: "usr_5",
      name: "Michael Brown",
      role: "teacher",
      avatar: "/avatars/michael.jpg",
    },
    category: "Programming",
    submittedDate: "2025-03-24T09:10:00Z",
    readTime: "10 min",
  },
  {
    id: "blog_5",
    title: "AI in Education: Current Trends",
    excerpt: "Explore how artificial intelligence is transforming educational methods...",
    content: "Artificial intelligence is revolutionizing how students learn and how educators teach...",
    status: "approved",
    author: {
      id: "usr_2",
      name: "Sarah Smith",
      role: "teacher",
      avatar: "/avatars/sarah.jpg",
    },
    category: "Education",
    submittedDate: "2025-03-15T13:20:00Z",
    approvedDate: "2025-03-17T10:15:00Z",
    readTime: "9 min",
  },
];

const BlogApproval = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(sampleBlogPosts);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [authorFilter, setAuthorFilter] = useState("all");

  // Get unique categories and authors for filters
  const categories = [...new Set(blogPosts.map(post => post.category))];
  const authors = [...new Set(blogPosts.map(post => post.author.name))];

  // Filter blog posts
  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = activeTab === "all" || post.status === activeTab;
    const matchesCategory = categoryFilter === "all" || post.category === categoryFilter;
    const matchesAuthor = authorFilter === "all" || post.author.name === authorFilter;
    
    return matchesSearch && matchesStatus && matchesCategory && matchesAuthor;
  });

  // Function to approve a blog post
  const handleApprove = (postId: string): void => {
    setBlogPosts(posts => 
      posts.map(post => 
        post.id === postId 
          ? {
              ...post, 
              status: "approved", 
              approvedDate: new Date().toISOString(),
              rejectedDate: undefined,
              rejectionReason: undefined
            } 
          : post
      )
    );
    toast.success("Blog post approved successfully");
    setSelectedPost(null);
  };

  // Function to reject a blog post
  const handleReject = (postId: string, reason = "Content does not meet our guidelines."): void => {
    setBlogPosts(posts => 
      posts.map(post => 
        post.id === postId 
          ? {
              ...post, 
              status: "rejected", 
              rejectedDate: new Date().toISOString(),
              rejectionReason: reason,
              approvedDate: undefined
            } 
          : post
      )
    );
    toast.success("Blog post rejected");
    setSelectedPost(null);
  };

  return (
    <div className="space-y-6">
      <Header 
        title="Blog Management" 
        subtitle="Review and approve blog posts" 
      />

      {/* Filters and Search */}
      <Card className="bg-customgreys-secondarybg border-none shadow-md">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-customgreys-dirtyGrey" />
              <Input
                placeholder="Search blog posts..."
                className="pl-10 bg-customgreys-primarybg border-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-4">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[160px] bg-customgreys-primarybg border-none">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent className="bg-customgreys-primarybg border-gray-700">
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={authorFilter} onValueChange={setAuthorFilter}>
                <SelectTrigger className="w-[160px] bg-customgreys-primarybg border-none">
                  <SelectValue placeholder="Filter by author" />
                </SelectTrigger>
                <SelectContent className="bg-customgreys-primarybg border-gray-700">
                  <SelectItem value="all">All Authors</SelectItem>
                  {authors.map(author => (
                    <SelectItem key={author} value={author}>
                      {author}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Blog Posts Tabs */}
      <Tabs 
        defaultValue="pending" 
        value={activeTab} 
        onValueChange={(value) => setActiveTab(value as "pending" | "approved" | "rejected" | "all")} 
        className="w-full"
      >
        <TabsList className="grid grid-cols-3 w-[400px] bg-customgreys-secondarybg mb-6">
          <TabsTrigger value="pending" className="data-[state=active]:bg-primary-700">
            Pending
          </TabsTrigger>
          <TabsTrigger value="approved" className="data-[state=active]:bg-primary-700">
            Approved
          </TabsTrigger>
          <TabsTrigger value="rejected" className="data-[state=active]:bg-primary-700">
            Rejected
          </TabsTrigger>
        </TabsList>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <Card 
              key={post.id} 
              className="bg-customgreys-secondarybg border-none shadow-md hover:bg-customgreys-darkerGrey transition cursor-pointer"
              onClick={() => setSelectedPost(post)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <Badge 
                    className={
                      post.status === "approved" 
                        ? "bg-green-500" 
                        : post.status === "rejected" 
                        ? "bg-red-500"
                        : "bg-amber-500"
                    }
                  >
                    {post.status}
                  </Badge>
                  <Badge className="bg-primary-700">{post.category}</Badge>
                </div>
                <CardTitle className="mt-2 text-lg">{post.title}</CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={post.author.avatar} alt={post.author.name} />
                    <AvatarFallback className="bg-primary-700">
                      {post.author.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-gray-400">{post.author.name}</span>
                  <span className="text-gray-500 text-xs">•</span>
                  <span className="text-sm text-gray-400">{post.readTime}</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-400 line-clamp-3">{post.excerpt}</p>
              </CardContent>
              <CardFooter className="flex justify-between border-t border-gray-700 pt-3">
                <div className="flex items-center text-xs text-gray-500">
                  <Calendar className="h-3 w-3 mr-1" />
                  {format(new Date(post.submittedDate), "MMM d, yyyy")}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-primary-500 hover:text-primary-400 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPost(post);
                  }}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Preview
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </Tabs>

      {/* Blog Post Preview Modal */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto bg-customgreys-primarybg border-none">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{selectedPost.title}</CardTitle>
                  <div className="flex items-center gap-3 mt-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={selectedPost.author.avatar} alt={selectedPost.author.name} />
                      <AvatarFallback className="bg-primary-700">
                        {selectedPost.author.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-medium">{selectedPost.author.name}</div>
                      <div className="text-xs text-gray-400">
                        {selectedPost.author.role === "teacher" ? "Teacher" : "Student"}
                      </div>
                    </div>
                    <span className="text-gray-500">•</span>
                    <div className="flex items-center text-gray-400 text-sm">
                      <Calendar className="h-4 w-4 mr-1" />
                      {format(new Date(selectedPost.submittedDate), "MMMM d, yyyy")}
                    </div>
                    <span className="text-gray-500">•</span>
                    <div className="text-gray-400 text-sm">{selectedPost.readTime}</div>
                  </div>
                </div>
                <Badge className="bg-primary-700">{selectedPost.category}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 whitespace-pre-line">{selectedPost.content}</p>
              </div>

              {selectedPost.status === "rejected" && selectedPost.rejectionReason && (
                <div className="mt-8 p-4 bg-red-500/20 rounded-md border border-red-500/30">
                  <div className="font-medium mb-1">Rejection Reason:</div>
                  <p className="text-gray-300">{selectedPost.rejectionReason}</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between border-t border-gray-700 pt-6">
              <Button
                variant="outline"
                onClick={() => setSelectedPost(null)}
                className="border-gray-700"
              >
                Close
              </Button>
              
              {selectedPost.status === "pending" && (
                <div className="flex gap-3">
                  <Button 
                    variant="destructive"
                    className="bg-red-600 hover:bg-red-700"
                    onClick={() => handleReject(selectedPost.id)}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                  <Button 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleApprove(selectedPost.id)}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                </div>
              )}
              
              {selectedPost.status === "approved" && (
                <Button 
                  variant="destructive"
                  className="bg-red-600 hover:bg-red-700"
                  onClick={() => handleReject(selectedPost.id)}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Revoke Approval
                </Button>
              )}
              
              {selectedPost.status === "rejected" && (
                <Button 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => handleApprove(selectedPost.id)}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve Anyway
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
};

export default BlogApproval;
