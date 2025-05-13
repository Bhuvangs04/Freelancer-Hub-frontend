import { useState } from "react";
import { ProjectCard } from "@/components/ProjectCard";
import { ProjectModal } from "@/components/ProjectModal";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Loader2, ArrowLeftIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

// Define the project type based on your schema
interface Task {
  title: string;
  completed: boolean;
}

interface File {
  name: string;
  size: string;
  url: string;
}

interface Message {
  sender: string;
  message: string;
  timestamp: string;
}

interface Project {
  _id: string;
  projectId: string;
  title: string;
  freelancerId: string;
  clientId: string;
  status: string;
  progress: number;
  dueDate: string;
  budget: number;
  description: string;
  freelancerBidPrice?: number;
  tasks: Task[];
  files: File[];
  messages: Message[];
  freelancer?: string;
}

const API_URL = import.meta.env.VITE_API_URL || "";

// Function to fetch projects
const fetchProjects = async (): Promise<Project[]> => {
  const response = await fetch(`${API_URL}/client/ongoing/projects`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch projects");
  }

  const data = await response.json();

  // Transform data to match the expected structure
  return data.map((project) => ({
    ...project,
    _id: project._id || project.id,
    projectId: project.projectId,
    freelancer: project.freelancer || "Unknown Freelancer",
  }));
};

const Index = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Fetch projects using React Query
  const {
    data: projects,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });

  // Filter projects based on search query and status filter
  const filteredProjects =
    projects?.filter((project) => {
      const matchesSearch =
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (project.freelancer &&
          project.freelancer.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus =
        statusFilter === "all" || project.status === statusFilter;
      return matchesSearch && matchesStatus;
    }) || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 p-6">
      <Button
        variant="ghost"
        className="ml-3 mt-5 flex items-center gap-2 hover:bg-green-400"
        onClick={() => navigate(-1)}
      >
        <ArrowLeftIcon width={24} />
        Back
      </Button>
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Projects Overview</h1>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search projects or freelancers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="on-hold">On Hold</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-lg">Loading projects...</span>
          </div>
        ) : error ? (
          <div className="p-6 text-center bg-destructive/10 rounded-lg border border-destructive">
            <p className="text-destructive font-medium">
              Error loading projects. Please try again later.
            </p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="p-6 text-center bg-muted rounded-lg">
            <p className="text-muted-foreground">
              No projects found matching your criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project._id}
                project={{
                  ...project,
                  id: project._id, // Ensure id is available for components expecting it
                  status: project.status.replace("_", "-"), // Convert status to match the expected format
                }}
                onViewDetails={() => setSelectedProject(project)}
              />
            ))}
          </div>
        )}

        <ProjectModal
          project={
            selectedProject
              ? {
                  ...selectedProject,
                  id: selectedProject._id, // Ensure id is available for components expecting it
                  freelancer:
                    selectedProject.freelancer || "Unknown Freelancer", // Ensure freelancer is defined
                }
              : null
          }
          isOpen={!!selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      </div>
    </div>
  );
};

export default Index;
