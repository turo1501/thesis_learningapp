import React from 'react'
import Image from "next/image"
import { formatPrice } from "@/lib/utils"
import { motion } from "framer-motion";
import { Clock, Users, Star } from "lucide-react";

const CourseCardSearch = ({ course, isSelected, onClick }: SearchCourseCardProps) => {
  // Generate a random rating between 4.0 and 5.0
  const rating = (4 + Math.random()).toFixed(1);
  
  // Calculate estimated hours (random between 2-12)
  const hours = Math.floor(2 + Math.random() * 10);
  
  return (
    <motion.div 
      whileHover={{ y: -5, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick} 
      className={`
        bg-customgreys-secondarybg border border-customgreys-darkerGrey/40 rounded-xl overflow-hidden 
        shadow-lg shadow-customgreys-darkerGrey/10 hover:shadow-xl hover:shadow-primary-900/5 hover:border-primary-700/20 
        transition-all duration-300 h-full flex flex-col cursor-pointer
        ${isSelected ? "ring-2 ring-primary-500" : ""}
      `}
    >
      <div className="relative h-48 w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 to-transparent z-10"></div>
        <Image
          src={course.image || "/placeholder.png"}
          alt={course.title}
          fill
          sizes="(max-width:780px) 100vw, (max-width:1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        /> 
        {course.price > 0 && (
          <div className="absolute top-3 right-3 bg-primary-600/90 text-white px-3 py-1.5 rounded-lg text-sm font-medium z-20 backdrop-blur-sm">
            {formatPrice(course.price)}
          </div>
        )}
        {course.price === 0 && (
          <div className="absolute top-3 right-3 bg-green-600/90 text-white px-3 py-1.5 rounded-lg text-sm font-medium z-20 backdrop-blur-sm">
            Free
          </div>
        )}
      </div>
      
      <div className="flex flex-col justify-between flex-grow p-5">
        <div>
          <div className="flex items-center gap-2 mb-2">
            {/* Display random categories for the course */}
            <span className="px-2 py-0.5 bg-customgreys-darkGrey/50 rounded-md text-xs text-primary-400">
              {["Development", "Design", "Business", "Marketing", "IT"][Math.floor(Math.random() * 5)]}
            </span>
            <div className="flex items-center text-yellow-400 text-xs">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-0.5" />
              <span>{rating}</span>
            </div>
          </div>
          
          <h2 className="text-white font-semibold text-lg line-clamp-2 mb-2 min-h-[3.5rem]">
            {course.title}
          </h2>
          
          <p className="text-customgreys-dirtyGrey text-sm line-clamp-2 min-h-[2.5rem]">
            {course.description}
          </p>
        </div>
        
        <div className="mt-4 pt-4 border-t border-customgreys-darkerGrey/30">
          <div className="flex items-center justify-between text-xs text-customgreys-dirtyGrey mb-2">
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{hours} hours</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              <span>{course.enrollments?.length || 0} enrolled</span>
            </div>
          </div>
          
          <div className="flex items-center mt-2">
            <div className="h-7 w-7 rounded-full bg-customgreys-darkGrey flex items-center justify-center text-white text-xs overflow-hidden relative">
              {course.teacherName && course.teacherName.charAt(0).toUpperCase()}
            </div>
            <p className="text-customgreys-dirtyGrey text-sm ml-2 line-clamp-1">
              {course.teacherName}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default CourseCardSearch
