import { useState, useEffect, useRef, useCallback } from "react";
import {
  Trophy,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Play,
  ChevronRight,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Target,
  AlertCircle,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";

interface Question {
  _id: string;
  question: string;
  options: Array<{ text: string; _id: string }>;
  difficulty: string;
  skillName: string;
}

interface ChallengeResult {
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  passed: boolean;
  results: Array<{
    questionId: string;
    question: string;
    selectedOptionId: string;
    correctOptionId: string;
    isCorrect: boolean;
    explanation: string;
  }>;
}

interface AvailableSkill {
  skillName: string;
  questionCount: number;
  difficulties: string[];
}

type Phase = "select" | "quiz" | "results";

const SkillChallenge = ({ onComplete }: { onComplete: () => void }) => {
  const [phase, setPhase] = useState<Phase>("select");
  const [availableSkills, setAvailableSkills] = useState<AvailableSkill[]>([]);
  const [loadingSkills, setLoadingSkills] = useState(true);

  // Quiz state
  const [selectedSkill, setSelectedSkill] = useState("");
  const [challengeId, setChallengeId] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLimit, setTimeLimit] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  // Results
  const [result, setResult] = useState<ChallengeResult | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoadingSkills(true);
      const res = await api.getAvailableChallenges();
      if (res.status === "success" && res.data) {
        setAvailableSkills(res.data.availableSkills);
      }
      setLoadingSkills(false);
    };
    load();
  }, []);

  // Timer
  useEffect(() => {
    if (phase === "quiz" && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const startChallenge = async (skillName: string) => {
    setLoadingQuestions(true);
    setSelectedSkill(skillName);
    const res = await api.getChallengeQuestions(skillName, 10);
    if (res.status === "success" && res.data) {
      setChallengeId(res.data.challengeId);
      setQuestions(res.data.questions);
      setTimeLimit(res.data.timeLimit);
      setTimeRemaining(res.data.timeLimit);
      setCurrentIndex(0);
      setAnswers({});
      startTimeRef.current = Date.now();
      setPhase("quiz");
    }
    setLoadingQuestions(false);
  };

  const selectAnswer = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);
    const timeTaken = Math.round((Date.now() - startTimeRef.current) / 1000);
    const res = await api.submitChallengeAnswers(
      selectedSkill,
      challengeId,
      answers,
      timeTaken
    );
    if (res.status === "success" && res.data) {
      setResult(res.data.challengeResult);
      setPhase("results");
      onComplete();
    }
    setSubmitting(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSkill, challengeId, answers, submitting]);

  const resetChallenge = () => {
    setPhase("select");
    setQuestions([]);
    setAnswers({});
    setResult(null);
    setChallengeId("");
    setSelectedSkill("");
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // ──────────── SKILL SELECT PHASE ────────────
  if (phase === "select") {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                Skill Challenges
              </h3>
              <p className="text-sm text-slate-400">
                Take a timed quiz to verify your expertise. Score 70%+ to pass.
              </p>
            </div>
          </div>

          {loadingSkills ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
            </div>
          ) : availableSkills.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-10 h-10 text-slate-500 mx-auto mb-3" />
              <p className="text-slate-400">
                No skill challenges are available yet. Check back soon!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {availableSkills.map((skill) => (
                <button
                  key={skill.skillName}
                  onClick={() => startChallenge(skill.skillName)}
                  disabled={loadingQuestions}
                  className="group flex items-center justify-between p-4 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] hover:border-violet-500/30 transition-all duration-200 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500/20 to-indigo-500/20 flex items-center justify-center">
                      <Target className="w-5 h-5 text-violet-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white capitalize">
                        {skill.skillName}
                      </p>
                      <p className="text-xs text-slate-400">
                        {skill.questionCount} questions ·{" "}
                        {skill.difficulties.join(", ")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {loadingQuestions && selectedSkill === skill.skillName ? (
                      <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4 text-slate-500 group-hover:text-violet-400 transition-colors" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl bg-violet-500/10 border border-violet-500/20 p-4">
          <p className="text-sm text-violet-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            You get 1 minute per question. Answers are graded server-side to
            ensure fairness.
          </p>
        </div>
      </div>
    );
  }

  // ──────────── QUIZ PHASE ────────────
  if (phase === "quiz" && questions.length > 0) {
    const currentQ = questions[currentIndex];
    const answeredCount = Object.keys(answers).length;
    const isLastQuestion = currentIndex === questions.length - 1;
    const timePercent = (timeRemaining / timeLimit) * 100;
    const isLowTime = timeRemaining < 60;

    return (
      <div className="space-y-4">
        {/* Progress header */}
        <div className="rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30">
                <Trophy className="w-3.5 h-3.5 mr-1" />
                {selectedSkill}
              </Badge>
              <span className="text-sm text-slate-400">
                Question {currentIndex + 1} of {questions.length}
              </span>
            </div>
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                isLowTime
                  ? "bg-rose-500/20 text-rose-300"
                  : "bg-white/[0.06] text-slate-300"
              }`}
            >
              <Clock className="w-4 h-4" />
              <span className="font-mono text-sm font-medium">
                {formatTime(timeRemaining)}
              </span>
            </div>
          </div>
          {/* Time bar */}
          <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-linear ${
                isLowTime ? "bg-rose-500" : "bg-violet-500"
              }`}
              style={{ width: `${timePercent}%` }}
            />
          </div>
          {/* Question dots */}
          <div className="flex gap-1.5 mt-3">
            {questions.map((q, i) => (
              <div
                key={q._id}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  i === currentIndex
                    ? "bg-violet-500"
                    : answers[q._id]
                      ? "bg-emerald-500/50"
                      : "bg-white/[0.1]"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Question card */}
        <div className="rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] p-6">
          <div className="flex items-center gap-2 mb-4">
            <Badge
              className={
                currentQ.difficulty === "advanced"
                  ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                  : currentQ.difficulty === "intermediate"
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                    : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
              }
            >
              {currentQ.difficulty}
            </Badge>
          </div>

          <h3 className="text-lg font-medium text-white mb-6 leading-relaxed">
            {currentQ.question}
          </h3>

          <div className="space-y-3">
            {currentQ.options.map((option, i) => {
              const isSelected = answers[currentQ._id] === option._id;
              return (
                <button
                  key={option._id}
                  onClick={() => selectAnswer(currentQ._id, option._id)}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl text-left transition-all duration-200 ${
                    isSelected
                      ? "bg-violet-500/20 border border-violet-500/40 text-white"
                      : "bg-white/[0.04] border border-white/[0.06] text-slate-300 hover:bg-white/[0.08] hover:border-white/[0.12]"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold shrink-0 ${
                      isSelected
                        ? "bg-violet-500 text-white"
                        : "bg-white/[0.08] text-slate-400"
                    }`}
                  >
                    {String.fromCharCode(65 + i)}
                  </div>
                  <span className="text-sm">{option.text}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
            className="text-slate-400 hover:text-white hover:bg-white/[0.06]"
          >
            Previous
          </Button>
          <span className="text-xs text-slate-500">
            {answeredCount}/{questions.length} answered
          </span>
          {isLastQuestion ? (
            <Button
              onClick={handleSubmit}
              disabled={submitting || answeredCount === 0}
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl px-6"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <ArrowRight className="w-4 h-4 mr-2" />
              )}
              Submit
            </Button>
          ) : (
            <Button
              onClick={() =>
                setCurrentIndex(
                  Math.min(questions.length - 1, currentIndex + 1)
                )
              }
              className="bg-white/[0.08] hover:bg-white/[0.12] text-white border border-white/[0.1] rounded-xl"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  // ──────────── RESULTS PHASE ────────────
  if (phase === "results" && result) {
    return (
      <div className="space-y-4">
        {/* Hero result */}
        <div
          className={`rounded-2xl backdrop-blur-xl border p-8 text-center ${
            result.passed
              ? "bg-emerald-500/10 border-emerald-500/20"
              : "bg-rose-500/10 border-rose-500/20"
          }`}
        >
          <div
            className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
              result.passed ? "bg-emerald-500/20" : "bg-rose-500/20"
            }`}
          >
            {result.passed ? (
              <Award className="w-10 h-10 text-emerald-400" />
            ) : (
              <XCircle className="w-10 h-10 text-rose-400" />
            )}
          </div>
          <h2
            className={`text-2xl font-bold mb-2 ${
              result.passed ? "text-emerald-300" : "text-rose-300"
            }`}
          >
            {result.passed ? "Challenge Passed!" : "Not Quite There"}
          </h2>
          <p className="text-5xl font-bold text-white mb-2">{result.score}%</p>
          <p className="text-sm text-slate-400">
            {result.correctAnswers} of {result.totalQuestions} correct
            {result.passed
              ? " — Your skill has been verified!"
              : " — You need 70% to pass. Try again!"}
          </p>
        </div>

        {/* Detailed results */}
        <div className="rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] p-6">
          <h3 className="text-base font-semibold text-white mb-4">
            Question Review
          </h3>
          <div className="space-y-3">
            {result.results.map((r, i) => (
              <div
                key={r.questionId}
                className={`rounded-xl p-4 border ${
                  r.isCorrect
                    ? "bg-emerald-500/5 border-emerald-500/20"
                    : "bg-rose-500/5 border-rose-500/20"
                }`}
              >
                <div className="flex items-start gap-3">
                  {r.isCorrect ? (
                    <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white mb-1">
                      <span className="text-slate-400 mr-2">Q{i + 1}.</span>
                      {r.question}
                    </p>
                    {r.explanation && (
                      <p className="text-xs text-slate-400 mt-1">
                        💡 {r.explanation}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={resetChallenge}
            variant="ghost"
            className="flex-1 text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-xl"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Try Another Skill
          </Button>
          {!result.passed && (
            <Button
              onClick={() => startChallenge(selectedSkill)}
              className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Retry {selectedSkill}
            </Button>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default SkillChallenge;
