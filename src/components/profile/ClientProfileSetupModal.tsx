import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Camera, Building, Briefcase, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface ClientProfileSetupModalProps {
  onComplete: () => void;
}

const industries = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "E-commerce",
  "Real Estate",
  "Manufacturing",
  "Media & Entertainment",
  "Consulting",
  "Non-profit",
  "Other",
];

const ClientProfileSetupModal = ({ onComplete }: ClientProfileSetupModalProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");

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

  const canProceed = () => {
    switch (step) {
      case 1:
        return !!profileImage;
      case 2:
        return companyName.length >= 2;
      case 3:
        return !!industry;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    if (!profileImage || companyName.length < 2 || !industry) {
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

      // Update profile with company info
      const profileResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/freelancer/freelancer/update`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            companyName,
            Industry: industry,
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
              <p className="text-neutral-500 mt-1">A professional photo helps freelancers recognize you</p>
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
              <h3 className="text-xl font-semibold text-neutral-800">Company Name</h3>
              <p className="text-neutral-500 mt-1">Enter your company or business name</p>
            </div>

            <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-lg">
              <Building className="w-6 h-6 text-neutral-400" />
              <Input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Acme Corporation"
                className="border-0 bg-transparent focus-visible:ring-0"
              />
            </div>

            {companyName && (
              <p className="text-center text-sm text-green-600 flex items-center justify-center gap-1">
                <CheckCircle className="w-4 h-4" />
                Looks good!
              </p>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-neutral-800">Select Industry</h3>
              <p className="text-neutral-500 mt-1">Help freelancers understand your business</p>
            </div>

            <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-lg">
              <Briefcase className="w-6 h-6 text-neutral-400" />
              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger className="border-0 bg-transparent focus:ring-0">
                  <SelectValue placeholder="Select your industry" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((ind) => (
                    <SelectItem key={ind} value={ind}>
                      {ind}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            <Building className="w-6 h-6 text-neutral-800" />
            <h2 className="text-2xl font-bold text-neutral-800">Complete Your Profile</h2>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
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

          {step < 3 ? (
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

export default ClientProfileSetupModal;
