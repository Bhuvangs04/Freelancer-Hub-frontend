import { useState } from "react";
import { Search, Sliders } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import ProjectCard3 from "@/components/ProjectCard3";
import FilterSection from "@/components/FilterSection";
import { mockProjects } from "@/lib/mock-data";

export default function ClientsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [budget, setBudget] = useState<number>(50000);
  const [showFilters, setShowFilters] = useState(true);

  const filteredProjects = mockProjects.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSkills = selectedSkills.length === 0 || 
      selectedSkills.some(skill => project.skills.includes(skill));
    const matchesLevels = selectedLevels.length === 0 ||
      selectedLevels.includes(project.experienceLevel);
    const matchesBudget = project.budget <= budget;

    return matchesSearch && matchesSkills && matchesLevels && matchesBudget;
  });

  return (
    <div className="min-h-screen bg-background p-6 animate-in">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-semibold tracking-tight">Projects</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Sliders className="h-4 w-4" />
            Filters
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[300px,1fr] gap-8">
          <div className={`filter-section ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="sticky top-6 space-y-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <FilterSection
                selectedSkills={selectedSkills}
                setSelectedSkills={setSelectedSkills}
                selectedLevels={selectedLevels}
                setSelectedLevels={setSelectedLevels}
                budget={budget}
                setBudget={setBudget}
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground">
                Showing {filteredProjects.length} projects
              </p>
              <div className="flex gap-2">
                {selectedSkills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => setSelectedSkills(selectedSkills.filter(s => s !== skill))}
                  >
                    {skill} ×
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredProjects.map((project) => (
                <ProjectCard3 key={project.id} project={project} />
              ))}
            </div>

            {filteredProjects.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No projects found matching your criteria</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}