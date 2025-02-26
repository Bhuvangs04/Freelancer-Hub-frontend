import { Navigation } from "@/components/Navigation";
import { FreelancerCard } from "@/components/FreelancerCard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const clientName = localStorage.getItem("clientName") || "Client";
  const clientPhoto = localStorage.getItem("clientPhoto") || "/placeholder.svg";

  const mockFreelancers = [
    {
      id: "1",
      name: "Sarah Johnson",
      skills: ["React", "TypeScript", "UI/UX"],
      hourlyRate: 45,
      rating: 4.8,
      imageUrl: "/placeholder.svg",
    },
    {
      id: "2",
      name: "Michael Chen",
      skills: ["Node.js", "Python", "AWS"],
      hourlyRate: 55,
      rating: 4.9,
      imageUrl: "/placeholder.svg",
    },
    // Add more mock freelancers as needed
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Profile Section */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex flex-col items-center">
                <img
                  src={clientPhoto}
                  alt={clientName}
                  className="w-24 h-24 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => navigate("/profile")}
                />
                <h2 className="mt-4 text-xl font-semibold">{clientName}</h2>
                <div className="mt-6 w-full space-y-3">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate("/settings")}
                  >
                    Settings
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full text-red-600 hover:text-red-700"
                    onClick={() => navigate("/")}
                  >
                    Log Out
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Freelancers Section */}
          <div className="md:col-span-3">
            <div className="grid gap-6">
              {mockFreelancers.map((freelancer) => (
                <FreelancerCard key={freelancer.id} {...freelancer} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;