import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Calendar, DollarSign, User, FileText, MessageSquare } from "lucide-react";

interface ProjectModalProps {
  project: {
    id: string;
    title: string;
    freelancer: string;
    status: "in_progress" | "on_hold" | "completed";
    progress: number;
    dueDate: string;
    budget: number;
    description: string;
    tasks: { title: string; completed: boolean }[];
    files: { name: string; size: string }[];
    messages: { sender: string; message: string; time: string }[];
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

const statusConfig = {
  in_progress: { label: "In Progress", color: "bg-status-progress text-white" },
  on_hold: { label: "On Hold", color: "bg-status-hold text-white" },
  completed: { label: "Completed", color: "bg-status-completed text-white" },
};

export const ProjectModal = ({ project, isOpen, onClose }: ProjectModalProps) => {
  if (!project) return null;

  const status = statusConfig[project.status];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-2xl font-semibold">
              {project.title}
            </DialogTitle>
            <Badge className={status.color}>{status.label}</Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center text-gray-600">
              <User className="w-4 h-4 mr-2" />
              <span>{project.freelancer}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Calendar className="w-4 h-4 mr-2" />
              <span>{project.dueDate}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <DollarSign className="w-4 h-4 mr-2" />
              <span>${project.budget.toLocaleString()}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Progress</span>
              <span>{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="h-2" />
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4" /> Tasks
            </h4>
            <div className="space-y-2">
              {project.tasks.map((task, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    readOnly
                    className="rounded border-gray-300"
                  />
                  <span className={task.completed ? "line-through text-gray-500" : ""}>
                    {task.title}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2">
              <MessageSquare className="w-4 h-4" /> Recent Messages
            </h4>
            <div className="space-y-4">
              {project.messages.map((message, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{message.sender}</span>
                    <span className="text-gray-500">{message.time}</span>
                  </div>
                  <p className="text-gray-600">{message.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};