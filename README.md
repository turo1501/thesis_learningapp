# Learning Management System (LMS)

A modern, full-stack learning management system built with Next.js, TypeScript, and Node.js. This project implements a comprehensive platform for online education with features for students, teachers, and administrators.

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Key Components](#-key-components)
- [Code Examples](#-code-examples)
- [API Documentation](#-api-documentation)
- [Getting Started](#-getting-started)
- [Contributing](#-contributing)
- [License](#-license)

## 🚀 Features

### For Students
- Course browsing and enrollment
- Interactive course content viewing
- Progress tracking
- Course recommendations
- Chat support with AI
- Payment processing
- Profile management

### For Teachers
- Course creation and management
- Student progress monitoring
- Analytics dashboard
- Meeting scheduling
- Assignment management
- Profile management

### For Administrators
- User management
- Blog post management
- System analytics
- Content moderation

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** (App Router): For modern React application architecture with server components
- **TypeScript**: For type-safe code
- **Tailwind CSS**: For utility-first styling
- **Clerk Authentication**: For secure user authentication and management
- **Redux Toolkit & RTK Query**: For state management and API data fetching
- **React Query**: For additional data fetching capabilities
- **Lucide Icons**: For modern UI icons

### Backend
- **Node.js**: JavaScript runtime for server-side code
- **Express.js**: Web framework for the backend API
- **TypeScript**: For type-safe backend code
- **DynamoDB**: For NoSQL database storage
- **AWS Services**: For cloud infrastructure
- **Socket.IO**: For real-time communication

## 📁 Project Structure

```
thesis_learningapp/
├── client/                         # Frontend application
│   ├── src/
│   │   ├── app/                   # Next.js app router pages
│   │   │   ├── (auth)/           # Authentication routes
│   │   │   │   ├── signin/       # Sign in page
│   │   │   │   └── signup/       # Sign up page
│   │   │   ├── (dashboard)/      # Dashboard routes
    # User management
│   │   │   │   ├── admin/     
│   │   │   │   │   ├── analytics/  
│   │   │   │   │   ├── blog-approval/ 
│   │   │   │   │   ├── courses/  
│   │   │   │   │   ├── dahsboard/  
│   │   │   │   │   └── profile/
│   │   │   │   │   └── user-management/

│   │   │   │   ├── teacher/      # Teacher dashboard
│   │   │   │   │   ├── assignment/  
│   │   │   │   │   ├── billing/ 
│   │   │   │   │   ├── blog/ 
│   │   │   │   │   ├── meetings/  
│   │   │   │   │   ├── courses/ 
│   │   │   │   │   ├── moderation/  
│   │   │   │   │   ├── profile/  
│   │   │   │   │   └── settings/ # Settings
│   │   │   │   └── user/         # Student dashboard
│   │   │   │       ├── courses/  # Enrolled courses
│   │   │   │       ├── blog/ 
│   │   │   │       ├── profile/  # Student profile
│   │   │   │       ├── billing/  # Billing information
│   │   │   │       └── settings/ # Settings
│   │   │   └── (nondashboard)/   # Public pages
│   │   │       ├── landing/      # Landing page
│   │   │       ├── search/       # Course search
│   │   │       └── checkout/     # Checkout process
│   │   ├── components/           # Reusable components
│   │   │   ├── blog/            # Blog-related components
│   │   │   └── ui/              # UI components
│   │   ├── hooks/               # Custom React hooks
│   │   ├── lib/                 # Utility functions
│   │   ├── state/               # Redux store and API
│   │   ├── styles/              # Global styles
│   │   └── types/               # TypeScript types
│   └── public/                  # Static assets
│
└── server/                      # Backend application
    ├── src/
    │   ├── controllers/         # Route controllers
    │   ├── models/              # Data models
    │   ├── routes/              # API routes
    │   ├── middleware/          # Express middleware
    │   ├── types/               # TypeScript types
    │   ├── utils/               # Utility functions
    │   ├── seed/                # Database seed data
    │   │   └── data/           # Sample data for seeding
    │   └── index.ts            # Main server entry point
    └── dist/                    # Compiled JavaScript
```

## 🔑 Key Components

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
import {
  DynamoDBClient,
  DeleteTableCommand,
  ListTablesCommand,
} from "@aws-sdk/client-dynamodb";
import fs from "fs";
import path from "path";
import dynamoose from "dynamoose";
import pluralize from "pluralize";
import Transaction from "../models/transactionModel";
import Course from "../models/courseModel";
import UserCourseProgress from "../models/userCourseProgressModel";
import dotenv from "dotenv";

dotenv.config();
let client: DynamoDBClient;

/* DynamoDB Configuration */
const isProduction = process.env.NODE_ENV === "production";

if (!isProduction) {
  dynamoose.aws.ddb.local();
  client = new DynamoDBClient({
    endpoint: "http://localhost:8000",
    region: "us-east-2",
    credentials: {
      accessKeyId: "dummyKey123",
      secretAccessKey: "dummyKey123",
    },
  });
} else {
  client = new DynamoDBClient({
    region: process.env.AWS_REGION || "us-east-2",
  });
}

/* DynamoDB Suppress Tag Warnings */
const originalWarn = console.warn.bind(console);
console.warn = (message, ...args) => {
  if (
    !message.includes("Tagging is not currently supported in DynamoDB Local")
  ) {
    originalWarn(message, ...args);
  }
};

async function createTables() {
  const models = [Transaction, UserCourseProgress, Course];

  for (const model of models) {
    const tableName = model.name;
    const table = new dynamoose.Table(tableName, [model], {
      create: true,
      update: true,
      waitForActive: true,
      throughput: { read: 5, write: 5 },
    });

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await table.initialize();
      console.log(`Table created and initialized: ${tableName}`);
    } catch (error: any) {
      console.error(
        `Error creating table ${tableName}:`,
        error.message,
        error.stack
      );
    }
  }
}

async function seedData(tableName: string, filePath: string) {
  const data: { [key: string]: any }[] = JSON.parse(
    fs.readFileSync(filePath, "utf8")
  );

  const formattedTableName = pluralize.singular(
    tableName.charAt(0).toUpperCase() + tableName.slice(1)
  );

  console.log(`Seeding data to table: ${formattedTableName}`);

  for (const item of data) {
    try {
      await dynamoose.model(formattedTableName).create(item);
    } catch (err) {
      console.error(
        `Unable to add item to ${formattedTableName}. Error:`,
        JSON.stringify(err, null, 2)
      );
    }
  }

  console.log(
    "\x1b[32m%s\x1b[0m",
    `Successfully seeded data to table: ${formattedTableName}`
  );
}

async function deleteTable(baseTableName: string) {
  let deleteCommand = new DeleteTableCommand({ TableName: baseTableName });
  try {
    await client.send(deleteCommand);
    console.log(`Table deleted: ${baseTableName}`);
  } catch (err: any) {
    if (err.name === "ResourceNotFoundException") {
      console.log(`Table does not exist: ${baseTableName}`);
    } else {
      console.error(`Error deleting table ${baseTableName}:`, err);
    }
  }
}

async function deleteAllTables() {
  const listTablesCommand = new ListTablesCommand({});
  const { TableNames } = await client.send(listTablesCommand);

  if (TableNames && TableNames.length > 0) {
    for (const tableName of TableNames) {
      await deleteTable(tableName);
      await new Promise((resolve) => setTimeout(resolve, 800));
    }
  }
}

export default async function seed() {
  await deleteAllTables();
  await new Promise((resolve) => setTimeout(resolve, 1000));
  await createTables();

  const seedDataPath = path.join(__dirname, "./data");
  const files = fs
    .readdirSync(seedDataPath)
    .filter((file) => file.endsWith(".json"));

  for (const file of files) {
    const tableName = path.basename(file, ".json");
    const filePath = path.join(seedDataPath, file);
    await seedData(tableName, filePath);
  }
}

if (require.main === module) {
  seed().catch((error) => {
    console.error("Failed to run seed script:", error);
  });
}
[
  {
    "userId": "user_2ntu96pUCljUV2T9W0AThzjacQB",
    "courseId": "3a9f3d6c-c391-4b1c-9c3d-6c3f3d6c3f3d",
    "enrollmentDate": "2023-03-01T09:00:00Z",
    "overallProgress": 0.75,
    "sections": [
      {
        "sectionId": "2f9d1e8b-5a3c-4b7f-9e6d-8c2a1f0b3d5e",
        "chapters": [
          {
            "chapterId": "a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6",
            "completed": true
          },
          {
            "chapterId": "b2c3d4e5-f6g7-h8i9-j0k1-l2m3n4o5p6q7",
            "completed": false
          }
        ]
      }
    ],
    "lastAccessedTimestamp": "2023-03-10T14:30:00Z"
  },
  {
    "userId": "user_2ntu96pUCljUV2T9W0AThzjacQB",
    "courseId": "8b4f7d9c-4b1c-4b1c-8b4f-7d9c8b4f7d9c",
    "enrollmentDate": "2023-03-15T10:00:00Z",
    "overallProgress": 0.25,
    "sections": [
      {
        "sectionId": "1a7b3c5d-9e2f-4g6h-8i0j-2k4l6m8n0p1q",
        "chapters": [
          {
            "chapterId": "c3d4e5f6-g7h8-i9j0-k1l2-m3n4o5p6q7r8",
            "completed": true
          },
          {
            "chapterId": "d4e5f6g7-h8i9-j0k1-l2m3-n4o5p6q7r8s9",
            "completed": false
          }
        ]
      }
    ],
    "lastAccessedTimestamp": "2023-03-20T16:45:00Z"
  },
  {
    "userId": "user_3rTg67LmZnXc4Vb8Wd0JyUhEq",
    "courseId": "c5d6e7f8-g9h0-i1j2-k3l4-m5n6o7p8q9r0",
    "enrollmentDate": "2023-04-01T11:30:00Z",
    "overallProgress": 0.5,
    "sections": [
      {
        "sectionId": "3e5f7g9h-1i3j-5k7l-9m1n-3o5p7q9r1s3t",
        "chapters": [
          {
            "chapterId": "e5f6g7h8-i9j0-k1l2-m3n4-o5p6q7r8s9t0",
            "completed": true
          },
          {
            "chapterId": "f6g7h8i9-j0k1-l2m3-n4o5-p6q7r8s9t0u1",
            "completed": true
          },
          {
            "chapterId": "g7h8i9j0-k1l2-m3n4-o5p6-q7r8s9t0u1v2",
            "completed": false
          }
        ]
      }
    ],
    "lastAccessedTimestamp": "2023-04-10T09:15:00Z"
  },
  {
    "userId": "user_5vBn23WsLkMp7Jh4Gt8FxYcRz",
    "courseId": "d4e5f6g7-h8i9-j0k1-l2m3-n4o5p6q7r8s9",
    "enrollmentDate": "2023-04-05T14:00:00Z",
    "overallProgress": 0.1,
    "sections": [
      {
        "sectionId": "4u6v8w0x-2y4z-6a8b-0c2d-4e6f8g0h2i4j",
        "chapters": [
          {
            "chapterId": "h8i9j0k1-l2m3-n4o5-p6q7-r8s9t0u1v2w3",
            "completed": true
          },
          {
            "chapterId": "i9j0k1l2-m3n4-o5p6-q7r8-s9t0u1v2w3x4",
            "completed": false
          }
        ]
      }
    ],
    "lastAccessedTimestamp": "2023-04-15T11:30:00Z"
  },
  {
    "userId": "user_8qPk34ZxCvBn1Mh6Jt9WsYdAe",
    "courseId": "e5f6g7h8-i9j0-k1l2-m3n4-o5p6q7r8s9t0",
    "enrollmentDate": "2023-04-10T09:30:00Z",
    "overallProgress": 0.8,
    "sections": [
      {
        "sectionId": "5k7l9m1n-3o5p-7q9r-1s3t-5u7v9w1x3y5z",
        "chapters": [
          {
            "chapterId": "j0k1l2m3-n4o5-p6q7-r8s9-t0u1v2w3x4y5",
            "completed": true
          },
          {
            "chapterId": "k1l2m3n4-o5p6-q7r8-s9t0-u1v2w3x4y5z6",
            "completed": true
          }
        ]
      }
    ],
    "lastAccessedTimestamp": "2023-04-20T15:45:00Z"
  }
]
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

export const validateUploadedFiles = (files: any) => {
  const allowedExtensions = [".mp4", ".m3u8", ".mpd", ".ts", ".m4s"];
  for (const file of files) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      throw new Error(`Unsupported file type: ${ext}`);
    }
  }
};

export const getContentType = (filename: string) => {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case ".mp4":
      return "video/mp4";
    case ".m3u8":
      return "application/vnd.apple.mpegurl";
    case ".mpd":
      return "application/dash+xml";
    case ".ts":
      return "video/MP2T";
    case ".m4s":
      return "video/iso.segment";
    default:
      return "application/octet-stream";
  }
};

// Preserved HLS/DASH upload logic for future use
export const handleAdvancedVideoUpload = async (
  s3: any,
  files: any,
  uniqueId: string,
  bucketName: string
) => {
  const isHLSOrDASH = files.some(
    (file: any) =>
      file.originalname.endsWith(".m3u8") || file.originalname.endsWith(".mpd")
  );

  if (isHLSOrDASH) {
    // Handle HLS/MPEG-DASH Upload
    const uploadPromises = files.map((file: any) => {
      const s3Key = `videos/${uniqueId}/${file.originalname}`;
      return s3
        .upload({
          Bucket: bucketName,
          Key: s3Key,
          Body: file.buffer,
          ContentType: getContentType(file.originalname),
        })
        .promise();
    });
    await Promise.all(uploadPromises);

    // Determine manifest file URL
    const manifestFile = files.find(
      (file: any) =>
        file.originalname.endsWith(".m3u8") ||
        file.originalname.endsWith(".mpd")
    );
    const manifestFileName = manifestFile?.originalname || "";
    const videoType = manifestFileName.endsWith(".m3u8") ? "hls" : "dash";

    return {
      videoUrl: `${process.env.CLOUDFRONT_DOMAIN}/videos/${uniqueId}/${manifestFileName}`,
      videoType,
    };
  }

  return null; // Return null if not HLS/DASH to handle regular upload
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

export const mergeChapters = (
  existingChapters: any[],
  newChapters: any[]
): any[] => {
  const existingChaptersMap = new Map<string, any>();
  for (const existingChapter of existingChapters) {
    existingChaptersMap.set(existingChapter.chapterId, existingChapter);
  }

  for (const newChapter of newChapters) {
    existingChaptersMap.set(newChapter.chapterId, {
      ...(existingChaptersMap.get(newChapter.chapterId) || {}),
      ...newChapter,
    });
  }

  return Array.from(existingChaptersMap.values());
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
import { v4 as uuidv4 } from 'uuid';
import { CourseModel } from '../models/Course';

/**
 * Seed the database with sample courses for testing
 */
export async function seedCourses() {
  // Check if we already have courses in the database
  try {
    const existingCourses = await CourseModel.scan().exec();
    
    if (existingCourses && existingCourses.length > 0) {
      console.log(`Database already contains ${existingCourses.length} courses - skipping seed`);
      return;
    }
    
    // Sample courses data covering different categories and levels
    const coursesData = [
      // Web Development courses
      {
        courseId: uuidv4(),
        teacherId: 'teacher1',
        teacherName: 'John Smith',
        title: 'Web Development with React',
        description: 'Learn modern front-end development with React. Build responsive, interactive UIs with the most popular JavaScript library.',
        category: 'web development',
        image: 'https://example.com/images/react.jpg',
        price: 49.99,
        level: 'beginner',
        status: 'Published'
      },
      {
        courseId: uuidv4(),
        teacherId: 'teacher2',
        teacherName: 'Sarah Johnson',
        title: 'Advanced Full-Stack Development',
        description: 'Master both front-end and back-end development with React, Node.js, and MongoDB. Build complete web applications from scratch.',
        category: 'web development',
        image: 'https://example.com/images/fullstack.jpg',
        price: 79.99,
        level: 'advanced',
        status: 'Published'
      },
      {
        courseId: uuidv4(),
        teacherId: 'teacher3',
        teacherName: 'David Wilson',
        title: 'Backend Development with Node.js',
        description: 'Learn server-side JavaScript development with Node.js and Express. Build RESTful APIs and connect to databases.',
        category: 'web development',
        image: 'https://example.com/images/nodejs.jpg',
        price: 59.99,
        level: 'intermediate',
        status: 'Published'
      },
      
      // Mobile Development courses
      {
        courseId: uuidv4(),
        teacherId: 'teacher4',
        teacherName: 'Emily Chen',
        title: 'Mobile App Development with Flutter',
        description: 'Build beautiful cross-platform mobile apps for iOS and Android with a single codebase using Flutter and Dart.',
        category: 'mobile development',
        image: 'https://example.com/images/flutter.jpg',
        price: 69.99,
        level: 'beginner',
        status: 'Published'
      },
      {
        courseId: uuidv4(),
        teacherId: 'teacher5',
        teacherName: 'Michael Brown',
        title: 'iOS Development with Swift',
        description: 'Learn iOS app development using Swift and Xcode. Build real-world apps and publish them to the App Store.',
        category: 'mobile development',
        image: 'https://example.com/images/swift.jpg',
        price: 74.99,
        level: 'intermediate',
        status: 'Published'
      },
      
      // AI courses
      {
        courseId: uuidv4(),
        teacherId: 'teacher6',
        teacherName: 'Linda Martinez',
        title: 'Machine Learning Fundamentals',
        description: 'Introduction to machine learning algorithms and techniques. Learn how to build and evaluate ML models using Python.',
        category: 'artificial intelligence',
        image: 'https://example.com/images/ml.jpg',
        price: 89.99,
        level: 'beginner',
        status: 'Published'
      },
      {
        courseId: uuidv4(),
        teacherId: 'teacher7',
        teacherName: 'Robert Zhang',
        title: 'Deep Learning with PyTorch',
        description: 'Master deep neural networks with PyTorch. Build image recognition, natural language processing, and generative AI systems.',
        category: 'artificial intelligence',
        image: 'https://example.com/images/pytorch.jpg',
        price: 99.99,
        level: 'advanced',
        status: 'Published'
      },
      
      // Design courses
      {
        courseId: uuidv4(),
        teacherId: 'teacher8',
        teacherName: 'Sophia Garcia',
        title: 'UX/UI Design Principles',
        description: 'Learn essential principles of user experience and interface design. Create intuitive, engaging digital products that users love.',
        category: 'design',
        image: 'https://example.com/images/uxui.jpg',
        price: 59.99,
        level: 'beginner',
        status: 'Published'
      },
      
      // Business courses
      {
        courseId: uuidv4(),
        teacherId: 'teacher9',
        teacherName: 'James Wilson',
        title: 'Digital Marketing Fundamentals',
        description: 'Master the essentials of digital marketing including SEO, social media, content marketing, and analytics.',
        category: 'business',
        image: 'https://example.com/images/marketing.jpg',
        price: 49.99,
        level: 'beginner',
        status: 'Published'
      }
    ];
    
    console.log(`Seeding database with ${coursesData.length} sample courses...`);
    
    // Create all courses
    for (const courseData of coursesData) {
      await CourseModel.create(courseData);
    }
    
    console.log('Database seeded successfully!');
    
  } catch (error) {
    console.error('Error seeding courses:', error);
  }
} 
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import BlogPostModel from '../models/blogPostModel';

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

/**
 * Create a new blog post (draft or submit for review)
 */
export const createPost = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { title, content, category, tags, status, featuredImage } = req.body;
    const userId = req.user?.id;
    const userName = req.user?.name || 'Unknown User';
    const userAvatar = req.user?.imageUrl;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Validate required fields
    if (!title || !content || !category) {
      res.status(400).json({ 
        message: 'Title, content, and category are required' 
      });
      return;
    }

    // Set the status - can be 'draft' or 'pending' when created
    const postStatus = status === 'pending' ? 'pending' : 'draft';

    const now = Date.now();
    const postId = uuidv4();

    const newPost = await BlogPostModel.create({
      postId,
      userId,
      userName,
      userAvatar,
      title,
      content,
      category,
      tags: tags || [],
      status: postStatus,
      featuredImage,
      createdAt: now,
      updatedAt: now,
    });

    res.status(201).json(newPost);
  } catch (error: any) {
    console.error('Error creating blog post:', error);
    res.status(500).json({ 
      message: 'Failed to create blog post', 
      error: error.message 
    });
  }
};

/**
 * Get a single blog post by ID
 */
export const getPostById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { postId } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const post = await BlogPostModel.get({ postId });
    
    if (!post) {
      res.status(404).json({ message: 'Blog post not found' });
      return;
    }

    // Check if user has access to this post
    // If post is not published, only author and teachers/admins can view it
    if (post.status !== 'published' && 
        post.userId !== userId && 
        userRole !== 'teacher' && 
        userRole !== 'admin') {
      res.status(403).json({ 
        message: 'You do not have permission to view this post' 
      });
      return;
    }

    res.status(200).json(post);
  } catch (error: any) {
    console.error('Error getting blog post:', error);
    res.status(500).json({ 
      message: 'Failed to get blog post', 
      error: error.message 
    });
  }
};

