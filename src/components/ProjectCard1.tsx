import { StatusBadge } from "./StatusBadge";
import { ProgressBar } from "./ProgressBar";

interface Project {
  id: string;
  title: string;
  status: "In Progress" | "Completed" | "On Hold" | "Not Started";
  progress: number;
  description: string;
  deadline: string;
}

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}

export const ProjectCard1 = ({ project, onClick }: ProjectCardProps) => {
  return (
    <div className="card animate-slideUp cursor-pointer" onClick={onClick}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-semibold text-lg">{project.title}</h3>
        <StatusBadge status={project.status} />
      </div>
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {project.description}
      </p>
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Progress</span>
          <span>{project.progress}%</span>
        </div>
        <ProgressBar progress={project.progress} />
      </div>
      <div className="mt-4 pt-4 border-t">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Deadline</span>
          <span className="font-medium">{project.deadline}</span>
        </div>
      </div>
    </div>
  );
};