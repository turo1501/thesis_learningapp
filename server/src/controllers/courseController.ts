import { Request, Response } from "express";
import Course from "../models/courseModel";
import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
import { getAuth } from "@clerk/express";
import axios from "axios";
import fs from 'fs';
import path from 'path';

// Configure AWS SDK
AWS.config.update({
  region: process.env.AWS_REGION || 'us-east-2',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  ...(process.env.NODE_ENV !== "production" && {
    endpoint: process.env.DYNAMODB_ENDPOINT || 'http://localhost:8000'
  })
});

const s3 = new AWS.S3();

// Add a helper function to check S3 configuration
const checkS3Config = () => {
  const requiredEnvVars = ['AWS_REGION', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'S3_BUCKET_NAME', 'CLOUDFRONT_DOMAIN'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error(`Missing required environment variables: ${missingVars.join(', ')}`);
    return false;
  }
  return true;
};

export const listCourses = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { category, teacherId } = req.query;
  try {
    let courses;
    
    if (teacherId && category && category !== "all") {
      // Filter by both teacherId and category
      courses = await Course.scan()
        .where("teacherId").eq(teacherId)
        .where("category").eq(category)
        .exec();
    } else if (teacherId) {
      // Filter only by teacherId
      courses = await Course.scan()
        .where("teacherId").eq(teacherId)
        .exec();
    } else if (category && category !== "all") {
      // Filter only by category
      courses = await Course.scan()
        .where("category").eq(category)
        .exec();
    } else {
      // No filters applied
      courses = await Course.scan().exec();
    }
    
    res.json({ message: "Courses retrieved successfully", data: courses });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving courses", error });
  }
};

export const getCourse = async (req: Request, res: Response): Promise<void> => {
  const { courseId } = req.params;
  try {
    const course = await Course.get(courseId);
    if (!course) {
      res.status(404).json({ message: "Course not found" });
      return;
    }

    res.json({ message: "Course retrieved successfully", data: course });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving course", error });
  }
};

export const createCourse = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { teacherId, teacherName } = req.body;

    if (!teacherId || !teacherName) {
      res.status(400).json({ message: "Teacher Id and name are required" });
      return;
    }

    const newCourse = new Course({
      courseId: uuidv4(),
      teacherId,
      teacherName,
      title: "Untitled Course",
      description: "",
      category: "Uncategorized",
      image: "",
      price: 0,
      level: "beginner",
      status: "Draft",
      sections: [],
      enrollments: [],
    });
    await newCourse.save();

    res.json({ message: "Course created successfully", data: newCourse });
  } catch (error) {
    res.status(500).json({ message: "Error creating course", error });
  }
};

export const updateCourse = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { courseId } = req.params;
  const updateData = { ...req.body };
  const { userId } = getAuth(req);

  try {
    const course = await Course.get(courseId);
    if (!course) {
      res.status(404).json({ message: "Course not found" });
      return;
    }

    if (course.teacherId !== userId) {
      res
        .status(403)
        .json({ message: "Not authorized to update this course " });
      return;
    }

    if (updateData.price) {
      const price = parseInt(updateData.price);
      if (isNaN(price)) {
        res.status(400).json({
          message: "Invalid price format",
          error: "Price must be a valid number",
        });
        return;
      }
      updateData.price = price * 100;
    }

    if (updateData.level) {
      const levelMap: { [key: string]: string } = {
        "Beginner": "beginner",
        "Intermediate": "intermediate",
        "Advanced": "advanced"
      };
      
      const normalizedLevel = updateData.level.charAt(0).toUpperCase() + updateData.level.slice(1).toLowerCase();
      const originalLevel = updateData.level;
      
      updateData.level = levelMap[normalizedLevel] || updateData.level.toLowerCase();
      
      console.log(`Normalized level from ${originalLevel} to ${updateData.level}`);
    }

    if (updateData.sections) {
      try {
        const sectionsData =
          typeof updateData.sections === "string"
            ? JSON.parse(updateData.sections)
            : updateData.sections;

        if (!Array.isArray(sectionsData)) {
          throw new Error("Sections must be an array");
        }

        updateData.sections = sectionsData.map((section: any) => {
          if (!Array.isArray(section.chapters)) {
            section.chapters = [];
          }

          return {
            ...section,
            sectionId: section.sectionId || uuidv4(),
            sectionTitle: section.sectionTitle || "",
            sectionDescription: section.sectionDescription || "",
            chapters: section.chapters.map((chapter: any) => {
              let videoValue = "";

              if (chapter.video) {
                if (typeof chapter.video === 'string') {
                  videoValue = chapter.video;
                } else if (typeof chapter.video === 'object' && 'url' in chapter.video) {
                  videoValue = chapter.video.url || "";
                }
              }

              return {
                ...chapter,
                chapterId: chapter.chapterId || uuidv4(),
                title: chapter.title || "",
                content: chapter.content || "",
                type: videoValue ? "Video" : "Text",
                video: videoValue,
              };
            }),
          };
        });
      } catch (error) {
        res.status(400).json({
          message: "Invalid sections data",
          error: error instanceof Error ? error.message : "Unknown error"
        });
        return;
      }
    }

    Object.assign(course, updateData);
    await course.save();

    res.json({ message: "Course updated successfully", data: course });
  } catch (error) {
    res.status(500).json({ message: "Error updating course", error });
  }
};

export const deleteCourse = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { courseId } = req.params;
  const { userId } = getAuth(req);

  try {
    const course = await Course.get(courseId);
    if (!course) {
      res.status(404).json({ message: "Course not found" });
      return;
    }

    if (course.teacherId !== userId) {
      res
        .status(403)
        .json({ message: "Not authorized to delete this course " });
      return;
    }

    await Course.delete(courseId);

    res.json({ message: "Course deleted successfully", data: course });
  } catch (error) {
    res.status(500).json({ message: "Error deleting course", error });
  }
};

