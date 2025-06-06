"use client";

import { useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import ReactPlayer from "react-player";
import Loading from "@/components/Loading";
import { useCourseProgressData } from "@/hooks/useCourseProgressData";
import { toast } from "react-toastify";
import CommentSection from "@/components/CommentSection";
import NoteSection from "@/components/NoteSection";

const Course = () => {
  const {
    user,
    course,
    userProgress,
    currentSection,
    currentChapter,
    isLoading,
    isChapterCompleted,
    updateChapterProgress,
    hasMarkedComplete,
    setHasMarkedComplete,
  } = useCourseProgressData();
  
  // Add debug logging to help diagnose issues
  if (process.env.NODE_ENV !== "production") {
    console.log("Course component - course:", course);
    console.log("Course component - currentSection:", currentSection);
    console.log("Course component - currentChapter:", currentChapter);
  }

  const playerRef = useRef<ReactPlayer>(null);

  const handleProgress = ({ played }: { played: number }) => {
    if (
      played >= 0.8 &&
      !hasMarkedComplete &&
      currentChapter &&
      currentSection &&
      userProgress?.sections &&
      !isChapterCompleted()
    ) {
      setHasMarkedComplete(true);
      updateChapterProgress(
        currentSection.sectionId,
        currentChapter.chapterId,
        true
      );
    }
  };

  if (isLoading) return <Loading />;
  if (!user) return <div>Please sign in to view this course.</div>;
  if (!course) return <div>Error loading course data. The course may not exist or you don't have access.</div>;
  if (!userProgress) return <div>Error loading your progress data. Please try again.</div>;
  if (!currentSection || !currentChapter) {
    return (
      <div className="course__error">
        <h2>Chapter Not Found</h2>
        <p>This chapter doesn't exist or you don't have access to it.</p>
        <button 
          className="course__error-button"
          onClick={() => window.location.href = `/user/courses`}
        >
          Return to Courses
        </button>
      </div>
    );
  }

  return (
    <div className="course">
      <div className="course__container">
        <div className="course__breadcrumb">
          <div className="course__path">
            {course.title} / {currentSection?.sectionTitle} /{" "}
            <span className="course__current-chapter">
              {currentChapter?.title}
            </span>
          </div>
          <h2 className="course__title">{currentChapter?.title}</h2>
          <div className="course__header">
            <div className="course__instructor">
              <Avatar className="course__avatar">
                <AvatarImage alt={course.teacherName} />
                <AvatarFallback className="course__avatar-fallback">
                  {course.teacherName[0]}
                </AvatarFallback>
              </Avatar>
              <span className="course__instructor-name">
                {course.teacherName}
              </span>
            </div>
          </div>
        </div>

        <Card className="course__video">
          <CardContent className="course__video-container">
            {currentChapter?.video ? (
              <ReactPlayer
                ref={playerRef}
                url={currentChapter.video as string}
                controls
                width="100%"
                height="100%"
                onProgress={handleProgress}
                onError={(e) => {
                  console.error("Video playback error:", e);
                  toast.error("Error playing video. The file may be missing or in an unsupported format.");
                }}
                onReady={() => {
                  console.log("Video ready for playback");
                  toast.success("Video loaded successfully");
                }}
                fallback={
                  <div className="flex items-center justify-center h-full w-full">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-600"></div>
                  </div>
                }
                config={{
                  file: {
                    attributes: {
                      controlsList: "nodownload",
                      onError: (e: any) => {
                        console.error("HTML5 video error:", e);
                      }
                    },
                    forceVideo: true,
                  },
                }}
              />
            ) : (
              <div className="course__no-video flex flex-col items-center justify-center h-full">
                <div className="text-2xl mb-4">📄</div>
                <p className="text-lg font-medium mb-2">No video available for this chapter</p>
                <p className="text-sm text-gray-500">This chapter contains text content only.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="course__content">
          <Tabs defaultValue="Notes" className="course__tabs">
            <TabsList className="course__tabs-list">
              <TabsTrigger className="course__tab" value="Notes">
                Notes
              </TabsTrigger>
              <TabsTrigger className="course__tab" value="Resources">
                Resources
              </TabsTrigger>
              <TabsTrigger className="course__tab" value="Quiz">
                Quiz
              </TabsTrigger>
            </TabsList>

            <TabsContent className="course__tab-content" value="Notes">
              <Card className="course__tab-card">
                <CardHeader className="course__tab-header">
                  <CardTitle>Notes Content</CardTitle>
                </CardHeader>
                <CardContent className="course__tab-body">
                  {currentChapter?.content}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent className="course__tab-content" value="Resources">
              <Card className="course__tab-card">
                <CardHeader className="course__tab-header">
                  <CardTitle>Resources Content</CardTitle>
                </CardHeader>
                <CardContent className="course__tab-body">
                  {/* Add resources content here */}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent className="course__tab-content" value="Quiz">
              <Card className="course__tab-card">
                <CardHeader className="course__tab-header">
                  <CardTitle>Quiz Content</CardTitle>
                </CardHeader>
                <CardContent className="course__tab-body">
                  {/* Add quiz content here */}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* New tabs for Comments and Take Notes */}
          <Tabs defaultValue="Comments" className="course__tabs-extended mt-8">
            <TabsList className="course__tabs-list-extended">
              <TabsTrigger className="course__tab-extended" value="Comments">
                Comments
              </TabsTrigger>
              <TabsTrigger className="course__tab-extended" value="TakeNotes">
                Take Notes
              </TabsTrigger>
            </TabsList>

            <TabsContent className="course__tab-content-extended" value="Comments">
              <CommentSection 
                courseId={course.courseId} 
                sectionId={currentSection.sectionId} 
                chapterId={currentChapter.chapterId} 
              />
            </TabsContent>

            <TabsContent className="course__tab-content-extended" value="TakeNotes">
              <NoteSection 
                courseId={course.courseId} 
                sectionId={currentSection.sectionId} 
                chapterId={currentChapter.chapterId} 
              />
            </TabsContent>
          </Tabs>

          <Card className="course__instructor-card mt-8">
            <CardContent className="course__instructor-info">
              <div className="course__instructor-header">
                <Avatar className="course__instructor-avatar">
                  <AvatarImage alt={course.teacherName} />
                  <AvatarFallback className="course__instructor-avatar-fallback">
                    {course.teacherName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="course__instructor-details">
                  <h4 className="course__instructor-name">
                    {course.teacherName}
                  </h4>
                  <p className="course__instructor-title">Senior UX Designer</p>
                </div>
              </div>
              <div className="course__instructor-bio">
                <p>
                  A seasoned Senior UX Designer with over 15 years of experience
                  in creating intuitive and engaging digital experiences.
                  Expertise in leading UX design projects.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Course;