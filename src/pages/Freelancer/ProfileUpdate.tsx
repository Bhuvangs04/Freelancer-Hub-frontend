import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { useNavigate } from "react-router-dom";
import BioSection from "@/components/profile/BioSection";
import SkillsSection from "@/components/profile/SkillsSection";
import GitHubSkillsVerification from "@/components/profile/GitHubSkillsVerification";
import ProjectsSection from "@/components/profile/ProjectsSection";
import ResumeSection from "@/components/profile/ResumeSection";
import ExperiencesSection, {
  Experience,
} from "@/components/profile/ExperiencesSection";
import { ArrowLeftIcon } from "lucide-react";

interface Skill {
  name: string;
  proficiency: "beginner" | "intermediate" | "expert";
  verified?: boolean;
  level?: string;
  score?: number;
}

const ProfileUpdate = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Profile states
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [Role, setRole] = useState("");
  const [skills, setSkills] = useState<Skill[]>([]);
  const [githubUsername, setGithubUsername] = useState("");
  const [experiences, setExperiences] = useState<Experience[]>([
    {
      company: "Example Company",
      role: "Please Entry Your Role",
      period: "2020 - Present",
      description: "Working on full-stack development using React and Node.js",
    },
  ]);
  const [newSkill, setNewSkill] = useState("");
  const [projects, setProjects] = useState<
    Array<{
      title: string;
      description: string;
      frameworks: string[];
      githubLink: string;
    }>
  >([]);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [newProficiency, setNewProficiency] = useState<
    "beginner" | "intermediate" | "expert"
  >("beginner");

  // Handle GitHub skills verification
  const handleGitHubSkillsVerified = (
    verifiedSkills: Array<{
      name: string;
      proficiency: "beginner" | "intermediate" | "expert";
      verified: boolean;
      level?: string;
      score?: number;
    }>
  ) => {
    setSkills((prevSkills) => {
      const existingSkillNames = new Set(prevSkills.map((s) => s.name.toLowerCase()));
      const newSkills: Skill[] = [];

      for (const skill of verifiedSkills) {
        if (!existingSkillNames.has(skill.name.toLowerCase())) {
          newSkills.push({
            name: skill.name,
            proficiency: skill.proficiency,
            verified: skill.verified,
            level: skill.level,
            score: skill.score,
          });
        } else {
          // Update existing skill with verification data
          const index = prevSkills.findIndex(
            (s) => s.name.toLowerCase() === skill.name.toLowerCase()
          );
          if (index !== -1) {
            prevSkills[index] = {
              ...prevSkills[index],
              verified: skill.verified,
              level: skill.level,
              score: skill.score,
              proficiency: skill.proficiency,
            };
          }
        }
      }

      return [...prevSkills, ...newSkills];
    });

    toast({
      title: "Skills Imported",
      description: `${verifiedSkills.length} skills imported from GitHub`,
    });
  };

  // Add skill
  const addSkill = () => {
    if (newSkill.trim() && !skills.some((s) => s.name === newSkill.trim())) {
      setSkills([
        ...skills,
        { name: newSkill.trim(), proficiency: newProficiency, verified: false },
      ]);
      setNewSkill("");
      setNewProficiency("beginner");
    }
  };

  // Remove skill
  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill.name !== skillToRemove));
  };

  // Update skill proficiency
  const updateSkillProficiency = (
    skillName: string,
    proficiency: "beginner" | "intermediate" | "expert"
  ) => {
    setSkills(
      skills.map((s) => (s.name === skillName ? { ...s, proficiency } : s))
    );
  };

  // Add project
  const addProject = () => {
    setProjects([
      ...projects,
      { title: "", description: "", frameworks: [], githubLink: "" },
    ]);
  };

  // Profile Update API Call
  const updateProfile = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/freelancer/freelancer/update`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bio,
            skills: skills.map((s) => ({
              name: s.name,
              proficiency: s.proficiency,
            })),
            projects,
            experiences,
            location,
            title: Role,
            githubUsername,
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        toast({
          title: "Success",
          description: "Profile updated successfully",
        });
      } else {
        toast({
          title: "Error",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  // Profile Image Upload API Call
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/freelancer/freelancer/upload-portfolio/photo`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      const data = await response.json();
      if (response.ok) {
        setProfileImage(data.imageUrl);
        toast({
          title: "Success",
          description: "Profile picture updated successfully",
        });
      } else {
        toast({
          title: "Error",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Image upload failed",
        variant: "destructive",
      });
    }
  };

  // Resume Upload API Call
  const handleResumeUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/freelancer/upload-portfolio/resume`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      const data = await response.json();
      if (response.ok) {
        toast({
          title: "Success",
          description: "Resume uploaded successfully",
        });
      } else {
        toast({
          title: "Error",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Resume upload failed",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 py-8 px-4 sm:px-6 lg:px-8 animate-fadeIn">
      <Button
        variant="ghost"
        className="ml-3 mt-5 flex items-center gap-2 hover:bg-green-400"
        onClick={() => navigate(-1)}
      >
        <ArrowLeftIcon width={24} />
        Back
      </Button>

      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-neutral-800 mb-2">
            Profile Update
          </h1>
          <p className="text-neutral-600">
            Showcase your expertise and experience
          </p>
        </div>

        <ProfileHeader onImageUpload={handleImageUpload} />

        <BioSection
          bio={bio}
          onBioChange={setBio}
          Role={Role}
          onRoleChange={setRole}
          location={location}
          onLocationChange={setLocation}
        />

        <ExperiencesSection
          experiences={experiences}
          onExperiencesChange={setExperiences}
        />

        {/* GitHub Skills Import Section */}
        <GitHubSkillsVerification
          onSkillsVerified={handleGitHubSkillsVerified}
          existingGithubUsername={githubUsername}
        />

        <SkillsSection
          skills={skills}
          newSkill={newSkill}
          newProficiency={newProficiency}
          onNewSkillChange={(e) => setNewSkill(e.target.value)}
          onProficiencyChange={setNewProficiency}
          onAddSkill={addSkill}
          onRemoveSkill={removeSkill}
          onProficiencyUpdate={updateSkillProficiency}
        />

        <ProjectsSection
          projects={projects}
          onProjectsChange={setProjects}
          onAddProject={addProject}
        />

        <ResumeSection onResumeUpload={handleResumeUpload} />

        <div className="flex justify-end space-x-4">
          <Button variant="outline" className="hover:bg-neutral-100">
            Cancel
          </Button>
          <Button
            onClick={updateProfile}
            className="bg-neutral-800 hover:bg-neutral-900"
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileUpdate;
