import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { Agreement, User, Milestone, MilestoneInput, MilestoneSummary } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FileText,
  CheckCircle2,
  Clock,
  Shield,
  AlertTriangle,
  ArrowLeft,
  PenLine,
  Calendar,
  IndianRupee,
  User as UserIcon,
  Hash,
  XCircle,
  Edit3,
  Loader2,
  Send,
  Save,
  ScrollText,
  StarHalf,
  Target,
  Layers,
  Plus,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import SubmitReviewDialog from "@/components/modals/SubmitReviewDialog";

export default function AgreementDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [agreement, setAgreement] = useState<Agreement | null>(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [showSignDialog, setShowSignDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showAmendDialog, setShowAmendDialog] = useState(false);
  const [showTermsDialog, setShowTermsDialog] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [amendAmount, setAmendAmount] = useState<number>(0);
  const [amendReason, setAmendReason] = useState("");
  
  // Edit mode state for draft agreements
  const [isEditMode, setIsEditMode] = useState(false);
  const [editDeliverables, setEditDeliverables] = useState("");
  const [editDeadline, setEditDeadline] = useState("");
  const [editAmount, setEditAmount] = useState<number>(0);
  const [editDescription, setEditDescription] = useState("");
  const [editPaymentType, setEditPaymentType] = useState<"project_completion" | "milestone">("project_completion");
  const [isSaving, setIsSaving] = useState(false);
  
  // Review state
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [isReviewPending, setIsReviewPending] = useState(false);
  
  // User role for this agreement (from API, not localStorage)
  const [userRole, setUserRole] = useState<string>("");

  // Milestone management state
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [milestoneSummary, setMilestoneSummary] = useState<MilestoneSummary | null>(null);
  const [showMilestoneDialog, setShowMilestoneDialog] = useState(false);
  const [milestoneEntries, setMilestoneEntries] = useState<MilestoneInput[]>([
    { title: "", description: "", amount: 0, dueDate: "" },
  ]);
  const [isCreatingMilestones, setIsCreatingMilestones] = useState(false);

  useEffect(() => {
    if (id) {
      fetchAgreement();
    }
  }, [id]);

  const fetchAgreement = async () => {
    setLoading(true);
    const response = await api.getAgreement(id!);
    console.log("Agreement API response:", response);
    if (response.status === "success" && response.data) {
      console.log("Agreement:", response.data.agreement);
      console.log("User Role from API:", response.data.userRole);
      console.log("Agreement Status:", response.data.agreement?.status);
      setAgreement(response.data.agreement);
      setUserRole(response.data.userRole);
      setAmendAmount(response.data.agreement.agreedAmount);
      // Initialize edit fields
      setEditDeliverables(response.data.agreement.deliverables);
      setEditDeadline(response.data.agreement.deadline?.split('T')[0] || "");
      setEditAmount(response.data.agreement.agreedAmount);
      setEditDescription(response.data.agreement.projectDescription);
      setEditPaymentType(response.data.agreement.paymentType || "project_completion");

      // Fetch milestones if milestone-based payment
      if (response.data.agreement.paymentType === "milestone" && response.data.agreement.status === "active") {
        const projId = typeof response.data.agreement.projectId === "object"
          ? (response.data.agreement.projectId as any)._id
          : response.data.agreement.projectId;
        fetchMilestones(projId);
      }

      if (response.data.agreement.status === "completed") {
        const reviewRes = await api.getPendingReviews();
        if (reviewRes.status === "success" && reviewRes.data) {
          const isPending = reviewRes.data.some((a: any) => a.agreementId === id || a._id === id);
          setIsReviewPending(isPending);
        }
      }
    }
    setLoading(false);
  };

  const fetchMilestones = async (projectId: string) => {
    const res = await api.getMilestones(projectId);
    if (res.status === "success" && res.data) {
      setMilestones(res.data.milestones);
      setMilestoneSummary(res.data.summary);
    }
  };

  const handleSign = async () => {
    if (!termsAccepted) {
      toast.error("Please accept the terms to proceed");
      return;
    }

    setSigning(true);
    const response = userRole === "client"
      ? await api.signAgreementAsClient(id!)
      : await api.signAgreementAsFreelancer(id!);

    if (response.status === "success") {
      setShowSignDialog(false);
      fetchAgreement();
    }
    setSigning(false);
  };

  const handleCancel = async () => {
    if (cancelReason.length < 10) {
      toast.error("Please provide a reason (min 10 characters)");
      return;
    }

    setSigning(true);
    const response = await api.cancelAgreement(id!, cancelReason);
    if (response.status === "success") {
      setShowCancelDialog(false);
      fetchAgreement();
    }
    setSigning(false);
  };

  const handleAmend = async () => {
    if (amendReason.length < 10) {
      toast.error("Please provide a reason for the amendment (min 10 characters)");
      return;
    }

    if (amendAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setSigning(true);
    const response = await api.amendAgreement(id!, amendAmount, amendReason);
    if (response.status === "success") {
      setShowAmendDialog(false);
      toast.success("Amendment created. The agreement needs to be re-signed.");
      navigate(`/agreements/${response.data?._id}`);
    }
    setSigning(false);
  };

  const handleEditSave = async () => {
    setIsSaving(true);
    const response = await api.editAgreement(id!, {
      deliverables: editDeliverables,
      deadline: editDeadline,
      agreedAmount: editAmount,
      projectDescription: editDescription,
      paymentType: editPaymentType,
    });
    if (response.status === "success") {
      setIsEditMode(false);
      fetchAgreement();
    }
    setIsSaving(false);
  };

  const handleSendForSigning = async () => {
    setSigning(true);
    const response = await api.sendAgreementForSigning(id!);
    if (response.status === "success") {
      fetchAgreement();
    }
    setSigning(false);
  };

  const canSign = () => {
    if (!agreement) return false;
    if (userRole === "client" && agreement.status === "pending_client") return true;
    if (userRole === "freelancer" && agreement.status === "pending_freelancer") return true;
    return false;
  };

  const canCancel = () => {
    if (!agreement) return false;
    return (
      userRole === "client" &&
      (agreement.status === "draft" || agreement.status === "pending_client" || agreement.status === "pending_freelancer")
    );
  };

  const canAmend = () => {
    if (!agreement) return false;
    return (
      userRole === "client" &&
      ["pending_client", "pending_freelancer", "active"].includes(agreement.status)
    );
  };

  const isInDraftMode = () => {
    if (!agreement) return false;
    return userRole === "client" && agreement.status === "draft";
  };

  const canSendForSigning = () => {
    if (!agreement) return false;
    return userRole === "client" && agreement.status === "draft";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getClientName = () => {
    if (!agreement) return "Client";
    return typeof agreement.clientId === "object"
      ? (agreement.clientId as User).username
      : "Client";
  };

  const getFreelancerName = () => {
    if (!agreement) return "Freelancer";
    return typeof agreement.freelancerId === "object"
      ? (agreement.freelancerId as User).username
      : "Freelancer";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-8 w-48" />
          <Card>
            <CardContent className="p-8">
              <div className="space-y-4">
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-32 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!agreement) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Agreement Not Found</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              This agreement doesn't exist or you don't have access to view it.
            </p>
            <Button onClick={() => navigate("/agreements")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Agreements
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/agreements")}
            className="mb-4 -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Agreements
          </Button>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Agreement #{agreement.agreementNumber}
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400">
                    Version {agreement.version}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isInDraftMode() && !isEditMode && (
                <Button variant="outline" onClick={() => setIsEditMode(true)}>
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
              {isInDraftMode() && isEditMode && (
                <>
                  <Button variant="outline" onClick={() => setIsEditMode(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleEditSave} disabled={isSaving}>
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save Changes
                  </Button>
                </>
              )}
              {canSendForSigning() && !isEditMode && (
                <Button
                  onClick={handleSendForSigning}
                  disabled={signing}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  {signing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Send for Signing
                </Button>
              )}
              {canAmend() && (
                <Button variant="outline" onClick={() => setShowAmendDialog(true)}>
                  <Edit3 className="h-4 w-4 mr-2" />
                  Amend
                </Button>
              )}
              {/* Show Terms button - always visible */}
              <Button
                variant="outline"
                onClick={() => setShowTermsDialog(true)}
              >
                <ScrollText className="h-4 w-4 mr-2" />
                Show Terms
              </Button>
              {canCancel() && !isEditMode && (
                <Button
                  variant="outline"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                  onClick={() => setShowCancelDialog(true)}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              )}
              {canSign() && (
                <Button
                  onClick={() => setShowSignDialog(true)}
                  className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
                >
                  <PenLine className="h-4 w-4 mr-2" />
                  Sign Agreement
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6">
          {/* Pending Review Banner */}
          {isReviewPending && (
            <Card className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
              <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/50 flex flex-shrink-0 items-center justify-center">
                    <StarHalf className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-amber-900 dark:text-amber-300">
                      Submit a Review
                    </h3>
                    <p className="text-sm text-amber-700 dark:text-amber-400/80">
                      The project is complete. Please review {userRole === "client" ? getFreelancerName() : getClientName()} to help the community.
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={() => setShowReviewDialog(true)}
                  className="bg-amber-500 hover:bg-amber-600 text-white w-full sm:w-auto"
                >
                  Write Review
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Draft Mode Banner */}
          {isInDraftMode() && (
            <Card className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-950/30 dark:to-gray-950/30 border-slate-200 dark:border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-900/50 flex items-center justify-center">
                    <Edit3 className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                      Draft Agreement - Review & Edit
                    </h3>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      Review the terms, edit if needed, then send to the freelancer for signing.
                    </p>
                  </div>
                  {!isEditMode && (
                    <Button
                      onClick={handleSendForSigning}
                      disabled={signing}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    >
                      {signing ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4 mr-2" />
                      )}
                      Send for Signing
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Status Banner */}
          {canSign() && (
            <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                    <PenLine className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-amber-900 dark:text-amber-100">
                      Your signature is required
                    </h3>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      Please review the agreement terms and sign to proceed.
                    </p>
                  </div>
                  <Button
                    onClick={() => setShowSignDialog(true)}
                    className="bg-amber-600 hover:bg-amber-700"
                  >
                    Sign Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Project Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Project Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                  {agreement.projectTitle}
                </h3>
                <p className="mt-2 text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                  {agreement.projectDescription}
                </p>
              </div>
              <Separator />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Agreed Amount</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                    <IndianRupee className="h-4 w-4" />
                    {formatCurrency(agreement.agreedAmount).replace("₹", "")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Platform Fee</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">
                    {formatCurrency(agreement.platformFee)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Total Amount</p>
                  <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(agreement.totalAmount)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Deadline</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(agreement.deadline).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              {/* Payment Type */}
              <Separator />
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  Payment Release Strategy
                </p>
                {isEditMode ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div
                      onClick={() => setEditPaymentType("project_completion")}
                      className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${
                        editPaymentType === "project_completion"
                          ? "border-violet-500 bg-violet-50 dark:bg-violet-950/30"
                          : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                          editPaymentType === "project_completion"
                            ? "bg-violet-100 dark:bg-violet-900/50"
                            : "bg-slate-100 dark:bg-slate-800"
                        }`}>
                          <CheckCircle2 className={`h-4 w-4 ${
                            editPaymentType === "project_completion"
                              ? "text-violet-600 dark:text-violet-400"
                              : "text-slate-500"
                          }`} />
                        </div>
                        <h4 className="font-semibold text-sm">After Project Completion</h4>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Full payment released when the entire project is completed and approved.
                      </p>
                    </div>
                    <div
                      onClick={() => setEditPaymentType("milestone")}
                      className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${
                        editPaymentType === "milestone"
                          ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30"
                          : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                          editPaymentType === "milestone"
                            ? "bg-emerald-100 dark:bg-emerald-900/50"
                            : "bg-slate-100 dark:bg-slate-800"
                        }`}>
                          <Target className={`h-4 w-4 ${
                            editPaymentType === "milestone"
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-slate-500"
                          }`} />
                        </div>
                        <h4 className="font-semibold text-sm">Milestone-Based</h4>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Payment released incrementally as each milestone is confirmed.
                      </p>
                    </div>
                  </div>
                ) : (
                  <Badge className={`text-sm py-1.5 px-3 ${
                    agreement.paymentType === "milestone"
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                      : "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400"
                  }`}>
                    {agreement.paymentType === "milestone" ? (
                      <><Target className="h-3.5 w-3.5 mr-1.5" /> Milestone-Based Payment</>
                    ) : (
                      <><CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Payment After Project Completion</>
                    )}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Parties */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <UserIcon className="h-4 w-4" />
                  Client
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {getClientName()}
                </p>
                {typeof agreement.clientId === "object" && (
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {(agreement.clientId as User).email}
                  </p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <UserIcon className="h-4 w-4" />
                  Freelancer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {getFreelancerName()}
                </p>
                {typeof agreement.freelancerId === "object" && (
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {(agreement.freelancerId as User).email}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Signature Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Signature Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Client Signature */}
                <div
                  className={`p-4 rounded-xl border-2 ${
                    agreement.clientSignature.signed
                      ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800"
                      : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    {agreement.clientSignature.signed ? (
                      <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Clock className="h-6 w-6 text-slate-400" />
                    )}
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        Client Signature
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {getClientName()}
                      </p>
                    </div>
                  </div>
                  {agreement.clientSignature.signed ? (
                    <div className="space-y-1 text-sm">
                      <p className="text-emerald-700 dark:text-emerald-300">
                        ✓ Signed on{" "}
                        {formatDate(agreement.clientSignature.signedAt!)}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Awaiting signature
                    </p>
                  )}
                </div>

                {/* Freelancer Signature */}
                <div
                  className={`p-4 rounded-xl border-2 ${
                    agreement.freelancerSignature.signed
                      ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800"
                      : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    {agreement.freelancerSignature.signed ? (
                      <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Clock className="h-6 w-6 text-slate-400" />
                    )}
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        Freelancer Signature
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {getFreelancerName()}
                      </p>
                    </div>
                  </div>
                  {agreement.freelancerSignature.signed ? (
                    <div className="space-y-1 text-sm">
                      <p className="text-emerald-700 dark:text-emerald-300">
                        ✓ Signed on{" "}
                        {formatDate(agreement.freelancerSignature.signedAt!)}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {agreement.clientSignature.signed
                        ? "Awaiting freelancer signature"
                        : "Will sign after client"}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Milestone Management Section */}
          {agreement.paymentType === "milestone" && agreement.status === "active" && (
            <>
              {milestones.length === 0 && userRole === "client" ? (
                /* Setup Milestones Banner */
                <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-emerald-200 dark:border-emerald-800 overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                        <Target className="h-7 w-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-100">
                          Set Up Milestones
                        </h3>
                        <p className="text-sm text-emerald-700 dark:text-emerald-300">
                          Split your project into milestones to release payments incrementally.
                          Milestone amounts must total {formatCurrency(agreement.agreedAmount)}.
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => setShowMilestoneDialog(true)}
                      className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 w-full sm:w-auto"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Milestones
                    </Button>
                  </CardContent>
                </Card>
              ) : milestones.length === 0 && userRole === "freelancer" ? (
                /* Freelancer waiting for milestones */
                <Card className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-slate-400" />
                      <div>
                        <h3 className="font-semibold text-slate-700 dark:text-slate-200">Awaiting Milestone Setup</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          The client needs to define milestones for this project. You'll be notified when milestones are ready.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : milestones.length > 0 ? (
                /* Milestones Overview Card */
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Milestones
                      </CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const projId = typeof agreement.projectId === "object"
                            ? (agreement.projectId as any)._id
                            : agreement.projectId;
                          navigate(`/projects/${projId}/milestones`);
                        }}
                      >
                        <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                        View Full Details
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Summary bar */}
                    {milestoneSummary && (
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-slate-600 dark:text-slate-400">
                            {milestoneSummary.released} of {milestoneSummary.total} completed
                          </span>
                          <span className="text-slate-600 dark:text-slate-400">
                            Released: {formatCurrency(milestoneSummary.releasedAmount)}
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-emerald-500 to-green-500 h-2 rounded-full transition-all"
                            style={{ width: `${milestoneSummary.totalAmount > 0 ? (milestoneSummary.releasedAmount / milestoneSummary.totalAmount) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Milestone list */}
                    <div className="space-y-2">
                      {milestones.map((m) => (
                        <div key={m._id} className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 dark:border-slate-700/50">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm ${
                            m.status === "released"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : m.status === "in_progress"
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                              : m.status === "submitted"
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                          }`}>
                            {m.status === "released" ? <CheckCircle2 className="h-4 w-4" /> : m.milestoneNumber}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate text-slate-900 dark:text-white">{m.title}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{formatCurrency(m.amount)}</p>
                          </div>
                          <Badge className={`text-xs ${
                            m.status === "released"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : m.status === "in_progress"
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                              : m.status === "submitted"
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                              : m.status === "confirmed"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                          }`}>
                            {m.status.replace("_", " ")}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : null}
            </>
          )}

          {/* Agreement Hash */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Hash className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      Agreement Content Hash
                    </p>
                    <p className="text-xs font-mono text-slate-500 dark:text-slate-500">
                      {agreement.contentHash}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="gap-1">
                  <Shield className="h-3 w-3" />
                  Tamper-Proof
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Sign Dialog */}
      <Dialog open={showSignDialog} onOpenChange={setShowSignDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PenLine className="h-5 w-5" />
              Sign Agreement
            </DialogTitle>
            <DialogDescription>
              Review the binding terms below before signing. This is a legally binding agreement.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto">
            {/* Agreement Summary */}
            <Card className="bg-slate-50 dark:bg-slate-800/50">
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Project</span>
                  <span className="font-medium">{agreement.projectTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Amount</span>
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(agreement.agreedAmount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Deadline</span>
                  <span className="font-medium">
                    {new Date(agreement.deadline).toLocaleDateString("en-IN")}
                  </span>
                </div>
                {agreement.contentHash && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-slate-500 font-mono">
                      Hash: {agreement.contentHash.substring(0, 20)}...
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Role-specific Rules */}
            <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
              <CardContent className="p-4">
                <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-3 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Binding Terms & Conditions
                </h4>
                
                {userRole === "freelancer" && (
                  <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="mt-1">•</span>
                      <span>By signing, you commit to delivering the specified work as per the deliverables outlined in this agreement.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1">•</span>
                      <span>The agreed amount of <strong>{formatCurrency(agreement.agreedAmount)}</strong> is final and cannot be changed after signing.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1">•</span>
                      <span>You must complete the work by the deadline: <strong>{new Date(agreement.deadline).toLocaleDateString("en-IN")}</strong>.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1">•</span>
                      <span>Disputes may be raised against you if the agreed terms are not met.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1">•</span>
                      <span>Payment will be released only after successful completion and client approval.</span>
                    </li>
                  </ul>
                )}

                {userRole === "client" && (
                  <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="mt-1">•</span>
                      <span>By signing, you confirm the freelancer has agreed to the terms and the project will officially begin.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1">•</span>
                      <span>The funds in escrow will be synchronized with the agreed amount of <strong>{formatCurrency(agreement.agreedAmount)}</strong>.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1">•</span>
                      <span>If the escrow amount exceeds the agreement amount, the difference will be refunded to you automatically.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1">•</span>
                      <span>This agreement is legally binding and serves as the ultimate source of truth for this project.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1">•</span>
                      <span>Any modifications require a new amendment that both parties must sign again.</span>
                    </li>
                  </ul>
                )}
              </CardContent>
            </Card>

            {/* Integrity Verification */}
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3">
              <p className="text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                This agreement is tamper-proof and verified using cryptographic hashing
              </p>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-3 pt-2">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
              />
              <label htmlFor="terms" className="text-sm text-slate-600 dark:text-slate-400">
                I have read and understand all the terms above. I confirm that this constitutes my legally binding digital signature and I accept full responsibility for my obligations under this agreement.
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSignDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSign}
              disabled={!termsAccepted || signing}
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
            >
              {signing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Signing...
                </>
              ) : (
                <>
                  <PenLine className="h-4 w-4 mr-2" />
                  Sign Agreement
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="h-5 w-5" />
              Cancel Agreement
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. The agreement will be cancelled and the freelancer's bid will be marked as "Agreement Cancelled". 
              They will be able to see this status and may choose to bid on the project again if you re-open it.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="cancelReason">Reason for cancellation</Label>
            <Textarea
              id="cancelReason"
              placeholder="Please provide a reason..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Keep Agreement
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={signing}
            >
              {signing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Cancel Agreement"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Amend Dialog */}
      <Dialog open={showAmendDialog} onOpenChange={setShowAmendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit3 className="h-5 w-5" />
              Amend Agreement
            </DialogTitle>
            <DialogDescription>
              Creating an amendment will require both parties to sign the agreement again.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <Label htmlFor="amendAmount">New Amount (₹)</Label>
              <Input
                id="amendAmount"
                type="number"
                value={amendAmount}
                onChange={(e) => setAmendAmount(Number(e.target.value))}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="amendReason">Reason for amendment</Label>
              <Textarea
                id="amendReason"
                placeholder="Explain why you're amending this agreement..."
                value={amendReason}
                onChange={(e) => setAmendReason(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAmendDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAmend} disabled={signing}>
              {signing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Amendment"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Terms & Conditions Dialog */}
      <Dialog open={showTermsDialog} onOpenChange={setShowTermsDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ScrollText className="h-5 w-5" />
              Agreement Terms & Conditions
            </DialogTitle>
            <DialogDescription>
              These terms govern the agreement between client and freelancer on this platform.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-900 dark:text-white">1. Agreement Binding</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                This agreement is legally binding once both parties (client and freelancer) have digitally signed it. 
                By signing, each party confirms they have read, understood, and agree to all terms outlined herein.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-slate-900 dark:text-white">2. Escrow & Payment</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                All project funds are held in escrow. Upon full completion of the project and mutual agreement, 
                the funds will be released to the freelancer. The agreed amount specified in this agreement 
                serves as the ultimate source of truth for payment.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-slate-900 dark:text-white">3. Project Scope & Deliverables</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                The freelancer agrees to deliver all work as described in the project scope and deliverables 
                within the specified deadline. Any changes to scope must be mutually agreed upon and may 
                require a new amendment to this agreement.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-slate-900 dark:text-white">4. Amendments</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Any modifications to the agreed amount, deadline, or scope require creating an amendment. 
                Amendments must be signed by both parties to take effect. Previous signatures become void 
                upon amendment creation.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-slate-900 dark:text-white">5. Cancellation</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Either party may request cancellation before project completion. Cancellation requests 
                are subject to review, and escrow funds will be distributed based on work completed 
                and platform policies.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-slate-900 dark:text-white">6. Disputes</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                In case of disputes, either party may initiate the dispute resolution process. 
                The platform will review all evidence and make a binding decision on fund distribution 
                and project status.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-slate-900 dark:text-white">7. Platform Fee</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                A platform service fee is applied to all transactions. This fee is calculated based on 
                the agreed project amount and is transparently shown in the agreement details.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-slate-900 dark:text-white">8. Digital Signature</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Digital signatures on this platform are legally recognized. Each signature is timestamped, 
                cryptographically verified, and tied to the signer's account. By signing, you acknowledge 
                that your digital signature carries the same legal weight as a handwritten signature.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowTermsDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SubmitReviewDialog
        open={showReviewDialog}
        onOpenChange={setShowReviewDialog}
        agreementId={agreement._id}
        projectTitle={agreement.projectDescription || "Project"}
        revieweeName={userRole === "client" ? getFreelancerName() : getClientName()}
        onSuccess={() => {
          setIsReviewPending(false);
          setShowReviewDialog(false);
          fetchAgreement();
        }}
      />

      {/* Create Milestones Dialog */}
      <Dialog open={showMilestoneDialog} onOpenChange={setShowMilestoneDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-emerald-600" />
              Create Milestones
            </DialogTitle>
            <DialogDescription>
              Split the project into milestones. Amounts must total{" "}
              <strong>{agreement ? formatCurrency(agreement.agreedAmount) : ""}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {milestoneEntries.map((entry, idx) => (
              <Card key={idx} className="relative">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-500">Milestone {idx + 1}</span>
                    {milestoneEntries.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-500 hover:text-red-700"
                        onClick={() => {
                          setMilestoneEntries(milestoneEntries.filter((_, i) => i !== idx));
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Title</Label>
                      <Input
                        placeholder="e.g. Design Phase"
                        value={entry.title}
                        onChange={(e) => {
                          const updated = [...milestoneEntries];
                          updated[idx] = { ...updated[idx], title: e.target.value };
                          setMilestoneEntries(updated);
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Amount (₹)</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={entry.amount || ""}
                        onChange={(e) => {
                          const updated = [...milestoneEntries];
                          updated[idx] = { ...updated[idx], amount: Number(e.target.value) };
                          setMilestoneEntries(updated);
                        }}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Description</Label>
                    <Textarea
                      placeholder="What will be delivered in this milestone..."
                      className="min-h-[60px]"
                      value={entry.description}
                      onChange={(e) => {
                        const updated = [...milestoneEntries];
                        updated[idx] = { ...updated[idx], description: e.target.value };
                        setMilestoneEntries(updated);
                      }}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Due Date</Label>
                    <Input
                      type="date"
                      value={entry.dueDate}
                      onChange={(e) => {
                        const updated = [...milestoneEntries];
                        updated[idx] = { ...updated[idx], dueDate: e.target.value };
                        setMilestoneEntries(updated);
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}

            <Button
              variant="outline"
              onClick={() => setMilestoneEntries([...milestoneEntries, { title: "", description: "", amount: 0, dueDate: "" }])}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Milestone
            </Button>

            {/* Amount summary */}
            <Card className="bg-slate-50 dark:bg-slate-800/50">
              <CardContent className="p-3">
                <div className="flex justify-between text-sm">
                  <span>Total Milestone Amount</span>
                  <span className={`font-semibold ${
                    Math.abs(milestoneEntries.reduce((s, m) => s + (m.amount || 0), 0) - (agreement?.agreedAmount || 0)) < 0.01
                      ? "text-emerald-600" : "text-red-600"
                  }`}>
                    {formatCurrency(milestoneEntries.reduce((s, m) => s + (m.amount || 0), 0))}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Agreement Amount</span>
                  <span className="font-semibold">{agreement ? formatCurrency(agreement.agreedAmount) : ""}</span>
                </div>
                {Math.abs(milestoneEntries.reduce((s, m) => s + (m.amount || 0), 0) - (agreement?.agreedAmount || 0)) > 0.01 && (
                  <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Milestone amounts must equal the agreement amount
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMilestoneDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                // Validate
                const total = milestoneEntries.reduce((s, m) => s + (m.amount || 0), 0);
                if (Math.abs(total - (agreement?.agreedAmount || 0)) > 0.01) {
                  toast.error("Milestone amounts must equal the agreement amount");
                  return;
                }
                for (let i = 0; i < milestoneEntries.length; i++) {
                  const m = milestoneEntries[i];
                  if (!m.title || !m.description || !m.amount || !m.dueDate) {
                    toast.error(`Milestone ${i + 1}: all fields are required`);
                    return;
                  }
                }
                setIsCreatingMilestones(true);
                const res = await api.createMilestones(agreement!._id, milestoneEntries);
                if (res.status === "success") {
                  setShowMilestoneDialog(false);
                  setMilestoneEntries([{ title: "", description: "", amount: 0, dueDate: "" }]);
                  // Refresh milestones
                  const projId = typeof agreement!.projectId === "object"
                    ? (agreement!.projectId as any)._id
                    : agreement!.projectId;
                  fetchMilestones(projId);
                }
                setIsCreatingMilestones(false);
              }}
              disabled={isCreatingMilestones}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
            >
              {isCreatingMilestones ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating...</>
              ) : (
                <><Target className="h-4 w-4 mr-2" /> Create Milestones</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
