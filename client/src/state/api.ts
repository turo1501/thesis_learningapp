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

// Sửa lỗi liên quan đến replace method
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';

const customBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001",
  prepareHeaders: (headers) => {
    // Get token from localStorage if available
    const token = typeof window !== "undefined" 
      ? localStorage.getItem("clerk-auth-token")
      : null;
    
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
      console.log("Authorization header set with token");
    }
    
    return headers;
  }
});

// Add request and response handling for better debugging and error management
const enhancedBaseQuery = async (args: string | FetchArgs, api: BaseQueryApi, extraOptions = {}) => {
  console.log(`API Request: ${typeof args === 'string' ? args : args.url}`);
  
  try {
    // Make the request
    const result = await customBaseQuery(args, api, extraOptions);
    
    // Handle successful response
    if (result.data) {
      console.log(`API Response for ${typeof args === 'string' ? args : args.url}: `, result.data);
      
      // Normalize response structure
      // If the response is an object with a 'data' property and not an array itself
      if (!Array.isArray(result.data) && typeof result.data === 'object' && result.data !== null && 'data' in result.data) {
        // If data.data is an array, return it directly to maintain consistent structure
        if (Array.isArray(result.data.data)) {
          console.log('Normalizing response: Returning data.data array directly');
          return { data: result.data.data };
        }
      }
    }
    
    // Handle error response
    if (result.error) {
      console.error(`API Error (${result.error.status}): ${JSON.stringify(result.error.data)}`);
      
      // You can add custom error transformation here if needed
      // For example, standardizing error messages
    }
    
    return result;
  } catch (error) {
    console.error(`API Request failed: ${error}`);
    return {
      error: {
        status: 'FETCH_ERROR',
        error: String(error)
      }
    };
  }
};

export const api = createApi({
  baseQuery: enhancedBaseQuery,
  reducerPath: "api",
  tagTypes: ["Courses", "Users", "UserCourseProgress", "BlogPosts", "BlogPost", "Assignments", "Meetings", "Analytics"],
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

    /* 
    ===============
    BLOG POSTS
    =============== 
    */
    getBlogPosts: build.query<BlogPostsResponse, { 
      status?: string;
      category?: string;
      userId?: string;
      limit?: number;
      lastKey?: string;
    }>({
      query: (params) => {
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
        result 
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

    getAssignment: build.query<Assignment, string>({
      query: (assignmentId) => {
        if (!assignmentId || assignmentId === "undefined") {
          throw new Error("Assignment ID is required");
        }
        return `assignments/${assignmentId}`;
      },
      providesTags: (result, error, id) => [{ type: "Assignments", id }],
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

    updateAssignment: build.mutation<
      Assignment,
      {
        assignmentId: string;
        courseId: string;
        title?: string;
        description?: string;
        dueDate?: string;
        points?: number;
        status?: string;
        attachments?: string[];
      }
    >({
      query: ({ assignmentId, ...body }) => ({
        url: `assignments/${assignmentId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { assignmentId, courseId }) => [
        { type: "Assignments", id: assignmentId },
        { type: "Assignments", id: courseId },
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
      query: (body) => ({
        url: 'assignments/get-upload-file-url',
        method: 'POST',
        body,
      }),
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
} = api;
