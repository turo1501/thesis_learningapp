"use client";

import React, { useEffect, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useCarousel } from "@/hooks/useCarousel";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetCoursesQuery } from "@/state/api";
import { useRouter } from "next/navigation";
import CourseCardSearch from "@/components/CourseCardSearch";
import { useUser } from "@clerk/nextjs";
import { Sparkles, ChevronRight, BookOpen, CheckCircle, Users, Award, ArrowRight, Star, Play } from "lucide-react";
import { cn } from "@/lib/utils";

// Định nghĩa kiểu dữ liệu cho API response
interface CoursesResponse {
  data?: Course[];
  success?: boolean;
  [key: string]: any;
}

// Custom gradients for background elements
const GRADIENTS = {
  primary: "bg-gradient-to-br from-primary-600 to-primary-900",
  secondary: "bg-gradient-to-br from-indigo-500/90 to-purple-700/90",
  accent: "bg-gradient-to-br from-blue-500 to-violet-600",
};

// Loading skeleton component
const LoadingSkeleton = () => {
  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-16 2xl:py-20">
      <div className="flex flex-col md:flex-row gap-12 mb-16">
        <div className="flex-1 space-y-6">
          <Skeleton className="h-12 w-3/4 lg:h-16 2xl:h-20" />
          <Skeleton className="h-6 w-full lg:h-8 2xl:h-10" />
          <Skeleton className="h-6 w-5/6 lg:h-8 2xl:h-10" />
          <div className="pt-4">
            <Skeleton className="h-12 w-40 lg:h-14 2xl:h-16 lg:w-48 2xl:w-56" />
          </div>
        </div>
        <div className="flex-1">
          <Skeleton className="h-80 w-full rounded-xl lg:h-96 2xl:h-[32rem]" />
        </div>
      </div>

      <div className="py-16 space-y-6 lg:py-20 2xl:py-24 lg:space-y-8 2xl:space-y-10">
        <Skeleton className="h-10 w-64 mx-auto lg:h-14 2xl:h-16 lg:w-80 2xl:w-96" />
        <Skeleton className="h-6 w-full max-w-2xl mx-auto lg:h-8 2xl:h-10 lg:max-w-3xl 2xl:max-w-4xl" />

        <div className="flex flex-wrap gap-4 justify-center my-8 lg:my-12 2xl:my-16 lg:gap-6 2xl:gap-8">
          {[1, 2, 3, 4, 5].map((_, index) => (
            <Skeleton key={index} className="h-8 w-24 rounded-full lg:h-10 2xl:h-12 lg:w-32 2xl:w-40" />
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12 lg:gap-8 2xl:gap-10 lg:mt-16 2xl:mt-20">
          {[1, 2, 3, 4].map((_, index) => (
            <Skeleton key={index} className="h-96 rounded-xl lg:h-[28rem] 2xl:h-[32rem]" />
          ))}
        </div>
      </div>
    </div>
  );
};

// Custom feature card component
const FeatureCard = ({ icon: Icon, title, description }: { 
  icon: React.ElementType, 
  title: string, 
  description: string 
}) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    viewport={{ once: true, amount: 0.3 }}
    className="bg-customgreys-secondarybg/50 backdrop-blur-sm rounded-xl p-6 lg:p-8 2xl:p-10 border border-customgreys-darkerGrey/40 hover:border-primary-700/30 transition-all group hover:shadow-lg hover:shadow-primary-900/5"
  >
    <div className="w-12 h-12 lg:w-16 lg:h-16 2xl:w-20 2xl:h-20 rounded-lg bg-gradient-to-br from-primary-600/20 to-primary-900/20 flex items-center justify-center mb-4 lg:mb-6 group-hover:from-primary-600/30 group-hover:to-primary-900/30 transition-all">
      <Icon className="w-6 h-6 lg:w-8 lg:h-8 2xl:w-10 2xl:h-10 text-primary-400" />
    </div>
    <h3 className="text-lg lg:text-xl 2xl:text-2xl font-semibold mb-2 lg:mb-3 text-white">{title}</h3>
    <p className="text-customgreys-dirtyGrey lg:text-lg 2xl:text-xl">{description}</p>
  </motion.div>
);

// Testimonial component
const Testimonial = ({ quote, author, role, avatarUrl }: {
  quote: string,
  author: string,
  role: string,
  avatarUrl: string
}) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.95 }}
    whileInView={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
    viewport={{ once: true, amount: 0.3 }}
    className="bg-customgreys-secondarybg/50 backdrop-blur-sm rounded-xl p-6 lg:p-8 2xl:p-10 shadow-xl shadow-black/5 border border-customgreys-darkerGrey/40 relative"
  >
    <div className="absolute -top-4 left-6 text-primary-500 text-5xl lg:text-6xl 2xl:text-7xl leading-none">"</div>
    <div className="pt-2">
      <p className="text-customgreys-dirtyGrey mb-4 lg:mb-6 2xl:mb-8 relative z-10 lg:text-lg 2xl:text-xl">{quote}</p>
      <div className="flex items-center gap-3 lg:gap-4">
        <div className="w-10 h-10 lg:w-12 lg:h-12 2xl:w-14 2xl:h-14 rounded-full overflow-hidden relative bg-customgreys-darkGrey">
          {avatarUrl ? (
            <Image 
              src={avatarUrl} 
              alt={author} 
              fill 
              sizes="(max-width: 768px) 40px, (max-width: 1200px) 48px, 56px"
              className="object-cover" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white lg:text-lg 2xl:text-xl">
              {author.charAt(0)}
            </div>
          )}
        </div>
        <div>
          <p className="font-medium text-white lg:text-lg 2xl:text-xl">{author}</p>
          <p className="text-sm lg:text-base 2xl:text-lg text-customgreys-dirtyGrey">{role}</p>
        </div>
      </div>
    </div>
  </motion.div>
);