export const getUploadVideoUrl = async (
  req: Request,
  res: Response
): Promise<void> => {
  console.log("getUploadVideoUrl called with body:", req.body);
  console.log("getUploadVideoUrl called with params:", req.params);
  
  // Lấy thông tin từ cả params và body
  // Trong route, chúng ta đã định nghĩa params nhưng client đang gửi qua body
  const courseId = req.params.courseId || req.body.courseId;
  const sectionId = req.params.sectionId || req.body.sectionId;
  const chapterId = req.params.chapterId || req.body.chapterId;
  const { fileName, fileType } = req.body;

  console.log(`Processing upload request for courseId=${courseId}, sectionId=${sectionId}, chapterId=${chapterId}`);

  // Validate required parameters
  if (!fileName || !fileType) {
    res.status(400).json({ message: "File name and type are required" });
    return;
  }

  if (!courseId || !sectionId || !chapterId) {
    res.status(400).json({ 
      message: "Course ID, section ID, and chapter ID are required",
      debug: {
        params: req.params,
        body: req.body
      }
    });
    return;
  }

  // Kiểm tra môi trường và cấu hình
  const isDevelopment = process.env.NODE_ENV !== 'production';
  const hasAwsConfig = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && process.env.S3_BUCKET_NAME;
  const useLocalStorage = process.env.USE_LOCAL_VIDEO_STORAGE === 'true' || isDevelopment; // Mặc định dùng local storage trong development
  
  // Nếu sử dụng local storage
  if (useLocalStorage) {
    console.log("Using local storage for video upload");
    
    // Tạo URL cho local upload endpoint
    const localUploadUrl = `/api/courses/${courseId}/sections/${sectionId}/chapters/${chapterId}/upload-video`;
    const uniqueId = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = `${courseId}_${sectionId}_${chapterId}_${uniqueId}_${fileName.replace(/\s+/g, '_')}`;
    // Generate video URL for serving - use backend server URL
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8001';
    const localVideoUrl = `${backendUrl}/courses/local-video/${filename}`;
    
    console.log("Local upload URL:", localUploadUrl);
    console.log("Local video URL:", localVideoUrl);
    
    res.json({
      message: "Local upload URL generated successfully",
      data: { 
        uploadUrl: localUploadUrl, 
        videoUrl: localVideoUrl,
        isLocal: true,
        filename: filename
      }
    });
    return;
  }
  
  // Nếu là development và không có AWS config, sử dụng mock URL
  if (isDevelopment && !hasAwsConfig) {
    console.log("Running in development mode without AWS config, using mock URLs");
    
    const uniqueId = uuidv4();
    const mockS3Key = `courses/${courseId}/sections/${sectionId}/chapters/${chapterId}/${uniqueId}-${fileName.replace(/\s+/g, '_')}`;
    
    // Tạo mock URL cho local development
    const mockUploadUrl = `/mock-upload/${mockS3Key}`;
    const mockVideoUrl = `/mock-video/${mockS3Key}`;
    
    console.log("Mock upload URL:", mockUploadUrl);
    console.log("Mock video URL:", mockVideoUrl);
    
    res.json({
      message: "Mock upload URL generated successfully for development",
      data: { 
        uploadUrl: mockUploadUrl, 
        videoUrl: mockVideoUrl,
        isMock: true 
      }
    });
    return;
  }
  
  // Nếu không phải development hoặc có AWS config, tiếp tục với S3
  try {
    // Kiểm tra S3 configuration
    if (!checkS3Config()) {
    res.status(500).json({ 
      message: "Server configuration error", 
        error: "S3 is not properly configured" 
    });
    return;
  }

    const bucketName = process.env.S3_BUCKET_NAME;
    const cloudfrontDomain = process.env.CLOUDFRONT_DOMAIN;
    
    const uniqueId = uuidv4();
    // Tạo cấu trúc đường dẫn có tổ chức cho videos
    const s3Key = `courses/${courseId}/sections/${sectionId}/chapters/${chapterId}/${uniqueId}-${fileName.replace(/\s+/g, '_')}`;

    console.log(`Generating presigned URL for S3 upload: ${s3Key}`);

    const s3Params = {
      Bucket: bucketName,
      Key: s3Key,
      Expires: 300, // 5 phút để cho phép upload file lớn
      ContentType: fileType,
    };

    try {
    const uploadUrl = s3.getSignedUrl("putObject", s3Params);
      const videoUrl = `${cloudfrontDomain}/${s3Key}`;

      console.log("Upload URL generated successfully");
      console.log("Video URL will be:", videoUrl);

    res.json({
      message: "Upload URL generated successfully",
        data: { 
          uploadUrl, 
          videoUrl,
          isMock: false 
        }
      });
    } catch (s3Error) {
      console.error("S3 getSignedUrl error:", s3Error);
      res.status(500).json({ 
        message: "Error generating S3 signed URL", 
        error: s3Error instanceof Error ? s3Error.message : "Unknown S3 error" 
      });
    }
  } catch (error) {
    console.error("Error in getUploadVideoUrl:", error);
    res.status(500).json({ 
      message: "Error generating upload URL", 
      error: error instanceof Error ? error.message : "Unknown error" 
    });
  }
};

