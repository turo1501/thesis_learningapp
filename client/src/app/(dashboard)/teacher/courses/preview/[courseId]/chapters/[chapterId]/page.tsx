"use client";

import { useRef, useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import ReactPlayer from "react-player";
import Loading from "@/components/Loading";
import { useTeacherCoursePreview } from "@/hooks/useTeacherCoursePreview";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Settings, 
  BookOpen, 
  Users, 
  Clock, 
  Target,
  CheckCircle,
  PlayCircle,
  FileText,
  Star,
  Award,
  TrendingUp,
  Eye,
  MessageSquare,
  Heart,
  Share2,
  Download,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Lightbulb,
  Trophy,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

const TeacherCoursePreview = () => {
  const {
    user,
    course,
    currentSection,
    currentChapter,
    isLoading,
    isTeacher,
    courseId
  } = useTeacherCoursePreview();
  
  const router = useRouter();
  const playerRef = useRef<ReactPlayer>(null);
  
  // UI State
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [playedTime, setPlayedTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showVideoControls, setShowVideoControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [totalChapters, setTotalChapters] = useState(0);
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };
  
  // Calculate progress and stats
  useEffect(() => {
    if (course?.sections) {
      let total = 0;
      let currentIndex = 0;
      let found = false;
      
      course.sections.forEach((section) => {
        section.chapters?.forEach((chapter) => {
          if (chapter.chapterId === currentChapter?.chapterId && !found) {
            currentIndex = total;
            found = true;
          }
          total++;
        });
      });
      
      setTotalChapters(total);
      setCurrentChapterIndex(currentIndex);
    }
  }, [course, currentChapter]);
  
  // Video event handlers
  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);
  const handleProgress = (state: any) => setPlayedTime(state.playedSeconds);
  const handleDuration = (duration: number) => setDuration(duration);
  
  // Format time helper
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Mock data for preview (since this is teacher preview)
  const mockStats = {
    totalStudents: 156,
    avgRating: 4.8,
    completionRate: 87,
    engagementScore: 92
  };
  
  // Debug logging
  if (process.env.NODE_ENV !== "production") {
    console.log("Teacher Preview component - course:", course);
    console.log("Teacher Preview component - currentSection:", currentSection);
    console.log("Teacher Preview component - currentChapter:", currentChapter);
  }

  if (isLoading) return <Loading />;
  if (!user) return <div>Please sign in to preview this course.</div>;
  if (!course) return <div>Error loading course data. The course may not exist or you don't have access.</div>;
  if (!isTeacher) return <div>You don't have permission to preview this course as you are not the course teacher.</div>;
  if (!currentSection || !currentChapter) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-customgreys-secondarybg rounded-xl p-8">
        <div className="text-6xl mb-4">📚</div>
        <h2 className="text-2xl font-bold text-white mb-3">Chapter Not Found</h2>
        <p className="text-customgreys-dirtyGrey mb-6 text-center max-w-md">
          This chapter doesn't exist or you don't have access to it.
        </p>
        <Button 
          onClick={() => router.push(`/teacher/courses/${courseId}`)}
          className="bg-primary-700 hover:bg-primary-600 px-6 py-3"
        >
          Return to Course Editor
        </Button>
      </div>
    );
  }

  return (
    <motion.div 
      className="h-full flex flex-col bg-customgreys-primarybg"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Top Navigation Bar */}
      <motion.div 
        className="flex items-center justify-between px-6 py-4 bg-customgreys-secondarybg border-b border-customgreys-darkGrey/50"
        variants={itemVariants}
      >
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10 ring-2 ring-primary-500/20">
              <AvatarImage alt={course.teacherName} />
              <AvatarFallback className="bg-primary-700 text-white font-semibold">
                {course.teacherName[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-xl font-bold text-white line-clamp-1">{course.title}</h1>
              <div className="flex items-center space-x-2 text-sm text-customgreys-dirtyGrey">
                <span>by {course.teacherName}</span>
                <span>•</span>
                <span>{currentChapterIndex + 1} of {totalChapters} lessons</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
            <Eye className="h-3 w-3 mr-1" />
            Preview Mode
          </Badge>
          
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="icon" className="text-customgreys-dirtyGrey hover:text-white">
              <Bookmark className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-customgreys-dirtyGrey hover:text-white">
              <Share2 className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-customgreys-dirtyGrey hover:text-white">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Content Area */}
        <motion.div 
          className="flex-1 flex flex-col p-6 space-y-6"
          variants={itemVariants}
        >
          {/* Chapter Header */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-sm text-customgreys-dirtyGrey">
              <span>{currentSection.sectionTitle}</span>
              <ChevronRight className="h-4 w-4" />
              <span className="text-white">{currentChapter.title}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-white">{currentChapter.title}</h2>
              <div className="flex items-center space-x-2">
                <Progress 
                  value={((currentChapterIndex + 1) / totalChapters) * 100} 
                  className="w-24 h-2 bg-customgreys-darkGrey"
                />
                <span className="text-sm text-customgreys-dirtyGrey">
                  {Math.round(((currentChapterIndex + 1) / totalChapters) * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* Video Player */}
          <motion.div 
            className="relative bg-customgreys-darkGrey rounded-xl overflow-hidden shadow-2xl group"
            variants={itemVariants}
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
          >
            <div className="aspect-video relative">
              {currentChapter?.video ? (
                <>
                  <ReactPlayer
                    ref={playerRef}
                    url={currentChapter.video as string}
                    controls={false}
                    playing={isPlaying}
                    muted={isMuted}
                    width="100%"
                    height="100%"
                    onPlay={handlePlay}
                    onPause={handlePause}
                    onProgress={handleProgress}
                    onDuration={handleDuration}
                    onError={(e) => {
                      console.error("Video playback error:", e);
                      toast.error("Error playing video. The file may be missing or in an unsupported format.");
                    }}
                    onReady={() => {
                      console.log("Video ready for playback");
                      toast.success("Video loaded successfully");
                    }}
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
                  
                  {/* Custom Video Controls */}
                  <AnimatePresence>
                    {(showVideoControls || !isPlaying) && (
                      <motion.div 
                        className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {/* Center Play Button */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <motion.button
                            className="bg-primary-600 hover:bg-primary-700 rounded-full p-4 shadow-lg"
                            onClick={() => setIsPlaying(!isPlaying)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {isPlaying ? (
                              <Pause className="h-8 w-8 text-white" />
                            ) : (
                              <Play className="h-8 w-8 text-white ml-1" />
                            )}
                          </motion.button>
                        </div>
                        
                        {/* Bottom Controls */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
                          <div className="flex items-center space-x-2">
                            <Progress 
                              value={(playedTime / duration) * 100} 
                              className="flex-1 h-1 bg-white/20"
                            />
                            <span className="text-xs text-white">
                              {formatTime(playedTime)} / {formatTime(duration)}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-white hover:bg-white/20 h-8 w-8"
                                onClick={() => setIsPlaying(!isPlaying)}
                              >
                                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-white hover:bg-white/20 h-8 w-8"
                                onClick={() => setIsMuted(!isMuted)}
                              >
                                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                              </Button>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-white hover:bg-white/20 h-8 w-8"
                              >
                                <Settings className="h-4 w-4" />
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-white hover:bg-white/20 h-8 w-8"
                                onClick={() => setIsFullscreen(!isFullscreen)}
                              >
                                <Maximize className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full bg-customgreys-secondarybg">
                  <div className="text-6xl mb-4">📄</div>
                  <h3 className="text-xl font-semibold text-white mb-2">No Video Available</h3>
                  <p className="text-customgreys-dirtyGrey text-center">
                    This chapter contains text content only
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Content Tabs */}
          <motion.div variants={itemVariants}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="bg-customgreys-darkGrey p-1 rounded-xl">
                <TabsTrigger 
                  value="overview"
                  className="data-[state=active]:bg-primary-600 data-[state=active]:text-white rounded-lg px-4"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger 
                  value="content"
                  className="data-[state=active]:bg-primary-600 data-[state=active]:text-white rounded-lg px-4"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Content
                </TabsTrigger>
                <TabsTrigger 
                  value="resources"
                  className="data-[state=active]:bg-primary-600 data-[state=active]:text-white rounded-lg px-4"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Resources
                </TabsTrigger>
                <TabsTrigger 
                  value="discussion"
                  className="data-[state=active]:bg-primary-600 data-[state=active]:text-white rounded-lg px-4"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Discussion
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-customgreys-secondarybg border-customgreys-darkGrey/50">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <Target className="h-5 w-5 mr-2 text-primary-500" />
                        Learning Objectives
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <p className="text-customgreys-dirtyGrey">
                          Understand the core concepts and principles
                        </p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <p className="text-customgreys-dirtyGrey">
                          Apply knowledge in practical scenarios
                        </p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <p className="text-customgreys-dirtyGrey">
                          Master advanced techniques and strategies
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-customgreys-secondarybg border-customgreys-darkGrey/50">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
                        Key Takeaways
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                        <p className="text-yellow-400 text-sm font-medium">💡 Pro Tip</p>
                        <p className="text-customgreys-dirtyGrey text-sm mt-1">
                          Take notes while watching to reinforce learning
                        </p>
                      </div>
                      <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                        <p className="text-blue-400 text-sm font-medium">🎯 Focus Point</p>
                        <p className="text-customgreys-dirtyGrey text-sm mt-1">
                          Pay special attention to the practical examples
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="content" className="space-y-4">
                <Card className="bg-customgreys-secondarybg border-customgreys-darkGrey/50">
                  <CardHeader>
                    <CardTitle className="text-white">Chapter Content</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-invert max-w-none">
                      <p className="text-customgreys-dirtyGrey leading-relaxed">
                        {currentChapter?.content}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="resources" className="space-y-4">
                <Card className="bg-customgreys-secondarybg border-customgreys-darkGrey/50">
                  <CardHeader>
                    <CardTitle className="text-white">Additional Resources</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Download className="h-12 w-12 text-customgreys-dirtyGrey mx-auto mb-4" />
                      <p className="text-customgreys-dirtyGrey">No resources available for this chapter.</p>
                      <p className="text-sm text-customgreys-dirtyGrey mt-2">
                        Resources like PDFs, worksheets, and additional materials will appear here.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="discussion" className="space-y-4">
                <Card className="bg-customgreys-secondarybg border-customgreys-darkGrey/50">
                  <CardHeader>
                    <CardTitle className="text-white">Chapter Discussion</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 text-customgreys-dirtyGrey mx-auto mb-4" />
                      <p className="text-customgreys-dirtyGrey">No discussions yet.</p>
                      <p className="text-sm text-customgreys-dirtyGrey mt-2">
                        Student questions and discussions about this chapter will appear here.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </motion.div>

        {/* Right Sidebar - Course Stats & Progress */}
        <motion.div 
          className="w-80 bg-customgreys-secondarybg border-l border-customgreys-darkGrey/50 p-6 space-y-6 overflow-y-auto"
          variants={itemVariants}
        >
          {/* Course Stats */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Course Analytics</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-customgreys-darkGrey/50 rounded-lg p-4 text-center">
                <Users className="h-6 w-6 text-primary-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{mockStats.totalStudents}</div>
                <div className="text-xs text-customgreys-dirtyGrey">Students</div>
              </div>
              
              <div className="bg-customgreys-darkGrey/50 rounded-lg p-4 text-center">
                <Star className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{mockStats.avgRating}</div>
                <div className="text-xs text-customgreys-dirtyGrey">Avg Rating</div>
              </div>
              
              <div className="bg-customgreys-darkGrey/50 rounded-lg p-4 text-center">
                <Trophy className="h-6 w-6 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{mockStats.completionRate}%</div>
                <div className="text-xs text-customgreys-dirtyGrey">Completion</div>
              </div>
              
              <div className="bg-customgreys-darkGrey/50 rounded-lg p-4 text-center">
                <Zap className="h-6 w-6 text-orange-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{mockStats.engagementScore}%</div>
                <div className="text-xs text-customgreys-dirtyGrey">Engagement</div>
              </div>
            </div>
          </div>

          {/* Course Progress */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Course Progress</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-customgreys-dirtyGrey">Overall Progress</span>
                <span className="text-white">{Math.round(((currentChapterIndex + 1) / totalChapters) * 100)}%</span>
              </div>
              <Progress 
                value={((currentChapterIndex + 1) / totalChapters) * 100} 
                className="h-2 bg-customgreys-darkGrey"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-customgreys-dirtyGrey">Current Chapter</span>
                <span className="text-white">{currentChapterIndex + 1} of {totalChapters}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-customgreys-dirtyGrey">Time Spent</span>
                <span className="text-white">{formatTime(playedTime)}</span>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">What's Next?</h3>
            
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start bg-transparent border-customgreys-darkGrey text-customgreys-dirtyGrey hover:bg-customgreys-darkGrey/50 hover:text-white"
              >
                <PlayCircle className="h-4 w-4 mr-2" />
                Next Chapter
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start bg-transparent border-customgreys-darkGrey text-customgreys-dirtyGrey hover:bg-customgreys-darkGrey/50 hover:text-white"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Course Overview
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start bg-transparent border-customgreys-darkGrey text-customgreys-dirtyGrey hover:bg-customgreys-darkGrey/50 hover:text-white"
              >
                <Award className="h-4 w-4 mr-2" />
                View Certificate
              </Button>
            </div>
          </div>

          {/* Course Info Card */}
          <Card className="bg-gradient-to-br from-primary-900/20 to-primary-800/20 border-primary-500/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-primary-500/20 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-primary-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-white text-sm">Student Preview</h4>
                  <p className="text-xs text-primary-300">This is how students see your content</p>
                </div>
              </div>
              <p className="text-xs text-customgreys-dirtyGrey">
                Use preview mode to experience your course from a student's perspective and optimize the learning experience.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default TeacherCoursePreview; 