import React from "react";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  progress: number;
  className?: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  color?: "default" | "success" | "warning" | "error";
}

const ProgressBar = ({
  progress,
  className,
  showLabel = true,
  size = "md",
  color = "default",
}: ProgressBarProps) => {
  const getHeight = () => {
    switch (size) {
      case "sm":
        return "h-1";
      case "md":
        return "h-2";
      case "lg":
        return "h-3";
      default:
        return "h-2";
    }
  };

  const getColor = () => {
    switch (color) {
      case "success":
        return "bg-green-500";
      case "warning":
        return "bg-yellow-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-primary";
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="w-full bg-gray-200 rounded-full dark:bg-gray-700 overflow-hidden">
        <div
          className={cn(
            "transition-all duration-300 ease-out rounded-full",
            getHeight(),
            getColor()
          )}
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      {showLabel && (
        <div className="mt-1 text-xs text-right text-gray-500 dark:text-gray-400">
          {progress}%
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
