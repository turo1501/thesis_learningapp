import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface APIErrorMessageProps {
  errors?: string[];
  title?: string;
}

const APIErrorMessage: React.FC<APIErrorMessageProps> = ({ 
  errors = [], 
  title = "API Error" 
}) => {
  const [dismissedErrors, setDismissedErrors] = React.useState<string[]>([]);
  
  // If there are no errors or all are dismissed, don't render anything
  if (errors.length === 0 || dismissedErrors.length === errors.length) {
    return null;
  }
  
  // Filter out dismissed errors
  const activeErrors = errors.filter(error => !dismissedErrors.includes(error));
  
  const dismissError = (error: string) => {
    setDismissedErrors(prev => [...prev, error]);
  };
  
  return (
    <div className="mb-6 space-y-3">
      {activeErrors.map((error, index) => (
        <Alert 
          key={index} 
          variant="destructive" 
          className="bg-red-500/10 border-red-500/20 text-red-300 relative"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
            <div className="flex-1">
              <AlertTitle className="text-red-200 font-medium text-base mb-1">{title}</AlertTitle>
              <AlertDescription className="text-sm text-red-300">
                {error}
              </AlertDescription>
            </div>
            <button 
              onClick={() => dismissError(error)}
              className="p-1 rounded-md hover:bg-red-500/20 transition-colors"
              aria-label="Dismiss error"
            >
              <X className="h-4 w-4 text-red-400" />
            </button>
          </div>
        </Alert>
      ))}
    </div>
  );
};

export default APIErrorMessage; 