// Add a delay function to simulate API latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock OpenAI response for development mode
const generateMockAIResponse = async (topicTitle: string, difficultyLevel: string, courseLength: string) => {
  console.log("Using mock OpenAI response for development");
  
  // Simulate API latency (500-1500ms)
  await delay(Math.random() * 1000 + 500);
  
  // Add error simulation with 5% probability for testing error handling
  const shouldSimulateError = Math.random() < 0.05;
  if (shouldSimulateError) {
    const errorTypes = [
      { message: "API rate limit exceeded. Please try again later.", code: "rate_limit_exceeded" },
      { message: "The server is overloaded or not ready yet.", code: "server_overloaded" },
      { message: "Invalid authentication token.", code: "invalid_api_key" },
    ];
    const randomError = errorTypes[Math.floor(Math.random() * errorTypes.length)];
    throw new Error(JSON.stringify({
      error: {
        message: randomError.message,
        type: "api_error",
        code: randomError.code
      }
    }));
  }
  
  try {
    // Validate input
    if (!topicTitle || topicTitle.trim().length < 3) {
      throw new Error("Topic title is too short or missing");
    }
    
    // Generate more creative title variations
    const titleFormats = [
      `Mastering ${topicTitle}: A Comprehensive Guide`,
      `The Complete ${topicTitle} Masterclass`,
      `${topicTitle} Essentials: From Fundamentals to Expertise`,
      `Advanced ${topicTitle}: Professional Techniques & Strategies`,
      `${topicTitle} in Practice: Real-world Applications`,
      `The Ultimate ${topicTitle} Blueprint`,
      `${topicTitle}: A Modern Approach`,
      `Innovative ${topicTitle}: Breaking New Ground`
    ];
    
    // Choose a title format based on the difficulty level and a bit of randomness
    let titleIndex = Math.floor(Math.random() * titleFormats.length);
    if (difficultyLevel === "beginner") {
      // Prefer beginner-friendly titles
      titleIndex = Math.min(2, titleIndex);
    } else if (difficultyLevel === "advanced") {
      // Prefer advanced-sounding titles
      titleIndex = Math.max(3, titleIndex);
    }
    
    const title = titleFormats[titleIndex];
    
    // Create more detailed, educational-focused description
    const descriptionIntros = [
      `Dive deep into the world of ${topicTitle} with this meticulously crafted course.`,
      `Embark on a learning journey through ${topicTitle} that will transform your understanding and skills.`,
      `Unlock your potential in ${topicTitle} with this comprehensive, evidence-based curriculum.`,
      `Discover the art and science of ${topicTitle} through expert instruction and practical application.`
    ];
    
    const descriptionMiddles = [
      `Built on modern educational principles, this course combines theoretical knowledge with hands-on practice to ensure deep comprehension and skill retention.`,
      `Using a unique blend of conceptual frameworks and practical exercises, you'll develop both fundamental understanding and advanced competencies.`,
      `Following the latest research in effective learning, this course employs spaced repetition, active recall, and project-based methodologies to maximize your learning outcomes.`,
      `Structured around real-world scenarios and challenges, you'll learn to apply ${topicTitle} concepts in practical, impactful ways.`
    ];
    
    const descriptionEndings = [
      `By the end of this course, you'll possess both the theoretical knowledge and practical skills to excel in ${topicTitle} and continue your growth independently.`,
      `Whether you're pursuing personal enrichment or professional advancement, this course provides the comprehensive foundation and specialized insights you need to succeed.`,
      `Join a community of learners and put your new skills into practice immediately with our carefully designed projects and peer collaboration opportunities.`,
      `Future-proof your knowledge with cutting-edge content that anticipates emerging trends and prepares you for the evolving landscape of ${topicTitle}.`
    ];
    
    const description = `${descriptionIntros[Math.floor(Math.random() * descriptionIntros.length)]} ${descriptionMiddles[Math.floor(Math.random() * descriptionMiddles.length)]} ${descriptionEndings[Math.floor(Math.random() * descriptionEndings.length)]}`;
    
    // Determine number of sections based on course length
    let sectionCount = 4; // default for medium
    if (courseLength === "short") sectionCount = 3;
    if (courseLength === "long") sectionCount = 7;
    
    // Enhanced section templates for different topics
    const programmingSections = [
      {title: "Foundations & Core Concepts", desc: "Master the essential principles and building blocks"},
      {title: "Data Structures & Algorithms", desc: "Learn efficient ways to organize and manipulate data"},
      {title: "Object-Oriented Design", desc: "Apply modern design patterns for maintainable code"},
      {title: "Testing & Debug Strategies", desc: "Ensure reliability with comprehensive testing approaches"},
      {title: "Performance Optimization", desc: "Techniques for speed and resource efficiency"},
      {title: "API Development & Integration", desc: "Create robust interfaces for system communication"},
      {title: "Security Best Practices", desc: "Protect systems against common vulnerabilities"},
      {title: "Deployment & DevOps", desc: "Streamline deployment with modern CI/CD pipelines"},
      {title: "Advanced Patterns & Architectures", desc: "Scale your solutions with sophisticated design"}
    ];
    
    const businessSections = [
      {title: "Market Analysis & Strategy", desc: "Techniques for identifying opportunities and positioning"},
      {title: "Business Model Innovation", desc: "Design sustainable and scalable business models"},
      {title: "Customer Acquisition Frameworks", desc: "Systematic approaches to growing your customer base"},
      {title: "Metrics & Growth Analytics", desc: "Measure what matters and drive data-informed decisions"},
      {title: "Operational Excellence", desc: "Optimize processes for efficiency and quality"},
      {title: "Financial Planning & Analysis", desc: "Master the numbers that drive business success"},
      {title: "Leadership & Team Building", desc: "Build high-performing teams that execute effectively"},
      {title: "Scaling & Expansion Strategies", desc: "Navigate the challenges of growth and expansion"},
      {title: "Competitive Positioning", desc: "Differentiate and defend against market competitors"}
    ];
    
    const creativeSkillsSections = [
      {title: "Fundamental Principles", desc: "Master the timeless principles that underpin great work"},
      {title: "Technical Toolset & Workflows", desc: "Build efficiency with professional tools and processes"},
      {title: "Creative Process & Ideation", desc: "Generate innovative ideas systematically"},
      {title: "Style Development", desc: "Find and refine your unique creative voice"},
      {title: "Audience & User Psychology", desc: "Create work that resonates and connects deeply"},
      {title: "Feedback & Iteration", desc: "Refine your work through structured improvement cycles"},
      {title: "Professional Standards & Delivery", desc: "Meet industry expectations with polished output"},
      {title: "Portfolio Development", desc: "Showcase your skills effectively to clients and employers"},
      {title: "Collaboration & Client Management", desc: "Navigate professional relationships successfully"}
    ];
    
    const generalKnowledgeSections = [
      {title: "Historical Context & Evolution", desc: "Understand the origins and development of key concepts"},
      {title: "Theoretical Frameworks", desc: "Explore the intellectual foundations of the subject"},
      {title: "Practical Applications", desc: "Apply knowledge in real-world contexts"},
      {title: "Critical Analysis Methods", desc: "Develop structured approaches to evaluation"},
      {title: "Current Trends & Future Directions", desc: "Navigate the cutting edge of the field"},
      {title: "Interdisciplinary Connections", desc: "Explore relationships with adjacent domains"},
      {title: "Research Methodologies", desc: "Design and conduct effective investigations"},
      {title: "Case Studies & Examples", desc: "Learn from detailed examination of notable instances"},
      {title: "Ethical Considerations", desc: "Navigate complex moral and ethical dimensions"}
    ];
    
    // Choose appropriate sections based on topic
    let sectionTemplates = generalKnowledgeSections;
    let category = "Education";
    
    const lcTopic = topicTitle.toLowerCase();
    if (lcTopic.includes("program") || 
        lcTopic.includes("code") ||
        lcTopic.includes("develop") ||
        lcTopic.includes("web") ||
        lcTopic.includes("app") ||
        lcTopic.includes("software") ||
        lcTopic.includes("data")) {
      sectionTemplates = programmingSections;
      category = "Programming";
    } else if (lcTopic.includes("market") || 
              lcTopic.includes("brand") ||
              lcTopic.includes("business") ||
              lcTopic.includes("sales") ||
              lcTopic.includes("entrepreneur") ||
              lcTopic.includes("strategy") ||
              lcTopic.includes("finance")) {
      sectionTemplates = businessSections;
      category = "Business";
    } else if (lcTopic.includes("design") ||
               lcTopic.includes("art") ||
               lcTopic.includes("music") ||
               lcTopic.includes("write") ||
               lcTopic.includes("creative") ||
               lcTopic.includes("photo") ||
               lcTopic.includes("video")) {
      sectionTemplates = creativeSkillsSections;
      category = "Design";
    }
    
    // Shuffle and select sections based on course length
    const shuffledSections = [...sectionTemplates]
      .sort(() => 0.5 - Math.random())
      .slice(0, sectionCount);
    
    // Make sure we always include an introductory section
    const introSection = {
      title: "Introduction & Core Principles", 
      desc: `Establish a solid foundation in ${topicTitle} fundamentals`
    };
    
    // Put the intro section first, then add the shuffled sections
    const selectedSections = [introSection, ...shuffledSections.slice(0, sectionCount - 1)];
    
    // Generate price based on level, length, and topic category
    let price = 49; // default base price
    if (difficultyLevel === "intermediate") price = 79;
    if (difficultyLevel === "advanced") price = 99;
    if (courseLength === "long") price += 20;
    if (courseLength === "short") price -= 10;
    
    // Adjust price based on category
    if (category === "Programming" || category === "Business") {
      price += 10; // Higher value perception for these categories
    }
    
    // Add slight price randomization for uniqueness
    price = Math.round(price * (0.95 + Math.random() * 0.15));
    
    // Create mock response object with improved structure
    const mockResponse: {
      title: string;
      description: string;
      category: string;
      price: string;
      level: string;
      sections: Array<{
        sectionTitle: string;
        sectionDescription: string;
        chapters: Array<{
          title: string;
          content: string;
          type: string;
        }>;
      }>;
    } = {
      title: title,
      description: description,
      category: category,
      price: price.toString(),
      level: difficultyLevel,
      sections: []
    };
    
    // Learning approaches to vary chapter content
    const learningApproaches = [
      "Theory-first with practical examples",
      "Case study analysis with guided reflection",
      "Project-based learning with iterative feedback",
      "Interactive problem-solving scenarios",
      "Comparative analysis of different methods",
      "Demonstration-practice-reflection cycle"
    ];
    
    // Generate sections with enhanced chapters
    for (let i = 0; i < selectedSections.length; i++) {
      const section = selectedSections[i];
      const chapterCount = Math.floor(Math.random() * 2) + 2; // 2-3 chapters per section
      const chapters = [];
      
      // Choose a learning approach for this section
      const approach = learningApproaches[Math.floor(Math.random() * learningApproaches.length)];
      
      for (let j = 0; j < chapterCount; j++) {
        // Create more specific chapter titles
        let chapterTitle = "";
        if (j === 0) {
          chapterTitle = `Fundamentals of ${section.title}`;
        } else if (j === chapterCount - 1) {
          chapterTitle = `Advanced ${section.title} Techniques`;
        } else {
          const middleTitles = [
            `Key Principles in ${section.title}`,
            `Essential ${section.title} Strategies`,
            `${section.title} in Practice`,
            `Applying ${section.title} Concepts`
          ];
          chapterTitle = middleTitles[Math.floor(Math.random() * middleTitles.length)];
        }
        
        // Generate more structured, educational content
        const content = `
## ${chapterTitle}

This chapter explores ${section.title.toLowerCase()} as a crucial component of ${topicTitle}. Using a ${approach.toLowerCase()} approach, we'll build your understanding from fundamental concepts to practical application.

### Key Learning Objectives

After completing this chapter, you will be able to:
- Identify and explain the core elements of ${section.title.toLowerCase()}
- Apply ${section.title.toLowerCase()} principles to solve common challenges in ${topicTitle}
- Evaluate different approaches and select optimal solutions
- Implement best practices for real-world scenarios

### Conceptual Framework

${section.title} provides a structured approach to ${topicTitle} by organizing complex ideas into manageable components. We'll examine how these concepts evolved and why they remain relevant in today's context.

The relationship between theory and practice is critical here - each theoretical concept will be immediately followed by practical examples and exercises to reinforce your learning.

### Practical Applications

Through a series of guided activities, you'll apply these concepts to increasingly complex scenarios. This scaffolded approach ensures you build confidence while developing nuanced understanding.

We'll analyze several case studies where ${section.title.toLowerCase()} principles have been successfully implemented, as well as examples where poor implementation led to suboptimal outcomes.

### Assessment and Reflection

Each section concludes with reflection questions to deepen your understanding and help you connect these concepts to your personal or professional context. The accompanying exercises will help you measure your progress and identify areas for further development.

Remember, mastery comes through deliberate practice and application. Take time to work through the examples thoroughly rather than rushing to complete them.
        `;
        
        chapters.push({
          title: chapterTitle,
          content: content,
          type: "Text"
        });
      }
      
      mockResponse.sections.push({
        sectionTitle: section.title,
        sectionDescription: section.desc,
        chapters: chapters
      });
    }
    
    console.log("Mock AI response generated successfully");
    return mockResponse;
  } catch (error) {
    console.error("Error in mock OpenAI generation:", error);
    throw error;
  }
};

