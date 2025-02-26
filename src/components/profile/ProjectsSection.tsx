import { Briefcase, Code2, Github, Trash2, PlusCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Project {
  title: string;
  description: string;
  frameworks: string[];
  githubLink: string;
}

interface ProjectsSectionProps {
  projects: Project[];
  onProjectsChange: (projects: Project[]) => void;
  onAddProject: () => void;
}

const ProjectsSection = ({
  projects,
  onProjectsChange,
  onAddProject,
}: ProjectsSectionProps) => {
  const handleDeleteProject = (indexToDelete: number) => {
    const newProjects = projects.filter((_, index) => index !== indexToDelete);
    onProjectsChange(newProjects);
  };

  const handleAddFramework = (projectIndex: number) => {
    const newProjects = [...projects];
    newProjects[projectIndex].frameworks.push("");
    onProjectsChange(newProjects);
  };

  const handleDeleteFramework = (
    projectIndex: number,
    frameworkIndex: number
  ) => {
    const newProjects = [...projects];
    newProjects[projectIndex].frameworks.splice(frameworkIndex, 1);
    onProjectsChange(newProjects);
  };

  return (
    <Card className="p-6 space-y-4 shadow-md hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Briefcase className="w-5 h-5 text-neutral-600" />
          <h2 className="text-lg font-medium text-neutral-800">Projects</h2>
        </div>
        <Button
          onClick={onAddProject}
          variant="outline"
          className="hover:bg-neutral-100"
        >
          Add Project
        </Button>
      </div>
      <div className="space-y-6">
        {projects.map((project, projectIndex) => (
          <div
            key={projectIndex}
            className="space-y-4 p-6 bg-white rounded-lg border border-neutral-200 hover:border-neutral-300 transition-colors relative group"
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500 hover:bg-red-50"
              onClick={() => handleDeleteProject(projectIndex)}
              title="Delete project"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            <div className="space-y-4">
              <Input
                placeholder="Project title"
                value={project.title}
                onChange={(e) => {
                  const newProjects = [...projects];
                  newProjects[projectIndex].title = e.target.value;
                  onProjectsChange(newProjects);
                }}
                className="text-lg font-medium"
              />
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-neutral-600">
                  Frameworks/Technologies
                </h3>
                {project.frameworks.map((framework, frameworkIndex) => (
                  <div
                    key={frameworkIndex}
                    className="flex items-center space-x-2"
                  >
                    <Code2 className="w-4 h-4 text-neutral-500" />
                    <Input
                      placeholder="Framework/Technology"
                      value={framework}
                      onChange={(e) => {
                        const newProjects = [...projects];
                        newProjects[projectIndex].frameworks[frameworkIndex] =
                          e.target.value;
                        onProjectsChange(newProjects);
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-neutral-400 hover:text-red-500"
                      onClick={() =>
                        handleDeleteFramework(projectIndex, frameworkIndex)
                      }
                      title="Remove framework"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  onClick={() => handleAddFramework(projectIndex)}
                  variant="outline"
                  size="sm"
                  className="mt-2 flex items-center"
                >
                  <PlusCircle className="w-4 h-4 mr-2" /> Add Framework
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <Github className="w-4 h-4 text-neutral-500" />
                <Input
                  placeholder="GitHub link (optional)"
                  value={project.githubLink}
                  onChange={(e) => {
                    const newProjects = [...projects];
                    newProjects[projectIndex].githubLink = e.target.value;
                    onProjectsChange(newProjects);
                  }}
                />
              </div>
              <Textarea
                placeholder="Project description"
                value={project.description}
                onChange={(e) => {
                  const newProjects = [...projects];
                  newProjects[projectIndex].description = e.target.value;
                  onProjectsChange(newProjects);
                }}
                className="min-h-[100px]"
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ProjectsSection;
