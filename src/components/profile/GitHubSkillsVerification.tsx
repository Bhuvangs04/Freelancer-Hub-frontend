import { useState, useEffect } from "react";
import {
  Github,
  Loader2,
  CheckCircle,
  AlertCircle,
  Pencil,
  X,
  RefreshCw,
  Star,
  GitFork,
  Users,
  Building2,
  Code2,
  GitPullRequest,
  CircleDot,
  Clock,
  BookOpen,
  ExternalLink,
  Shield,
  Container,
  TestTube,
  FileText,
} from "lucide-react";
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
  initialGithubData?: GitHubProfile | null;
  initialVerifiedSkills?: Array<{ skillName: string; level: string; verificationScore: number; status: string }>;
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
  initialGithubData = null,
  initialVerifiedSkills = [],
}: GitHubSkillsVerificationProps) => {
  const [githubUsername, setGithubUsername] = useState(existingGithubUsername);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verifiedSkills, setVerifiedSkills] = useState<VerifiedSkillDisplay[]>([]);
  const [githubProfile, setGithubProfile] = useState<GitHubProfile | null>(initialGithubData);
  const [isEditing, setIsEditing] = useState(!existingGithubUsername);
  const [savedUsername, setSavedUsername] = useState(existingGithubUsername);
  const [showRepos, setShowRepos] = useState(false);

  useEffect(() => {
    if (initialGithubData) {
      setGithubProfile(initialGithubData);
      setIsEditing(false);
      // Also set the username so the edit/refresh buttons appear
      const uname = initialGithubData.username || existingGithubUsername || "";
      if (uname) {
        setSavedUsername(uname);
        setGithubUsername(uname);
      }
    }
  }, [initialGithubData]);

  // Populate verified skills from initial load
  useEffect(() => {
    if (initialVerifiedSkills && initialVerifiedSkills.length > 0 && verifiedSkills.length === 0) {
      setVerifiedSkills(
        initialVerifiedSkills.map((s) => ({
          skillName: s.skillName,
          level: s.level,
          score: s.verificationScore,
          status: s.status,
        }))
      );
    }
  }, [initialVerifiedSkills]);

  // Sync when existingGithubUsername prop arrives (it starts empty and updates after API)
  useEffect(() => {
    if (existingGithubUsername && !savedUsername) {
      setSavedUsername(existingGithubUsername);
      setGithubUsername(existingGithubUsername);
      setIsEditing(false);
    }
  }, [existingGithubUsername]);

  const processResponse = (response: any) => {
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
      setSavedUsername(profile.username || githubUsername.trim());
      setIsEditing(false);
      return true;
    }
    return false;
  };

  const handleVerifyGitHub = async () => {
    if (!githubUsername.trim()) {
      setError("Please enter a GitHub username");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.verifyGitHub(githubUsername.trim());
      if (!processResponse(response)) {
        setError(response.message || "Failed to verify GitHub profile");
      }
    } catch (err) {
      setError("Failed to connect to GitHub. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshGitHub = async () => {
    setIsRefreshing(true);
    setError(null);

    try {
      const response = await api.refreshGitHub(savedUsername || githubUsername);
      if (!processResponse(response)) {
        setError(response.message || "Failed to refresh GitHub data");
      }
    } catch (err) {
      setError("Failed to refresh GitHub data. Please try again.");
    } finally {
      setIsRefreshing(false);
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

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card className="p-6 space-y-5 shadow-md hover:shadow-lg transition-shadow border-l-4 border-l-neutral-800">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Github className="w-5 h-5 text-neutral-600" />
          <h2 className="text-lg font-medium text-neutral-800">
            GitHub Profile & Skills
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {savedUsername && !isEditing && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshGitHub}
                disabled={isRefreshing}
                className="text-neutral-600 hover:text-neutral-800"
              >
                {isRefreshing ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-1" />
                )}
                Refresh
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEditUsername}
                className="text-neutral-500 hover:text-neutral-700"
              >
                <Pencil className="w-4 h-4 mr-1" />
                Edit
              </Button>
            </>
          )}
        </div>
      </div>

      <p className="text-sm text-neutral-500">
        Connect your GitHub profile to automatically import and verify your programming skills.
        All data is fetched via authenticated API for comprehensive analysis.
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
                Analyzing...
              </>
            ) : (
              <>
                <Github className="w-4 h-4 mr-2" />
                  Import & Analyze
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
            {githubProfile?.lastFetchedAt && (
              <span className="text-xs text-green-500 ml-auto">
                Last updated: {formatDate(githubProfile.lastFetchedAt)}
              </span>
            )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* ================================================================ */}
      {/* COMPREHENSIVE GITHUB PROFILE DISPLAY */}
      {/* ================================================================ */}
      {githubProfile && !isEditing && (
        <div className="space-y-5">
          {/* Profile Header */}
          <div className="flex items-start gap-4 p-4 bg-neutral-50 rounded-lg border">
            {githubProfile.avatarUrl && (
              <img
                src={githubProfile.avatarUrl}
                alt={githubProfile.username}
                className="w-16 h-16 rounded-full border-2 border-neutral-200"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-neutral-800 truncate">
                  {githubProfile.name || githubProfile.username}
                </h3>
                <a
                  href={githubProfile.profileUrl || `https://github.com/${githubProfile.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-400 hover:text-neutral-600"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
              <p className="text-sm text-neutral-500">@{githubProfile.username}</p>
              {githubProfile.bio && (
                <p className="text-sm text-neutral-600 mt-1">{githubProfile.bio}</p>
              )}
              <div className="flex flex-wrap gap-3 mt-2 text-xs text-neutral-500">
                {githubProfile.company && (
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3 h-3" /> {githubProfile.company}
                  </span>
                )}
                {githubProfile.location && (
                  <span className="flex items-center gap-1">📍 {githubProfile.location}</span>
                )}
                {githubProfile.blog && (
                  <a href={githubProfile.blog.startsWith("http") ? githubProfile.blog : `https://${githubProfile.blog}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-500 hover:underline">
                    🔗 {githubProfile.blog}
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard icon={<BookOpen className="w-4 h-4" />} label="Repositories" value={githubProfile.publicRepos + (githubProfile.privateRepos || 0)} sub={`${githubProfile.publicRepos} public · ${githubProfile.privateRepos || 0} private`} />
            <StatCard icon={<Users className="w-4 h-4" />} label="Followers" value={githubProfile.followers} sub={`Following ${githubProfile.following}`} />
            <StatCard icon={<GitPullRequest className="w-4 h-4" />} label="Pull Requests" value={githubProfile.pullRequests?.total || 0} sub={`${githubProfile.pullRequests?.merged || 0} merged`} />
            <StatCard icon={<CircleDot className="w-4 h-4" />} label="Issues" value={githubProfile.issues?.total || 0} sub={`${githubProfile.issues?.closed || 0} closed`} />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard icon={<Code2 className="w-4 h-4" />} label="Contributions" value={githubProfile.totalContributions || 0} sub="Last year" />
            <StatCard icon={<Clock className="w-4 h-4" />} label="Account Age" value={`${githubProfile.accountAgeMonths || 0}m`} sub={`${Math.floor((githubProfile.accountAgeMonths || 0) / 12)}y ${(githubProfile.accountAgeMonths || 0) % 12}m`} />
            <StatCard icon={<Github className="w-4 h-4" />} label="Commits/Week" value={githubProfile.commitFrequency || 0} sub="Avg frequency" />
            <StatCard icon={<BookOpen className="w-4 h-4" />} label="Gists" value={githubProfile.gistsCount || 0} sub="Code snippets" />
          </div>

          {/* Organizations */}
          {githubProfile.organizations && githubProfile.organizations.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-neutral-700 flex items-center gap-1">
                <Building2 className="w-4 h-4" /> Organizations
              </h3>
              <div className="flex flex-wrap gap-2">
                {githubProfile.organizations.map((org) => (
                  <div key={org.name} className="flex items-center gap-2 bg-white border rounded-lg px-3 py-2 shadow-sm">
                    {org.avatarUrl && (
                      <img src={org.avatarUrl} alt={org.name} className="w-5 h-5 rounded" />
                    )}
                    <span className="text-sm font-medium text-neutral-700">{org.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Language Breakdown */}
          {githubProfile.topLanguages && githubProfile.topLanguages.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-neutral-700 flex items-center gap-1">
                <Code2 className="w-4 h-4" /> Language Breakdown
              </h3>
              <div className="space-y-2">
                {githubProfile.topLanguages.slice(0, 8).map((lang) => (
                  <div key={lang.name} className="flex items-center gap-3">
                    <span className="text-sm text-neutral-700 w-24 truncate font-medium">{lang.name}</span>
                    <div className="flex-1 bg-neutral-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-neutral-600 to-neutral-800 transition-all duration-500"
                        style={{ width: `${Math.max(lang.percentage, 2)}%` }}
                      />
                    </div>
                    <span className="text-xs text-neutral-500 w-10 text-right">{lang.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Repositories */}
          {githubProfile.topRepositories && githubProfile.topRepositories.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-neutral-700 flex items-center gap-1">
                  <BookOpen className="w-4 h-4" /> Top Repositories
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowRepos(!showRepos)}
                  className="text-xs text-neutral-500"
                >
                  {showRepos ? "Show Less" : `Show All (${githubProfile.topRepositories.length})`}
                </Button>
              </div>
              <div className="grid gap-3">
                {(showRepos ? githubProfile.topRepositories : githubProfile.topRepositories.slice(0, 4)).map((repo) => (
                  <div key={repo.name} className="p-3 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <a
                            href={repo.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-semibold text-blue-600 hover:underline truncate"
                          >
                            {repo.name}
                          </a>
                          {repo.private && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-amber-300 text-amber-600">
                              Private
                            </Badge>
                          )}
                        </div>
                        {repo.description && (
                          <p className="text-xs text-neutral-500 mt-1 line-clamp-2">{repo.description}</p>
                        )}
                        {/* Topics */}
                        {repo.topics && repo.topics.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {repo.topics.slice(0, 5).map((topic) => (
                              <Badge key={topic} variant="secondary" className="text-[10px] px-1.5 py-0 bg-blue-50 text-blue-600">
                                {topic}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-neutral-500 ml-3 shrink-0">
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3" /> {repo.stars}
                        </span>
                        <span className="flex items-center gap-1">
                          <GitFork className="w-3 h-3" /> {repo.forks}
                        </span>
                      </div>
                    </div>
                    {/* Quality indicators */}
                    <div className="flex items-center gap-2 mt-2">
                      {repo.language && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">{repo.language}</Badge>
                      )}
                      {repo.hasCI && (
                        <span title="Has CI/CD" className="text-green-500"><Shield className="w-3.5 h-3.5" /></span>
                      )}
                      {repo.hasDocker && (
                        <span title="Has Docker" className="text-blue-500"><Container className="w-3.5 h-3.5" /></span>
                      )}
                      {repo.hasTests && (
                        <span title="Has Tests" className="text-purple-500"><TestTube className="w-3.5 h-3.5" /></span>
                      )}
                      {repo.hasReadme && (
                        <span title="Has README" className="text-neutral-400"><FileText className="w-3.5 h-3.5" /></span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Verified Skills Display */}
          {verifiedSkills.length > 0 && (
            <div className="space-y-4">
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
                    <span className="text-xs text-green-500">
                      Score: {skill.score}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

// Stat Card Component
const StatCard = ({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  sub?: string;
}) => (
  <div className="p-3 bg-white border rounded-lg shadow-sm text-center">
    <div className="flex items-center justify-center gap-1.5 text-neutral-500 mb-1">
      {icon}
      <span className="text-[11px] font-medium">{label}</span>
    </div>
    <div className="text-xl font-bold text-neutral-800">{value}</div>
    {sub && <div className="text-[10px] text-neutral-400 mt-0.5">{sub}</div>}
  </div>
);

export default GitHubSkillsVerification;
