import { toast } from "sonner";

interface ApiError {
  status?: number;
  data?: {
    message?: string;
    error?: string;
  };
  message?: string;
  error?: string;
}

/**
 * Handles API error messages consistently across the application
 * @param error The error object from the API call
 * @param defaultMessage Default message to show if error details cannot be extracted
 * @returns The formatted error message
 */
export const handleApiError = (error: unknown, defaultMessage = "An error occurred"): string => {
  console.error("API Error:", error);
  
  let errorMessage = defaultMessage;
  
  if (typeof error === 'string') {
    errorMessage = error;
  } else if (error && typeof error === 'object') {
    const apiError = error as ApiError;
    
    // Check for specific status codes
    if (apiError.status) {
      switch (apiError.status) {
        case 400:
          errorMessage = "Invalid request format";
          break;
        case 401:
          errorMessage = "Your session has expired. Please sign in again.";
          break;
        case 403:
          errorMessage = "You don't have permission to perform this action";
          break;
        case 404:
          errorMessage = "The requested resource was not found";
          break;
        case 429:
          errorMessage = "Too many requests. Please try again later.";
          break;
        case 500:
        case 502:
        case 503:
          errorMessage = "Server error. Please try again later.";
          break;
      }
    }
    
    // Extract more specific error messages if available
    if (apiError.data?.message) {
      errorMessage = apiError.data.message;
    } else if (apiError.data?.error) {
      errorMessage = apiError.data.error;
    } else if (apiError.message) {
      errorMessage = apiError.message;
    } else if (apiError.error) {
      errorMessage = apiError.error;
    }
  }
  
  toast.error(errorMessage);
  return errorMessage;
};

/**
 * Utility function to refresh the auth token
 * @param getTokenFn Function from auth provider that returns a promise with the token
 * @returns Promise resolving to boolean indicating success
 */
export const refreshAuthToken = async (getTokenFn: () => Promise<string | null>): Promise<boolean> => {
  try {
    const token = await getTokenFn();
    if (token) {
      localStorage.setItem("clerk-auth-token", token);
      console.log("Auth token refreshed");
      return true;
    }
    return false;
  } catch (err) {
    console.error("Failed to refresh token:", err);
    return false;
  }
};