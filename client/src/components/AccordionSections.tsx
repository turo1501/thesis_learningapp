import React, { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FileText, PlayCircle, Eye, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import VideoPreviewMini from "./VideoPreviewMini";
import { motion } from "framer-motion";

// Type definitions to fix linter errors
interface Chapter {
  chapterId: string;
  title: string;
  type: "Video" | "Text" | "Quiz" | string;
  content?: string;
  video?: string | null;
}

interface CourseSection {
  sectionId: string;
  sectionTitle: string;
  sectionDescription?: string;
  chapters?: Chapter[];
}

interface AccordionSectionsProps {
  sections: CourseSection[];
  courseTitle?: string;
  showVideoPreview?: boolean; // New prop to enable video preview functionality
}

const AccordionSections = ({ 
  sections, 
  courseTitle = "",
  showVideoPreview = false 
}: AccordionSectionsProps) => {
  const [previewVideo, setPreviewVideo] = useState<{
    url: string;
    title: string;
    isOpen: boolean;
  }>({
    url: "",
    title: "",
    isOpen: false
  });

  if (!sections || !Array.isArray(sections) || sections.length === 0) {
    return <div className="text-sm text-muted-foreground">No course sections available</div>;
  }

  // Find the first video chapter across all sections
  const getFirstVideoChapter = () => {
    for (const section of sections) {
      if (section.chapters && section.chapters.length > 0) {
        for (const chapter of section.chapters) {
          if (chapter.type === "Video" && chapter.video) {
            return {
              ...chapter,
              sectionTitle: section.sectionTitle
            };
          }
        }
      }
    }
    return null;
  };

  const firstVideoChapter = getFirstVideoChapter();

  const handleVideoPreview = (videoUrl: string, chapterTitle: string) => {
    setPreviewVideo({
      url: videoUrl,
      title: chapterTitle,
      isOpen: true
    });
  };

  const closeVideoPreview = () => {
    setPreviewVideo(prev => ({ ...prev, isOpen: false }));
  };

  // Generate random duration for chapters (since we don't have real duration data)
  const generateDuration = () => {
    return Math.floor(Math.random() * 15) + 5; // 5-20 minutes
  };

  return (
    <>
      <Accordion type="multiple" className="w-full">
        {/* Preview Section - Show first video if available */}
        {showVideoPreview && firstVideoChapter && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-4 p-4 bg-gradient-to-r from-primary-600/10 to-primary-500/10 rounded-lg border border-primary-600/20"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-sm font-medium text-white flex items-center gap-2">
                  <PlayCircle className="w-4 h-4 text-primary-500" />
                  Course Preview
                </h4>
                <p className="text-xs text-customgreys-dirtyGrey">
                  Get a taste of what you'll learn
                </p>
              </div>
              <Badge variant="secondary" className="text-xs bg-primary-600/20 text-primary-400 border-primary-600/30">
                Free Preview
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-customgreys-secondarybg rounded-md">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-8 bg-customgreys-darkGrey rounded flex items-center justify-center">
                    <PlayCircle className="w-4 h-4 text-primary-500" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary-500 rounded-full flex items-center justify-center">
                    <Eye className="w-2 h-2 text-white" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {firstVideoChapter.title}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-customgreys-dirtyGrey">
                    <span>{firstVideoChapter.sectionTitle}</span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{generateDuration()} min</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                className="bg-primary-600/20 border-primary-600/30 text-primary-400 hover:bg-primary-600/30 hover:text-primary-300"
                onClick={() => handleVideoPreview(firstVideoChapter.video as string, firstVideoChapter.title)}
              >
                <PlayCircle className="w-3 h-3 mr-1" />
                Preview
              </Button>
            </div>
          </motion.div>
        )}

        {/* Course Sections */}
        {sections.map((section, sectionIndex) => (
          <AccordionItem
            key={section.sectionId}
            value={section.sectionTitle}
            className="accordion-section"
          >
            <AccordionTrigger className="accordion-section__trigger">
              <div className="flex items-center justify-between w-full mr-4">
                <h5 className="accordion-section__title text-left">{section.sectionTitle}</h5>
                <div className="flex items-center gap-2 text-xs text-customgreys-dirtyGrey">
                  <span>{section.chapters?.length || 0} lessons</span>
                  {sectionIndex === 0 && showVideoPreview && (
                    <Badge variant="secondary" className="text-xs bg-green-600/20 text-green-400 border-green-600/30">
                      Preview Available
                    </Badge>
                  )}
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="accordion-section__content">
              <ul className="space-y-2">
                {section.chapters && section.chapters.length > 0 ? (
                  section.chapters.map((chapter: Chapter, chapterIndex: number) => (
                    <motion.li
                      key={chapter.chapterId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: chapterIndex * 0.1 }}
                      className="accordion-section__chapter group"
                    >
                      <div className="flex items-center justify-between p-2 rounded hover:bg-customgreys-darkGrey/30 transition-colors">
                        <div className="flex items-center gap-3">
                          {chapter.type === "Video" ? (
                            <div className="relative">
                              <PlayCircle className="w-4 h-4 text-primary-500" />
                              {sectionIndex === 0 && chapterIndex === 0 && showVideoPreview && (
                                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />
                              )}
                            </div>
                          ) : (
                            <FileText className="w-4 h-4 text-customgreys-dirtyGrey" />
                          )}
                          
                          <div className="flex-1 min-w-0">
                            <span className="text-sm text-white group-hover:text-primary-400 transition-colors">
                              {chapter.title}
                            </span>
                            <div className="flex items-center gap-2 text-xs text-customgreys-dirtyGrey mt-0.5">
                              <span className="capitalize">{chapter.type.toLowerCase()}</span>
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{generateDuration()} min</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Preview button for video chapters */}
                        {chapter.type === "Video" && chapter.video && showVideoPreview && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-xs h-6 px-2 text-primary-400 hover:text-primary-300"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVideoPreview(chapter.video as string, chapter.title);
                            }}
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Preview
                          </Button>
                        )}

                        {/* Free indicator for first chapter */}
                        {sectionIndex === 0 && chapterIndex === 0 && showVideoPreview && (
                          <Badge variant="secondary" className="text-xs bg-green-600/20 text-green-400 border-green-600/30">
                            Free
                          </Badge>
                        )}
                      </div>
                    </motion.li>
                  ))
                ) : (
                  <li className="text-sm text-muted-foreground py-2">
                    No chapters in this section
                  </li>
                )}
              </ul>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {/* Video Preview Modal */}
      <VideoPreviewMini
        videoUrl={previewVideo.url}
        chapterTitle={previewVideo.title}
        isOpen={previewVideo.isOpen}
        onClose={closeVideoPreview}
        courseTitle={courseTitle}
      />
    </>
  );
};

export default AccordionSections;