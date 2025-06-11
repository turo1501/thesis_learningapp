"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTeacherCoursePreview } from "@/hooks/useTeacherCoursePreview";
import { Check, ChevronDown, ChevronUp, FileText, Lock, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import Loading from "@/components/Loading";

interface ChaptersSidebarProps {
  isOpen: boolean;
}

const ChaptersSidebar = ({ isOpen }: ChaptersSidebarProps) => {
  const { courseId, chapterId } = useParams();
  const { course, isLoading, isTeacher } = useTeacherCoursePreview();
  
  // For tracking expanded sections
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  
  // Debug logs
  if (process.env.NODE_ENV !== "production") {
    console.log("ChaptersSidebar - course:", course);
  }
  
  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => 
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };
  
  if (isLoading) return <Loading />;
  if (!course) return null;
  if (!isTeacher) return <div className="p-4 text-red-500">You don't have permission to preview this course.</div>;
  
  return (
    <div className={cn(
      "chapters-sidebar h-full overflow-y-auto bg-customgreys-secondarybg border-r border-customgreys-darkGrey/50 transition-all duration-300 ease-in-out",
      isOpen ? "w-[280px] min-w-[280px]" : "w-0 min-w-0 opacity-0"
    )}>
      <div className="chapters-sidebar__header p-4 border-b border-customgreys-darkGrey/50">
        <h3 className="font-medium text-white truncate">
          {course.title}
        </h3>
        <div className="flex items-center mt-1 text-xs text-customgreys-dirtyGrey">
          <span className="mr-2">{course.sections?.length || 0} sections</span>
          •
          <span className="ml-2">{course.sections?.reduce((total, section) => total + (section.chapters?.length || 0), 0) || 0} lessons</span>
        </div>
      </div>
      
      <div className="chapters-sidebar__content">
        {course.sections?.map((section) => (
          <div key={section.sectionId} className="chapters-sidebar__section border-b border-customgreys-darkGrey/20">
            <div 
              className="chapters-sidebar__section-header p-3 flex justify-between items-center cursor-pointer hover:bg-customgreys-darkGrey/20 transition-all"
              onClick={() => toggleSection(section.sectionId)}
            >
              <h4 className="font-medium text-sm text-white">
                {section.sectionTitle}
              </h4>
              <div className="text-customgreys-dirtyGrey">
                {expandedSections.includes(section.sectionId) ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </div>
            </div>
            
            {expandedSections.includes(section.sectionId) && (
              <div className="chapters-sidebar__chapters">
                {section.chapters?.map((chapter) => {
                  const isActive = chapter.chapterId === chapterId;
                  
                  return (
                    <Link
                      key={chapter.chapterId}
                      href={`/teacher/courses/preview/${courseId}/chapters/${chapter.chapterId}`}
                      className={cn(
                        "chapters-sidebar__chapter p-3 pl-6 flex items-center gap-2 text-sm hover:bg-customgreys-darkGrey/20 transition-colors",
                        {
                          "bg-primary-600/10 text-primary-500 border-l-2 border-primary-500": isActive,
                          "text-white border-l-2 border-transparent": !isActive,
                        }
                      )}
                    >
                      {chapter.type === "Video" ? (
                        <PlayCircle size={16} className={isActive ? "text-primary-500" : "text-customgreys-dirtyGrey"} />
                      ) : (
                        <FileText size={16} className={isActive ? "text-primary-500" : "text-customgreys-dirtyGrey"} />
                      )}
                      <span className="truncate">{chapter.title}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="p-3 mt-4 mx-3 bg-blue-500/10 rounded-lg">
        <p className="text-xs text-blue-400 font-medium">Preview Mode</p>
        <p className="text-xs text-customgreys-dirtyGrey mt-1">
          This is how students will navigate through your course content.
        </p>
      </div>
    </div>
  );
};

export default ChaptersSidebar; 