// ============================================================================
// ModelExplainer — Reusable "How does our AI work?" component
// Shows the SBERT + Logistic Regression + Weighted Scoring pipeline
// ============================================================================

import { useState } from "react";
import {
  Brain,
  ChevronDown,
  ChevronUp,
  Cpu,
  Layers,
  ArrowRight,
  Zap,
  Info,
} from "lucide-react";

interface ModelComponent {
  name: string;
  role: string;
}

interface ModelInfo {
  name: string;
  components: ModelComponent[];
  description: string;
  pipeline: string[];
  weights?: Record<string, number>;
}

interface Props {
  modelInfo?: ModelInfo | null;
  variant?: "inline" | "card" | "minimal";
  defaultExpanded?: boolean;
  showWeights?: boolean;
}

// Default model info when API doesn't return it (for static display)
const DEFAULT_MODEL_INFO: ModelInfo = {
  name: "SBERT + Logistic Regression Hybrid",
  components: [
    {
      name: "SBERT (all-MiniLM-L6-v2)",
      role: "Semantic text matching between freelancer profile and project description",
    },
    {
      name: "Logistic Regression",
      role: "Learns feature importance weights from historical hiring data",
    },
    {
      name: "Weighted Scoring",
      role: "Combines all features using learned weights for final prediction",
    },
  ],
  description:
    "Uses sentence embeddings (SBERT) to understand profile-project fit, then applies learned feature weights from Logistic Regression to predict success probability.",
  pipeline: [
    "Profile & Project Text → SBERT Embeddings → Cosine Similarity",
    "Features Extracted → Logistic Regression Weights → Weighted Score",
    "Score Thresholding → Success Probability",
  ],
  weights: {
    skill_score: 0.349,
    semantic_score: 0.244,
    context_score: 0.15,
    maturity_score: 0.148,
    behavior_score: 0.075,
    budget_score: 0.034,
  },
};

const WEIGHT_LABELS: Record<string, string> = {
  skill_score: "Skill Match",
  semantic_score: "Semantic Fit",
  context_score: "Skill Breadth",
  maturity_score: "Experience",
  behavior_score: "Reliability",
  budget_score: "Budget Fit",
};

const WEIGHT_COLORS: Record<string, string> = {
  skill_score: "bg-violet-500",
  semantic_score: "bg-indigo-500",
  context_score: "bg-cyan-500",
  maturity_score: "bg-amber-500",
  behavior_score: "bg-emerald-500",
  budget_score: "bg-rose-400",
};

const COMPONENT_ICONS = [Brain, Cpu, Layers];

export default function ModelExplainer({
  modelInfo,
  variant = "card",
  defaultExpanded = false,
  showWeights = true,
}: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const info = modelInfo || DEFAULT_MODEL_INFO;

  // ── Minimal variant: just a small "Powered by" pill ──
  if (variant === "minimal") {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-violet-500/10 text-violet-400 text-[10px] font-medium border border-violet-500/10">
        <Brain className="h-3 w-3" />
        <span>Powered by {info.name}</span>
      </div>
    );
  }

  // ── Inline variant: compact collapsible section ──
  if (variant === "inline") {
    return (
      <div className="space-y-2">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-xs text-slate-400 hover:text-violet-400 transition-colors group"
        >
          <Info className="h-3 w-3" />
          <span>How this score is calculated</span>
          {expanded ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )}
        </button>

        {expanded && (
          <div className="rounded-lg border border-white/[0.06] bg-slate-800/40 p-3 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Model name */}
            <div className="flex items-center gap-2">
              <Brain className="h-3.5 w-3.5 text-violet-400" />
              <span className="text-xs font-semibold text-white">
                {info.name}
              </span>
            </div>

            {/* Pipeline steps */}
            <div className="space-y-1.5">
              {info.pipeline.map((step, i) => (
                <div key={i} className="flex items-start gap-2 text-[11px]">
                  <div className="flex-shrink-0 mt-0.5 h-4 w-4 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center text-[9px] font-bold">
                    {i + 1}
                  </div>
                  <span className="text-slate-400">{step}</span>
                </div>
              ))}
            </div>

            {/* Weights */}
            {showWeights && info.weights && (
              <div className="space-y-1.5 pt-1 border-t border-white/[0.04]">
                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">
                  Feature Weights (Learned)
                </span>
                {Object.entries(info.weights)
                  .sort(([, a], [, b]) => b - a)
                  .map(([key, val]) => (
                    <div key={key} className="space-y-0.5">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-slate-400">
                          {WEIGHT_LABELS[key] || key.replace(/_/g, " ")}
                        </span>
                        <span className="text-slate-500 font-mono">
                          {(val * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-1 rounded-full bg-slate-700 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ease-out ${
                            WEIGHT_COLORS[key] || "bg-violet-500"
                          }`}
                          style={{ width: `${val * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // ── Card variant: full detailed card ──
  return (
    <div className="rounded-xl border border-white/[0.06] bg-slate-800/40 overflow-hidden">
      {/* Header — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-violet-500/20 to-indigo-500/20 flex items-center justify-center">
            <Brain className="h-3.5 w-3.5 text-violet-400" />
          </div>
          <div className="text-left">
            <p className="text-xs font-semibold text-white">AI Model Details</p>
            <p className="text-[10px] text-slate-500">{info.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-slate-500">
            {expanded ? "Hide" : "View"}
          </span>
          {expanded ? (
            <ChevronUp className="h-3.5 w-3.5 text-slate-500" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
          )}
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-white/[0.04] pt-4 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Description */}
          <p className="text-xs text-slate-400 leading-relaxed">
            {info.description}
          </p>

          {/* Pipeline visualization */}
          <div className="space-y-2">
            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">
              Pipeline
            </span>
            <div className="flex flex-col gap-2">
              {info.components.map((comp, i) => {
                const Icon = COMPONENT_ICONS[i] || Zap;
                return (
                  <div key={i} className="flex items-start gap-0">
                    <div className="flex items-center gap-2.5 flex-1 p-2.5 rounded-lg bg-slate-700/30 border border-white/[0.04]">
                      <div
                        className={`flex-shrink-0 h-7 w-7 rounded-lg flex items-center justify-center ${
                          i === 0
                            ? "bg-violet-500/15 text-violet-400"
                            : i === 1
                              ? "bg-indigo-500/15 text-indigo-400"
                              : "bg-cyan-500/15 text-cyan-400"
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold text-white truncate">
                          {comp.name}
                        </p>
                        <p className="text-[10px] text-slate-500 leading-snug">
                          {comp.role}
                        </p>
                      </div>
                    </div>
                    {i < info.components.length - 1 && (
                      <div className="flex-shrink-0 flex items-center justify-center w-6 self-center">
                        <ArrowRight className="h-3 w-3 text-slate-600 rotate-90 sm:rotate-0" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Feature weights */}
          {showWeights && info.weights && (
            <div className="space-y-2 pt-1">
              <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">
                Learned Feature Weights
              </span>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {Object.entries(info.weights)
                  .sort(([, a], [, b]) => b - a)
                  .map(([key, val]) => (
                    <div key={key} className="space-y-0.5">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-slate-400">
                          {WEIGHT_LABELS[key] || key.replace(/_/g, " ")}
                        </span>
                        <span className="text-slate-500 font-mono">
                          {(val * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-700 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ease-out ${
                            WEIGHT_COLORS[key] || "bg-violet-500"
                          }`}
                          style={{ width: `${val * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export type { ModelInfo };
