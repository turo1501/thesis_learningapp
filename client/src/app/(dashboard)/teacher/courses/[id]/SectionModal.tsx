import { CustomFormField } from "@/components/CustomFormField";
import CustomModal from "@/components/CustomModal";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { SectionFormData, sectionSchema } from "@/lib/schemas";
import { addSection, closeSectionModal, editSection } from "@/state";
import { useAppDispatch, useAppSelector } from "@/state/redux";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Layers, Info, BookOpen } from "lucide-react";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { cn } from "@/lib/utils";

const SectionModal = () => {
  const dispatch = useAppDispatch();
  const { isSectionModalOpen, selectedSectionIndex, sections } = useAppSelector(
    (state) => state.global.courseEditor
  );

  const section =
    selectedSectionIndex !== null ? sections[selectedSectionIndex] : null;

  const methods = useForm<SectionFormData>({
    resolver: zodResolver(sectionSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  useEffect(() => {
    if (section) {
      methods.reset({
        title: section.sectionTitle,
        description: section.sectionDescription,
      });
    } else {
      methods.reset({
        title: "",
        description: "",
      });
    }
  }, [section, methods]);

  const onClose = () => {
    dispatch(closeSectionModal());
  };

  const onSubmit = (data: SectionFormData) => {
    if (data.title.startsWith('http') || data.description.startsWith('http')) {
      toast.error('Section title and description should not be URLs');
      return;
    }

    const validTitle = data.title.trim().substring(0, 100);
    const validDescription = data.description.trim().substring(0, 500);

    if (validTitle.length === 0) {
      toast.error('Section title cannot be empty');
      return;
    }

    const newSection: Section = {
      sectionId: section?.sectionId || uuidv4(),
      sectionTitle: validTitle,
      sectionDescription: validDescription,
      chapters: section?.chapters || [],
    };

    if (selectedSectionIndex === null) {
      dispatch(addSection(newSection));
    } else {
      dispatch(
        editSection({
          index: selectedSectionIndex,
          section: newSection,
        })
      );
    }

    toast.success(
      `Section ${selectedSectionIndex === null ? 'added' : 'updated'} successfully`
    );
    onClose();
  };

  return (
    <CustomModal isOpen={isSectionModalOpen} onClose={onClose}>
      <div className="bg-customgreys-secondarybg rounded-lg overflow-hidden border border-customgreys-darkerGrey shadow-xl max-w-xl w-full">
        <div className="bg-gradient-to-r from-customgreys-darkGrey to-customgreys-darkerGrey p-4 flex items-center justify-between border-b border-customgreys-darkerGrey">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary-400" />
            <h2 className="text-xl font-semibold text-white">
              {selectedSectionIndex === null ? "Add New Section" : "Edit Section"}
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
          <div className="bg-primary-900/20 border border-primary-800/30 rounded-lg p-3 mb-5 flex items-start gap-2.5">
            <Info className="h-5 w-5 text-primary-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-customgreys-dirtyGrey">
              <span className="block text-white font-medium mb-1">About Course Sections</span>
              <p>Sections help organize your course content into logical groups. Each section can contain multiple chapters with videos and text materials.</p>
            </div>
          </div>

          <Form {...methods}>
            <form
              onSubmit={methods.handleSubmit(onSubmit)}
              className="space-y-5"
            >
              <CustomFormField
                name="title"
                label="Section Title"
                placeholder="e.g. Introduction to React, Advanced Techniques..."
                className="bg-customgreys-darkGrey/80 rounded-lg"
                labelClassName="text-white mb-1"
                inputClassName="bg-customgreys-darkGrey rounded-md text-white"
              />

              <CustomFormField
                name="description"
                label="Section Description"
                type="textarea"
                placeholder="Describe what students will learn in this section..."
                className="bg-customgreys-darkGrey/80 rounded-lg"
                labelClassName="text-white mb-1"
                inputClassName="bg-customgreys-darkGrey rounded-md text-white min-h-[120px]"
              />

              {selectedSectionIndex !== null && section && section.chapters.length > 0 && (
                <div className="bg-customgreys-darkGrey/80 rounded-lg p-4 border border-customgreys-darkerGrey/60">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="h-4 w-4 text-primary-400" />
                    <h3 className="font-medium text-white text-sm">
                      Chapter Count
                    </h3>
                  </div>
                  <p className="text-customgreys-dirtyGrey text-sm">
                    This section contains {section.chapters.length} {section.chapters.length === 1 ? 'chapter' : 'chapters'}.
                    Editing the section will preserve all existing chapters.
                  </p>
                </div>
              )}

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
                  {selectedSectionIndex === null ? "Add Section" : "Update Section"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </CustomModal>
  );
};

export default SectionModal;