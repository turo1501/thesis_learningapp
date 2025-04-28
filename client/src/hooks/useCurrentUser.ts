import { useUser } from "@clerk/nextjs";

/**
 * Hook to get the current user's ID and information
 * This is a wrapper around Clerk's useUser hook to simplify access to user data
 */
export const useCurrentUser = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  
  return {
    userId: user?.id || null,
    user,
    isLoaded,
    isSignedIn,
    // Add additional user-related properties as needed
    firstName: user?.firstName || null,
    lastName: user?.lastName || null,
    imageUrl: user?.imageUrl || null,
    email: user?.primaryEmailAddress?.emailAddress || null,
  };
}; 
 
 
 
 
 