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
  Search,
  Calendar,
  IndianRupee,
  Briefcase,
  Layers,
  Clock,
  CheckCircle2,
  XCircle,
  Ban,
  Hourglass,
  FolderOpen,
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
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
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
          setProjects([]);
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
    const filtered = projects.filter(
      (project) => project.status.toLowerCase() === status.toLowerCase()
    );
    if (!searchTerm) return filtered;
    return filtered.filter((p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
        return {
          color: "bg-emerald-500",
          icon: CheckCircle2,
          text: "Open for Bids",
        };
      case "in_progress":
        return { color: "bg-blue-500", icon: Clock, text: "In Progress" };
      case "payment pending":
        return {
          color: "bg-amber-500",
          icon: Hourglass,
          text: "Payment Pending",
        };
      case "cancelled":
        return { color: "bg-red-500", icon: Ban, text: "Cancelled" };
      default:
        return { color: "bg-gray-500", icon: AlertCircle, text: status };
    }
  };

  const renderProjectCard = (project: ProjectType) => {
    const statusConfig = getStatusConfig(project.status);
    const StatusIcon = statusConfig.icon;

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        key={project._id}
      >
        <Card className="glass-card overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-border/50 group">
          <div className="p-6 space-y-4">
            {/* Header */}
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-1">
                <h3 className="text-xl font-bold tracking-tight group-hover:text-primary transition-colors">
                  {project.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline" className="text-[10px] px-1.5 h-5">
                    ID: {project._id.slice(-6)}
                  </Badge>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <Badge
                className={`${statusConfig.color} text-white hover:${statusConfig.color} shadow-sm px-2.5 py-0.5 text-xs font-medium flex items-center gap-1.5`}
              >
                <StatusIcon className="h-3 w-3" />
                {statusConfig.text}
              </Badge>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-2">
              <div className="md:col-span-2 space-y-3">
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {project.skillsRequired.map((req, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="text-xs bg-muted/50 hover:bg-muted"
                    >
                      {req}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-3 border-l pl-6 border-border/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <IndianRupee className="h-3.5 w-3.5" /> Budget
                  </span>
                  <span className="text-sm font-semibold">
                    ₹{project.budget.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <Hourglass className="h-3.5 w-3.5" /> Deadline
                  </span>
                  <span className="text-sm font-medium">
                    {new Date(project.deadline).toLocaleDateString()}
                  </span>
                </div>
                {project.freelancerId && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                      <Briefcase className="h-3.5 w-3.5" /> Freelancer
                    </span>
                    <span className="text-sm font-medium text-primary truncate max-w-[100px]">
                      {project.freelancerId}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            {project.status !== "cancelled" &&
              project.status !== "Payment Pending" &&
              !project.freelancerId && (
              <div className="pt-4 border-t border-border/40 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-muted-foreground hover:text-primary hover:bg-primary/5"
                  onClick={() => handleUpdate(project)}
                >
                  <Pencil className="mr-1.5 h-3.5 w-3.5" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                  onClick={() => handleDelete(project)}
                >
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  Delete
                </Button>
                </div>
              )}
          </div>
        </Card>
      </motion.div>
    );
  };

  const getTabLabel = (value: string, count: number, label: string) => (
    <div className="flex items-center gap-2">
      {label}
      <Badge
        variant="secondary"
        className="ml-1 h-5 min-w-5 rounded-full px-1.5 text-[10px] bg-muted-foreground/10 text-muted-foreground"
      >
        {count}
      </Badge>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 hero-gradient-mesh py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="self-start sm:self-auto text-muted-foreground hover:text-foreground"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-10 rounded-xl bg-white/60 backdrop-blur-sm border-border/60 focus:bg-white transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">My Projects</h1>
            <p className="text-sm text-muted-foreground">
              Manage all your posted projects and track their status
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="open" className="space-y-6">
          <TabsList className="bg-white/40 p-1 rounded-2xl border border-border/40 w-full flex flex-wrap h-auto sm:h-auto gap-1">
            <TabsTrigger
              value="open"
              className="flex-1 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary py-2.5 transition-all"
            >
              {getTabLabel("open", filterProjectsByStatus("open").length, "Open")}
            </TabsTrigger>
            <TabsTrigger
              value="payment-pending"
              className="flex-1 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-amber-600 py-2.5 transition-all"
            >
              {getTabLabel("payment-pending", filterProjectsByStatus("Payment Pending").length, "Pending Payment")}
            </TabsTrigger>
            <TabsTrigger
              value="in_progress"
              className="flex-1 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 py-2.5 transition-all"
            >
              {getTabLabel("in_progress", filterProjectsByStatus("in_progress").length, "In Progress")}
            </TabsTrigger>
            <TabsTrigger
              value="cancelled"
              className="flex-1 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-destructive py-2.5 transition-all"
            >
              {getTabLabel("cancelled", filterProjectsByStatus("cancelled").length, "Cancelled")}
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            {["open", "payment-pending", "in_progress", "cancelled"].map((status) => (
              <TabsContent value={status} key={status} className="mt-0">
                <ScrollArea className="h-[calc(100vh-340px)] rounded-2xl border border-border/40 bg-white/30 backdrop-blur-sm p-4">
                  <div className="space-y-4 min-h-[290px]">
                    {filterProjectsByStatus(status === "payment-pending" ? "Payment Pending" : status).length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full py-20 text-center opacity-60">
                        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                          <FolderOpen className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <p className="font-medium text-lg">No projects found</p>
                        <p className="text-sm text-muted-foreground">
                          There are no projects with this status
                        </p>
                      </div>
                    ) : (
                      filterProjectsByStatus(status === "payment-pending" ? "Payment Pending" : status).map(renderProjectCard)
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            ))}
          </AnimatePresence>
        </Tabs>

        {/* Update Modal */}
        <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
          <DialogContent className="sm:max-w-[500px] rounded-2xl glass-card border-border/50">
            <DialogHeader>
              <DialogTitle>Update Project</DialogTitle>
              <DialogDescription>
                Make changes to your project. Budget cannot be modified.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  name="title"
                  className="rounded-xl"
                  value={formData.title}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  name="description"
                  className="rounded-xl min-h-[100px]"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Deadline</label>
                <Input
                  type="date"
                  name="deadline"
                  className="rounded-xl"
                  value={formData.deadline}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Requirements</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {skills.map((skill, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center gap-1 pl-2 pr-1 py-1"
                    >
                      {skill}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-destructive"
                        onClick={() => removeSkill(skill)}
                      />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    className="flex-1 rounded-xl"
                    placeholder="Add requirement"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addSkill()}
                  />
                  <Button size="icon" onClick={addSkill} className="rounded-xl">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={() => setShowUpdateDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateSubmit}
                className="rounded-xl btn-premium text-white border-0"
                disabled={loading}
              >
                {loading ? "Updating..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Modal */}
        <Dialog
          open={showDeleteDialog}
          onOpenChange={(open) => {
            setShowDeleteDialog(open);
            if (!open) setConfirmDelete(false);
          }}
        >
          <DialogContent className="sm:max-w-md rounded-2xl glass-card border-border/50">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                {confirmDelete ? "Final Confirmation" : "Delete Project"}
              </DialogTitle>
              <DialogDescription className="pt-2">
                {confirmDelete
                  ? "This action CANNOT be undone. Are you absolutely sure? The refund will be processed (1-3 days)."
                  : "Are you sure you want to delete this project? This will remove it permanently."}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="ghost"
                className="rounded-xl"
                onClick={() => {
                  setShowDeleteDialog(false);
                  setConfirmDelete(false);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="rounded-xl shadow-lg shadow-destructive/20"
                onClick={confirmDeleteProject}
              >
                {confirmDelete ? "Yes, Delete Project" : "Continue"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ProjectDetails;

