// ============================================================================
// ProjectFitBadge — Shows freelancers how well a project suits their skills
// Includes actionable insights: strengths + improvement areas
// Now includes AI model detailing (SBERT + LR pipeline)
// ============================================================================

import { useState, useEffect } from "react";
import {
  Loader2,
  Sparkles,
  Target,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Lightbulb,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import ModelExplainer from "./ModelExplainer";
import type { ModelInfo } from "./ModelExplainer";

interface Strength {
  field: string;
  current: number;
  message: string;
}

interface Improvement {
  field: string;
  current: number;
  ideal: number;
  tip: string;
  severity: "high" | "medium";
}

interface Insights {
  summary: string;
  strengths: Strength[];
  improvements: Improvement[];
  total_strengths: number;
  total_improvements: number;
}

interface Props {
  projectId: string;
  variant?: "badge" | "detailed";
}

interface Prediction {
  success_probability: number;
  recommendation: string;
  risk_level: string;
  insights?: Insights;
}

const API_URL = import.meta.env.VITE_API_URL;

export default function ProjectFitBadge({
  projectId,
  variant = "badge",
}: Props) {
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (!projectId) return;

    const freelancerId = localStorage.getItem("Chatting_id");
    if (!freelancerId) return;

    const fetchFit = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/ml/predict-success`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ freelancerId, projectId }),
        });
        const data = await res.json();
        if (data.success) {
          setPrediction(data.prediction);
          if (data.model_info) {
            setModelInfo(data.model_info);
          }
        } else {
          setError(true);
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchFit();
  }, [projectId]);

  if (error) return null;
  if (loading) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <Loader2 className="h-3 w-3 animate-spin" />
        <span>Analyzing fit...</span>
      </div>
    );
  }
  if (!prediction) return null;

  const prob = prediction.success_probability;
  const isGreat = prob >= 75;
  const isGood = prob >= 50 && prob < 75;
  const insights = prediction.insights;

  // ── Detailed variant ── shown in the project detail dialog
  if (variant === "detailed") {
    return (
      <div className="space-y-3">
        {/* Score Header */}
        <div
          className={`rounded-xl border p-4 ${
            isGreat
              ? "bg-emerald-500/10 border-emerald-500/20"
              : isGood
                ? "bg-amber-500/10 border-amber-500/20"
                : "bg-rose-500/10 border-rose-500/20"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles
                className={`h-4 w-4 ${
                  isGreat
                    ? "text-emerald-400"
                    : isGood
                      ? "text-amber-400"
                      : "text-rose-400"
                }`}
              />
              <span className="text-sm font-semibold text-white">
                AI Project Fit Score
              </span>
            </div>
            <span
              className={`text-2xl font-bold ${
                isGreat
                  ? "text-emerald-400"
                  : isGood
                    ? "text-amber-400"
                    : "text-rose-400"
              }`}
            >
              {prob.toFixed(0)}%
            </span>
          </div>

          <Progress
            value={prob}
            className={`h-2 ${
              isGreat
                ? "[&>div]:bg-emerald-500"
                : isGood
                  ? "[&>div]:bg-amber-500"
                  : "[&>div]:bg-rose-500"
            }`}
          />

          {insights && (
            <p className="text-xs text-slate-400 mt-3">{insights.summary}</p>
          )}
        </div>

        {/* Insights Section */}
        {insights && (insights.improvements.length > 0 || insights.strengths.length > 0) && (
          <div className="space-y-3">
            {/* Improvements — what to work on */}
            {insights.improvements.length > 0 && (
              <div className="rounded-xl border border-amber-500/15 bg-amber-500/5 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="h-4 w-4 text-amber-400" />
                  <span className="text-sm font-semibold text-amber-300">
                    Areas to Improve ({insights.improvements.length})
                  </span>
                </div>
                <div className="space-y-3">
                  {insights.improvements.map((item, i) => (
                    <div
                      key={i}
                      className="flex gap-3 text-xs"
                    >
                      <div className="mt-0.5 flex-shrink-0">
                        {item.severity === "high" ? (
                          <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
                        ) : (
                          <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
                        )}
                      </div>
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">
                            {item.field}
                          </span>
                          <span className="text-slate-500">
                            {item.current} → {item.ideal} ideal
                          </span>
                        </div>
                        <p className="text-slate-400 leading-relaxed">
                          {item.tip}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Strengths — what's good */}
            {insights.strengths.length > 0 && (
              <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/5 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm font-semibold text-emerald-300">
                    Your Strengths ({insights.strengths.length})
                  </span>
                </div>
                <div className="space-y-2">
                  {insights.strengths.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-semibold text-white">
                          {item.field}
                        </span>
                        <span className="text-slate-400 ml-1.5">
                          — {item.message}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* AI Model Details */}
        <ModelExplainer
          modelInfo={modelInfo}
          variant="inline"
          showWeights={true}
        />
      </div>
    );
  }

  // ── Badge variant ── shown on project cards (compact)
  const colorClasses = isGreat
    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/15"
    : isGood
      ? "bg-amber-500/10 text-amber-400 border-amber-500/15"
      : "bg-rose-500/10 text-rose-400 border-rose-500/15";

  const Icon = isGreat ? Target : isGood ? Sparkles : AlertCircle;
  const label = isGreat ? "Great Fit" : isGood ? "Good Fit" : "Low Fit";

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium ${colorClasses}`}
    >
      <Icon className="h-3 w-3" />
      <span>
        {label} · {prob.toFixed(0)}%
      </span>
    </div>
  );
}
