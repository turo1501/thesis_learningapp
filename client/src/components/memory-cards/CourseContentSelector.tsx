import React, { useState, useEffect } from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { useCourseContent } from '@/hooks/useCourseContent';
import { useGetUserEnrolledCoursesQuery } from '@/state/api';
import { Skeleton } from '../ui/skeleton';
import { useCurrentUser } from '@/hooks/useCurrentUser';

interface CourseContentSelectorProps {
  form: any;
}

export const CourseContentSelector: React.FC<CourseContentSelectorProps> = ({ form }) => {
  const { userId } = useCurrentUser();
  const [courseId, setCourseId] = useState<string | null>(null);
  const [sectionId, setSectionId] = useState<string | null>(null);
  
  // Fetch user's enrolled courses
  const { 
    data: enrolledCourses, 
    isLoading: isLoadingCourses 
  } = useGetUserEnrolledCoursesQuery(userId || '', { skip: !userId });
  
  // Fetch content structure for the selected course
  const { 
    sections, 
    isLoading: isLoadingSections,
  } = useCourseContent({ 
    courseId, 
    userId 
  });
  
  // Handle course selection change
  const handleCourseChange = (value: string) => {
    setCourseId(value);
    setSectionId(null);
    form.setValue('courseId', value);
    form.setValue('sectionId', '');
    form.setValue('chapterId', '');
  };

  // Handle section selection change
  const handleSectionChange = (value: string) => {
    setSectionId(value);
    form.setValue('sectionId', value);
    form.setValue('chapterId', '');
  };

  // Get chapters for the selected section
  const chapters = sections.find(s => s.sectionId === sectionId)?.chapters || [];

  return (
    <Card className="memory-card-selector">
      <CardContent className="pt-6">
        {/* Course Selection */}
        <FormField
          control={form.control}
          name="courseId"
          render={({ field }) => (
            <FormItem className="mb-4">
              <FormLabel>Course</FormLabel>
              <FormControl>
                <Select
                  disabled={isLoadingCourses}
                  onValueChange={(value) => {
                    field.onChange(value);
                    handleCourseChange(value);
                  }}
                  value={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingCourses ? (
                      <Skeleton className="w-full h-8" />
                    ) : (
                      enrolledCourses?.map((course) => (
                        <SelectItem key={course.courseId} value={course.courseId}>
                          {course.title}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Section Selection - Only enabled if a course is selected */}
        <FormField
          control={form.control}
          name="sectionId"
          render={({ field }) => (
            <FormItem className="mb-4">
              <FormLabel>Section</FormLabel>
              <FormControl>
                <Select
                  disabled={!courseId || isLoadingSections}
                  onValueChange={(value) => {
                    field.onChange(value);
                    handleSectionChange(value);
                  }}
                  value={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a section" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingSections ? (
                      <Skeleton className="w-full h-8" />
                    ) : (
                      sections.map((section) => (
                        <SelectItem key={section.sectionId} value={section.sectionId}>
                          {section.title}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Chapter Selection - Only enabled if a section is selected */}
        <FormField
          control={form.control}
          name="chapterId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Chapter</FormLabel>
              <FormControl>
                <Select
                  disabled={!sectionId || isLoadingSections}
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a chapter" />
                  </SelectTrigger>
                  <SelectContent>
                    {chapters.map((chapter) => (
                      <SelectItem key={chapter.chapterId} value={chapter.chapterId}>
                        {chapter.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}; 
 
 
 
 
 