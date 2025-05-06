# Learning Management System (LMS) Platform

![LMS Platform](https://img.shields.io/badge/LMS-Platform-blue) ![Version](https://img.shields.io/badge/version-1.0.0-green) ![License](https://img.shields.io/badge/license-MIT-yellow)

A modern, full-stack learning management system built with Next.js, TypeScript, and Node.js. This comprehensive platform delivers a feature-rich solution for online education with role-based access control and distinct features for students, teachers, and administrators.

## 📑 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Installation Guide](#-installation-guide)
  - [Prerequisites](#prerequisites)
  - [Setting Up Frontend](#setting-up-frontend)
  - [Setting Up Backend](#setting-up-backend)
  - [Setting Up DynamoDB Local](#setting-up-dynamodb-local)
  - [Environment Variables](#environment-variables)
- [Project Architecture](#-project-architecture)
- [Directory Structure](#-directory-structure)
- [Role-Based Access Control](#-role-based-access-control)
- [Core Components](#-core-components)
- [Authentication & Authorization](#-authentication--authorization)
- [API Implementation](#-api-implementation)
- [Data Models](#-data-models)
- [State Management](#-state-management)
- [Data Handling Patterns](#-data-handling-patterns)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

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

## 📥 Installation Guide

### Prerequisites

Before installing the application, make sure you have the following installed:

- Node.js (v18 or higher)
- npm or yarn
- AWS CLI (for DynamoDB local setup)
- Git

### Setting Up Frontend

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/thesis_learningapp.git
   cd thesis_learningapp
   ```

2. Install dependencies:
   ```bash
   # Install root dependencies
   npm install
   
   # Install client dependencies
   cd client
   npm install
   ```

3. Set up environment variables:
   ```bash
   # Create a .env.local file in the client directory
   cp .env.example .env.local
   # Edit the .env.local file with your credentials
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Setting Up Backend

1. Navigate to the server directory:
   ```bash
   cd ../server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   # Create a .env file in the server directory
   cp .env.example .env
   # Edit the .env file with your credentials
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Setting Up DynamoDB Local

1. Install DynamoDB local:
   ```bash
   # Install DynamoDB local
   npm install -g dynamodb-local
   
   # Start DynamoDB local
   dynamodb-local -port 8000
   ```
   
   Alternatively, you can use Docker:
   ```bash
   docker run -p 8000:8000 amazon/dynamodb-local
   ```

2. Seed the database:
   ```bash
   # From the server directory
   npm run seed
   ```

### Environment Variables

#### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

#### Backend (.env)
```
PORT=5000
NODE_ENV=development
AWS_REGION=us-east-2
AWS_ACCESS_KEY_ID=dummyKey123
AWS_SECRET_ACCESS_KEY=dummyKey123
DYNAMODB_ENDPOINT=http://localhost:8000
CLERK_SECRET_KEY=your_clerk_secret_key
```

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
│   │   │   │   ├── teacher/          # Teacher-specific pages
│   │   │   │   └── user/             # Student-specific pages
│   │   │   └── (nondashboard)/       # Public pages
│   │   ├── components/               # Reusable components
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

## 🔄 Core Components

The application is built using a set of core reusable components:

- **UI Components**: Button, Card, Avatar, Input, etc.
- **Feature Components**: CourseCard, CourseContent, AssignmentSubmission, etc.
- **Layout Components**: DashboardLayout, AuthLayout, etc.

## 🚀 Deployment

### Frontend Deployment

1. Build the frontend application:
   ```bash
   cd client
   npm run build
   ```

2. Deploy to your hosting service (Vercel, Netlify, AWS Amplify, etc.)

### Backend Deployment

1. Build the backend application:
   ```bash
   cd server
   npm run build
   ```

2. Deploy to your hosting service (AWS Lambda, EC2, Heroku, etc.)

### Database Deployment

For production, set up a DynamoDB instance in your AWS account.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.