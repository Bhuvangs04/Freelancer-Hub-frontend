import { useEffect, useState } from "react";
import { Briefcase } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import api,{ Project } from "./api.disputes";


interface ProjectSelectorProps {
  userType: "client" | "freelancer";
  value: string;
  onChange: (value: string) => void;
}

const ProjectSelector = ({
  userType,
  value,
  onChange,
}: ProjectSelectorProps) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedProjects =
          userType === "client"
            ? await api.getClientProjects()
            : await api.getFreelancerProjects();

        setProjects(fetchedProjects);
      } catch (err) {
        console.error("Error fetching projects:", err);
        setError("Failed to load projects. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [userType]);

  return (
    <div className="space-y-2 animate-fade-in">
      <Label htmlFor="project" className="flex items-center gap-2">
        <Briefcase className="h-4 w-4" />
        {userType === "client" ? "Project" : "Client Project"}
      </Label>

      <Select value={value} onValueChange={onChange} disabled={loading}>
        <SelectTrigger
          id="project"
          className={loading ? "animate-pulse-soft" : ""}
        >
          <SelectValue
            placeholder={
              loading
                ? "Loading projects..."
                : projects.length === 0
                ? "No projects available"
                : "Select project"
            }
          />
        </SelectTrigger>

        <SelectContent>
          {error ? (
            <div className="p-2 text-sm text-destructive">{error}</div>
          ) : projects.length === 0 && !loading ? (
            <div className="p-2 text-sm text-muted-foreground">
              No projects found
            </div>
          ) : (
            projects.map((project) => (
              <SelectItem
                key={project._id}
                value={project._id}
                className="transition-all-ease hover:bg-brand-50"
              >
                <div className="flex flex-col">
                  <span className="font-medium">{project.title}</span>
                  {userType === "client" && project.freelancerId && (
                    <span className="text-xs text-muted-foreground">
                      Freelancer: {project.freelancerId.username}
                    </span>
                  )}
                  {userType === "freelancer" && project.clientId && (
                    <span className="text-xs text-muted-foreground">
                      Client: {project.clientId.username}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground mt-1">
                    Status:{" "}
                    <span
                      className={`font-medium ${
                        project.status === "completed"
                          ? "text-green-600"
                          : "text-amber-600"
                      }`}
                    >
                      {project.status}
                    </span>
                  </span>
                </div>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>

      {loading && (
        <p className="text-xs text-muted-foreground animate-fade-in">
          Loading your projects...
        </p>
      )}
      {!loading && projects.length === 0 && !error && (
        <p className="text-xs text-muted-foreground animate-fade-in">
          You don't have any projects yet.
        </p>
      )}
    </div>
  );
};

export default ProjectSelector;
