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
import { useCourseProgressData } from "@/hooks/useCourseProgressData";
import { toast } from "react-toastify";
import CommentSection from "@/components/CommentSection";
import NoteSection from "@/components/NoteSection";
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
  Zap,
  StickyNote,
  HelpCircle,
  Sparkles,
  Flame,
  GraduationCap,
  Timer,
  Eye,
  RotateCcw
} from "lucide-react";
import { cn } from "@/lib/utils";

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
  
  const playerRef = useRef<ReactPlayer>(null);
  
  // UI State
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [playedTime, setPlayedTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showVideoControls, setShowVideoControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState("content");
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [totalChapters, setTotalChapters] = useState(0);
  const [watchProgress, setWatchProgress] = useState(0);
  const [streak, setStreak] = useState(7); // Mock streak data
  const [totalWatchTime, setTotalWatchTime] = useState(0);
  
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
  const handleProgressUpdate = (state: any) => {
    setPlayedTime(state.playedSeconds);
    setWatchProgress(state.played * 100);
    setTotalWatchTime(prev => prev + 0.1); // Mock time tracking
  };
  const handleDuration = (duration: number) => setDuration(duration);
  
  // Original progress handler with enhanced tracking
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
      
      // Show completion animation
      toast.success("🎉 Chapter completed! Great job!");
    }
  };
  
  // Format time helper
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Calculate course completion percentage
  const courseCompletionPercentage = () => {
    if (!userProgress?.sections || !course?.sections) return 0;
    
    let completedChapters = 0;
    let totalChapters = 0;
    
    course.sections.forEach(section => {
      const userSection = userProgress.sections.find(us => us.sectionId === section.sectionId);
      section.chapters?.forEach(chapter => {
        totalChapters++;
        if (userSection?.chapters.find(uc => uc.chapterId === chapter.chapterId && uc.completed)) {
          completedChapters++;
        }
      });
    });
    
    return totalChapters > 0 ? (completedChapters / totalChapters) * 100 : 0;
  };
  
  // Debug logging
  if (process.env.NODE_ENV !== "production") {
    console.log("Course component - course:", course);
    console.log("Course component - currentSection:", currentSection);
    console.log("Course component - currentChapter:", currentChapter);
  }

  if (isLoading) return <Loading />;
  if (!user) return <div>Please sign in to view this course.</div>;
  if (!course) return <div>Error loading course data. The course may not exist or you don't have access.</div>;
  if (!userProgress) return <div>Error loading your progress data. Please try again.</div>;
  if (!currentSection || !currentChapter) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-customgreys-secondarybg rounded-xl p-8">
        <div className="text-6xl mb-4">📚</div>
        <h2 className="text-2xl font-bold text-white mb-3">Chapter Not Found</h2>
        <p className="text-customgreys-dirtyGrey mb-6 text-center max-w-md">
          This chapter doesn't exist or you don't have access to it.
        </p>
        <Button 
          onClick={() => window.location.href = `/user/courses`}
          className="bg-primary-700 hover:bg-primary-600 px-6 py-3"
        >
          Return to Courses
        </Button>
      </div>
    );
  }

  const isCompleted = isChapterCompleted();

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
                {isCompleted && (
                  <>
                    <span>•</span>
                    <Badge variant="secondary" className="bg-green-500/10 text-green-400 border-green-500/20">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Completed
                    </Badge>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Learning Streak Badge */}
          <Badge variant="secondary" className="bg-orange-500/10 text-orange-400 border-orange-500/20">
            <Flame className="h-3 w-3 mr-1" />
            {streak} day streak
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
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <Progress 
                    value={watchProgress} 
                    className="w-24 h-2 bg-customgreys-darkGrey"
                  />
                  <span className="text-sm text-customgreys-dirtyGrey">
                    {Math.round(watchProgress)}%
                  </span>
                </div>
                {isCompleted && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="p-2 bg-green-500/20 rounded-full"
                  >
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </motion.div>
                )}
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
                    onProgress={(state) => {
                      handleProgressUpdate(state);
                      handleProgress(state);
                    }}
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
                              
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-white hover:bg-white/20 h-8 w-8"
                                onClick={() => {
                                  if (playerRef.current) {
                                    playerRef.current.seekTo(0);
                                    setPlayedTime(0);
                                  }
                                }}
                              >
                                <RotateCcw className="h-4 w-4" />
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
                  value="content"
                  className="data-[state=active]:bg-primary-600 data-[state=active]:text-white rounded-lg px-4"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Content
                </TabsTrigger>
                <TabsTrigger 
                  value="notes"
                  className="data-[state=active]:bg-primary-600 data-[state=active]:text-white rounded-lg px-4"
                >
                  <StickyNote className="h-4 w-4 mr-2" />
                  Notes
                </TabsTrigger>
                <TabsTrigger 
                  value="resources"
                  className="data-[state=active]:bg-primary-600 data-[state=active]:text-white rounded-lg px-4"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Resources
                </TabsTrigger>
                <TabsTrigger 
                  value="quiz"
                  className="data-[state=active]:bg-primary-600 data-[state=active]:text-white rounded-lg px-4"
                >
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Quiz
                </TabsTrigger>
                <TabsTrigger 
                  value="discussion"
                  className="data-[state=active]:bg-primary-600 data-[state=active]:text-white rounded-lg px-4"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Discussion
                </TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="space-y-4">
                <Card className="bg-customgreys-secondarybg border-customgreys-darkGrey/50">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-primary-500" />
                      Chapter Content
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-invert max-w-none">
                      <p className="text-customgreys-dirtyGrey leading-relaxed">
                        {currentChapter?.content}
                      </p>
                    </div>
                    
                    {/* Learning objectives */}
                    <div className="mt-6 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                      <h4 className="text-blue-400 font-medium mb-2 flex items-center">
                        <Target className="h-4 w-4 mr-2" />
                        Key Learning Points
                      </h4>
                      <ul className="text-customgreys-dirtyGrey text-sm space-y-1">
                        <li>• Understand the main concepts covered in this chapter</li>
                        <li>• Apply the knowledge to practical scenarios</li>
                        <li>• Connect this learning to previous chapters</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notes" className="space-y-4">
                <Card className="bg-customgreys-secondarybg border-customgreys-darkGrey/50">
                  <CardHeader>
                    <CardTitle className="text-white">Take Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <NoteSection 
                      courseId={course.courseId} 
                      sectionId={currentSection.sectionId} 
                      chapterId={currentChapter.chapterId} 
                    />
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

              <TabsContent value="quiz" className="space-y-4">
                <Card className="bg-customgreys-secondarybg border-customgreys-darkGrey/50">
                  <CardHeader>
                    <CardTitle className="text-white">Chapter Quiz</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <HelpCircle className="h-12 w-12 text-customgreys-dirtyGrey mx-auto mb-4" />
                      <p className="text-customgreys-dirtyGrey">No quiz available for this chapter.</p>
                      <p className="text-sm text-customgreys-dirtyGrey mt-2">
                        Complete the video to unlock quiz questions.
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
                    <CommentSection 
                      courseId={course.courseId} 
                      sectionId={currentSection.sectionId} 
                      chapterId={currentChapter.chapterId} 
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </motion.div>

        {/* Right Sidebar - Learning Progress & Info */}
        <motion.div 
          className="w-80 bg-customgreys-secondarybg border-l border-customgreys-darkGrey/50 p-6 space-y-6 overflow-y-auto"
          variants={itemVariants}
        >
          {/* Learning Progress */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Your Progress</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-customgreys-darkGrey/50 rounded-lg p-4 text-center">
                <GraduationCap className="h-6 w-6 text-primary-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{Math.round(courseCompletionPercentage())}%</div>
                <div className="text-xs text-customgreys-dirtyGrey">Complete</div>
              </div>
              
              <div className="bg-customgreys-darkGrey/50 rounded-lg p-4 text-center">
                <Timer className="h-6 w-6 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{formatTime(totalWatchTime * 60)}</div>
                <div className="text-xs text-customgreys-dirtyGrey">Watched</div>
              </div>
              
              <div className="bg-customgreys-darkGrey/50 rounded-lg p-4 text-center">
                <Flame className="h-6 w-6 text-orange-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{streak}</div>
                <div className="text-xs text-customgreys-dirtyGrey">Day Streak</div>
              </div>
              
              <div className="bg-customgreys-darkGrey/50 rounded-lg p-4 text-center">
                <Trophy className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{currentChapterIndex + 1}</div>
                <div className="text-xs text-customgreys-dirtyGrey">of {totalChapters}</div>
              </div>
            </div>
          </div>

          {/* Course Progress */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Course Progress</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-customgreys-dirtyGrey">Overall Progress</span>
                <span className="text-white">{Math.round(courseCompletionPercentage())}%</span>
              </div>
              <Progress 
                value={courseCompletionPercentage()} 
                className="h-2 bg-customgreys-darkGrey"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-customgreys-dirtyGrey">Current Chapter</span>
                <span className="text-white">{currentChapterIndex + 1} of {totalChapters}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-customgreys-dirtyGrey">Watch Progress</span>
                <span className="text-white">{Math.round(watchProgress)}%</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
            
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start bg-transparent border-customgreys-darkGrey text-customgreys-dirtyGrey hover:bg-customgreys-darkGrey/50 hover:text-white"
                onClick={() => setActiveTab("notes")}
              >
                <StickyNote className="h-4 w-4 mr-2" />
                Take Notes
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start bg-transparent border-customgreys-darkGrey text-customgreys-dirtyGrey hover:bg-customgreys-darkGrey/50 hover:text-white"
                onClick={() => setActiveTab("discussion")}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Ask Question
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start bg-transparent border-customgreys-darkGrey text-customgreys-dirtyGrey hover:bg-customgreys-darkGrey/50 hover:text-white"
              >
                <PlayCircle className="h-4 w-4 mr-2" />
                Next Chapter
              </Button>
            </div>
          </div>

          {/* Instructor Info */}
          <Card className="bg-gradient-to-br from-primary-900/20 to-primary-800/20 border-primary-500/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3 mb-3">
                <Avatar className="h-10 w-10 ring-2 ring-primary-500/20">
                  <AvatarImage alt={course.teacherName} />
                  <AvatarFallback className="bg-primary-700 text-white font-semibold">
                    {course.teacherName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold text-white text-sm">{course.teacherName}</h4>
                  <p className="text-xs text-primary-300">Course Instructor</p>
                </div>
              </div>
              <p className="text-xs text-customgreys-dirtyGrey">
                A seasoned expert with years of experience in the field. Ready to guide you through your learning journey.
              </p>
              <Button 
                variant="outline" 
                size="sm"
                className="w-full mt-3 bg-transparent border-primary-500/30 text-primary-400 hover:bg-primary-500/10"
              >
                <MessageSquare className="h-3 w-3 mr-2" />
                Message Instructor
              </Button>
            </CardContent>
          </Card>

          {/* Achievement Badge */}
          {isCompleted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="bg-gradient-to-br from-green-900/20 to-green-800/20 border-green-500/20">
                <CardContent className="p-4 text-center">
                  <div className="p-3 bg-green-500/20 rounded-full w-fit mx-auto mb-3">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                  <h4 className="font-semibold text-white text-sm mb-1">Chapter Completed!</h4>
                  <p className="text-xs text-green-300">
                    Great job! You've successfully completed this chapter.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Course;