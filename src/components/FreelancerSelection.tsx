import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface FreelancerSelectionProps {
  projectId: string;
}

export const FreelancerSelection = ({ projectId }: FreelancerSelectionProps) => {
  const navigate = useNavigate();

  const handleAccept = (freelancerId: string) => {
    // Update project status and assign freelancer
    const projects = JSON.parse(localStorage.getItem("clientProjects") || "[]");
    const updatedProjects = projects.map((project) => {
      if (project.id === projectId) {
        return {
          ...project,
          status: "ongoing",
          freelancerId,
        };
      }
      return project;
    });
    localStorage.setItem("clientProjects", JSON.stringify(updatedProjects));
    toast.success("Freelancer accepted!");
    navigate("/dashboard");
  };

  const handleReject = () => {
    toast.error("Freelancer rejected");
  };

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
  ];

  return (
    <div className="grid gap-6">
      {mockFreelancers.map((freelancer) => (
        <div key={freelancer.id} className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-start space-x-4">
            <img
              src={freelancer.imageUrl}
              alt={freelancer.name}
              className="w-16 h-16 rounded-full object-cover"
            />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{freelancer.name}</h3>
              <div className="mt-1 flex flex-wrap gap-2">
                {freelancer.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm text-gray-600">${freelancer.hourlyRate}/hr</span>
                <div className="flex items-center">
                  <span className="text-yellow-400 mr-1">★</span>
                  <span className="text-sm text-gray-600">{freelancer.rating.toFixed(1)}</span>
                </div>
              </div>
              <div className="mt-4 flex gap-4">
                <Button
                  onClick={() => handleAccept(freelancer.id)}
                  className="flex-1"
                  variant="default"
                >
                  Accept
                </Button>
                <Button
                  onClick={handleReject}
                  className="flex-1"
                  variant="destructive"
                >
                  Reject
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};