import ProfileSection2 from "@/components/profile/ProfileSection2";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <div className="container mx-auto px-4">
        <Button
          variant="ghost"
          className="mt-6 flex items-center gap-2 hover:bg-primary/10 transition-colors"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      <ProfileSection2 />
    </div>
  );
};

export default Index;
