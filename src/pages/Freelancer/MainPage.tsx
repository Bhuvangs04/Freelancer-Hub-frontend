import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  Calendar,
  LayoutGrid,
  List,
  ArrowLeftIcon,
  Briefcase,
  ChevronRight,
  Clock,
  FolderOpen,
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-600/10 via-transparent to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium transition-colors mb-6 group"
          >
            <ArrowLeftIcon className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            Back
          </button>

          {selectedProject ? (
            <div className="flex items-center gap-4 mb-2">
              <button
                onClick={goBack}
                className="h-9 w-9 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center hover:bg-white/[0.1] transition-colors"
              >
                <ChevronLeft size={18} className="text-slate-300" />
              </button>
              <div className="min-w-0">
                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight truncate">
                  {selectedProject.title}
                </h1>
                <p className="text-slate-400 text-sm mt-1 line-clamp-1">{selectedProject.description}</p>
              </div>
            </div>
          ) : (
              <div className="flex justify-between items-end gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                    Ongoing Projects
                  </h1>
                  <p className="text-slate-400 mt-1 text-sm">
                    Manage your active freelance projects
                  </p>
                </div>

                {/* View Toggle */}
                <div className="flex items-center bg-slate-800/60 border border-white/[0.06] rounded-xl p-1 gap-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={cn(
                    "p-2 rounded-lg transition-all duration-200",
                    viewMode === "grid"
                      ? "bg-white/[0.1] text-white shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.05]"
                  )}
                  >
                    <LayoutGrid size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={cn(
                    "p-2 rounded-lg transition-all duration-200",
                    viewMode === "list"
                      ? "bg-white/[0.1] text-white shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.05]"
                  )}
                  >
                  <List size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="relative h-12 w-12 mx-auto">
                <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-violet-500 animate-spin" />
                <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-indigo-400 animate-spin" style={{ animationDirection: "reverse", animationDuration: "0.8s" }} />
              </div>
              <p className="mt-4 text-slate-400 text-sm">Loading projects...</p>
            </div>
          </div>
        ) : projects.length === 0 ? (
            <div className="bg-slate-800/40 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-14 text-center">
              <div className="h-16 w-16 mx-auto rounded-2xl bg-gradient-to-br from-violet-500/15 to-indigo-500/15 flex items-center justify-center mb-5">
                <FolderOpen className="h-7 w-7 text-violet-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                No projects yet
              </h3>
              <p className="text-slate-400 mb-8 max-w-sm mx-auto">
                You don't have any ongoing projects at the moment. Browse opportunities to get started.
              </p>
              <Link
                to="#"
                className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl font-medium shadow-lg shadow-violet-500/20 transition-all duration-300 gap-2"
              >
                <Briefcase className="h-4 w-4" />
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
              "grid gap-5",
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
  );
}
