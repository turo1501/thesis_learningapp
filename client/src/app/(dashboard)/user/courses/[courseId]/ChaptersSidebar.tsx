import { useState, useEffect, useRef } from "react";
import {
  ChevronDown,
  ChevronUp,
  FileText,
  CheckCircle,
  Trophy,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";
import Loading from "@/components/Loading";
import { useCourseProgressData } from "@/hooks/useCourseProgressData";

const ChaptersSidebar = () => {
  const router = useRouter();
  const { setOpen } = useSidebar();
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const {
    user,
    course,
    userProgress,
    chapterId,
    courseId,
    isLoading,
    updateChapterProgress,
  } = useCourseProgressData();

  // Debug logging
  if (process.env.NODE_ENV !== "production") {
    console.log("ChaptersSidebar - course:", course);
    console.log("ChaptersSidebar - userProgress:", userProgress);
  }

  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOpen(false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading) return <Loading />;
  if (!user) return <div>Please sign in to view course progress.</div>;
  if (!course) return <div>Error loading course content</div>;
  if (!userProgress) return <div>Error loading progress data</div>;
  if (!course.sections || !Array.isArray(course.sections)) {
    return <div>No course sections available</div>;
  }

  const toggleSection = (sectionTitle: string) => {
    setExpandedSections((prevSections) =>
      prevSections.includes(sectionTitle)
        ? prevSections.filter((title) => title !== sectionTitle)
        : [...prevSections, sectionTitle]
    );
  };

  const handleChapterClick = (sectionId: string, chapterId: string) => {
    router.push(`/user/courses/${courseId}/chapters/${chapterId}`, {
      scroll: false,
    });
  };

  return (
    <div ref={sidebarRef} className="chapters-sidebar">
      <div className="chapters-sidebar__header">
        <h2 className="chapters-sidebar__title">{course.title || "Course"}</h2>
        <hr className="chapters-sidebar__divider" />
      </div>
      {course.sections.map((section, index) => (
        <Section
          key={section.sectionId || `section-${index}`}
          section={section}
          index={index}
          sectionProgress={userProgress.sections?.find(
            (s) => s.sectionId === section.sectionId
          )}
          chapterId={chapterId as string}
          courseId={courseId as string}
          expandedSections={expandedSections}
          toggleSection={toggleSection}
          handleChapterClick={handleChapterClick}
          updateChapterProgress={updateChapterProgress}
        />
      ))}
    </div>
  );
};

const Section = ({
  section,
  index,
  sectionProgress,
  chapterId,
  courseId,
  expandedSections,
  toggleSection,
  handleChapterClick,
  updateChapterProgress,
}: {
  section: any;
  index: number;
  sectionProgress: any;
  chapterId: string;
  courseId: string;
  expandedSections: string[];
  toggleSection: (sectionTitle: string) => void;
  handleChapterClick: (sectionId: string, chapterId: string) => void;
  updateChapterProgress: (
    sectionId: string,
    chapterId: string,
    completed: boolean
  ) => void;
}) => {
  // Handle potentially missing section data
  if (!section) return null;
  
  // Safety checks for missing data
  const sectionTitle = section.sectionTitle || `Section ${index + 1}`;
  const chapters = section.chapters || [];
  
  const completedChapters =
    sectionProgress?.chapters?.filter((c: any) => c.completed)?.length || 0;
  const totalChapters = chapters.length;
  const isExpanded = expandedSections.includes(sectionTitle);

  return (
    <div className="chapters-sidebar__section">
      <div
        onClick={() => toggleSection(sectionTitle)}
        className="chapters-sidebar__section-header"
      >
        <div className="chapters-sidebar__section-title-wrapper">
          <p className="chapters-sidebar__section-number">
            Section 0{index + 1}
          </p>
          {isExpanded ? (
            <ChevronUp className="chapters-sidebar__chevron" />
          ) : (
            <ChevronDown className="chapters-sidebar__chevron" />
          )}
        </div>
        <h3 className="chapters-sidebar__section-title">
          {sectionTitle}
        </h3>
      </div>
      <hr className="chapters-sidebar__divider" />

      {isExpanded && chapters.length > 0 && (
        <div className="chapters-sidebar__section-content">
          <ProgressVisuals
            section={section}
            sectionProgress={sectionProgress}
            completedChapters={completedChapters}
            totalChapters={totalChapters}
          />
          <ChaptersList
            section={section}
            sectionProgress={sectionProgress}
            chapterId={chapterId}
            courseId={courseId}
            handleChapterClick={handleChapterClick}
            updateChapterProgress={updateChapterProgress}
          />
        </div>
      )}
      {isExpanded && chapters.length === 0 && (
        <div className="chapters-sidebar__empty-section">
          No chapters available in this section
        </div>
      )}
      <hr className="chapters-sidebar__divider" />
    </div>
  );
};

const ProgressVisuals = ({
  section,
  sectionProgress,
  completedChapters,
  totalChapters,
}: {
  section: any;
  sectionProgress: any;
  completedChapters: number;
  totalChapters: number;
}) => {
  // Safety check
  const chapters = section?.chapters || [];
  
  return (
    <>
      <div className="chapters-sidebar__progress">
        <div className="chapters-sidebar__progress-bars">
          {chapters.map((chapter: any) => {
            const isCompleted = sectionProgress?.chapters?.find(
              (c: any) => c.chapterId === chapter.chapterId
            )?.completed || false;
            
            return (
              <div
                key={chapter.chapterId || Math.random().toString()}
                className={cn(
                  "chapters-sidebar__progress-bar",
                  isCompleted && "chapters-sidebar__progress-bar--completed"
                )}
              ></div>
            );
          })}
        </div>
        <div className="chapters-sidebar__trophy">
          <Trophy className="chapters-sidebar__trophy-icon" />
        </div>
      </div>
      <p className="chapters-sidebar__progress-text">
        {completedChapters}/{totalChapters} COMPLETED
      </p>
    </>
  );
};

const ChaptersList = ({
  section,
  sectionProgress,
  chapterId,
  courseId,
  handleChapterClick,
  updateChapterProgress,
}: {
  section: any;
  sectionProgress: any;
  chapterId: string;
  courseId: string;
  handleChapterClick: (sectionId: string, chapterId: string) => void;
  updateChapterProgress: (
    sectionId: string,
    chapterId: string,
    completed: boolean
  ) => void;
}) => {
  // Safety check for missing data
  if (!section || !section.chapters) {
    return <p>No chapters available</p>;
  }
  
  return (
    <ul className="chapters-sidebar__chapters">
      {section.chapters.map((chapter: any, index: number) => {
        // Skip invalid chapters
        if (!chapter) return null;
        
        return (
          <Chapter
            key={chapter.chapterId || `chapter-${index}`}
            chapter={chapter}
            index={index}
            sectionId={section.sectionId || ''}
            sectionProgress={sectionProgress}
            chapterId={chapterId}
            courseId={courseId}
            handleChapterClick={handleChapterClick}
            updateChapterProgress={updateChapterProgress}
          />
        );
      })}
    </ul>
  );
};

const Chapter = ({
  chapter,
  index,
  sectionId,
  sectionProgress,
  chapterId,
  courseId,
  handleChapterClick,
  updateChapterProgress,
}: {
  chapter: any;
  index: number;
  sectionId: string;
  sectionProgress: any;
  chapterId: string;
  courseId: string;
  handleChapterClick: (sectionId: string, chapterId: string) => void;
  updateChapterProgress: (
    sectionId: string,
    chapterId: string,
    completed: boolean
  ) => void;
}) => {
  // Safety checks for missing data
  if (!chapter || !sectionId) return null;
  
  const chapterTitle = chapter.title || `Chapter ${index + 1}`;
  const currentChapterId = chapter.chapterId || '';
  
  // Check if chapter is completed
  const isCompleted = sectionProgress?.chapters?.some(
    (c: any) => c.chapterId === currentChapterId && c.completed
  ) || false;
  
  // Check if chapter is currently selected
  const isActive = currentChapterId === chapterId;

  const handleToggleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateChapterProgress(sectionId, currentChapterId, !isCompleted);
  };

  return (
    <li
      className={cn(
        "chapters-sidebar__chapter",
        isActive && "chapters-sidebar__chapter--active"
      )}
      onClick={() => handleChapterClick(sectionId, currentChapterId)}
    >
      <div className="chapters-sidebar__chapter-content">
        <div className="chapters-sidebar__chapter-icon">
          <FileText className="chapters-sidebar__chapter-file-icon" />
        </div>
        <span className="chapters-sidebar__chapter-title">{chapterTitle}</span>
      </div>
      <button
        onClick={handleToggleComplete}
        className="chapters-sidebar__chapter-complete-button"
      >
        <CheckCircle
          className={cn(
            "chapters-sidebar__chapter-check",
            isCompleted && "chapters-sidebar__chapter-check--completed"
          )}
        />
      </button>
    </li>
  );
};

export default ChaptersSidebar;

    