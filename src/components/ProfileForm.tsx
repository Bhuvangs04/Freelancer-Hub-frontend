import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface ProfileData {
  name: string;
  skills: string;
  experience: string;
  availability: string;
  photoUrl?: string;
}

const ProfileForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState<ProfileData>({
    name: "",
    skills: "",
    experience: "",
    availability: "",
  });
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setPhotoPreview(base64String);
      setFormData(prev => ({ ...prev, photoUrl: base64String }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.skills || !formData.experience || !formData.availability) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    localStorage.setItem("profileData", JSON.stringify(formData));
    toast({
      title: "Success",
      description: "Profile data saved successfully",
    });
    navigate("/profile");
  };

  const handleSkillsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const skills = e.target.value.split(',').map(skill => skill.trim()).filter(Boolean).join(', ');
    setFormData({ ...formData, skills });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Create Your Profile</h2>
          <p className="mt-2 text-gray-600">Fill in your professional details</p>
        </div>
        
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={photoPreview || ""} />
              <AvatarFallback className="bg-gray-100">
                <Upload className="h-8 w-8 text-gray-400" />
              </AvatarFallback>
            </Avatar>
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('photo-upload')?.click()}
            >
              Upload Photo
            </Button>
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1"
                placeholder="John Doe"
              />
            </div>

            <div>
              <Label htmlFor="skills">Skills (comma-separated)</Label>
              <Textarea
                id="skills"
                value={formData.skills}
                onChange={handleSkillsChange}
                className="mt-1"
                placeholder="React, Node.js, TypeScript..."
              />
              <p className="text-sm text-gray-500 mt-1">
                Enter your skills separated by commas
              </p>
            </div>

            <div>
              <Label htmlFor="experience">Experience</Label>
              <Textarea
                id="experience"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                className="mt-1"
                placeholder="Describe your professional experience..."
              />
            </div>

            <div>
              <Label htmlFor="availability">Availability</Label>
              <Select
                value={formData.availability}
                onValueChange={(value) => setFormData({ ...formData, availability: value })}
              >
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Select availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-time">Full Time</SelectItem>
                  <SelectItem value="part-time">Part Time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="freelance">Freelance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" className="w-full">
            Next
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ProfileForm;