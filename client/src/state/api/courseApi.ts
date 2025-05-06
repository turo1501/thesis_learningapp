import { api } from "@/state/api";

export interface Course {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  status: "active" | "archived" | "draft";
  subject: string;
  level: "beginner" | "intermediate" | "advanced";
  teacherId: string;
  enrollmentCount?: number;
  completionRate?: number;
  averageRating?: number;
  modules?: Module[];
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
  completionTime?: number;
  status: "active" | "locked" | "completed";
  resources?: Resource[];
}

export interface Resource {
  id: string;
  moduleId: string;
  title: string;
  type: "video" | "document" | "quiz" | "assignment" | "link";
  url?: string;
  content?: string;
  duration?: number;
  order: number;
  status: "active" | "locked" | "completed";
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: string;
  status: "active" | "completed" | "paused";
  progress: number;
  lastAccessedAt?: string;
  completedAt?: string;
  rating?: number;
  feedback?: string;
}

export interface CreateCourseRequest {
  title: string;
  description: string;
  subject: string;
  level: "beginner" | "intermediate" | "advanced";
  teacherId: string;
  imageUrl?: string;
  status?: "active" | "archived" | "draft";
  modules?: Omit<Module, "id" | "courseId">[];
}

export interface UpdateCourseRequest {
  id: string;
  data: Partial<Omit<Course, "id" | "createdAt" | "updatedAt">>;
}

export interface CreateModuleRequest {
  courseId: string;
  title: string;
  description: string;
  order: number;
  status?: "active" | "locked";
  resources?: Omit<Resource, "id" | "moduleId">[];
}

type ApiResponse<T> = { success: boolean; data: T };

