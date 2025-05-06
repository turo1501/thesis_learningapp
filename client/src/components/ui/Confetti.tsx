"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ConfettiProps {
  duration?: number;
  className?: string;
  particleCount?: number;
}

export const Confetti = ({
  duration = 5000,
  className,
  particleCount = 100
}: ConfettiProps) => {
  const [isActive, setIsActive] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsActive(false);
    }, duration);
    
    return () => clearTimeout(timer);
  }, [duration]);
  
  if (!isActive) return null;
  
  return (
    <div className={cn("fixed inset-0 pointer-events-none z-50 overflow-hidden", className)}>
      {Array.from({ length: particleCount }).map((_, index) => (
        <div
          key={index}
          className="absolute animate-confetti w-2 h-2 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `-20px`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${3 + Math.random() * 2}s`,
            backgroundColor: getRandomColor(),
            transform: `scale(${0.5 + Math.random()})`,
          }}
        />
      ))}
    </div>
  );
};

// Array of confetti colors
const confettiColors = [
  "#4285F4", // blue
  "#EA4335", // red
  "#FBBC05", // yellow
  "#34A853", // green
  "#8F00FF", // purple
  "#00FFFF", // cyan
  "#FF00FF", // magenta
  "#FF9900", // orange
];

// Function to get a random color from the array
const getRandomColor = () => {
  return confettiColors[Math.floor(Math.random() * confettiColors.length)];
}; 