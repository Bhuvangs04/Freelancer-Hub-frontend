import React from "react";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  progress: number;
  className?: string;
  color?: "default" | "success";
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  className,
  color = "default",
}) => {
  const percentage = Math.min(100, Math.max(0, progress));

  return (
    <div
      className={cn(
        "h-1.5 w-full bg-gray-100 rounded-full overflow-hidden",
        className
      )}
    >
      <div
        className={cn(
          "h-full transition-all duration-300 ease-out rounded-full",
          color === "success" ? "bg-green-500" : "bg-primary"
        )}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

export default ProgressBar;
