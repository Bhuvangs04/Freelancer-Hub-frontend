import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings, LogOut, User } from "lucide-react";
import { ProfileData } from "./ProfileForm";

interface Project {
  id: number;
  title: string;
  description: string;
  budget: string;
}

const mockProjects: Project[] = [
  {
    id: 1,
    title: "E-commerce Website Development",
    description: "Looking for a full-stack developer to build an e-commerce platform",
    budget: "$3000-5000",
  },
  {
    id: 2,
    title: "Mobile App UI Design",
    description: "Need a UI designer for a fitness tracking app",
    budget: "$2000-4000",
  },
  {
    id: 3,
    title: "WordPress Blog Customization",
    description: "Customize existing WordPress blog with new features",
    budget: "$500-1000",
  },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);

  useEffect(() => {
    const savedData = localStorage.getItem("profileData");
    if (savedData) {
      setProfileData(JSON.parse(savedData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("profileData");
    navigate("/");
  };

  if (!profileData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Sidebar */}
      <div className="w-64 bg-gray-50 border-r p-6 space-y-6">
        <div className="space-y-4">
          <div 
            className="flex flex-col items-center cursor-pointer"
            onClick={() => navigate("/profile")}
          >
            <Avatar className="h-20 w-20">
              <AvatarImage src={profileData.photoUrl} />
              <AvatarFallback className="bg-gray-100">
                <User className="h-8 w-8 text-gray-400" />
              </AvatarFallback>
            </Avatar>
            <h2 className="mt-2 font-semibold text-lg">{profileData.name}</h2>
          </div>
          
          <div className="space-y-2">
            <Button variant="ghost" className="w-full justify-start">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
            <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Log Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6">Available Projects</h1>
        <div className="space-y-4">
          {mockProjects.map((project) => (
            <div
              key={project.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{project.title}</h3>
                  <p className="text-gray-600 mt-1">{project.description}</p>
                  <p className="text-sm text-gray-500 mt-2">Budget: {project.budget}</p>
                </div>
                <Button>Apply</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;