// Define the endpoints with type assertions to bypass TypeScript tag errors
const extendedApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCourses: builder.query<Course[], { subject?: string; level?: string; teacherId?: string }>({
      query: ({ subject, level, teacherId }) => {
        const queryParams = new URLSearchParams();
        if (subject) queryParams.append('subject', subject);
        if (level) queryParams.append('level', level);
        if (teacherId) queryParams.append('teacherId', teacherId);
        return `/courses?${queryParams.toString()}`;
      },
      transformResponse: (response: ApiResponse<Course[]>) => response.data,
      providesTags: ((result: Course[] | undefined) =>
        result
          ? [
              ...result.map(({ id }: { id: string }) => ({ type: 'Course', id })),
              { type: 'Course', id: 'LIST' },
            ]
          : [{ type: 'Course', id: 'LIST' }]) as any,
    }),
    
    getCourseById: builder.query<Course, string>({
      query: (id) => `/courses/${id}`,
      transformResponse: (response: ApiResponse<Course>) => response.data,
      providesTags: ((
        _result: Course | undefined, 
        _error: unknown, 
        id: string
      ) => [
        { type: 'Course', id },
      ]) as any,
    }),
    
    createCourse: builder.mutation<Course, CreateCourseRequest>({
      query: (data) => ({
        url: '/courses',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: ApiResponse<Course>) => response.data,
      invalidatesTags: ([{ type: 'Course', id: 'LIST' }]) as any,
    }),
    
    updateCourse: builder.mutation<Course, UpdateCourseRequest>({
      query: ({ id, data }) => ({
        url: `/courses/${id}`,
        method: 'PATCH',
        body: data,
      }),
      transformResponse: (response: ApiResponse<Course>) => response.data,
      invalidatesTags: ((
        _result: Course | undefined, 
        _error: unknown, 
        { id }: { id: string }
      ) => [
        { type: 'Course', id },
        { type: 'Course', id: 'LIST' },
      ]) as any,
    }),
    
    deleteCourse: builder.mutation<void, string>({
      query: (id) => ({
        url: `/courses/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ((
        _result: void | undefined, 
        _error: unknown, 
        id: string
      ) => [
        { type: 'Course', id },
        { type: 'Course', id: 'LIST' },
      ]) as any,
    }),
    
    getModules: builder.query<Module[], string>({
      query: (courseId) => `/courses/${courseId}/modules`,
      transformResponse: (response: ApiResponse<Module[]>) => response.data,
      providesTags: ((
        result: Module[] | undefined, 
        _error: unknown, 
        courseId: string
      ) =>
        result
          ? [
              ...result.map(({ id }: { id: string }) => ({ type: 'Module', id })),
              { type: 'Module', id: `course-${courseId}` },
            ]
          : [{ type: 'Module', id: `course-${courseId}` }]) as any,
    }),
    
    createModule: builder.mutation<Module, CreateModuleRequest>({
      query: ({ courseId, ...data }) => ({
        url: `/courses/${courseId}/modules`,
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: ApiResponse<Module>) => response.data,
      invalidatesTags: ((
        _result: Module | undefined, 
        _error: unknown, 
        { courseId }: { courseId: string }
      ) => [
        { type: 'Module', id: `course-${courseId}` },
        { type: 'Course', id: courseId },
      ]) as any,
    }),
    
    updateModule: builder.mutation<Module, { moduleId: string; courseId: string; data: Partial<Omit<Module, "id" | "courseId">> }>({
      query: ({ moduleId, courseId, data }) => ({
        url: `/courses/${courseId}/modules/${moduleId}`,
        method: 'PATCH',
        body: data,
      }),
      transformResponse: (response: ApiResponse<Module>) => response.data,
      invalidatesTags: ((
        _result: Module | undefined, 
        _error: unknown, 
        { moduleId, courseId }: { moduleId: string; courseId: string }
      ) => [
        { type: 'Module', id: moduleId },
        { type: 'Module', id: `course-${courseId}` },
        { type: 'Course', id: courseId },
      ]) as any,
    }),
    
    deleteModule: builder.mutation<void, { moduleId: string; courseId: string }>({
      query: ({ moduleId, courseId }) => ({
        url: `/courses/${courseId}/modules/${moduleId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ((
        _result: void | undefined, 
        _error: unknown, 
        { moduleId, courseId }: { moduleId: string; courseId: string }
      ) => [
        { type: 'Module', id: moduleId },
        { type: 'Module', id: `course-${courseId}` },
        { type: 'Course', id: courseId },
      ]) as any,
    }),
    
    getEnrollments: builder.query<Enrollment[], { courseId?: string; userId?: string }>({
      query: ({ courseId, userId }) => {
        const queryParams = new URLSearchParams();
        if (courseId) queryParams.append('courseId', courseId);
        if (userId) queryParams.append('userId', userId);
        return `/enrollments?${queryParams.toString()}`;
      },
      transformResponse: (response: ApiResponse<Enrollment[]>) => response.data,
      providesTags: ((
        result: Enrollment[] | undefined, 
        _error: unknown, 
        { courseId, userId }: { courseId?: string; userId?: string }
      ) => {
        const tags = result
          ? [...result.map(({ id }: { id: string }) => ({ type: 'Enrollment', id }))]
          : [];
        
        tags.push({ type: 'Enrollment', id: 'LIST' });
        
        if (courseId) {
          tags.push({ type: 'Enrollment', id: `course-${courseId}` });
        }
        
        if (userId) {
          tags.push({ type: 'Enrollment', id: `user-${userId}` });
        }
        
        return tags;
      }) as any,
    }),
    
    enrollInCourse: builder.mutation<Enrollment, { userId: string; courseId: string }>({
      query: ({ userId, courseId }) => ({
        url: '/enrollments',
        method: 'POST',
        body: { userId, courseId },
      }),
      transformResponse: (response: ApiResponse<Enrollment>) => response.data,
      invalidatesTags: ((
        _result: Enrollment | undefined, 
        _error: unknown, 
        { userId, courseId }: { userId: string; courseId: string }
      ) => [
        { type: 'Enrollment', id: 'LIST' },
        { type: 'Enrollment', id: `course-${courseId}` },
        { type: 'Enrollment', id: `user-${userId}` },
        { type: 'Course', id: courseId },
      ]) as any,
    }),
    
    updateEnrollment: builder.mutation<Enrollment, { enrollmentId: string; data: Partial<Omit<Enrollment, "id" | "userId" | "courseId" | "enrolledAt">> }>({
      query: ({ enrollmentId, data }) => ({
        url: `/enrollments/${enrollmentId}`,
        method: 'PATCH',
        body: data,
      }),
      transformResponse: (response: ApiResponse<Enrollment>) => response.data,
      invalidatesTags: ((
        result: Enrollment | undefined, 
        _error: unknown, 
        { enrollmentId }: { enrollmentId: string }
      ) => {
        const tags = [
          { type: 'Enrollment', id: enrollmentId },
          { type: 'Enrollment', id: 'LIST' },
        ];
        
        if (result) {
          tags.push({ type: 'Enrollment', id: `course-${result.courseId}` });
          tags.push({ type: 'Enrollment', id: `user-${result.userId}` });
          tags.push({ type: 'Course', id: result.courseId });
        }
        
        return tags;
      }) as any,
    }),
    
    cancelEnrollment: builder.mutation<void, string>({
      query: (enrollmentId) => ({
        url: `/enrollments/${enrollmentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ((
        _result: void | undefined, 
        _error: unknown, 
        enrollmentId: string
      ) => [
        { type: 'Enrollment', id: enrollmentId },
        { type: 'Enrollment', id: 'LIST' },
      ]) as any,
    }),
  }),
  overrideExisting: false,
});

// Export the API endpoints
export const courseApi = extendedApi;

// Export hooks for usage in components
export const {
  useGetCoursesQuery,
  useGetCourseByIdQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
  useGetModulesQuery,
  useCreateModuleMutation,
  useUpdateModuleMutation,
  useDeleteModuleMutation,
  useGetEnrollmentsQuery,
  useEnrollInCourseMutation,
  useUpdateEnrollmentMutation,
  useCancelEnrollmentMutation
} = courseApi; 