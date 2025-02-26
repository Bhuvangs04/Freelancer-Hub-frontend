import { ProfileSection2 } from "@/components/profile/ProfileSection2";
import { ProjectsGrid } from "@/components/profile/ProjectsGrid";
import { SkillsSection } from "@/components/profile/SkillsSection2";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-secondary/20">
      <div className="container py-12 space-y-16">
        <ProfileSection2 />
        <ProjectsGrid />
        <SkillsSection />
      </div>
    </div>
  );
};

export default Index;
