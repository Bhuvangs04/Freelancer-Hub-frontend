import { useState, useEffect } from "react";
import { User, Upload, Edit2, FileText, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";

export const ProfileSection2 = () => {
  const [editMode, setEditMode] = useState(false);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [resume, setResume] = useState<string | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeEditMode, setResumeEditMode] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
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
        description: "Profile successfully updated.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
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
        description: "Resume successfully uploaded.",
      });
    } catch (error) {
      console.error("Error uploading resume:", error);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-gray-100 relative isolate">
      {/* Header Section */}
      <div className="h-[50vh] w-full bg-gradient-to-r from-blue-600 to-purple-600 absolute top-0 left-0 right-0 z-0">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-50 to-transparent" />
      </div>

      {/* Profile Content */}
      <div className="relative z-10 pt-[20vh]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[90rem]">
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 md:p-12 backdrop-blur-lg border border-gray-200/50">
            <div className="flex flex-col lg:flex-row gap-12">
              {/* Left Column - Profile Image */}
              <div className="flex flex-col items-center lg:items-start space-y-6">
                <div className="relative group">
                  <div className="w-48 h-48 rounded-2xl overflow-hidden bg-gray-100 flex items-center justify-center relative shadow-lg border-4 border-white">
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-24 h-24 text-gray-400" />
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center cursor-pointer">
                      <Camera className="w-10 h-10 text-white" />
                    </div>
                  </div>
                </div>

                {/* Resume Section */}
                <div className="w-full bg-gray-50 rounded-xl p-6 space-y-4">
                  <h3 className="text-xl font-semibold text-gray-800">
                    Resume
                  </h3>
                  <div className="flex flex-col gap-3">
                    {resume && (
                      <Button
                        variant="secondary"
                        onClick={() => window.open(resume, "_blank")}
                        className="w-full shadow-sm hover:shadow-md transition-all"
                      >
                        <FileText className="w-4 h-4 mr-2" /> View Resume
                      </Button>
                    )}
                    {!resumeEditMode ? (
                      <Button
                        variant="outline"
                        onClick={() => setResumeEditMode(true)}
                        className="w-full"
                      >
                        <Edit2 className="w-4 h-4 mr-2" /> Update Resume
                      </Button>
                    ) : (
                      <div className="space-y-3">
                        <Input
                          type="file"
                          accept=".pdf"
                          onChange={(e) =>
                            setResumeFile(e.target.files?.[0] || null)
                          }
                          className="bg-white"
                        />
                        <p className="text-xs text-gray-500">
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
              </div>

              {/* Right Column - Profile Info */}
              <div className="flex-1 space-y-8">
                {editMode ? (
                  <div className="space-y-6">
                    <Input
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="text-3xl font-bold bg-gray-50/50 border-gray-200"
                      placeholder="Your Name"
                    />
                    <Textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="min-h-[200px] bg-gray-50/50 border-gray-200"
                      placeholder="Tell us about yourself..."
                    />
                    <div className="flex gap-4">
                      <Button
                        onClick={handleProfileUpdate}
                        className="shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
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
                    <h1 className="text-4xl font-bold text-gray-900">
                      {username || "Your Name"}
                    </h1>
                    <div className="prose prose-lg max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                        {bio || "_Start writing about yourself..._"}
                      </ReactMarkdown>
                    </div>
                    <Button
                      onClick={() => setEditMode(true)}
                      className="shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      <Edit2 className="w-4 h-4 mr-2" /> Edit Profile
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
