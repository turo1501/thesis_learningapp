import { api } from "@/state/api";

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  courseId: string;
  deadline: string | null;
  points: number;
  status: "active" | "closed" | "draft";
  createdAt: string;
  updatedAt: string;
  submissionCount?: number;
  totalStudents?: number;
  attachments: Attachment[];
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName?: string;
  status: "submitted" | "late" | "graded" | "not_submitted";
  submittedAt: string;
  updatedAt: string;
  grade?: number;
  feedback?: string;
  attachments: Attachment[];
  content?: string;
}

export interface CreateAssignmentRequest {
  title: string;
  description: string;
  courseId: string;
  deadline: string | null;
  points: number;
  status: "active" | "closed" | "draft";
  attachments: Attachment[];
}

export interface UpdateAssignmentRequest {
  id: string;
  data: Partial<Omit<Assignment, "id" | "createdAt" | "updatedAt">>;
}

export interface SubmitAssignmentRequest {
  assignmentId: string;
  studentId: string;
  attachments: Attachment[];
}

export interface GradeSubmissionRequest {
  submissionId: string;
  grade: number;
  feedback?: string;
}

type ApiResponse<T> = { success: boolean; data: T };

// Define the endpoints using type assertions to bypass TypeScript errors
const extendedApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getTeacherAssignments: builder.query<Assignment[], string>({
      query: (teacherId) => `/assignments/teacher/${teacherId}`,
      transformResponse: (response: ApiResponse<Assignment[]>) => response.data,
      providesTags: ((result: Assignment[] | undefined) =>
        result
          ? [
              ...result.map(({ id }: { id: string }) => ({ type: 'Assignment', id })),
              { type: 'Assignment', id: 'LIST' },
            ]
          : [{ type: 'Assignment', id: 'LIST' }]) as any,
    }),
    
    getCourseAssignments: builder.query<Assignment[], string>({
      query: (courseId) => `/assignments/course/${courseId}`,
      transformResponse: (response: ApiResponse<Assignment[]>) => response.data,
      providesTags: ((result: Assignment[] | undefined) =>
        result
          ? [
              ...result.map(({ id }: { id: string }) => ({ type: 'Assignment', id })),
              { type: 'Assignment', id: 'LIST' },
            ]
          : [{ type: 'Assignment', id: 'LIST' }]) as any,
    }),
    
    getAssignmentById: builder.query<Assignment, string>({
      query: (id) => `/assignments/${id}`,
      transformResponse: (response: ApiResponse<Assignment>) => response.data,
      providesTags: ((
        _result: Assignment | undefined, 
        _error: unknown, 
        id: string
      ) => [
        { type: 'Assignment', id }
      ]) as any,
    }),
    
    createAssignment: builder.mutation<Assignment, CreateAssignmentRequest>({
      query: (data) => ({
        url: '/assignments',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: ApiResponse<Assignment>) => response.data,
      invalidatesTags: ([{ type: 'Assignment', id: 'LIST' }]) as any,
    }),
    
    updateAssignment: builder.mutation<Assignment, UpdateAssignmentRequest>({
      query: ({ id, data }) => ({
        url: `/assignments/${id}`,
        method: 'PATCH',
        body: data,
      }),
      transformResponse: (response: ApiResponse<Assignment>) => response.data,
      invalidatesTags: ((
        _result: Assignment | undefined, 
        _error: unknown, 
        { id }: { id: string }
      ) => [
        { type: 'Assignment', id },
        { type: 'Assignment', id: 'LIST' },
      ]) as any,
    }),
    
    deleteAssignment: builder.mutation<void, string>({
      query: (id) => ({
        url: `/assignments/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ((
        _result: void | undefined, 
        _error: unknown, 
        id: string
      ) => [
        { type: 'Assignment', id },
        { type: 'Assignment', id: 'LIST' },
      ]) as any,
    }),
    
    getAssignmentSubmissions: builder.query<Submission[], string>({
      query: (assignmentId) => `/assignments/${assignmentId}/submissions`,
      transformResponse: (response: ApiResponse<Submission[]>) => response.data,
      providesTags: ((result: Submission[] | undefined) =>
        result
          ? [
              ...result.map(({ id }: { id: string }) => ({ type: 'Submission', id })),
              { type: 'Submission', id: 'LIST' },
            ]
          : [{ type: 'Submission', id: 'LIST' }]) as any,
    }),
    
    getSubmissionById: builder.query<Submission, { assignmentId: string; submissionId: string }>({
      query: ({ assignmentId, submissionId }) => 
        `/assignments/${assignmentId}/submission/${submissionId}`,
      transformResponse: (response: ApiResponse<Submission>) => response.data,
      providesTags: ((
        _result: Submission | undefined, 
        _error: unknown, 
        { submissionId }: { submissionId: string }
      ) => [
        { type: 'Submission', id: submissionId },
      ]) as any,
    }),
    
    getStudentSubmission: builder.query<Submission, { assignmentId: string; studentId: string }>({
      query: ({ assignmentId, studentId }) => 
        `/assignments/${assignmentId}/submission/${studentId}`,
      transformResponse: (response: ApiResponse<Submission>) => response.data,
      providesTags: ((
        _result: Submission | undefined, 
        _error: unknown, 
        { assignmentId, studentId }: { assignmentId: string; studentId: string }
      ) => [
        { type: 'Submission', id: `${assignmentId}-${studentId}` },
      ]) as any,
    }),
    
    submitAssignment: builder.mutation<Submission, SubmitAssignmentRequest>({
      query: ({ assignmentId, studentId, attachments }) => ({
        url: `/assignments/${assignmentId}/submission/${studentId}`,
        method: 'POST',
        body: { attachments },
      }),
      transformResponse: (response: ApiResponse<Submission>) => response.data,
      invalidatesTags: ((
        _result: Submission | undefined, 
        _error: unknown, 
        { assignmentId, studentId }: { assignmentId: string; studentId: string }
      ) => [
        { type: 'Submission', id: `${assignmentId}-${studentId}` },
        { type: 'Submission', id: 'LIST' },
        { type: 'Assignment', id: assignmentId },
      ]) as any,
    }),
    
    gradeSubmission: builder.mutation<Submission, GradeSubmissionRequest>({
      query: ({ submissionId, grade, feedback }) => ({
        url: `/assignments/submission/${submissionId}/grade`,
        method: 'POST',
        body: { grade, feedback },
      }),
      transformResponse: (response: ApiResponse<Submission>) => response.data,
      invalidatesTags: ((
        _result: Submission | undefined, 
        _error: unknown, 
        { submissionId }: { submissionId: string }
      ) => [
        { type: 'Submission', id: submissionId },
        { type: 'Submission', id: 'LIST' },
      ]) as any,
    }),
    
    getStudentSubmissions: builder.query<Submission[], string>({
      query: (studentId) => `/assignments/student/${studentId}/submissions`,
      transformResponse: (response: ApiResponse<Submission[]>) => response.data,
      providesTags: ((result: Submission[] | undefined) =>
        result
          ? [
              ...result.map(({ id }: { id: string }) => ({ type: 'Submission', id })),
              { type: 'Submission', id: 'LIST' },
            ]
          : [{ type: 'Submission', id: 'LIST' }]) as any,
    }),
  }),
  overrideExisting: false,
});

// Export the API endpoints
export const assignmentApi = extendedApi;

// Export hooks for usage in components
export const {
  useGetTeacherAssignmentsQuery,
  useGetCourseAssignmentsQuery,
  useGetAssignmentByIdQuery,
  useCreateAssignmentMutation,
  useUpdateAssignmentMutation,
  useDeleteAssignmentMutation,
  useGetAssignmentSubmissionsQuery,
  useGetSubmissionByIdQuery,
  useGetStudentSubmissionQuery,
  useSubmitAssignmentMutation,
  useGradeSubmissionMutation,
  useGetStudentSubmissionsQuery
} = assignmentApi; 