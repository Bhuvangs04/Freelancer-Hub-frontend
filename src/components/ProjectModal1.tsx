import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChatInterface } from "./ChatInterface";
import ProgressBar from "./ProgressBar";
import { StatusBadge } from "./StatusBadge";

interface Project {
  id: string;
  title: string;
  status: "In Progress" | "Completed" | "On Hold" | "Not Started";
  progress: number;
  description: string;
  deadline: string;
}

interface ProjectModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (status: Project["status"]) => void;
  onUpdateProgress: (progress: number) => void;
}

export const ProjectModal1 = ({
  project,
  isOpen,
  onClose,
  onUpdateStatus,
}: ProjectModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{project.title}</span>
            <StatusBadge status={project.status} />
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-medium">Project Details</h3>
            <p className="text-gray-600">{project.description}</p>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Deadline</span>
              <span className="font-medium">{project.deadline}</span>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">Progress Tracking</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Progress</span>
                <span>{project.progress}%</span>
              </div>
              <ProgressBar progress={project.progress} />
            </div>
            <Select
              value={project.status}
              onValueChange={(value) => onUpdateStatus(value as Project["status"])}
            >
              <SelectTrigger>
                <SelectValue placeholder="Update Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Not Started">Not Started</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="On Hold">On Hold</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">Client Communication</h3>
            <ChatInterface projectId={project.id} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};