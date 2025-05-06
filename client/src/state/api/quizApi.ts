import { api } from "@/state/api";

export interface QuizQuestion {
  id: string;
  quizId: string;
  text: string;
  type: 'multiple_choice' | 'true_false' | 'matching' | 'short_answer' | 'essay';
  options?: string[];
  correctAnswer?: string | string[];
  points: number;
  explanation?: string;
  imageUrl?: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  courseId: string;
  moduleId?: string;
  timeLimit?: number; // in minutes
  passingScore?: number;
  totalPoints: number;
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
  questionCount?: number;
  completionCount?: number;
  averageScore?: number;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  startedAt: string;
  completedAt?: string;
  score?: number;
  totalPoints: number;
  status: 'in_progress' | 'completed' | 'abandoned';
  timeSpent?: number; // in seconds
  answers: Array<{
    questionId: string;
    answer: string | string[];
    isCorrect?: boolean;
    pointsAwarded?: number;
  }>;
}

export interface CreateQuizRequest {
  title: string;
  description: string;
  courseId: string;
  moduleId?: string;
  timeLimit?: number;
  passingScore?: number;
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'draft' | 'published' | 'archived';
  questions?: Omit<QuizQuestion, 'id' | 'quizId'>[];
}

export interface UpdateQuizRequest {
  id: string;
  data: Partial<Omit<Quiz, 'id' | 'createdAt' | 'updatedAt' | 'questionCount' | 'completionCount' | 'averageScore'>>;
}

export interface SubmitQuizRequest {
  quizId: string;
  userId: string;
  answers: Array<{
    questionId: string;
    answer: string | string[];
  }>;
  timeSpent: number;
}

type ApiResponse<T> = { success: boolean; data: T };

