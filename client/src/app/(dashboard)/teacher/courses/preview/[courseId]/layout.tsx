"use client";

import { useState } from "react";
import { Menu, ArrowLeft, Eye } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import ChaptersSidebar from "./ChaptersSidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CourseLayoutProps {
  children: React.ReactNode;
}

const CourseLayout = ({ children }: CourseLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();
  const { courseId } = useParams();

  return (
    <div className="h-full flex flex-col">
      <header className="sticky top-0 z-40 w-full bg-customgreys-primarybg/95 backdrop-blur-md border-b border-customgreys-darkGrey/80 flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-customgreys-dirtyGrey hover:text-white hover:bg-customgreys-darkGrey/50"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <Button
            variant="ghost"
            className="flex items-center text-customgreys-dirtyGrey hover:text-white gap-2 hover:bg-customgreys-darkGrey/50"
            onClick={() => router.push(`/teacher/courses/${courseId}`)}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Course Editor</span>
          </Button>
        </div>
        
        <div className="py-1.5 px-3 rounded-full text-sm font-medium bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center gap-1">
          <Eye className="h-3.5 w-3.5 mr-1" />
          Preview Mode
        </div>
      </header>
      
      <div className="flex-1 flex overflow-hidden">
        <ChaptersSidebar isOpen={sidebarOpen} />
        
        <div className="flex-1 overflow-y-auto relative">
          <div className="pb-20">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default CourseLayout; 