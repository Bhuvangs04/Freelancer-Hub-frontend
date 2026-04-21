// ============================================================================
// SuccessScoreBadge — Shows AI success prediction on bid cards
// ============================================================================

import { useState, useEffect } from "react";
import { Loader2, TrendingUp, TrendingDown, Minus } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Props {
  freelancerId: string;
  projectId: string;
}

interface Prediction {
  success_probability: number;
  recommendation: string;
  risk_level: string;
}

const API_URL = import.meta.env.VITE_API_URL;

export default function SuccessScoreBadge({ freelancerId, projectId }: Props) {
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!freelancerId || !projectId) return;

    const fetchPrediction = async () => {
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
        } else {
          setError(true);
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPrediction();
  }, [freelancerId, projectId]);

  if (error) return null; // Silently hide if ML service is down
  if (loading) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-xs">
        <Loader2 className="h-3 w-3 animate-spin" />
        <span>AI Score</span>
      </div>
    );
  }
  if (!prediction) return null;

  const prob = prediction.success_probability;
  const isHigh = prob >= 75;
  const isMedium = prob >= 50 && prob < 75;

  const colorClasses = isHigh
    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : isMedium
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : "bg-red-50 text-red-700 border-red-200";

  const Icon = isHigh ? TrendingUp : isMedium ? Minus : TrendingDown;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium cursor-help transition-all hover:scale-105 ${colorClasses}`}
        >
          <Icon className="h-3 w-3" />
          <span>AI: {prob.toFixed(0)}%</span>
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <div className="space-y-1">
          <p className="font-semibold">AI Success Prediction</p>
          <p className="text-sm">
            {prediction.recommendation}
          </p>
          <p className="text-xs text-muted-foreground">
            Risk Level: {prediction.risk_level}
          </p>
          <p className="text-[10px] text-muted-foreground/70 border-t border-border/50 pt-1 mt-1">
            Powered by SBERT + Logistic Regression
          </p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
