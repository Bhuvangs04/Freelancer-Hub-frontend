import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import {
  FileText,
  Check,
  X,
  Loader2,
  ArrowLeft,
  Briefcase,
  IndianRupee,
  Calendar,
  User,
  ShieldCheck,
  ShieldX,
  Inbox,
} from "lucide-react";

interface ResumeRequest {
  bidId: string;
  projectId: string;
  projectTitle: string;
  projectBudget: number;
  projectDeadline: string;
  projectSkills: string[];
  clientUsername: string;
  clientProfilePicture: string;
  bidAmount: number;
  bidMessage: string;
  requestedAt: string;
}

const API_URL = import.meta.env.VITE_API_URL;

const ResumeRequests = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<ResumeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<Record<string, string>>(
    {}
  );

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/freelancer/resume-requests`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setRequests(data.requests || []);
      }
    } catch (error) {
      console.error("Error fetching resume requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (bidId: string, action: "approve" | "deny") => {
    try {
      setActionLoading((prev) => ({ ...prev, [bidId]: action }));
      const res = await fetch(
        `${API_URL}/freelancer/resume-requests/${bidId}/respond`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action }),
        }
      );
      const data = await res.json();

      if (res.ok) {
        toast({
          title: action === "approve" ? "Resume Shared" : "Request Denied",
          description:
            action === "approve"
              ? "The client can now view your resume for this bid."
              : "The client's resume request has been denied.",
        });
        // Remove from list
        setRequests((prev) => prev.filter((r) => r.bidId !== bidId));
      } else {
        toast({
          title: "Error",
          description: data.message || "Something went wrong",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process request. Try again.",
        variant: "destructive",
      });
    } finally {
      setActionLoading((prev) => {
        const newState = { ...prev };
        delete newState[bidId];
        return newState;
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium transition-colors mb-4 group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            Back
          </button>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-violet-500/15 flex items-center justify-center">
              <FileText className="h-5 w-5 text-violet-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                Resume Requests
              </h1>
              <p className="text-sm text-slate-400 mt-0.5">
                Clients want to view your resume — approve or deny each request
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-violet-400 mx-auto" />
              <p className="text-slate-400 text-sm mt-3">
                Loading requests...
              </p>
            </div>
          </div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-16 w-16 rounded-2xl bg-slate-800/60 flex items-center justify-center mb-4">
              <Inbox className="h-8 w-8 text-slate-500" />
            </div>
            <h2 className="text-lg font-semibold text-white mb-1">
              No Pending Requests
            </h2>
            <p className="text-slate-400 text-sm max-w-md">
              You don't have any pending resume requests right now. When a
              client wants to see your resume, it will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-slate-500">
              {requests.length} pending request
              {requests.length !== 1 ? "s" : ""}
            </p>

            {requests.map((request) => (
              <div
                key={request.bidId}
                className="rounded-2xl border border-white/[0.06] bg-slate-800/40 backdrop-blur-xl overflow-hidden hover:border-violet-500/15 transition-all duration-300"
              >
                {/* Top — Client + Project Info */}
                <div className="p-5 pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      {request.clientProfilePicture ? (
                        <img
                          src={request.clientProfilePicture}
                          alt={request.clientUsername}
                          className="h-10 w-10 rounded-full object-cover border border-white/10"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-indigo-500/15 flex items-center justify-center">
                          <User className="h-5 w-5 text-indigo-400" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white">
                          {request.clientUsername}
                        </p>
                        <p className="text-xs text-slate-500">
                          wants to view your resume
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-amber-500/15 text-amber-400 border-0 text-xs font-medium px-2.5 py-0.5 rounded-full flex-shrink-0">
                      Pending
                    </Badge>
                  </div>

                  {/* Project Card */}
                  <div className="mt-4 p-3.5 rounded-xl bg-slate-700/30 border border-white/[0.04]">
                    <div className="flex items-start gap-2.5 mb-2">
                      <Briefcase className="h-4 w-4 text-violet-400 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate">
                          {request.projectTitle}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-x-5 gap-y-1.5 ml-6.5">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <IndianRupee className="h-3 w-3" />
                        <span>₹{request.projectBudget?.toLocaleString()}</span>
                      </div>
                      {request.projectDeadline && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {new Date(
                              request.projectDeadline
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                    {request.projectSkills &&
                      request.projectSkills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2.5 ml-6.5">
                          {request.projectSkills.map((skill) => (
                            <span
                              key={skill}
                              className="px-2 py-0.5 rounded-md bg-slate-600/40 text-slate-300 text-[10px] font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                  </div>

                  {/* Bid Info */}
                  <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                    <span>
                      Your bid:{" "}
                      <span className="text-white font-medium">
                        ₹{request.bidAmount?.toLocaleString()}
                      </span>
                    </span>
                    <span>
                      Requested:{" "}
                      {new Date(request.requestedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Bottom — Action Buttons */}
                <div className="px-5 py-3.5 border-t border-white/[0.04] bg-slate-800/20 flex items-center gap-3">
                  <Button
                    onClick={() => handleRespond(request.bidId, "approve")}
                    disabled={!!actionLoading[request.bidId]}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-10 font-medium"
                  >
                    {actionLoading[request.bidId] === "approve" ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <ShieldCheck className="mr-2 h-4 w-4" />
                    )}
                    {actionLoading[request.bidId] === "approve"
                      ? "Approving..."
                      : "Approve — Share Resume"}
                  </Button>
                  <Button
                    onClick={() => handleRespond(request.bidId, "deny")}
                    disabled={!!actionLoading[request.bidId]}
                    variant="outline"
                    className="flex-1 border-white/[0.08] text-slate-300 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20 rounded-xl h-10 font-medium"
                  >
                    {actionLoading[request.bidId] === "deny" ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <ShieldX className="mr-2 h-4 w-4" />
                    )}
                    {actionLoading[request.bidId] === "deny"
                      ? "Denying..."
                      : "Deny Request"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeRequests;
