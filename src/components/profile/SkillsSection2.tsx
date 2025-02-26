import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


export const SkillsSection = () => {
  const [skills, setSkills] = useState<{ name: string; proficiency: String }[]>(
    []
  );
  const [newSkill, setNewSkill] = useState({ name: "", proficiency: "" });
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/freelancer/skills`,
          {
            credentials: "include",
          }
        );
        const data = await response.json();
        setSkills(Array.isArray(data.skills) ? data.skills : []);
      } catch (error) {
        console.error("Error fetching skills:", error);
      }
    };

    fetchSkills();
  }, []);

  const handleAddSkill = async () => {
    if (!newSkill.name || !newSkill.proficiency) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/freelancer/freelancer/update`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            skills: Array.isArray(newSkill) ? newSkill : [newSkill],
          }),
          credentials: "include",
        }
      );

      const data = await response.json();
      if (response.ok) {
        setSkills([...skills, newSkill]);
        setNewSkill({ name: "", proficiency: "" });
        setIsAddingSkill(false);
        toast({
          title: "Success",
          description: "Skill added successfully",
        });
      }
    } catch (error) {
      console.error("Error adding skill:", error);
      toast({
        title: "Error",
        description: "Failed to add skill",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-8 animate-fadeIn">
      <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-8 shadow-lg">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Technical Skills</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Technologies and tools I specialize in
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-6">
          {skills.map((skill) => (
            <Badge
              key={skill.name}
              variant="secondary"
              className="text-lg py-2 px-4 bg-secondary/50 backdrop-blur-sm hover:bg-secondary/80 transition-all duration-300 shadow-sm hover:shadow-md cursor-default"
            >
              {skill.name}
              <span className="ml-2 text-sm text-muted-foreground">
                ({skill.proficiency})
              </span>
            </Badge>
          ))}
        </div>

        <div className="flex justify-center">
          {!isAddingSkill ? (
            <Button onClick={() => setIsAddingSkill(true)} className="gap-2">
              <Plus size={16} /> Add Skill
            </Button>
          ) : (
            <div className="flex flex-col gap-4 w-full max-w-md">
              <Input
                placeholder="Skill name"
                value={newSkill.name}
                onChange={(e) =>
                  setNewSkill({ ...newSkill, name: e.target.value })
                }
              />
              <Select
                value={newSkill.proficiency}
                onValueChange={(value) =>
                  setNewSkill({ ...newSkill, proficiency: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Proficiency (e.g., Expert, Intermediate)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Expert">Expert</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setIsAddingSkill(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddSkill}>Add Skill</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};