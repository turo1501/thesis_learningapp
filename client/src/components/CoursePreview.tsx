import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import AccordionSections from "./AccordionSections";

const CoursePreview = ({ course }: CoursePreviewProps) => {
  const [localCourse, setLocalCourse] = useState(course);

  // Debug the incoming course data
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.log("CoursePreview - received course:", course);
    }
  }, [course]);

  // Try to get course from localStorage if course prop is undefined
  useEffect(() => {
    if (!course && typeof window !== 'undefined') {
      try {
        const storedCourse = localStorage.getItem('currentCourse');
        if (storedCourse) {
          const parsedCourse = JSON.parse(storedCourse);
          setLocalCourse(parsedCourse);
          console.log("Using course from localStorage:", parsedCourse);
        }
      } catch (e) {
        console.error("Failed to retrieve course from localStorage:", e);
      }
    } else {
      setLocalCourse(course);
    }
  }, [course]);

  // If course is undefined or missing essential properties after fallback
  if (!localCourse) {
    return <div className="course-preview__loading">Loading course details...</div>;
  }

  const price = formatPrice(localCourse.price || 0);
  
  return (
    <div className="course-preview">
      <div className="course-preview__container">
        <div className="course-preview__image-wrapper">
          <Image
            src={localCourse.image || "/placeholder.png"}
            alt={localCourse.title || "Course Preview"}
            width={640}
            height={360}
            className="w-full"
          />
        </div>
        <div>
          <h2 className="course-preview__title">{localCourse.title || "Untitled Course"}</h2>
          <p className="text-gray-400 text-md mb-4">by {localCourse.teacherName || "Unknown Instructor"}</p>
          <p className="text-sm text-customgreys-dirtyGrey">
            {localCourse.description || "No description available"}
          </p>
        </div>

        <div>
          <h4 className="text-white-50/90 font-semibold mb-2">
            Course Content
          </h4>
          <AccordionSections sections={localCourse.sections || []} />
        </div>
      </div>

      <div className="course-preview__container">
        <h3 className="text-xl mb-4">Price Details (1 item)</h3>
        <div className="flex justify-between mb-4 text-customgreys-dirtyGrey text-base">
          <span className="font-bold">1x {localCourse.title || "Course"}</span>
          <span className="font-bold">{price}</span>
        </div>
        <div className="flex justify-between border-t border-customgreys-dirtyGrey pt-4">
          <span className="font-bold text-lg">Total Amount</span>
          <span className="font-bold text-lg">{price}</span>
        </div>
      </div>
    </div>
  );
};

export default CoursePreview;