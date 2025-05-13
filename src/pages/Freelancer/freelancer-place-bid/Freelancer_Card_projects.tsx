import { useState, useEffect } from "react";
import { Search, Eye, EyeOff, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import NavBar from "@/components/HomeNavBar.Freelancer";

const fetchOpenProjects = async () => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/freelancer/open/projects`,{
        credentials: "include",
      }
    );
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch open projects:", error);
    throw error;
  }
};

type Project = {
  _id: string;
  projectId: {
    _id: string;
    title: string;
    description: string;
    budget: number;
    status: string;
    deadline: string;
    skillsRequired: string[];
    clientId: string;
  };
  clientId: string;
  freelancerId: string | null;
  amount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
};
// Removed the bids type as it's no longer needed


type BidFormData = {
  amount: number;
  message: string;
  resumePermission: boolean;
};

const ProjectCard = ({
  bid_id,
  project,
  onViewDetails,
}: {
  project: Project;
  bid_id: string | null;
  onViewDetails: (project: Project) => void;
}) => {
  const navigate = useNavigate();
  const deadline = new Date(project.projectId.deadline);
  const formattedDeadline = deadline.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handleButtonClick = () => {
    if (bid_id) {
      // If the freelancer has already bid, navigate to the my bids page
      navigate("/my-bids");
    } else {
      // Otherwise, show the project details
      onViewDetails(project);
    }
  };

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="p-6 space-y-4">
        {bid_id && (
          <div className="bg-amber-50 text-amber-800 px-3 py-1 rounded-md text-sm font-medium mb-2">
            You already bid for this project
          </div>
        )}
        <div className="space-y-2">
          <h3 className="text-xl font-semibold tracking-tight">
            {project.projectId.title}
          </h3>
          <p className="text-sm text-muted-foreground max-h-24 overflow-y-auto">
            {project.projectId.description}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {project.projectId.skillsRequired.slice(0, 4).map((skill) => (
            <Badge key={skill} variant="secondary" className="text-xs">
              {skill}
            </Badge>
          ))}
          {project.projectId.skillsRequired.length > 4 && (
            <Badge variant="outline" className="text-xs">
              +{project.projectId.skillsRequired.length - 4} more
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="font-medium">
            ₹{project.projectId.budget.toLocaleString()}
          </div>
          <div className="text-muted-foreground">
            Deadline: {formattedDeadline}
          </div>
        </div>

        <Button
          className="w-full mt-4"
          onClick={handleButtonClick}
          variant={bid_id ? "outline" : "default"}
        >
          {bid_id ? "See My Bid" : "View Details"}
        </Button>
      </div>
    </div>
  );
};

const FilterSection = ({
  selectedSkills,
  setSelectedSkills,
  budget,
  setBudget,
  availableSkills,
}: {
  selectedSkills: string[];
  setSelectedSkills: (skills: string[]) => void;
  budget: number;
  setBudget: (budget: number) => void;
  availableSkills: string[];
}) => {
  const handleSkillToggle = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };
  const [showAllSkills, setShowAllSkills] = useState(false);

  const visibleSkills = showAllSkills
    ? availableSkills
    : availableSkills.slice(0, 6);

  return (
    <div className="space-y-6 bg-card p-6 rounded-lg border">
      <div>
        <h3 className="font-medium mb-3">Skills</h3>
        <div className="space-y-2">
          {visibleSkills.map((skill) => (
            <div key={skill} className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`skill-${skill}`}
                checked={selectedSkills.includes(skill)}
                onChange={() => handleSkillToggle(skill)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <label htmlFor={`skill-${skill}`} className="text-sm">
                {skill}
              </label>
            </div>
          ))}
          {availableSkills.length > 6 && (
            <button
              onClick={() => setShowAllSkills(!showAllSkills)}
              className="mt-2 text-blue-500 hover:underline text-sm"
            >
              {showAllSkills ? "See Less" : "See More"}
            </button>
          )}
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-3">
          Budget (up to ₹{budget.toLocaleString()})
        </h3>
        <input
          type="range"
          min="1000"
          max="50000"
          step="500"
          value={budget}
          onChange={(e) => setBudget(parseInt(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>₹1,000</span>
          <span>₹50,000</span>
        </div>
      </div>
    </div>
  );
};

const Freelancer_Card_projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [budget, setBudget] = useState<number>(50000);
  const [showFilters, setShowFilters] = useState(true);
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);

  // Project details modal state
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showProjectDetails, setShowProjectDetails] = useState(false);

  // Bid form state
  const [showBidForm, setShowBidForm] = useState(false);
  const [bids, setBids] = useState<string[]>([]);
  const [bidAmount, setBidAmount] = useState<number>(0);
  const [bidMessage, setBidMessage] = useState("");
  const [resumePermission, setResumePermission] = useState(false);
  const [submittingBid, setSubmittingBid] = useState(false);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        const data = await fetchOpenProjects();
        if (data && data.openProjects) {
          setProjects(data.openProjects);

          if (data.bids) {
            const bidProjectIds = data.bids.map(
              (bid: { projectId: string }) => bid.projectId
            );
            setBids(bidProjectIds);
          }

          // Extract unique skills from all projects
          const allSkills = data.openProjects.flatMap(
            (project: Project) => project.projectId.skillsRequired || []
          );
          // Use type assertion to ensure it's a string array
          const uniqueSkills = Array.from(new Set(allSkills)) as string[];
          setAvailableSkills(uniqueSkills);
        }
      } catch (error) {
        toast.error("Failed to load projects. Please try again later.");
        console.error("Error loading projects:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.projectId.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      project.projectId.description
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesSkills =
      selectedSkills.length === 0 ||
      selectedSkills.some((skill) =>
        project.projectId.skillsRequired.includes(skill)
      );

    const matchesBudget = project.projectId.budget <= budget;

    return matchesSearch && matchesSkills && matchesBudget;
  });

  const handleViewDetails = (project: Project) => {
    setSelectedProject(project);
    setShowProjectDetails(true);

    // Initialize bid amount with project budget as default
    setBidAmount(project.amount || project.projectId.budget);
  };

  const handleMakeBid = () => {
    setShowBidForm(true);
  };

  const handleSubmitBid = async () => {
    if (!selectedProject) return;

    try {
      setSubmittingBid(true);

      // Prepare bid data
      const bidData: BidFormData = {
        amount: bidAmount,
        message: bidMessage,
        resumePermission: resumePermission,
      };

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/freelancer/projects/${
          selectedProject.projectId._id
        }/bid`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bidData),
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`Error submitting bid: ${response.status}`);
      }

      // Reset form and close modals
      setShowBidForm(false);
      setShowProjectDetails(false);
      setSelectedProject(null);

      toast.success("Bid submitted successfully!");
    } catch (error) {
      console.error("Error submitting bid:", error);
      toast.error("Failed to submit bid. Please try again.");
    } finally {
      setSubmittingBid(false);
    }
  };

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-background p-6 animate-in">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="mt-12 text-4xl font-semibold tracking-tight">
              Projects
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[300px,1fr] gap-8">
            <div
              className={`filter-section ${
                showFilters ? "block" : "hidden lg:block"
              }`}
            >
              <div className="sticky top-6 space-y-6">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <FilterSection
                  selectedSkills={selectedSkills}
                  setSelectedSkills={setSelectedSkills}
                  budget={budget}
                  setBudget={setBudget}
                  availableSkills={availableSkills}
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground">
                  {loading
                    ? "Loading projects..."
                    : `Showing ${filteredProjects.length} projects`}
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedSkills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() =>
                        setSelectedSkills(
                          selectedSkills.filter((s) => s !== skill)
                        )
                      }
                    >
                      {skill} ×
                    </Badge>
                  ))}
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-64 rounded-lg bg-muted animate-pulse"
                    ></div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredProjects.map((project) => {
                    const bid_id =
                      bids.find((bid) => bid === project.projectId._id) || null; // Find bid ID if it exists
                    return (
                      <ProjectCard
                        bid_id={bid_id}
                        key={project._id}
                        project={project}
                        onViewDetails={handleViewDetails}
                      />
                    );
                  })}
                </div>
              )}

              {!loading && filteredProjects.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    No projects found matching your criteria
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Project Details Dialog */}
        <Dialog open={showProjectDetails} onOpenChange={setShowProjectDetails}>
          <DialogContent className="sm:max-w-md md:max-w-xl">
            <DialogHeader>
              <DialogTitle>{selectedProject?.projectId.title}</DialogTitle>
              <DialogDescription>
                Project details and requirements
              </DialogDescription>
            </DialogHeader>

            {selectedProject && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-1 ">Description</h4>
                  <p className="text-sm line-clamp-4">
                    {selectedProject.projectId.description}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-1">Client ID</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedProject.clientId}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-1">Budget</h4>
                  <p className="text-lg font-semibold">
                    ₹{selectedProject.projectId.budget.toLocaleString()}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-1">Required Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.projectId.skillsRequired.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-1">Deadline</h4>
                  <p className="text-sm">
                    {new Date(
                      selectedProject.projectId.deadline
                    ).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            )}

            <DialogFooter className="flex items-center justify-between sm:justify-end">
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
              <Button onClick={handleMakeBid}>Make Bid</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Bid Form Dialog */}
        <Dialog open={showBidForm} onOpenChange={setShowBidForm}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Make a Bid</DialogTitle>
              <DialogDescription>
                Submit your proposal for this project
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div>
                <label
                  htmlFor="bid-amount"
                  className="text-sm font-medium mb-1 block"
                >
                  Bid Amount (₹)
                </label>
                <Input
                  id="bid-amount"
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(Number(e.target.value))}
                  placeholder="Enter your bid amount"
                  min={1000}
                />
              </div>

              <div>
                <label
                  htmlFor="bid-message"
                  className="text-sm font-medium mb-1 block"
                >
                  Message to Client
                </label>
                <Textarea
                  id="bid-message"
                  value={bidMessage}
                  onChange={(e) => setBidMessage(e.target.value)}
                  placeholder="Explain why you're a good fit for this project"
                  rows={4}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="resume-permission"
                  checked={resumePermission}
                  onCheckedChange={setResumePermission}
                />
                <label
                  htmlFor="resume-permission"
                  className="text-sm font-medium cursor-pointer flex items-center gap-2"
                >
                  {resumePermission ? (
                    <>
                      <Eye className="h-4 w-4" />
                      Allow client to view my resume
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-4 w-4" />
                      Keep my resume private
                    </>
                  )}
                </label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowBidForm(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmitBid}
                disabled={submittingBid || !bidMessage.trim() || bidAmount <= 0}
              >
                {submittingBid ? (
                  "Submitting..."
                ) : (
                  <>
                    <Check className="mr-1 h-4 w-4" />
                    Submit Bid
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};


export default Freelancer_Card_projects;

