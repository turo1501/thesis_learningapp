import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Define the base API
export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ 
    baseUrl: '/api',
    prepareHeaders: (headers) => {
      // Add auth token if available - safely check for localStorage in browser environment
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
          headers.set('authorization', `Bearer ${token}`);
        }
      }
      return headers;
    },
  }),
  tagTypes: [
    'Assignment', 
    'Submission', 
    'Course', 
    'Meeting', 
    'User', 
    'Analytics',
    'Coin',
    'Reward'
  ],
  endpoints: () => ({}),
}); 