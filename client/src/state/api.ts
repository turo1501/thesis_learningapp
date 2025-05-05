import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BaseQueryApi, FetchArgs } from "@reduxjs/toolkit/query";
import { User } from "@clerk/nextjs/server";
import { Clerk } from "@clerk/clerk-js";
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';

// Add these interfaces at the beginning of the file after other interfaces
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

export interface BlogPostsResponse {
  posts: BlogPost[];
  lastKey: string | null;
  count: number;
}

// Define the missing UpdateUserCourseProgressData interface
export interface UpdateUserCourseProgressData {
  courseId: string;
  sectionId: string;
  lessonId: string;
  progress: number;
}

// Add MemoryCard and MemoryCardDeck interfaces
export interface MemoryCard {
  cardId: string;
  question: string;
  answer: string;
  chapterId: string;
  sectionId: string;
  difficultyLevel: number;
  lastReviewed: number;
  nextReviewDue: number;
  repetitionCount: number;
  correctCount: number;
  incorrectCount: number;
  deckId?: string;
  deckTitle?: string;
  courseId?: string;
  aiGenerated?: boolean;
}

export interface MemoryCardDeck {
  deckId: string;
  userId: string;
  courseId: string;
  title: string;
  description?: string;
  cards: MemoryCard[];
  intervalModifier: number;
  easyBonus: number;
  totalReviews: number;
  correctReviews: number;
  createdAt: number;
  updatedAt: number;
}

// Add the interface for AI-generated alternatives
export interface AIAlternative {
  question: string;
  answer: string;
}

export interface AIAlternativesResponse {
  alternatives: AIAlternative[];
  originalQuestion: string;
  originalAnswer: string;
}

// Add a chat feedback interface
export interface ChatFeedbackData {
  messageId: string;
  isPositive: boolean;
  comment?: string;
}

// Add course recommendations interface
export interface CourseRecommendationsResponse {
  userId: string;
  recommendations: string;
  timestamp: number;
}

// Add these interfaces for Comments and Notes
export interface Comment {
  commentId: string;
  userId: string;
  text: string;
  timestamp: string;
  userName?: string;
  userAvatar?: string;
}

export interface UserNote {
  noteId: string;
  userId: string;
  courseId: string;
  sectionId: string;
  chapterId: string;
  content: string;
  color: string;
  createdAt?: string;
  updatedAt?: string;
}

// Sửa lỗi liên quan đến replace method
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';

const customBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001",
  prepareHeaders: (headers, { endpoint }) => {
    // Only add auth token for non-public endpoints
    // Check if this is a public endpoint
    const isPublicEndpoint = endpoint.includes('Published') || endpoint.includes('published');
    
    // Get token from localStorage if available and not a public endpoint
    const token = (!isPublicEndpoint && typeof window !== "undefined")
      ? localStorage.getItem("clerk-auth-token")
      : null;
    
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
      console.log("Authorization header set with token:", token.substring(0, 15) + "...");
    } else if (!isPublicEndpoint) {
      console.warn("No auth token found for non-public endpoint");
    }
    
    return headers;
  }
});

/**
 * Utility function to normalize memory card responses
 * This helps handle inconsistent API response formats
 */
const normalizeMemoryCardResponse = (responseData: any): any => {
  console.log('Normalizing memory card response:', responseData);
  
  // Guard against null or undefined responses
  if (!responseData) {
    console.warn('Empty response data received');
    return { cards: [] };
  }
  
  // If response has a data.data structure (common in some APIs)
  if (responseData && typeof responseData === 'object') {
    // If this is an array of decks, ensure each deck has a cards array
    if (Array.isArray(responseData)) {
      console.log('Response is an array, normalizing each item');
      return responseData.map((deck: any) => {
        // Ensure each deck has a cards array
        if (deck && typeof deck === 'object') {
          return {
            ...deck,
            cards: Array.isArray(deck.cards) ? deck.cards : []
          };
        }
        return deck;
      });
    }
    
    // Handle data property
    if ('data' in responseData) {
      console.log('Response has data property, normalizing');
      
      // If data is an array (like multiple decks)
      if (Array.isArray(responseData.data)) {
        console.log('Data is an array, normalizing each item');
        return responseData.data.map((deck: any) => {
          if (deck && typeof deck === 'object') {
            return {
              ...deck,
              cards: Array.isArray(deck.cards) ? deck.cards : []
            };
          }
          return deck;
        });
      }
      
      // If data.data is a complete deck object
      if (responseData.data && 
          typeof responseData.data === 'object') {
        
        const normalizedData = { ...responseData.data };
        
        // Make sure cards is an array
        if (!Array.isArray(normalizedData.cards)) {
          console.warn('Cards is not an array in the response, setting to empty array');
          normalizedData.cards = [];
        }
        
        return normalizedData;
      }
      
      // If data contains the main response we need
      return responseData.data;
    }
    
    // Direct object with potential cards property
    if (responseData.cards !== undefined) {
      // Ensure cards is an array
      if (!Array.isArray(responseData.cards)) {
        console.warn('Cards property exists but is not an array, converting to empty array');
        return {
          ...responseData,
          cards: []
        };
      }
    }
  }
  
  return responseData;
};

