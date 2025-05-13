import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface FreelancerCardProps {
  id: string;
  name: string;
  skills: string[];
  hourlyRate: number;
  rating: number;
  imageUrl: string;
}

export const FreelancerCard = ({
  name,
  skills,
  hourlyRate,
  rating,
  imageUrl,
}: FreelancerCardProps) => {
  const handleBid = () => {
    toast.success("Bid placed successfully!");
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start space-x-4">
        <img
          src={imageUrl}
          alt={name}
          className="w-16 h-16 rounded-full object-cover"
        />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
          <div className="mt-1 flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
              >
                {skill}
              </span>
            ))}
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm text-gray-600">${hourlyRate}/hr</span>
            <div className="flex items-center">
              <span className="text-yellow-400 mr-1">★</span>
              <span className="text-sm text-gray-600">{rating.toFixed(1)}</span>
            </div>
          </div>
          <Button
            onClick={handleBid}
            className="mt-4 w-full"
            variant="secondary"
          >
            Place Bid
          </Button>
        </div>
      </div>
    </div>
  );
};