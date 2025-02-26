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
import { Search } from "lucide-react";

// Mock data
const MOCK_PROJECTS = [
  {
    id: "1",
    title: "Website Redesign",
    freelancer: "John Smith",
    status: "in_progress" as const,
    progress: 75,
    dueDate: "2024-04-15",
    budget: 5000,
    description: "Complete website redesign for client XYZ",
    tasks: [
      { title: "Homepage Design", completed: true },
      { title: "About Page Content", completed: false },
      { title: "Contact Form", completed: true },
    ],
    files: [
      { name: "design-mockup.fig", size: "2.3 MB" },
      { name: "assets.zip", size: "15 MB" },
    ],
    messages: [
      {
        sender: "John Smith",
        message: "Homepage design completed, awaiting feedback",
        time: "2 hours ago",
      },
      {
        sender: "Client",
        message: "Looks great! Can we adjust the color scheme?",
        time: "1 hour ago",
      },
    ],
  },
  {
    id: "2",
    title: "Mobile App Development",
    freelancer: "Sarah Johnson",
    status: "on_hold" as const,
    progress: 30,
    dueDate: "2024-05-20",
    budget: 12000,
    description: "Native mobile app development for iOS and Android",
    tasks: [
      { title: "UI Design", completed: true },
      { title: "Backend Integration", completed: false },
      { title: "Testing", completed: false },
    ],
    files: [
      { name: "wireframes.pdf", size: "5.1 MB" },
      { name: "api-docs.md", size: "256 KB" },
    ],
    messages: [
      {
        sender: "Sarah Johnson",
        message: "Need clarification on API endpoints",
        time: "1 day ago",
      },
      {
        sender: "Client",
        message: "I'll schedule a call with the backend team",
        time: "5 hours ago",
      },
    ],
  },
  {
    id: "3",
    title: "Marketing Campaign",
    freelancer: "Mike Wilson",
    status: "completed" as const,
    progress: 100,
    dueDate: "2024-03-30",
    budget: 3500,
    description: "Social media marketing campaign for product launch",
    tasks: [
      { title: "Content Strategy", completed: true },
      { title: "Asset Creation", completed: true },
      { title: "Campaign Launch", completed: true },
    ],
    files: [
      { name: "campaign-assets.zip", size: "45 MB" },
      { name: "analytics.pdf", size: "1.2 MB" },
    ],
    messages: [
      {
        sender: "Mike Wilson",
        message: "Campaign successfully completed!",
        time: "2 days ago",
      },
      {
        sender: "Client",
        message: "Great work! Looking forward to the next campaign",
        time: "1 day ago",
      },
    ],
  },
];

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedProject, setSelectedProject] = useState<typeof MOCK_PROJECTS[0] | null>(null);

  const filteredProjects = MOCK_PROJECTS.filter((project) => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.freelancer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
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
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="on_hold">On Hold</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onViewDetails={() => setSelectedProject(project)}
            />
          ))}
        </div>

        <ProjectModal
          project={selectedProject}
          isOpen={!!selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      </div>
    </div>
  );
};

export default Index;