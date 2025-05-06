import { CustomFormField } from "@/components/CustomFormField";
import CustomModal from "@/components/CustomModal";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ChapterFormData, chapterSchema } from "@/lib/schemas";
import { addChapter, closeChapterModal, editChapter } from "@/state";
import { useAppDispatch, useAppSelector } from "@/state/redux";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, BookOpen, Video, FileText, Upload, AlertTriangle } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { cn } from "@/lib/utils";

const ChapterModal = () => {
  const dispatch = useAppDispatch();
  const {
    isChapterModalOpen,
    selectedSectionIndex,
    selectedChapterIndex,
    sections,
  } = useAppSelector((state) => state.global.courseEditor);
  
  const [hasVideo, setHasVideo] = useState(false);

  const chapter: Chapter | undefined =
    selectedSectionIndex !== null && selectedChapterIndex !== null
      ? sections[selectedSectionIndex].chapters[selectedChapterIndex]
      : undefined;

  const methods = useForm<ChapterFormData>({
    resolver: zodResolver(chapterSchema),
    defaultValues: {
      title: "",
      content: "",
      video: "",
    },
  });

  useEffect(() => {
    if (chapter) {
      methods.reset({
        title: chapter.title,
        content: chapter.content,
        video: chapter.video || "",
      });
      setHasVideo(!!chapter.video);
    } else {
      methods.reset({
        title: "",
        content: "",
        video: "",
      });
      setHasVideo(false);
    }
  }, [chapter, methods]);

  const onClose = () => {
    dispatch(closeChapterModal());
  };

  const onSubmit = (data: ChapterFormData) => {
    if (selectedSectionIndex === null) return;

    if (data.title.startsWith('http') || data.content.startsWith('http')) {
      toast.error('Chapter title and content should not be URLs');
      return;
    }

    const validTitle = data.title.trim().substring(0, 100);
    const validContent = data.content.trim().substring(0, 5000);

    if (validTitle.length === 0) {
      toast.error('Chapter title cannot be empty');
      return;
    }

    let videoValue = data.video;
    
    if (chapter?.video && typeof data.video !== 'object' && !data.video) {
      videoValue = chapter.video;
    }

    const newChapter: Chapter = {
      chapterId: chapter?.chapterId || uuidv4(),
      title: validTitle,
      content: validContent,
      type: videoValue ? "Video" : "Text",
      video: videoValue,
    };

    if (selectedChapterIndex === null) {
      dispatch(
        addChapter({
          sectionIndex: selectedSectionIndex,
          chapter: newChapter,
        })
      );
    } else {
      dispatch(
        editChapter({
          sectionIndex: selectedSectionIndex,
          chapterIndex: selectedChapterIndex,
          chapter: newChapter,
        })
      );
    }

    toast.success(
      `Chapter ${selectedChapterIndex === null ? 'added' : 'updated'} successfully`
    );
    onClose();
  };

  return (
    <CustomModal isOpen={isChapterModalOpen} onClose={onClose}>
      <div className="bg-customgreys-secondarybg rounded-lg overflow-hidden border border-customgreys-darkerGrey shadow-xl max-w-xl w-full">
        <div className="bg-gradient-to-r from-customgreys-darkGrey to-customgreys-darkerGrey p-4 flex items-center justify-between border-b border-customgreys-darkerGrey">
          <div className="flex items-center gap-2">
            {selectedChapterIndex === null ? (
              <BookOpen className="h-5 w-5 text-primary-400" />
            ) : (
              <FileText className="h-5 w-5 text-primary-400" />
            )}
            <h2 className="text-xl font-semibold text-white">
              {selectedChapterIndex === null ? "Add New Chapter" : "Edit Chapter"}
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="text-customgreys-dirtyGrey hover:text-white transition-colors p-1 rounded-full hover:bg-customgreys-darkGrey"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5">
          <Form {...methods}>
            <form
              onSubmit={methods.handleSubmit(onSubmit)}
              className="space-y-5"
            >
              <CustomFormField
                name="title"
                label="Chapter Title"
                placeholder="Write descriptive title here..."
                className="bg-customgreys-darkGrey/80 rounded-lg"
                labelClassName="text-white mb-1"
                inputClassName="bg-customgreys-darkGrey rounded-md text-white"
              />

              <CustomFormField
                name="content"
                label="Chapter Content"
                type="textarea"
                placeholder="Write chapter content here..."
                className="bg-customgreys-darkGrey/80 rounded-lg"
                labelClassName="text-white mb-1"
                inputClassName="bg-customgreys-darkGrey rounded-md text-white min-h-[150px]"
              />

              <div className="bg-customgreys-darkGrey/80 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4 text-primary-400" />
                    <h3 className="font-medium text-white">Video Content</h3>
                  </div>
                  <label 
                    className={cn(
                      "relative inline-flex items-center cursor-pointer",
                      hasVideo && "text-primary-400"
                    )}
                  >
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={hasVideo}
                      onChange={() => setHasVideo(!hasVideo)}
                    />
                    <div className="w-9 h-5 bg-customgreys-darkerGrey peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-customgreys-dirtyGrey after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-900 peer-checked:after:bg-primary-400"></div>
                    <span className="ms-2 text-sm font-medium text-customgreys-dirtyGrey peer-checked:text-primary-400">
                      {hasVideo ? "Enabled" : "Disabled"}
                    </span>
                  </label>
                </div>

                {hasVideo && (
                  <FormField
                    control={methods.control}
                    name="video"
                    render={({ field: { onChange, value } }) => (
                      <FormItem>
                        <FormControl>
                          <div className="space-y-3">
                            <div className="relative border-2 border-dashed border-customgreys-darkerGrey/60 rounded-lg p-4 transition-colors hover:border-primary-700/50 text-center">
                              <Input
                                type="file"
                                accept="video/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    onChange(file);
                                  }
                                }}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                              />
                              <div className="flex flex-col items-center justify-center gap-2">
                                <Upload className="h-8 w-8 text-customgreys-dirtyGrey" />
                                <div className="text-sm text-customgreys-dirtyGrey">
                                  <span className="font-medium text-primary-400">Click to upload</span> or drag and drop
                                </div>
                                <p className="text-xs text-customgreys-dirtyGrey">MP4, WebM or other video formats</p>
                              </div>
                            </div>

                            {typeof value === "string" && value && (
                              <div className="bg-customgreys-darkerGrey/30 p-3 rounded-lg border border-customgreys-darkerGrey/40">
                                <div className="flex items-center gap-2 text-sm text-white">
                                  <Video className="h-4 w-4 text-primary-400" />
                                  <span className="truncate">{value.split("/").pop()}</span>
                                </div>
                                <p className="text-xs text-customgreys-dirtyGrey mt-1">Current video file</p>
                              </div>
                            )}
                            
                            {value instanceof File && (
                              <div className="bg-customgreys-darkerGrey/30 p-3 rounded-lg border border-customgreys-darkerGrey/40">
                                <div className="flex items-center gap-2 text-sm text-white">
                                  <Video className="h-4 w-4 text-primary-400" />
                                  <span className="truncate">{value.name}</span>
                                </div>
                                <p className="text-xs text-customgreys-dirtyGrey mt-1">Selected file: {(value.size / (1024 * 1024)).toFixed(2)}MB</p>
                              </div>
                            )}
                            
                            <div className="bg-yellow-500/10 rounded-lg p-3 border border-yellow-500/20 flex items-start gap-2">
                              <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                              <p className="text-xs text-yellow-400">
                                The course must be saved after adding/editing a chapter with video for the changes to be applied.
                              </p>
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onClose}
                  className="border-customgreys-dirtyGrey text-white hover:bg-customgreys-darkGrey"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-gradient-to-r from-primary-700 to-primary-600 hover:from-primary-600 hover:to-primary-500 text-white"
                >
                  {selectedChapterIndex === null ? "Add Chapter" : "Update Chapter"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </CustomModal>
  );
};

export default ChapterModal;