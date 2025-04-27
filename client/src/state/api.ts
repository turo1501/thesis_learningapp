import { createApi, fetchBaseQuery, retry } from "@reduxjs/toolkit/query/react";
import { toast } from "sonner";
import type { 
  BaseQueryFn, 
  FetchArgs, 
  FetchBaseQueryError, 
  FetchBaseQueryMeta
} from '@reduxjs/toolkit/query';

// Type definitions
export interface BaseResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface BlogPost {
  postId: string;
  title: string;
  content: string;
  userId: string;
  userName?: string;
  category: string;
  tags?: string[];
  status: 'draft' | 'published' | 'archived';
  featuredImage?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  readTime?: number;
  likes?: number;
  commentCount?: number;
}

export interface BlogPostsResponse {
  posts: BlogPost[];
  lastKey?: string;
  count: number;
}

// Define the missing UpdateUserCourseProgressData interface
export interface UpdateUserCourseProgressData {
  courseId: string;
  sectionId: string;
  lessonId: string;
  progress: number;
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


// Enhanced base query with logging and error handling
const dynamicBaseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError,
  {},
  FetchBaseQueryMeta
> = async (args, api, extraOptions) => {
  const url = typeof args === 'string' ? args : args.url;
  console.log(`API Request to ${url}:`, args);

  try {
    const result = await baseQueryWithRetry(args, api, extraOptions);

    // Log the response
    console.log(`API Response for ${url}:`, result);

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

// Define our API service
export const api = createApi({
  baseQuery: customBaseQuery,
  reducerPath: "api",
  tagTypes: ["Courses", "Users", "UserCourseProgress", "BlogPosts", "BlogPost", "Assignments", "Meetings"],

  endpoints: (build) => ({
    /* 
    ===============
    CHAT ENDPOINTS
    =============== 
    */
    getChats: build.query<Chat[], string>({
      query: (userId) => ({
        url: `/chats/user/${userId}`,
        method: 'GET',
      }),
      providesTags: (result) => 
        result 
          ? [
              ...result.map(({ id }) => ({ type: 'Chat' as const, id })),
              { type: 'Chat' as const, id: 'LIST' }
            ]
          : [{ type: 'Chat' as const, id: 'LIST' }],
    }),
    
    getChatById: build.query<Chat, string>({
      query: (chatId) => ({
        url: `/chats/${chatId}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, chatId) => [{ type: 'Chat', id: chatId }],
    }),
    
    createChat: build.mutation<Chat, { users: string[]; type: 'direct' | 'group'; name?: string }>({
      query: (data) => ({
        url: '/chats',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Chat', id: 'LIST' }],
    }),
    
    getMessages: build.query<{ messages: Message[]; hasMore: boolean }, { chatId: string; limit?: number; before?: string }>({
      query: ({ chatId, limit = 50, before }) => {
        const queryParams = new URLSearchParams();
        queryParams.append('limit', limit.toString());
        if (before) queryParams.append('before', before);
        
        return {
          url: `/chats/${chatId}/messages?${queryParams.toString()}`,
          method: 'GET',
        };
      },
      providesTags: (_result, _error, { chatId }) => [{ type: 'Message', id: chatId }],
    }),
    
    sendMessage: build.mutation<Message, { chatId: string; content: string; sender: string; attachments?: { url: string; type: string; name: string }[] }>({
      query: ({ chatId, ...data }) => ({
        url: `/chats/${chatId}/messages`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_result, _error, { chatId }) => [
        { type: 'Message', id: chatId },
        { type: 'Chat', id: chatId },
        { type: 'Chat', id: 'LIST' },
      ],
    }),
    
    readMessages: build.mutation<void, { chatId: string; userId: string }>({
      query: ({ chatId, userId }) => ({
        url: `/chats/${chatId}/read`,
        method: 'POST',
        body: { userId },
      }),
      invalidatesTags: (_result, _error, { chatId }) => [
        { type: 'Chat', id: chatId },
        { type: 'Chat', id: 'LIST' },
      ],
    }),
    
    /* 
    ===============
    COMMUNITY ENDPOINTS
    =============== 
    */
    getCommunities: build.query<Community[], { type?: 'public' | 'private'; search?: string }>({
      query: ({ type, search }) => {
        const queryParams = new URLSearchParams();
        if (type) queryParams.append('type', type);
        if (search) queryParams.append('search', search);
        
        return {
          url: `/communities?${queryParams.toString()}`,
          method: 'GET',
        };
      },
      providesTags: (result) => 
        result 
          ? [
              ...result.map(({ id }) => ({ type: 'Community' as const, id })),
              { type: 'Community' as const, id: 'LIST' }
            ]
          : [{ type: 'Community' as const, id: 'LIST' }],
    }),
    
    getCommunityById: build.query<Community, string>({
      query: (communityId) => ({
        url: `/communities/${communityId}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, communityId) => [{ type: 'Community', id: communityId }],
    }),
    
    createCommunity: build.mutation<Community, Partial<Community>>({
      query: (data) => ({
        url: '/communities',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Community', id: 'LIST' }],
    }),
    
    joinCommunity: build.mutation<void, { communityId: string; userId: string }>({
      query: ({ communityId, userId }) => ({
        url: `/communities/${communityId}/members`,
        method: 'POST',
        body: { userId },
      }),
      invalidatesTags: (_result, _error, { communityId }) => [
        { type: 'Community', id: communityId },
        { type: 'Community', id: 'LIST' },
      ],
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
      invalidatesTags: (_result, _error, { communityId }) => [
        { type: 'Community', id: communityId },
        { type: 'Community', id: 'LIST' },
      ],
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
      providesTags: (_result, _error, postId) => [{ type: 'BlogPost', id: postId }],
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
      invalidatesTags: (_result, _error, { postId }) => [
        { type: 'BlogPost', id: postId },
        { type: 'BlogPosts', id: 'LIST' }
      ],
    }),
    
    deleteBlogPost: build.mutation<void, string>({
      query: (postId) => ({
        url: `/blog-posts/${postId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, postId) => [
        { type: 'BlogPost', id: postId },
        { type: 'BlogPosts', id: 'LIST' }
      ],
    }),
    
    likeBlogPost: build.mutation<{ likes: number }, { postId: string; userId: string }>({
      query: ({ postId, userId }) => ({
        url: `/blog-posts/${postId}/like`,
        method: 'POST',
        body: { userId },
      }),
      invalidatesTags: (_result, _error, { postId }) => [
        { type: 'BlogPost', id: postId }
      ],
    }),
    
    getComments: build.query<BlogComment[], { postId: string }>({
      query: ({ postId }) => ({
        url: `/blog-posts/${postId}/comments`,
        method: 'GET',
      }),
      providesTags: (_result, _error, { postId }) => [
        { type: 'Comment', id: postId }
      ],
    }),
    
    addComment: build.mutation<BlogComment, { postId: string; comment: { content: string; userId: string } }>({
      query: ({ postId, comment }) => ({
        url: `/blog-posts/${postId}/comments`,
        method: 'POST',
        body: comment,
      }),
      invalidatesTags: (_result, _error, { postId }) => [
        { type: 'Comment', id: postId },
        { type: 'BlogPost', id: postId }
      ],
    }),

    /* 
    ===============
    ASSIGNMENTS
    =============== 
    */
    getCourseAssignments: build.query<Assignment[], string>({
      query: (courseId) => `assignments/course/${courseId}`,
      providesTags: (result, error, courseId) => [{ type: "Assignments", id: courseId }],
    }),

    getAssignment: build.query<Assignment, string>({
      query: (assignmentId) => `assignments/${assignmentId}`,
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
        attachments?: string[];
      }
    >({
      query: (body) => ({
        url: `assignments`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { courseId }) => [
        { type: "Assignments", id: courseId },
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
  }),
});

// Export hooks for usage in functional components
export const {
  // Chat hooks
  useGetChatsQuery,
  useGetChatByIdQuery,
  useCreateChatMutation,
  useGetMessagesQuery,
  useSendMessageMutation,
  useReadMessagesMutation,
  
  // Community hooks
  useGetCommunitiesQuery,
  useGetCommunityByIdQuery,
  useCreateCommunityMutation,
  useJoinCommunityMutation,
  useLeaveCommunityMutation,
  
  // Blog hooks
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

} = api;
