import { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import api from "./api.disputes";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/**
 * Razorpay payment‑link callback page.
 * After the user pays the arbitration fee, Razorpay redirects here with
 * ?razorpay_payment_id=xxx&razorpay_payment_link_id=xxx&razorpay_payment_link_status=paid
 *
 * This component calls POST /dispute/:id/confirm-payment to transition the
 * dispute from "pending_payment" → "open".
 */
export default function DisputePaymentSuccess() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState<"confirming" | "success" | "error">("confirming");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const confirm = async () => {
      const paymentId = searchParams.get("razorpay_payment_id") || "";
      const linkStatus = searchParams.get("razorpay_payment_link_status");

      if (!id) {
        setStatus("error");
        setErrorMsg("Missing dispute ID.");
        return;
      }

      // Razorpay only sends razorpay_payment_link_status=paid on success
      if (linkStatus && linkStatus !== "paid") {
        setStatus("error");
        setErrorMsg("Payment was not completed. Please try again from your dispute page.");
        return;
      }

      try {
        const ok = await api.confirmPayment(id, paymentId);
        if (ok) {
          setStatus("success");
        } else {
          setStatus("error");
          setErrorMsg("Could not confirm payment. Please contact support.");
        }
      } catch {
        setStatus("error");
        setErrorMsg("Something went wrong while confirming payment.");
      }
    };

    confirm();
  }, [id, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Card className="max-w-md w-full">
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          {status === "confirming" && (
            <>
              <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
              <h2 className="text-xl font-semibold">Confirming your payment…</h2>
              <p className="text-muted-foreground text-sm">Please wait while we verify your arbitration fee.</p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle2 className="h-12 w-12 text-green-500" />
              <h2 className="text-xl font-semibold text-green-700 dark:text-green-400">Payment Confirmed!</h2>
              <p className="text-muted-foreground text-sm">
                Your dispute is now active. The other party will be notified.
              </p>
              <Button className="mt-2" onClick={() => navigate(`/freelancer/disputes`)}>
                Go to My Disputes
              </Button>
            </>
          )}

          {status === "error" && (
            <>
              <XCircle className="h-12 w-12 text-red-500" />
              <h2 className="text-xl font-semibold text-red-700 dark:text-red-400">Payment Issue</h2>
              <p className="text-muted-foreground text-sm">{errorMsg}</p>
              <Button variant="outline" className="mt-2" onClick={() => navigate("/freelancer/disputes")}>
                Back to Disputes
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
