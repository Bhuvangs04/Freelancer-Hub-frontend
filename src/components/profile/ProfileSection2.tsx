import { useState, useEffect } from "react";
import {
  User,
  Upload,
  Edit2,
  FileText,
  Camera,
  Github,
  ExternalLink,
  Plus,
  Mail,
  Briefcase,
  ChartBar,
} from "lucide-react";
import PortfolioAnalyticsModal from "@/components/modals/PortfolioAnalysis";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const Profile = () => {
  // Profile section state
  const email = localStorage.getItem("email");
  const userId = localStorage.getItem("Chatting_id");
  const [editMode, setEditMode] = useState(false);
  const [username, setUsername] = useState("Null");
  const [bio, setBio] = useState(
    "Full-stack developer with 5+ years of experience in React, Node.js, and TypeScript. I specialize in creating responsive, user-friendly web applications that solve real-world problems. I'm passionate about clean code, accessibility, and delivering exceptional user experiences."
  );
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [resume, setResume] = useState<string | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeEditMode, setResumeEditMode] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);

  const handleCopyPortfolioLink = async () => {
    if (username) {
      try {
        await navigator.clipboard.writeText(
          `https://freelancerhub-five.vercel.app/freelancer/portfolio/${username}/view`
        );
        alert("Link copied");
      } catch (error) {
        console.error("Failed to copy link:", error);
        alert("Failed to copy Link");
      }
    } else {
      alert("No Link found");
    }
  };

  // Projects section state
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

  // Skills section state
  const [skills, setSkills] = useState<{ name: string; proficiency: string }[]>(
    []
  );
  const [newSkill, setNewSkill] = useState({ name: "", proficiency: "" });
  const [isAddingSkill, setIsAddingSkill] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    // Fetch profile data
    const fetchProfile = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/freelancer/details`,
          { credentials: "include" }
        );
        const data = await response.json();
        setUsername(data.freelancer.username);
        setBio(data.freelancer.bio);
        setProfileImage(data.freelancer.profilePictureUrl);
        setResume(data.freelancer.resumeUrl);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();
  }, []);

  // Fetch projects data
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

  // Fetch skills data
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/freelancer/skills`,
          {
            credentials: "include",
          }
        );
        const data = await response.json();
        setSkills(Array.isArray(data.skills) ? data.skills : []);
      } catch (error) {
        console.error("Error fetching skills:", error);
      }
    };

    fetchSkills();
  }, []);

  const handleProfileUpdate = async () => {
    try {
      await fetch(
        `${import.meta.env.VITE_API_URL}/freelancer/upload-portfolio`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, bio }),
          credentials: "include",
        }
      );

      setEditMode(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleResumeUpload = async () => {
    if (!resumeFile) return;

    const formData = new FormData();
    formData.append("file", resumeFile);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/freelancer/upload-portfolio/resume`,
        {
          method: "POST",
          body: formData,
          credentials: "include",
        }
      );

      const data = await response.json();
      setResume(data.url);
      setResumeFile(null);
      setResumeEditMode(false);

      toast({
        title: "Resume Uploaded",
        description: "Your resume has been successfully uploaded.",
      });
    } catch (error) {
      console.error("Error uploading resume:", error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload resume. Please try again.",
        variant: "destructive",
      });
    }
  };

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

  const handleAddSkill = async () => {
    if (!newSkill.name || !newSkill.proficiency) {
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
            skills: Array.isArray(newSkill) ? newSkill : [newSkill],
          }),
          credentials: "include",
        }
      );

      await response.json();
      if (response.ok) {
        setSkills([...skills, newSkill]);
        setNewSkill({ name: "", proficiency: "" });
        setIsAddingSkill(false);
        toast({
          title: "Success",
          description: "Skill added successfully",
        });
      }
    } catch (error) {
      console.error("Error adding skill:", error);
      toast({
        title: "Error",
        description: "Failed to add skill",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 pb-12">
      {/* Header with gradient background */}
      <div className="relative h-[30vh] hero-gradient overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent"></div>

        {/* Decorative blobs */}
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl"></div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 relative -mt-20">
        <div className="flex flex-col gap-8">
          {/* Profile section with card */}
          <div className="glass-card rounded-2xl overflow-hidden shadow-2xl animate-fadeIn">
            <div className="p-6 sm:p-8">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Left Column - Profile Image and Resume */}
                <div className="flex flex-col items-center lg:items-start space-y-6 lg:w-1/4">
                  {/* Profile Image */}
                  <div className="relative group w-36 h-36 mx-auto lg:mx-0">
                    <div className="absolute inset-0 rounded-full blob-animation bg-gradient-to-r from-purple-600/20 to-indigo-600/20 -z-10 blur-lg animate-pulse-subtle"></div>
                    <div className="relative w-36 h-36 rounded-full overflow-hidden border-4 border-white shadow-xl">
                      {profileImage ? (
                        <img
                          src={profileImage}
                          alt={username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
                          <User className="w-16 h-16 text-indigo-300" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center cursor-pointer">
                        <Camera className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Contact info */}
                  <div className="w-full flex flex-col gap-2 items-center lg:items-start">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Mail className="w-4 h-4" />
                      <span>{email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Briefcase className="w-4 h-4" />
                      <span>Full-stack Developer</span>
                    </div>
                  </div>

                  {/* Resume Section */}
                  <div className="w-full p-4 rounded-xl gradient-border bg-background/50">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4" /> Resume
                    </h3>
                    {!resumeEditMode ? (
                      <div className="space-y-3">
                        {resume && (
                          <Button
                            variant="secondary"
                            onClick={() => window.open(resume, "_blank")}
                            className="w-full"
                          >
                            <FileText className="w-4 h-4 mr-2" /> View Resume
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          onClick={() => setResumeEditMode(true)}
                          className="w-full"
                        >
                          <Edit2 className="w-4 h-4 mr-2" />{" "}
                          {resume ? "Update" : "Add"} Resume
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Input
                          type="file"
                          accept=".pdf"
                          onChange={(e) =>
                            setResumeFile(e.target.files?.[0] || null)
                          }
                          className="bg-white/50"
                        />
                        <p className="text-xs text-muted-foreground">
                          PDF files only, max 10MB
                        </p>
                        <div className="flex gap-2">
                          <Button
                            onClick={handleResumeUpload}
                            disabled={!resumeFile}
                            className="flex-1"
                          >
                            <Upload className="w-4 h-4 mr-2" /> Upload
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setResumeEditMode(false)}
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column - Profile Info */}
                <div className="flex-1">
                  {editMode ? (
                    <div className="space-y-6">
                      <Input
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="text-2xl font-bold bg-background/50"
                        placeholder="Your Name"
                      />
                      <Textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="min-h-[200px] bg-background/50"
                        placeholder="Tell us about yourself..."
                      />
                      <div className="flex gap-4">
                        <Button
                          onClick={handleProfileUpdate}
                          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                        >
                          Save Changes
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setEditMode(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gradient">
                          {username || "Your Name"}
                        </h1>
                        <p className="text-lg text-muted-foreground">
                          Full-stack Developer
                        </p>
                      </div>
                      <div className="prose prose-lg max-w-none text-foreground">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm, remarkBreaks]}
                        >
                          {bio || "_Start writing about yourself..._"}
                        </ReactMarkdown>
                      </div>
                      <Button
                        onClick={() => setEditMode(true)}
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                      >
                        <Edit2 className="w-4 h-4 mr-2" /> Edit Profile
                      </Button>
                      <Button
                        className="ml-2"
                        onClick={handleCopyPortfolioLink}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" /> Copy Portfolio
                        Website Link
                      </Button>
                      <div className="flex items-center gap-2 mt-4">
                        <Button
                          className=""
                          onClick={() => setAnalyticsOpen(true)}
                        >
                          <ChartBar className="w-4 h-4" />
                          View Analytics (Portfolio)
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs for Projects and Skills */}
          <Tabs defaultValue="projects" className="w-full animate-fadeIn">
            <TabsList className="w-full max-w-md mx-auto grid grid-cols-2 mb-6">
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="skills">Skills</TabsTrigger>
            </TabsList>

            {/* Projects Tab */}
            <TabsContent value="projects" className="mt-2">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-3 text-gradient">
                  My Projects
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Discover my latest work and the technologies I use to bring
                  ideas to life
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <Card
                    key={project._id}
                    className="hover-card-animation gradient-border"
                  >
                    <CardHeader>
                      <CardTitle>{project.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {project.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {project.frameworks.map((tech) => (
                          <Badge
                            key={tech}
                            variant="secondary"
                            className="bg-secondary/50"
                          >
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        variant="outline"
                        onClick={() => window.open(project.link, "_blank")}
                        className="w-full"
                      >
                        <Github className="w-4 h-4 mr-2" /> View Project
                      </Button>
                    </CardFooter>
                  </Card>
                ))}

                {/* Add Project Button or Form */}
                <Card
                  className={`hover-card-animation ${
                    isAddingProject
                      ? ""
                      : "flex items-center justify-center min-h-[250px]"
                  }`}
                >
                  {!isAddingProject ? (
                    <Button
                      variant="ghost"
                      onClick={() => setIsAddingProject(true)}
                      className="flex flex-col gap-3 h-auto py-8"
                    >
                      <Plus size={24} className="text-primary" />
                      <span>Add New Project</span>
                    </Button>
                  ) : (
                    <>
                      <CardHeader>
                        <CardTitle>Add New Project</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Input
                          placeholder="Project title"
                          value={newProject.title}
                          onChange={(e) =>
                            setNewProject({
                              ...newProject,
                              title: e.target.value,
                            })
                          }
                        />
                        <Textarea
                          placeholder="Project description"
                          value={newProject.description}
                          onChange={(e) =>
                            setNewProject({
                              ...newProject,
                              description: e.target.value,
                            })
                          }
                          rows={3}
                        />
                        <Input
                          placeholder="Technologies used (comma-separated)"
                          value={newProject.frameworks}
                          onChange={(e) =>
                            setNewProject({
                              ...newProject,
                              frameworks: e.target.value,
                            })
                          }
                        />
                        <Input
                          placeholder="GitHub link"
                          value={newProject.link}
                          onChange={(e) =>
                            setNewProject({
                              ...newProject,
                              link: e.target.value,
                            })
                          }
                        />
                      </CardContent>
                      <CardFooter className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          onClick={() => setIsAddingProject(false)}
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleAddProject}>Add Project</Button>
                      </CardFooter>
                    </>
                  )}
                </Card>
              </div>
            </TabsContent>

            {/* Skills Tab */}
            <TabsContent value="skills" className="mt-2">
              <div className="glass-card rounded-xl p-8 animate-fadeIn">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold mb-3 text-gradient">
                    Technical Skills
                  </h2>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    Technologies and tools I specialize in
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                  {skills.map((skill) => (
                    <div
                      key={skill.name}
                      className="p-4 rounded-lg gradient-border bg-background/50 hover-card-animation"
                    >
                      <h3 className="font-semibold text-lg mb-1">
                        {skill.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {skill.proficiency}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex justify-center">
                  {!isAddingSkill ? (
                    <Button
                      onClick={() => setIsAddingSkill(true)}
                      className="gap-2"
                    >
                      <Plus size={16} /> Add Skill
                    </Button>
                  ) : (
                    <div className="w-full max-w-md bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6">
                      <div className="space-y-4">
                        <Input
                          placeholder="Skill name"
                          value={newSkill.name}
                          onChange={(e) =>
                            setNewSkill({ ...newSkill, name: e.target.value })
                          }
                        />
                        <Select
                          value={newSkill.proficiency}
                          onValueChange={(value) =>
                            setNewSkill({ ...newSkill, proficiency: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Proficiency level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Beginner">Beginner</SelectItem>
                            <SelectItem value="Intermediate">
                              Intermediate
                            </SelectItem>
                            <SelectItem value="Expert">Expert</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            onClick={() => setIsAddingSkill(false)}
                          >
                            Cancel
                          </Button>
                          <Button onClick={handleAddSkill}>Add Skill</Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <PortfolioAnalyticsModal
        isOpen={analyticsOpen}
        onClose={() => setAnalyticsOpen(false)}
        freelancerId={userId}
      />
    </div>
  );
};

export default Profile;
