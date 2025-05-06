import { api } from "@/state/api";
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface CoinTransaction {
  id: string;
  userId: string;
  amount: number;
  type: "earned" | "spent";
  description: string;
  category: "assignment" | "quiz" | "streak" | "purchase" | "challenge" | "other";
  timestamp: string;
}

export interface CoinReward {
  id: string;
  name: string;
  description: string;
  iconName: string;
  coinsRequired: number;
  category: "customization" | "award" | "special" | "premium";
  featured?: boolean;
}

export interface UserReward {
  id: string;
  userId: string;
  rewardId: string;
  purchasedAt: string;
  isActive: boolean;
  reward?: CoinReward;
}

export interface UserCoinStats {
  userId: string;
  totalCoins: number;
  coinsEarned: number;
  coinsSpent: number;
  streakDays: number;
  achievements: number;
  level: number;
  nextLevelProgress: number;
}

export interface PurchaseRewardRequest {
  userId: string;
  rewardId: string;
}

export interface ActivateRewardRequest {
  userId: string;
  userRewardId: string;
}

type ApiResponse<T> = { success: boolean; data: T };

// Define the endpoints with type assertions to bypass TypeScript tag errors
const extendedApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getUserCoins: builder.query<UserCoinStats, string>({
      query: (userId) => `/coins/user/${userId}`,
      transformResponse: (response: ApiResponse<UserCoinStats>) => response.data,
      providesTags: ((
        _result: UserCoinStats | undefined, 
        _error: unknown, 
        userId: string
      ) => [
        { type: 'User', id: userId },
        { type: 'Coin', id: userId },
      ]) as any,
    }),
    
    getUserTransactions: builder.query<CoinTransaction[], string>({
      query: (userId) => `/coins/user/${userId}/transactions`,
      transformResponse: (response: ApiResponse<CoinTransaction[]>) => response.data,
      providesTags: ((result: CoinTransaction[] | undefined) =>
        result
          ? [
              ...result.map(({ id }: { id: string }) => ({ type: 'Coin', id })),
              { type: 'Coin', id: 'LIST' },
            ]
          : [{ type: 'Coin', id: 'LIST' }]) as any,
    }),
    
    getAvailableRewards: builder.query<CoinReward[], void>({
      query: () => '/coins/rewards',
      transformResponse: (response: ApiResponse<CoinReward[]>) => response.data,
      providesTags: ((result: CoinReward[] | undefined) =>
        result
          ? [
              ...result.map(({ id }: { id: string }) => ({ type: 'Reward', id })),
              { type: 'Reward', id: 'LIST' },
            ]
          : [{ type: 'Reward', id: 'LIST' }]) as any,
    }),
    
    getUserRewards: builder.query<UserReward[], string>({
      query: (userId) => `/coins/user/${userId}/rewards`,
      transformResponse: (response: ApiResponse<UserReward[]>) => response.data,
      providesTags: ((result: UserReward[] | undefined) =>
        result
          ? [
              ...result.map(({ id }: { id: string }) => ({ type: 'Reward', id })),
              { type: 'Reward', id: 'USER' },
            ]
          : [{ type: 'Reward', id: 'USER' }]) as any,
    }),
    
    addCoins: builder.mutation<CoinTransaction, Omit<CoinTransaction, 'id' | 'timestamp'>>({
      query: (data) => ({
        url: '/coins/transaction',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: ApiResponse<CoinTransaction>) => response.data,
      invalidatesTags: ((
        _result: CoinTransaction | undefined, 
        _error: unknown, 
        { userId }: { userId: string }
      ) => [
        { type: 'Coin', id: userId },
        { type: 'Coin', id: 'LIST' },
        { type: 'User', id: userId },
      ]) as any,
    }),
    
    purchaseReward: builder.mutation<UserReward, PurchaseRewardRequest>({
      query: (data) => ({
        url: '/coins/purchase',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: ApiResponse<UserReward>) => response.data,
      invalidatesTags: ((
        _result: UserReward | undefined, 
        _error: unknown, 
        { userId }: { userId: string }
      ) => [
        { type: 'Coin', id: userId },
        { type: 'Reward', id: 'USER' },
        { type: 'User', id: userId },
      ]) as any,
    }),
    
    activateReward: builder.mutation<UserReward, ActivateRewardRequest>({
      query: (data) => ({
        url: '/coins/reward/activate',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: ApiResponse<UserReward>) => response.data,
      invalidatesTags: ((
        _result: UserReward | undefined, 
        _error: unknown, 
        { userId }: { userId: string }
      ) => [
        { type: 'Reward', id: 'USER' },
      ]) as any,
    }),
  }),
  overrideExisting: false,
});

// Export the API with hooks
export const coinsApi = extendedApi;

// Export hooks for usage in components
export const {
  useGetUserCoinsQuery,
  useGetUserTransactionsQuery,
  useGetAvailableRewardsQuery,
  useGetUserRewardsQuery,
  useAddCoinsMutation,
  usePurchaseRewardMutation,
  useActivateRewardMutation
} = coinsApi; 