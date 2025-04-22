import { FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface BioSectionProps {
  bio: string;
  location?: string; // Optional prop for location
  Role?: string; // Optional prop for role
  onRoleChange?: (value: string) => void; // Optional prop for role change handler
  onLocationChange?: (value: string) => void; // Optional prop for location change handler
  onBioChange: (value: string) => void;
}

const BioSection: React.FC<BioSectionProps> = ({
  bio,
  onBioChange,
  onRoleChange,
  onLocationChange,
  location,
  Role,
}) => {
  return (
    <Card className="p-6 space-y-4 shadow-md hover:shadow-lg transition-shadow">
      <div className="flex items-center space-x-2 mb-4">
        <FileText className="w-5 h-5 text-neutral-600" />
        <h2 className="text-lg font-medium text-neutral-800">Bio</h2>
      </div>
      <Textarea
        placeholder="Tell us about yourself..."
        className="min-h-[150px] resize-none"
        value={bio} // ✅ Controlled input
        onChange={(e) => onBioChange(e.target.value)} // ✅ Update state on change
      />
      <div className="flex flex-col space-y-2">
        <label className="text-sm text-neutral-600">Location</label>
        <input
          type="text"
          placeholder="Enter your location"
          value={location} // ✅ Controlled input
          onChange={(e) => onLocationChange?.(e.target.value)} // ✅ Update state on change
          className="border border-neutral-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-400"
        />
      </div>
      <div className="flex flex-col space-y-2">
        <label className="text-sm text-neutral-600">Role</label>
        <input
          type="text"
          placeholder="Enter your role"
          value={Role} // ✅ Controlled input
          onChange={(e) => onRoleChange?.(e.target.value)} // ✅ Update state on change
          className="border border-neutral-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-400"
        />
      </div>
    </Card>
  );
};

export default BioSection;
