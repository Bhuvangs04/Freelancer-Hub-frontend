import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface Project {
  id: string;
  title: string;
  description: string;
  budget: string;
  duration: string;
  status: string;
}

export const ProjectList = () => {
  const navigate = useNavigate();
  const projects = JSON.parse(localStorage.getItem("clientProjects") || "[]") as Project[];

  const handleProjectClick = (projectId: string) => {
    navigate(`/project/${projectId}/freelancers`);
  };

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">No projects yet</h3>
        <p className="mt-2 text-sm text-gray-600">
          Get started by adding your first project
        </p>
        <Button
          onClick={() => navigate("/add-project")}
          className="mt-4"
        >
          Add Project
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {projects.map((project) => (
        <div
          key={project.id}
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => handleProjectClick(project.id)}
        >
          <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
          <p className="mt-2 text-sm text-gray-600">{project.description}</p>
          <div className="mt-4 flex justify-between items-center">
            <span className="text-sm text-gray-600">Budget: ${project.budget}</span>
            <span className="text-sm text-gray-600">Duration: {project.duration} weeks</span>
          </div>
          <div className="mt-4">
            <span className={`px-2 py-1 text-xs rounded-full ${
              project.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
            }`}>
              {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};