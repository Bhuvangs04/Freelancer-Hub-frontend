import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  Calendar,

  LayoutGrid,
  List,
  ArrowLeftIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Project } from "@/types";
import { api } from "@/lib/api";
import ProjectCard from "@/components/FreelacerCard";
import TaskList from "@/components/TaskList";
import FileUpload from "@/components/FileUpload";
import MessageForm from "@/components/MessageForm";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Initialize API and fetch projects
  useEffect(() => {
    api.init();
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const response = await api.getProjects();
      if (response.status === "success" && response.data) {
        setProjects(response.data);

        // Auto-select the first project if none is selected
        if (response.data.length > 0 && !selectedProject) {
          setSelectedProject(response.data[0]);
        }
      } else {
        toast.error(response.message || "Failed to fetch projects");
      }
    } catch (error) {
      toast.error("Failed to fetch projects");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProjectSelect = async (projectId: string) => {
    if (selectedProject?._id === projectId) return;
    try {
      const response = await api.getProject(projectId);
      if (response.status === "success" && response.data) {
        setSelectedProject(response.data[0]);
      } else {
        toast.error(response.message || "Failed to fetch project details");
      }
    } catch (error) {
      toast.error("Failed to fetch project details");
      console.error(error);
    }
  };

  const handleProjectUpdate = (updatedProject: Project) => {
    setSelectedProject(updatedProject[0]);

    // Also update the project in the projects list
    setProjects((prevProjects) =>
      prevProjects.map((p) =>
        p._id === updatedProject._id ? updatedProject : p
      )
    );
  };

  const goBack = () => {
    setSelectedProject(null);
  };

  return (
    <>
      <div className=" min-h-screen bg-gray-50 animate-in fade-in">
        <Button
          variant="ghost"
          className="ml-3 mt-5 flex items-center gap-2 hover:bg-green-400"
          onClick={() => navigate(-1)}
        >
          <ArrowLeftIcon width={24} />
          Back
        </Button>
        <div className="container mx-auto px-4 py-6">
          {/* Dashboard Header */}
          <header className="mb-8">
            {selectedProject ? (
              <div className="flex items-center mb-6">
                <button
                  onClick={goBack}
                  className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <ChevronLeft size={20} className="text-gray-600" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {selectedProject.title}
                  </h1>
                  <p className="text-gray-500">{selectedProject.description}</p>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Ongoing Projects
                  </h1>
                  <p className="text-gray-500">
                    Manage your active freelance projects
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={cn(
                      "p-2 rounded-md transition-colors",
                      viewMode === "grid"
                        ? "bg-gray-200 text-gray-900"
                        : "bg-white text-gray-500 hover:bg-gray-100"
                    )}
                  >
                    <LayoutGrid size={18} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={cn(
                      "p-2 rounded-md transition-colors",
                      viewMode === "list"
                        ? "bg-gray-200 text-gray-900"
                        : "bg-white text-gray-500 hover:bg-gray-100"
                    )}
                  >
                    <List size={18} />
                  </button>
                </div>
              </div>
            )}
          </header>

          {/* Dashboard Content */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-pulse flex flex-col items-center">
                <div className="h-12 w-12 rounded-full bg-gray-200 mb-4"></div>
                <div className="h-4 w-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          ) : projects.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <Calendar size={32} className="text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No projects yet
              </h3>
              <p className="text-gray-500 mb-6">
                You don't have any ongoing projects at the moment.
              </p>
              <Link
                to="#"
                className="inline-flex items-center justify-center px-5 py-2.5 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
              >
                Find Opportunities
              </Link>
            </div>
          ) : selectedProject ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <TaskList
                  project={selectedProject}
                  onProjectUpdate={handleProjectUpdate}
                />
                <FileUpload
                  project={selectedProject}
                  onProjectUpdate={handleProjectUpdate}
                />
              </div>
              <div className="h-full">
                <MessageForm
                  project={selectedProject}
                  onProjectUpdate={handleProjectUpdate}
                />
              </div>
            </div>
          ) : (
            <div
              className={cn(
                "grid gap-6",
                viewMode === "grid"
                  ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                  : "grid-cols-1"
              )}
            >
              {projects.map((project) => (
                <ProjectCard
                  key={project._id}
                  project={project}
                  onClick={handleProjectSelect}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
