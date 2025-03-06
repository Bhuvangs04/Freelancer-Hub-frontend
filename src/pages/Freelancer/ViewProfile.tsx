import { ProfileSection2 } from "@/components/profile/ProfileSection2";
import { ProjectsGrid } from "@/components/profile/ProjectsGrid";
import { SkillsSection } from "@/components/profile/SkillsSection2";
import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
const Index = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen">
      <Button
        variant="ghost"
        className="ml-3 mt-5 flex items-center gap-2 hover:bg-green-400"
        onClick={() => navigate(-1)}
      >
        <ArrowLeftIcon width={24} />
        Back
      </Button>

      <div className="container py-12 space-y-16">
        <ProfileSection2 />
        <ProjectsGrid />
        <SkillsSection />
      </div>
    </div>
  );
};

export default Index;
