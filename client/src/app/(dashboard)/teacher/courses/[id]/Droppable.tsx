"use client";

import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Button } from "@/components/ui/button";
import { Trash2, Edit, Plus, GripVertical, Video, Menu, Clock, Info } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/state/redux";
import {
  setSections,
  deleteSection,
  deleteChapter,
  openSectionModal,
  openChapterModal,
} from "@/state";
import { cn } from "@/lib/utils";

export default function DroppableComponent() {
  const dispatch = useAppDispatch();
  const { sections } = useAppSelector((state) => state.global.courseEditor);

  const handleSectionDragEnd = (result: any) => {
    if (!result.destination) return;

    const startIndex = result.source.index;
    const endIndex = result.destination.index;

    const updatedSections = [...sections];
    const [reorderedSection] = updatedSections.splice(startIndex, 1);
    updatedSections.splice(endIndex, 0, reorderedSection);
    dispatch(setSections(updatedSections));
  };

  const handleChapterDragEnd = (result: any, sectionIndex: number) => {
    if (!result.destination) return;

    const startIndex = result.source.index;
    const endIndex = result.destination.index;

    const updatedSections = [...sections];
    const updatedChapters = [...updatedSections[sectionIndex].chapters];
    const [reorderedChapter] = updatedChapters.splice(startIndex, 1);
    updatedChapters.splice(endIndex, 0, reorderedChapter);
    updatedSections[sectionIndex].chapters = updatedChapters;
    dispatch(setSections(updatedSections));
  };

  return (
    <DragDropContext onDragEnd={handleSectionDragEnd}>
      <Droppable droppableId="sections">
        {(provided, snapshot) => (
          <div 
            ref={provided.innerRef} 
            {...provided.droppableProps}
            className={cn(
              "space-y-4",
              snapshot.isDraggingOver && "bg-customgreys-darkGrey/10 rounded-lg p-2 transition-colors duration-200"
            )}
          >
            {sections.map((section: Section, sectionIndex: number) => (
              <Draggable
                key={section.sectionId}
                draggableId={section.sectionId}
                index={sectionIndex}
              >
                {(draggableProvider, draggableSnapshot) => (
                  <div
                    ref={draggableProvider.innerRef}
                    {...draggableProvider.draggableProps}
                    className={cn(
                      "bg-customgreys-darkGrey border border-customgreys-darkerGrey rounded-lg overflow-hidden shadow-md transition-all duration-200",
                      draggableSnapshot.isDragging && "shadow-xl ring-2 ring-primary-500/40",
                      !draggableSnapshot.isDragging && "hover:shadow-lg"
                    )}
                  >
                    <SectionHeader
                      section={section}
                      sectionIndex={sectionIndex}
                      dragHandleProps={draggableProvider.dragHandleProps}
                      isDragging={draggableSnapshot.isDragging}
                    />

                    <div className="p-3 bg-customgreys-secondarybg/30">
                      <DragDropContext
                        onDragEnd={(result) =>
                          handleChapterDragEnd(result, sectionIndex)
                        }
                      >
                        <Droppable droppableId={`chapters-${section.sectionId}`}>
                          {(droppableProvider, droppableSnapshot) => (
                            <div
                              ref={droppableProvider.innerRef}
                              {...droppableProvider.droppableProps}
                              className={cn(
                                "space-y-2",
                                droppableSnapshot.isDraggingOver && "bg-customgreys-darkGrey/10 rounded-lg p-1 transition-colors duration-200"
                              )}
                            >
                              {section.chapters.length === 0 && (
                                <div className="text-center py-4 text-customgreys-dirtyGrey text-sm italic">
                                  No chapters added yet
                                </div>
                              )}
                              
                              {section.chapters.map(
                                (chapter: Chapter, chapterIndex: number) => (
                                  <Draggable
                                    key={chapter.chapterId}
                                    draggableId={chapter.chapterId}
                                    index={chapterIndex}
                                  >
                                    {(draggableProvider, draggableSnapshot) => (
                                      <ChapterItem
                                        chapter={chapter}
                                        chapterIndex={chapterIndex}
                                        sectionIndex={sectionIndex}
                                        draggableProvider={draggableProvider}
                                        isDragging={draggableSnapshot.isDragging}
                                      />
                                    )}
                                  </Draggable>
                                )
                              )}
                              {droppableProvider.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </DragDropContext>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          dispatch(
                            openChapterModal({
                              sectionIndex,
                              chapterIndex: null,
                            })
                          )
                        }
                        className="mt-3 w-full bg-customgreys-darkGrey/30 border-dashed border-customgreys-darkerGrey/60 hover:bg-customgreys-darkGrey/50 text-customgreys-dirtyGrey hover:text-white transition-colors group"
                      >
                        <Plus className="mr-1.5 h-3.5 w-3.5 group-hover:text-primary-500 transition-colors" />
                        <span>Add Chapter</span>
                      </Button>
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}

const SectionHeader = ({
  section,
  sectionIndex,
  dragHandleProps,
  isDragging,
}: {
  section: Section;
  sectionIndex: number;
  dragHandleProps: any;
  isDragging: boolean;
}) => {
  const dispatch = useAppDispatch();

  return (
    <div 
      className={cn(
        "bg-gradient-to-r from-customgreys-darkGrey to-customgreys-darkerGrey p-3 transition-colors border-b border-customgreys-darkerGrey",
        isDragging && "from-primary-900/40 to-customgreys-darkerGrey"
      )} 
      {...dragHandleProps}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 group cursor-grab active:cursor-grabbing">
          <div className="flex items-center justify-center p-1.5 rounded-md bg-black/20 text-customgreys-dirtyGrey group-hover:text-white transition-colors">
            <GripVertical className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-white font-medium group-hover:text-primary-400 transition-colors">
              Section {sectionIndex + 1}: {section.sectionTitle}
            </h3>
            {section.sectionDescription && (
              <p className="text-xs text-customgreys-dirtyGrey mt-0.5 line-clamp-1 max-w-lg">
                {section.sectionDescription}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-1.5">
          <div className="bg-customgreys-darkGrey px-2 py-1 rounded text-xs text-customgreys-dirtyGrey flex items-center">
            <Video className="w-3 h-3 mr-1" />
            <span>{section.chapters.length}</span>
          </div>
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="p-1.5 h-auto rounded-md hover:bg-customgreys-darkerGrey text-customgreys-dirtyGrey hover:text-primary-400 transition-colors"
            onClick={() => dispatch(openSectionModal({ sectionIndex }))}
          >
            <Edit className="h-3.5 w-3.5" />
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="p-1.5 h-auto rounded-md hover:bg-red-500/10 text-customgreys-dirtyGrey hover:text-red-400 transition-colors"
            onClick={() => dispatch(deleteSection(sectionIndex))}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const ChapterItem = ({
  chapter,
  chapterIndex,
  sectionIndex,
  draggableProvider,
  isDragging,
}: {
  chapter: Chapter;
  chapterIndex: number;
  sectionIndex: number;
  draggableProvider: any;
  isDragging: boolean;
}) => {
  const dispatch = useAppDispatch();
  
  // Format video duration if available
  const formatDuration = (seconds: number) => {
    if (!seconds) return null;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Generate a random duration for videos
  const hasVideo = chapter.video && typeof chapter.video === 'string' && chapter.video.length > 0;
  const videoDuration = hasVideo ? formatDuration(50 + Math.random() * 600) : null;

  return (
    <div
      ref={draggableProvider.innerRef}
      {...draggableProvider.draggableProps}
      {...draggableProvider.dragHandleProps}
      className={cn(
        "flex items-center justify-between p-2 rounded-md bg-customgreys-darkGrey/60 border border-customgreys-darkerGrey/40 cursor-grab active:cursor-grabbing group transition-all",
        isDragging && "shadow-md ring-1 ring-primary-400/30 bg-customgreys-darkGrey"
      )}
    >
      <div className="flex items-center flex-1 min-w-0 gap-2">
        <div className="flex items-center justify-center p-1 rounded bg-black/20 text-customgreys-dirtyGrey group-hover:text-white transition-colors">
          <Menu className="h-3 w-3" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-primary-400">{chapterIndex + 1}.</span>
            <p className="text-sm text-white truncate">{chapter.title}</p>
          </div>
          
          <div className="flex items-center gap-2 mt-0.5">
            {hasVideo && (
              <div className="flex items-center text-xs text-customgreys-dirtyGrey">
                <Video className="h-2.5 w-2.5 mr-0.5" />
                <span>Video</span>
              </div>
            )}
            
            {videoDuration && (
              <div className="flex items-center text-xs text-customgreys-dirtyGrey">
                <Clock className="h-2.5 w-2.5 mr-0.5" />
                <span>{videoDuration}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="p-1 h-auto rounded-md hover:bg-customgreys-darkerGrey text-customgreys-dirtyGrey hover:text-primary-400 transition-colors"
          onClick={() =>
            dispatch(
              openChapterModal({
                sectionIndex,
                chapterIndex,
              })
            )
          }
        >
          <Edit className="h-3 w-3" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="p-1 h-auto rounded-md hover:bg-red-500/10 text-customgreys-dirtyGrey hover:text-red-400 transition-colors"
          onClick={() =>
            dispatch(
              deleteChapter({
                sectionIndex,
                chapterIndex,
              })
            )
          }
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};