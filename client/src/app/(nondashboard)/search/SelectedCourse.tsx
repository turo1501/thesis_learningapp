import AccordionSections from "@/components/AccordionSections";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { motion } from "framer-motion";
import { 
  Star, 
  Users, 
  Clock, 
  PlayCircle, 
  Award, 
  BookOpen,
  TrendingUp,
  Eye,
  Globe
} from "lucide-react";
import React from "react";

interface SelectedCourseProps {
  course: Course;
  handleEnrollNow: (courseId: string) => void;
}

const SelectedCourse = ({ course, handleEnrollNow }: SelectedCourseProps) => {
  // Calculate course stats
  const totalLessons = course.sections?.reduce((total, section) => 
    total + (section.chapters?.length || 0), 0
  ) || 0;

  const totalVideos = course.sections?.reduce((total, section) => 
    total + (section.chapters?.filter(chapter => chapter.type === "Video").length || 0), 0
  ) || 0;

  // Mock data for course engagement
  const mockStats = {
    rating: 4.8,
    totalStudents: course?.enrollments?.length || 0,
    totalHours: Math.floor(totalLessons * 0.5), // Estimate 30 min per lesson
    level: course.level || "beginner"
  };

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "beginner": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "intermediate": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "advanced": return "bg-red-500/20 text-red-400 border-red-500/30";
      default: return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    }
  };

  // Convert Section[] to CourseSection[] for AccordionSections component
  const convertSectionsForAccordion = (sections: Section[]) => {
    return sections.map(section => ({
      sectionId: section.sectionId,
      sectionTitle: section.sectionTitle,
      sectionDescription: section.sectionDescription,
      chapters: section.chapters?.map(chapter => ({
        chapterId: chapter.chapterId,
        title: chapter.title,
        type: chapter.type,
        content: chapter.content,
        video: typeof chapter.video === 'string' ? chapter.video : null
      }))
    }));
  };

  return (
    <motion.div 
      className="selected-course"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Course Header */}
      <Card className="bg-customgreys-secondarybg border-customgreys-darkGrey/50 mb-6">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="selected-course__title text-2xl font-bold text-white">
                  {course.title}
                </h3>
                <Badge 
                  variant="secondary" 
                  className={`text-xs ${getLevelColor(mockStats.level)} capitalize`}
                >
                  {mockStats.level}
                </Badge>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-customgreys-dirtyGrey mb-3">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>By {course.teacherName}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>{mockStats.rating}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{mockStats.totalStudents} students</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Globe className="w-4 h-4" />
                  <span className="capitalize">{course.category}</span>
                </div>
              </div>

              {/* Course Stats */}
              <div className="flex items-center gap-6 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <BookOpen className="w-4 h-4 text-primary-500" />
                  <span className="text-customgreys-dirtyGrey">{totalLessons} lessons</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <PlayCircle className="w-4 h-4 text-primary-500" />
                  <span className="text-customgreys-dirtyGrey">{totalVideos} videos</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-primary-500" />
                  <span className="text-customgreys-dirtyGrey">{mockStats.totalHours} hours</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Award className="w-4 h-4 text-primary-500" />
                  <span className="text-customgreys-dirtyGrey">Certificate included</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Course Content */}
      <div className="selected-course__content space-y-6">
        {/* Course Description */}
        <Card className="bg-customgreys-secondarybg border-customgreys-darkGrey/50">
          <CardContent className="p-6">
            <h4 className="text-lg font-semibold text-gray-300 mb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary-500" />
              About This Course
            </h4>
            <p className="selected-course__description text-customgreys-dirtyGrey leading-relaxed">
              {course.description || "This course will provide you with comprehensive knowledge and practical skills in the subject matter."}
            </p>
          </CardContent>
        </Card>

        {/* Course Content with Video Preview */}
        <Card className="bg-customgreys-secondarybg border-customgreys-darkGrey/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="selected-course__sections-title text-lg font-semibold text-white flex items-center gap-2">
                <PlayCircle className="w-5 h-5 text-primary-500" />
                Course Content
              </h4>
              
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs bg-primary-600/20 text-primary-400 border-primary-600/30">
                  <Eye className="w-3 h-3 mr-1" />
                  Preview Available
                </Badge>
                <Badge variant="secondary" className="text-xs bg-customgreys-darkGrey text-gray-300">
                  {course.sections?.length || 0} sections • {totalLessons} lessons
                </Badge>
              </div>
            </div>
            
            <div className="selected-course__sections text-gray-300">
              <AccordionSections 
                sections={convertSectionsForAccordion(course.sections || [])} 
                courseTitle={course.title}
                showVideoPreview={true}
              />
            </div>
          </CardContent>
        </Card>

        {/* Enrollment Section */}
        <Card className="bg-gradient-to-r from-primary-600/10 to-primary-500/10 border border-primary-600/20">
          <CardContent className="p-6">
            <div className="selected-course__footer flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="selected-course__price text-3xl font-bold text-white">
                    {formatPrice(course.price)}
                  </span>
                  {course.price && course.price > 0 && (
                    <span className="text-sm text-customgreys-dirtyGrey line-through">
                      {formatPrice(course.price * 1.5)}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-4 text-sm text-customgreys-dirtyGrey">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span>30-day money-back guarantee</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Award className="w-4 h-4 text-yellow-500" />
                    <span>Lifetime access</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <Button
                  onClick={() => handleEnrollNow(course.courseId)}
                  size="lg"
                  className="bg-primary-700 hover:bg-primary-600 text-white px-8 py-3 font-semibold shadow-lg"
                >
                  <PlayCircle className="w-5 h-5 mr-2" />
                  Enroll Now
                </Button>
                
                <p className="text-xs text-customgreys-dirtyGrey text-center">
                  Start learning immediately after enrollment
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-customgreys-secondarybg border-customgreys-darkGrey/50">
            <CardContent className="p-4 text-center">
              <Users className="w-8 h-8 text-primary-500 mx-auto mb-2" />
              <h5 className="font-semibold text-gray-300 mb-1">Students</h5>
              <p className="text-2xl font-bold text-primary-500">{mockStats.totalStudents}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-customgreys-secondarybg border-customgreys-darkGrey/50">
            <CardContent className="p-4 text-center">
              <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <h5 className="font-semibold text-gray-300 mb-1">Rating</h5>
              <p className="text-2xl font-bold text-yellow-500">{mockStats.rating}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-customgreys-secondarybg border-customgreys-darkGrey/50">
            <CardContent className="p-4 text-center">
              <Clock className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <h5 className="font-semibold text-gray-300 mb-1">Duration</h5>
              <p className="text-2xl font-bold text-green-500">{mockStats.totalHours}h</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};

export default SelectedCourse;