// Deepseek API client function
async function generateWithDeepseek(prompt: string) {
  try {
    const deepseekApiKey = process.env.DEEPSEEK_API_KEY;
    if (!deepseekApiKey) {
      throw new Error("DEEPSEEK_API_KEY not configured in environment variables");
    }

    console.log("Making request to Deepseek API...");
    const response = await axios.post(
      "https://api.deepseek.com/v1/chat/completions",
      {
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: "You are a course creation assistant that specializes in creating high-quality educational content."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 4000,
        top_p: 0.95,
        frequency_penalty: 0.1,
        presence_penalty: 0.1
      },
      {
        headers: {
          "Authorization": `Bearer ${deepseekApiKey}`,
          "Content-Type": "application/json",
        },
        timeout: 60000 // 60 second timeout
      }
    );

    if (!response.data || !response.data.choices || !response.data.choices[0]) {
      throw new Error("Invalid response from Deepseek API");
    }

    console.log("Deepseek API response received successfully");
    const content = response.data.choices[0].message.content.trim();
    
    // Handle possible JSON formatting issues - sometimes AI wraps JSON in markdown code blocks
    let parsedContent;
    try {
      parsedContent = JSON.parse(content);
    } catch (parseError) {
      // Try to extract JSON if it's wrapped in markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        try {
          parsedContent = JSON.parse(jsonMatch[1].trim());
        } catch (innerParseError) {
          console.error("Failed to parse JSON from markdown block:", innerParseError);
          throw new Error("Failed to parse response from Deepseek API");
        }
      } else {
        console.error("Failed to parse JSON response:", parseError);
        throw new Error("Invalid JSON response from Deepseek API");
      }
    }
    
    return parsedContent;
  } catch (error: any) {
    console.error("Deepseek API error:", error.response?.data || error.message);
    
    // Enhanced error handling with more specific properties
    const errorData: any = {
      message: error.response?.data?.error?.message || error.message,
      type: error.response?.data?.error?.type || "api_error",
      code: error.response?.data?.error?.code || "unknown_error"
    };
    
    // Check specifically for "Insufficient Balance" error
    if (error.response?.data?.error?.message === "Insufficient Balance") {
      errorData.code = "insufficient_balance";
      errorData.message = "Insufficient Balance in Deepseek account. Please add credits.";
    }
    // Handle specific Deepseek error codes
    else if (error.response?.status === 429) {
      errorData.code = "rate_limit_exceeded";
      errorData.message = "Deepseek API rate limit exceeded. Please try again later.";
    } else if (error.response?.status === 401 || error.response?.status === 403) {
      errorData.code = "invalid_api_key";
      errorData.message = "Invalid Deepseek API key or insufficient permissions.";
    } else if (error.response?.status === 404) {
      errorData.code = "model_not_found";
      errorData.message = "The specified Deepseek model was not found.";
    } else if (error.response?.status >= 500) {
      errorData.code = "server_error";
      errorData.message = "Deepseek API server error. Please try again later.";
    } else if (error.code === "ECONNABORTED") {
      errorData.code = "timeout";
      errorData.message = "Request to Deepseek API timed out. The service might be experiencing high load.";
    }
    
    throw new Error(JSON.stringify(errorData));
  }
}

