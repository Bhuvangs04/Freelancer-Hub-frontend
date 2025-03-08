import React from "react";
import { cn } from "@/lib/utils";
import { Ban } from "lucide-react";

type StatusType = "suspended" | "pending" | "warning";

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const statusConfig = {
  suspended: {
    bgColor: "bg-destructive/10",
    textColor: "text-destructive",
    borderColor: "border-destructive/20",
    icon: Ban,
    label: "Account Suspended",
  },
  pending: {
    bgColor: "bg-yellow-500/10",
    textColor: "text-yellow-600",
    borderColor: "border-yellow-500/20",
    icon: Ban,
    label: "Review Pending",
  },
  warning: {
    bgColor: "bg-orange-500/10",
    textColor: "text-orange-600",
    borderColor: "border-orange-500/20",
    icon: Ban,
    label: "Warning",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full",
        "text-sm font-medium border",
        "transition-all duration-300 ease-in-out",
        config.bgColor,
        config.textColor,
        config.borderColor,
        className
      )}
    >
      <Icon size={14} className="animate-pulse-light" />
      <span>{config.label}</span>
    </div>
  );
}

export default StatusBadge;
