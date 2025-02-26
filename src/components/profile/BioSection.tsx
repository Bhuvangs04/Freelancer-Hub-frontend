import { FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface BioSectionProps {
  bio: string;
  onBioChange: (value: string) => void;
}

const BioSection: React.FC<BioSectionProps> = ({ bio, onBioChange }) => {
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
    </Card>
  );
};

export default BioSection;
