// ============================================================================
// useMLInsights — Custom hook for ML API calls
// ============================================================================

import { useState, useCallback } from "react";

const API_URL = import.meta.env.VITE_API_URL;

interface SuccessPrediction {
  success_probability: number;
  recommendation: string;
  risk_level: string;
}

interface FakeDetection {
  is_fake: boolean;
  fake_probability: number;
  risk_level: string;
  red_flags: string[];
}

interface MatchFeatures {
  skill_score: number;
  semantic_score: number;
  context_score: number;
  maturity_score: number;
  behavior_score: number;
  budget_score: number;
}

interface MatchResult {
  freelancer_id: string;
  tlam_score: number;
  weighted_score: number;
  primary_score: number;
  features: MatchFeatures;
  skills: string[];
  rank: number;
  user?: {
    username: string;
    title: string;
    profilePictureUrl: string;
    location: string;
  };
}

interface MLHealthStatus {
  success: boolean;
  backend: { status: string };
  mlService: {
    available: boolean;
    available_models: string[];
  };
  allHealthy: boolean;
}

// ---------- Success Prediction ----------

export function useSuccessPrediction() {
  const [prediction, setPrediction] = useState<SuccessPrediction | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const predict = useCallback(
    async (freelancerId: string, projectId: string) => {
      setLoading(true);
      setError(null);
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
          setError(data.error || "Prediction failed");
        }
      } catch (err: any) {
        setError(err.message || "ML service unavailable");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { prediction, loading, error, predict };
}

// ---------- Fake Detection ----------

export function useFakeDetection() {
  const [result, setResult] = useState<FakeDetection | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const detect = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
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
        setError(data.error || "Detection failed");
      }
    } catch (err: any) {
      setError(err.message || "ML service unavailable");
    } finally {
      setLoading(false);
    }
  }, []);

  return { result, loading, error, detect };
}

// ---------- TLAM Matching ----------

export function useFreelancerMatching() {
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scoringMethod, setScoringMethod] = useState<string>("");

  const match = useCallback(
    async (
      projectId: string,
      options?: { scoring_method?: string; limit?: number }
    ) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_URL}/ml/match-freelancers`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId,
            scoring_method: options?.scoring_method || "tlam",
            limit: options?.limit || 10,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setMatches(data.matches || []);
          setScoringMethod(data.scoring_method || "tlam");
        } else {
          setError(data.error || "Matching failed");
        }
      } catch (err: any) {
        setError(err.message || "ML service unavailable");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { matches, loading, error, scoringMethod, match };
}

// ---------- ML Health ----------

export function useMLHealth() {
  const [health, setHealth] = useState<MLHealthStatus | null>(null);
  const [loading, setLoading] = useState(false);

  const checkHealth = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/ml/health`);
      const data = await res.json();
      setHealth(data);
    } catch {
      setHealth(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return { health, loading, checkHealth };
}

export type {
  SuccessPrediction,
  FakeDetection,
  MatchResult,
  MatchFeatures,
  MLHealthStatus,
};