// Stat card component
const StatCard = ({ number, label, icon: Icon }: {
  number: string,
  label: string,
  icon: React.ElementType
}) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.1 }}
    viewport={{ once: true, amount: 0.3 }}
    className="bg-customgreys-secondarybg/30 backdrop-blur-sm rounded-xl p-6 lg:p-8 2xl:p-10 text-center flex flex-col items-center"
  >
    <div className="w-12 h-12 lg:w-16 lg:h-16 2xl:w-20 2xl:h-20 rounded-full bg-primary-800/20 flex items-center justify-center mb-3 lg:mb-4">
      <Icon className="w-6 h-6 lg:w-8 lg:h-8 2xl:w-10 2xl:h-10 text-primary-400" />
    </div>
    <div className="text-3xl lg:text-4xl 2xl:text-5xl font-bold bg-gradient-to-r from-white to-gray-300 text-transparent bg-clip-text mb-1 lg:mb-2">{number}</div>
    <div className="text-customgreys-dirtyGrey text-sm lg:text-base 2xl:text-lg">{label}</div>
  </motion.div>
);

// Main Landing component
const Landing = () => {
  const router = useRouter();
  const { user } = useUser();
  const currentImage = useCarousel({ totalImages: 3 });
  const { data: courses, isLoading, isError } = useGetCoursesQuery({});
  const sectionRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
    layoutEffect: false
  });
  
  const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.8, 1]);

  // Handle course click
  const handleCourseClick = (courseId: string) => {
    router.push(`/search?id=${courseId}`, {
      scroll: false,
    });
  };

  // Get courses data
  const coursesToShow = React.useMemo(() => {
    if (courses && Array.isArray(courses)) {
      return courses.slice(0, 4) as Course[];
    } else if (courses && 'data' in courses && Array.isArray((courses as CoursesResponse).data)) {
      return (courses as CoursesResponse).data?.slice(0, 4) || [];
    } else {
      return [] as Course[];
    }
  }, [courses]);

  if (isLoading) return <LoadingSkeleton />;

  if (isError) {
    return (
      <div className="max-w-[1600px] w-[95%] mx-auto px-4 py-12 text-center">
        <div className="p-8 lg:p-10 2xl:p-12 bg-red-900/20 rounded-xl border border-red-800/30 max-w-lg lg:max-w-xl 2xl:max-w-2xl mx-auto">
          <h2 className="text-xl lg:text-2xl 2xl:text-3xl font-semibold text-white mb-2 lg:mb-3 2xl:mb-4">Cannot load courses</h2>
          <p className="text-customgreys-dirtyGrey lg:text-lg 2xl:text-xl">An error occurred while loading course data. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-customgreys-primarybg pb-20 lg:pb-24 2xl:pb-32">
      {/* Hero Section */}
      <section className="relative overflow-hidden pb-10 lg:pb-16 2xl:pb-24">
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-gradient-to-br from-primary-900/10 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-gradient-to-tl from-indigo-900/10 to-transparent rounded-full blur-3xl" />
          <div className="absolute inset-0 bg-[url('/pattern.svg')] bg-repeat opacity-5" />
        </div>
        
        <div className="max-w-[1600px] w-[95%] mx-auto px-4 sm:px-6 lg:px-8 pt-10 lg:pt-20 2xl:pt-28 relative">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 2xl:gap-20 items-center">
            {/* Hero content */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex-1 z-10"
            >
              <div className="inline-flex items-center gap-2 bg-primary-900/30 rounded-full px-4 py-2 lg:px-5 lg:py-2.5 2xl:px-6 2xl:py-3 text-sm lg:text-base 2xl:text-lg mb-6 lg:mb-8 2xl:mb-10 border border-primary-700/20">
                <Sparkles className="w-4 h-4 lg:w-5 lg:h-5 2xl:w-6 2xl:h-6 text-primary-400" />
                <span className="text-primary-300">The modern learning platform</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl 2xl:text-8xl font-bold leading-tight mb-6 lg:mb-8 2xl:mb-10">
                <span className="text-white">Courses for </span>
                <span className="bg-gradient-to-r from-primary-400 to-indigo-400 text-transparent bg-clip-text">modern learners</span>
              </h1>
              
              <p className="text-lg xl:text-xl 2xl:text-2xl text-customgreys-dirtyGrey mb-8 lg:mb-10 2xl:mb-12 max-w-2xl lg:max-w-3xl 2xl:max-w-4xl">
                Access high-quality courses when you need them. Enhance your skills, advance your career, and expand your knowledge with our expert-led content.
              </p>
              
              <div className="flex flex-wrap gap-4 lg:gap-5 2xl:gap-6">
                <Link href="/search" scroll={false}>
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-8 py-3 lg:px-10 lg:py-4 2xl:px-12 2xl:py-5 rounded-lg bg-gradient-to-r from-primary-700 to-primary-600 hover:from-primary-600 hover:to-primary-500 text-white shadow-lg shadow-primary-900/20 font-medium flex items-center gap-2 transition-all lg:text-lg 2xl:text-xl"
                  >
                    Explore courses <ChevronRight className="w-4 h-4 lg:w-5 lg:h-5 2xl:w-6 2xl:h-6" />
                  </motion.div>
                </Link>
                
                {!user && (
                  <Link href="/signup" scroll={false}>
                    <motion.div
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-8 py-3 lg:px-10 lg:py-4 2xl:px-12 2xl:py-5 rounded-lg bg-customgreys-secondarybg border border-customgreys-darkerGrey hover:bg-customgreys-darkerGrey/30 text-white font-medium flex items-center gap-2 transition-all lg:text-lg 2xl:text-xl"
                    >
                      Sign up free <ArrowRight className="w-4 h-4 lg:w-5 lg:h-5 2xl:w-6 2xl:h-6" />
                    </motion.div>
                  </Link>
                )}
              </div>
              
              <div className="mt-10 lg:mt-14 2xl:mt-16 flex items-center gap-4 lg:gap-5 2xl:gap-6">
                <div className="flex overflow-hidden">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className={`w-8 h-8 xl:w-10 xl:h-10 2xl:w-12 2xl:h-12 rounded-full border-2 border-customgreys-primarybg -ml-${i > 0 ? 3 : 0} overflow-hidden bg-gray-800 flex items-center justify-center text-xs xl:text-sm 2xl:text-base text-white`} style={{ marginLeft: i > 0 ? "-12px" : 0, zIndex: 4 - i }}>
                      {String.fromCharCode(65 + i)}
                    </div>
                  ))}
                </div>
                <div className="text-sm xl:text-base 2xl:text-lg">
                  <span className="text-primary-400 font-medium">500+</span> <span className="text-customgreys-dirtyGrey">students already enrolled</span>
                </div>
              </div>
            </motion.div>
            
            {/* Hero images */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex-1 relative z-10"
            >
              <div className="relative h-[400px] md:h-[450px] xl:h-[500px] 2xl:h-[600px] w-full max-w-[600px] lg:max-w-[700px] 2xl:max-w-[800px] mx-auto rounded-2xl overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-customgreys-darkerGrey/30 backdrop-blur-sm z-20 rounded-2xl overflow-hidden border border-customgreys-darkerGrey/50">
                  <div className="absolute top-0 left-0 w-full h-8 xl:h-10 2xl:h-12 bg-customgreys-darkerGrey flex items-center px-4 gap-2">
                    <div className="flex gap-1.5 lg:gap-2">
                      <div className="w-2.5 h-2.5 xl:w-3 xl:h-3 2xl:w-4 2xl:h-4 rounded-full bg-red-500"></div>
                      <div className="w-2.5 h-2.5 xl:w-3 xl:h-3 2xl:w-4 2xl:h-4 rounded-full bg-yellow-500"></div>
                      <div className="w-2.5 h-2.5 xl:w-3 xl:h-3 2xl:w-4 2xl:h-4 rounded-full bg-green-500"></div>
                    </div>
                  </div>
                  <div className="absolute top-8 xl:top-10 2xl:top-12 inset-x-0 bottom-0 overflow-hidden">
                    {["/hero1.jpg", "/hero2.jpg", "/hero3.jpg"].map((src, index) => (
                      <Image
                        key={src}
                        src={src}
                        alt={`Course Banner ${index + 1}`}
                        fill
                        priority={index === currentImage}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
                        className={cn(
                          "object-cover transition-opacity duration-1000", 
                          index === currentImage ? "opacity-100" : "opacity-0"
                        )}
                      />
                    ))}
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-customgreys-primarybg/80 to-transparent"></div>
                    
                    <div className="absolute bottom-0 left-0 right-0 p-6 xl:p-8 2xl:p-10">
                      <div className="text-xs xl:text-sm 2xl:text-base text-customgreys-dirtyGrey mb-2 lg:mb-3">FEATURED COURSE</div>
                      <h3 className="text-xl xl:text-2xl 2xl:text-3xl font-semibold text-white mb-2 lg:mb-3 2xl:mb-4">Modern Web Development</h3>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1 text-sm xl:text-base 2xl:text-lg text-yellow-400">
                          <Star className="w-4 h-4 xl:w-5 xl:h-5 2xl:w-6 2xl:h-6 fill-yellow-400 text-yellow-400" />
                          <Star className="w-4 h-4 xl:w-5 xl:h-5 2xl:w-6 2xl:h-6 fill-yellow-400 text-yellow-400" />
                          <Star className="w-4 h-4 xl:w-5 xl:h-5 2xl:w-6 2xl:h-6 fill-yellow-400 text-yellow-400" />
                          <Star className="w-4 h-4 xl:w-5 xl:h-5 2xl:w-6 2xl:h-6 fill-yellow-400 text-yellow-400" />
                          <Star className="w-4 h-4 xl:w-5 xl:h-5 2xl:w-6 2xl:h-6 fill-customgreys-darkerGrey text-customgreys-darkerGrey" />
                          <span className="ml-1 text-white">(4.0)</span>
                        </div>
                        <button className="rounded-full p-3 xl:p-4 2xl:p-5 bg-primary-600 hover:bg-primary-500 transition-colors">
                          <Play className="w-4 h-4 xl:w-5 xl:h-5 2xl:w-6 2xl:h-6 text-white" fill="white" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="max-w-[1600px] w-[95%] mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24 2xl:py-32">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true, amount: 0.3 }}
          className="text-center mb-12 lg:mb-16 2xl:mb-20"
        >
          <h2 className="text-3xl xl:text-4xl 2xl:text-5xl font-bold mb-4 lg:mb-6 2xl:mb-8 text-white">Why Learn With Us</h2>
          <p className="text-customgreys-dirtyGrey max-w-3xl lg:max-w-4xl 2xl:max-w-5xl mx-auto xl:text-lg 2xl:text-xl">
            Our platform combines expert instruction, modern learning techniques, and a supportive community to deliver the best educational experience.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8 2xl:gap-10">
          <FeatureCard 
            icon={BookOpen}
            title="Expert-Led Courses"
            description="Learn from industry leaders and subject matter experts with years of real-world experience."
          />
          <FeatureCard 
            icon={Users}
            title="Community Support"
            description="Connect with fellow learners, share insights, and solve challenges together."
          />
          <FeatureCard 
            icon={CheckCircle}
            title="Self-Paced Learning"
            description="Study at your own pace with lifetime access to course materials and resources."
          />
        </div>
      </section>
      
    
      
      {/* Course Section */}
      <section className="max-w-[1600px] w-[95%] mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24 2xl:py-32">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true, amount: 0.3 }}
          className="mb-12 lg:mb-16 2xl:mb-20"
        >
          <h2 className="text-3xl xl:text-4xl 2xl:text-5xl font-bold mb-4 lg:mb-6 2xl:mb-8 text-white">Featured Courses</h2>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 lg:gap-6">
            <p className="text-customgreys-dirtyGrey max-w-2xl lg:max-w-3xl 2xl:max-w-4xl xl:text-lg 2xl:text-xl">
              Explore our most popular courses designed to provide you with the skills needed in today's fast-evolving world.
            </p>
            
            <div className="flex flex-wrap gap-2 lg:gap-3 2xl:gap-4">
              {["Web Development", "Design", "Business", "Programming", "Marketing"].map((tag, index) => (
                <span key={index} className="px-3 py-1.5 lg:px-4 lg:py-2 2xl:px-5 2xl:py-2.5 bg-customgreys-secondarybg rounded-full text-sm xl:text-base 2xl:text-lg text-customgreys-dirtyGrey hover:bg-customgreys-darkGrey hover:text-white transition-colors cursor-pointer">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 xl:gap-8 2xl:gap-10">
          {coursesToShow.length > 0 ? (
            coursesToShow.map((course, index) => (
              <motion.div
                key={course.courseId || `course-${index}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true, amount: 0.3 }}
                className="h-full"
              >
                <CourseCardSearch
                  course={course}
                  onClick={() => handleCourseClick(course.courseId)}
                />
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 lg:py-16 2xl:py-20">
              <p className="text-customgreys-dirtyGrey xl:text-lg 2xl:text-xl">No courses found. Please check back soon for new content.</p>
            </div>
          )}
        </div>
        
        {coursesToShow.length > 0 && (
          <div className="mt-12 lg:mt-16 2xl:mt-20 text-center">
            <Link href="/search" scroll={false}>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 px-6 py-3 lg:px-8 lg:py-4 2xl:px-10 2xl:py-5 rounded-lg bg-customgreys-secondarybg border border-customgreys-darkerGrey hover:bg-customgreys-darkGrey/50 text-white font-medium transition-all xl:text-lg 2xl:text-xl"
              >
                View all courses <ArrowRight className="w-4 h-4 xl:w-5 xl:h-5 2xl:w-6 2xl:h-6" />
              </motion.div>
            </Link>
          </div>
        )}
      </section>
      
      {/* Testimonials Section */}
      <section className="max-w-[1600px] w-[95%] mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24 2xl:py-32">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true, amount: 0.3 }}
          className="text-center mb-12 lg:mb-16 2xl:mb-20"
        >
          <h2 className="text-3xl xl:text-4xl 2xl:text-5xl font-bold mb-4 lg:mb-6 2xl:mb-8 text-white">What Our Students Say</h2>
          <p className="text-customgreys-dirtyGrey max-w-3xl lg:max-w-4xl 2xl:max-w-5xl mx-auto xl:text-lg 2xl:text-xl">
            Read what students from around the world are saying about their experience with our platform.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8 2xl:gap-10">
          <Testimonial 
            quote="This platform has completely transformed my learning journey. The courses are well-structured and the instructors are extremely knowledgeable."
            author="Sarah Johnson"
            role="Web Developer"
            avatarUrl=""
          />
          <Testimonial 
            quote="I've taken multiple courses here and each one has provided me with valuable skills that I've been able to apply directly to my work."
            author="Michael Chen"
            role="Product Designer"
            avatarUrl=""
          />
          <Testimonial 
            quote="The community support is incredible. Whenever I had questions, other students and instructors were always ready to help."
            author="Emma Rodriguez"
            role="Marketing Specialist"
            avatarUrl=""
          />
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="max-w-[1600px] w-[95%] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 2xl:py-28">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true, amount: 0.3 }}
          className="relative rounded-2xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary-900 to-indigo-900 opacity-90"></div>
          <div className="absolute inset-0 bg-[url('/blog-pattern.svg')] bg-repeat opacity-10"></div>
        </motion.div>
      </section>
    </div>
  );
};

export default Landing;