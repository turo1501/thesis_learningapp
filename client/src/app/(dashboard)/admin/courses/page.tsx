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
import Loading from "@/components/Loading";

// Thêm interface để phù hợp với API response format
interface CourseDataResponse {
  data?: Course[];
  success?: boolean;
  [key: string]: any;
}

/**
 * AdminCoursesPage component
 * 
 * Quản lý hiển thị và quản lý danh sách khóa học cho admin
 */
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
  const { data: coursesData = [], isLoading, isError } = useGetCoursesQuery({ category: "" });
  const [deleteCourse] = useDeleteCourseMutation();

  // Debug data structure
  React.useEffect(() => {
    if (coursesData) {
      console.log("Courses data from API:", coursesData);
    }
  }, [coursesData]);

  // Ensure courses array is properly extracted from API response
  const courses = React.useMemo(() => {
    if (coursesData && Array.isArray(coursesData)) {
      return coursesData as Course[];
    } else if (coursesData && typeof coursesData === 'object' && 'data' in coursesData) {
      return (coursesData as CourseDataResponse).data || [];
    } else {
      return [] as Course[];
    }
  }, [coursesData]);

  // Filter courses based on search query, category and status
  const filteredCourses = React.useMemo(() => {
    return courses.filter((course) => {
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
  }, [courses, searchQuery, categoryFilter, statusFilter]);

  // Pagination logic
  const coursesPerPage = 10;
  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);
  const paginatedCourses = React.useMemo(() => {
    return filteredCourses.slice(
      (currentPage - 1) * coursesPerPage,
      currentPage * coursesPerPage
    );
  }, [filteredCourses, currentPage, coursesPerPage]);

  // Get unique categories for filter dropdown
  const categories = React.useMemo(() => {
    return [...new Set(courses.map((course) => course.category))];
  }, [courses]);

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

  // Render different UI based on loading/error states
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="admin-courses">
          <Header
            title="Course Management"
            subtitle="View, edit and manage all platform courses"
          />
          <div className="mt-6">
            <Loading />
          </div>
        </div>
      );
    }

    if (isError) {
      return (
        <div className="admin-courses">
          <Header
            title="Course Management"
            subtitle="View, edit and manage all platform courses"
          />
          <Card className="p-8 text-center text-red-400 bg-red-900/20 border border-red-900/50 mt-6">
            <AlertCircle className="h-10 w-10 mx-auto mb-4 text-red-400" />
            <h3 className="text-xl font-semibold mb-2">Error Loading Courses</h3>
            <p>There was an error loading course data. Please try again later or contact support.</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4 bg-red-600 hover:bg-red-700"
            >
              Retry
            </Button>
          </Card>
        </div>
      );
    }

    return (
      <div className="admin-courses pb-8">
        <Header
          title="Course Management"
          subtitle="View, edit and manage all platform courses"
          rightElement={
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Download className="mr-2 h-4 w-4" />
              Export Courses
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
            {paginatedCourses.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700 hover:bg-transparent">
                    <TableHead className="text-slate-400 font-medium">Course</TableHead>
                    <TableHead className="text-slate-400 font-medium">Teacher</TableHead>
                    <TableHead className="text-slate-400 font-medium">Category</TableHead>
                    <TableHead className="text-slate-400 font-medium">Price</TableHead>
                    <TableHead className="text-slate-400 font-medium">Status</TableHead>
                    <TableHead className="text-slate-400 font-medium">Enrollments</TableHead>
                    <TableHead className="text-slate-400 font-medium w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedCourses.map((course) => (
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
                      <TableCell>{formatPrice(course.price)}</TableCell>
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
                      <TableCell>
                        <Badge
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
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center p-8 bg-slate-800 rounded-md border border-slate-700">
                <BookOpen className="h-10 w-10 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No courses found</h3>
                <p className="text-slate-400 mb-4">
                  {courses.length === 0 ? 
                    "No courses have been created yet." : 
                    "No courses match your search criteria. Try adjusting your filters."}
                </p>
                <Button 
                  onClick={() => {
                    setSearchQuery("");
                    setCategoryFilter("all");
                    setStatusFilter("all");
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Clear Filters
                </Button>
              </div>
            )}
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

  return renderContent();
};

export default AdminCoursesPage; 