// Use the function below when trying to fallback to mock data if Deepseek API is unavailable
const fallbackToMockGenerator = async (topicTitle: string, difficultyLevel: string, courseLength: string) => {
  console.log("Falling back to mock generator due to Deepseek API unavailability");
  try {
    // Add a small delay to ensure proper flow in logs
    await delay(300);
    
    // Generate content with more robust error handling
    const mockContent = await generateMockAIResponse(topicTitle, difficultyLevel, courseLength);
    
    // Verify the response structure
    if (!mockContent || typeof mockContent !== 'object') {
      throw new Error("Invalid response format from mock generator");
    }
    
    // Validate essential fields
    if (!mockContent.title || !mockContent.description || !mockContent.sections) {
      throw new Error("Mock generator returned incomplete course structure");
    }
    
    console.log("Mock AI response generated successfully");
    return mockContent;
  } catch (mockError: any) {
    console.error("Mock generator fallback also failed:", mockError);
    throw mockError;
  }
};

// Add a function to track and learn from successful course generations
const trackAILearning = async (input: any, output: any) => {
  try {
    // Create a learning directory if it doesn't exist
    const learningDir = path.join(__dirname, '../../ai-learning');
    if (!fs.existsSync(learningDir)) {
      fs.mkdirSync(learningDir, { recursive: true });
    }
    
    // Create a new learning entry
    const learningEntry = {
      timestamp: Date.now(),
      input,
      output,
      feedback: null // To be filled later with user feedback
    };
    
    // Save to a JSON file with a timestamp
    const filename = path.join(learningDir, `learning-${Date.now()}.json`);
    fs.writeFileSync(filename, JSON.stringify(learningEntry, null, 2));
    
    console.log('AI learning data saved:', filename);
    
    // Periodically analyze learning data to improve the AI system
    // This is just a placeholder for future implementation
    if (Math.random() < 0.1) { // 10% chance to analyze on each generation
      analyzeAndImproveAI();
    }
    
    return true;
  } catch (error) {
    console.error('Error tracking AI learning:', error);
    return false;
  }
};

