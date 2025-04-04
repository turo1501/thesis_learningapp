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

export interface Community {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  type: 'public' | 'private';
  memberCount: number;
  createdAt: string;
  updatedAt: string;
  topics?: string[];
  ownerId: string;
}

export interface Chat {
  id: string;
  users: string[];
  type: 'direct' | 'group';
  name?: string;
  lastMessage?: {
    content: string;
    sender: string;
    timestamp: string;
  };
  createdAt: string;
  updatedAt: string;
  unreadCount?: number;
}

export interface Message {
  id: string;
  chatId: string;
  content: string;
  sender: string;
  timestamp: string;
  readBy: string[];
  attachments?: {
    id: string;
    url: string;
    type: string;
    name: string;
  }[];
}

export interface BlogComment {
  id: string;
  postId: string;
  userId: string;
  userName?: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  likes?: number;
  replies?: BlogComment[];
}

// Define our custom base query with error handling
const baseQueryWithRetry = retry(fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api",
  prepareHeaders: (headers) => {
    // Add authorization header with JWT token if available
    const token = localStorage.getItem("token");
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
}), { maxRetries: 3 });

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
  baseQuery: dynamicBaseQuery,
  tagTypes: [
    'User', 
    'Course', 
    'Module', 
    'Assignment', 
    'Submission', 
    'Quiz',
    'Question',
    'Attempt',
    'Coin',
    'Reward',
    'Stats',
    'Enrollment',
    'Community',
    'Chat',
    'Message',
    'BlogPost',
    'BlogPosts',
    'Comment'
  ],
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
    
    leaveCommunity: build.mutation<void, { communityId: string; userId: string }>({
      query: ({ communityId, userId }) => ({
        url: `/communities/${communityId}/members/${userId}`,
        method: 'DELETE',
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
  useLikeBlogPostMutation,
  useGetCommentsQuery,
  useAddCommentMutation,
} = api;
