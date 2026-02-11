import { Award, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  verified?: boolean;
  level?: string;
  score?: number;
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

const getLevelBadgeColor = (level?: string): string => {
  switch (level) {
    case "expert":
      return "bg-purple-500 text-white";
    case "advanced":
      return "bg-blue-500 text-white";
    case "intermediate":
      return "bg-green-500 text-white";
    default:
      return "bg-gray-500 text-white";
  }
};

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
        {skills.some((s) => s.verified) && (
          <Badge variant="secondary" className="text-xs">
            {skills.filter((s) => s.verified).length} Verified
          </Badge>
        )}
      </div>

      <div className="space-y-2">
        {skills.map((skill) => (
          <div
            key={skill.name}
            className={`flex items-center justify-between p-2 rounded-lg ${skill.verified
                ? "bg-green-50 border border-green-200"
                : "bg-neutral-100"
              }`}
          >
            <div className="flex items-center gap-2">
              {skill.verified && (
                <CheckCircle className="w-4 h-4 text-green-500" />
              )}
              <span className="text-neutral-800 capitalize">{skill.name}</span>
              {skill.verified && skill.level && (
                <Badge className={`text-xs ${getLevelBadgeColor(skill.level)}`}>
                  {skill.level}
                </Badge>
              )}
              {skill.verified && skill.score !== undefined && (
                <span className="text-xs text-neutral-400">
                  Score: {skill.score}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
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
