# Learning Management System (LMS) Platform

A modern, full-stack learning management system built with Next.js, TypeScript, and Node.js. This robust platform implements a comprehensive solution for online education with role-based access control and distinct features for students, teachers, and administrators.

## 📑 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Project Architecture](#-project-architecture)
- [Directory Structure](#-directory-structure)
- [Role-Based Access Control](#-role-based-access-control)
- [Core Components](#-core-components)
- [Authentication & Authorization](#-authentication--authorization)
- [API Implementation](#-api-implementation)
- [Data Models](#-data-models)
- [State Management](#-state-management)
- [Getting Started](#-getting-started)
- [🧩 Data Handling Patterns](#-data-handling-patterns)

## 📋 Overview

This learning management system provides a complete solution for online education with multi-tenant architecture supporting distinct roles (student, teacher, admin) each with specific permissions and interfaces. The application features a responsive design, modern UI components, and an intuitive user experience across different devices and screen sizes.

## 🚀 Key Features

### For Students
- Course discovery and enrollment
- Interactive course content consumption
- Personal learning dashboard
- Progress tracking and analytics
- Assignment submission
- Blog access and creation
- Account and profile management
- Billing and payment history

### For Teachers
- Course creation and management
- Content publishing with rich media support
- Student progress monitoring
- Assignment creation and grading
- Meeting scheduling and management
- Blog post publishing
- Revenue tracking and analytics
- Profile management

### For Administrators
- Comprehensive system dashboard
- User management and role assignments
- Blog post moderation and approval
- Platform analytics and reporting
- Content oversight and moderation
- Role change requests management

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** with App Router architecture
- **TypeScript** for type safety
- **Tailwind CSS** for utility-first styling
- **Clerk Authentication** for secure user authentication and management
- **Redux Toolkit & RTK Query** for state management and data fetching
- **Lucide Icons** for modern UI iconography
- **Shadcn UI** for reusable UI components
- **date-fns** for date manipulation
- **React Hook Form** for form handling
- **Zod** for schema validation

### Backend
- **Node.js** runtime environment
- **Express.js** for API development
- **TypeScript** for type safety
- **DynamoDB** for NoSQL database storage
- **AWS S3** for file storage
- **AWS CloudFront** for content delivery
- **JWT** for token-based authentication
- **Clerk** for user management and authentication

## 🏛️ Project Architecture

The application follows a modern architecture with:

1. **Client-Side** Next.js App Router for hybrid rendering
2. **Server-Side** Express.js RESTful API
3. **Authentication Layer** with Clerk for identity management
4. **Data Layer** with DynamoDB and S3 for storage
5. **State Management** with Redux Toolkit
6. **API Integration** with RTK Query for data fetching

## 📁 Directory Structure

```
thesis_learningapp/
├── client/                           # Frontend application
│   ├── src/
│   │   ├── app/                      # Next.js app router pages
│   │   │   ├── (auth)/               # Authentication routes
│   │   │   ├── (dashboard)/          # Dashboard routes
│   │   │   │   ├── admin/            # Admin-specific pages
│   │   │   │   │   ├── analytics/    # Analytics dashboard
│   │   │   │   │   ├── blog-approval/# Blog moderation
│   │   │   │   │   ├── courses/      # Course management
│   │   │   │   │   ├── dashboard/    # Admin dashboard
│   │   │   │   │   ├── profile/      # Admin profile
│   │   │   │   │   └── user-management/  # User management
│   │   │   │   ├── teacher/          # Teacher-specific pages
│   │   │   │   │   ├── assignments/   # Assignment management
│   │   │   │   │   ├── billing/      # Revenue tracking
│   │   │   │   │   ├── blog/         # Blog management
│   │   │   │   │   ├── courses/      # Course management
│   │   │   │   │   ├── meetings/     # Meeting scheduling
│   │   │   │   │   ├── profile/      # Teacher profile
│   │   │   │   │   └── settings/     # Settings
│   │   │   │   └── user/             # Student-specific pages
│   │   │   │       ├── courses/      # Enrolled courses
│   │   │   │       ├── blog/         # Student blog
│   │   │   │       ├── profile/      # Student profile
│   │   │   │       ├── billing/      # Billing information
│   │   │   │       └── settings/     # Settings
│   │   │   └── (nondashboard)/       # Public pages
│   │   ├── components/               # Reusable components
│   │   │   ├── ui/                  # UI components
│   │   │   └── [feature]/           # Feature-specific components
│   │   ├── hooks/                   # Custom React hooks
│   │   ├── lib/                     # Utility functions
│   │   ├── state/                   # Redux store and API
│   │   ├── middleware.ts            # Auth middleware
│   │   └── types/                   # TypeScript types
│   ├── public/                      # Static assets
│
└── server/                          # Backend application
    ├── src/
    │   ├── controllers/             # Route controllers
    │   ├── models/                  # Data models
    │   ├── routes/                  # API routes
    │   ├── middleware/              # Express middleware
    │   ├── types/                   # TypeScript types
    │   ├── utils/                   # Utility functions
    │   ├── seed/                    # Database seed data
    │   └── index.ts                 # Main server entry point
```

## 🔐 Role-Based Access Control

The system implements a comprehensive role-based access control system:

1. **Student Role**
   - Access to enrolled courses
   - Limited to student-specific pages
   - Can create blog posts (require approval)
   - Can request role change

2. **Teacher Role**
   - All student capabilities
   - Course creation and management
   - Assignment and meeting management
   - Blog post creation with approval rights
   - Revenue tracking

3. **Admin Role**
   - All teacher capabilities
   - User management
   - Blog post moderation
   - Platform analytics access
   - System configuration

The middleware.ts file handles role-based routing, redirecting users to their appropriate dashboard based on their role stored in session claims.

## 💻 Core Components
### Frontend Components

#### Navigation
- `NonDashboardNavbar.tsx`: Main navigation for public pages
- `Navbar.tsx`: Navigation for dashboard pages
- `AppSidebar.tsx`: Sidebar navigation for dashboard

#### Authentication
- `SignIn.tsx`: Sign in form
- `SignUp.tsx`: Sign up form

#### Course Related
- `CourseCard.tsx`: Course preview card
- `CourseCardSearch.tsx`: Course card for search results
- `TeacherCourseCard.tsx`: Course card for teacher dashboard
- `CoursePreview.tsx`: Course preview component

#### UI Components
- `CustomFormField.tsx`: Reusable form field component
- `CustomModal.tsx`: Modal dialog component
- `WizardStepper.tsx`: Multi-step form stepper
- `Toolbar.tsx`: Action toolbar component
- `ChatBot.tsx`: AI-powered chat support

### Backend Components

#### Controllers
- `courseController.ts`: Course management
- `userCourseProgressController.ts`: Student progress tracking
- `analyticsController.ts`: Analytics and reporting
- `chatController.ts`: Chat functionality
- `blogPostController.ts`: Blog management
- `assignmentController.ts`: Assignment management
- `meetingController.ts`: Meeting scheduling

#### Models
- `courseModel.ts`: Course data model
- `userCourseProgressModel.ts`: Progress tracking model
- `analyticsModel.ts`: Analytics data model
- `blogPostModel.ts`: Blog post model
- `meetingModel.ts`: Meeting scheduling model
- `assignmentModel.ts`: Assignment management model

## 📌 Code Examples

### Frontend Component Example - NonDashboardNavbar.tsx

```tsx
"use client";

import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Bell, BookOpen, FileText, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const NonDashboardNavbar = () => {
  const { user } = useUser();
  const userRole = user?.publicMetadata?.userType as "student" | "teacher";
  const pathname = usePathname();
  
  // Determine dashboard URL based on user role
  const dashboardUrl = userRole === "teacher" ? "/teacher/courses" : "/user/courses";
  
  // Check if current path is the dashboard path
  const isDashboardActive = pathname.includes("/teacher/") || pathname.includes("/user/");

  return (
    <nav className="nondashboard-navbar">
      <div className="nondashboard-navbar__container">
        <div className="nondashboard-navbar__search">
          <Link href="/" className="nondashboard-navbar__brand" scroll={false}>
            2
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/blog"
              className="flex items-center gap-2 text-customgreys-dirtyGrey hover:text-white-100 transition-colors"
              scroll={false}
            >
              <FileText size={18} />
              <span className="hidden sm:inline">Blog</span>
            </Link>
            
            {/* Dashboard button - only visible when signed in */}
            <SignedIn>
              <Link
                href={dashboardUrl}
                className={`nondashboard-navbar__dashboard-link ${isDashboardActive ? 'active' : ''}`}
                scroll={false}
              >
                <LayoutDashboard size={18} />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
            </SignedIn>
            
            <div className="relative group">
              <Link
                href="/search"
                className="nondashboard-navbar__search-input"
                scroll={false}
              >
                <span className="hidden sm:inline">Search Courses</span>
                <span className="sm:hidden">Search</span>
              </Link>
              <BookOpen
                className="nondashboard-navbar__search-icon"
                size={18}
              />
            </div>
          </div>
        </div>
        <div className="nondashboard-navbar__actions">
          <button className="nondashboard-navbar__notification-button">
            <span className="nondashboard-navbar__notification-indicator"></span>
            <Bell className="nondashboard-navbar__notification-icon" />
          </button>

          <SignedIn>
            <UserButton
              appearance={{
                baseTheme: dark,
                elements: {
                  userButtonOuterIdentifier: "text-customgreys-dirtyGrey",
                  userButtonBox: "scale-90 sm:scale-100",
                },
              }}
              showName={true}
              userProfileMode="navigation"
              userProfileUrl={
                userRole === "teacher" ? "/teacher/profile" : "/user/profile"
              }
            />
          </SignedIn>
          <SignedOut>
            <Link
              href="/signin"
              className="nondashboard-navbar__auth-button--login"
              scroll={false}
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="nondashboard-navbar__auth-button--signup"
              scroll={false}
            >
              Sign up
            </Link>
          </SignedOut>
        </div>
      </div>
    </nav>
  );
};

export default NonDashboardNavbar;
```

### Teacher Courses Page Example

```tsx
"use client";

import Header from "@/components/Header";
import Loading from "@/components/Loading";
import TeacherCourseCard from "@/components/TeacherCourseCard";
import Toolbar from "@/components/Toolbar";
import { Button } from "@/components/ui/button";
import {
  useCreateCourseMutation,
  useDeleteCourseMutation,
  useGetCoursesQuery,
} from "@/state/api";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";

const Courses = () => {
  const router = useRouter();
  const { user } = useUser();
  const {
    data: courses,
    isLoading,
    isError,
  } = useGetCoursesQuery({ category: "all" });

  const [createCourse] = useCreateCourseMutation();
  const [deleteCourse] = useDeleteCourseMutation();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredCourses = useMemo(() => {
    if (!courses) return [];

    return courses.filter((course) => {
      const matchesSearch = course.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || course.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [courses, searchTerm, selectedCategory]);

  const handleEdit = (course: Course) => {
    router.push(`/teacher/courses/${course.courseId}`, {
      scroll: false,
    });
  };

  const handleDelete = async (course: Course) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      await deleteCourse(course.courseId).unwrap();
    }
  };

  const handleCreateCourse = async () => {
    if (!user) return;

    const result = await createCourse({
      teacherId: user.id,
      teacherName: user.fullName || "Unknown Teacher",
    }).unwrap();
    router.push(`/teacher/courses/${result.courseId}`, {
      scroll: false,
    });
  };

  if (isLoading) return <Loading />;
  if (isError || !courses) return <div>Error loading courses.</div>;

  return (
    <div className="teacher-courses">
      <Header
        title="Courses"
        subtitle="Browse your courses"
        rightElement={
          <Button
            onClick={handleCreateCourse}
            className="teacher-courses__header"
          >
            Create Course
          </Button>
        }
      />
      <Toolbar
        onSearch={setSearchTerm}
        onCategoryChange={setSelectedCategory}
      />
      <div className="teacher-courses__grid">
        {filteredCourses.map((course) => (
          <TeacherCourseCard
            key={course.courseId}
            course={course}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isOwner={course.teacherId === user?.id}
          />
        ))}
      </div>
    </div>
  );
};

export default Courses;
```

### Backend Course Model Example

```typescript
import { Schema, model } from "dynamoose";

const commentSchema = new Schema({
  commentId: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  timestamp: {
    type: String,
    required: true,
  },
});

const chapterSchema = new Schema({
  chapterId: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["Text", "Quiz", "Video"],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  comments: {
    type: Array,
    schema: [commentSchema],
  },
  video: {
    type: String,
  },
});

const sectionSchema = new Schema({
  sectionId: {
    type: String,
    required: true,
  },
  sectionTitle: {
    type: String,
    required: true,
  },
  sectionDescription: {
    type: String,
  },
  chapters: {
    type: Array,
    schema: [chapterSchema],
  },
});

const courseSchema = new Schema(
  {
    courseId: {
      type: String,
      hashKey: true,
      required: true,
    },
    teacherId: {
      type: String,
      required: true,
    },
    teacherName: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    category: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    price: {
      type: Number,
    },
    level: {
      type: String,
      required: true,
      enum: ["Beginner", "Intermediate", "Advanced"],
    },
    status: {
      type: String,
      required: true,
      enum: ["Draft", "Published"],
    },
    sections: {
      type: Array,
      schema: [sectionSchema],
    },
    enrollments: {
      type: Array,
      schema: [
        new Schema({
          userId: {
            type: String,
            required: true,
          },
        }),
      ],
    },
  },
  {
    timestamps: true,
  }
);

const Course = model("Course", courseSchema);
export default Course;
```

### Backend Course Controller Example

```typescript
import { Request, Response } from "express";
import Course from "../models/courseModel";
import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
import { getAuth } from "@clerk/express";

const s3 = new AWS.S3();

export const listCourses = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { category } = req.query;
  try {
    const courses =
      category && category !== "all"
        ? await Course.scan("category").eq(category).exec()
        : await Course.scan().exec();
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
      level: "Beginner",
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
```

### Backend API Routes Setup

```typescript
import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import * as dynamoose from "dynamoose";
import serverless from "serverless-http";
import seed from "./seed/seedDynamodb";
import { seedCourses } from "./utils/seedData";
import {
  clerkMiddleware,
  createClerkClient,
  requireAuth,
} from "@clerk/express";
/* ROUTE IMPORTS */
import courseRoutes from "./routes/courseRoutes";
import userClerkRoutes from "./routes/userClerkRoutes";
import transactionRoutes from "./routes/transactionRoutes";
import userCourseProgressRoutes from "./routes/userCourseProgessRoutes";
import chatRoutes from "./routes/chatRoutes";
import blogPostRoutes from "./routes/blogPostRoutes";
import assignmentRoutes from "./routes/assignmentRoutes";
import meetingRoutes from "./routes/meetingRoutes";
import analyticsRoutes from "./routes/analyticsRoutes";
import { errorHandler } from "./middleware/errorMiddleware";

/* CONFIGURATIONS */
dotenv.config();
const isProduction = process.env.NODE_ENV === "production";
if (!isProduction) {
  dynamoose.aws.ddb.local();
}

export const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(clerkMiddleware());

/* ROUTES */
app.get("/", (_req, res) => {
  res.send("Hello World");
});

app.use("/courses", courseRoutes);
app.use("/users/clerk", requireAuth(), userClerkRoutes);
app.use("/transactions", requireAuth(), transactionRoutes);
app.use("/users/course-progress", requireAuth(), userCourseProgressRoutes);
app.use("/chat", requireAuth(), chatRoutes);
app.use("/blog-posts", blogPostRoutes);
app.use("/assignments", assignmentRoutes);
app.use("/meetings", meetingRoutes);
app.use("/analytics", analyticsRoutes);

/* ERROR MIDDLEWARE */
app.use(errorHandler);

/* SERVER */
const port = process.env.PORT || 3000;
if (!isProduction) {
  app.listen(port, async () => {
    console.log(`Server running on port ${port}`);
    
    // Seed sample courses to the database
    await seedCourses();
  });
}
```

### Frontend RTK Query API Setup

```typescript
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BaseQueryApi, FetchArgs } from "@reduxjs/toolkit/query";
import { User } from "@clerk/nextjs/server";
import { Clerk } from "@clerk/clerk-js";
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';

export interface BlogPost {
  postId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  status: 'draft' | 'pending' | 'published' | 'rejected';
  moderatedBy?: string;
  moderationComment?: string;
  featuredImage?: string;
  createdAt: number;
  updatedAt: number;
  publishedAt?: number;
}

export interface Assignment {
  assignmentId: string;
  courseId: string;
  teacherId: string;
  title: string;
  description: string;
  dueDate: string;
  points: number;
  attachments: string[];
  submissions: Array<{
    userId: string;
    submissionDate: string;
    content: string;
    attachments: string[];
    status: "submitted" | "graded" | "returned";
    grade?: number;
    feedback?: string;
  }>;
  status: "draft" | "published" | "closed";
}

const customBaseQuery = async (
  args: string | FetchArgs,
  api: BaseQueryApi,
  extraOptions: any
) => {
  const baseQuery = fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    prepareHeaders: async (headers) => {
      try {
        // Add cache control headers to prevent caching
        headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        headers.set('Pragma', 'no-cache');
        headers.set('Expires', '0');
        
        // Check if Clerk is available and authenticated
        if (typeof window !== 'undefined' && window.Clerk) {
          const session = await window.Clerk.session;
          if (session) {
            const token = await session.getToken();
            if (token) {
              headers.set("Authorization", `Bearer ${token}`);
              console.log("Authorization header set with token");
            } else {
              console.warn("No token available from Clerk session");
            }
          } else {
            console.warn("No Clerk session found");
          }
        } else {
          console.warn("Clerk not available in window");
        }
      } catch (error) {
        console.error("Error getting auth token:", error);
      }
      return headers;
    },
  });

  try {
    const result = await baseQuery(args, api, extraOptions);

    // Handle errors
    if (result.error) {
      const errorData = result.error.data as { message?: string };
      const errorMessage =
        errorData?.message ||
        result.error.status.toString() ||
        "An error occurred";
      toast.error(`Error: ${errorMessage}`);
      return result;
    }

    // Handle successful response
    if (result.data) {
      // For chat endpoints, return the raw response
      if (typeof args === 'object' && args.url?.includes('/chat')) {
        return result;
      }
      
      // For other endpoints, extract data property if it exists
      const data = result.data as { data?: unknown };
      if (data && typeof data === 'object' && 'data' in data) {
        result.data = data.data;
      }
    } else if (result.meta?.response?.status === 204) {
      return { data: null };
    }

    return result;
  } catch (error) {
    toast.error(`Network error: ${error instanceof Error ? error.message : "Unknown error"}`);
    return { error: { status: "FETCH_ERROR", error: String(error) } };
  }
};

export const api = createApi({
  baseQuery: customBaseQuery,
  reducerPath: "api",
  tagTypes: [
    "Courses",
    "Users",
    "UserCourseProgress",
    "BlogPosts",
    "Transactions",
    "Assignments",
    "Meetings",
    "Analytics"
  ],
  endpoints: (builder) => ({
    // Course endpoints
    getCourses: builder.query({
      query: ({ category = "all" }) => `/courses${category ? `?category=${category}` : ''}`,
      providesTags: ["Courses"],
    }),
    getCourse: builder.query({
      query: (courseId) => `/courses/${courseId}`,
      providesTags: (result, error, courseId) => [{ type: "Courses", id: courseId }],
    }),
    createCourse: builder.mutation({
      query: (courseData) => ({
        url: "/courses",
        method: "POST",
        body: courseData,
      }),
      invalidatesTags: ["Courses"],
    }),
    // Add more endpoints...
  }),
});
```

## 📝 API Documentation

### Authentication
- POST `/api/auth/signin` - User sign in
- POST `/api/auth/signup` - User sign up
- GET `/api/auth/me` - Get current user

### Courses
- GET `/courses` - Get all courses
- GET `/courses/:id` - Get course details
- POST `/courses` - Create new course
- PUT `/courses/:id` - Update course
- DELETE `/courses/:id` - Delete course

### User Progress
- GET `/users/course-progress/:userId` - Get user progress
- POST `/users/course-progress/:userId/:courseId` - Update progress
- GET `/analytics` - Get progress analytics

### Blog
- GET `/blog-posts` - Get all blog posts
- GET `/blog-posts/:id` - Get blog post details
- POST `/blog-posts` - Create blog post
- PUT `/blog-posts/:id` - Update blog post
- DELETE `/blog-posts/:id` - Delete blog post

### Assignments
- GET `/assignments/course/:courseId` - Get course assignments
- POST `/assignments` - Create new assignment
- PUT `/assignments/:id` - Update assignment
- DELETE `/assignments/:id` - Delete assignment

### Meetings
- GET `/meetings/course/:courseId` - Get course meetings
- POST `/meetings` - Schedule new meeting
- PUT `/meetings/:id` - Update meeting
- DELETE `/meetings/:id` - Cancel meeting

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- AWS account (for DynamoDB)
- Clerk account (for authentication)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/thesis_learningapp.git
cd thesis_learningapp
```

2. Install dependencies:
```bash
# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

3. Set up environment variables:
```bash
# In client/.env.local
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
NEXT_PUBLIC_API_URL=http://localhost:3001

# In server/.env
PORT=3001
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

4. Start the development servers:
```bash
# Start the client (from client directory)
npm run dev

# Start the server (from server directory)
npm run dev
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Clerk for authentication
- AWS for cloud services
- All contributors and supporters

## 📌 Additional Code Examples

### Server Middleware

#### Auth Middleware (authMiddleware.ts)

```typescript
import { RequestHandler } from 'express';
import { clerkClient } from '../index';

export const authenticate: RequestHandler = async (req, res, next) => {
  try {
    // Check if Clerk auth middleware has already authenticated the user
    // Use type assertion to access auth property
    const userId = (req as any).auth?.userId;
    
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized: Not authenticated' });
      return;
    }
    
    try {
      // Get user data
      const user = await clerkClient.users.getUser(userId);
      
      // If user not found
      if (!user) {
        res.status(403).json({ message: 'Forbidden: User not found' });
        return;
      }
      
      // Add user to request using type assertion
      (req as any).user = {
        id: user.id,
        name: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : undefined,
        email: user.emailAddresses[0]?.emailAddress,
        imageUrl: user.imageUrl,
        role: (user.publicMetadata.userType as 'student' | 'teacher' | 'admin') || 'student',
      };
      
      console.log("User role:", (req as any).user?.role);
      
      next();
    } catch (error) {
      res.status(401).json({ message: 'Unauthorized: Invalid user data' });
      return;
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Internal server error' });
    return;
  }
};
```

#### Role Middleware (roleMiddleware.ts)

```typescript
import { RequestHandler, Request } from 'express';

// Extend the Request type to include the user property
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    name?: string;
    email?: string;
    imageUrl?: string;
    role?: 'student' | 'teacher' | 'admin';
  };
}

export const requireRole = (roles: string[]): RequestHandler => {
  return (req, res, next) => {
    const authReq = req as AuthenticatedRequest;
    
    if (!authReq.user) {
      res.status(401).json({ message: 'Unauthorized: No user found' });
      return;
    }

    const userRole = authReq.user.role;
    
    if (!userRole || !roles.includes(userRole)) {
      res.status(403).json({ 
        message: `Forbidden: Requires ${roles.join(' or ')} role` 
      });
      return;
    }

    next();
  };
};
```

### Server Utilities

#### Utility Functions (utils.ts)

```typescript
import path from "path";

export const updateCourseVideoInfo = (
  course: any,
  sectionId: string,
  chapterId: string,
  videoUrl: string
) => {
  const section = course.sections?.find((s: any) => s.sectionId === sectionId);
  if (!section) {
    throw new Error(`Section not found: ${sectionId}`);
  }

  const chapter = section.chapters?.find((c: any) => c.chapterId === chapterId);
  if (!chapter) {
    throw new Error(`Chapter not found: ${chapterId}`);
  }

  chapter.video = videoUrl;
  chapter.type = "Video";
};

export const calculateOverallProgress = (sections: any[]): number => {
  const totalChapters = sections.reduce(
    (acc: number, section: any) => acc + section.chapters.length,
    0
  );

  const completedChapters = sections.reduce(
    (acc: number, section: any) =>
      acc + section.chapters.filter((chapter: any) => chapter.completed).length,
    0
  );

  return totalChapters > 0 ? (completedChapters / totalChapters) * 100 : 0;
};

export const mergeSections = (
  existingSections: any[],
  newSections: any[]
): any[] => {
  const existingSectionsMap = new Map<string, any>();
  for (const existingSection of existingSections) {
    existingSectionsMap.set(existingSection.sectionId, existingSection);
  }

  for (const newSection of newSections) {
    const section = existingSectionsMap.get(newSection.sectionId);
    if (!section) {
      // Add new section
      existingSectionsMap.set(newSection.sectionId, newSection);
    } else {
      // Merge chapters within the existing section
      section.chapters = mergeChapters(section.chapters, newSection.chapters);
      existingSectionsMap.set(newSection.sectionId, section);
    }
  }

  return Array.from(existingSectionsMap.values());
};
```

### Server Type Definitions

#### Express Type Extensions (express.d.ts)

```typescript
import 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        name?: string;
        email?: string;
        imageUrl?: string;
        role?: 'student' | 'teacher' | 'admin';
      };
      auth?: {
        userId?: string;
        sessionId?: string;
      };
    }
  }
}

// This file must be a module
export {};
```

### Admin Blog Management

#### Admin Blog Page (admin/blog/page.tsx)

```tsx
import Header from "@/components/Header";
import { BlogModeration } from "@/components/admin/BlogModeration";

export default function BlogModerationPage() {
  return (
    <div className="space-y-8">
      <Header
        title="Blog Moderation"
        subtitle="Review and moderate blog posts"
      />
      <BlogModeration />
    </div>
  );
}
```

#### Blog Moderation Component (admin/BlogModeration.tsx)

```tsx
import { useGetBlogPostsQuery, useModerateBlogPostMutation } from "@/state/api";
import type { BlogPost, BlogPostsResponse } from "@/state/api";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";

export function BlogModeration() {
  const { data, isLoading, isFetching } = useGetBlogPostsQuery({
    status: "pending",
  });

  const blogPosts = data?.posts || [];

  const [moderateBlogPost] = useModerateBlogPostMutation();
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [moderationComment, setModerationComment] = useState("");

  const handleModerate = async (postId: string, status: "published" | "rejected") => {
    try {
      await moderateBlogPost({
        postId,
        status,
        moderationComment,
      }).unwrap();

      toast.success(`Post ${status === "published" ? "approved" : "rejected"} successfully`);
      setSelectedPost(null);
      setModerationComment("");
    } catch (error) {
      toast.error("Failed to moderate post");
    }
  };

  if (isLoading || isFetching) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg bg-white p-6 shadow-sm">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-customgreys-grey border-t-customgreys-darkGrey mx-auto"></div>
          <p className="text-customgreys-darkGrey">Loading blog posts...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {blogPosts.map((post) => (
              <TableRow key={post.postId}>
                <TableCell className="max-w-[300px] truncate font-medium">
                  {post.title}
                </TableCell>
                <TableCell>{post.userName}</TableCell>
                <TableCell>{post.category}</TableCell>
                <TableCell>
                  {format(new Date(post.createdAt), "MMM d, yyyy")}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedPost(post.postId)}
                    className="w-full"
                  >
                    Review
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-customgreys-darkGrey">
              Review Blog Post
            </DialogTitle>
            <DialogDescription className="text-customgreys-lightText">
              Review the blog post and provide feedback if needed
            </DialogDescription>
          </DialogHeader>

          {selectedPost && (
            <div className="space-y-6">
              <div>
                <h3 className="mb-2 font-medium text-customgreys-darkGrey">
                  Moderation Comment
                </h3>
                <Textarea
                  value={moderationComment}
                  onChange={(e) => setModerationComment(e.target.value)}
                  placeholder="Optional feedback for the author..."
                  className="min-h-[100px] resize-none"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => handleModerate(selectedPost, "rejected")}
                  className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
                >
                  Reject
                </Button>
                <Button
                  onClick={() => handleModerate(selectedPost, "published")}
                  className="bg-green-600 text-white hover:bg-green-700"
                >
                  Approve
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
```

### Checkout Completion Page

#### Checkout Completion (checkout/completion/index.tsx)

```tsx
"use client";

import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Link from "next/link";
import React from "react";

const CompletionPage = () => {
  return (
    <div className="completion">
      <div className="completion__content">
        <div className="completion__icon">
          <Check className="w-16 h-16" />
        </div>
        <h1 className="completion__title">COMPLETED</h1>
        <p className="completion__message">
          🎉 You have made a course purchase successfully! 🎉
        </p>
      </div>
      <div className="completion__support">
        <p>
          Need help? Contact our{" "}
          <Button variant="link" asChild className="p-0 m-0 text-primary-700">
            <a href="mailto:support@example.com">customer support</a>
          </Button>
          .
        </p>
      </div>
      <div className="completion__action">
        <Link href="user/courses" scroll={false}>
          Go to Courses
        </Link>
      </div>
    </div>
  );
};

export default CompletionPage;
```

## 🧩 Data Handling Patterns

The application follows these data patterns to ensure consistency:

### API Response Handling

The backend API can return data in two formats:
1. Direct arrays of data (e.g., `[{item1}, {item2}]`)
2. Response objects with data property (e.g., `{ data: [{item1}, {item2}], message: "Success" }`)

To handle this consistently across components:

1. We use a normalized API query with enhanced base query that:
   - Detects responses with a `data` property containing arrays
   - Automatically normalizes these to maintain consistency

2. Components should handle response formats using this pattern:
   ```typescript
   const courses = useMemo(() => {
     // If response is an array, return it directly
     if (coursesData && Array.isArray(coursesData)) {
       return coursesData as Course[];
     } 
     // If response has a data property with an array, return that
     else if (coursesData && 'data' in coursesData && Array.isArray((coursesData as CoursesResponse).data)) {
       return (coursesData as CoursesResponse).data || [];
     }
     // Default fallback
     return [] as Course[];
   }, [coursesData]);
   ```

### Form Initialization

When editing existing data:
1. Use state to track initialization status
2. Initialize form values only once when data is available
3. Use conditional updates to prevent data reset during navigation

### Common Pitfalls to Avoid

1. **Array Handling:** Always check if data is an array before using array methods
2. **Null Checks:** Use conditional chaining and nullish coalescing
3. **Form Reset Issues:** Track initialization status to prevent multiple resets