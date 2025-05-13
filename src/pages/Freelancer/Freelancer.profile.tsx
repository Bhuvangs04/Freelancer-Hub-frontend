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
  const array = new Uint8Array(72); // 64 bits (8 bytes)
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
    // Fallback data to show while loading or in case of error
    placeholderData: {
      transactions: [],
      projects: [],
    },
  });

  const transactions = data?.transactions?.flatMap((e) => e.transactions) || [];
  const projects = data?.projects || [];

  // Calculate totals from mock data
  const totalEarnings = transactions
    .filter((t) => t.type === "received")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const availableBalance =
    totalEarnings -
    transactions
      .filter((t) => t.type === "withdrawal")
      .reduce((sum, transaction) => sum + transaction.amount, 0);

  const handleWithdrawSubmit = async () => {
    // Validate minimum withdrawal amount
    if (Number(bankDetails.amount) < 500) {
      toast.error("Minimum withdrawal amount is $500");
      return;
    }

    // Validate amount is not greater than available balance
    if (Number(bankDetails.amount) > availableBalance) {
      toast.error("Withdrawal amount cannot exceed available balance");
      return;
    }

    // Validate required fields
    if (
      !bankDetails.accountNumber ||
      !bankDetails.accountName ||
      !bankDetails.ifscCode
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsLoading(true);

    // Simulate API call with timeout
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

      // Reset form
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  // Show error state if data fetch failed
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">
              Error Loading Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              There was a problem loading your dashboard data. Please try again
              later.
            </p>
            <Button className="mt-4" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Button
        variant="ghost"
        className="ml-3 mt-5 flex items-center gap-2 hover:bg-green-400"
        onClick={() => navigate(-1)}
      >
        <ArrowLeftIcon width={24} />
        Back
      </Button>

      {/* Main content */}
      <main className=" pb-20 md:pb-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-2xl md:text-3xl font-bold">Welcome back</h1>
          <p className="text-muted-foreground">
            Here's what's happening with your freelance work today.
          </p>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="card-hover animate-slide-in [animation-delay:100ms]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Earnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <BarChart3 className="h-4 w-4 text-primary mr-2" />
                <span className="text-2xl font-bold">
                  ₹{totalEarnings.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Since you joined
              </p>
            </CardContent>
          </Card>

          <Card className="card-hover animate-slide-in [animation-delay:200ms]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Available Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Wallet className="h-4 w-4 text-primary mr-2" />
                <span className="text-2xl font-bold">
                  ₹{availableBalance.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Ready to withdraw
              </p>
            </CardContent>
            <CardFooter className="pt-0">
              <Dialog
                open={isWithdrawModalOpen}
                onOpenChange={setIsWithdrawModalOpen}
              >
                {availableBalance.toLocaleString() !== "0" ? (
                  <DialogTrigger asChild>
                    <Button size="sm" className="w-full">
                      Withdraw Funds
                    </Button>
                  </DialogTrigger>
                ) : (
                  <Button size="sm" className="w-full" disabled>
                    {" "}
                    No Funds
                  </Button>
                )}
                <DialogContent className="sm:max-w-[425px] animate-scale-in">
                  <DialogHeader>
                    <DialogTitle>Withdraw Funds</DialogTitle>
                    <DialogDescription>
                      Enter your bank details to withdraw funds. Minimum
                      withdrawal amount is ₹500.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="amount" className="text-right col-span-1">
                        Amount
                      </Label>
                      <div className="col-span-3 relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                          ₹
                        </span>
                        <Input
                          id="amount"
                          name="amount"
                          className="pl-7"
                          type="number"
                          value={bankDetails.amount}
                          onChange={handleInputChange}
                          placeholder="Minimum ₹500"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label
                        htmlFor="accountName"
                        className="text-right col-span-1"
                      >
                        Name
                      </Label>
                      <Input
                        id="accountName"
                        name="accountName"
                        className="col-span-3"
                        value={bankDetails.accountName}
                        onChange={handleInputChange}
                        placeholder="Account holder name"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label
                        htmlFor="accountNumber"
                        className="text-right col-span-1"
                      >
                        Account #
                      </Label>
                      <Input
                        id="accountNumber"
                        name="accountNumber"
                        className="col-span-3"
                        value={bankDetails.accountNumber}
                        onChange={handleInputChange}
                        placeholder="Bank account number"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label
                        htmlFor="ifscCode"
                        className="text-right col-span-1"
                      >
                        IFSC
                      </Label>
                      <Input
                        id="ifscCode"
                        name="ifscCode"
                        className="col-span-3"
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
                    >
                      {isLoading ? "Processing..." : "Withdraw Funds"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>

          <Card className="card-hover animate-slide-in [animation-delay:300ms]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Activity className="h-4 w-4 text-primary mr-2" />
                <span className="text-2xl font-bold">
                  {ongoingProjects.length}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {ongoingProjects.length === 1 ? "Project" : "Projects"} in
                progress
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Activity and Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left column - Transactions */}
          <div className="lg:col-span-1">
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle className="text-xl">Transaction History</CardTitle>
                <CardDescription>
                  Your recent financial activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.length === 0 ? (
                    <div className="py-8 text-center">
                      <p className="text-muted-foreground">
                        No transactions found
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                      {transactions.map((transaction) => (
                        <div
                          key={transaction.id}
                          className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded-full ${
                                transaction.type === "received"
                                  ? "bg-green-100"
                                  : "bg-amber-100"
                              }`}
                            >
                              {transaction.type === "received" ? (
                                <ArrowDownRight className="h-4 w-4 text-green-600" />
                              ) : (
                                <ArrowUpRight className="h-4 w-4 text-amber-600" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-sm">
                                {transaction.description}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(
                                  transaction.createdAt
                                ).toLocaleDateString()}
                              </p>
                              <Badge variant="secondary" className="text-xs">
                                {transaction.status === "completed"
                                  ? "Transaction completed"
                                  : "Under Review.."}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <p
                              className={`font-medium ${
                                transaction.type === "received"
                                  ? "text-green-600"
                                  : "text-amber-600"
                              }`}
                            >
                              {transaction.type === "received" ? "+" : "-"}₹
                              {transaction.amount}
                            </p>
                            <Badge variant="outline" className="text-xs">
                              {transaction.type === "received"
                                ? "Received"
                                : "Withdrawn"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right column - Projects */}
          <div className="lg:col-span-2">
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle className="text-xl">Projects</CardTitle>
                <CardDescription>
                  Track your ongoing and completed projects
                </CardDescription>
              </CardHeader>
              <CardContent>
                {projects.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-muted-foreground">No projects found</p>
                  </div>
                ) : (
                  <Tabs defaultValue="in-progress">
                    <TabsList className="mb-4">
                      <TabsTrigger
                        value="in_progress"
                        className="flex items-center gap-2 hover:bg-yellow-500 data-[state=active]:bg-yellow-500"
                      >
                        <Clock className="h-4 w-4" />
                        In Progress
                      </TabsTrigger>
                      <TabsTrigger
                        value="completed"
                        className="flex items-center gap-2 hover:bg-green-500 data-[state=active]:bg-green-500"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Completed
                      </TabsTrigger>
                      <TabsTrigger
                        value="rejected"
                        className="flex items-center gap-2 hover:bg-red-500 data-[state=active]:bg-red-500"
                      >
                        <XCircle className="h-4 w-4" />
                        Rejected
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="in_progress">
                      {ongoingProjects.length === 0 ? (
                        <div className="py-8 text-center">
                          <p className="text-muted-foreground">
                            No ongoing projects found
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {ongoingProjects.map((project) => (
                            <div
                              key={project.id}
                              className="p-4 rounded-lg border hover:shadow-sm transition-shadow"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h3 className="font-medium">
                                    {project.title}
                                  </h3>
                                  <p className="text-sm text-muted-foreground">
                                    Budget: {project.budget}
                                  </p>
                                </div>
                                <Badge
                                  variant="outline"
                                  className="bg-yellow-50 text-yellow-700 border-yellow-200"
                                >
                                  {project.progress}% Complete
                                </Badge>
                              </div>

                              <Progress
                                value={project.progress}
                                className="h-2 mb-2 bg-yellow-100"
                              />

                              <div className="flex justify-between items-center mt-3">
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Calendar className="h-3.5 w-3.5" />
                                  <span>
                                    Due:{" "}
                                    {new Date(
                                      project.deadline
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                                <Button
                                  onClick={() => {
                                    navigate(
                                      `/dashboard?${userId}&${userId}+minus:${userId}&xi-${userId}:id-${userId}`
                                    );
                                  }}
                                  variant="ghost"
                                  size="sm"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="completed">
                      {completedProjects.length === 0 ? (
                        <div className="py-8 text-center">
                          <p className="text-muted-foreground">
                            No completed projects found
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {completedProjects.map((project) => (
                            <div
                              key={project.id}
                              className="p-4 rounded-lg border hover:shadow-sm transition-shadow"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h3 className="font-medium">
                                    {project.title}
                                  </h3>
                                  <p className="text-sm text-muted-foreground">
                                    Budget: {project.budget}
                                  </p>
                                </div>
                                <Badge
                                  variant="outline"
                                  className="bg-green-50 text-green-700 border-green-200"
                                >
                                  Completed
                                </Badge>
                              </div>

                              <Progress
                                value={100}
                                className="h-2 mb-2 bg-green-100"
                              />

                              <div className="flex justify-between items-center mt-3">
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Calendar className="h-3.5 w-3.5" />
                                  <span>
                                    Completed:{" "}
                                    {new Date(
                                      project.deadline
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                                <Button
                                  onClick={() => {
                                    navigate(
                                      `/dashboard?${userId}&${userId}+minus:${userId}&xi-${userId}:id-${userId}`
                                    );
                                  }}
                                  variant="ghost"
                                  size="sm"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="rejected">
                      {rejectedProjects.length === 0 ? (
                        <div className="py-8 text-center">
                          <p className="text-muted-foreground">
                            No completed projects found
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {rejectedProjects.map((project) => (
                            <div
                              key={project.id}
                              className="p-4 rounded-lg border hover:shadow-sm transition-shadow"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h3 className="font-medium">
                                    {project.title}
                                  </h3>
                                  <p className="text-sm text-muted-foreground">
                                    Budget: {project.budget}
                                  </p>
                                </div>
                                <Badge
                                  variant="outline"
                                  className="bg-orange-50 text-red-500 border-red-200"
                                >
                                  Rejected
                                </Badge>
                              </div>

                              <Progress
                                value={project.progress}
                                className="h-2 mb-2 bg-red-100"
                              />

                              <div className="flex justify-between items-center mt-3">
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Calendar className="h-3.5 w-3.5" />
                                  <span className="text-sm text-muted-foreground">
                                    Rejected: Check the email about the
                                    rejection of the project from the client
                                    side.
                                  </span>
                                </div>
                                <Button
                                  onClick={() => {
                                    navigate(
                                      `/dashboard?${userId}&${userId}+minus:${userId}&xi-${userId}:id-${userId}`
                                    );
                                  }}
                                  variant="ghost"
                                  size="sm"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FreelancerDashboard;