// Modify the enhancedBaseQuery function to use the normalizeMemoryCardResponse helper for memory card endpoints
const enhancedBaseQuery = async (args: string | FetchArgs, api: BaseQueryApi, extraOptions = {}) => {
  // Debug the actual URL 
  const url = typeof args === 'string' ? args : args.url;
  console.log(`API Request: ${url}`);
  
  // Check for malformed URLs
  if (typeof args === 'object' && args.url && !args.url.startsWith('/')) {
    // Add leading slash if missing to avoid root URL requests
    console.log(`Fixing URL format: ${args.url}`);
    args.url = `/${args.url}`;
  }
  
  try {
    // Make the request
    const result = await customBaseQuery(args, api, extraOptions);
    
    // Handle successful response
    if (result.data) {
      console.log(`API Response for ${typeof args === 'string' ? args : args.url}: `, result.data);
      
      // Check if this is a memory card related endpoint
      const endpoint = typeof args === 'string' ? args : args.url;
      if (typeof endpoint === 'string' && (
          endpoint.includes('/memory-cards/') || 
          endpoint.includes('/cards/') ||
          endpoint.includes('/due-cards')
        )) {
        console.log('Memory card endpoint detected, normalizing response');
        return { data: normalizeMemoryCardResponse(result.data) };
      }
      
      // Normalize response structure
      // If the response is an object with a 'data' property and not an array itself
      if (!Array.isArray(result.data) && typeof result.data === 'object' && result.data !== null && 'data' in result.data) {
        // If data.data is an array, return it directly to maintain consistent structure
        if (Array.isArray(result.data.data)) {
          console.log('Normalizing response: Returning data.data array directly');
          return { data: result.data.data };
        }
      }
      
      return result;
    }
    
    // Handle error response
    if (result.error) {
      console.error(`API Error (${result.error.status}): ${JSON.stringify(result.error.data)}`);
      
      // If this is a parsing error but we received a 200 response, the server might have returned a non-JSON response
      if (result.error.status === 'PARSING_ERROR' && result.error.originalStatus === 200) {
        const responseData = result.error.data;
        console.error(`Parsing error with original status 200. Raw response:`, responseData);
        
        // Try to gracefully handle non-JSON responses
        if (typeof responseData === 'string') {
          // If it's a string response, try to use it as a message
          return {
            data: {
              message: responseData,
              status: 'success'
            }
          };
        }
        
        // Return a standardized error that's more helpful
        return {
          error: {
            status: 'CUSTOM_ERROR',
            data: {
              message: 'Server returned a non-JSON response',
              originalResponse: responseData
            }
          }
        };
      }
    }
    
    return result;
  } catch (error) {
    console.error(`API Request failed: ${error}`);
    return {
      error: {
        status: 'FETCH_ERROR',
        error: String(error),
        data: {
          message: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      }
    };
  }
};

export const api = createApi({
  baseQuery: enhancedBaseQuery,
  reducerPath: "api",
  tagTypes: [
    "Courses", 
    "Users", 
    "UserCourseProgress", 
    "BlogPosts",
    "BlogPost",
    "Transactions",
    "Assignments",
    "Meetings",
    "Analytics",
    "MemoryCards",
    "MemoryCardDecks",
    "Course", 
    "CourseDetails", 
    "UserCourses", 
    "UserTransactions", 
    "BlogCategories",
    "CourseProgress",
    "CourseChapters",
    "TeacherCourses",
    "Assignment",
    "AdminUsers",
    "Meetings",
    "MemoryCardDecks",
    "MemoryCardDeck",
    "DueCards",
    "CourseComments",
    "UserNotes",
  ],
  endpoints: (build) => ({
    /* 
    ===============
    USER CLERK
    =============== 
    */
    updateUser: build.mutation<User, Partial<User> & { userId: string }>({
      query: ({ userId, ...updatedUser }) => ({
        url: `users/clerk/${userId}`,
        method: "PUT",
        body: updatedUser,
      }),
      invalidatesTags: ["Users"],
    }),

    getUsers: build.query<any[], { role?: string; status?: string; search?: string }>({
      query: (params) => {
        // Create query string from parameters
        const queryParams = new URLSearchParams();
        if (params.role) queryParams.append('role', params.role);
        if (params.status) queryParams.append('status', params.status);
        if (params.search) queryParams.append('search', params.search);
        
        return {
          url: `users/clerk?${queryParams.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["Users"],
    }),

    getUserById: build.query<any, string>({
      query: (userId) => ({
        url: `users/clerk/${userId}`,
        method: "GET",
      }),
      providesTags: (result, error, userId) => [{ type: "Users", id: userId }],
    }),

    updateUserRole: build.mutation<
      any, 
      { userId: string; role: "student" | "teacher" | "admin" }
    >({
      query: ({ userId, role }) => ({
        url: `users/clerk/${userId}/role`,
        method: "PUT",
        body: { role },
      }),
      invalidatesTags: ["Users"],
    }),

    updateUserStatus: build.mutation<
      any, 
      { userId: string; status: "active" | "suspended" }
    >({
      query: ({ userId, status }) => ({
        url: `users/clerk/${userId}/status`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: ["Users"],
    }),

    requestRoleChange: build.mutation<
      any,
      { userId: string; requestedRole: string; reason: string }
    >({
      query: (data) => ({
        url: "role-change/request",
        method: "POST",
        body: data,
      }),
    }),

    getPendingRoleChangeRequests: build.query<
      {
        userId: string;
        firstName: string;
        lastName: string;
        email: string;
        imageUrl?: string;
        currentRole: string;
        requestedRole: string;
        reason: string;
        requestedAt: string;
      }[],
      void
    >({
      query: () => ({
        url: "role-change/pending",
        method: "GET",
      }),
      providesTags: ["Users"],
    }),

    approveRoleChange: build.mutation<any, string>({
      query: (userId) => ({
        url: `role-change/${userId}/approve`,
        method: "PUT",
      }),
      invalidatesTags: ["Users"],
    }),

    rejectRoleChange: build.mutation<any, { userId: string; rejectionReason: string }>({
      query: ({ userId, rejectionReason }) => ({
        url: `role-change/${userId}/reject`,
        method: "PUT",
        body: { rejectionReason },
      }),
      invalidatesTags: ["Users"],
    }),

    createUser: build.mutation<
      any,
      {
        email: string;
        firstName: string;
        lastName: string;
        role: "student" | "teacher" | "admin";
        password?: string;
        sendInvite?: boolean;
      }
    >({
      query: (userData) => ({
        url: "users/clerk",
        method: "POST",
        body: userData,
      }),
      invalidatesTags: ["Users"],
    }),

    resetUserPassword: build.mutation<any, { email: string }>({
      query: (body) => ({
        url: '/users/password-reset',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Users'],
    }),

    /* 
    ===============
    COURSES
    =============== 
    */
    getCourses: build.query<Course[], { category?: string } | void>({
      query: (params = {}) => {
        const { category } = params || {};
        return {
          url: "courses",
          params: category ? { category } : undefined,
        };
      },
      providesTags: ["Courses"],
    }),

    getCourse: build.query<Course, string>({
      query: (id) => {
        // Return a placeholder URL if ID is undefined or empty
        if (!id) {
          throw new Error("Course ID is required");
        }
        return `courses/${id}`;
      },
      providesTags: (result, error, id) => [{ type: "Courses", id }],
    }),

    createCourse: build.mutation<
      Course,
      { teacherId: string; teacherName: string }
    >({
      query: (body) => ({
        url: `courses`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Courses"],
    }),

    updateCourse: build.mutation<
      Course,
      { courseId: string; formData: FormData }
    >({
      query: ({ courseId, formData }) => {
        // Validate courseId
        if (!courseId || courseId === "undefined") {
          throw new Error("Valid course ID is required for updates");
        }
        
        return {
          url: `courses/${courseId}`,
          method: "PUT",
          body: formData,
        };
      },
      invalidatesTags: (result, error, { courseId }) => [
        { type: "Courses", id: courseId },
      ],
    }),

    deleteCourse: build.mutation<{ message: string }, string>({
      query: (courseId) => ({
        url: `courses/${courseId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Courses"],
    }),

    getUploadVideoUrl: build.mutation<
      { uploadUrl: string; videoUrl: string },
      {
        courseId: string;
        chapterId: string;
        sectionId: string;
        fileName: string;
        fileType: string;
      }
    >({
      query: ({ courseId, sectionId, chapterId, fileName, fileType }) => ({
        url: `courses/${courseId}/sections/${sectionId}/chapters/${chapterId}/get-upload-url`,
        method: "POST",
        body: { fileName, fileType },
      }),
    }),

    /* 
    ===============
    TRANSACTIONS
    =============== 
    */
    getTransactions: build.query<Transaction[], string>({
      query: (userId) => `transactions?userId=${userId}`,
    }),
    createStripePaymentIntent: build.mutation<
      { clientSecret: string },
      { amount: number }
    >({
      query: ({ amount }) => ({
        url: `transactions/stripe/payment-intent`,
        method: "POST",
        body: { amount },
      }),
    }),
    createTransaction: build.mutation<Transaction, Partial<Transaction>>({
      query: (transaction) => ({
        url: "transactions",
        method: "POST",
        body: transaction,
      }),
    }),

    /* 
    ===============
    USER COURSE PROGRESS
    =============== 
    */
    getUserEnrolledCourses: build.query<Course[], string>({
      query: (userId) => `users/course-progress/${userId}/enrolled-courses`,
      providesTags: ["Courses", "UserCourseProgress"],
    }),

    getUserCourseProgress: build.query<
      UserCourseProgress,
      { userId: string; courseId: string }
    >({
      query: ({ userId, courseId }) =>
        `users/course-progress/${userId}/courses/${courseId}`,
      providesTags: ["UserCourseProgress"],
    }),

    updateUserCourseProgress: build.mutation<
      UserCourseProgress,
      {
        userId: string;
        courseId: string;
        progressData: {
          sections: SectionProgress[];
        };
      }
    >({
      query: ({ userId, courseId, progressData }) => ({
        url: `users/course-progress/${userId}/courses/${courseId}`,
        method: "PUT",
        body: progressData,
      }),
      invalidatesTags: ["UserCourseProgress"],
      async onQueryStarted(
        { userId, courseId, progressData },
        { dispatch, queryFulfilled }
      ) {
        const patchResult = dispatch(
          api.util.updateQueryData(
            "getUserCourseProgress",
            { userId, courseId },
            (draft) => {
              Object.assign(draft, {
                ...draft,
                sections: progressData.sections,
              });
            }
          )
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),

    // Course Progress - use a different name to avoid duplication
    updateLessonProgress: build.mutation<{ success: boolean }, UpdateUserCourseProgressData>({
      query: ({ courseId, sectionId, lessonId, progress }) => ({
        url: "/user-course-progress",
        method: "PUT",
        body: { courseId, sectionId, lessonId, progress },
      }),
    }),

    // Chat endpoints
    sendChatMessage: build.mutation<
      { response: string; id: string },
      { message: string; userId: string }
    >({
      query: (data) => ({
        url: "chat/message",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: any) => {
        if (!response) {
          throw new Error('Empty response from server');
        }
        return {
          response: response.message || response.response || '',
          id: response.id || uuidv4()
        };
      },
    }),
    
    getChatHistory: build.query<
      { messages: { content: string; role: "user" | "bot"; timestamp: number }[] },
      string
    >({
      query: (userId) => `chat/history/${userId}`,
      transformResponse: (response: any) => {
        if (!response || !Array.isArray(response.messages)) {
          return { messages: [] };
        }
        return response;
      },
    }),

    // Add this endpoint somewhere in the api.endpoints section
    sendChatFeedback: build.mutation<{ success: boolean; message: string }, ChatFeedbackData>({
      query: (data) => ({
        url: '/chat/feedback',
        method: 'POST',
        body: data,
      }),
      // Optional - add an onQueryStarted handler if you want to update the UI optimistically
    }),

    /* 
    ===============
    BLOG POSTS
    =============== 
    */
    getBlogPosts: build.query<BlogPostsResponse, { 
      status?: string;
      endpoint?: string;
      category?: string;
      userId?: string;
      limit?: number;
      lastKey?: string;
    }>({
      query: (params) => {
        // Check if we're using the published endpoint
        if (params.endpoint === 'published') {
          return {
            url: `/blog-posts/published`,
            method: 'GET',
            params: {
              category: params.category,
              limit: params.limit,
              lastKey: params.lastKey
            }
          };
        }
        
        // Standard endpoint with query params
        const queryParams = new URLSearchParams();
        if (params.status) queryParams.append('status', params.status);
        if (params.category) queryParams.append('category', params.category);
        if (params.userId) queryParams.append('userId', params.userId);
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.lastKey) queryParams.append('lastKey', params.lastKey);
        
        return {
          url: `/blog-posts?${queryParams.toString()}`,
          method: 'GET',
        };
      },
      providesTags: (result) => 
        result && result.posts && Array.isArray(result.posts)
          ? [
              ...result.posts.map(post => ({ type: 'BlogPost' as const, id: post.postId })),
              { type: 'BlogPosts' as const, id: 'LIST' }
            ]
          : [{ type: 'BlogPosts' as const, id: 'LIST' }],
    }),
    
    getBlogPost: build.query<BlogPost, string>({
      query: (postId) => ({
        url: `/blog-posts/${postId}`,
        method: 'GET',
      }),
      providesTags: (_, __, postId) => [{ type: 'BlogPost', id: postId }],
    }),
    
    createBlogPost: build.mutation<BlogPost, Partial<BlogPost>>({
      query: (post) => ({
        url: '/blog-posts',
        method: 'POST',
        body: post,
      }),
      invalidatesTags: [{ type: 'BlogPosts', id: 'LIST' }],
    }),
    
    updateBlogPost: build.mutation<BlogPost, { postId: string; post: Partial<BlogPost> }>({
      query: ({ postId, post }) => ({
        url: `/blog-posts/${postId}`,
        method: 'PUT',
        body: post,
      }),
      invalidatesTags: (_, __, { postId }) => [
        { type: 'BlogPost', id: postId },
        { type: 'BlogPosts', id: 'LIST' }
      ],
    }),
    
    deleteBlogPost: build.mutation<{ message: string }, string>({
      query: (postId) => ({
        url: `/blog-posts/${postId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_, __, postId) => [
        { type: 'BlogPost', id: postId },
        { type: 'BlogPosts', id: 'LIST' }
      ],
    }),
    
    moderateBlogPost: build.mutation<BlogPost, { 
      postId: string; 
      status: 'published' | 'rejected'; 
      moderationComment?: string 
    }>({
      query: ({ postId, ...data }) => ({
        url: `/blog-posts/${postId}/moderate`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_, __, { postId }) => [
        { type: 'BlogPost', id: postId },
        { type: 'BlogPosts', id: 'LIST' }
      ],
    }),

    /* 
    ===============
    ASSIGNMENTS
    =============== 
    */
    getCourseAssignments: build.query<Assignment[], string>({
      query: (courseId) => {
        if (!courseId || courseId === "undefined") {
          throw new Error("Course ID is required for assignment listing");
        }
        return `assignments/course/${courseId}`;
      },
      providesTags: (result, error, courseId) => [{ type: "Assignments", id: courseId }],
    }),

    getAssignment: build.query<any, string>({
      query: (assignmentId) => `assignments/${assignmentId}`,
      providesTags: (result, error, assignmentId) => [{ type: 'Assignments', id: assignmentId }],
    }),

    createAssignment: build.mutation<
      Assignment,
      {
        courseId: string;
        title: string;
        description: string;
        dueDate: string;
        points: number;
        status?: "draft" | "published";
        attachments?: any[];
        teacherId?: string;
      }
    >({
      query: (body) => ({
        url: `assignments`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { courseId }) => [
        { type: "Assignments", id: courseId },
        { type: "Assignments", id: "LIST" },
      ],
    }),

    updateAssignment: build.mutation<any, any>({
      query: (assignment) => ({
        url: `assignments/${assignment.assignmentId}`,
        method: 'PUT',
        body: assignment,
      }),
      invalidatesTags: (result, error, { assignmentId, courseId }) => [
        { type: 'Assignments', id: assignmentId },
        { type: 'Assignments', id: courseId }
      ],
    }),

    deleteAssignment: build.mutation<{ message: string }, string>({
      query: (assignmentId) => ({
        url: `assignments/${assignmentId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Assignments"],
    }),

    submitAssignment: build.mutation<
      { message: string },
      { assignmentId: string; content: string }
    >({
      query: ({ assignmentId, content }) => ({
        url: `assignments/${assignmentId}/submit`,
        method: "POST",
        body: { content },
      }),
      invalidatesTags: (result, error, { assignmentId }) => [
        { type: "Assignments", id: assignmentId },
      ],
    }),

    gradeSubmission: build.mutation<
      { message: string },
      {
        assignmentId: string;
        studentId: string;
        grade: number;
        feedback: string;
      }
    >({
      query: ({ assignmentId, studentId, ...body }) => ({
        url: `assignments/${assignmentId}/submissions/${studentId}/grade`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { assignmentId }) => [
        { type: "Assignments", id: assignmentId },
      ],
    }),

    /* 
    ===============
    MEETINGS
    =============== 
    */
    getTeacherMeetings: build.query<Meeting[], string>({
      query: (teacherId) => `/meetings/teacher/${teacherId}`,
    }),

    getStudentMeetings: build.query<Meeting[], string>({
      query: (studentId) => `/meetings/student/${studentId}`,
    }),

    getCourseMeetings: build.query<Meeting[], string>({
      query: (courseId) => `meetings/course/${courseId}`,
      providesTags: (result, error, courseId) => [{ type: "Meetings", id: courseId }],
    }),

    getMeeting: build.query<Meeting, string>({
      query: (meetingId) => `meetings/${meetingId}`,
      providesTags: (result, error, id) => [{ type: "Meetings", id }],
    }),

    createMeeting: build.mutation<
      Meeting,
      {
        title: string;
        description?: string;
        courseId?: string;
        courseName?: string;
        date: string;
        startTime: string;
        duration: number;
        type: "individual" | "group";
        meetingLink?: string;
        location?: string;
        participants?: {
          studentId: string;
          studentName: string;
          studentEmail: string;
        }[];
      }
    >({
      query: (body) => ({
        url: `meetings`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Meetings"],
    }),

    updateMeeting: build.mutation<
      Meeting,
      {
        meetingId: string;
        title?: string;
        description?: string;
        courseId?: string;
        courseName?: string;
        date?: string;
        startTime?: string;
        duration?: number;
        type?: "individual" | "group";
        status?: "scheduled" | "completed" | "cancelled" | "pending";
        meetingLink?: string;
        location?: string;
        participants?: {
          studentId: string;
          studentName: string;
          studentEmail: string;
          status?: "confirmed" | "pending" | "cancelled";
        }[];
      }
    >({
      query: ({ meetingId, ...body }) => ({
        url: `meetings/${meetingId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { meetingId }) => [
        { type: "Meetings", id: meetingId },
      ],
    }),

    deleteMeeting: build.mutation<{ message: string }, string>({
      query: (meetingId) => ({
        url: `meetings/${meetingId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Meetings"],
    }),

    respondToMeeting: build.mutation<
      { message: string },
      { meetingId: string; response: "confirmed" | "cancelled" }
    >({
      query: ({ meetingId, response }) => ({
        url: `meetings/${meetingId}/respond`,
        method: "POST",
        body: { response },
      }),
      invalidatesTags: (result, error, { meetingId }) => [
        { type: "Meetings", id: meetingId },
      ],
    }),

    addMeetingNotes: build.mutation<
      { message: string },
      { meetingId: string; notes: string }
    >({
      query: ({ meetingId, notes }) => ({
        url: `meetings/${meetingId}/notes`,
        method: "POST",
        body: { notes },
      }),
      invalidatesTags: (result, error, { meetingId }) => [
        { type: "Meetings", id: meetingId },
      ],
    }),

    // Meetings
    getMeetingById: build.query<Meeting, string>({
      query: (meetingId) => `/meetings/${meetingId}`,
    }),

    updateMeetingAttendance: build.mutation<
      { success: boolean },
      { meetingId: string; studentId: string; status: "accepted" | "declined" | "pending" }
    >({
      query: ({ meetingId, studentId, status }) => ({
        url: `/meetings/${meetingId}/attendance`,
        method: "PUT",
        body: { studentId, status },
      }),
    }),

    /* 
    ===============
    DASHBOARD
    =============== 
    */
    getDashboardStats: build.query<any, void>({
      query: () => `/dashboard/stats`,
      providesTags: ["Analytics"],
    }),

    getPendingActions: build.query<any, void>({
      query: () => `/dashboard/pending-actions`,
      providesTags: ["Analytics"],
    }),

    getMonthlyRevenue: build.query<any, void>({
      query: () => `/dashboard/monthly-revenue`,
      providesTags: ["Analytics"],
    }),

    getRecentUserActivities: build.query<any, void>({
      query: () => `/dashboard/user-activities`,
      providesTags: ["Analytics"],
    }),

    /* 
    ===============
    ANALYTICS
    =============== 
    */
    getAnalyticsSummary: build.query<any, string>({
      query: (timeRange) => `/analytics/summary?timeRange=${timeRange}`,
      providesTags: ["Analytics"],
    }),

    getUserAnalytics: build.query<any, string>({
      query: (timeRange) => `/analytics/users?timeRange=${timeRange}`,
      providesTags: ["Analytics"],
    }),

    getCourseAnalytics: build.query<any, string>({
      query: (timeRange) => `/analytics/courses?timeRange=${timeRange}`,
      providesTags: ["Analytics"],
    }),

    getRevenueAnalytics: build.query<any, string>({
      query: (timeRange) => `/analytics/revenue?timeRange=${timeRange}`,
      providesTags: ["Analytics"],
    }),

    getPlatformAnalytics: build.query<any, string>({
      query: (timeRange) => `/analytics/platform?timeRange=${timeRange}`,
      providesTags: ["Analytics"],
    }),

    getUploadAssignmentFileUrl: build.mutation<
      { uploadUrl: string; fileUrl: string },
      { fileName: string; fileType: string }
    >({
      query: (data) => ({
        url: 'assignments/get-upload-file-url',
        method: 'POST',
        body: data,
      }),
      // Improved error handling
      transformErrorResponse: (response) => {
        console.error('Error getting upload URL:', response);
        return response;
      },
    }),

    /* 
    ===============
    MEMORY CARDS
    =============== 
    */
    getUserDecks: build.query<MemoryCardDeck[], string>({
      query: (userId) => `/memory-cards/${userId}`,
      providesTags: ["MemoryCardDecks"],
    }),

    getDeck: build.query<MemoryCardDeck, { userId: string; deckId: string }>({
      query: ({ userId, deckId }) => `/memory-cards/${userId}/${deckId}`,
      providesTags: (result, error, { deckId }) => [{ type: "MemoryCardDeck", id: deckId }],
    }),

    createDeck: build.mutation<
      MemoryCardDeck,
      { userId: string; courseId: string; title: string; description?: string }
    >({
      query: (data) => {
        // Validate userId to prevent 'undefined' errors
        if (!data.userId || data.userId === 'undefined') {
          throw new Error('Valid user ID is required for deck creation');
        }
        
        // Validate courseId to prevent 'undefined' errors
        if (!data.courseId || data.courseId === 'undefined') {
          throw new Error('Valid course ID is required for deck creation');
        }
        
        // Ensure title is provided
        if (!data.title) {
          throw new Error('Deck title is required');
        }
        
        return {
          url: "/memory-cards",
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: ["MemoryCardDecks"],
      // Transform the response to ensure we have a consistent format
      transformResponse: (response: any) => {
        console.log('Create deck response:', response);
        
        // If response is nested under data property, extract it
        const deck = response.data || response;
        
        // Ensure the deck has a valid deckId
        if (!deck || !deck.deckId) {
          console.error('Invalid deck response:', deck);
          throw new Error('Server returned an invalid deck object');
        }
        
        return deck;
      },
      // Add error handling
      transformErrorResponse: (response) => {
        console.error('Error creating memory card deck:', response);
        return response;
      }
    }),

    deleteDeck: build.mutation<
      { success: boolean }, 
      { userId: string; deckId: string }
    >({
      query: ({ userId, deckId }) => ({
        url: `/memory-cards/${userId}/${deckId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["MemoryCardDecks"],
    }),

    addCard: build.mutation<
      MemoryCardDeck,
      { 
        userId: string; 
        deckId: string;
        question: string;
        answer: string;
        sectionId: string;
        chapterId: string;
        difficultyLevel: number;
        lastReviewed: number;
        nextReviewDue: number;
        repetitionCount: number;
        correctCount: number;
        incorrectCount: number;
      }
    >({
      query: ({ userId, deckId, ...cardData }) => {
        // Validate userId and deckId to prevent 'undefined' errors
        if (!userId || userId === 'undefined') {
          throw new Error('Valid user ID is required');
        }
        
        if (!deckId || deckId === 'undefined') {
          throw new Error('Valid deck ID is required');
        }
        
        // Validate required card data
        if (!cardData.question || !cardData.answer) {
          throw new Error('Question and answer are required');
        }
        
        return {
          url: `/memory-cards/${userId}/${deckId}/cards`,
          method: "POST",
          body: cardData,
        };
      },
      invalidatesTags: (result, error, { deckId, userId }) => [
        { type: "MemoryCardDeck", id: deckId },
        { type: "MemoryCardDecks", id: userId },
        "DueCards",
      ],
      async onQueryStarted({ userId, deckId, ...cardData }, { dispatch, queryFulfilled }) {
        try {
          // Wait for the mutation to complete
          const { data: updatedDeck } = await queryFulfilled;
          
          // Optimistically update the deck in the cache
          dispatch(
            api.util.updateQueryData('getDeck', { userId, deckId }, (draft: MemoryCardDeck) => {
              // If there's no cards array yet, create one
              if (!draft.cards) {
                draft.cards = [];
              }
              
              // Add the new card if it's not already there
              const newCardId = updatedDeck.cards[updatedDeck.cards.length - 1]?.cardId;
              if (newCardId && !draft.cards.some((card: MemoryCard) => card.cardId === newCardId)) {
                draft.cards.push(updatedDeck.cards[updatedDeck.cards.length - 1]);
              }
              
              // Update timestamp
              draft.updatedAt = Date.now();
            })
          );
          
          // Also update the user's decks list if it exists in cache
          dispatch(
            api.util.updateQueryData('getUserDecks', userId, (draft: MemoryCardDeck[]) => {
              const deckIndex = draft.findIndex(d => d.deckId === deckId);
              if (deckIndex !== -1) {
                draft[deckIndex] = updatedDeck;
              }
            })
          );
        } catch (error) {
          console.error("Error optimistically updating card:", error);
        }
      },
      // Add error handling
      transformErrorResponse: (response) => {
        console.error('Error adding card to deck:', response);
        return response;
      }
    }),
    
    addCardsBatch: build.mutation<
      { deck: MemoryCardDeck; cardsAdded: number },
      {
        userId: string;
        deckId: string;
        cards: Array<{
          question: string;
          answer: string;
          chapterId?: string;
          sectionId?: string;
          difficultyLevel?: number;
        }>;
      }
    >({
      query: ({ userId, deckId, cards }) => ({
        url: `/memory-cards/${userId}/${deckId}/cards/batch`,
        method: "POST",
        body: { cards },
      }),
      invalidatesTags: (result, error, { deckId, userId }) => [
        { type: "MemoryCardDeck", id: deckId },
        { type: "MemoryCardDecks", id: userId },
        "DueCards",
      ],
    }),
    
    updateCard: build.mutation<
      MemoryCardDeck,
      {
        userId: string;
        deckId: string;
        cardId: string;
        question?: string;
        answer?: string;
        difficultyLevel?: number;
      }
    >({
      query: ({ userId, deckId, cardId, ...cardData }) => ({
        url: `/memory-cards/${userId}/${deckId}/cards/${cardId}`,
        method: "PUT",
        body: cardData,
      }),
      invalidatesTags: (result, error, { deckId }) => [
        { type: "MemoryCardDeck", id: deckId },
        "DueCards",
      ],
    }),
    
    deleteCard: build.mutation<
      MemoryCardDeck,
      { userId: string; deckId: string; cardId: string }
    >({
      query: ({ userId, deckId, cardId }) => ({
        url: `/memory-cards/${userId}/${deckId}/cards/${cardId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { deckId }) => [
        { type: "MemoryCardDeck", id: deckId },
        "DueCards",
      ],
    }),
    
    getDueCards: build.query<
      { dueCards: MemoryCard[]; totalDue: number },
      { userId: string; courseId?: string; deckId?: string; limit?: number }
    >({
      query: ({ userId, courseId, deckId, limit = 20 }) => {
        const url = `/memory-cards/${userId}/due-cards`;
        const params = new URLSearchParams();
        if (courseId) params.append("courseId", courseId);
        if (deckId) params.append("deckId", deckId);
        if (limit) params.append("limit", limit.toString());
        
        // Log the query URL for debugging
        const fullUrl = `${url}?${params.toString()}`;
        console.log(`Fetching due cards with URL: ${fullUrl}`);
        return fullUrl;
      },
      providesTags: ["DueCards"],
      // Add better error handling
      onQueryStarted: async (_, { queryFulfilled }) => {
        try {
          await queryFulfilled;
        } catch (error) {
          console.error('Error in getDueCards query:', error);
        }
      }
    }),
    
    submitCardReview: build.mutation<
      { success: boolean; nextReview: number },
      {
        userId: string;
        deckId: string;
        cardId: string;
        difficultyRating: number;
        isCorrect: boolean;
      }
    >({
      query: ({ userId, deckId, cardId, ...reviewData }) => ({
        url: `/memory-cards/${userId}/${deckId}/cards/${cardId}/review`,
        method: "POST",
        body: reviewData,
      }),
      invalidatesTags: ["DueCards", "MemoryCardDecks"],
    }),
    
    generateCardsFromCourse: build.mutation<
      { deck: MemoryCardDeck; cardsGenerated: number },
      {
        userId: string;
        courseId: string;
        deckTitle: string;
        deckDescription?: string;
      }
    >({
      query: (data) => ({
        url: "/memory-cards/generate",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["MemoryCardDecks"],
    }),
    
    generateAIAlternatives: build.mutation<
      AIAlternativesResponse,
      {
        userId: string;
        question: string;
        answer: string;
        count?: number;
      }
    >({
      query: ({ userId, ...data }) => ({
        url: `/memory-cards/${userId}/ai-alternatives`,
        method: "POST",
        body: data,
      }),
    }),

    // Add this new endpoint
    getChatCourseRecommendations: build.query<CourseRecommendationsResponse, string>({
      query: (userId) => `chat/recommendations/${userId}`,
      transformResponse: (response: any) => {
        if (!response) {
          return { 
            userId: '',
            recommendations: 'No recommendations available at this time.',
            timestamp: Date.now()
          };
        }
        return response;
      },
    }),

    // Comment endpoints
    getChapterComments: build.query<Comment[], { courseId: string; sectionId: string; chapterId: string }>({
      query: ({ courseId, sectionId, chapterId }) => ({
        url: `/comments/${courseId}/sections/${sectionId}/chapters/${chapterId}/comments`,
        method: "GET",
      }),
      providesTags: ["CourseComments"],
    }),

    addComment: build.mutation<Comment, { courseId: string; sectionId: string; chapterId: string; text: string }>({
      query: ({ courseId, sectionId, chapterId, text }) => ({
        url: `/comments/${courseId}/sections/${sectionId}/chapters/${chapterId}/comments`,
        method: "POST",
        body: { text },
      }),
      invalidatesTags: ["CourseComments"],
    }),

    deleteComment: build.mutation<void, { courseId: string; sectionId: string; chapterId: string; commentId: string }>({
      query: ({ courseId, sectionId, chapterId, commentId }) => ({
        url: `/comments/${courseId}/sections/${sectionId}/chapters/${chapterId}/comments/${commentId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["CourseComments"],
    }),

    // Note endpoints
    getUserCourseNotes: build.query<UserNote[], { courseId: string }>({
      query: ({ courseId }) => ({
        url: `/user-notes/${courseId}`,
        method: "GET",
      }),
      providesTags: ["UserNotes"],
    }),

    getChapterNotes: build.query<UserNote[], { courseId: string; sectionId: string; chapterId: string }>({
      query: ({ courseId, sectionId, chapterId }) => ({
        url: `/user-notes/${courseId}/sections/${sectionId}/chapters/${chapterId}`,
        method: "GET",
      }),
      providesTags: ["UserNotes"],
    }),

    createNote: build.mutation<UserNote, { courseId: string; sectionId: string; chapterId: string; content: string; color?: string }>({
      query: (noteData) => ({
        url: `/user-notes`,
        method: "POST",
        body: noteData,
      }),
      invalidatesTags: ["UserNotes"],
    }),

    updateNote: build.mutation<UserNote, { noteId: string; content?: string; color?: string }>({
      query: ({ noteId, ...data }) => ({
        url: `/user-notes/${noteId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["UserNotes"],
    }),

    deleteNote: build.mutation<void, { noteId: string }>({
      query: ({ noteId }) => ({
        url: `/user-notes/${noteId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["UserNotes"],
    }),
  }),
});

export const {
  useUpdateUserMutation,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
  useGetCoursesQuery,
  useGetCourseQuery,
  useGetUploadVideoUrlMutation,
  useGetTransactionsQuery,
  useCreateTransactionMutation,
  useCreateStripePaymentIntentMutation,
  useGetUserEnrolledCoursesQuery,
  useGetUserCourseProgressQuery,
  useUpdateUserCourseProgressMutation,
  useSendChatMessageMutation,
  useGetChatHistoryQuery,
  useGetBlogPostsQuery,
  useGetBlogPostQuery,
  useCreateBlogPostMutation,
  useUpdateBlogPostMutation,
  useDeleteBlogPostMutation,
  useModerateBlogPostMutation,
  useGetCourseAssignmentsQuery,
  useGetAssignmentQuery,
  useCreateAssignmentMutation,
  useUpdateAssignmentMutation,
  useDeleteAssignmentMutation,
  useSubmitAssignmentMutation,
  useGradeSubmissionMutation,
  useGetTeacherMeetingsQuery,
  useGetStudentMeetingsQuery,
  useGetCourseMeetingsQuery,
  useGetMeetingQuery,
  useCreateMeetingMutation,
  useUpdateMeetingMutation,
  useDeleteMeetingMutation,
  useRespondToMeetingMutation,
  useAddMeetingNotesMutation,
  useUpdateLessonProgressMutation,
  useGetMeetingByIdQuery,
  useUpdateMeetingAttendanceMutation,
  useGetUsersQuery,
  useUpdateUserRoleMutation,
  useUpdateUserStatusMutation,
  useRequestRoleChangeMutation,
  useGetPendingRoleChangeRequestsQuery,
  useApproveRoleChangeMutation,
  useRejectRoleChangeMutation,
  useCreateUserMutation,
  useResetUserPasswordMutation,
  useGetUserByIdQuery,
  useGetDashboardStatsQuery,
  useGetPendingActionsQuery,
  useGetMonthlyRevenueQuery,
  useGetRecentUserActivitiesQuery,
  useGetAnalyticsSummaryQuery,
  useGetUserAnalyticsQuery,
  useGetCourseAnalyticsQuery,
  useGetRevenueAnalyticsQuery,
  useGetPlatformAnalyticsQuery,
  useGetUploadAssignmentFileUrlMutation,
  useGetUserDecksQuery,
  useGetDeckQuery,
  useCreateDeckMutation,
  useDeleteDeckMutation,
  useAddCardMutation,
  useUpdateCardMutation,
  useDeleteCardMutation,
  useGetDueCardsQuery,
  useSubmitCardReviewMutation,
  useGenerateCardsFromCourseMutation,
  useGenerateAIAlternativesMutation,
  useAddCardsBatchMutation,
  useSendChatFeedbackMutation,
  useGetChatCourseRecommendationsQuery,
  useGetChapterCommentsQuery,
  useAddCommentMutation,
  useDeleteCommentMutation,
  useGetUserCourseNotesQuery,
  useGetChapterNotesQuery,
  useCreateNoteMutation,
  useUpdateNoteMutation,
  useDeleteNoteMutation,
} = api;
