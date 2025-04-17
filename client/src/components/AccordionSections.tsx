import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FileText } from "lucide-react";


const AccordionSections = ({ sections }: AccordionSectionsProps) => {
  if (!sections || !Array.isArray(sections) || sections.length === 0) {
    return <div className="text-sm text-muted-foreground">No course sections available</div>;
  }

  return (
    <Accordion type="multiple" className="w-full">
      {sections.map((section) => (
        <AccordionItem
          key={section.sectionId}
          value={section.sectionTitle}
          className="accordion-section"
        >
          <AccordionTrigger className="accordion-section__trigger">
            <h5 className="accordion-section__title">{section.sectionTitle}</h5>
          </AccordionTrigger>
          <AccordionContent className="accordion-section__content">
            <ul>
              {section.chapters && section.chapters.length > 0 ? (
                section.chapters.map((chapter) => (
                  <li
                    key={chapter.chapterId}
                    className="accordion-section__chapter"
                  >
                    <FileText className="mr-2 w-4 h-4" />
                    <span className="text-sm">{chapter.title}</span>
                  </li>
                ))
              ) : (
                <li className="text-sm text-muted-foreground">No chapters in this section</li>
              )}
            </ul>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default AccordionSections;