// Function to analyze past learning data and improve the AI system
const analyzeAndImproveAI = async () => {
  try {
    const learningDir = path.join(__dirname, '../../ai-learning');
    if (!fs.existsSync(learningDir)) return;
    
    const files = fs.readdirSync(learningDir).filter(f => f.startsWith('learning-'));
    if (files.length < 10) return; // Wait until we have enough data
    
    console.log(`Analyzing ${files.length} learning entries to improve AI...`);
    
    // This would typically involve more sophisticated analysis
    // For now, we're just demonstrating the concept
    
    // Example of how we could adjust the AI based on patterns found in data
    const patternData = {
      lastAnalyzed: Date.now(),
      entriesAnalyzed: files.length,
      insights: {
        popularTopics: ['Programming', 'Marketing', 'Design'],
        averageSectionCount: 5,
        optimalPriceRanges: {
          beginner: 2500,
          intermediate: 5000, 
          advanced: 7500
        }
      }
    };
    
    // Save the analysis results
    fs.writeFileSync(
      path.join(learningDir, 'ai-insights.json'), 
      JSON.stringify(patternData, null, 2)
    );
    
    console.log('AI system improvements analyzed and saved');
  } catch (error) {
    console.error('Error analyzing AI learning data:', error);
  }
};

// Function to load past AI insights to improve current generation
const loadAIInsights = () => {
  try {
    const insightsPath = path.join(__dirname, '../../ai-learning/ai-insights.json');
    if (fs.existsSync(insightsPath)) {
      const insights = JSON.parse(fs.readFileSync(insightsPath, 'utf8'));
      return insights;
    }
  } catch (error) {
    console.error('Error loading AI insights:', error);
  }
  
  // Return default insights if none are found
  return {
    insights: {
      popularTopics: [],
      averageSectionCount: 5,
      optimalPriceRanges: {
        beginner: 2500,
        intermediate: 5000,
        advanced: 7500
      }
    }
  };
};

