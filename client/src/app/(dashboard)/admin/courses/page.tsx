"use client";

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
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  BookOpen,
  Users,
  BarChart2,
  FileText,
  Filter,
  ChevronRight,
  Star,
  DollarSign,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Define types
interface Instructor {
  id: string;
  name: string;
  avatar: string;
  email: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  category: string;
  status: "published" | "draft" | "archived" | "pending_review";
  instructor: Instructor;
  price: number;
  discountPrice?: number;
  rating: number;
  totalRatings: number;
  totalStudents: number;
  totalLessons: number;
  duration: string; // Format: "10h 30m"
  lastUpdated: string; // ISO date string
  featured: boolean;
}

// Sample data
const sampleCourses: Course[] = [
  {
    id: "course_1",
    title: "Complete JavaScript from Zero to Expert",
    description: "Master JavaScript with the most comprehensive course on the market. Projects included!",
    coverImage: "/images/courses/javascript-course.jpg",
    category: "Programming",
    status: "published",
    instructor: {
      id: "inst_1",
      name: "Sarah Smith",
      avatar: "/avatars/sarah.jpg",
      email: "sarah.smith@example.com",
    },
    price: 129.99,
    discountPrice: 89.99,
    rating: 4.8,
    totalRatings: 2345,
    totalStudents: 15642,
    totalLessons: 158,
    duration: "24h 30m",
    lastUpdated: "2025-02-15T14:30:00Z",
    featured: true,
  },
  {
    id: "course_2",
    title: "React - The Complete Guide",
    description: "Dive into React development and learn how to build powerful, reactive applications",
    coverImage: "/images/courses/react-course.jpg",
    category: "Programming",
    status: "published",
    instructor: {
      id: "inst_2",
      name: "Michael Brown",
      avatar: "/avatars/michael.jpg",
      email: "michael.brown@example.com",
    },
    price: 149.99,
    discountPrice: 99.99,
    rating: 4.9,
    totalRatings: 3217,
    totalStudents: 18934,
    totalLessons: 182,
    duration: "32h 45m",
    lastUpdated: "2025-03-01T09:15:00Z",
    featured: true,
  },
  {
    id: "course_3",
    title: "Python for Data Science and Machine Learning",
    description: "Learn how to use Python for data analysis, visualization, and machine learning",
    coverImage: "/images/courses/python-course.jpg",
    category: "Data Science",
    status: "published",
    instructor: {
      id: "inst_3",
      name: "Emily Davis",
      avatar: "/avatars/emily.jpg",
      email: "emily.davis@example.com",
    },
    price: 179.99,
    discountPrice: 119.99,
    rating: 4.7,
    totalRatings: 1852,
    totalStudents: 12431,
    totalLessons: 145,
    duration: "28h 15m",
    lastUpdated: "2025-02-25T11:45:00Z",
    featured: false,
  },
  {
    id: "course_4",
    title: "Modern Web Design: HTML, CSS, and UI/UX",
    description: "Create stunning, responsive websites with modern HTML, CSS, and design principles",
    coverImage: "/images/courses/web-design-course.jpg",
    category: "Web Design",
    status: "draft",
    instructor: {
      id: "inst_4",
      name: "David Kim",
      avatar: "/avatars/david.jpg",
      email: "david.kim@example.com",
    },
    price: 119.99,
    rating: 0,
    totalRatings: 0,
    totalStudents: 0,
    totalLessons: 102,
    duration: "18h 20m",
    lastUpdated: "2025-03-10T15:20:00Z",
    featured: false,
  },
  {
    id: "course_5",
    title: "Advanced Node.js: Building Scalable Applications",
    description: "Learn how to build high-performance, scalable backend systems with Node.js",
    coverImage: "/images/courses/nodejs-course.jpg",
    category: "Programming",
    status: "pending_review",
    instructor: {
      id: "inst_2",
      name: "Michael Brown",
      avatar: "/avatars/michael.jpg",
      email: "michael.brown@example.com",
    },
    price: 159.99,
    rating: 0,
    totalRatings: 0,
    totalStudents: 0,
    totalLessons: 132,
    duration: "22h 45m",
    lastUpdated: "2025-03-12T10:30:00Z",
    featured: false,
  },
  {
    id: "course_6",
    title: "AWS Certified Solutions Architect",
    description: "Prepare for the AWS Solutions Architect certification with hands-on exercises",
    coverImage: "/images/courses/aws-course.jpg",
    category: "Cloud Computing",
    status: "published",
    instructor: {
      id: "inst_5",
      name: "James Wilson",
      avatar: "/avatars/james.jpg",
      email: "james.wilson@example.com",
    },
    price: 199.99,
    discountPrice: 149.99,
    rating: 4.9,
    totalRatings: 974,
    totalStudents: 8215,
    totalLessons: 165,
    duration: "30h 15m",
    lastUpdated: "2025-03-05T13:10:00Z",
    featured: true,
  },
  {
    id: "course_7",
    title: "Flutter & Dart: Build iOS and Android Apps",
    description: "Create beautiful native mobile apps for both platforms from a single codebase",
    coverImage: "/images/courses/flutter-course.jpg",
    category: "Mobile Development",
    status: "archived",
    instructor: {
      id: "inst_1",
      name: "Sarah Smith",
      avatar: "/avatars/sarah.jpg",
      email: "sarah.smith@example.com",
    },
    price: 139.99,
    rating: 4.6,
    totalRatings: 1245,
    totalStudents: 9764,
    totalLessons: 128,
    duration: "26h 30m",
    lastUpdated: "2024-11-20T09:45:00Z",
    featured: false,
  },
];

