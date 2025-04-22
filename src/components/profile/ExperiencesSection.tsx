import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Briefcase } from "lucide-react";

export interface Experience {
  company: string;
  role: string;
  period: string;
  description: string;
}

interface ExperiencesSectionProps {
  experiences: Experience[];
  onExperiencesChange: (experiences: Experience[]) => void;
}

const ExperiencesSection = ({
  experiences,
  onExperiencesChange,
}: ExperiencesSectionProps) => {
  const addExperience = () => {
    onExperiencesChange([
      ...experiences,
      { company: "", role: "", period: "", description: "" },
    ]);
  };

  const updateExperience = (
    index: number,
    field: keyof Experience,
    value: string
  ) => {
    const updatedExperiences = experiences.map((exp, i) =>
      i === index ? { ...exp, [field]: value } : exp
    );
    onExperiencesChange(updatedExperiences);
  };

  const removeExperience = (index: number) => {
    onExperiencesChange(experiences.filter((_, i) => i !== index));
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-2">
        <Briefcase className="h-6 w-6" />
        <h2 className="text-2xl font-semibold text-neutral-800">Experiences</h2>
      </div>
      <div className="space-y-4">
        {experiences.map((exp, index) => (
          <Card key={index} className="p-4 space-y-4">
            <Input
              placeholder="Company"
              value={exp.company}
              onChange={(e) =>
                updateExperience(index, "company", e.target.value)
              }
            />
            <Input
              placeholder="Role"
              value={exp.role}
              onChange={(e) => updateExperience(index, "role", e.target.value)}
            />
            <Input
              placeholder="Period (e.g., Jan 2020 - Present)"
              value={exp.period}
              onChange={(e) =>
                updateExperience(index, "period", e.target.value)
              }
            />
            <Textarea
              placeholder="Description of your responsibilities and achievements"
              value={exp.description}
              onChange={(e) =>
                updateExperience(index, "description", e.target.value)
              }
              className="min-h-[100px]"
            />
            <Button
              variant="destructive"
              onClick={() => removeExperience(index)}
              className="w-full sm:w-auto"
            >
              Remove Experience
            </Button>
          </Card>
        ))}
        <Button
          onClick={addExperience}
          variant="outline"
          className="w-full sm:w-auto"
        >
          Add Experience
        </Button>
      </div>
    </section>
  );
};

export default ExperiencesSection;
