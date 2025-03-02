import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye } from "lucide-react";
import { ArrowLeftIcon } from "@heroicons/react/solid";

interface Project {
  _id: string;
  title: string;
  description: string;
  budget: number;
  deadline: string;
  skillsRequired: string[];
  status: string;
}

const client_id = localStorage.getItem("Chatting_id");

const ClientProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/client/clients/projects/bids`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        if (data && data.projects) {
          setProjects(data.projects);
        }
      } catch (error) {
        console.error("Failed to fetch projects:", error);
        toast.error("Failed to load your projects. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleViewBids = (projectId: string,projectTitle:string) => {
    navigate(
      `/project-bids/${projectId}?role=client&final=${getRandomString(
        50
      )}&project_title=${projectTitle}`
    );
  };

  // Function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Function to get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-800 border-blue-200"
          >
            Open
          </Badge>
        );
      case "in-progress":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-800 border-yellow-200"
          >
            In Progress
          </Badge>
        );
      case "completed":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-800 border-green-200"
          >
            Completed
          </Badge>
        );
      case "cancelled":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-800 border-red-200"
          >
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };
    function getRandomString(length) {
      const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      let result = "";
      const charactersLength = characters.length;
      for (let i = 0; i < length; i++) {
        result += characters.charAt(
          Math.floor(Math.random() * charactersLength)
        );
      }
      return result;
    }

  return (
    <div className="container mx-auto py-8 px-4">
      <Button
        variant="ghost"
        className="mr-3 flex items-center gap-2 hover:bg-green-400"
        onClick={() =>
          navigate(
            `/find/freelancers/?id=${getRandomString(
              100
            )}&pr=1&user=1&name=1&role=freelancer&final=${getRandomString(50)}`
          )
        }
      >
        <ArrowLeftIcon width={24} />
        Back
      </Button>
      <h1 className="text-3xl font-bold mb-6">My Projects</h1>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-3 animate-pulse bg-muted h-12"></CardHeader>
              <CardContent className="space-y-4">
                <div className="h-16 bg-muted animate-pulse rounded"></div>
                <div className="h-8 bg-muted animate-pulse rounded"></div>
                <div className="space-y-2">
                  {[1, 2, 3, 4].map((j) => (
                    <div
                      key={j}
                      className="h-5 bg-muted animate-pulse rounded"
                    ></div>
                  ))}
                </div>
                <div className="h-24 bg-muted animate-pulse rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : projects.length === 0 ||
        projects.every((project) => project.status === "Payment Pending") ? (
        <div className="text-center p-8 bg-muted rounded-lg">
          <p className="text-lg">You haven't created any projects yet.</p>
          <Button
            className="mt-4"
            onClick={() =>
              navigate(
                `/add-project/${client_id}/direct?final=${getRandomString(
                  100
                )}&role=client&name=1`
              )
            }
          >
            Create Your First Project
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <>
              {project.status === "open" && (
                <Card key={project._id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl">{project.title}</CardTitle>
                      {getStatusBadge(project.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {project.description}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {project.skillsRequired.map((skill) => (
                        <Badge
                          key={skill}
                          variant="secondary"
                          className="text-xs"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Budget</span>
                        <span className="font-medium">
                          ₹{project.budget.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Deadline</span>
                        <span>{formatDate(project.deadline)}</span>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full mt-4"
                      onClick={() => handleViewBids(project._id, project.title)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      See Bids
                    </Button>
                  </CardContent>
                </Card>
              )}
            </>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientProjects;
