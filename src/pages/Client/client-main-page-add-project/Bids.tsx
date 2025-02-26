import { Navigation } from "@/components/Navigation";
import { FreelancerCard } from "@/components/FreelancerCard";

const Bids = () => {
  // Mock data for bids - in a real app this would come from an API
  const biddedFreelancers = [
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
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Bids</h1>
        <div className="grid gap-6">
          {biddedFreelancers.map((freelancer) => (
            <FreelancerCard key={freelancer.id} {...freelancer} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Bids;