// Define the endpoints with type assertions to bypass TypeScript tag errors
const extendedApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getQuizzes: builder.query<Quiz[], { courseId?: string; status?: string }>({
      query: ({ courseId, status }) => {
        const queryParams = new URLSearchParams();
        if (courseId) queryParams.append('courseId', courseId);
        if (status) queryParams.append('status', status);
        return `/quizzes?${queryParams.toString()}`;
      },
      transformResponse: (response: ApiResponse<Quiz[]>) => response.data,
      providesTags: ((result: Quiz[] | undefined) =>
        result
          ? [
              ...result.map(({ id }: { id: string }) => ({ type: 'Quiz', id })),
              { type: 'Quiz', id: 'LIST' },
            ]
          : [{ type: 'Quiz', id: 'LIST' }]) as any,
    }),
    
    getQuizById: builder.query<Quiz & { questions: QuizQuestion[] }, string>({
      query: (id) => `/quizzes/${id}`,
      transformResponse: (response: ApiResponse<Quiz & { questions: QuizQuestion[] }>) => response.data,
      providesTags: ((
        _result: (Quiz & { questions: QuizQuestion[] }) | undefined, 
        _error: unknown, 
        id: string
      ) => [
        { type: 'Quiz', id },
        { type: 'Question', id: `quiz-${id}` },
      ]) as any,
    }),
    
    createQuiz: builder.mutation<Quiz, CreateQuizRequest>({
      query: (data) => ({
        url: '/quizzes',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: ApiResponse<Quiz>) => response.data,
      invalidatesTags: ([{ type: 'Quiz', id: 'LIST' }]) as any,
    }),
    
    updateQuiz: builder.mutation<Quiz, UpdateQuizRequest>({
      query: ({ id, data }) => ({
        url: `/quizzes/${id}`,
        method: 'PATCH',
        body: data,
      }),
      transformResponse: (response: ApiResponse<Quiz>) => response.data,
      invalidatesTags: ((
        _result: Quiz | undefined, 
        _error: unknown, 
        { id }: { id: string }
      ) => [
        { type: 'Quiz', id },
        { type: 'Quiz', id: 'LIST' },
      ]) as any,
    }),
    
    deleteQuiz: builder.mutation<void, string>({
      query: (id) => ({
        url: `/quizzes/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ((
        _result: void | undefined, 
        _error: unknown, 
        id: string
      ) => [
        { type: 'Quiz', id },
        { type: 'Quiz', id: 'LIST' },
        { type: 'Question', id: `quiz-${id}` },
      ]) as any,
    }),
    
    getQuizQuestions: builder.query<QuizQuestion[], string>({
      query: (quizId) => `/quizzes/${quizId}/questions`,
      transformResponse: (response: ApiResponse<QuizQuestion[]>) => response.data,
      providesTags: ((
        result: QuizQuestion[] | undefined, 
        _error: unknown, 
        quizId: string
      ) =>
        result
          ? [
              ...result.map(({ id }: { id: string }) => ({ type: 'Question', id })),
              { type: 'Question', id: `quiz-${quizId}` },
            ]
          : [{ type: 'Question', id: `quiz-${quizId}` }]) as any,
    }),
    
    addQuizQuestion: builder.mutation<QuizQuestion, { quizId: string; question: Omit<QuizQuestion, 'id' | 'quizId'> }>({
      query: ({ quizId, question }) => ({
        url: `/quizzes/${quizId}/questions`,
        method: 'POST',
        body: question,
      }),
      transformResponse: (response: ApiResponse<QuizQuestion>) => response.data,
      invalidatesTags: ((
        _result: QuizQuestion | undefined, 
        _error: unknown, 
        { quizId }: { quizId: string }
      ) => [
        { type: 'Question', id: `quiz-${quizId}` },
        { type: 'Quiz', id: quizId },
      ]) as any,
    }),
    
    updateQuizQuestion: builder.mutation<QuizQuestion, { questionId: string; quizId: string; question: Partial<Omit<QuizQuestion, 'id' | 'quizId'>> }>({
      query: ({ questionId, quizId, question }) => ({
        url: `/quizzes/${quizId}/questions/${questionId}`,
        method: 'PATCH',
        body: question,
      }),
      transformResponse: (response: ApiResponse<QuizQuestion>) => response.data,
      invalidatesTags: ((
        _result: QuizQuestion | undefined, 
        _error: unknown, 
        { questionId, quizId }: { questionId: string; quizId: string }
      ) => [
        { type: 'Question', id: questionId },
        { type: 'Question', id: `quiz-${quizId}` },
      ]) as any,
    }),
    
    deleteQuizQuestion: builder.mutation<void, { questionId: string; quizId: string }>({
      query: ({ questionId, quizId }) => ({
        url: `/quizzes/${quizId}/questions/${questionId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ((
        _result: void | undefined, 
        _error: unknown, 
        { questionId, quizId }: { questionId: string; quizId: string }
      ) => [
        { type: 'Question', id: questionId },
        { type: 'Question', id: `quiz-${quizId}` },
        { type: 'Quiz', id: quizId },
      ]) as any,
    }),
    
    getQuizAttempts: builder.query<QuizAttempt[], { quizId: string; userId?: string }>({
      query: ({ quizId, userId }) => {
        const queryParams = new URLSearchParams();
        if (userId) queryParams.append('userId', userId);
        return `/quizzes/${quizId}/attempts?${queryParams.toString()}`;
      },
      transformResponse: (response: ApiResponse<QuizAttempt[]>) => response.data,
      providesTags: ((
        result: QuizAttempt[] | undefined, 
        _error: unknown, 
        { quizId }: { quizId: string; userId?: string }
      ) =>
        result
          ? [
              ...result.map(({ id }: { id: string }) => ({ type: 'Attempt', id })),
              { type: 'Attempt', id: `quiz-${quizId}` },
            ]
          : [{ type: 'Attempt', id: `quiz-${quizId}` }]) as any,
    }),
    
    getUserQuizAttempts: builder.query<QuizAttempt[], string>({
      query: (userId) => `/quizzes/attempts/user/${userId}`,
      transformResponse: (response: ApiResponse<QuizAttempt[]>) => response.data,
      providesTags: ((
        result: QuizAttempt[] | undefined, 
        _error: unknown, 
        userId: string
      ) =>
        result
          ? [
              ...result.map(({ id }: { id: string }) => ({ type: 'Attempt', id })),
              { type: 'Attempt', id: `user-${userId}` },
            ]
          : [{ type: 'Attempt', id: `user-${userId}` }]) as any,
    }),
    
    getQuizAttemptById: builder.query<QuizAttempt, string>({
      query: (id) => `/quizzes/attempts/${id}`,
      transformResponse: (response: ApiResponse<QuizAttempt>) => response.data,
      providesTags: ((
        _result: QuizAttempt | undefined, 
        _error: unknown, 
        id: string
      ) => [
        { type: 'Attempt', id }
      ]) as any,
    }),
    
    startQuizAttempt: builder.mutation<QuizAttempt, { quizId: string; userId: string }>({
      query: ({ quizId, userId }) => ({
        url: `/quizzes/${quizId}/attempts/start`,
        method: 'POST',
        body: { userId },
      }),
      transformResponse: (response: ApiResponse<QuizAttempt>) => response.data,
      invalidatesTags: ((
        _result: QuizAttempt | undefined, 
        _error: unknown, 
        { quizId, userId }: { quizId: string; userId: string }
      ) => [
        { type: 'Attempt', id: `quiz-${quizId}` },
        { type: 'Attempt', id: `user-${userId}` },
      ]) as any,
    }),
    
    submitQuizAttempt: builder.mutation<QuizAttempt, SubmitQuizRequest>({
      query: ({ quizId, userId, answers, timeSpent }) => ({
        url: `/quizzes/${quizId}/attempts/submit`,
        method: 'POST',
        body: { userId, answers, timeSpent },
      }),
      transformResponse: (response: ApiResponse<QuizAttempt>) => response.data,
      invalidatesTags: ((
        result: QuizAttempt | undefined, 
        _error: unknown, 
        { quizId, userId }: { quizId: string; userId: string }
      ) => [
        { type: 'Attempt', id: result?.id || 'SUBMIT' },
        { type: 'Attempt', id: `quiz-${quizId}` },
        { type: 'Attempt', id: `user-${userId}` },
        { type: 'Quiz', id: quizId },
      ]) as any,
    }),
  }),
  overrideExisting: false,
});

// Export the API endpoints
export const quizApi = extendedApi;

// Export hooks for usage in components
export const {
  useGetQuizzesQuery,
  useGetQuizByIdQuery,
  useCreateQuizMutation,
  useUpdateQuizMutation,
  useDeleteQuizMutation,
  useGetQuizQuestionsQuery,
  useAddQuizQuestionMutation,
  useUpdateQuizQuestionMutation,
  useDeleteQuizQuestionMutation,
  useGetQuizAttemptsQuery,
  useGetUserQuizAttemptsQuery,
  useGetQuizAttemptByIdQuery,
  useStartQuizAttemptMutation,
  useSubmitQuizAttemptMutation
} = quizApi; 