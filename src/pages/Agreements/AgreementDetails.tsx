import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { Agreement, User } from "@/types";
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
} from "lucide-react";
import { toast } from "sonner";

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
  const [isSaving, setIsSaving] = useState(false);
  
  // User role for this agreement (from API, not localStorage)
  const [userRole, setUserRole] = useState<string>("");

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
    }
    setLoading(false);
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
    </div>
  );
}
