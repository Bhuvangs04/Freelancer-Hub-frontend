// ============================================================================
// AIMatchPanel — Shows TLAM matching results for a project
// Used in the Freelancer Finder page (Client side)
// Now includes AI model detailing (SBERT + LR + TLAM pipeline)
// ============================================================================

import { useState } from "react";
import { Loader2, Sparkles, Star, Trophy, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { MatchResult } from "@/hooks/useMLInsights";
import ModelExplainer from "./ModelExplainer";
import type { ModelInfo } from "./ModelExplainer";

const API_URL = import.meta.env.VITE_API_URL;

// Feature weight labels + descriptions for the expanded view
const FEATURE_INFO: Record<string, { label: string; tooltip: string }> = {
  skill_score: { label: "Skill Match", tooltip: "Overlap between freelancer skills and project requirements" },
  semantic_score: { label: "Semantic Fit", tooltip: "SBERT-powered text similarity between profile and project" },
  context_score: { label: "Skill Breadth", tooltip: "Diversity of the freelancer's skill set" },
  maturity_score: { label: "Experience", tooltip: "Years of professional experience (normalized)" },
  behavior_score: { label: "Reliability", tooltip: "Success rate and interaction quality" },
  budget_score: { label: "Budget Fit", tooltip: "How well the freelancer's rate fits the project budget" },
};

// Learned weights from Logistic Regression (for weight annotations)
const LEARNED_WEIGHTS: Record<string, number> = {
  skill_score: 0.349,
  semantic_score: 0.244,
  context_score: 0.150,
  maturity_score: 0.148,
  behavior_score: 0.075,
  budget_score: 0.034,
};

interface Project {
  _id: string;
  title: string;
  skillsRequired?: string[];
}

interface Props {
  projects: Project[];
}

export default function AIMatchPanel({ projects }: Props) {
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [scoringMethod, setScoringMethod] = useState<string>("tlam");
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [methodDesc, setMethodDesc] = useState<string>("");
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);

  const handleMatch = async () => {
    if (!selectedProject) return;
    setLoading(true);
    setError(null);
    setMatches([]);

    try {
      const res = await fetch(`${API_URL}/ml/match-freelancers`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: selectedProject,
          scoring_method: scoringMethod,
          limit: 10,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMatches(data.matches || []);
        setMethodDesc(data.scoring_method_description || "");
        if (data.model_info) {
          setModelInfo(data.model_info);
        }
      } else {
        setError(data.error || "Matching failed");
      }
    } catch (err: any) {
      setError("ML service unavailable. Make sure the ML API is running.");
    } finally {
      setLoading(false);
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Trophy className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Trophy className="h-5 w-5 text-amber-700" />;
    return (
      <span className="h-5 w-5 flex items-center justify-center text-xs font-bold text-slate-500">
        #{rank}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-indigo-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-50 to-violet-50 px-5 py-4 border-b border-indigo-100">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="h-5 w-5 text-indigo-600" />
          <h3 className="font-semibold text-indigo-900">AI Freelancer Matching</h3>
        </div>
        <p className="text-xs text-indigo-600/70">
          Find the best freelancers using SBERT + Logistic Regression
        </p>
      </div>

      {/* Controls */}
      <div className="p-4 space-y-3">
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-600">Select Project</label>
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose a project..." />
            </SelectTrigger>
            <SelectContent>
              {projects.map((p) => (
                <SelectItem key={p._id} value={p._id}>
                  {p.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-600">Scoring Model</label>
          <Select value={scoringMethod} onValueChange={setScoringMethod}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tlam">
                TLAM — Strict matching (strict skill match)
              </SelectItem>
              <SelectItem value="weighted_sum">
                Weighted Sum — Lenient (partial matches)
              </SelectItem>
            </SelectContent>
          </Select>
          {/* Scoring method explanation */}
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
            <p className="text-[10px] text-slate-500 leading-relaxed">
              {scoringMethod === "tlam" ? (
                <>
                  <span className="font-semibold text-slate-700">TLAM</span>: Multiplicative formula (C<sup>α</sup>)(R<sup>β</sup>)(A<sup>γ</sup>). Score drops to 0 if no skill overlap — ensures only truly matching freelancers rank high.
                </>
              ) : (
                <>
                  <span className="font-semibold text-slate-700">Weighted Sum</span>: Linear formula Σ(w<sub>i</sub> × f<sub>i</sub>). Always gives partial scores based on other factors even with no skill match — good for discovering potential fits.
                </>
              )}
            </p>
          </div>
        </div>

        <Button
          onClick={handleMatch}
          disabled={!selectedProject || loading}
          className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Find Best Matches
            </>
          )}
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-4 mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Results */}
      {matches.length > 0 && (
        <div className="border-t border-indigo-100">
          <div className="px-4 py-3 bg-slate-50 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">
              {matches.length} match{matches.length !== 1 ? "es" : ""} found
            </span>
            <div className="flex items-center gap-2">
              {methodDesc && (
                <span className="text-xs text-slate-500">{scoringMethod.toUpperCase()}</span>
              )}
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600 text-[10px] font-medium border border-indigo-100">
                SBERT + LR
              </span>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {matches.map((m) => {
              const isExpanded = expandedId === m.freelancer_id;
              const score = m.primary_score;
              const scorePercent = Math.min(score * 100, 100);

              return (
                <div key={m.freelancer_id} className="px-4 py-3">
                  <div
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() =>
                      setExpandedId(isExpanded ? null : m.freelancer_id)
                    }
                  >
                    {getRankBadge(m.rank)}

                    {/* User info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {m.user?.profilePictureUrl && (
                          <img
                            src={m.user.profilePictureUrl}
                            alt=""
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            {m.user?.username || `Freelancer ${m.freelancer_id}`}
                          </p>
                          {m.user?.title && (
                            <p className="text-xs text-slate-500 truncate">
                              {m.user.title}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Score */}
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="text-sm font-bold text-indigo-700">
                          {(score * 100).toFixed(1)}%
                        </div>
                        <div className="text-[10px] text-slate-400">
                          match score
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="mt-3 ml-8 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                      {/* Skills */}
                      <div className="flex flex-wrap gap-1.5">
                        {m.skills.map((s) => (
                          <Badge
                            key={s}
                            variant="secondary"
                            className="text-xs"
                          >
                            {s}
                          </Badge>
                        ))}
                      </div>

                      {/* Feature breakdown with weight annotations */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                          Feature Breakdown
                        </span>
                        {Object.entries(m.features).map(([key, val]) => {
                          const weight = LEARNED_WEIGHTS[key];
                          const featureLabel = FEATURE_INFO[key]?.label || key.replace(/_/g, " ");
                          return (
                            <div key={key} className="space-y-0.5">
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-600 capitalize flex items-center gap-1.5">
                                  {featureLabel}
                                  {weight && (
                                    <span className="text-[9px] text-slate-400 font-mono bg-slate-100 px-1 rounded">
                                      w={(weight * 100).toFixed(0)}%
                                    </span>
                                  )}
                                </span>
                                <span className="font-medium">
                                  {(val * 100).toFixed(0)}%
                                </span>
                              </div>
                              <Progress
                                value={val * 100}
                                className="h-1.5"
                              />
                            </div>
                          );
                        })}
                      </div>

                      {/* Both scores */}
                      <div className="flex gap-4 text-xs text-slate-500 pt-1">
                        <span>
                          TLAM: <strong>{(m.tlam_score * 100).toFixed(1)}%</strong>
                        </span>
                        <span>
                          Weighted: <strong>{(m.weighted_score * 100).toFixed(1)}%</strong>
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Model Details Section at bottom */}
          <div className="border-t border-indigo-100 p-4 bg-slate-50/50">
            <ModelExplainer
              modelInfo={modelInfo}
              variant="card"
              showWeights={true}
            />
          </div>
        </div>
      )}
    </div>
  );
}
