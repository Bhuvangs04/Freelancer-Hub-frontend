import { Award } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface Skill {
  name: string;
  proficiency: "beginner" | "intermediate" | "expert";
}

interface SkillsSectionProps {
  skills: Skill[];
  newSkill: string;
  newProficiency: "beginner" | "intermediate" | "expert";
  onNewSkillChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onProficiencyChange: (value: "beginner" | "intermediate" | "expert") => void;
  onAddSkill: () => void;
  onRemoveSkill: (skill: string) => void;
  onProficiencyUpdate: (
    skill: string,
    proficiency: "beginner" | "intermediate" | "expert"
  ) => void;
}

const SkillsSection = ({
  skills,
  newSkill,
  newProficiency,
  onNewSkillChange,
  onProficiencyChange,
  onAddSkill,
  onRemoveSkill,
  onProficiencyUpdate,
}: SkillsSectionProps) => {
  return (
    <Card className="p-6 space-y-4 shadow-md hover:shadow-lg transition-shadow">
      <div className="flex items-center space-x-2 mb-4">
        <Award className="w-5 h-5 text-neutral-600" />
        <h2 className="text-lg font-medium text-neutral-800">Skills</h2>
      </div>

      <div className="space-y-2">
        {skills.map((skill) => (
          <div
            key={skill.name}
            className="flex items-center justify-between bg-neutral-100 p-2 rounded-lg"
          >
            <span className="text-neutral-800">{skill.name}</span>

            <Select
              value={skill.proficiency}
              onValueChange={(value) =>
                onProficiencyUpdate(
                  skill.name,
                  value as "beginner" | "intermediate" | "expert"
                )
              }
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Select Proficiency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="expert">Expert</SelectItem>
              </SelectContent>
            </Select>

            <button
              onClick={() => onRemoveSkill(skill.name)}
              className="ml-2 text-neutral-500 hover:text-neutral-700"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          value={newSkill}
          onChange={onNewSkillChange}
          placeholder="Add a skill..."
        />

        <Select
          value={newProficiency}
          onValueChange={(value) =>
            onProficiencyChange(value as "beginner" | "intermediate" | "expert")
          }
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Proficiency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="expert">Expert</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={onAddSkill} variant="outline">
          Add
        </Button>
      </div>
    </Card>
  );
};

export default SkillsSection;
