import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance: number;
  onWithdraw: (amount: number) => void;
  userRole: string; // Add user role prop
}

export const WithdrawModal = ({
  isOpen,
  onClose,
  currentBalance,
  onWithdraw,
  userRole,
}: WithdrawModalProps) => {
  const [amount, setAmount] = useState("");
  const { toast } = useToast();

  const isFreelancer = userRole === "freelancer"; // Check if the user is a freelancer

  const handleWithdraw = () => {
    if (!isFreelancer) return;

    const withdrawAmount = parseFloat(amount);

    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid amount",
        description: "Please enter a valid withdrawal amount.",
      });
      return;
    }

    if (withdrawAmount > currentBalance) {
      toast({
        variant: "destructive",
        title: "Insufficient balance",
        description: "You don't have enough funds for this withdrawal.",
      });
      return;
    }

    onWithdraw(withdrawAmount);
    setAmount("");
    onClose();
    toast({
      title: "Withdrawal initiated",
      description: `$${withdrawAmount.toFixed(
        2
      )} withdrawal has been initiated.`,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Withdraw Funds</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <p className="text-sm text-gray-500">Current Balance</p>
            <p className="text-lg font-medium">₹{currentBalance.toFixed(2)}</p>
          </div>
          {!isFreelancer ? (
            <p className="text-sm text-red-500">
              Only freelancers can apply for withdrawals.
            </p>
          ) : (
            <div className="space-y-2">
              <label htmlFor="amount" className="text-sm font-medium">
                Withdrawal Amount
              </label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                min="0"
                step="0.01"
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleWithdraw} disabled={!isFreelancer}>
            Withdraw
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
