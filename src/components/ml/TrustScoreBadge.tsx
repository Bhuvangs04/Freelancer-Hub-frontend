// ============================================================================
// TrustScoreBadge — Shows AI fake detection result as a trust score
// Inverts fake_probability to show "Trust Score" (positive framing)
// ============================================================================

import { useState, useEffect } from "react";
import { Loader2, ShieldCheck, ShieldAlert, AlertTriangle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Props {
  userId: string;
  variant?: "badge" | "detailed";
}

interface Detection {
  is_fake: boolean;
  fake_probability: number;
  risk_level: string;
  red_flags: string[];
}

const API_URL = import.meta.env.VITE_API_URL;

export default function TrustScoreBadge({ userId, variant = "badge" }: Props) {
  const [result, setResult] = useState<Detection | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const fetchDetection = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/ml/detect-fake`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });
        const data = await res.json();
        if (data.success) {
          setResult(data.prediction);
        } else {
          setError(true);
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchDetection();
  }, [userId]);

  if (error) return null;
  if (loading) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-xs">
        <Loader2 className="h-3 w-3 animate-spin" />
        <span>Checking...</span>
      </div>
    );
  }
  if (!result) return null;

  const trustScore = 100 - result.fake_probability;
  const isGenuine = trustScore >= 80;
  const isSuspicious = trustScore < 50;

  if (variant === "detailed") {
    return (
      <div
        className={`rounded-xl border p-4 space-y-3 ${
          isGenuine
            ? "bg-emerald-50/50 border-emerald-200"
            : isSuspicious
              ? "bg-red-50/50 border-red-200"
              : "bg-amber-50/50 border-amber-200"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isGenuine ? (
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
            ) : isSuspicious ? (
              <ShieldAlert className="h-5 w-5 text-red-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            )}
            <span className="font-semibold text-sm">
              AI Profile Trust Score
            </span>
          </div>
          <span
            className={`text-2xl font-bold ${
              isGenuine
                ? "text-emerald-600"
                : isSuspicious
                  ? "text-red-600"
                  : "text-amber-600"
            }`}
          >
            {trustScore.toFixed(0)}%
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-out ${
              isGenuine
                ? "bg-emerald-500"
                : isSuspicious
                  ? "bg-red-500"
                  : "bg-amber-500"
            }`}
            style={{ width: `${trustScore}%` }}
          />
        </div>

        <p className="text-xs text-muted-foreground">
          {isGenuine
            ? "This profile appears genuine with consistent activity."
            : isSuspicious
              ? "This profile shows suspicious patterns. Review carefully."
              : "This profile has some areas that could be improved."}
        </p>

        {result.red_flags.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-red-600">
              Concerns detected:
            </p>
            <ul className="text-xs text-red-500 space-y-0.5">
              {result.red_flags.map((flag, i) => (
                <li key={i} className="flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-red-400" />
                  {flag}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  // Badge variant (compact)
  const colorClasses = isGenuine
    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : isSuspicious
      ? "bg-red-50 text-red-700 border-red-200"
      : "bg-amber-50 text-amber-700 border-amber-200";

  const Icon = isGenuine
    ? ShieldCheck
    : isSuspicious
      ? ShieldAlert
      : AlertTriangle;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium cursor-help transition-all hover:scale-105 ${colorClasses}`}
        >
          <Icon className="h-3 w-3" />
          <span>Trust: {trustScore.toFixed(0)}%</span>
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <div className="space-y-1">
          <p className="font-semibold">AI Profile Trust Score</p>
          <p className="text-sm">
            {isGenuine
              ? "Profile appears genuine"
              : isSuspicious
                ? "Profile shows suspicious patterns"
                : "Profile needs improvement"}
          </p>
          {result.red_flags.length > 0 && (
            <p className="text-xs text-red-500">
              {result.red_flags.length} concern(s) found
            </p>
          )}
          <p className="text-[10px] text-muted-foreground/70 border-t border-border/50 pt-1 mt-1">
            Powered by ML Profile Classifier
          </p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
