import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { Agreement, User } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  PenLine,
  ArrowRight,
  Calendar,
  IndianRupee,
  Edit3,
  Send,
} from "lucide-react";

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  draft: {
    label: "Draft - Review & Edit",
    color: "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400",
    icon: <Edit3 className="h-4 w-4" />,
  },
  pending_freelancer: {
    label: "Awaiting Freelancer Signature",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    icon: <Clock className="h-4 w-4" />,
  },
  pending_client: {
    label: "Awaiting Your Signature",
    color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    icon: <PenLine className="h-4 w-4" />,
  },
  active: {
    label: "Active",
    color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
  completed: {
    label: "Completed",
    color: "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400",
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    icon: <XCircle className="h-4 w-4" />,
  },
  disputed: {
    label: "Disputed",
    color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
    icon: <AlertTriangle className="h-4 w-4" />,
  },
};

export default function Agreements() {
  const navigate = useNavigate();
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [userRole, setUserRole] = useState<string>("");

  useEffect(() => {
    fetchAgreements();
  }, []);

  const fetchAgreements = async () => {
    setLoading(true);
    const response = await api.getAgreements();
    if (response.status === "success" && response.data) {
      setAgreements(response.data.agreements);
      setUserRole(response.data.userRole);
    }
    setLoading(false);
  };

  const filteredAgreements = agreements.filter((agreement) => {
    if (activeTab === "all") return true;
    if (activeTab === "pending") {
      return agreement.status === "draft" || agreement.status === "pending_client" || agreement.status === "pending_freelancer";
    }
    return agreement.status === activeTab;
  });

  const pendingCount = agreements.filter(
    (a) => a.status === "draft" || a.status === "pending_client" || a.status === "pending_freelancer"
  ).length;
  const activeCount = agreements.filter((a) => a.status === "active").length;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getOtherPartyName = (agreement: Agreement) => {
    if (userRole === "client") {
      return typeof agreement.freelancerId === "object"
        ? (agreement.freelancerId as User).username
        : "Freelancer";
    }
    return typeof agreement.clientId === "object"
      ? (agreement.clientId as User).username
      : "Client";
  };

  const needsAction = (agreement: Agreement) => {
    if (userRole === "client" && agreement.status === "pending_client") return true;
    if (userRole === "freelancer" && agreement.status === "pending_freelancer") return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                Agreements
              </h1>
              <p className="mt-2 text-slate-600 dark:text-slate-400">
                Manage your contracts and digital signatures
              </p>
            </div>
            <div className="flex items-center gap-4">
              {pendingCount > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                  <PenLine className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                    {pendingCount} pending signature{pendingCount > 1 ? "s" : ""}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
            <Card className="bg-gradient-to-br from-violet-500 to-purple-600 text-white border-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-violet-100 text-sm">Total Agreements</p>
                    <p className="text-3xl font-bold">{agreements.length}</p>
                  </div>
                  <FileText className="h-10 w-10 text-violet-200" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white border-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-amber-100 text-sm">Pending Signatures</p>
                    <p className="text-3xl font-bold">{pendingCount}</p>
                  </div>
                  <PenLine className="h-10 w-10 text-amber-200" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-emerald-500 to-green-600 text-white border-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100 text-sm">Active Contracts</p>
                    <p className="text-3xl font-bold">{activeCount}</p>
                  </div>
                  <CheckCircle2 className="h-10 w-10 text-emerald-200" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Total Value</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(
                        agreements
                          .filter((a) => a.status === "active" || a.status === "completed")
                          .reduce((sum, a) => sum + a.agreedAmount, 0)
                      )}
                    </p>
                  </div>
                  <IndianRupee className="h-10 w-10 text-blue-200" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="all" onValueChange={setActiveTab}>
          <TabsList className="mb-6 bg-white dark:bg-slate-800 p-1 rounded-xl shadow-sm">
            <TabsTrigger value="all" className="rounded-lg">
              All
            </TabsTrigger>
            <TabsTrigger value="pending" className="rounded-lg">
              Pending
              {pendingCount > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 rounded-full">
                  {pendingCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="active" className="rounded-lg">
              Active
            </TabsTrigger>
            <TabsTrigger value="completed" className="rounded-lg">
              Completed
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            {loading ? (
              <div className="grid gap-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-12 w-12 rounded-xl" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-5 w-1/3" />
                          <Skeleton className="h-4 w-1/4" />
                        </div>
                        <Skeleton className="h-10 w-24" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredAgreements.length === 0 ? (
              <Card className="bg-white dark:bg-slate-800/50 border-dashed">
                <CardContent className="py-16 text-center">
                  <FileText className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                    No agreements found
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    {activeTab === "pending"
                      ? "You don't have any agreements pending signature."
                      : "Agreements will appear here once you accept a bid or get hired for a project."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredAgreements.map((agreement) => (
                  <Card
                    key={agreement._id}
                    className={`overflow-hidden transition-all duration-200 hover:shadow-lg cursor-pointer group ${
                      needsAction(agreement)
                        ? "ring-2 ring-amber-400 dark:ring-amber-500"
                        : ""
                    }`}
                    onClick={() => navigate(`/agreements/${agreement._id}`)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center gap-6">
                        {/* Icon */}
                        <div
                          className={`h-14 w-14 rounded-xl flex items-center justify-center ${
                            agreement.status === "active"
                              ? "bg-gradient-to-br from-emerald-500 to-green-600"
                              : agreement.status.includes("pending")
                              ? "bg-gradient-to-br from-amber-500 to-orange-500"
                              : "bg-gradient-to-br from-slate-400 to-slate-500"
                          }`}
                        >
                          <FileText className="h-7 w-7 text-white" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white truncate">
                              {agreement.projectTitle}
                            </h3>
                            {needsAction(agreement) && (
                              <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
                                Action Required
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                            <span>With {getOtherPartyName(agreement)}</span>
                            <span className="text-slate-300 dark:text-slate-600">•</span>
                            <span className="font-medium text-slate-900 dark:text-white">
                              {formatCurrency(agreement.agreedAmount)}
                            </span>
                            <span className="text-slate-300 dark:text-slate-600">•</span>
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5" />
                              {formatDate(agreement.deadline)}
                            </div>
                          </div>
                        </div>

                        {/* Status & Action */}
                        <div className="flex items-center gap-4">
                          <Badge
                            className={`${
                              statusConfig[agreement.status]?.color || "bg-slate-100"
                            } gap-1.5`}
                          >
                            {statusConfig[agreement.status]?.icon}
                            {statusConfig[agreement.status]?.label || agreement.status}
                          </Badge>
                          <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                        </div>
                      </div>

                      {/* Signature Progress */}
                      {(agreement.status === "pending_client" ||
                        agreement.status === "pending_freelancer") && (
                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                          <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                              {agreement.clientSignature.signed ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              ) : (
                                <div className="h-4 w-4 rounded-full border-2 border-slate-300 dark:border-slate-600" />
                              )}
                              <span className="text-sm text-slate-600 dark:text-slate-400">
                                Client Signature
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {agreement.freelancerSignature.signed ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              ) : (
                                <div className="h-4 w-4 rounded-full border-2 border-slate-300 dark:border-slate-600" />
                              )}
                              <span className="text-sm text-slate-600 dark:text-slate-400">
                                Freelancer Signature
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