/**
 * Update an existing blog post
 */
export const updatePost = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { postId } = req.params;
    const { title, content, category, tags, status, featuredImage } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    // Get the existing post
    const existingPost = await BlogPostModel.get({ postId });
    
    if (!existingPost) {
      res.status(404).json({ message: 'Blog post not found' });
      return;
    }

    // Check if user has permission to update
    // Only author can update their own posts unless they're a teacher/admin
    if (existingPost.userId !== userId && 
        userRole !== 'teacher' && 
        userRole !== 'admin') {
      res.status(403).json({ 
        message: 'You do not have permission to update this post' 
      });
      return;
    }

    // Check if the author is trying to publish directly
    if (userRole !== 'teacher' && userRole !== 'admin' && status === 'published') {
      res.status(403).json({ 
        message: 'Only teachers or admins can publish posts' 
      });
      return;
    }

    // Prepare update object
    const updateData: any = {
      updatedAt: Date.now()
    };

    // Only update fields that are provided
    if (title) updateData.title = title;
    if (content) updateData.content = content;
    if (category) updateData.category = category;
    if (tags) updateData.tags = tags;
    if (featuredImage) updateData.featuredImage = featuredImage;

    // Handle status changes
    if (status) {
      // Students can only set to draft or pending
      if (userRole !== 'teacher' && userRole !== 'admin') {
        updateData.status = status === 'pending' ? 'pending' : 'draft';
      } else {
        updateData.status = status;
        // If teacher is publishing, set publishedAt timestamp
        if (status === 'published' && existingPost.status !== 'published') {
          updateData.publishedAt = Date.now();
          updateData.moderatedBy = userId;
        }
      }
    }

    // Update the post
    const updatedPost = await BlogPostModel.update({ postId }, updateData);

    res.status(200).json(updatedPost);
  } catch (error: any) {
    console.error('Error updating blog post:', error);
    res.status(500).json({ 
      message: 'Failed to update blog post', 
      error: error.message 
    });
  }
};

