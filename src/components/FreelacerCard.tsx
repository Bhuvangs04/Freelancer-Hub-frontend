import { useState } from "react";
import {
  Calendar,
  Clock,
  IndianRupee,
  MoreVertical,
  MessageSquare,
  FileText,
  CheckSquare,
} from "lucide-react";
import { format } from "date-fns";
import { Project } from "@/types";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  project: Project;
  onClick: (projectId: string) => void;
}

export default function ProjectCard({ project, onClick }: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Calculate progress
  const totalTasks = project.tasks.length;
  const completedTasks = project.tasks.filter((task) => task.completed).length;
  const progress =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Format dates
  const formattedDeadline = project.dueDate
    ? format(new Date(project.dueDate), "MMM dd, yyyy")
    : "No deadline";

  const daysLeft = project.dueDate
    ? Math.ceil(
        (new Date(project.dueDate).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  // Status badge color
  const getStatusColor = (status: Project["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "on-hold":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  return (
    <div
      className={cn(
        "rounded-xl overflow-hidden card-hover border p-5",
        isHovered ? "shadow-md -translate-y-1" : "shadow-sm",
        "transition-all duration-300 bg-white"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onClick(project._id)}
    >
      <div className="flex justify-between items-start">
        <div>
          <span
            className={cn(
              "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
              getStatusColor(project.status)
            )}
          >
            {project.status === "in-progress"
              ? "In Progress"
              : project.status === "completed"
              ? "Completed"
              : "On Hold"}
          </span>
          <h3 className="mt-2 text-lg font-semibold text-gray-900 truncate">
            {project.title}
          </h3>
          <p className="mt-1 text-sm text-gray-500 line-clamp-2">
            {project.description}
          </p>
        </div>

        <button className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors">
          <MoreVertical size={16} />
        </button>
      </div>

      <div className="mt-4">
        <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="mt-1 flex justify-between text-xs text-gray-500">
          <span>{progress}% complete</span>
          <span>
            {completedTasks} of {totalTasks} tasks
          </span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="flex items-center text-sm text-gray-600">
          <Calendar size={14} className="mr-1.5 text-gray-400" />
          <span>{formattedDeadline}</span>
        </div>

        {daysLeft !== null && (
          <div className="flex items-center text-sm">
            <Clock size={14} className="mr-1.5 text-gray-400" />
            <span
              className={cn(
                daysLeft < 3
                  ? "text-red-600"
                  : daysLeft < 7
                  ? "text-amber-600"
                  : "text-gray-600"
              )}
            >
              {daysLeft > 0 ? `${daysLeft} days left` : "Overdue"}
            </span>
          </div>
        )}

        {project.budget && (
          <div className="flex items-center text-sm text-gray-600">
            <IndianRupee size={14} className=" text-gray-400" />
            <span>{project.budget.toLocaleString()}</span>
          </div>
        )}

        <div className="flex items-center text-sm text-gray-600">
          <MessageSquare size={14} className="mr-1.5 text-gray-400" />
          <span>{project.messages?.length || 0} messages</span>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-gray-100 flex justify-between">
        <div className="flex items-center text-sm text-gray-600">
          <span className="font-medium">Client:</span>
          <span className="ml-2">{project.clientName}</span>
        </div>

        <div className="flex space-x-2">
          <StatusIcon
            value={project.tasks.some((t) => !t.completed)}
            icon={<CheckSquare size={16} />}
            label="Tasks"
          />
          <StatusIcon
            value={project.files.length > 0}
            icon={<FileText size={16} />}
            label="Files"
          />
          <StatusIcon
            value={project.messages?.length > 0}
            icon={<MessageSquare size={16} />}
            label="Messages"
          />
        </div>
      </div>
    </div>
  );
}

interface StatusIconProps {
  value: boolean;
  icon: React.ReactNode;
  label: string;
}

const StatusIcon = ({ value, icon, label }: StatusIconProps) => (
  <div className="relative group">
    <div
      className={cn(
        "p-1.5 rounded-full",
        value ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-400"
      )}
    >
      {icon}
    </div>
    <div className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
      {label}
    </div>
  </div>
);
