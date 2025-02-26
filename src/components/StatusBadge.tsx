import { cn } from "@/lib/utils";

type Status = "In Progress" | "Completed" | "On Hold" | "Not Started";

interface StatusBadgeProps {
  status: Status;
}

const statusStyles = {
  "In Progress": "bg-warning/10 text-warning",
  "Completed": "bg-success/10 text-success",
  "On Hold": "bg-danger/10 text-danger",
  "Not Started": "bg-gray-100 text-gray-600",
};

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  return (
    <span className={cn("badge", statusStyles[status])}>
      {status}
    </span>
  );
};