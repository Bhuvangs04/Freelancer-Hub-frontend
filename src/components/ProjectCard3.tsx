import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Clock, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Project {
  id: string;
  name: string;
  description: string;
  skills: string[];
  duration: string;
  budget: number;
  experienceLevel: string;
}

export default function ProjectCard({ project }: { project: Project }) {
  const navigate = useNavigate();

  return (
    <Card 
      className="project-card cursor-pointer"
      onClick={() => navigate(`/project/${project.id}`)}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">{project.name}</CardTitle>
            <CardDescription className="mt-2">{project.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {project.skills.map((skill) => (
              <Badge key={skill} variant="secondary">
                {skill}
              </Badge>
            ))}
          </div>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {project.duration}
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              {project.budget.toLocaleString()}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}