import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { Milestone, MilestoneSummary, User } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Target,
  CheckCircle2,
  Clock,
  ArrowLeft,
  IndianRupee,
  Calendar,
  Upload,
  AlertTriangle,
  Loader2,
  Gift,
  AlertCircle,
  Play,
  Eye,
  RotateCcw,
  Sparkles,
  Timer,
  FileCheck,
  X,
} from "lucide-react";
import { toast } from "sonner";

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: {
    label: "Pending",
    color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    icon: <Clock className="h-4 w-4" />,
  },
  in_progress: {
    label: "In Progress",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    icon: <Play className="h-4 w-4" />,
  },
  submitted: {
    label: "Submitted",
    color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    icon: <Eye className="h-4 w-4" />,
  },
  confirmed: {
    label: "Confirmed",
    color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
  revision_requested: {
    label: "Revision Requested",
    color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    icon: <RotateCcw className="h-4 w-4" />,
  },
  released: {
    label: "Completed",
    color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
  disputed: {
    label: "Disputed",
    color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    icon: <AlertTriangle className="h-4 w-4" />,
  },
};

export default function MilestoneManager() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [summary, setSummary] = useState<MilestoneSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showRevisionDialog, setShowRevisionDialog] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  
  const [deliverables, setDeliverables] = useState<{ name: string; url: string }[]>([]);
  const [revisionNote, setRevisionNote] = useState("");

  const userRole = localStorage.getItem("role") || "client";

  useEffect(() => {
    if (projectId) {
      fetchMilestones();
    }
  }, [projectId]);

  const fetchMilestones = async () => {
    setLoading(true);
    const response = await api.getMilestones(projectId!);
    if (response.status === "success" && response.data) {
      setMilestones(response.data.milestones);
      setSummary(response.data.summary);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!selectedMilestone) return;
    if (deliverables.length === 0 || deliverables.some((d) => !d.name || !d.url)) {
      toast.error("Please add at least one deliverable with name and URL");
      return;
    }

    setProcessing(true);
    const response = await api.submitMilestone(
      selectedMilestone._id,
      deliverables.map((d) => ({ ...d, uploadedAt: new Date().toISOString() }))
    );
    if (response.status === "success") {
      setShowSubmitDialog(false);
      setDeliverables([]);
      fetchMilestones();
    }
    setProcessing(false);
  };

  const handleConfirm = async () => {
    if (!selectedMilestone) return;
    setProcessing(true);
    const response = await api.confirmMilestone(selectedMilestone._id);
    if (response.status === "success") {
      setShowConfirmDialog(false);
      fetchMilestones();
    }
    setProcessing(false);
  };

  const handleRequestRevision = async () => {
    if (!selectedMilestone) return;
    if (revisionNote.length < 20) {
      toast.error("Please provide detailed feedback (min 20 characters)");
      return;
    }
    setProcessing(true);
    const response = await api.requestMilestoneRevision(selectedMilestone._id, revisionNote);
    if (response.status === "success") {
      setShowRevisionDialog(false);
      setRevisionNote("");
      fetchMilestones();
    }
    setProcessing(false);
  };

  const addDeliverable = () => {
    setDeliverables([...deliverables, { name: "", url: "" }]);
  };

  const updateDeliverable = (index: number, field: "name" | "url", value: string) => {
    const updated = [...deliverables];
    updated[index][field] = value;
    setDeliverables(updated);
  };

  const removeDeliverable = (index: number) => {
    setDeliverables(deliverables.filter((_, i) => i !== index));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getDaysRemaining = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const progressPercent = summary
    ? (summary.releasedAmount / summary.totalAmount) * 100
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <Skeleton className="h-8 w-48" />
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4 -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Project Milestones
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  Track progress and deliverables
                </p>
              </div>
            </div>
          </div>

          {/* Progress Summary */}
          {summary && (
            <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  Overall Progress
                </span>
                <span className="text-sm font-medium">
                  {summary.completedMilestones} of {summary.totalMilestones} completed
                </span>
              </div>
              <Progress value={progressPercent} className="h-2" />
              <div className="flex justify-between mt-2 text-sm">
                <span className="text-slate-600 dark:text-slate-400">
                  Released: {formatCurrency(summary.releasedAmount)}
                </span>
                <span className="text-slate-600 dark:text-slate-400">
                  Pending: {formatCurrency(summary.pendingAmount)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {milestones.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-16 text-center">
              <Target className="h-12 w-12 mx-auto text-slate-400 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                No milestones yet
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Milestones will appear here once they're created for this project.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {milestones.map((milestone, index) => {
              const daysRemaining = getDaysRemaining(milestone.dueDate);
              const isOverdue = daysRemaining < 0 && !["released", "confirmed"].includes(milestone.status);
              const isEarlyDelivery = milestone.daysEarly > 0;

              return (
                <Card
                  key={milestone._id}
                  className={`overflow-hidden transition-all duration-200 ${
                    milestone.status === "in_progress"
                      ? "ring-2 ring-blue-400 dark:ring-blue-500"
                      : milestone.status === "submitted"
                      ? "ring-2 ring-amber-400 dark:ring-amber-500"
                      : ""
                  }`}
                >
                  <div
                    className={`h-1 ${
                      milestone.status === "released"
                        ? "bg-green-500"
                        : milestone.status === "submitted"
                        ? "bg-amber-500"
                        : milestone.status === "in_progress"
                        ? "bg-blue-500"
                        : "bg-slate-200 dark:bg-slate-700"
                    }`}
                  />
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div
                          className={`h-10 w-10 rounded-full flex items-center justify-center font-bold ${
                            milestone.status === "released"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                          }`}
                        >
                          {milestone.status === "released" ? (
                            <CheckCircle2 className="h-5 w-5" />
                          ) : (
                            milestone.milestoneNumber
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                              {milestone.title}
                            </h3>
                            <Badge className={statusConfig[milestone.status]?.color}>
                              {statusConfig[milestone.status]?.icon}
                              <span className="ml-1">{statusConfig[milestone.status]?.label}</span>
                            </Badge>
                            {isEarlyDelivery && milestone.status === "released" && (
                              <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                <Sparkles className="h-3 w-3 mr-1" />
                                +{milestone.daysEarly} days early
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                            {milestone.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                              <IndianRupee className="h-4 w-4" />
                              {formatCurrency(milestone.amount)}
                            </div>
                            <div
                              className={`flex items-center gap-1.5 ${
                                isOverdue
                                  ? "text-red-600 dark:text-red-400"
                                  : "text-slate-600 dark:text-slate-400"
                              }`}
                            >
                              <Calendar className="h-4 w-4" />
                              Due: {formatDate(milestone.dueDate)}
                              {isOverdue && <AlertTriangle className="h-3 w-3 ml-1" />}
                            </div>
                            {milestone.bonusAmount > 0 && (
                              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                                <Gift className="h-4 w-4" />
                                +{formatCurrency(milestone.bonusAmount)} bonus
                              </div>
                            )}
                            {milestone.penaltyAmount > 0 && (
                              <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
                                <AlertCircle className="h-4 w-4" />
                                -{formatCurrency(milestone.penaltyAmount)} penalty
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {userRole === "freelancer" && milestone.status === "in_progress" && (
                          <Button
                            onClick={() => {
                              setSelectedMilestone(milestone);
                              setShowSubmitDialog(true);
                            }}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Submit
                          </Button>
                        )}
                        {userRole === "freelancer" && milestone.status === "revision_requested" && (
                          <Button
                            onClick={() => {
                              setSelectedMilestone(milestone);
                              setShowSubmitDialog(true);
                            }}
                            variant="outline"
                          >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Resubmit
                          </Button>
                        )}
                        {userRole === "client" && milestone.status === "submitted" && (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setSelectedMilestone(milestone);
                                setShowRevisionDialog(true);
                              }}
                            >
                              <RotateCcw className="h-4 w-4 mr-2" />
                              Request Revision
                            </Button>
                            <Button
                              onClick={() => {
                                setSelectedMilestone(milestone);
                                setShowConfirmDialog(true);
                              }}
                              className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700"
                            >
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Confirm
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Deliverables */}
                    {milestone.deliverables?.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Deliverables
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {milestone.deliverables.map((d, i) => (
                            <a
                              key={i}
                              href={d.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            >
                              <FileCheck className="h-3.5 w-3.5" />
                              {d.name}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Auto-release timer */}
                    {milestone.status === "submitted" && milestone.autoReleaseScheduledAt && (
                      <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
                        <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-300">
                          <Timer className="h-4 w-4" />
                          <span>
                            Auto-release scheduled for{" "}
                            {formatDate(milestone.autoReleaseScheduledAt)} if no action taken
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Revision history */}
                    {milestone.revisionHistory?.length > 0 && (
                      <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Revision History ({milestone.revisionCount}/{milestone.maxRevisions})
                        </h4>
                        <div className="space-y-2">
                          {milestone.revisionHistory.slice(-2).map((revision, i) => (
                            <div key={i} className="text-sm text-slate-600 dark:text-slate-400">
                              <span className="font-medium">
                                {formatDate(revision.requestedAt)}:
                              </span>{" "}
                              {revision.note}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Submit Dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Submit Milestone
            </DialogTitle>
            <DialogDescription>
              Add your deliverables for "{selectedMilestone?.title}"
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {deliverables.map((d, index) => (
              <div key={index} className="flex items-end gap-2">
                <div className="flex-1 space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={d.name}
                    onChange={(e) => updateDeliverable(index, "name", e.target.value)}
                    placeholder="Design mockup"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <Label>URL</Label>
                  <Input
                    value={d.url}
                    onChange={(e) => updateDeliverable(index, "url", e.target.value)}
                    placeholder="https://..."
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeDeliverable(index)}
                  className="text-red-600"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" onClick={addDeliverable} className="w-full">
              Add Deliverable
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={processing}>
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Milestone"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              Confirm Milestone
            </DialogTitle>
            <DialogDescription>
              Confirming will release the payment for this milestone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Card className="bg-slate-50 dark:bg-slate-800/50">
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between">
                  <span>Milestone Amount</span>
                  <span>{formatCurrency(selectedMilestone?.amount || 0)}</span>
                </div>
                {selectedMilestone?.bonusAmount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Early Delivery Bonus</span>
                    <span>+{formatCurrency(selectedMilestone.bonusAmount)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total to Release</span>
                  <span>{formatCurrency(selectedMilestone?.finalAmount || 0)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={processing}
              className="bg-gradient-to-r from-emerald-600 to-green-600"
            >
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Confirming...
                </>
              ) : (
                "Confirm & Release"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revision Dialog */}
      <Dialog open={showRevisionDialog} onOpenChange={setShowRevisionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5" />
              Request Revision
            </DialogTitle>
            <DialogDescription>
              Provide feedback for the freelancer on what needs to be changed.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="revisionNote">Revision Details</Label>
            <Textarea
              id="revisionNote"
              value={revisionNote}
              onChange={(e) => setRevisionNote(e.target.value)}
              placeholder="Please describe what changes are needed..."
              className="mt-2 min-h-[100px]"
            />
            <p className="text-sm text-slate-500 mt-2">
              Revisions remaining: {selectedMilestone?.maxRevisions - (selectedMilestone?.revisionCount || 0)}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRevisionDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleRequestRevision} disabled={processing}>
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Requesting...
                </>
              ) : (
                "Request Revision"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
