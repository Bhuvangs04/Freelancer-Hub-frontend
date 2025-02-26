import { useEffect, useState } from "react";
import { Github, ExternalLink, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

export const ProjectsGrid = () => {
  const [projects, setProjects] = useState<
    {
      _id: number;
      title: string;
      description: string;
      frameworks: string[];
      link: string;
    }[]
  >([]);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    frameworks: "",
    link: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/freelancer/oldProjects`,
          {
            credentials: "include",
          }
        );
        const data = await response.json();
        setProjects(Array.isArray(data.projects) ? data.projects : []);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchProjects();
  }, []);

   const handleAddProject = async () => {
     if (
       !newProject.title ||
       !newProject.description ||
       !newProject.frameworks ||
       !newProject.link
     ) {
       toast({
         title: "Error",
         description: "Please fill in all fields",
         variant: "destructive",
       });
       return;
     }

     try {
       const response = await fetch(
         `${import.meta.env.VITE_API_URL}/freelancer/freelancer/update`,
         {
           method: "POST",
           headers: {
             "Content-Type": "application/json",
           },
           body: JSON.stringify({
             projects: [
               {
                 ...newProject,
                 frameworks: newProject.frameworks
                   .split(",")
                   .map((f) => f.trim()),
               },
             ],
           }),
           credentials: "include",
         }
       );

       const data = await response.json();
       if (response.ok) {
         setProjects([...projects, { ...data.project, _id: Date.now() }]);
         setNewProject({
           title: "",
           description: "",
           frameworks: "",
           link: "",
         });
         setIsAddingProject(false);
         toast({
           title: "Success",
           description: "Project added successfully",
         });
       }
     } catch (error) {
       console.error("Error adding project:", error);
       toast({
         title: "Error",
         description: "Failed to add project",
         variant: "destructive",
       });
     }
   };


  return (
    <div className="w-full max-w-5xl mx-auto p-8 animate-fadeIn">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">Featured Projects</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Discover my latest work and the technologies I use to bring ideas to
          life
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {projects.map((project) => (
          <div
            key={project._id}
            className="group relative rounded-xl bg-card/50 backdrop-blur-sm border border-border p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
          >
            <div className="absolute top-0 right-0 m-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(project.link, "_blank")}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>

            <h3 className="text-xl font-bold mb-3">{project.title}</h3>
            <p className="text-muted-foreground mb-4 max-h-24 overflow-auto">
              {project.description}
            </p>

            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {project.frameworks.map((tech) => (
                  <span
                    key={tech}
                    className="bg-secondary/50 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(project.link)}
                className="w-full justify-center shadow-sm hover:shadow-md transition-all"
              >
                <Github className="w-4 h-4 mr-2" /> View Project
              </Button>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center mt-8">
        {!isAddingProject ? (
          <Button onClick={() => setIsAddingProject(true)} className="gap-2">
            <Plus size={16} /> Add Project
          </Button>
        ) : (
          <div className="w-full max-w-md bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6">
            <div className="space-y-4">
              <Input
                placeholder="Project title"
                value={newProject.title}
                onChange={(e) =>
                  setNewProject({ ...newProject, title: e.target.value })
                }
              />
              <Textarea
                placeholder="Project description"
                value={newProject.description}
                onChange={(e) =>
                  setNewProject({ ...newProject, description: e.target.value })
                }
                rows={3}
              />
              <Input
                placeholder="Technologies used (comma-separated)"
                value={newProject.frameworks}
                onChange={(e) =>
                  setNewProject({ ...newProject, frameworks: e.target.value })
                }
              />
              <Input
                placeholder="GitHub link"
                value={newProject.link}
                onChange={(e) =>
                  setNewProject({ ...newProject, link: e.target.value })
                }
              />
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setIsAddingProject(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddProject}>Add Project</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
