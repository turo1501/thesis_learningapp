import React from "react";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NoResultsProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  actionText?: string;
  onAction?: () => void;
}

const NoResults = ({
  title,
  description,
  icon: Icon,
  actionText,
  onAction,
}: NoResultsProps) => {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
      {Icon && (
        <div className="mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-800">
          <Icon className="h-8 w-8 text-gray-500" />
        </div>
      )}
      <h3 className="mb-2 text-xl font-semibold">{title}</h3>
      <p className="mb-6 text-muted-foreground">{description}</p>
      {actionText && onAction && (
        <Button onClick={onAction} className="mt-2">
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default NoResults; 