const CoursesManagement = () => {
  const [courses, setCourses] = useState<Course[]>(sampleCourses);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [instructorFilter, setInstructorFilter] = useState("all");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  
  // Get unique categories and instructors for filters
  const categories = [...new Set(courses.map(course => course.category))];
  const instructors = [...new Set(courses.map(course => course.instructor.name))];
  
  // Filter courses based on filters and search
  const filteredCourses = courses.filter(course => {
    const matchesSearch = 
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || course.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || course.category === categoryFilter;
    const matchesInstructor = instructorFilter === "all" || course.instructor.name === instructorFilter;
    
    return matchesSearch && matchesStatus && matchesCategory && matchesInstructor;
  });
  
  // Function to approve a pending course
  const handleApproveCourse = (courseId: string) => {
    setCourses(prevCourses => 
      prevCourses.map(course => 
        course.id === courseId 
          ? { ...course, status: "published" } 
          : course
      )
    );
    toast.success("Course has been published");
  };
  
  // Function to reject a pending course
  const handleRejectCourse = (courseId: string) => {
    setCourses(prevCourses => 
      prevCourses.map(course => 
        course.id === courseId 
          ? { ...course, status: "draft" } 
          : course
      )
    );
    toast.success("Course has been returned to draft status");
  };
  
  // Function to archive a course
  const handleArchiveCourse = (courseId: string) => {
    setCourses(prevCourses => 
      prevCourses.map(course => 
        course.id === courseId 
          ? { ...course, status: "archived" } 
          : course
      )
    );
    toast.success("Course has been archived");
  };
  
  // Function to restore an archived course
  const handleRestoreCourse = (courseId: string) => {
    setCourses(prevCourses => 
      prevCourses.map(course => 
        course.id === courseId 
          ? { ...course, status: "published" } 
          : course
      )
    );
    toast.success("Course has been restored and published");
  };
  
  // Function to toggle featured status
  const handleToggleFeatured = (courseId: string) => {
    setCourses(prevCourses => 
      prevCourses.map(course => 
        course.id === courseId 
          ? { ...course, featured: !course.featured } 
          : course
      )
    );
    
    const course = courses.find(c => c.id === courseId);
    const featuredAction = course?.featured ? "removed from" : "added to";
    toast.success(`Course ${featuredAction} featured courses`);
  };
  
  // Function to delete a course
  const handleDeleteCourse = (courseId: string) => {
    setCourses(prevCourses => prevCourses.filter(course => course.id !== courseId));
    toast.success("Course has been deleted");
  };
  
  // Helper function to format price
  const formatPrice = (price: number, discountPrice?: number) => {
    if (discountPrice) {
      return (
        <div className="flex items-center gap-2">
          <span className="text-primary-500 font-semibold">${discountPrice.toFixed(2)}</span>
          <span className="text-gray-400 text-sm line-through">${price.toFixed(2)}</span>
        </div>
      );
    }
    return <span className="text-primary-500 font-semibold">${price.toFixed(2)}</span>;
  };
  
  // Helper function to get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-600">Published</Badge>;
      case "draft":
        return <Badge className="bg-gray-500">Draft</Badge>;
      case "archived":
        return <Badge className="bg-red-600">Archived</Badge>;
      case "pending_review":
        return <Badge className="bg-amber-500">Pending Review</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };
  
  return (
    <div className="space-y-6">
      <Header 
        title="Courses Management" 
        subtitle="Manage, approve, and analyze courses"
        rightElement={
          <Button className="bg-primary-700 hover:bg-primary-600">
            <Plus className="mr-2 h-4 w-4" />
            Add New Course
          </Button>
        }
      />

      {/* Filters and Search */}
      <Card className="bg-customgreys-secondarybg border-none shadow-md">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-customgreys-dirtyGrey" />
              <Input
                placeholder="Search courses..."
                className="pl-10 bg-customgreys-primarybg border-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-4 flex-wrap">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px] bg-customgreys-primarybg border-none">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-customgreys-primarybg border-gray-700">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                  <SelectItem value="pending_review">Pending Review</SelectItem>
                </SelectContent>
              </Select>
              
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
              
              <Select value={instructorFilter} onValueChange={setInstructorFilter}>
                <SelectTrigger className="w-[180px] bg-customgreys-primarybg border-none">
                  <SelectValue placeholder="Filter by instructor" />
                </SelectTrigger>
                <SelectContent className="bg-customgreys-primarybg border-gray-700">
                  <SelectItem value="all">All Instructors</SelectItem>
                  {instructors.map(instructor => (
                    <SelectItem key={instructor} value={instructor}>
                      {instructor}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Course Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCourses.map(course => (
          <Card key={course.id} className="bg-customgreys-secondarybg border-none shadow-md overflow-hidden">
            <div className="relative h-40 overflow-hidden">
              <div 
                className="absolute inset-0 bg-center bg-cover" 
                style={{ 
                  backgroundImage: `url(${course.coverImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/20" />
              <div className="absolute top-2 left-2 flex gap-2">
                {getStatusBadge(course.status)}
                {course.featured && <Badge className="bg-primary-700">Featured</Badge>}
              </div>
              <div className="absolute bottom-2 right-2 flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-400" fill="currentColor" />
                <span className="text-white text-sm font-medium">
                  {course.rating > 0 ? course.rating.toFixed(1) : "New"}
                </span>
                {course.totalRatings > 0 && (
                  <span className="text-gray-300 text-xs">({course.totalRatings})</span>
                )}
              </div>
            </div>
            
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <Badge className="bg-blue-600 mb-2">{course.category}</Badge>
                  <CardTitle className="text-lg line-clamp-1">{course.title}</CardTitle>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-customgreys-primarybg border-gray-700">
                    <DropdownMenuItem className="cursor-pointer flex items-center">
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer flex items-center">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Course
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="cursor-pointer flex items-center"
                      onClick={() => handleToggleFeatured(course.id)}
                    >
                      <Star className="mr-2 h-4 w-4" fill={course.featured ? "currentColor" : "none"} />
                      {course.featured ? "Remove from Featured" : "Add to Featured"}
                    </DropdownMenuItem>
                    
                    {course.status === "pending_review" && (
                      <>
                        <DropdownMenuItem 
                          className="cursor-pointer flex items-center text-green-500"
                          onClick={() => handleApproveCourse(course.id)}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Approve & Publish
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="cursor-pointer flex items-center text-amber-500"
                          onClick={() => handleRejectCourse(course.id)}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Return to Draft
                        </DropdownMenuItem>
                      </>
                    )}
                    
                    {course.status === "published" && (
                      <DropdownMenuItem 
                        className="cursor-pointer flex items-center text-amber-500"
                        onClick={() => handleArchiveCourse(course.id)}
                      >
                        <AlertCircle className="mr-2 h-4 w-4" />
                        Archive Course
                      </DropdownMenuItem>
                    )}
                    
                    {course.status === "archived" && (
                      <DropdownMenuItem 
                        className="cursor-pointer flex items-center text-green-500"
                        onClick={() => handleRestoreCourse(course.id)}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Restore Course
                      </DropdownMenuItem>
                    )}
                    
                    <DropdownMenuItem 
                      className="cursor-pointer flex items-center text-red-500"
                      onClick={() => handleDeleteCourse(course.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Course
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div className="flex items-center gap-2 mt-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={course.instructor.avatar} alt={course.instructor.name} />
                  <AvatarFallback className="bg-primary-700">
                    {course.instructor.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-gray-400">{course.instructor.name}</span>
              </div>
            </CardHeader>
            
            <CardContent className="py-2">
              <p className="text-sm text-gray-400 line-clamp-2">{course.description}</p>
              
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-1 text-sm text-gray-400">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-400">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span>{course.totalLessons} lessons</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-400">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span>{course.totalStudents.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between items-center pt-2 border-t border-gray-700">
              {formatPrice(course.price, course.discountPrice)}
              <div className="text-xs text-gray-400">
                Updated {format(new Date(course.lastUpdated), "MMM d, yyyy")}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {filteredCourses.length === 0 && (
        <Card className="bg-customgreys-secondarybg border-none shadow-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-gray-500 mb-4" />
            <p className="text-gray-400 text-center">No courses found matching your filters.</p>
            <Button 
              variant="outline" 
              className="mt-4 border-gray-700"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setCategoryFilter("all");
                setInstructorFilter("all");
              }}
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CoursesManagement; 