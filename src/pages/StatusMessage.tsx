import React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Info } from "lucide-react";

interface StatusMessageProps {
  title: string;
  message: string;
  type?: "info" | "warning";
  className?: string;
}

export function StatusMessage({
  title,
  message,
  type = "info",
  className,
}: StatusMessageProps) {
  const isInfo = type === "info";
  const Icon = isInfo ? Info : AlertTriangle;

  return (
    <Card
      className={cn(
        "border overflow-hidden transition-all duration-300",
        isInfo
          ? "border-blue-200 dark:border-blue-800"
          : "border-yellow-200 dark:border-yellow-800",
        className
      )}
    >
      <CardContent className="p-4 sm:p-6">
        <div className="flex gap-4">
          <div
            className={cn(
              "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
              isInfo
                ? "bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400"
                : "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/50 dark:text-yellow-400"
            )}
          >
            <Icon size={20} />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-medium mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default StatusMessage;