export const generateAICourse = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { 
      topicTitle, 
      targetAudience, 
      difficultyLevel,
      keyPoints,
      courseLength,
      teacherId,
      teacherName
    } = req.body;

    if (!topicTitle) {
      res.status(400).json({ message: "Topic title is required" });
      return;
    }

    if (!teacherId || !teacherName) {
      res.status(400).json({ message: "Teacher Id and name are required" });
      return;
    }

    // Check if we're in development mode to use mock data
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    // Check if Deepseek API key is configured
    const hasDeepseekApiKey = !!process.env.DEEPSEEK_API_KEY;
    if (!hasDeepseekApiKey && !isDevelopment) {
      // In production, we need the API key
      res.status(503).json({ 
        message: "AI service configuration error", 
        error: "Deepseek API key not configured",
        details: {
          code: "missing_api_key",
          message: "The server is missing the Deepseek API key configuration. Please contact the administrator."
        }
      });
      return;
    }

    const useMockData = isDevelopment && !hasDeepseekApiKey;
    
    // Load AI insights to improve generation
    const aiInsights = loadAIInsights();
    
    let generatedContent;
    
    try {
      if (useMockData) {
        // Use mock data in development without API key
        try {
          generatedContent = await generateMockAIResponse(
            topicTitle, 
            difficultyLevel || "beginner", 
            courseLength || "medium"
          );
        } catch (mockError: any) {
          console.error("Mock AI generation error:", mockError);
          
          // Parse error from mock generator (which is stringified JSON)
          let errorMessage = "Unknown error in mock AI generation";
          let errorDetails = {};
          let statusCode = 500;
          
          try {
            const parsedError = JSON.parse(mockError.message);
            if (parsedError.error) {
              errorMessage = parsedError.error.message || "Mock AI error";
              errorDetails = parsedError;
              
              // Set appropriate status code based on error type
              if (parsedError.error.code === "rate_limit_exceeded") {
                statusCode = 429; // Too Many Requests
              } else if (parsedError.error.code === "invalid_api_key") {
                statusCode = 401; // Unauthorized
              }
            }
          } catch (parseError) {
            // If not parseable JSON, just use the error message directly
            errorMessage = mockError.message;
          }
          
          res.status(statusCode).json({
            message: "Error using AI service",
            error: errorMessage,
            details: errorDetails
          });
          return;
        }
      } else {
        // Create enhanced prompt for the AI with specific instructions for better structured output
        // Include insights from previous generations to improve quality
        const prompt = `
        Create a comprehensive curriculum for a course titled "${topicTitle}".
        Target audience: ${targetAudience || "General audience"}
        Difficulty level: ${difficultyLevel || "beginner"}
        Key topics to cover: ${keyPoints || "Cover the essential concepts"}
        Course length: ${courseLength || "Medium (4-6 sections)"}
        
        ${aiInsights.insights.popularTopics.length > 0 ? 
          `Note that these topics have been particularly successful in similar courses: ${aiInsights.insights.popularTopics.join(', ')}` 
          : ''}
        
        I need you to act as an expert curriculum designer with deep knowledge of both pedagogy and the subject matter. 
        Apply these advanced instructional design principles:
        1. Use Bloom's Taxonomy to ensure a progression of cognitive skills
        2. Incorporate active learning techniques and practical exercises
        3. Build in spaced repetition for key concepts
        4. Design for multiple learning styles (visual, auditory, kinesthetic)
        5. Create opportunities for knowledge application and critical thinking
        
        Please structure the response as a JSON object with the following format:
        {
          "title": "Catchy, professional title for the course",
          "description": "Engaging course description (at least 100 words)",
          "category": "Best category for this course from these options: Programming, Design, Business, Marketing, Personal Development, Health, Education, Photography, Music, Cooking",
          "price": "Suggested price in USD (integer, no currency symbol)",
          "level": "beginner, intermediate, or advanced",
          "sections": [
            {
              "sectionTitle": "Section title",
              "sectionDescription": "Brief description of this section",
              "chapters": [
                {
                  "title": "Chapter title",
                  "content": "Detailed content for this chapter (at least 200 words)",
                  "type": "Text"
                }
              ]
            }
          ]
        }

        Remember to:
        1. Structure the content clearly with a logical progression from fundamentals to advanced concepts
        2. Include practical examples, exercises, and assessments within the chapter content
        3. Make sure each chapter has sufficient detail (at least 200 words)
        4. Use professional, engaging language appropriate for the target audience level
        5. Balance theoretical knowledge with practical applications
        6. Include opportunities for reflection and self-assessment
        7. Return ONLY valid JSON that matches the schema exactly
        `;

        try {
          // Use Deepseek model instead of OpenAI
          generatedContent = await generateWithDeepseek(prompt);
        } catch (apiError: any) {
          // Handle API errors
          console.error("Deepseek API Error:", apiError);
          
          let errorMessage = "Error communicating with AI service";
          let errorDetails = {};
          let statusCode = 500;
          
          try {
            // Try to parse the error if it's a string
            if (typeof apiError.message === 'string') {
              const parsedError = JSON.parse(apiError.message);
              errorMessage = parsedError.message || "Unknown AI service error";
              errorDetails = parsedError;
              
              // Set appropriate status codes based on error types
              if (parsedError.code === "insufficient_quota" || 
                  parsedError.code === "rate_limit_exceeded") {
                statusCode = 429; // Too Many Requests
              } else if (parsedError.code === "invalid_api_key") {
                statusCode = 401; // Unauthorized
              } else if (parsedError.code === "model_not_found") {
                statusCode = 404; // Not Found
              } else if (parsedError.code === "timeout") {
                statusCode = 408; // Request Timeout
              } else if (parsedError.code === "insufficient_balance") {
                statusCode = 402; // Payment Required
                errorMessage = "Insufficient Balance";
              }
            }
          } catch (parseError) {
            // If not parseable JSON, just use the error message directly
            errorMessage = apiError.message || "Unknown error";
          }
          
          // If in development mode and Deepseek fails, try to fall back to mock generator
          if (isDevelopment) {
            try {
              console.log("Attempting fallback to mock generator after Deepseek failure");
              generatedContent = await fallbackToMockGenerator(
                topicTitle,
                difficultyLevel || "beginner",
                courseLength || "medium"
              );
              // If we reach here, the mock generator succeeded
              console.log("Successfully fell back to mock generator");
            } catch (fallbackError) {
              // If fallback also fails, return the original error
              console.error("Both Deepseek and fallback failed:", fallbackError);
              res.status(statusCode).json({
                message: "Error using AI service",
                error: errorMessage,
                details: errorDetails
              });
              return;
            }
          } else {
            // In production, just return the error
            res.status(statusCode).json({
              message: "Error using AI service",
              error: errorMessage,
              details: errorDetails
            });
            return;
          }
        }
      }

      // Create the course with generated content
      const newCourse = new Course({
        courseId: uuidv4(),
        teacherId,
        teacherName,
        title: generatedContent.title,
        description: generatedContent.description,
        category: generatedContent.category,
        image: "", // Default empty image, will be updated later
        price: parseInt(generatedContent.price) * 100, // Convert to cents
        level: generatedContent.level.toLowerCase(),
        status: "Draft",
        sections: generatedContent.sections.map((section: any) => ({
          sectionId: uuidv4(),
          sectionTitle: section.sectionTitle,
          sectionDescription: section.sectionDescription,
          chapters: section.chapters.map((chapter: any) => ({
            chapterId: uuidv4(),
            title: chapter.title,
            content: chapter.content,
            type: chapter.type || "Text",
            video: "",
            comments: []
          }))
        })),
        enrollments: [],
      });

      await newCourse.save();
      console.log("AI-generated course saved successfully");

      // Track this successful generation for AI learning
      trackAILearning({
        topicTitle, 
        targetAudience, 
        difficultyLevel,
        keyPoints,
        courseLength
      }, {
        title: generatedContent.title,
        description: generatedContent.description,
        category: generatedContent.category,
        price: generatedContent.price,
        level: generatedContent.level,
        sectionCount: generatedContent.sections.length,
        chapterCount: generatedContent.sections.reduce((acc: number, s: any) => acc + s.chapters.length, 0)
      });

      res.json({ 
        message: "AI course created successfully", 
        data: newCourse 
      });
    } catch (error) {
      console.error("Error in AI course generation:", error);
      res.status(500).json({ 
        message: "Error generating AI course", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  } catch (error) {
    console.error("Error in AI course generation:", error);
    res.status(500).json({ 
      message: "Error generating AI course", 
      error: error instanceof Error ? error.message : "Unknown error" 
    });
  }
};

// Function to check Deepseek account status
export const checkDeepseekStatus = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    // Check if we're in development mode
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    // Check if Deepseek API key is configured
    const hasDeepseekApiKey = !!process.env.DEEPSEEK_API_KEY;
    
    if (!hasDeepseekApiKey) {
      if (isDevelopment) {
        // In development, we can operate with mock data
        res.json({ 
          message: "Deepseek status check",
          status: "development_mode",
          usingMock: true,
          apiKeyConfigured: false,
          details: "Using mock AI generator in development mode"
        });
      } else {
        // In production, we need the API key
        res.status(503).json({ 
          message: "AI service configuration error", 
          status: "missing_api_key",
          usingMock: false,
          apiKeyConfigured: false,
          details: "The server is missing the Deepseek API key configuration"
        });
      }
      return;
    }
    
    // Make a minimal API call to check status
    try {
      // This sends a simple message to test the API connection
      const deepseekApiKey = process.env.DEEPSEEK_API_KEY;
      const response = await axios.post(
        "https://api.deepseek.com/v1/chat/completions",
        {
          model: "deepseek-chat",
          messages: [
            {
              role: "user",
              content: "Hello"
            }
          ],
          max_tokens: 10
        },
        {
          headers: {
            "Authorization": `Bearer ${deepseekApiKey}`,
            "Content-Type": "application/json",
          },
          timeout: 10000 // 10 second timeout
        }
      );
      
      // If we get here, the API is working
      res.json({
        message: "Deepseek API is operational",
        status: "operational",
        usingMock: false,
        apiKeyConfigured: true,
        details: {
          model: "deepseek-chat",
          usage: response.data.usage
        }
      });
    } catch (error: any) {
      // Check for specific errors
      let status = "error";
      let details = "Unknown error checking Deepseek API status";
      
      if (error.response?.data?.error) {
        const apiError = error.response.data.error;
        
        if (apiError.message === "Insufficient Balance") {
          status = "insufficient_balance";
          details = "The Deepseek account has insufficient credits. Please add credits to continue.";
        } else if (error.response.status === 401 || error.response.status === 403) {
          status = "authentication_error";
          details = "The Deepseek API key is invalid or revoked.";
        } else if (error.response.status === 429) {
          status = "rate_limited";
          details = "The Deepseek API is currently rate limited. Please try again later.";
        } else {
          status = "api_error";
          details = apiError.message || "Deepseek API error";
        }
      } else if (error.code === "ECONNABORTED") {
        status = "timeout";
        details = "Connection to Deepseek API timed out.";
      } else if (error.code === "ENOTFOUND" || error.code === "ECONNREFUSED") {
        status = "connection_error";
        details = "Cannot connect to Deepseek API. Check network connection.";
      }
      
      if (isDevelopment) {
        res.json({
          message: "Deepseek API error, but mock generator is available",
          status: status,
          usingMock: true,
          apiKeyConfigured: true,
          canFallbackToMock: true,
          error: details
        });
      } else {
        res.status(503).json({
          message: "Deepseek API error",
          status: status,
          usingMock: false,
          apiKeyConfigured: true,
          error: details
        });
      }
    }
  } catch (error) {
    res.status(500).json({ 
      message: "Error checking Deepseek status", 
      error: error instanceof Error ? error.message : "Unknown error" 
    });
  }
};

