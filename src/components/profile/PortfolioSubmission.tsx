import { useState } from "react";
import {
  Briefcase,
  Link as LinkIcon,
  FileText,
  Image,
  Loader2,
  CheckCircle,
  Sparkles,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { toast } from "sonner";

const PortfolioSubmission = ({
  onComplete,
}: {
  onComplete: () => void;
}) => {
  const [skillName, setSkillName] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [screenshotUrl, setScreenshotUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const canSubmit =
    skillName.trim() &&
    portfolioUrl.trim() &&
    isValidUrl(portfolioUrl) &&
    !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    const res = await api.submitPortfolio(skillName.trim(), portfolioUrl.trim(), {
      projectName: projectName.trim() || "Portfolio Project",
      description: description.trim() || "",
      screenshotUrl: screenshotUrl.trim() || undefined,
    });
    if (res.status === "success") {
      setSubmitted(true);
      onComplete();
    }
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-emerald-400" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">
          Portfolio Submitted!
        </h3>
        <p className="text-slate-400 max-w-md mx-auto mb-6">
          Your portfolio for <strong className="text-white">{skillName}</strong>{" "}
          has been submitted and is awaiting admin review. You&apos;ll be
          notified once it&apos;s verified.
        </p>
        <Button
          onClick={() => {
            setSubmitted(false);
            setSkillName("");
            setPortfolioUrl("");
            setProjectName("");
            setDescription("");
            setScreenshotUrl("");
          }}
          variant="ghost"
          className="text-violet-400 hover:text-violet-300 hover:bg-violet-500/10"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Submit Another
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              Portfolio Verification
            </h3>
            <p className="text-sm text-slate-400">
              Submit a portfolio project as evidence of your skill. An admin will
              review it.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Skill Name */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Skill Name *
            </label>
            <input
              type="text"
              value={skillName}
              onChange={(e) => setSkillName(e.target.value)}
              placeholder="e.g. React, Python, UI Design..."
              className="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.1] text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50 text-sm"
            />
          </div>

          {/* Portfolio URL */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              <LinkIcon className="w-3.5 h-3.5 inline mr-1" />
              Portfolio / Project URL *
            </label>
            <input
              type="url"
              value={portfolioUrl}
              onChange={(e) => setPortfolioUrl(e.target.value)}
              placeholder="https://github.com/username/project or https://yourportfolio.com"
              className={`w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border text-white placeholder:text-slate-500 focus:outline-none text-sm ${
                portfolioUrl && !isValidUrl(portfolioUrl)
                  ? "border-rose-500/50 focus:border-rose-500/50"
                  : "border-white/[0.1] focus:border-violet-500/50"
              }`}
            />
            {portfolioUrl && !isValidUrl(portfolioUrl) && (
              <p className="text-xs text-rose-400 mt-1">Please enter a valid URL</p>
            )}
          </div>

          {/* Project Name */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              <FileText className="w-3.5 h-3.5 inline mr-1" />
              Project Name
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g. E-commerce Dashboard"
              className="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.1] text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50 text-sm"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this project demonstrates about your skill..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.1] text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50 text-sm resize-none"
            />
          </div>

          {/* Screenshot URL */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              <Image className="w-3.5 h-3.5 inline mr-1" />
              Screenshot URL (optional)
            </label>
            <input
              type="url"
              value={screenshotUrl}
              onChange={(e) => setScreenshotUrl(e.target.value)}
              placeholder="https://i.imgur.com/screenshot.png"
              className="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.1] text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50 text-sm"
            />
          </div>

          {/* Submit button */}
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl py-2.5 disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            Submit for Review
          </Button>
        </div>
      </div>

      <div className="rounded-xl bg-indigo-500/10 border border-indigo-500/20 p-4">
        <p className="text-sm text-indigo-300 flex items-start gap-2">
          <Briefcase className="w-4 h-4 shrink-0 mt-0.5" />
          Portfolios are reviewed by admins and can earn up to 15 verification
          points. Include a live project URL or GitHub repo with quality code samples.
        </p>
      </div>
    </div>
  );
};

export default PortfolioSubmission;
