import { useState } from "react";
import { ProjectCard1 } from "@/components/ProjectCard1";
import { ProjectModal1 } from "@/components/ProjectModal1";

// Mock data for initial development
const mockProjects = [
  {
    id: "1",
    title: "E-commerce Website Redesign",
    status: "In Progress" as const,
    progress: 65,
    description: "Complete redesign of the client's e-commerce platform with modern UI/UX principles and improved checkout flow.",
    deadline: "2024-03-15",
  },
  {
    id: "2",
    title: "Mobile App Development",
    status: "Not Started" as const,
    progress: 0,
    description: "Develop a cross-platform mobile application for inventory management system.",
    deadline: "2024-04-01",
  },
  {
    id: "3",
    title: "Brand Identity Design",
    status: "Completed" as const,
    progress: 100,
    description: "Create a comprehensive brand identity including logo, color palette, and brand guidelines.",
    deadline: "2024-02-28",
  },
  {
    id: "4",
    title: "Marketing Website",
    status: "On Hold" as const,
    progress: 30,
    description: "Design and develop a marketing website for a new startup in the tech industry.",
    deadline: "2024-03-30",
  },
];

const Index = () => {
  const [projects, setProjects] = useState(mockProjects);
  const [selectedProject, setSelectedProject] = useState<typeof mockProjects[0] | null>(null);

  const handleUpdateStatus = (status: typeof mockProjects[0]["status"]) => {
    if (!selectedProject) return;
    
    const updatedProjects = projects.map((project) =>
      project.id === selectedProject.id ? { ...project, status } : project
    );
    
    setProjects(updatedProjects);
    setSelectedProject({ ...selectedProject, status });
  };

  const handleUpdateProgress = (progress: number) => {
    if (!selectedProject) return;
    
    const updatedProjects = projects.map((project) =>
      project.id === selectedProject.id ? { ...project, progress } : project
    );
    
    setProjects(updatedProjects);
    setSelectedProject({ ...selectedProject, progress });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {projects.map((project) => (
            <ProjectCard1
              key={project.id}
              project={project}
              onClick={() => setSelectedProject(project)}
            />
          ))}
        </div>

        {selectedProject && (
          <ProjectModal1
            project={selectedProject}
            isOpen={!!selectedProject}
            onClose={() => setSelectedProject(null)}
            onUpdateStatus={handleUpdateStatus}
            onUpdateProgress={handleUpdateProgress}
          />
        )}
      </div>
    </div>
  );
};

export default Index;