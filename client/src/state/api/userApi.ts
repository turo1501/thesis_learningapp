import { api } from "@/state/api";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "student" | "teacher" | "admin";
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  lastActive?: string;
  preferences?: UserPreferences;
  stats?: UserStats;
}

export interface UserPreferences {
  theme: "light" | "dark" | "system";
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  accessibility: {
    fontSize: number;
    contrast: "default" | "high";
    reduceMotion: boolean;
  };
  language: string;
}

export interface UserStats {
  totalCoursesEnrolled?: number;
  totalCoursesCompleted?: number;
  averageQuizScore?: number;
  totalLearningTime?: number; // in minutes
  lastLogin?: string;
  streakDays?: number;
  level?: number;
  points?: number;
}

export interface AuthResult {
  user: User;
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: "student" | "teacher";
}

export interface UpdateUserRequest {
  id: string;
  data: Partial<Omit<User, "id" | "email" | "createdAt" | "updatedAt" | "stats">>;
}

export interface UpdatePreferencesRequest {
  userId: string;
  preferences: Partial<UserPreferences>;
}

type ApiResponse<T> = { success: boolean; data: T };

// Define the endpoints with type assertions to bypass TypeScript tag errors
const extendedApi = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResult, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      transformResponse: (response: ApiResponse<AuthResult>) => response.data,
    }),
    
    register: builder.mutation<AuthResult, RegisterRequest>({
      query: (data) => ({
        url: '/auth/register',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: ApiResponse<AuthResult>) => response.data,
    }),
    
    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: () => [
        { type: 'User', id: 'CURRENT' },
      ],
    }),
    
    getCurrentUser: builder.query<User, void>({
      query: () => '/users/me',
      transformResponse: (response: ApiResponse<User>) => response.data,
      providesTags: ((
        _result: User | undefined, 
        _error: unknown
      ) => [
        { type: 'User', id: 'CURRENT' },
      ]) as any,
    }),
    
    getUserById: builder.query<User, string>({
      query: (id) => `/users/${id}`,
      transformResponse: (response: ApiResponse<User>) => response.data,
      providesTags: ((
        _result: User | undefined, 
        _error: unknown, 
        id: string
      ) => [
        { type: 'User', id },
      ]) as any,
    }),
    
    getUsers: builder.query<User[], { role?: string; search?: string }>({
      query: ({ role, search }) => {
        const queryParams = new URLSearchParams();
        if (role) queryParams.append('role', role);
        if (search) queryParams.append('search', search);
        return `/users?${queryParams.toString()}`;
      },
      transformResponse: (response: ApiResponse<User[]>) => response.data,
      providesTags: ((result: User[] | undefined) =>
        result
          ? [
              ...result.map(({ id }: { id: string }) => ({ type: 'User', id })),
              { type: 'User', id: 'LIST' },
            ]
          : [{ type: 'User', id: 'LIST' }]) as any,
    }),
    
    updateUser: builder.mutation<User, UpdateUserRequest>({
      query: ({ id, data }) => ({
        url: `/users/${id}`,
        method: 'PATCH',
        body: data,
      }),
      transformResponse: (response: ApiResponse<User>) => response.data,
      invalidatesTags: ((
        _result: User | undefined, 
        _error: unknown, 
        { id }: { id: string }
      ) => [
        { type: 'User', id },
        ...(id === 'me' ? [{ type: 'User', id: 'CURRENT' }] : []),
      ]) as any,
    }),
    
    updatePreferences: builder.mutation<UserPreferences, UpdatePreferencesRequest>({
      query: ({ userId, preferences }) => ({
        url: `/users/${userId}/preferences`,
        method: 'PATCH',
        body: preferences,
      }),
      transformResponse: (response: ApiResponse<UserPreferences>) => response.data,
      invalidatesTags: ((
        _result: UserPreferences | undefined, 
        _error: unknown, 
        { userId }: { userId: string }
      ) => [
        { type: 'User', id: userId },
        ...(userId === 'me' ? [{ type: 'User', id: 'CURRENT' }] : []),
      ]) as any,
    }),
    
    getUserStats: builder.query<UserStats, string>({
      query: (userId) => `/users/${userId}/stats`,
      transformResponse: (response: ApiResponse<UserStats>) => response.data,
      providesTags: ((
        _result: UserStats | undefined, 
        _error: unknown, 
        userId: string
      ) => [
        { type: 'User', id: userId },
        { type: 'Stats', id: userId },
      ]) as any,
    }),
    
    deleteUser: builder.mutation<void, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ((
        _result: void | undefined, 
        _error: unknown, 
        id: string
      ) => [
        { type: 'User', id },
        { type: 'User', id: 'LIST' },
      ]) as any,
    }),
    
    resetPassword: builder.mutation<void, { email: string }>({
      query: (data) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body: data,
      }),
    }),
    
    changePassword: builder.mutation<void, { userId: string; oldPassword: string; newPassword: string }>({
      query: ({ userId, oldPassword, newPassword }) => ({
        url: `/users/${userId}/password`,
        method: 'PUT',
        body: { oldPassword, newPassword },
      }),
    }),
    
    verifyEmail: builder.mutation<void, { token: string }>({
      query: (data) => ({
        url: '/auth/verify-email',
        method: 'POST',
        body: data,
      }),
    }),
  }),
  overrideExisting: false,
});

// Export the API endpoints
export const userApi = extendedApi;

// Export hooks for usage in components
export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetCurrentUserQuery,
  useGetUserByIdQuery,
  useGetUsersQuery,
  useUpdateUserMutation,
  useUpdatePreferencesMutation,
  useGetUserStatsQuery,
  useDeleteUserMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
  useVerifyEmailMutation
} = userApi; 