import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Building, User, ArrowLeftIcon } from "lucide-react";

const username = localStorage.getItem("username");
const email = localStorage.getItem("email");

const generateSecureRandomString = () => {
  const array = new Uint8Array(105); // 64 bits (8 bytes)
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
    ""
  );
};

const User_log = generateSecureRandomString();

export const ClientOnboarding = () => {
  const navigate = useNavigate();
  const [clientType, setClientType] = useState<"individual" | "company">(
    "individual"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: username || "Server Error Please Login Again",
    email: email || "Server Error Please Login Again",
    companyName: "",
    position: "",
    industry: "",
    photo: null as File | null,
    photoPreview: "",
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        photo: file,
        photoPreview: URL.createObjectURL(file),
      }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const uploadPhoto = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/client/pictureUpdate`,
      {
        method: "POST",
        body: formData,
        credentials: "include",
      }
    );

    if (!response.ok) throw new Error("Failed to upload photo");
    return response.json();
  };

  const updateProfile = async (profileData) => {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/client/company`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
        credentials: "include",
      }
    );

    if (!response.ok) throw new Error("Failed to update profile");
    return response.json();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.photo) {
      toast.error("Please upload a photo");
      return;
    }

    if (
      clientType === "company" &&
      (!formData.companyName || !formData.position || !formData.industry)
    ) {
      toast.error("Please fill in all company details");
      return;
    }

    setIsLoading(true);
    try {
      // First upload the photo
      if (formData.photo) {
        await uploadPhoto(formData.photo);
      }

      // Then update the profile
      await updateProfile({
        type: clientType,
        ...(clientType === "company"
          ? {
              companyName: formData.companyName,
              position: formData.position,
              industry: formData.industry,
            }
          : {}),
      });

      toast.success("Profile created successfully!");
      navigate(`/Client-profile?email=${email}?id=${User_log}&email=${email}`);
    } catch (e) {
      toast.error("Failed to create profile. Please try again.:" + `${e}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-2xl p-8 space-y-8 bg-white/80 backdrop-blur-sm">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            Complete Your Profile
          </h1>
          <p className="text-gray-500">
            Add additional information to your profile
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative group">
              {formData.photoPreview ? (
                <img
                  src={formData.photoPreview}
                  alt="Preview"
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center border-4 border-white shadow-lg">
                  <span className="text-gray-400 text-center text-sm px-4">
                    Upload Photo
                  </span>
                </div>
              )}
              <Input
                id="photo"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                required
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>

          <div className="grid gap-6">
            <div className="space-y-2">
              <Label>I am representing</Label>
              <Select
                value={clientType}
                onValueChange={(value: "individual" | "company") =>
                  setClientType(value)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select client type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="individual">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>Myself</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="company">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4" />
                        <span>Own Company</span>
                      </div>
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  readOnly
                  className="bg-gray-50 cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  readOnly
                  className="bg-gray-50 cursor-not-allowed"
                />
              </div>
            </div>

            {clientType === "company" && (
              <div className="space-y-4 animate-in slide-in-from-top duration-300">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    placeholder="Company Inc."
                    className="transition-all duration-200 focus:scale-[1.02]"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="position">Your Position *</Label>
                    <Input
                      id="position"
                      value={formData.position}
                      onChange={handleInputChange}
                      placeholder="CEO"
                      className="transition-all duration-200 focus:scale-[1.02]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry *</Label>
                    <Input
                      id="industry"
                      value={formData.industry}
                      onChange={handleInputChange}
                      placeholder="Technology"
                      className="transition-all duration-200 focus:scale-[1.02]"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          <p className="text-sm text-blue-500">
            Email and Name are pre-filled from your account
          </p>
          <p className="text-sm text-red-500">
            Email cannot be changed as it is linked to your account
          </p>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full py-6 text-lg font-semibold transition-all duration-300 hover:scale-[1.02] bg-gradient-to-r from-gray-900 to-gray-700 hover:from-gray-800 hover:to-gray-600"
          >
            {isLoading ? "Updating Profile..." : "Update Profile"}
          </Button>

          <div className="flex justify-center">
            <Button
              variant="ghost"
              className="py-6 flex items-center gap-2 hover:bg-green-400"
              onClick={() => navigate(-1)}
            >
              <ArrowLeftIcon width={24} />
              Back
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ClientOnboarding;
