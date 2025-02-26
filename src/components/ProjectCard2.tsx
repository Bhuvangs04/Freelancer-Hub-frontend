import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Project } from "@/lib/types";
import { Calendar, DollarSign, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ProjectCardProps {
  project: Project;
}

const ProjectCard = ({ project }: ProjectCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  const handleViewFreelancers = () => {
    navigate(`/project/${project.id}/freelancers`);
  };

  return (
    <Card className="w-full transition-all duration-300 hover:shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl mb-2">{project.title}</CardTitle>
            <CardDescription className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              ${project.budget.toLocaleString()}
            </CardDescription>
          </div>
          <Badge variant="secondary">{project.category}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className={`text-muted-foreground ${isExpanded ? "" : "line-clamp-2"}`}>
            {project.description}
          </p>
          
          <div className="flex flex-wrap gap-2">
            {project.skills.map((skill) => (
              <Badge key={skill} variant="outline">
                {skill}
              </Badge>
            ))}
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Deadline: {new Date(project.deadline).toLocaleDateString()}</span>
          </div>

          {isExpanded && (
            <div className="pt-4 border-t">
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-4 w-4 text-yellow-400" />
                <span>Client Rating: {project.clientRating}/5</span>
              </div>
              {project.clientFeedback && (
                <p className="text-sm text-muted-foreground">{project.clientFeedback}</p>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? "Show Less" : "View Details"}
            </Button>
            <Button
              variant="default"
              className="flex-1"
              onClick={handleViewFreelancers}
            >
              View Freelancers
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;