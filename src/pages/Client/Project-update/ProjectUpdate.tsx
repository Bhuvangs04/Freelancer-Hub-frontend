import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Pencil,
  Trash2,
  AlertCircle,
  X,
  Plus,
  ArrowLeftIcon,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { c } from "node_modules/framer-motion/dist/types.d-6pKw1mTI";

interface ProjectType {
  _id: string;
  title: string;
  description: string;
  budget: number;
  status: string;
  deadline: string;
  skillsRequired: string[];
  createdAt: string;
  freelancerId: string;
}

const ProjectDetails = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [projects, setProjects] = useState<ProjectType[]>([]); // ✅ Ensures it starts as an array
  const [selectedProject, setSelectedProject] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false); // ✅ Fixed missing state
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    deadline: "",
  });

  // Fetch projects from backend
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/client/clients/projects`,
          {
            withCredentials: true,
          }
        );
        if (response.data && Array.isArray(response.data.projects)) {
          setProjects(response.data.projects);
        } else {
          setProjects([]); // ✅ Avoid `undefined` errors
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };
    fetchProjects();
  }, []);

  // Handle delete button click
  const handleDelete = (project) => {
    setSelectedProject(project);
    setShowDeleteDialog(true);
  };

  // Confirm project deletion
  const confirmDeleteProject = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    setLoading(true);
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/payments/delete-project/${
          selectedProject._id
        }`,
        {
          withCredentials: true,
        }
      );
      setProjects((prev) => prev.filter((p) => p._id !== selectedProject._id));
      toast({
        title: "Project Deleted",
        description:
          "The project has been successfully deleted. Refund will be processed.",
        variant: "destructive",
      });
    } catch (error) {
      console.error("Error deleting project:", error);
      toast({
        title: "Error",
        description: "Failed to delete project. Try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setShowDeleteDialog(false);
      setConfirmDelete(false);
      setSelectedProject(null);
    }
  };

  const handleUpdateSubmit = async () => {
    setLoading(true);
    try {
      const updatedData = {
        ...formData,
        skillsRequired: skills,
      };

      await axios.put(
        `${import.meta.env.VITE_API_URL}/client/projects/${
          selectedProject._id
        }`,
        updatedData,
        {
          withCredentials: true,
        }
      );

      // Update local state
      setProjects((prev) =>
        prev.map((p) =>
          p._id === selectedProject._id ? { ...p, ...updatedData } : p
        )
      );

      toast({
        title: "Success",
        description: "Project updated successfully",
      });

      setShowUpdateDialog(false);
      setSelectedProject(null);
    } catch (error) {
      console.error("Error updating project:", error);
      toast({
        title: "Error",
        description: "Failed to update project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  const handleUpdate = (project) => {
    setSelectedProject(project);
    setFormData({
      title: project.title,
      description: project.description,
      deadline: project.deadline,
    });
    setSkills(project.requirements || []);
    setShowUpdateDialog(true);
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills((prev) => [...prev, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove) => {
    setSkills((prev) => prev.filter((skill) => skill !== skillToRemove));
  };

  const filterProjectsByStatus = (status: string) => {
    return projects.filter(
      (project) => project.status.toLowerCase() === status.toLowerCase()
    );
  };

  const renderProjectCard = (project: ProjectType) => (
    <Card
      key={project._id}
      className="p-6 space-y-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
    >
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
          <p className="text-gray-500 mt-1">Project ID: {project._id}</p>
        </div>
        <div className="space-x-2">
          {project.status !== "cancelled" &&
            project.status !== "Payment Pending" &&
            !project.freelancerId && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 mb-3 hover:bg-gray-100"
                  onClick={() => handleUpdate(project)}
                >
                  <Pencil className="h-4 w-4" />
                  Update Project
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() => handleDelete(project)}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Project
                </Button>
              </>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Description</h3>
            <p className="mt-1 text-gray-900">{project.description}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Budget</h3>
            <p className="mt-1 text-gray-900">
              ₹{project.budget.toLocaleString()}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Deadline</h3>
            <p className="mt-1 text-gray-900">
              {new Date(project.deadline).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Status</h3>
            <Badge
              className={`mt-1 ${
                project.status.toLowerCase() === "open" ||
                project.status.toLowerCase() === "in_progress"
                  ? "bg-green-500 hover:bg-green-600"
                  : project.status.toLowerCase() === "payment pending"
                  ? "bg-yellow-500 hover:bg-yellow-600"
                  : "bg-red-500 hover:bg-red-600"
              } text-white transition-colors`}
            >
              {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
            </Badge>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Freelancer</h3>
            <p className="mt-1 text-gray-900">
              {project.freelancerId || "Not assigned yet"}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Created</h3>
            <p className="mt-1 text-gray-900">
              {new Date(project.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-500">Requirements</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {project.skillsRequired.map((req, index) => (
            <Badge key={index} variant="secondary" className="text-sm">
              {req}
            </Badge>
          ))}
        </div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <Button
        variant="ghost"
        className="ml-3 mt-5 flex items-center gap-2 hover:bg-green-400"
        onClick={() => navigate(-1)}
      >
        <ArrowLeftIcon width={24} />
        Back
      </Button>
      <div className="container mx-auto px-4 max-w-6xl">
        <Tabs defaultValue="open" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="open" className="text-sm font-medium">
              Open Projects ({filterProjectsByStatus("open").length})
            </TabsTrigger>
            <TabsTrigger
              value="payment-pending"
              className="text-sm font-medium"
            >
              Payment Pending (
              {filterProjectsByStatus("Payment Pending").length})
            </TabsTrigger>
            <TabsTrigger value="cancelled" className="text-sm font-medium">
              Cancelled ({filterProjectsByStatus("cancelled").length})
            </TabsTrigger>
            <TabsTrigger value="in_progress" className="text-sm font-medium">
              On Going ({filterProjectsByStatus("in_progress").length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="open">
            <ScrollArea className="h-[800px] rounded-md border p-4">
              <div className="space-y-4">
                {filterProjectsByStatus("open").length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    No open projects found.
                  </p>
                ) : (
                  filterProjectsByStatus("open").map(renderProjectCard)
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="payment-pending">
            <ScrollArea className="h-[800px] rounded-md border p-4">
              <div className="space-y-4">
                {filterProjectsByStatus("Payment Pending").length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    No payment pending projects found.
                  </p>
                ) : (
                  filterProjectsByStatus("Payment Pending").map(
                    renderProjectCard
                  )
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="cancelled">
            <ScrollArea className="h-[800px] rounded-md border p-4">
              <div className="space-y-4">
                {filterProjectsByStatus("cancelled").length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    No cancelled projects found.
                  </p>
                ) : (
                  filterProjectsByStatus("cancelled").map(renderProjectCard)
                )}
              </div>
            </ScrollArea>
          </TabsContent>
          <TabsContent value="in_progress">
            <ScrollArea className="h-[800px] rounded-md border p-4">
              <div className="space-y-4">
                {filterProjectsByStatus("in_progress").length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    No on going projects found.
                  </p>
                ) : (
                  filterProjectsByStatus("in_progress").map(renderProjectCard)
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {/* Update Project Dialog */}
        <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Project</DialogTitle>
              <DialogDescription>
                Make changes to your project details here. Budget cannot be
                modified.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  className="mt-1 w-full rounded-md border p-2"
                  value={formData.title}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Description
                </label>
                <textarea
                  name="description"
                  className="mt-1 w-full rounded-md border p-2"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Deadline
                </label>
                <input
                  type="date"
                  name="deadline"
                  className="mt-1 w-full rounded-md border p-2"
                  value={formData.deadline}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Requirements
                </h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {skills.map((skill, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center gap-2"
                    >
                      {skill}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeSkill(skill)}
                      />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    className="flex-1 rounded-md border p-2"
                    placeholder="Add requirement"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addSkill()}
                  />
                  <Button size="sm" onClick={addSkill}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowUpdateDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleUpdateSubmit} disabled={loading}>
                {loading ? "Updating..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={showDeleteDialog}
          onOpenChange={(open) => {
            setShowDeleteDialog(open);
            if (!open) setConfirmDelete(false);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                {confirmDelete ? "Final Confirmation" : "Delete Project"}
              </DialogTitle>
              <DialogDescription>
                {confirmDelete
                  ? "This action cannot be undone. Are you absolutely sure? The refund will be processed if the project has been funded, and it may take 1 to 3 days to reflect in your bank account."
                  : "Are you sure you want to delete this project?"}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteDialog(false);
                  setConfirmDelete(false);
                }}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDeleteProject}>
                {confirmDelete ? "Yes, Delete Project" : "Continue to Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ProjectDetails;
