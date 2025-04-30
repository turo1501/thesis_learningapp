import { toast } from "sonner";

interface APIError {
  status?: number;
  data?: {
    message?: string;
    error?: string;
  };
  error?: string;
  message?: string;
}

/**
 * Standardized API error handler that displays appropriate error toast messages
 * based on the error type and status code
 */
export const handleAPIError = (error: unknown, defaultMessage = "An unexpected error occurred") => {
  console.error("API Error:", error);
  
  let errorMessage = defaultMessage;
  
  if (typeof error === 'string') {
    errorMessage = error;
  } else if (error && typeof error === 'object') {
    const apiError = error as APIError;
    
    // Handle standard server error responses
    if (apiError.data?.message) {
      errorMessage = apiError.data.message;
    } else if (apiError.data?.error) {
      errorMessage = apiError.data.error;
    } else if (apiError.message) {
      errorMessage = apiError.message;
    } else if (apiError.error) {
      errorMessage = apiError.error;
    }
    
    // Provide more context based on status code
    if (apiError.status) {
      switch (apiError.status) {
        case 400:
          errorMessage = `Bad Request: ${errorMessage}`;
          break;
        case 401:
          errorMessage = "Authentication required. Please sign in again.";
          break;
        case 403:
          errorMessage = "You don't have permission to perform this action.";
          break;
        case 404:
          errorMessage = "The requested resource was not found.";
          break;
        case 422:
          errorMessage = `Validation Error: ${errorMessage}`;
          break;
        case 429:
          errorMessage = "Too many requests. Please try again later.";
          break;
        case 500:
        case 502:
        case 503:
          errorMessage = "Server error. Our team has been notified.";
          break;
      }
    }
  }
  
  toast.error(errorMessage);
  return errorMessage;
};

/**
 * Format validation errors from the API
 */
export const formatValidationErrors = (errors: Record<string, string[]>) => {
  return Object.entries(errors).reduce((acc, [field, messages]) => {
    acc[field] = messages[0]; // Take first error message for each field
    return acc;
  }, {} as Record<string, string>);
};

/**
 * Handle form submission errors
 */
export const handleFormError = (error: any, setError?: (field: string, error: { message: string }) => void) => {
  if (error?.data?.errors && setError) {
    // Handle validation errors
    const validationErrors = error.data.errors;
    
    Object.entries(validationErrors).forEach(([field, messages]) => {
      if (Array.isArray(messages) && messages.length > 0) {
        setError(field, { message: messages[0] });
      }
    });
    
    toast.error("Please fix the errors in the form");
  } else {
    // Handle general API error
    handleAPIError(error);
  }
};