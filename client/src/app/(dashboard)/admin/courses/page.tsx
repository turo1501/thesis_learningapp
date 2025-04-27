"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
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
>>>>>>> main
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  BookOpen,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  Download,
} from "lucide-react";
import { useGetCoursesQuery, useDeleteCourseMutation } from "@/state/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";

const AdminCoursesPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const router = useRouter();
  const { data: courses = [], isLoading } = useGetCoursesQuery({ category: "" });
  const [deleteCourse] = useDeleteCourseMutation();

  // Filter courses based on search query, category and status
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      searchQuery === "" ||
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.teacherName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || course.category === categoryFilter;

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "published" && course.status === "Published") ||
      (statusFilter === "draft" && course.status === "Draft");

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Pagination logic
  const coursesPerPage = 10;
  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);
  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * coursesPerPage,
    currentPage * coursesPerPage
  );

  // Get unique categories for filter dropdown
  const categories = [...new Set(courses.map((course) => course.category))];

  // Format price from cents to dollars
  const formatPrice = (price: number | undefined) => {
    if (!price) return "Free";
    return `$${(price / 100).toFixed(2)}`;
  };

  const handleDeleteClick = (courseId: string) => {
    setCourseToDelete(courseId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!courseToDelete) return;

    try {
      await deleteCourse(courseToDelete).unwrap();
      toast.success("Course deleted successfully");
    } catch (error) {
      toast.error("Failed to delete course");
      console.error("Delete error:", error);
    } finally {
      setDeleteDialogOpen(false);
      setCourseToDelete(null);
    }
  };

  const handleViewCourse = (course: Course) => {
    setSelectedCourse(course);
    setViewDialogOpen(true);
  };

  const handleEditCourse = (courseId: string) => {
    router.push(`/admin/courses/edit/${courseId}`);
  };

  return (
    <div className="admin-courses pb-8">
      <Header
        title="Course Management"
        subtitle="View, edit and manage all platform courses"
        rightElement={
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Download className="mr-2 h-4 w-4" />
            Export Courses
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

      {/* Filters Section */}
      <div className="mt-6 mb-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                  <Input
                    placeholder="Search courses or teachers..."
                    className="pl-8 bg-slate-900 border-slate-700"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="w-full md:w-auto flex flex-col sm:flex-row gap-4">
                <div className="w-full sm:w-48">
                  <Select
                    value={categoryFilter}
                    onValueChange={setCategoryFilter}
                  >
                    <SelectTrigger className="bg-slate-900 border-slate-700">
                      <div className="flex items-center">
                        <Filter className="mr-2 h-4 w-4 text-slate-500" />
                        <SelectValue placeholder="Category" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-full sm:w-48">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="bg-slate-900 border-slate-700">
                      <div className="flex items-center">
                        <Filter className="mr-2 h-4 w-4 text-slate-500" />
                        <SelectValue placeholder="Status" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Courses Table */}
      <Card className="bg-slate-800 border-slate-700">
        <div className="rounded-md overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-900">
              <TableRow>
                <TableHead className="w-[300px] min-w-[200px]">Course</TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Level</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin h-10 w-10 rounded-full border-4 border-slate-700 border-t-blue-600 mb-4"></div>
                      <span className="text-slate-400">Loading courses...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : paginatedCourses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    <div className="flex flex-col items-center justify-center">
                      <BookOpen className="h-10 w-10 text-slate-500 mb-2" />
                      <h3 className="text-lg text-slate-300 font-medium">
                        No courses found
                      </h3>
                      <p className="text-slate-400 mt-1">
                        Try changing your search or filter settings
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedCourses.map((course) => (
                  <TableRow key={course.courseId} className="border-slate-700">
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-3">
                        <div className="h-12 w-12 rounded-md overflow-hidden flex-shrink-0 bg-slate-700">
                          {course.image ? (
                            <Image
                              src={course.image}
                              alt={course.title}
                              width={48}
                              height={48}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-slate-700 text-slate-400">
                              <BookOpen size={20} />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium truncate max-w-[200px]">
                            {course.title}
                          </div>
                          <div className="text-xs text-slate-400 truncate max-w-[200px]">
                            {course.sections?.length || 0} sections
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{course.teacherName}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-slate-700 text-slate-200">
                        {course.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          course.status === "Published"
                            ? "bg-green-500/20 text-green-500 hover:bg-green-500/30"
                            : "bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30"
                        }
                      >
                        {course.status === "Published" ? (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        ) : (
                          <AlertCircle className="h-3 w-3 mr-1" />
                        )}
                        {course.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatPrice(course.price)}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          course.level === "Beginner"
                            ? "bg-blue-500/20 text-blue-500"
                            : course.level === "Intermediate"
                            ? "bg-yellow-500/20 text-yellow-500"
                            : "bg-red-500/20 text-red-500"
                        }
                      >
                        {course.level}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0"
                          >
                            <span className="sr-only">Open menu</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-slate-900 border-slate-700">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-slate-700" />
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => handleViewCourse(course)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => handleEditCourse(course.courseId)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit course
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer text-red-500 focus:text-red-500"
                            onClick={() => handleDeleteClick(course.courseId)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete course
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Pagination */}
      {filteredCourses.length > 0 && (
        <div className="mt-6 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                // Show first 2 pages, current page, and last 2 pages
                if (
                  page <= 2 ||
                  page > totalPages - 2 ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        isActive={page === currentPage}
                        onClick={() => setCurrentPage(page)}
                        className={page === currentPage ? "bg-blue-600" : ""}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                } else if (
                  page === 3 && currentPage > 4 ||
                  page === totalPages - 2 && currentPage < totalPages - 3
                ) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                } else {
                  return null;
                }
              })}
              
              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* View Course Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Course Details</DialogTitle>
            <DialogDescription className="text-slate-400">
              View detailed information about this course
            </DialogDescription>
          </DialogHeader>
          
          {selectedCourse && (
            <div className="mt-4">
              <div className="mb-6 flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/3 h-40 md:h-auto rounded-md overflow-hidden bg-slate-700">
                  {selectedCourse.image ? (
                    <Image
                      src={selectedCourse.image}
                      alt={selectedCourse.title}
                      width={300}
                      height={200}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-slate-700 text-slate-400">
                      <BookOpen size={48} />
                    </div>
                  )}
                </div>
                
                <div className="w-full md:w-2/3">
                  <h2 className="text-2xl font-bold">{selectedCourse.title}</h2>
                  
                  <div className="mt-2 flex flex-wrap gap-3">
                    <Badge className="bg-slate-700">{selectedCourse.category}</Badge>
                    <Badge
                      className={
                        selectedCourse.status === "Published"
                          ? "bg-green-500/20 text-green-500"
                          : "bg-yellow-500/20 text-yellow-500"
                      }
                    >
                      {selectedCourse.status}
                    </Badge>
                    <Badge
                      className={
                        selectedCourse.level === "Beginner"
                          ? "bg-blue-500/20 text-blue-500"
                          : selectedCourse.level === "Intermediate"
                          ? "bg-yellow-500/20 text-yellow-500"
                          : "bg-red-500/20 text-red-500"
                      }
                    >
                      {selectedCourse.level}
                    </Badge>
                    <Badge variant="outline">
                      {formatPrice(selectedCourse.price)}
                    </Badge>
                  </div>
                  
                  <div className="mt-4 text-slate-300">
                    <p>
                      {selectedCourse.description || "No description available."}
                    </p>
                  </div>
                  
                  <div className="mt-4 text-sm text-slate-400">
                    <p>Created by: {selectedCourse.teacherName}</p>
                    <p>
                      {selectedCourse.sections?.length || 0} sections with{" "}
                      {selectedCourse.sections?.reduce(
                        (acc, section) => acc + (section.chapters?.length || 0),
                        0
                      ) || 0}{" "}
                      chapters
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-2">
                <h3 className="text-lg font-semibold mb-2">Course Content</h3>
                <div className="bg-slate-900 rounded-md divide-y divide-slate-700">
                  {selectedCourse.sections?.length ? (
                    selectedCourse.sections.map((section, index) => (
                      <div key={section.sectionId} className="p-3">
                        <div className="font-medium">
                          {index + 1}. {section.sectionTitle}
                        </div>
                        <div className="text-sm text-slate-400 mt-1">
                          {section.chapters?.length || 0} chapters
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-slate-400">
                      No content available for this course.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => setViewDialogOpen(false)}
              className="border-slate-600"
            >
              Close
            </Button>
            {selectedCourse && (
              <Button
                onClick={() => {
                  setViewDialogOpen(false);
                  handleEditCourse(selectedCourse.courseId);
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Course
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-slate-800 border-slate-700 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              This will permanently delete this course and all its content. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-700 hover:bg-slate-600">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
};

export default AdminCoursesPage; 

