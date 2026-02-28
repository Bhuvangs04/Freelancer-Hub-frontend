import { useState, useEffect } from "react";
import { Search, Eye, EyeOff, Check, Briefcase, IndianRupee, CalendarDays, Filter, X as XIcon, SlidersHorizontal } from "lucide-react";
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
    month: "short",
    day: "numeric",
  });

  const handleButtonClick = () => {
    if (bid_id) {
      navigate("/my-bids");
    } else {
      onViewDetails(project);
    }
  };

  return (
    <div className="group relative bg-slate-800/40 backdrop-blur-xl border border-white/[0.06] rounded-2xl hover:border-violet-500/20 transition-all duration-500 overflow-hidden">
      {/* Hover gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative p-6 space-y-4">
        {bid_id && (
          <div className="flex items-center gap-2 bg-amber-500/10 text-amber-400 px-3 py-1.5 rounded-lg text-xs font-medium border border-amber-500/10">
            <Check className="h-3.5 w-3.5" />
            You already bid on this project
          </div>
        )}

        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-white tracking-tight group-hover:text-violet-200 transition-colors">
            {project.projectId.title}
          </h3>
          <p className="text-sm text-slate-400 max-h-16 overflow-y-auto leading-relaxed line-clamp-2">
            {project.projectId.description}
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5 pt-1">
          {project.projectId.skillsRequired.slice(0, 3).map((skill) => (
            <span
              key={skill}
              className="px-2.5 py-1 rounded-lg bg-violet-500/10 text-violet-300 text-xs font-medium border border-violet-500/10"
            >
              {skill}
            </span>
          ))}
          {project.projectId.skillsRequired.length > 3 && (
            <span className="px-2.5 py-1 rounded-lg bg-slate-700/50 text-slate-400 text-xs font-medium border border-white/[0.04]">
              +{project.projectId.skillsRequired.length - 3} more
            </span>
          )}
        </div>

        <div className="flex items-center justify-between text-sm pt-2 border-t border-white/[0.04]">
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <IndianRupee className="h-3.5 w-3.5" />
            {project.projectId.budget.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 text-slate-400 text-xs">
            <CalendarDays className="h-3.5 w-3.5" />
            {formattedDeadline}
          </div>
        </div>

        <Button
          className={`w-full rounded-xl h-10 text-sm font-medium transition-all duration-300 ${bid_id
              ? "bg-white/[0.06] text-slate-300 border border-white/[0.08] hover:bg-white/[0.1] hover:text-white"
              : "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30"
            }`}
          onClick={handleButtonClick}
          variant={bid_id ? "outline" : "default"}
        >
          {bid_id ? "See My Bid" : "View Details & Bid"}
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
    <div className="bg-slate-800/40 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5 space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-violet-400" />
          Skills
        </h3>
        <div className="space-y-2">
          {visibleSkills.map((skill) => (
            <label
              key={skill}
              htmlFor={`skill-${skill}`}
              className="flex items-center gap-3 cursor-pointer group/skill py-1"
            >
              <div className="relative">
                <input
                  type="checkbox"
                  id={`skill-${skill}`}
                  checked={selectedSkills.includes(skill)}
                  onChange={() => handleSkillToggle(skill)}
                  className="sr-only peer"
                />
                <div className="h-4 w-4 rounded border border-white/[0.15] bg-white/[0.04] peer-checked:bg-violet-600 peer-checked:border-violet-500 transition-all flex items-center justify-center">
                  {selectedSkills.includes(skill) && (
                    <Check className="h-3 w-3 text-white" />
                  )}
                </div>
              </div>
              <span className="text-sm text-slate-300 group-hover/skill:text-white transition-colors">
                {skill}
              </span>
            </label>
          ))}
          {availableSkills.length > 6 && (
            <button
              onClick={() => setShowAllSkills(!showAllSkills)}
              className="mt-2 text-violet-400 hover:text-violet-300 text-xs font-medium transition-colors"
            >
              {showAllSkills ? "Show Less" : `Show All (${availableSkills.length})`}
            </button>
          )}
        </div>
      </div>

      <div className="border-t border-white/[0.04] pt-5">
        <h3 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
          <IndianRupee className="h-3.5 w-3.5 text-emerald-400" />
          Budget
        </h3>
        <p className="text-xs text-slate-400 mb-4">Up to ₹{budget.toLocaleString()}</p>
        <input
          type="range"
          min="1000"
          max="50000"
          step="500"
          value={budget}
          onChange={(e) => setBudget(parseInt(e.target.value))}
          className="w-full h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer accent-violet-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-violet-500 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-violet-500/30"
        />
        <div className="flex justify-between text-[10px] text-slate-500 mt-2">
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

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showProjectDetails, setShowProjectDetails] = useState(false);

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
          const allSkills = data.openProjects.flatMap(
            (project: Project) => project.projectId.skillsRequired || []
          );
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
    setBidAmount(project.amount || project.projectId.budget);
  };

  const handleMakeBid = () => {
    setShowBidForm(true);
  };

  const handleSubmitBid = async () => {
    if (!selectedProject) return;
    try {
      setSubmittingBid(true);
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
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="relative pt-24 pb-6">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-600/10 via-transparent to-transparent" />
            <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                  Browse Projects
                </h1>
                <p className="text-slate-400 mt-2 text-sm">
                  {loading
                    ? "Loading available projects..."
                    : `${filteredProjects.length} project${filteredProjects.length !== 1 ? "s" : ""} available`}
                </p>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/60 border border-white/[0.06] text-slate-300 hover:text-white text-sm font-medium transition-all"
              >
                <SlidersHorizontal className="h-4 w-4" />
                {showFilters ? "Hide Filters" : "Show Filters"}
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="grid grid-cols-1 lg:grid-cols-[280px,1fr] gap-6 pb-20">
            {/* Sidebar */}
            <div
              className={`${
                showFilters ? "block" : "hidden lg:block"
              }`}
            >
              <div className="sticky top-24 space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-slate-800/60 border-white/[0.06] text-white placeholder:text-slate-500 focus:ring-violet-500 focus:border-violet-500/30 rounded-xl h-11"
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

            {/* Projects Grid */}
            <div className="space-y-5">
              {/* Active Filters */}
              {selectedSkills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedSkills.map((skill) => (
                    <button
                      key={skill}
                      onClick={() =>
                        setSelectedSkills(
                          selectedSkills.filter((s) => s !== skill)
                        )
                      }
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-500/15 text-violet-300 text-xs font-medium border border-violet-500/15 hover:bg-violet-500/25 transition-colors"
                    >
                      {skill}
                      <XIcon className="h-3 w-3" />
                    </button>
                  ))}
                  <button
                    onClick={() => setSelectedSkills([])}
                    className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white text-xs font-medium transition-colors"
                  >
                    Clear all
                  </button>
                </div>
              )}

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-72 rounded-2xl bg-slate-800/30 border border-white/[0.04] animate-pulse"
                    />
                  ))}
                </div>
              ) : filteredProjects.length === 0 ? (
                <div className="bg-slate-800/40 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-14 text-center">
                  <div className="h-14 w-14 mx-auto rounded-2xl bg-slate-700/50 flex items-center justify-center mb-4">
                    <Briefcase className="h-6 w-6 text-slate-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">No projects found</h3>
                  <p className="text-slate-400 text-sm max-w-sm mx-auto">
                    No projects match your current filters. Try adjusting your search or filters.
                  </p>
                </div>
              ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {filteredProjects.map((project) => {
                    const bid_id =
                      bids.find((bid) => bid === project.projectId._id) || null;
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
            </div>
          </div>
        </div>

        {/* Project Details Dialog */}
        <Dialog open={showProjectDetails} onOpenChange={setShowProjectDetails}>
          <DialogContent className="sm:max-w-md md:max-w-xl bg-slate-900 border-white/[0.08] text-white rounded-2xl shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-white">
                {selectedProject?.projectId.title}
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Project details and requirements
              </DialogDescription>
            </DialogHeader>

            {selectedProject && (
              <div className="space-y-5">
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Description</h4>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {selectedProject.projectId.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-800/60 rounded-xl p-4 border border-white/[0.04]">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Budget</h4>
                    <p className="text-xl font-bold text-emerald-400">
                      ₹{selectedProject.projectId.budget.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-slate-800/60 rounded-xl p-4 border border-white/[0.04]">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Deadline</h4>
                    <p className="text-sm font-medium text-white">
                      {new Date(selectedProject.projectId.deadline).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Required Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.projectId.skillsRequired.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1.5 rounded-lg bg-violet-500/10 text-violet-300 text-xs font-medium border border-violet-500/10"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="flex items-center justify-between sm:justify-end gap-3 pt-2">
              <DialogClose asChild>
                <Button
                  variant="outline"
                  className="bg-transparent border-white/[0.08] text-slate-300 hover:text-white hover:bg-white/[0.06] rounded-xl"
                >
                  Close
                </Button>
              </DialogClose>
              <Button
                onClick={handleMakeBid}
                className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl shadow-lg shadow-violet-500/20"
              >
                Make Bid
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Bid Form Dialog */}
        <Dialog open={showBidForm} onOpenChange={setShowBidForm}>
          <DialogContent className="sm:max-w-md bg-slate-900 border-white/[0.08] text-white rounded-2xl shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-white">Make a Bid</DialogTitle>
              <DialogDescription className="text-slate-400">
                Submit your proposal for this project
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <label
                  htmlFor="bid-amount"
                  className="text-sm font-medium text-slate-300 block"
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
                  className="bg-slate-800/60 border-white/[0.08] text-white placeholder:text-slate-500 focus:ring-violet-500 focus:border-violet-500 rounded-xl h-11"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="bid-message"
                  className="text-sm font-medium text-slate-300 block"
                >
                  Message to Client
                </label>
                <Textarea
                  id="bid-message"
                  value={bidMessage}
                  onChange={(e) => setBidMessage(e.target.value)}
                  placeholder="Explain why you're a good fit for this project"
                  rows={4}
                  className="bg-slate-800/60 border-white/[0.08] text-white placeholder:text-slate-500 focus:ring-violet-500 focus:border-violet-500 rounded-xl resize-none"
                />
              </div>

              <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-800/40 border border-white/[0.04]">
                <Switch
                  id="resume-permission"
                  checked={resumePermission}
                  onCheckedChange={setResumePermission}
                />
                <label
                  htmlFor="resume-permission"
                  className="text-sm font-medium cursor-pointer flex items-center gap-2 text-slate-300"
                >
                  {resumePermission ? (
                    <>
                      <Eye className="h-4 w-4 text-emerald-400" />
                      Client can view my resume
                    </>
                  ) : (
                    <>
                        <EyeOff className="h-4 w-4 text-slate-400" />
                        Resume is private
                    </>
                  )}
                </label>
              </div>
            </div>

            <DialogFooter className="gap-3">
              <Button
                variant="outline"
                onClick={() => setShowBidForm(false)}
                className="bg-transparent border-white/[0.08] text-slate-300 hover:text-white hover:bg-white/[0.06] rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitBid}
                disabled={submittingBid || !bidMessage.trim() || bidAmount <= 0}
                className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl shadow-lg shadow-violet-500/20 disabled:opacity-50"
              >
                {submittingBid ? (
                  "Submitting..."
                ) : (
                  <>
                      <Check className="mr-1.5 h-4 w-4" />
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
