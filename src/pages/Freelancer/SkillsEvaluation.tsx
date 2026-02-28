import { useState, useEffect, useCallback } from "react";
import {
  Award,
  CheckCircle,
  XCircle,
  Clock,
  Github,
  FileText,
  Trophy,
  Briefcase,
  ArrowLeft,
  RefreshCw,
  Shield,
  Star,
  Loader2,
  AlertCircle,
  ChevronRight,
  Sparkles,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import PortfolioSubmission from "@/components/profile/PortfolioSubmission";
import SkillChallenge from "@/components/profile/SkillChallenge";

// ────────────────────────────────────────────────────────────────────
// TYPES
// ────────────────────────────────────────────────────────────────────
interface SkillVerificationItem {
  _id: string;
  skillName: string;
  skillCategory: string;
  verificationType: string;
  status: "pending" | "verified" | "rejected" | "expired";
  verificationScore: number;
  level: string;
  verifiedAt?: string;
  expiresAt?: string;
  createdAt: string;
  challengeResult?: {
    score: number;
    passed: boolean;
    attempts: number;
    completedAt: string;
  };
  portfolioVerification?: {
    portfolioUrl: string;
    projectName: string;
    verifiedAt?: string;
  };
  githubVerification?: {
    username: string;
    totalRepos: number;
    totalContributions: number;
  };
}

type ActiveTab = "overview" | "challenge" | "portfolio" | "github";

// ────────────────────────────────────────────────────────────────────
// HELPER COMPONENTS
// ────────────────────────────────────────────────────────────────────
const getStatusIcon = (status: string) => {
  switch (status) {
    case "verified":
      return <CheckCircle className="w-4 h-4 text-emerald-400" />;
    case "pending":
      return <Clock className="w-4 h-4 text-amber-400" />;
    case "rejected":
      return <XCircle className="w-4 h-4 text-rose-400" />;
    default:
      return <AlertCircle className="w-4 h-4 text-gray-400" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "verified":
      return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
    case "pending":
      return "bg-amber-500/20 text-amber-300 border-amber-500/30";
    case "rejected":
      return "bg-rose-500/20 text-rose-300 border-rose-500/30";
    default:
      return "bg-gray-500/20 text-gray-300 border-gray-500/30";
  }
};

const getLevelColor = (level: string) => {
  switch (level) {
    case "expert":
      return "bg-violet-500/20 text-violet-300 border-violet-500/30";
    case "advanced":
      return "bg-blue-500/20 text-blue-300 border-blue-500/30";
    case "intermediate":
      return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
    default:
      return "bg-gray-500/20 text-gray-300 border-gray-500/30";
  }
};

const ScoreRing = ({
  score,
  size = 100,
  strokeWidth = 8,
}: {
  score: number;
  size?: number;
  strokeWidth?: number;
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color =
    score >= 80
      ? "#a78bfa"
      : score >= 60
        ? "#60a5fa"
        : score >= 40
          ? "#34d399"
          : "#fbbf24";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xl font-bold text-white">{score}</span>
      </div>
    </div>
  );
};

// ────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ────────────────────────────────────────────────────────────────────
const SkillsEvaluation = () => {
  const navigate = useNavigate();
  const [skills, setSkills] = useState<SkillVerificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchSkills = useCallback(async () => {
    setLoading(true);
    const response = await api.getMySkills();
    if (response.status === "success" && response.data) {
      setSkills(response.data as unknown as SkillVerificationItem[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills, refreshKey]);

  const verifiedCount = skills.filter((s) => s.status === "verified").length;
  const pendingCount = skills.filter((s) => s.status === "pending").length;
  const avgScore =
    skills.length > 0
      ? Math.round(
          skills.reduce((acc, s) => acc + s.verificationScore, 0) /
            skills.length
        )
      : 0;

  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Overview", icon: <Target className="w-4 h-4" /> },
    {
      id: "challenge",
      label: "Take Challenge",
      icon: <Trophy className="w-4 h-4" />,
    },
    {
      id: "portfolio",
      label: "Submit Portfolio",
      icon: <Briefcase className="w-4 h-4" />,
    },
    { id: "github", label: "GitHub", icon: <Github className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/6 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="text-slate-400 hover:text-white hover:bg-white/10 rounded-xl"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              Skill Verification
            </h1>
            <p className="text-sm text-slate-400 mt-1 ml-[52px]">
              Verify your skills to earn legitimacy badges
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setRefreshKey((k) => k + 1)}
            className="text-slate-400 hover:text-white hover:bg-white/10 rounded-xl"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {/* Score Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                  Verified Skills
                </p>
                <p className="text-3xl font-bold text-emerald-400">
                  {verifiedCount}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                  Pending Review
                </p>
                <p className="text-3xl font-bold text-amber-400">
                  {pendingCount}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-400" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                  Avg Score
                </p>
                <p className="text-3xl font-bold text-violet-400">{avgScore}%</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center">
                <Star className="w-6 h-6 text-violet-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                  : "text-slate-400 hover:text-white hover:bg-white/[0.06] border border-transparent"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-violet-400 animate-spin mb-4" />
            <p className="text-slate-400">Loading your skills...</p>
          </div>
        ) : activeTab === "overview" ? (
          <OverviewTab skills={skills} />
        ) : activeTab === "challenge" ? (
          <SkillChallenge onComplete={() => setRefreshKey((k) => k + 1)} />
        ) : activeTab === "portfolio" ? (
          <PortfolioSubmission onComplete={() => setRefreshKey((k) => k + 1)} />
        ) : activeTab === "github" ? (
          <GitHubTab onRefresh={() => setRefreshKey((k) => k + 1)} />
        ) : null}
      </div>
    </div>
  );
};

// ────────────────────────────────────────────────────────────────────
// OVERVIEW TAB
// ────────────────────────────────────────────────────────────────────
const OverviewTab = ({ skills }: { skills: SkillVerificationItem[] }) => {
  if (skills.length === 0) {
    return (
      <div className="rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-violet-500/10 flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8 text-violet-400" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">
          No Skills Verified Yet
        </h3>
        <p className="text-slate-400 max-w-md mx-auto">
          Start verifying your skills by taking a challenge, submitting a
          portfolio project, or connecting your GitHub profile.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {skills.map((skill) => (
        <div
          key={skill._id}
          className="rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] p-5 hover:bg-white/[0.06] transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <ScoreRing score={skill.verificationScore} size={56} strokeWidth={5} />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-semibold text-white capitalize">
                    {skill.skillName}
                  </h3>
                  <Badge
                    className={`text-xs border ${getStatusColor(
                      skill.status
                    )}`}
                  >
                    {getStatusIcon(skill.status)}
                    <span className="ml-1 capitalize">{skill.status}</span>
                  </Badge>
                  <Badge
                    className={`text-xs border ${getLevelColor(skill.level)}`}
                  >
                    {skill.level}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    {skill.verificationType === "github" && (
                      <Github className="w-3 h-3" />
                    )}
                    {skill.verificationType === "challenge" && (
                      <Trophy className="w-3 h-3" />
                    )}
                    {skill.verificationType === "portfolio" && (
                      <Briefcase className="w-3 h-3" />
                    )}
                    {skill.verificationType === "certificate" && (
                      <FileText className="w-3 h-3" />
                    )}
                    <span className="capitalize">{skill.verificationType}</span>
                  </span>
                  {skill.verifiedAt && (
                    <span>
                      Verified{" "}
                      {new Date(skill.verifiedAt).toLocaleDateString()}
                    </span>
                  )}
                  {skill.challengeResult && (
                    <span>
                      Challenge: {skill.challengeResult.score}% ({skill.challengeResult.attempts} attempts)
                    </span>
                  )}
                </div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-500" />
          </div>
        </div>
      ))}
    </div>
  );
};

// ────────────────────────────────────────────────────────────────────
// GITHUB TAB
// ────────────────────────────────────────────────────────────────────
const GitHubTab = ({ onRefresh }: { onRefresh: () => void }) => {
  const [loading, setLoading] = useState(true);
  const [githubData, setGithubData] = useState<{
    githubUsername: string;
    githubData: Record<string, unknown>;
  } | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const res = await api.getGitHubProfile();
      if (res.status === "success" && res.data) {
        setGithubData(res.data as unknown as { githubUsername: string; githubData: Record<string, unknown> });
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleConnect = async () => {
    if (!username.trim()) return;
    setConnecting(true);
    const res = await api.verifyGitHub(username.trim());
    if (res.status === "success") {
      onRefresh();
      const profileRes = await api.getGitHubProfile();
      if (profileRes.status === "success" && profileRes.data) {
        setGithubData(profileRes.data as unknown as { githubUsername: string; githubData: Record<string, unknown> });
      }
    }
    setConnecting(false);
  };

  const handleRefresh = async () => {
    if (!githubData?.githubUsername) return;
    setConnecting(true);
    const res = await api.refreshGitHub(githubData.githubUsername);
    if (res.status === "success") {
      onRefresh();
    }
    setConnecting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
      </div>
    );
  }

  if (githubData?.githubUsername) {
    const gh = githubData.githubData as Record<string, unknown>;
    return (
      <div className="space-y-4">
        <div className="rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                <Github className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  @{githubData.githubUsername}
                </h3>
                <p className="text-sm text-emerald-400 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Connected & Verified
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={handleRefresh}
              disabled={connecting}
              className="text-slate-400 hover:text-white hover:bg-white/[0.06]"
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${connecting ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Repos", value: (gh.totalRepos as number) || 0 },
              { label: "Contributions", value: (gh.totalContributions as number) || 0 },
              { label: "Followers", value: (gh.followers as number) || 0 },
              { label: "Following", value: (gh.following as number) || 0 },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl bg-white/[0.04] p-4 text-center"
              >
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-slate-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4">
          <p className="text-sm text-emerald-300 flex items-center gap-2">
            <Award className="w-4 h-4" />
            Skills from your GitHub repositories have been automatically verified
            and scored.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] p-8 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center mx-auto mb-4">
        <Github className="w-8 h-8 text-white" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">
        Connect Your GitHub
      </h3>
      <p className="text-slate-400 max-w-md mx-auto mb-6">
        Link your GitHub profile to automatically verify programming skills based
        on your repositories, contributions, and activity.
      </p>
      <div className="flex gap-3 max-w-sm mx-auto">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Your GitHub username"
          className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.1] text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50 text-sm"
          onKeyDown={(e) => e.key === "Enter" && handleConnect()}
        />
        <Button
          onClick={handleConnect}
          disabled={connecting || !username.trim()}
          className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl px-6"
        >
          {connecting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "Connect"
          )}
        </Button>
      </div>
    </div>
  );
};

export default SkillsEvaluation;
