import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  Clock,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  MoreHorizontal,
  BarChart3,
  Calendar,
  XCircle,
  ArrowLeftIcon,
  TrendingUp,
  IndianRupee,
  Briefcase,
  ChevronRight,
  Download,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";

const generateSecureRandomString = () => {
  const array = new Uint8Array(72);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
    ""
  );
};

const userId = generateSecureRandomString();

const FreelancerDashboard = () => {
  const navigate = useNavigate();
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [bankDetails, setBankDetails] = useState({
    accountNumber: "",
    accountName: "",
    ifscCode: "",
    amount: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const freelancerId = localStorage.getItem("Chatting_id");

  const {
    data,
    isLoading: isDataLoading,
    error,
  } = useQuery({
    queryKey: ["freelancerData", freelancerId],
    queryFn: async () => {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/freelancer/wallet/details`,
        {
          credentials: "include",
        }
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    },
    placeholderData: {
      wallet: { balance: 0, escrowBalance: 0, totalOwned: 0 },
      transactions: [],
      projects: [],
    },
  });

  // ── NEW wallet API shape: wallet object + flat WalletTransaction array ──
  const walletInfo = data?.wallet || { balance: 0, escrowBalance: 0 };
  const transactions = data?.transactions || [];
  const projects = data?.projects || [];

  // balance comes straight from the Wallet doc — no manual computation needed
  const availableBalance = walletInfo.balance;
  const lockedBalance = walletInfo.escrowBalance;
  const totalEarnings = walletInfo.totalOwned ?? availableBalance + lockedBalance;

  // wallet freeze flag (backend sets when admin freezes)
  const isWalletFrozen = walletInfo.withdrawalsBlocked === true;

  const handleWithdrawSubmit = async () => {
    if (isWalletFrozen) {
      toast.error("Your withdrawals are currently blocked by admin. Please contact support.");
      return;
    }
    if (Number(bankDetails.amount) < 500) {
      toast.error("Minimum withdrawal amount is ₹500");
      return;
    }
    if (Number(bankDetails.amount) > availableBalance) {
      toast.error("Withdrawal amount cannot exceed available balance");
      return;
    }
    if (
      !bankDetails.accountNumber ||
      !bankDetails.accountName ||
      !bankDetails.ifscCode
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/payments/freelancer/withdraw/balance`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            accountNumber: bankDetails.accountNumber,
            accountName: bankDetails.accountName,
            ifscCode: bankDetails.ifscCode,
            amount: Number(bankDetails.amount),
          }),
        }
      );
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Withdrawal failed");
      }
      toast.success(result.message);
      setBankDetails({
        accountNumber: "",
        accountName: "",
        ifscCode: "",
        amount: "",
      });
      setIsWithdrawModalOpen(false);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBankDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const ongoingProjects = projects.filter((p) => p.status === "in_progress");
  const completedProjects = projects.filter((p) => p.status === "completed");
  const rejectedProjects = projects.filter((p) => p.status === "rejected");

  if (isDataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="text-center">
          <div className="relative h-14 w-14 mx-auto">
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-violet-500 animate-spin" />
            <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-indigo-400 animate-spin" style={{ animationDirection: "reverse", animationDuration: "0.8s" }} />
          </div>
          <p className="mt-5 text-slate-400 text-sm font-medium">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="w-full max-w-md mx-4 bg-slate-800/60 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-8 text-center shadow-2xl">
          <div className="h-12 w-12 mx-auto rounded-full bg-rose-500/15 flex items-center justify-center mb-4">
            <XCircle className="h-6 w-6 text-rose-400" />
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">Error Loading Dashboard</h2>
          <p className="text-slate-400 text-sm mb-6">
            There was a problem loading your dashboard data. Please try again.
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl px-6"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-600/15 via-transparent to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium transition-colors mb-6 group"
          >
            <ArrowLeftIcon className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            Back
          </button>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                Welcome back 👋
              </h1>
              <p className="text-slate-400 mt-2 text-base">
                Here's what's happening with your freelance work today.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Dialog
                open={isWithdrawModalOpen}
                onOpenChange={setIsWithdrawModalOpen}
              >
                {availableBalance > 0 ? (
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl px-5 h-11 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all duration-300 font-medium">
                      <Download className="h-4 w-4 mr-2" />
                      Withdraw Funds
                    </Button>
                  </DialogTrigger>
                ) : (
                    <Button
                      disabled
                      className="bg-slate-700/50 text-slate-500 rounded-xl px-5 h-11 cursor-not-allowed"
                    >
                      No Funds to Withdraw
                  </Button>
                )}
                <DialogContent className="sm:max-w-[440px] bg-slate-900 border-white/[0.08] text-white rounded-2xl shadow-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-white">
                      Withdraw Funds
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                      Enter your bank details to withdraw funds. Minimum withdrawal amount is ₹500.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount" className="text-slate-300 text-sm font-medium">
                        Amount
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">₹</span>
                        <Input
                          id="amount"
                          name="amount"
                          className="pl-7 bg-slate-800/60 border-white/[0.08] text-white placeholder:text-slate-500 focus:ring-violet-500 focus:border-violet-500 rounded-xl h-11"
                          type="number"
                          value={bankDetails.amount}
                          onChange={handleInputChange}
                          placeholder="Minimum ₹500"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="accountName" className="text-slate-300 text-sm font-medium">
                        Account Holder Name
                      </Label>
                      <Input
                        id="accountName"
                        name="accountName"
                        className="bg-slate-800/60 border-white/[0.08] text-white placeholder:text-slate-500 focus:ring-violet-500 focus:border-violet-500 rounded-xl h-11"
                        value={bankDetails.accountName}
                        onChange={handleInputChange}
                        placeholder="Full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="accountNumber" className="text-slate-300 text-sm font-medium">
                        Account Number
                      </Label>
                      <Input
                        id="accountNumber"
                        name="accountNumber"
                        className="bg-slate-800/60 border-white/[0.08] text-white placeholder:text-slate-500 focus:ring-violet-500 focus:border-violet-500 rounded-xl h-11"
                        value={bankDetails.accountNumber}
                        onChange={handleInputChange}
                        placeholder="Bank account number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ifscCode" className="text-slate-300 text-sm font-medium">
                        IFSC Code
                      </Label>
                      <Input
                        id="ifscCode"
                        name="ifscCode"
                        className="bg-slate-800/60 border-white/[0.08] text-white placeholder:text-slate-500 focus:ring-violet-500 focus:border-violet-500 rounded-xl h-11"
                        value={bankDetails.ifscCode}
                        onChange={handleInputChange}
                        placeholder="IFSC code"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="submit"
                      onClick={handleWithdrawSubmit}
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl h-11 font-medium shadow-lg shadow-violet-500/20"
                    >
                      {isLoading ? "Processing..." : "Confirm Withdrawal"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      {/* Wallet Frozen Warning */}
      {isWalletFrozen && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-300">
            <span className="text-xl">🧊</span>
            <div>
              <p className="text-sm font-medium">Withdrawals are currently blocked</p>
              <p className="text-xs text-orange-400/80 mt-0.5">
                {walletInfo.withdrawalBlockedReason
                  ? `Reason: ${walletInfo.withdrawalBlockedReason}`
                  : "Contact support for more information."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8 -mt-2">
          {/* Total Earnings */}
          <div className="group relative bg-slate-800/40 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 hover:border-emerald-500/20 transition-all duration-500 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-bl-full opacity-60 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-emerald-400" />
                </div>
                <Badge className="bg-emerald-500/15 text-emerald-400 border-0 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  Total Owned
                </Badge>
              </div>
              <p className="text-sm font-medium text-slate-400 mb-1">Total Earnings</p>
              <p className="text-3xl font-bold text-white tracking-tight">
                ₹{totalEarnings.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Available Balance */}
          <div className="group relative bg-slate-800/40 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 hover:border-violet-500/20 transition-all duration-500 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-violet-500/10 to-transparent rounded-bl-full opacity-60 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 rounded-xl bg-violet-500/15 flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-violet-400" />
                </div>
                <Badge className="bg-violet-500/15 text-violet-400 border-0 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  Withdrawable
                </Badge>
              </div>
              <p className="text-sm font-medium text-slate-400 mb-1">Available Balance</p>
              <p className="text-3xl font-bold text-white tracking-tight">
                ₹{availableBalance.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Active Projects */}
          <div className="group relative bg-slate-800/40 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 hover:border-amber-500/20 transition-all duration-500 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-bl-full opacity-60 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-amber-400" />
                </div>
                <Badge className="bg-amber-500/15 text-amber-400 border-0 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  Active
                </Badge>
              </div>
              <p className="text-sm font-medium text-slate-400 mb-1">Active Projects</p>
              <p className="text-3xl font-bold text-white tracking-tight">
                {ongoingProjects.length}
              </p>
            </div>
          </div>
        </div>

        {/* Activity and Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Transactions */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800/40 backdrop-blur-xl border border-white/[0.06] rounded-2xl overflow-hidden">
              <div className="px-6 py-5 border-b border-white/[0.04]">
                <h2 className="text-lg font-semibold text-white">Transaction History</h2>
                <p className="text-sm text-slate-400 mt-0.5">Your recent financial activity</p>
              </div>
              <div className="p-4">
                {transactions.length === 0 ? (
                  <div className="py-12 text-center">
                    <div className="h-12 w-12 mx-auto rounded-full bg-slate-700/50 flex items-center justify-center mb-3">
                      <IndianRupee className="h-5 w-5 text-slate-500" />
                    </div>
                    <p className="text-slate-400 text-sm">No transactions yet</p>
                  </div>
                ) : (
                    <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1 custom-scrollbar">
                      {transactions.map((transaction, idx) => {
                        const isCredit = [
                          "escrow_release", "deposit", "admin_adjustment", "withdrawal_reversal"
                        ].includes(transaction.type) && transaction.amount > 0;
                        return (
                          <div
                                  key={transaction._id || idx}
                                  className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.03] transition-colors group"
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div
                                      className={`flex-shrink-0 h-9 w-9 rounded-xl flex items-center justify-center ${isCredit ? "bg-emerald-500/15" : "bg-amber-500/15"
                                        }`}
                                    >
                                      {isCredit ? (
                                        <ArrowDownRight className="h-4 w-4 text-emerald-400" />
                                      ) : (
                                        <ArrowUpRight className="h-4 w-4 text-amber-400" />
                                      )}
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-sm font-medium text-white truncate">
                                        {transaction.description || transaction.type.replace(/_/g, " ")}
                                      </p>
                                      <p className="text-xs text-slate-500 mt-0.5">
                                        {new Date(transaction.createdAt || transaction.timestamp).toLocaleDateString()}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right flex-shrink-0 ml-3">
                                    <p className={`text-sm font-semibold ${isCredit ? "text-emerald-400" : "text-amber-400"
                                      }`}>
                                      {isCredit ? "+" : ""}₹{Math.abs(transaction.amount).toLocaleString("en-IN")}
                                    </p>
                                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${transaction.status === "completed" || transaction.status === "reversed"
                                      ? "bg-emerald-500/10 text-emerald-400"
                                      : "bg-amber-500/10 text-amber-400"
                                      }`}>
                                      {transaction.status === "reversed" ? "Refunded" :
                                        transaction.status === "completed" ? "Completed" : "Pending"}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Projects */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800/40 backdrop-blur-xl border border-white/[0.06] rounded-2xl overflow-hidden">
              <div className="px-6 py-5 border-b border-white/[0.04]">
                <h2 className="text-lg font-semibold text-white">Projects</h2>
                <p className="text-sm text-slate-400 mt-0.5">Track your ongoing and completed projects</p>
              </div>
              <div className="p-5">
                {projects.length === 0 ? (
                  <div className="py-12 text-center">
                    <div className="h-12 w-12 mx-auto rounded-full bg-slate-700/50 flex items-center justify-center mb-3">
                      <Briefcase className="h-5 w-5 text-slate-500" />
                    </div>
                    <p className="text-slate-400 text-sm">No projects found</p>
                  </div>
                ) : (
                    <Tabs defaultValue="in_progress">
                      <TabsList className="bg-slate-800/60 border border-white/[0.06] rounded-xl p-1 gap-1 h-auto">
                      <TabsTrigger
                        value="in_progress"
                          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-slate-400 data-[state=active]:bg-amber-500/15 data-[state=active]:text-amber-400 data-[state=active]:shadow-none transition-all"
                      >
                          <Clock className="h-3.5 w-3.5" />
                        In Progress
                          <span className="ml-1 text-xs bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded-full">{ongoingProjects.length}</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="completed"
                          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-slate-400 data-[state=active]:bg-emerald-500/15 data-[state=active]:text-emerald-400 data-[state=active]:shadow-none transition-all"
                      >
                          <CheckCircle className="h-3.5 w-3.5" />
                        Completed
                          <span className="ml-1 text-xs bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded-full">{completedProjects.length}</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="rejected"
                          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-slate-400 data-[state=active]:bg-rose-500/15 data-[state=active]:text-rose-400 data-[state=active]:shadow-none transition-all"
                      >
                          <XCircle className="h-3.5 w-3.5" />
                        Rejected
                          <span className="ml-1 text-xs bg-rose-500/10 text-rose-400 px-1.5 py-0.5 rounded-full">{rejectedProjects.length}</span>
                      </TabsTrigger>
                    </TabsList>

                      {/* In Progress Tab */}
                      <TabsContent value="in_progress" className="mt-5">
                      {ongoingProjects.length === 0 ? (
                          <div className="py-10 text-center">
                            <p className="text-slate-400 text-sm">No ongoing projects</p>
                        </div>
                      ) : (
                            <div className="space-y-3">
                          {ongoingProjects.map((project) => (
                            <div
                              key={project.id}
                              className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.02] hover:bg-white/[0.04] hover:border-amber-500/10 transition-all duration-300 group"
                            >
                              <div className="flex justify-between items-start mb-3">
                                <div className="min-w-0">
                                  <h3 className="font-semibold text-white truncate">{project.title}</h3>
                                  <p className="text-sm text-slate-400 mt-0.5">Budget: ₹{project.budget}</p>
                                </div>
                                <Badge className="bg-amber-500/15 text-amber-400 border-0 text-xs font-medium rounded-lg px-2.5 py-1 flex-shrink-0 ml-3">
                                  {project.progress}%
                                </Badge>
                              </div>
                              <div className="relative h-2 bg-slate-700/50 rounded-full overflow-hidden mb-3">
                                <div
                                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full transition-all duration-700"
                                  style={{ width: `${project.progress}%` }}
                                />
                              </div>
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                  <Calendar className="h-3 w-3" />
                                  Due: {new Date(project.deadline).toLocaleDateString()}
                                </div>
                                <Button
                                  onClick={() => {
                                    navigate(
                                      `/dashboard?${userId}&${userId}+minus:${userId}&xi-${userId}:id-${userId}`
                                    );
                                  }}
                                  variant="ghost"
                                  size="sm"
                                  className="text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-lg h-8 px-3"
                                >
                                  <span className="text-xs mr-1">Details</span>
                                  <ChevronRight className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </TabsContent>

                      {/* Completed Tab */}
                      <TabsContent value="completed" className="mt-5">
                      {completedProjects.length === 0 ? (
                          <div className="py-10 text-center">
                            <p className="text-slate-400 text-sm">No completed projects</p>
                        </div>
                      ) : (
                            <div className="space-y-3">
                          {completedProjects.map((project) => (
                            <div
                              key={project.id}
                              className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.02] hover:bg-white/[0.04] hover:border-emerald-500/10 transition-all duration-300"
                            >
                              <div className="flex justify-between items-start mb-3">
                                <div className="min-w-0">
                                  <h3 className="font-semibold text-white truncate">{project.title}</h3>
                                  <p className="text-sm text-slate-400 mt-0.5">Budget: ₹{project.budget}</p>
                                </div>
                                <Badge className="bg-emerald-500/15 text-emerald-400 border-0 text-xs font-medium rounded-lg px-2.5 py-1 flex-shrink-0 ml-3">
                                  Completed
                                </Badge>
                              </div>
                              <div className="relative h-2 bg-slate-700/50 rounded-full overflow-hidden mb-3">
                                <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full w-full" />
                              </div>
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                  <Calendar className="h-3 w-3" />
                                  Completed: {new Date(project.deadline).toLocaleDateString()}
                                </div>
                                <Button
                                  onClick={() => {
                                    navigate(
                                      `/dashboard?${userId}&${userId}+minus:${userId}&xi-${userId}:id-${userId}`
                                    );
                                  }}
                                  variant="ghost"
                                  size="sm"
                                  className="text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-lg h-8 px-3"
                                >
                                  <span className="text-xs mr-1">Details</span>
                                  <ChevronRight className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </TabsContent>

                      {/* Rejected Tab */}
                      <TabsContent value="rejected" className="mt-5">
                      {rejectedProjects.length === 0 ? (
                          <div className="py-10 text-center">
                            <p className="text-slate-400 text-sm">No rejected projects</p>
                        </div>
                      ) : (
                            <div className="space-y-3">
                          {rejectedProjects.map((project) => (
                            <div
                              key={project.id}
                              className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.02] hover:bg-white/[0.04] hover:border-rose-500/10 transition-all duration-300"
                            >
                              <div className="flex justify-between items-start mb-3">
                                <div className="min-w-0">
                                  <h3 className="font-semibold text-white truncate">{project.title}</h3>
                                  <p className="text-sm text-slate-400 mt-0.5">Budget: ₹{project.budget}</p>
                                </div>
                                <Badge className="bg-rose-500/15 text-rose-400 border-0 text-xs font-medium rounded-lg px-2.5 py-1 flex-shrink-0 ml-3">
                                  Rejected
                                </Badge>
                              </div>
                              <div className="relative h-2 bg-slate-700/50 rounded-full overflow-hidden mb-3">
                                <div
                                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-rose-400 to-pink-400 rounded-full"
                                  style={{ width: `${project.progress}%` }}
                                />
                              </div>
                              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                <Calendar className="h-3 w-3" />
                                <span className="text-rose-400/80">
                                  Rejected: Check email about the rejection from client side.
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FreelancerDashboard;
