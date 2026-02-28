import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Briefcase,
  IndianRupee,
  CalendarDays,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Ban,
  Send,
} from "lucide-react";

interface Bid {
  _id: string;
  projectId: {
    _id: string;
    title: string;
    description: string;
    budget: number;
    deadline: string;
    skillsRequired: string[];
    status: string;
  };
  amount: number;
  message: string;
  status: string;
  createdAt: string;
}

const MyBids = () => {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  function getRandomString(length) {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  useEffect(() => {
    const fetchBids = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/freelancer/projects/bid/finalized`,
          {
            credentials: "include",
          }
        );
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const data = await response.json();
        if (data && data.bids) {
          const sanitizedBids = data.bids.map((bid: Bid) => {
            if (!bid.projectId) {
              return {
                ...bid,
                projectId: {
                  _id: "removed",
                  title: "Project Removed",
                  description: "This project has been deleted from the platform and is no longer available.",
                  budget: 0,
                  deadline: new Date().toISOString(),
                  skillsRequired: [],
                  status: "cancelled",
                },
              };
            }
            return bid;
          });
          setBids(sanitizedBids);
        }
      } catch (error) {
        console.error("Failed to fetch bids:", error);
        toast.error("Failed to load your bids. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchBids();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "pending":
        return {
          label: "Pending",
          icon: <Clock className="h-3 w-3" />,
          className: "bg-amber-500/15 text-amber-400 border-0",
        };
      case "accepted":
        return {
          label: "Accepted",
          icon: <CheckCircle className="h-3 w-3" />,
          className: "bg-emerald-500/15 text-emerald-400 border-0",
        };
      case "rejected":
        return {
          label: "Rejected",
          icon: <XCircle className="h-3 w-3" />,
          className: "bg-rose-500/15 text-rose-400 border-0",
        };
      case "cancelled":
        return {
          label: "Project Removed",
          icon: <Ban className="h-3 w-3" />,
          className: "bg-rose-500/15 text-rose-400 border-0",
        };
      case "sign_pending":
        return {
          label: "Sign Pending",
          icon: <AlertCircle className="h-3 w-3" />,
          className: "bg-orange-500/15 text-orange-400 border-0",
        };
      case "agreement_cancelled":
        return {
          label: "Agreement Cancelled",
          icon: <XCircle className="h-3 w-3" />,
          className: "bg-rose-500/15 text-rose-400 border-0",
        };
      default:
        return {
          label: "Unknown",
          icon: <AlertCircle className="h-3 w-3" />,
          className: "bg-slate-500/15 text-slate-400 border-0",
        };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-600/10 via-transparent to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-6">
          <button
            onClick={() =>
              navigate(
                `/freelancer/home/in-en/?id=${getRandomString(
                  100
                )}&pr=1&user=1&name=1&role=freelancer&final=${getRandomString(
                  50
                )}`
              )
            }
            className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium transition-colors mb-6 group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Projects
          </button>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                My Bids
              </h1>
              <p className="text-slate-400 mt-2 text-sm">
                {loading
                  ? "Loading your bids..."
                  : `${bids.length} bid${bids.length !== 1 ? "s" : ""} placed`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {loading ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-80 rounded-2xl bg-slate-800/30 border border-white/[0.04] animate-pulse"
              />
            ))}
          </div>
        ) : bids.length === 0 ? (
            <div className="bg-slate-800/40 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-14 text-center">
              <div className="h-16 w-16 mx-auto rounded-2xl bg-gradient-to-br from-violet-500/15 to-indigo-500/15 flex items-center justify-center mb-5">
                <Send className="h-7 w-7 text-violet-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                No bids yet
              </h3>
              <p className="text-slate-400 mb-8 max-w-sm mx-auto text-sm">
                You haven't placed any bids yet. Browse open projects to get started.
              </p>
              <Button
              onClick={() =>
                navigate(
                  `/freelancer/home/in-en/?id=${getRandomString(
                    100
                  )}&pr=1&user=1&name=1&role=freelancer&final=${getRandomString(
                    50
                  )}`
                )
              }
                className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl px-6 h-11 shadow-lg shadow-violet-500/20"
            >
                <Briefcase className="h-4 w-4 mr-2" />
              Browse Projects
            </Button>
          </div>
        ) : (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {bids.map((bid) => {
                  const statusConfig =
                    bid.projectId.status === "cancelled"
                      ? getStatusConfig("cancelled")
                      : getStatusConfig(bid.status);

                  return (
                    <div
                      key={bid._id}
                      className="group relative bg-slate-800/40 backdrop-blur-xl border border-white/[0.06] rounded-2xl overflow-hidden hover:border-violet-500/15 transition-all duration-500"
                    >
                      {/* Hover effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      <div className="relative p-5 space-y-4">
                        {/* Header */}
                        <div className="flex justify-between items-start gap-3">
                          <h3 className="text-base font-semibold text-white leading-tight line-clamp-2">
                            {bid.projectId.title}
                          </h3>
                          <Badge
                            className={`flex-shrink-0 text-xs font-medium rounded-lg px-2.5 py-1 flex items-center gap-1.5 ${statusConfig.className}`}
                          >
                            {statusConfig.icon}
                            {statusConfig.label}
                          </Badge>
                        </div>

                        {/* Description */}
                        <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
                          {bid.projectId.description}
                        </p>

                        {/* Skills */}
                        <div className="flex flex-wrap gap-1.5">
                          {bid.projectId.skillsRequired.slice(0, 3).map((skill) => (
                            <span
                              key={skill}
                              className="px-2 py-0.5 rounded-md bg-violet-500/10 text-violet-300 text-[11px] font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                          {bid.projectId.skillsRequired.length > 3 && (
                            <span className="px-2 py-0.5 rounded-md bg-slate-700/50 text-slate-400 text-[11px] font-medium">
                              +{bid.projectId.skillsRequired.length - 3}
                            </span>
                          )}
                        </div>

                        {/* Financial Info */}
                        <div className="space-y-2 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-400 flex items-center gap-1.5">
                              <Send className="h-3 w-3 text-violet-400" />
                              Your Bid
                            </span>
                            <span className="font-semibold text-violet-300">
                              ₹{bid.amount.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-400 flex items-center gap-1.5">
                              <IndianRupee className="h-3 w-3 text-emerald-400" />
                              Budget
                            </span>
                            <span className="text-slate-300">
                              ₹{bid.projectId.budget.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-400 flex items-center gap-1.5">
                              <CalendarDays className="h-3 w-3 text-amber-400" />
                              Deadline
                            </span>
                            <span className="text-slate-300">
                              {formatDate(bid.projectId.deadline)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-400 flex items-center gap-1.5">
                              <Clock className="h-3 w-3 text-slate-500" />
                              Bid Date
                            </span>
                            <span className="text-slate-300">
                              {formatDate(bid.createdAt)}
                            </span>
                          </div>
                        </div>

                        {/* Status Section */}
                        {bid.projectId.status === "cancelled" ? (
                          <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/8 border border-rose-500/10">
                            <XCircle className="h-4 w-4 text-rose-400 flex-shrink-0" />
                            <span className="text-xs text-rose-400">
                              Project has been removed by the owner
                            </span>
                          </div>
                        ) : (
                            <div className="pt-1">
                              <div className="flex items-start gap-2">
                                <FileText className="h-3.5 w-3.5 text-violet-400 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="text-xs font-medium text-violet-400 mb-1">Your Proposal</p>
                                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                                    {bid.message}
                                  </p>
                                </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBids;
