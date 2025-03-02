import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CalendarIcon, IndianRupee } from "lucide-react";

interface Project {
  id?: string;
  _id?: string;
  title: string;
  freelancer?: string;
  freelancerId?: string;
  status: "in_progress" | "on_hold" | "completed";
  progress: number;
  dueDate: string;
  budget: number;
  description: string;
}

interface ProjectCardProps {
  project: Project;
  onViewDetails: () => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onViewDetails,
}) => {
  const statusColorMap = {
    in_progress: "bg-blue-100 text-blue-800",
    on_hold: "bg-yellow-100 text-yellow-800",
    completed: "bg-green-100 text-green-800",
  };

  const statusText = {
    in_progress: "In Progress",
    on_hold: "On Hold",
    completed: "Completed",
  };

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg line-clamp-1">
            {project.title}
          </CardTitle>
          <Badge className={statusColorMap[project.status]}>
            {statusText[project.status]}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {project.freelancer || "Unassigned"}
        </p>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Progress</span>
              <span>{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="h-2" />
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <CalendarIcon className="h-3.5 w-3.5" />
              <span>{formatDate(project.dueDate)}</span>
            </div>
            <div className="flex items-center  text-muted-foreground">
              <IndianRupee className="h-3.5 w-3.5  " />
              <span>{project.budget.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" onClick={onViewDetails}>
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};
