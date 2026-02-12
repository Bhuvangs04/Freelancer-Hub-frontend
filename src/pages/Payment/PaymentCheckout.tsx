import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "@/lib/api";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CreditCard,
  Shield,
  CheckCircle2,
  ArrowLeft,
  IndianRupee,
  Lock,
  FileText,
  AlertCircle,
  Loader2,
  Wallet,
  BadgeCheck,
} from "lucide-react";
import { toast } from "sonner";

// Razorpay types
declare global {
  interface Window {
    Razorpay: any;
  }
}

interface ProjectDetails {
  _id: string;
  title: string;
  description: string;
  budget: number;
  deadline: string;
  clientId: string;
  freelancerId?: string;
  status: string;
}


export default function PaymentCheckout() {
  const { projectId } = useParams<{ projectId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [escrowId, setEscrowId] = useState<string | null>(null);
  const { platformCommissionPercent, siteName } = useSiteSettings();

  const bidAmount = searchParams.get("amount")
    ? Number(searchParams.get("amount"))
    : null;

  const amount = bidAmount ?? project?.budget ?? 0;
  const platformFee = Math.round(amount * (platformCommissionPercent / 100));
  const totalAmount = amount + platformFee;

  useEffect(() => {
    if (projectId) {
      fetchProject();
      loadRazorpayScript();
    }
  }, [projectId]);

  const fetchProject = async () => {
    setLoading(true);
    const response = await api.getProject(projectId!);
    if (response.status === "success" && response.data) {
      setProject(response.data as any);
    }
    setLoading(false);
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = useCallback(async () => {
    if (!project) return;

    setProcessing(true);

    try {
      // Create payment order
      const orderResponse = await api.createPaymentOrder(
        totalAmount * 100, // Convert to paise
        projectId!
      );

      if (orderResponse.status !== "success" || !orderResponse.data) {
        toast.error("Failed to create payment order");
        setProcessing(false);
        return;
      }

      const order = orderResponse.data;

      // Initialize Razorpay
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: siteName,
        description: `Payment for: ${project.title}`,
        order_id: order.id,
        handler: async function (response: any) {
          // Verify payment on backend
          const verifyResponse = await api.verifyPayment(
            response.razorpay_order_id,
            response.razorpay_payment_id,
            response.razorpay_signature,
            projectId!
          );

          if (verifyResponse.status === "success") {
            setPaymentSuccess(true);
            setEscrowId(verifyResponse.data?._id || null);
            toast.success("Payment successful! Funds are now in escrow.");
          } else {
            toast.error("Payment verification failed");
          }
          setProcessing(false);
        },
        modal: {
          ondismiss: function () {
            setProcessing(false);
          },
        },
        prefill: {
          email: localStorage.getItem("email") || "",
        },
        theme: {
          color: "#7C3AED",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", function (response: any) {
        toast.error(`Payment failed: ${response.error.description}`);
        setProcessing(false);
      });
      razorpay.open();
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Something went wrong. Please try again.");
      setProcessing(false);
    }
  }, [project, projectId, totalAmount]);

  const formatCurrency = (amt: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amt);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-xl">
          <CardContent className="p-8">
            <Skeleton className="h-8 w-48 mb-6" />
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-950 dark:to-green-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-xl overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-emerald-500 to-green-500" />
          <CardContent className="p-8 text-center">
            <div className="h-20 w-20 rounded-full bg-emerald-100 dark:bg-emerald-900/50 mx-auto mb-6 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Payment Successful!
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Your payment of {formatCurrency(totalAmount)} has been processed successfully.
              The funds are now held securely in escrow.
            </p>
            
            <Card className="bg-slate-50 dark:bg-slate-800/50 mb-6">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  <div className="text-left">
                    <p className="font-semibold text-slate-900 dark:text-white">
                      Funds Protected in Escrow
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Payment will be released to freelancer upon project completion
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-left">
                    <p className="text-slate-500">Project Amount</p>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {formatCurrency(amount)}
                    </p>
                  </div>
                  <div className="text-left">
                    <p className="text-slate-500">Platform Fee</p>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {formatCurrency(platformFee)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => navigate("/my-projects")}
                className="flex-1"
              >
                View Projects
              </Button>
              <Button
                onClick={() => navigate(`/agreements`)}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700"
              >
                View Agreement
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Project Not Found</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Unable to load project details for payment.
            </p>
            <Button onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
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
            onClick={() => navigate(-1)}
            className="mb-4 -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Secure Checkout
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Fund your project escrow
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Project Details */}
          <div className="lg:col-span-3 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Project Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  {project.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 line-clamp-3">
                  {project.description}
                </p>
                <div className="mt-4 flex items-center gap-4">
                  <Badge variant="outline" className="gap-1">
                    <IndianRupee className="h-3 w-3" />
                    Budget: {formatCurrency(project.budget)}
                  </Badge>
                  <Badge variant="outline">
                    Deadline: {new Date(project.deadline).toLocaleDateString("en-IN")}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Security Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-emerald-600" />
                  Secure Escrow Protection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <Lock className="h-5 w-5 text-violet-600 dark:text-violet-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">
                        Funds Held Securely
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Money is released only after you approve the work
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <BadgeCheck className="h-5 w-5 text-violet-600 dark:text-violet-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">
                        Milestone Payments
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Pay for completed milestones only
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <Wallet className="h-5 w-5 text-violet-600 dark:text-violet-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">
                        Refund Protection
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Get a full refund if the project is cancelled
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <Shield className="h-5 w-5 text-violet-600 dark:text-violet-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">
                        Dispute Resolution
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Fair arbitration if issues arise
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Summary */}
          <div className="lg:col-span-2">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Payment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">
                      Project Amount
                    </span>
                    <span className="font-medium">{formatCurrency(amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">
                      Platform Fee ({platformCommissionPercent}%)
                    </span>
                    <span className="font-medium">{formatCurrency(platformFee)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold text-violet-600 dark:text-violet-400">
                      {formatCurrency(totalAmount)}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handlePayment}
                  disabled={processing}
                  className="w-full h-12 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-lg"
                >
                  {processing ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock className="h-5 w-5 mr-2" />
                      Pay {formatCurrency(totalAmount)}
                    </>
                  )}
                </Button>

                <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <Lock className="h-3 w-3" />
                  Secured by Razorpay
                </div>

                <div className="flex items-center justify-center gap-4 pt-4">
                  <img
                    src="https://razorpay.com/favicon.png"
                    alt="Razorpay"
                    className="h-6 opacity-50"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