// Function to upload video to local storage
export const uploadVideoToLocal = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { courseId, sectionId, chapterId } = req.params;
    const { userId } = getAuth(req);
    const file = req.file;

    console.log("Local video upload request:", { courseId, sectionId, chapterId, userId });

    // Validate required parameters
    if (!courseId || !sectionId || !chapterId) {
      res.status(400).json({ 
        message: "Course ID, section ID, and chapter ID are required",
        error: "Missing required parameters"
      });
      return;
    }

    if (!file) {
      res.status(400).json({ 
        message: "No video file provided",
        error: "Video file is required"
      });
      return;
    }

    // Verify course ownership
    try {
      const course = await Course.get(courseId);
      if (!course) {
        res.status(404).json({ message: "Course not found" });
        return;
      }

      if (course.teacherId !== userId) {
        res.status(403).json({ message: "Not authorized to upload videos to this course" });
        return;
      }
    } catch (error) {
      console.error("Error verifying course ownership:", error);
      res.status(500).json({ 
        message: "Error verifying course access",
        error: error instanceof Error ? error.message : "Unknown error"
      });
      return;
    }

    // Generate video URL for serving - use backend server URL
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8001';
    const videoUrl = `${backendUrl}/courses/local-video/${file.filename}`;
    
    console.log("Video uploaded successfully:", {
      filename: file.filename,
      size: file.size,
      videoUrl: videoUrl
    });

    res.json({
      message: "Video uploaded successfully to local storage",
      data: {
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        videoUrl: videoUrl,
        uploadedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("Error uploading video to local storage:", error);
    res.status(500).json({ 
      message: "Error uploading video to local storage", 
      error: error instanceof Error ? error.message : "Unknown error" 
    });
  }
};

// Function to serve local videos
export const serveLocalVideo = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { filename } = req.params;
    
    if (!filename) {
      res.status(400).json({ message: "Filename is required" });
      return;
    }

    // Correct path: from src/controllers/ go up 3 levels to thesis_learningapp/ then to video/
    const videoPath = path.join(__dirname, "../../../video", filename);
    
    console.log("Attempting to serve video from path:", videoPath);
    console.log("File exists:", fs.existsSync(videoPath));
    
    // Check if file exists
    if (!fs.existsSync(videoPath)) {
      console.error("Video file not found at:", videoPath);
      res.status(404).json({ message: "Video file not found", path: videoPath });
      return;
    }

    // Get file stats for Content-Length header
    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      // Support for video streaming with range requests
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(videoPath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      // Serve the entire file
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(200, head);
      fs.createReadStream(videoPath).pipe(res);
    }

  } catch (error) {
    console.error("Error serving local video:", error);
    res.status(500).json({ 
      message: "Error serving video file", 
      error: error instanceof Error ? error.message : "Unknown error" 
    });
  }
};