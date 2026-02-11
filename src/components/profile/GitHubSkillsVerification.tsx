import { useState } from "react";
import { Github, Loader2, CheckCircle, AlertCircle, Pencil, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { SkillVerification, GitHubProfile } from "@/types";

interface GitHubSkillsVerificationProps {
  onSkillsVerified: (
    skills: Array<{
      name: string;
      proficiency: "beginner" | "intermediate" | "expert";
      verified: boolean;
      level?: string;
      score?: number;
    }>
  ) => void;
  existingGithubUsername?: string;
}

interface VerifiedSkillDisplay {
  skillName: string;
  level: string;
  score: number;
  status: string;
}

const mapLevelToProficiency = (
  level: string
): "beginner" | "intermediate" | "expert" => {
  switch (level) {
    case "expert":
    case "advanced":
      return "expert";
    case "intermediate":
      return "intermediate";
    default:
      return "beginner";
  }
};

const getLevelBadgeColor = (level: string): string => {
  switch (level) {
    case "expert":
      return "bg-purple-500 hover:bg-purple-600";
    case "advanced":
      return "bg-blue-500 hover:bg-blue-600";
    case "intermediate":
      return "bg-green-500 hover:bg-green-600";
    default:
      return "bg-gray-500 hover:bg-gray-600";
  }
};

const GitHubSkillsVerification = ({
  onSkillsVerified,
  existingGithubUsername = "",
}: GitHubSkillsVerificationProps) => {
  const [githubUsername, setGithubUsername] = useState(existingGithubUsername);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verifiedSkills, setVerifiedSkills] = useState<VerifiedSkillDisplay[]>([]);
  const [githubProfile, setGithubProfile] = useState<GitHubProfile | null>(null);
  const [isEditing, setIsEditing] = useState(!existingGithubUsername);
  const [savedUsername, setSavedUsername] = useState(existingGithubUsername);

  const handleVerifyGitHub = async () => {
    if (!githubUsername.trim()) {
      setError("Please enter a GitHub username");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.verifyGitHub(githubUsername.trim());

      if (response.status === "success" && response.data) {
        const { githubProfile: profile, verifiedSkills: skills } = response.data;

        setGithubProfile(profile);
        setVerifiedSkills(
          skills.map((skill: SkillVerification) => ({
            skillName: skill.skillName,
            level: skill.level,
            score: skill.verificationScore,
            status: skill.status,
          }))
        );

        // Convert to parent format and notify
        const convertedSkills = skills.map((skill: SkillVerification) => ({
          name: skill.skillName,
          proficiency: mapLevelToProficiency(skill.level),
          verified: skill.status === "verified",
          level: skill.level,
          score: skill.verificationScore,
        }));

        onSkillsVerified(convertedSkills);
        setSavedUsername(githubUsername.trim());
        setIsEditing(false);
      } else {
        setError(response.message || "Failed to verify GitHub profile");
      }
    } catch (err) {
      setError("Failed to connect to GitHub. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditUsername = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setGithubUsername(savedUsername);
    setIsEditing(false);
    setError(null);
  };

  return (
    <Card className="p-6 space-y-4 shadow-md hover:shadow-lg transition-shadow border-l-4 border-l-neutral-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Github className="w-5 h-5 text-neutral-600" />
          <h2 className="text-lg font-medium text-neutral-800">
            Import Skills from GitHub
          </h2>
        </div>
        {savedUsername && !isEditing && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEditUsername}
            className="text-neutral-500 hover:text-neutral-700"
          >
            <Pencil className="w-4 h-4 mr-1" />
            Edit
          </Button>
        )}
      </div>

      <p className="text-sm text-neutral-500">
        Connect your GitHub profile to automatically import and verify your programming skills
        based on your repositories and contributions.
      </p>

      {/* Username Input Section */}
      {isEditing ? (
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
              github.com/
            </span>
            <Input
              value={githubUsername}
              onChange={(e) => {
                setGithubUsername(e.target.value);
                setError(null);
              }}
              placeholder="username"
              className="pl-24"
              disabled={isLoading}
            />
          </div>
          <Button
            onClick={handleVerifyGitHub}
            disabled={isLoading || !githubUsername.trim()}
            className="bg-neutral-800 hover:bg-neutral-900"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <Github className="w-4 h-4 mr-2" />
                Import Skills
              </>
            )}
          </Button>
          {savedUsername && (
            <Button variant="outline" onClick={handleCancelEdit} disabled={isLoading}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-green-700 font-medium">
            Connected: github.com/{savedUsername}
          </span>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* GitHub Profile Summary */}
      {githubProfile && !isEditing && (
        <div className="grid grid-cols-3 gap-4 p-4 bg-neutral-50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-neutral-800">
              {githubProfile.repos}
            </div>
            <div className="text-xs text-neutral-500">Repositories</div>
          </div>
          <div className="text-center border-x border-neutral-200">
            <div className="text-2xl font-bold text-neutral-800">
              {githubProfile.followers}
            </div>
            <div className="text-xs text-neutral-500">Followers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-neutral-800">
              {verifiedSkills.length}
            </div>
            <div className="text-xs text-neutral-500">Skills Verified</div>
          </div>
        </div>
      )}

      {/* Verified Skills Display */}
      {verifiedSkills.length > 0 && !isEditing && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-neutral-700">
            Verified Skills from GitHub
          </h3>
          <div className="flex flex-wrap gap-2">
            {verifiedSkills.map((skill) => (
              <div
                key={skill.skillName}
                className="flex items-center gap-2 bg-white border rounded-lg px-3 py-2 shadow-sm"
              >
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="font-medium text-neutral-800 capitalize">
                  {skill.skillName}
                </span>
                <Badge className={`text-xs text-white ${getLevelBadgeColor(skill.level)}`}>
                  {skill.level}
                </Badge>
                <span className="text-xs text-neutral-400">
                  Score: {skill.score}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Languages */}
      {githubProfile?.topLanguages && githubProfile.topLanguages.length > 0 && !isEditing && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-neutral-700">
            Top Languages Detected
          </h3>
          <div className="flex flex-wrap gap-2">
            {githubProfile.topLanguages.map((lang: any) => (
              <Badge key={lang.name || lang} variant="outline" className="text-neutral-600">
                {lang.name || lang} {lang.percentage ? `(${lang.percentage}%)` : ""}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export default GitHubSkillsVerification;
