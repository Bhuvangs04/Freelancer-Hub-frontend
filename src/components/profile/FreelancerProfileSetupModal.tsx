import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Camera, FileText, User, Plus, X, Upload, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface FreelancerProfileSetupModalProps {
  onComplete: () => void;
}

const FreelancerProfileSetupModal = ({ onComplete }: FreelancerProfileSetupModalProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [resume, setResume] = useState<File | null>(null);
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResumeSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResume(file);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return !!profileImage;
      case 2:
        return !!resume;
      case 3:
        return bio.length >= 50;
      case 4:
        return skills.length >= 1;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    if (!profileImage || !resume || bio.length < 50 || skills.length < 1) {
      toast({
        title: "Incomplete Profile",
        description: "Please complete all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload profile image
      const imageFormData = new FormData();
      imageFormData.append("file", profileImage);

      const imageResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/freelancer/freelancer/upload-portfolio/photo`,
        {
          method: "POST",
          credentials: "include",
          body: imageFormData,
        }
      );

      if (!imageResponse.ok) {
        throw new Error("Failed to upload profile image");
      }

      // Upload resume
      const resumeFormData = new FormData();
      resumeFormData.append("file", resume);

      const resumeResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/freelancer/upload-portfolio/resume`,
        {
          method: "POST",
          credentials: "include",
          body: resumeFormData,
        }
      );

      if (!resumeResponse.ok) {
        throw new Error("Failed to upload resume");
      }

      // Update profile with bio and skills
      const profileResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/freelancer/freelancer/update`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bio,
            skills: skills.map((s) => ({ name: s, proficiency: "beginner" })),
            profileComplete: true,
          }),
        }
      );

      if (!profileResponse.ok) {
        throw new Error("Failed to update profile");
      }

      toast({
        title: "Profile Complete!",
        description: "Welcome to the platform!",
      });

      onComplete();
    } catch (error) {
      console.error("Profile setup error:", error);
      toast({
        title: "Error",
        description: "Failed to complete profile setup. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-neutral-800">Add Profile Photo</h3>
              <p className="text-neutral-500 mt-1">A professional photo helps clients trust you</p>
            </div>

            <div
              className="mx-auto w-40 h-40 rounded-full border-4 border-dashed border-neutral-300 flex items-center justify-center cursor-pointer hover:border-neutral-400 transition-colors overflow-hidden"
              onClick={() => fileInputRef.current?.click()}
            >
              {profileImagePreview ? (
                <img
                  src={profileImagePreview}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Camera className="w-12 h-12 text-neutral-400" />
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />

            <p className="text-center text-sm text-neutral-500">
              Click to upload your photo
            </p>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-neutral-800">Upload Resume</h3>
              <p className="text-neutral-500 mt-1">Showcase your experience and qualifications</p>
            </div>

            <div
              className="mx-auto p-8 border-2 border-dashed border-neutral-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-neutral-400 transition-colors"
              onClick={() => resumeInputRef.current?.click()}
            >
              {resume ? (
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                  <span className="text-neutral-700">{resume.name}</span>
                </div>
              ) : (
                <>
                  <FileText className="w-12 h-12 text-neutral-400 mb-2" />
                  <p className="text-neutral-500">Click to upload PDF or DOCX</p>
                </>
              )}
            </div>

            <input
              ref={resumeInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleResumeSelect}
              className="hidden"
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-neutral-800">Write Your Bio</h3>
              <p className="text-neutral-500 mt-1">Tell clients about yourself (min 50 characters)</p>
            </div>

            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="I'm a passionate developer with expertise in..."
              className="min-h-[150px]"
            />

            <p className={`text-sm ${bio.length >= 50 ? "text-green-600" : "text-neutral-500"}`}>
              {bio.length}/50 characters minimum
            </p>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-neutral-800">Add Your Skills</h3>
              <p className="text-neutral-500 mt-1">Add at least 1 skill to get started</p>
            </div>

            <div className="flex gap-2">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="e.g., React, Python, UI Design"
                onKeyPress={(e) => e.key === "Enter" && addSkill()}
              />
              <Button onClick={addSkill} variant="outline">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 min-h-[60px] p-4 bg-neutral-50 rounded-lg">
              {skills.length === 0 ? (
                <p className="text-neutral-400">No skills added yet</p>
              ) : (
                skills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="secondary"
                    className="px-3 py-1 flex items-center gap-1"
                  >
                    {skill}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => removeSkill(skill)}
                    />
                  </Badge>
                ))
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8"
      >
        {/* Header */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center gap-2">
            <User className="w-6 h-6 text-neutral-800" />
            <h2 className="text-2xl font-bold text-neutral-800">Complete Your Profile</h2>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`w-3 h-3 rounded-full transition-colors ${
                s <= step ? "bg-neutral-800" : "bg-neutral-200"
              }`}
            />
          ))}
        </div>

        {/* Step Content */}
        {renderStep()}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="ghost"
            onClick={() => setStep(step - 1)}
            disabled={step === 1}
          >
            Back
          </Button>

          {step < 4 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="bg-neutral-800 hover:bg-neutral-900"
            >
              Continue
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed() || isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Complete Setup"
              )}
            </Button>
          )}
        </div>

        {/* Warning */}
        <p className="text-center text-xs text-neutral-400 mt-6">
          You must complete this setup to access the platform
        </p>
      </motion.div>
    </div>
  );
};

export default FreelancerProfileSetupModal;
