"use client";

import { CustomFormField } from "@/components/CustomFormField";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { courseSchema } from "@/lib/schemas";
import {
  centsToDollars,
  createCourseFormData,
  uploadAllVideos,
} from "@/lib/utils";
import { handleApiError, refreshAuthToken } from "@/lib/api-error-handlers";
import { openSectionModal, setSections } from "@/state";
import {
  useGetCourseQuery,
  useUpdateCourseMutation,
  useGetUploadVideoUrlMutation,
  useUploadVideoToLocalMutation,
} from "@/state/api";
import { useAppDispatch, useAppSelector } from "@/state/redux";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  ArrowLeft, 
  Plus, 
  BookOpen, 
  LayoutDashboard, 
  Layers, 
  Video, 
  BarChart3, 
  DollarSign,
  Settings,
  CheckCircle,
  AlertCircle,
  Save,
  Eye
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import DroppableComponent from "./Droppable";
import ChapterModal from "./ChapterModal";
import SectionModal from "./SectionModal";
import Loading from "@/components/Loading";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

// Define the CourseFormData interface
interface CourseFormData {
  courseTitle: string;
  courseDescription: string;
  courseCategory: string;
  coursePrice: string;
  courseStatus: boolean;
  courseLevel: string;
}

const CourseEditor = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [isInitialized, setIsInitialized] = useState(false);
  const [activeTab, setActiveTab] = useState("content");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { userId, getToken } = useAuth();
  
  // Ensure auth token is refreshed
  useEffect(() => {
    const refreshToken = async () => {
      if (getToken) {
        await refreshAuthToken(getToken);
      }
    };
    refreshToken();
  }, [getToken]);
  
  // Reset initialized state when component mounts or id changes
  // This ensures we always get fresh data
  useEffect(() => {
    setIsInitialized(false);
  }, [id]);
  
  // Redirect to courses page if ID is missing or invalid
  useEffect(() => {
    if (!id || id === "undefined") {
      router.push("/teacher/courses");
      return;
    }
  }, [id, router]);
  
  // Skip the query if ID is invalid
  const { data: course, isLoading, refetch, error: courseError } = useGetCourseQuery(id, {
    skip: !id || id === "undefined",
    // Add refetch on mount and focus to ensure data is always fresh
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true
  });
  const [updateCourse, { isLoading: isUpdating }] = useUpdateCourseMutation();
  const [getUploadVideoUrl] = useGetUploadVideoUrlMutation();
  const [uploadVideoToLocal] = useUploadVideoToLocalMutation();

  const dispatch = useAppDispatch();
  const { sections } = useAppSelector((state) => state.global.courseEditor);

  // Handle API errors
  useEffect(() => {
    if (courseError) {
      handleApiError(courseError, "Failed to load course data");
    }
  }, [courseError]);

  const methods = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      courseTitle: "",
      courseDescription: "",
      courseCategory: "",
      coursePrice: "0",
      courseStatus: false,
      courseLevel: "beginner",
    },
  });

  // Initialize form values with course data when available
  useEffect(() => {
    if (course && !isSubmitting) {
      console.log("Setting form values from course data:", course);
      
      // We need to properly handle the data structure
      // If the API returns nested data object, extract it
      const courseData = typeof course === 'object' && course !== null && 'data' in course 
        ? (course as any).data 
        : course;
      
      // Validate that the course belongs to the current user
      if (courseData.teacherId !== userId) {
        toast.error("You don't have permission to edit this course");
        router.push("/teacher/courses");
        return;
      }
      
      // Only reset form values if not initialized yet or if this is a fresh load
      if (!isInitialized) {
        methods.reset({
          courseTitle: courseData.title || "",
          courseDescription: courseData.description || "",
          courseCategory: courseData.category || "",
          coursePrice: centsToDollars(courseData.price) || "0",
          courseStatus: courseData.status === "Published",
          courseLevel: courseData.level || "beginner",
        });
        
        dispatch(setSections(courseData.sections || []));
        setIsInitialized(true);
      }
    }
  }, [course, methods, dispatch, userId, router, isInitialized, isSubmitting]);

  const onSubmit = async (data: CourseFormData) => {
    // Set submitting state to true
    setIsSubmitting(true);
    
    try {
      if (!id || id === "undefined") {
        toast.error("Invalid course ID");
        return;
      }

      // Refresh token before making API requests
      if (getToken) {
        await refreshAuthToken(getToken);
      }
      
      let updatedSections = [...sections];
      
      try {
        // First, attempt to process and upload all video files
        toast.info("Processing videos...");
        updatedSections = await uploadAllVideos(
          sections,
          id,
          getUploadVideoUrl,
          uploadVideoToLocal
        );
        
        // Update the sections in the Redux store
        dispatch(setSections(updatedSections));
      } catch (uploadError) {
        console.error("Video upload error:", uploadError);
        toast.warning("Some videos may not have uploaded properly. Continuing with course update.");
        // We continue with the course update even if video upload fails
      }
      
      // Create form data with the sections (with video URLs when available)
      const formData = createCourseFormData(data, updatedSections);
      
      try {
        // Update the course
        toast.info("Saving course...");
        const updatedCourse = await updateCourse({
          courseId: id,
          formData,
        }).unwrap();

        // Force refresh the course data
        await refetch();
        
        // Update UI elements with the latest data
        if (updatedCourse) {
          // Extract data from the response
          const courseData = 'data' in updatedCourse ? (updatedCourse as any).data : updatedCourse;
          
          // Update form fields with latest data if needed
          methods.reset({
            courseTitle: courseData.title || data.courseTitle,
            courseDescription: courseData.description || data.courseDescription,
            courseCategory: courseData.category || data.courseCategory,
            coursePrice: centsToDollars(courseData.price) || data.coursePrice,
            courseStatus: courseData.status === "Published",
            courseLevel: courseData.level || data.courseLevel
          }, { keepValues: true });
          
          // Update sections if returned from API
          if (courseData.sections && Array.isArray(courseData.sections)) {
            dispatch(setSections(courseData.sections));
          }
        }
        
        toast.success("Course updated successfully");
      } catch (updateError: any) {
        handleApiError(updateError, "Failed to update course");
      }
    } catch (error: any) {
      handleApiError(error, "An unexpected error occurred");
    } finally {
      // Always reset submitting state when done
      setIsSubmitting(false);
    }
  };

  const handlePreviewCourse = () => {
    // Navigate to the preview route with this course
    if (course) {
      const courseData = typeof course === 'object' && course !== null && 'data' in course 
        ? (course as any).data 
        : course;
        
      // If the course has sections and chapters, navigate to the first chapter
      if (courseData.sections && 
          courseData.sections.length > 0 && 
          courseData.sections[0].chapters && 
          courseData.sections[0].chapters.length > 0) {
        const firstChapter = courseData.sections[0].chapters[0];
        router.push(`/teacher/courses/preview/${id}/chapters/${firstChapter.chapterId}`);
      } else {
        // Otherwise just show a message that there are no chapters yet
        toast.info("This course has no chapters yet. Add some content first to preview.", {
          position: "bottom-right",
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loading />
      </div>
    );
  }

  if (courseError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="bg-red-50 dark:bg-red-900/20 p-8 rounded-xl text-center max-w-md">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-400 mb-6 text-lg">Error loading course data</p>
          <Button 
            onClick={() => refetch()}
            className="bg-primary-700 hover:bg-primary-600 text-white"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto pb-20">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-10 bg-customgreys-primarybg/80 backdrop-blur-lg border-b border-customgreys-darkGrey py-3 px-4 mb-6">
        <div className="flex items-center justify-between gap-4">
          <button
            className="flex items-center rounded-lg p-2 gap-2 cursor-pointer text-customgreys-dirtyGrey hover:text-white transition-colors group"
            onClick={() => router.push("/teacher/courses", { scroll: false })}
          >
            <ArrowLeft className="w-4 h-4 group-hover:transform group-hover:-translate-x-1 transition-transform" />
            <span>Back to Courses</span>
          </button>
          
          <div className="flex items-center space-x-3">
            <div className={`py-1 px-3 rounded-full text-sm font-medium flex items-center gap-1 ${
              methods.watch("courseStatus") 
                ? "bg-green-500/10 text-green-500 border border-green-500/20" 
                : "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
            }`}>
              {methods.watch("courseStatus") ? (
                <>
                  <CheckCircle className="h-3 w-3" />
                  <span>Published</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-3 w-3" />
                  <span>Draft</span>
                </>
              )}
            </div>
            
            <Button
              type="button"
              onClick={handlePreviewCourse}
              className="bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-2"
              disabled={isSubmitting || isUpdating}
            >
              <Eye className="h-4 w-4" />
              <span>Preview</span>
            </Button>
            
            <Button
              type="submit"
              form="course-form"
              className={`transition-all ${
                isSubmitting || isUpdating 
                  ? "bg-primary-800 cursor-wait" 
                  : "bg-gradient-to-r from-primary-700 to-primary-600 hover:from-primary-600 hover:to-primary-500"
              } text-white flex items-center gap-2`}
              disabled={isSubmitting || isUpdating}
            >
              {isSubmitting || isUpdating ? (
                <>
                  <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>{methods.watch("courseStatus") ? "Update Published Course" : "Save Draft"}</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Course Header */}
      <div className="relative overflow-hidden mb-8 bg-gradient-to-r from-customgreys-darkGrey/80 to-customgreys-secondarybg rounded-xl border border-customgreys-darkerGrey/50">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-700/10 via-transparent to-transparent"></div>
        <div className="px-6 py-8 relative z-10">
          <h1 className="text-2xl md:text-3xl font-bold mb-2 text-white">
            {methods.watch("courseTitle") || "New Course"}
          </h1>
          <p className="text-customgreys-dirtyGrey max-w-3xl">
            {methods.watch("courseDescription")?.slice(0, 150) || "Complete all required fields and organize your course content below"}
            {methods.watch("courseDescription")?.length > 150 ? "..." : ""}
          </p>
          
          <div className="flex flex-wrap gap-3 mt-4">
            <div className="bg-customgreys-darkGrey/50 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm text-primary-400 flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5" />
              <span>{sections.length} {sections.length === 1 ? 'Section' : 'Sections'}</span>
            </div>
            
            <div className="bg-customgreys-darkGrey/50 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm text-primary-400 flex items-center gap-1.5">
              <Video className="h-3.5 w-3.5" />
              <span>
                {sections.reduce((count: number, section: any) => count + section.chapters.length, 0)} {sections.reduce((count: number, section: any) => count + section.chapters.length, 0) === 1 ? 'Chapter' : 'Chapters'}
              </span>
            </div>
            
            {methods.watch("courseCategory") && (
              <div className="bg-customgreys-darkGrey/50 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm text-primary-400 flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5" />
                <span>{methods.watch("courseCategory")}</span>
              </div>
            )}
            
            <div className="bg-customgreys-darkGrey/50 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm text-primary-400 flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5" />
              <span>${methods.watch("coursePrice") || "0"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-customgreys-darkGrey/50 mb-8">
        <div className="flex overflow-x-auto hide-scrollbar">
          <button
            onClick={() => setActiveTab("content")}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
              activeTab === "content" 
                ? "border-primary-600 text-primary-500" 
                : "border-transparent text-customgreys-dirtyGrey hover:text-white"
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Course Content</span>
          </button>
          
          <button
            onClick={() => setActiveTab("details")}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
              activeTab === "details" 
                ? "border-primary-600 text-primary-500" 
                : "border-transparent text-customgreys-dirtyGrey hover:text-white"
            }`}
          >
            <Settings className="h-4 w-4" />
            <span>Course Details</span>
          </button>
        </div>
      </div>

      <Form {...methods}>
        <form id="course-form" onSubmit={methods.handleSubmit(onSubmit)}>
          {activeTab === "details" && (
            <div className="bg-customgreys-secondarybg/50 rounded-xl border border-customgreys-darkGrey/50 p-6 mb-8 backdrop-blur-sm">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Left Column */}
                <div>
                  <div className="mb-8">
                    <h3 className="text-white text-lg font-medium mb-4 flex items-center gap-2">
                      <LayoutDashboard className="h-5 w-5 text-primary-500" />
                      Basic Information
                    </h3>
                    <div className="space-y-5">
                      <CustomFormField
                        name="courseTitle"
                        label="Course Title"
                        type="text"
                        placeholder="Write a descriptive title"
                        className="bg-customgreys-darkGrey/80 rounded-lg"
                        labelClassName="text-white mb-1"
                        inputClassName="bg-customgreys-darkGrey rounded-md text-white"
                      />

                      <CustomFormField
                        name="courseDescription"
                        label="Course Description"
                        type="textarea"
                        placeholder="Describe what students will learn"
                        className="bg-customgreys-darkGrey/80 rounded-lg"
                        labelClassName="text-white mb-1"
                        inputClassName="bg-customgreys-darkGrey rounded-md text-white min-h-[120px]"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Right Column */}
                <div>
                  <div className="mb-8">
                    <h3 className="text-white text-lg font-medium mb-4 flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary-500" />
                      Course Details
                    </h3>
                    <div className="space-y-5">
                      <CustomFormField
                        name="courseCategory"
                        label="Course Category"
                        type="select"
                        placeholder="Select category here"
                        options={[
                          { value: "technology", label: "Technology" },
                          { value: "science", label: "Science" },
                          { value: "mathematics", label: "Mathematics" },
                          {
                            value: "Artificial Intelligence",
                            label: "Artificial Intelligence",
                          },
                        ]}
                        className="bg-customgreys-darkGrey/80 rounded-lg"
                        labelClassName="text-white mb-1"
                        inputClassName="bg-customgreys-darkGrey rounded-md text-white"
                      />
                      
                      <CustomFormField
                        name="courseLevel"
                        label="Course Level"
                        type="select"
                        placeholder="Select level"
                        options={[
                          { value: "beginner", label: "Beginner" },
                          { value: "intermediate", label: "Intermediate" },
                          { value: "advanced", label: "Advanced" },
                        ]}
                        className="bg-customgreys-darkGrey/80 rounded-lg"
                        labelClassName="text-white mb-1"
                        inputClassName="bg-customgreys-darkGrey rounded-md text-white"
                      />

                      <CustomFormField
                        name="coursePrice"
                        label="Course Price (USD)"
                        type="number"
                        placeholder="0"
                        className="bg-customgreys-darkGrey/80 rounded-lg"
                        labelClassName="text-white mb-1"
                        inputClassName="bg-customgreys-darkGrey rounded-md text-white"
                      />
                      
                      <div className="bg-customgreys-darkGrey/80 rounded-lg p-4">
                        <CustomFormField
                          name="courseStatus"
                          label="Publication Status"
                          type="switch"
                          className="flex items-center space-x-3"
                          labelClassName={`text-base font-medium ${
                            methods.watch("courseStatus")
                              ? "text-green-500"
                              : "text-yellow-500"
                          }`}
                          inputClassName="data-[state=checked]:bg-green-500"
                        />
                        <p className="text-sm text-customgreys-dirtyGrey mt-2 ml-10">
                          {methods.watch("courseStatus") 
                            ? "Your course is published and visible to students"
                            : "Your course is saved as a draft and only visible to you"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "content" && (
            <div className="bg-customgreys-secondarybg/50 rounded-xl border border-customgreys-darkGrey/50 overflow-hidden">
              <div className="flex justify-between items-center p-5 border-b border-customgreys-darkGrey/50 bg-customgreys-darkGrey/30">
                <h2 className="text-lg md:text-xl font-medium text-white flex items-center gap-2">
                  <Layers className="h-5 w-5 text-primary-500" />
                  Course Structure
                </h2>

                <Button
                  type="button"
                  onClick={() => dispatch(openSectionModal({ sectionIndex: null }))}
                  className="bg-primary-700 hover:bg-primary-600 text-white flex items-center gap-1.5 transition-all transform hover:scale-105"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Section</span>
                </Button>
              </div>

              <div className="p-5">
                {sections.length > 0 ? (
                  <DroppableComponent />
                ) : (
                  <div className="text-center bg-customgreys-darkGrey/20 border border-dashed border-customgreys-darkGrey/50 rounded-lg p-10">
                    <Layers className="h-16 w-16 mx-auto text-customgreys-dirtyGrey mb-4 opacity-70" />
                    <h3 className="text-lg font-medium text-white mb-2">No sections yet</h3>
                    <p className="text-customgreys-dirtyGrey mb-6 max-w-md mx-auto">
                      Organize your course by adding sections and chapters. Each section can contain multiple chapters with videos and materials.
                    </p>
                    <Button
                      type="button"
                      onClick={() => dispatch(openSectionModal({ sectionIndex: null }))}
                      className="bg-primary-700 hover:bg-primary-600 text-white"
                    >
                      <Plus className="mr-1 h-4 w-4" />
                      Add Your First Section
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </form>
      </Form>

      <ChapterModal />
      <SectionModal />
    </div>
  );
};

export default CourseEditor;