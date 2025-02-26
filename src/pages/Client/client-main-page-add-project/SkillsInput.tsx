import React from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

interface SkillsInputProps {
  skills: string[];
  setSkills: (skills: string[]) => void;
}

const SkillsInput: React.FC<SkillsInputProps> = ({ skills, setSkills }) => {
  const [inputValue, setInputValue] = React.useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      if (!skills.includes(inputValue.trim())) {
        setSkills([...skills, inputValue.trim()]);
        setInputValue("");
      }
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 min-h-[2.5rem] p-2 border rounded-md">
        {skills.map((skill, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="px-3 py-1 flex items-center gap-1 hover:bg-secondary/80 transition-colors"
          >
            {skill}
            <X
              className="h-3 w-3 cursor-pointer hover:text-destructive"
              onClick={() => removeSkill(skill)}
            />
          </Badge>
        ))}
        <Input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a skill and press Enter"
          className="border-0 flex-1 min-w-[200px] focus-visible:ring-0 px-0"
        />
      </div>
      <p className="text-sm text-muted-foreground">
        Press Enter to add a skill
      </p>
    </div>
  );
};

export default SkillsInput;
