import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface CustomFixedModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

const CustomModal = ({ 
  isOpen, 
  onClose, 
  children,
  size = "md"
}: CustomFixedModalProps) => {
  const [isRendered, setIsRendered] = useState(false);
  
  // Handle escape key press
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      // Prevent scrolling when modal is open
      document.body.style.overflow = 'hidden';
      // Short timeout to allow animation to play
      const timer = setTimeout(() => setIsRendered(true), 10);
      return () => {
        document.removeEventListener('keydown', handleEscapeKey);
        document.body.style.overflow = '';
        clearTimeout(timer);
      };
    } else {
      setIsRendered(false);
      return () => {};
    }
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    full: "max-w-4xl",
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/80 backdrop-blur-sm z-50 transition-opacity duration-300",
          isRendered ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal Container */}
      <div 
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300",
          isRendered ? "opacity-100" : "opacity-0"
        )}
      >
        {/* Modal Content */}
        <div 
          className={cn(
            "w-full relative transition-all duration-300",
            sizeClasses[size],
            isRendered ? "translate-y-0" : "translate-y-4"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </>
  );
};

export default CustomModal;