/**
 * Delete a blog post
 */
export const deletePost = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { postId } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    // Get the existing post
    const existingPost = await BlogPostModel.get({ postId });
    
    if (!existingPost) {
      res.status(404).json({ message: 'Blog post not found' });
      return;
    }

    // Check if user has permission to delete
    // Only author can delete their own posts unless they're a teacher/admin
    if (existingPost.userId !== userId && 
        userRole !== 'teacher' && 
        userRole !== 'admin') {
      res.status(403).json({ 
        message: 'You do not have permission to delete this post' 
      });
      return;
    }

    // Delete the post
    await BlogPostModel.delete({ postId });

    res.status(200).json({ message: 'Blog post deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting blog post:', error);
    res.status(500).json({ 
      message: 'Failed to delete blog post', 
      error: error.message 
    });
  }
};
"use client";

import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import {
  CircleUser,
  BookOpen,
  FileText,
  ShieldCheck,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import Link from "next/link";
import React from "react";

const AdminDashboard = () => {
  const stats = [
    {
      title: "Total Users",
      value: "4,235",
      icon: <CircleUser className="h-8 w-8" />,
      change: "+12%",
      link: "/admin/user-management",
    },
    {
      title: "Total Courses",
      value: "845",
      icon: <BookOpen className="h-8 w-8" />,
      change: "+7.2%",
      link: "/admin/courses",
    },
    {
      title: "Blog Posts",
      value: "325",
      icon: <FileText className="h-8 w-8" />,
      change: "+14.6%",
      link: "/admin/blog-approval",
    },
    {
      title: "Revenue",
      value: "$41,282",
      icon: <DollarSign className="h-8 w-8" />,
      change: "+22.5%",
      link: "/admin/analytics",
    },
  ];

  const pendingActions = [
    {
      title: "Blog Posts Awaiting Approval",
      count: 15,
      link: "/admin/blog-approval",
    },
    {
      title: "New User Registrations",
      count: 32,
      link: "/admin/user-management",
    },
    {
      title: "New Courses Submissions",
      count: 8,
      link: "/admin/courses",
    },
  ];

  return (
    <div className="admin-dashboard">
      <Header
        title="Admin Dashboard"
        subtitle="Manage platform operations and monitor key metrics"
        rightElement={
          <Link href="/admin/analytics">
            <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
              <TrendingUp size={16} />
              <span>Detailed Analytics</span>
            </button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Link href={stat.link} key={index} className="block">
            <Card className="p-6 hover:shadow-md transition-shadow bg-gradient-to-br from-slate-800 to-slate-900 text-white border-slate-700">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-slate-400">{stat.title}</p>
                  <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                  <span className="text-xs font-medium bg-green-900/40 text-green-400 px-2 py-1 rounded-full mt-2 inline-block">
                    {stat.change}
                  </span>
                </div>
                <div className="p-3 bg-slate-700/50 rounded-lg">
                  {stat.icon}
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="p-6 bg-slate-900 border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Pending Actions</h2>
            <ShieldCheck className="h-5 w-5 text-orange-500" />
          </div>
          <div className="space-y-4">
            {pendingActions.map((action, index) => (
              <Link href={action.link} key={index}>
                <div className="flex items-center justify-between p-3 hover:bg-slate-800 rounded-md transition-colors cursor-pointer">
                  <span className="text-slate-300">{action.title}</span>
                  <span className="bg-orange-600/20 text-orange-500 text-xs font-medium px-2 py-1 rounded-full">
                    {action.count}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </Card>

        <Card className="p-6 bg-slate-900 border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Monthly Revenue</h2>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <div className="h-64 flex items-center justify-center">
            <div className="w-full h-full bg-slate-800/50 rounded-md flex items-center justify-center text-slate-500">
              Revenue chart will be displayed here
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 mb-8">
        <Card className="p-6 bg-slate-900 border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recent User Activities</h2>
            <CircleUser className="h-5 w-5 text-blue-500" />
          </div>
          <div className="h-64 flex items-center justify-center">
            <div className="w-full h-full bg-slate-800/50 rounded-md flex items-center justify-center text-slate-500">
              User activity timeline will be displayed here
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;

/**
 * Get all posts with filters
 * For public/students: only published posts
 * For teachers: all posts with filtering by status
 */
export const getPosts = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const { status, category, userId: filterByUserId, limit = 10, lastKey } = req.query;

    console.log("getPosts query params:", { status, category, filterByUserId, limit, lastKey });
    console.log("User role and ID:", { userRole, userId });

    let postsQuery;

    // Different query logic based on user role
    if (userRole === 'teacher' || userRole === 'admin') {
      console.log("User is teacher or admin, applying appropriate filters");
      // Teachers and admins can see all posts, with optional filtering
      if (status) {
        console.log(`Querying posts with status: ${status}`);
        // Use the status index for efficiency
        postsQuery = BlogPostModel.query('status').eq(status as string);
      } else if (filterByUserId) {
        // Query by user ID
        postsQuery = BlogPostModel.query('userId').eq(filterByUserId as string);
      } else {
        // Get all posts, sorted by creation date
        // Fix the scan and sort approach
        postsQuery = BlogPostModel.scan();
        // Will sort by createdAt after retrieving results
      }
    } else {
      // Regular users can only see published posts, or their own posts
      if (filterByUserId && filterByUserId === userId) {
        // Get user's own posts
        postsQuery = BlogPostModel.query('userId').eq(userId as string);
      } else {
        // Get only published posts
        postsQuery = BlogPostModel.query('status').eq('published');
      }
    }

    // Apply category filter if provided
    if (category) {
      postsQuery = postsQuery.filter('category').eq(category as string);
    }

    // Configure pagination
    postsQuery = postsQuery.limit(Number(limit));
    
    // Apply last key for pagination if provided
    if (lastKey) {
      try {
        const decodedLastKey = JSON.parse(Buffer.from(lastKey as string, 'base64').toString());
        postsQuery = postsQuery.startAt(decodedLastKey);
      } catch (e) {
        console.error('Invalid lastKey format:', e);
      }
    }

    // Execute the query
    const result = await postsQuery.exec();
    console.log(`Query returned ${result.count} posts`);
    
    // Format response with pagination info
    const response = {
      posts: Array.isArray(result) ? 
        [...result].sort((a, b) => b.createdAt - a.createdAt) : 
        result,
      lastKey: result.lastKey 
        ? Buffer.from(JSON.stringify(result.lastKey)).toString('base64') 
        : null,
      count: result.length,
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('Error getting blog posts:', error);
    res.status(500).json({ 
      message: 'Failed to get blog posts', 
      error: error.message 
    });
  }
};

/**
 * Teacher moderation - approve, reject, or add comments
 */
export const moderatePost = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { postId } = req.params;
    const { status, moderationComment } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    // Only teachers and admins can moderate
    if (userRole !== 'teacher' && userRole !== 'admin') {
      res.status(403).json({ 
        message: 'Only teachers or admins can moderate posts' 
      });
      return;
    }

    // Get the existing post
    const existingPost = await BlogPostModel.get({ postId });
    
    if (!existingPost) {
      res.status(404).json({ message: 'Blog post not found' });
      return;
    }

    // Prepare update object
    const updateData: any = {
      status,
      moderatedBy: userId,
      updatedAt: Date.now()
    };

    // Add moderation comment if provided
    if (moderationComment) {
      updateData.moderationComment = moderationComment;
    }

    // Set publishedAt timestamp if publishing
    if (status === 'published' && existingPost.status !== 'published') {
      updateData.publishedAt = Date.now();
    }

    // Update the post
    const updatedPost = await BlogPostModel.update({ postId }, updateData);

    res.status(200).json(updatedPost);
  } catch (error: any) {
    console.error('Error moderating blog post:', error);
    res.status(500).json({ 
      message: 'Failed to moderate blog post', 
      error: error.message 
    });
  }
}; 
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

    if (updateData.sections) {
      const sectionsData =
        typeof updateData.sections === "string"
          ? JSON.parse(updateData.sections)
          : updateData.sections;

      updateData.sections = sectionsData.map((section: any) => ({
        ...section,
        sectionId: section.sectionId || uuidv4(),
        chapters: section.chapters.map((chapter: any) => ({
          ...chapter,
          chapterId: chapter.chapterId || uuidv4(),
        })),
      }));
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
  const { fileName, fileType } = req.body;

  if (!fileName || !fileType) {
    res.status(400).json({ message: "File name and type are required" });
    return;
  }

  try {
    const uniqueId = uuidv4();
    const s3Key = `videos/${uniqueId}/${fileName}`;

    const s3Params = {
      Bucket: process.env.S3_BUCKET_NAME || "",
      Key: s3Key,
      Expires: 60,
      ContentType: fileType,
    };

    const uploadUrl = s3.getSignedUrl("putObject", s3Params);
    const videoUrl = `${process.env.CLOUDFRONT_DOMAIN}/videos/${uniqueId}/${fileName}`;

    res.json({
      message: "Upload URL generated successfully",
      data: { uploadUrl, videoUrl },
    });
  } catch (error) {
    res.status(500).json({ message: "Error generating upload URL", error });
  }
};
import * as z from "zod";

// Course Editor Schemas
export const courseSchema = z.object({
  courseTitle: z.string().min(1, "Title is required"),
  courseDescription: z.string().min(1, "Description is required"),
  courseCategory: z.string().min(1, "Category is required"),
  coursePrice: z.string(),
  courseStatus: z.boolean(),
});

export type CourseFormData = z.infer<typeof courseSchema>;

// Chapter Schemas
export const chapterSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  video: z.union([z.string(), z.instanceof(File)]).optional(),
});

export type ChapterFormData = z.infer<typeof chapterSchema>;

// Section Schemas
export const sectionSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

export type SectionFormData = z.infer<typeof sectionSchema>;

// Guest Checkout Schema
export const guestSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export type GuestFormData = z.infer<typeof guestSchema>;

// Notification Settings Schema
export const notificationSettingsSchema = z.object({
  courseNotifications: z.boolean(),
  emailAlerts: z.boolean(),
  smsAlerts: z.boolean(),
  notificationFrequency: z.enum(["immediate", "daily", "weekly"]),
});

export type NotificationSettingsFormData = z.infer<
  typeof notificationSettingsSchema
>;
"use client";

import { CustomFormField } from "@/components/CustomFormField";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { courseSchema } from "@/lib/schemas";
import {
  centsToDollars,
  createCourseFormData,
  uploadAllVideos,
} from "@/lib/utils";
import { openSectionModal, setSections } from "@/state";
import {
  useGetCourseQuery,
  useUpdateCourseMutation,
  useGetUploadVideoUrlMutation,
} from "@/state/api";
import { useAppDispatch, useAppSelector } from "@/state/redux";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import DroppableComponent from "./Droppable";
import ChapterModal from "./ChapterModal";
import SectionModal from "./SectionModal";

const CourseEditor = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { data: course, isLoading, refetch } = useGetCourseQuery(id);
  const [updateCourse] = useUpdateCourseMutation();
  const [getUploadVideoUrl] = useGetUploadVideoUrlMutation();

  const dispatch = useAppDispatch();
  const { sections } = useAppSelector((state) => state.global.courseEditor);

  const methods = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      courseTitle: "",
      courseDescription: "",
      courseCategory: "",
      coursePrice: "0",
      courseStatus: false,
    },
  });

  useEffect(() => {
    if (course) {
      methods.reset({
        courseTitle: course.title,
        courseDescription: course.description,
        courseCategory: course.category,
        coursePrice: centsToDollars(course.price),
        courseStatus: course.status === "Published",
      });
      dispatch(setSections(course.sections || []));
    }
  }, [course, methods]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = async (data: CourseFormData) => {
    try {
      const updatedSections = await uploadAllVideos(
        sections,
        id,
        getUploadVideoUrl
      );

      const formData = createCourseFormData(data, updatedSections);

      await updateCourse({
        courseId: id,
        formData,
      }).unwrap();

      refetch();
    } catch (error) {
      console.error("Failed to update course:", error);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-5 mb-5">
        <button
          className="flex items-center border border-customgreys-dirtyGrey rounded-lg p-2 gap-2 cursor-pointer hover:bg-customgreys-dirtyGrey hover:text-white-100 text-customgreys-dirtyGrey"
          onClick={() => router.push("/teacher/courses", { scroll: false })}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Courses</span>
        </button>
      </div>

      <Form {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <Header
            title="Course Setup"
            subtitle="Complete all fields and save your course"
            rightElement={
              <div className="flex items-center space-x-4">
                <CustomFormField
                  name="courseStatus"
                  label={methods.watch("courseStatus") ? "Published" : "Draft"}
                  type="switch"
                  className="flex items-center space-x-2"
                  labelClassName={`text-sm font-medium ${
                    methods.watch("courseStatus")
                      ? "text-green-500"
                      : "text-yellow-500"
                  }`}
                  inputClassName="data-[state=checked]:bg-green-500"
                />
                <Button
                  type="submit"
                  className="bg-primary-700 hover:bg-primary-600"
                >
                  {methods.watch("courseStatus")
                    ? "Update Published Course"
                    : "Save Draft"}
                </Button>
              </div>
            }
          />

          <div className="flex justify-between md:flex-row flex-col gap-10 mt-5 font-dm-sans">
            <div className="basis-1/2">
              <div className="space-y-4">
                <CustomFormField
                  name="courseTitle"
                  label="Course Title"
                  type="text"
                  placeholder="Write course title here"
                  className="border-none"
                  initialValue={course?.title}
                />

                <CustomFormField
                  name="courseDescription"
                  label="Course Description"
                  type="textarea"
                  placeholder="Write course description here"
                  initialValue={course?.description}
                />

                <CustomFormField
                  name="courseCategory"
                  label="Course Category"
                  type="select"
                  placeholder="Select category here"
                  options={[
                    { value: "technology", label: "Technology" },
                    { value: "science", label: "Science" },
                    { value: "mathematics", label: "Mathematics" },
                    {
                      value: "Artificial Intelligence",
                      label: "Artificial Intelligence",
                    },
                  ]}
                  initialValue={course?.category}
                />

                <CustomFormField
                  name="coursePrice"
                  label="Course Price"
                  type="number"
                  placeholder="0"
                  initialValue={course?.price}
                />
              </div>
            </div>

            <div className="bg-customgreys-darkGrey mt-4 md:mt-0 p-4 rounded-lg basis-1/2">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-2xl font-semibold text-secondary-foreground">
                  Sections
                </h2>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    dispatch(openSectionModal({ sectionIndex: null }))
                  }
                  className="border-none text-primary-700 group"
                >
                  <Plus className="mr-1 h-4 w-4 text-primary-700 group-hover:white-100" />
                  <span className="text-primary-700 group-hover:white-100">
                    Add Section
                  </span>
                </Button>
              </div>

              {isLoading ? (
                <p>Loading course content...</p>
              ) : sections.length > 0 ? (
                <DroppableComponent />
              ) : (
                <p>No sections available</p>
              )}
            </div>
          </div>
        </form>
      </Form>

      <ChapterModal />
      <SectionModal />
    </div>
  );
};

export default CourseEditor;
import Header from "@/components/Header";
import { UserProfile } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import React from "react";

const UserProfilePage = () => {
  return (
    <>
      <Header title="Profile" subtitle="View your profile" />
      <UserProfile
        path="/user/profile"
        routing="path"
        appearance={{
          baseTheme: dark,
          elements: {
            scrollBox: "bg-customgreys-darkGrey",
            navbar: {
              "& > div:nth-child(1)": {
                background: "none",
              },
            },
          },
        }}
      />
    </>
  );
};

export default UserProfilePage;