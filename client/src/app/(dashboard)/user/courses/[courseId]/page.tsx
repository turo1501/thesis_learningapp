"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useGetCourseQuery } from "@/state/api";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  BookOpen, 
  User, 
  Clock, 
  BarChart, 
  Video, 
  ArrowRight,
  Layout,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Loading from "@/components/Loading";
import { Progress } from "@/components/ui/progress";
import AccordionSections from "@/components/AccordionSections";
import CourseReviews from "@/components/course/CourseReviews";

const CourseDetailPage = () => {
  const { courseId } = useParams();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState("overview");
  
  const { data: courseResponse, isLoading } = useGetCourseQuery(courseId as string, {
    skip: !courseId || courseId === "undefined",
  });
  
  // Extract course data from API response
  const course = courseResponse && 'data' in courseResponse 
    ? courseResponse.data 
    : courseResponse;
  
  if (isLoading || !isLoaded) return <Loading />;
  if (!user) return <div>Please sign in to view this course.</div>;
  if (!course) return <div>Course not found.</div>;
  
  // Calculate progress percentage
  const progressPercentage = course.progress || 0;
  
  // Get total number of chapters
  const totalChapters = course.sections?.reduce(
    (total, section) => total + (section.chapters?.length || 0), 
    0
  ) || 0;
  
  const handleContinueLearning = () => {
    // Find the first incomplete chapter or start from beginning
    if (course.sections && course.sections.length > 0) {
      for (const section of course.sections) {
        if (section.chapters && section.chapters.length > 0) {
          // For simplicity, we'll just go to the first chapter
          // In a real app, you'd check the progress to find the last viewed chapter
          const firstChapter = section.chapters[0];
          router.push(`/user/courses/${courseId}/chapters/${firstChapter.chapterId}`);
          return;
        }
      }
    }
  };
  
  return (
    <div className="pb-20">
      {/* Course Header */}
      <div className="relative bg-gradient-to-r from-customgreys-darkGrey to-customgreys-secondarybg border-b border-customgreys-darkerGrey/50 mb-8">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <h1 className="text-3xl font-bold text-white mb-3">{course.title}</h1>
              
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage src={""} alt={course.teacherName} />
                    <AvatarFallback className="bg-primary-700 text-white">
                      {course.teacherName?.charAt(0) || "I"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-customgreys-dirtyGrey">
                    Instructor: {course.teacherName}
                  </span>
                </div>
                
                <Badge className="bg-primary-700/20 text-primary-400 hover:bg-primary-700/30">
                  {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                </Badge>
                
                <Badge className="bg-customgreys-darkGrey text-customgreys-dirtyGrey hover:bg-customgreys-darkGrey/70">
                  {course.category}
                </Badge>
              </div>
              
              <p className="text-customgreys-dirtyGrey mb-6 max-w-3xl">
                {course.description}
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Button 
                  onClick={handleContinueLearning}
                  className="bg-primary-600 hover:bg-primary-500"
                >
                  Continue Learning
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-video rounded-lg overflow-hidden border border-customgreys-darkerGrey/50 bg-customgreys-darkGrey/30">
                <Image
                  src={course.image || "/placeholder.png"}
                  alt={course.title}
                  fill
                  className="object-cover"
                />
              </div>
              
              <Card className="mt-4 bg-customgreys-secondarybg border-customgreys-darkerGrey/50">
                <CardContent className="p-4">
                  <div className="mb-3">
                    <div className="text-customgreys-dirtyGrey text-sm mb-1">Your Progress</div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-white font-medium">{Math.round(progressPercentage)}% Complete</div>
                      <div className="text-customgreys-dirtyGrey text-sm">
                        {Math.ceil((progressPercentage / 100) * totalChapters)} / {totalChapters} chapters
                      </div>
                    </div>
                    <Progress value={progressPercentage} className="h-2 bg-customgreys-darkGrey" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-3 bg-customgreys-darkGrey/30 rounded-lg">
                      <Clock className="h-5 w-5 mx-auto mb-1 text-customgreys-dirtyGrey" />
                      <div className="text-white font-medium">4 hours</div>
                      <div className="text-customgreys-dirtyGrey text-xs">Total duration</div>
                    </div>
                    
                    <div className="p-3 bg-customgreys-darkGrey/30 rounded-lg">
                      <Video className="h-5 w-5 mx-auto mb-1 text-customgreys-dirtyGrey" />
                      <div className="text-white font-medium">{totalChapters}</div>
                      <div className="text-customgreys-dirtyGrey text-xs">Total chapters</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="bg-customgreys-darkGrey/30 p-1 rounded-lg">
            <TabsTrigger 
              className="data-[state=active]:bg-customgreys-darkGrey data-[state=active]:text-white rounded-md" 
              value="overview"
            >
              <Layout className="mr-2 h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger 
              className="data-[state=active]:bg-customgreys-darkGrey data-[state=active]:text-white rounded-md" 
              value="content"
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Content
            </TabsTrigger>
            <TabsTrigger 
              className="data-[state=active]:bg-customgreys-darkGrey data-[state=active]:text-white rounded-md" 
              value="reviews"
            >
              <Star className="mr-2 h-4 w-4" />
              Reviews
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <Card className="bg-customgreys-secondarybg border-customgreys-darkerGrey/50">
              <CardHeader>
                <CardTitle className="text-white">Course Overview</CardTitle>
              </CardHeader>
              <CardContent className="text-customgreys-dirtyGrey">
                <p className="mb-6">{course.description}</p>
                
                <h3 className="text-white text-lg font-medium mb-3">What You'll Learn</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                  <li className="flex items-start">
                    <div className="text-primary-500 mr-2 mt-0.5">•</div>
                    <span>Master the fundamentals of {course.category}</span>
                  </li>
                  <li className="flex items-start">
                    <div className="text-primary-500 mr-2 mt-0.5">•</div>
                    <span>Apply practical knowledge through hands-on exercises</span>
                  </li>
                  <li className="flex items-start">
                    <div className="text-primary-500 mr-2 mt-0.5">•</div>
                    <span>Build real-world projects for your portfolio</span>
                  </li>
                  <li className="flex items-start">
                    <div className="text-primary-500 mr-2 mt-0.5">•</div>
                    <span>Gain confidence in solving complex problems</span>
                  </li>
                </ul>
                
                <h3 className="text-white text-lg font-medium mb-3">Requirements</h3>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start">
                    <div className="text-primary-500 mr-2 mt-0.5">•</div>
                    <span>Basic understanding of {course.category.toLowerCase()}</span>
                  </li>
                  <li className="flex items-start">
                    <div className="text-primary-500 mr-2 mt-0.5">•</div>
                    <span>No advanced knowledge required - perfect for {course.level} level</span>
                  </li>
                </ul>
                
                <h3 className="text-white text-lg font-medium mb-3">About the Instructor</h3>
                <div className="flex items-start space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={""} alt={course.teacherName} />
                    <AvatarFallback className="bg-primary-700 text-white text-lg">
                      {course.teacherName?.charAt(0) || "I"}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <h4 className="text-white font-medium">{course.teacherName}</h4>
                    <p className="text-customgreys-dirtyGrey text-sm mb-2">
                      Expert in {course.category}
                    </p>
                    <p className="text-customgreys-dirtyGrey">
                      Experienced instructor with a passion for teaching. Dedicated to helping students 
                      master {course.category} through practical, engaging content.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="content" className="space-y-6">
            <Card className="bg-customgreys-secondarybg border-customgreys-darkerGrey/50">
              <CardHeader>
                <CardTitle className="text-white">Course Content</CardTitle>
              </CardHeader>
              <CardContent>
                {course.sections && course.sections.length > 0 ? (
                  <AccordionSections sections={course.sections} />
                ) : (
                  <div className="text-center py-8 text-customgreys-dirtyGrey">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No content available for this course.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="reviews" className="space-y-6">
            <Card className="bg-customgreys-secondarybg border-customgreys-darkerGrey/50">
              <CardHeader>
                <CardTitle className="text-white">Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <CourseReviews courseId={courseId as string} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CourseDetailPage; 