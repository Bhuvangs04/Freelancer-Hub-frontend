import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import axios from "axios";

const RAZORPAY_KEY = "rzp_test_Rllu5UrIWbb27c";


interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const TopUpModal = ({
  isOpen,
  onClose,
  onSuccess,
}: TopUpModalProps) => {
  const [amount, setAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

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

  const handleTopUp = async () => {
    const topUpAmount = parseFloat(amount);

    if (isNaN(topUpAmount) || topUpAmount < 1) {
      toast({
        variant: "destructive",
        title: "Invalid amount",
        description: "Please enter a valid amount (minimum ₹1).",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Load Razorpay Script
      const isRazorpayLoaded = await loadRazorpayScript();
      if (!isRazorpayLoaded) {
        throw new Error("Failed to load Razorpay SDK");
      }

      // 2. Create Order
      const { data: orderResponse } = await axios.post(
        `${import.meta.env.VITE_API_URL}/payments/add-funds/create-order`,
        { amount: topUpAmount * 100, currency: "INR" },
        { withCredentials: true }
      );

      if (!orderResponse.success) {
        throw new Error(orderResponse.message || "Failed to create order");
      }

      // 3. Initialize Razorpay Options
      const options = {
        key: RAZORPAY_KEY, // Hardcoded key since it's missing in .env
        amount: orderResponse.amount,
        currency: orderResponse.currency,
        name: "Freelancer Hub",
        description: "Wallet Top Up",
        order_id: orderResponse.orderId,
        handler: async function (response: any) {
          try {
            // 4. Verify Payment on Server
            const { data: verifyResponse } = await axios.post(
              `${import.meta.env.VITE_API_URL}/payments/add-funds/verify`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                amountAdded: topUpAmount,
              },
              { withCredentials: true }
            );

            if (verifyResponse.success) {
              toast({
                title: "Top Up Successful",
                description: `Successfully added ₹${topUpAmount} to your wallet.`,
              });
              setAmount("");
              onSuccess();
              onClose();
            }
          } catch (verifyError: any) {
            console.error("Verification error:", verifyError);
            toast({
              variant: "destructive",
              title: "Verification Failed",
              description: verifyError.response?.data?.message || "Payment verification failed",
            });
          }
        },
        prefill: {
          name: localStorage.getItem("username") || "",
          email: localStorage.getItem("email") || "",
        },
        theme: {
          color: "#4f46e5",
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on('payment.failed', function (response: any) {
        toast({
          variant: "destructive",
          title: "Payment Failed",
          description: response.error.description,
        });
      });
      
      razorpayInstance.open();

    } catch (error: any) {
      console.error("Top-up error:", error);
      toast({
        variant: "destructive",
        title: "Top Up Error",
        description: error.response?.data?.message || error.message || "Failed to initialize payment",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Top Up Wallet</DialogTitle>
          <DialogDescription>
            Add funds to your wallet balance directly via Razorpay.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="topup-amount" className="text-sm font-medium">
              Top Up Amount (₹)
            </label>
            <Input
              id="topup-amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount (min ₹1)"
              min="1"
              step="1"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button onClick={handleTopUp} disabled={isProcessing || !amount}>
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Pay with Razorpay
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
