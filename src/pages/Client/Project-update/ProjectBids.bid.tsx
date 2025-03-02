import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, CheckCircle, XCircle, Loader2 } from "lucide-react";
import ResumeViewer from "@/components/ResumeViewer";

const useQueryParams = () => {
  return new URLSearchParams(useLocation().search);
};

interface Freelancer {
  _id: string;
  username: string;
  resumeUrl: string;
  profilePictureUrl: string;
}

interface Bid {
  _id: string;
  projectId: string;
  freelancerId: Freelancer;
  resume_permission: boolean;
  amount: number;
  message: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const ProjectBids = () => {
  const query = useQueryParams();
  const projectTitle = query.get("project_title");
  const { projectId } = useParams<{ projectId: string }>();
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<Record<string, string>>(
    {}
  );
  const navigate = useNavigate();

  useEffect(() => {
    fetchBids();
  }, [projectId]);

  const fetchBids = async () => {
    if (!projectId) return;

    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/client/projects/${projectId}/bids`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      if (data && data.bids) {
        setBids(data.bids);
      }
    } catch (error) {
      console.error("Failed to fetch bids:", error);
      toast({
        title: "Error",
        description: "Failed to load bids. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestResume = async (bidId: string) => {
    try {
      setActionLoading((prev) => ({ ...prev, [bidId]: "request" }));
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/client/bids/${bidId}/request-resume`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      toast({
        title: "Success",
        description: "Resume request sent to freelancer",
        variant: "default",
      });
      fetchBids(); // Refresh bids to get updated resume permission status
    } catch (error) {
      console.error("Failed to request resume:", error);
      toast({
        title: "Error",
        description: "Failed to send resume request. Please try again.",
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

  const handleAcceptBid = async (freelancerId: string, bidId: string) => {
    try {
      setActionLoading((prev) => ({ ...prev, [bidId]: "accept" }));
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/client/client/${freelancerId}?projectId=${projectId}`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      toast({
        title: "Success",
        description: "Bid accepted successfully!",
        variant: "default",
      });
    } catch (error) {
      console.error("Failed to accept bid:", error);
      toast({
        title: "Error",
        description: "Failed to accept bid. Please try again.",
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

  const handleRejectBid = async (freelancerId: string, bidId: string) => {
    try {
      setActionLoading((prev) => ({ ...prev, [bidId]: "reject" }));
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/client/client/${freelancerId}/reject?projectId=${projectId}`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      toast({
        title: "Success",
        description: "Bid rejected successfully!",
        variant: "default",
      });
      fetchBids(); // Refresh bids after rejecting
    } catch (error) {
      console.error("Failed to reject bid:", error);
      toast({
        title: "Error",
        description: "Failed to reject bid. Please try again.",
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

  // Function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Function to get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-800 border-yellow-200"
          >
            Pending
          </Badge>
        );
      case "accepted":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-800 border-green-200"
          >
            Accepted
          </Badge>
        );
      case "rejected":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-800 border-red-200"
          >
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          {projectTitle && <i>{projectTitle}</i>} Project Bids
        </h1>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Back to Projects
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card
              key={i}
              className="overflow-hidden shadow-sm border border-gray-100 bg-white"
            >
              <CardHeader className="pb-3 animate-pulse bg-muted h-12"></CardHeader>
              <CardContent className="space-y-4">
                <div className="h-16 bg-muted animate-pulse rounded"></div>
                <div className="h-8 bg-muted animate-pulse rounded"></div>
                <div className="space-y-2">
                  {[1, 2, 3, 4].map((j) => (
                    <div
                      key={j}
                      className="h-5 bg-muted animate-pulse rounded"
                    ></div>
                  ))}
                </div>
                <div className="h-24 bg-muted animate-pulse rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : bids.length === 0 ? (
        <div className="text-center p-8 bg-muted rounded-lg">
          <p className="text-lg">
            No bids have been submitted for this project yet.
          </p>
          <Button
            className="mt-4"
            onClick={() => navigate("/find/freelancers")}
          >
            Back to All Projects
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {bids.map((bid) => (
            <Card
              key={bid._id}
              className="overflow-hidden rounded-xl shadow-sm border border-gray-100 bg-white transition-all duration-300 hover:shadow-md"
            >
              <CardHeader className="pb-3 border-b bg-gradient-to-r from-gray-50 to-white">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl font-medium">
                    <div className="flex items-center gap-3">
                      {bid.freelancerId.profilePictureUrl && (
                        <img
                          src={bid.freelancerId.profilePictureUrl}
                          alt={bid.freelancerId.username}
                          className="w-12 h-12 rounded-full object-cover border border-gray-200 shadow-sm"
                        />
                      )}
                      <span>{bid.freelancerId.username}</span>
                    </div>
                  </CardTitle>
                  {getStatusBadge(bid.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4 p-5">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Bid Amount</span>
                    <span className="font-medium">
                      ₹{bid.amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Bid Date</span>
                    <span>{formatDate(bid.createdAt)}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <h4 className="text-sm font-medium mb-2">Proposal Message</h4>
                  <p className="text-sm text-muted-foreground">{bid.message}</p>
                </div>

                <div className="pt-4">
                  {bid.resume_permission ? (
                    <ResumeViewer
                      profileImage={bid.freelancerId.profilePictureUrl || null}
                      resumeUrl={bid.freelancerId.resumeUrl || null}
                      hasPermission={bid.resume_permission}
                      title={`${bid.freelancerId.username}'s Resume`}
                    />
                  ) : (
                    <Button
                      variant="secondary"
                      className="w-full"
                      onClick={() => handleRequestResume(bid._id)}
                      disabled={actionLoading[bid._id] === "request"}
                    >
                      {actionLoading[bid._id] === "request" ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Mail className="mr-2 h-4 w-4" />
                      )}
                      {actionLoading[bid._id] === "request"
                        ? "Requesting..."
                        : "Request Resume"}
                    </Button>
                  )}
                </div>

                {bid.status === "pending" && (
                  <div className="pt-2 flex gap-2">
                    <Button
                      className="w-full group"
                      variant="secondary"
                      onClick={() =>
                        handleAcceptBid(bid.freelancerId._id, bid._id)
                      }
                      disabled={
                        actionLoading[bid._id] === "accept" ||
                        actionLoading[bid._id] === "reject"
                      }
                    >
                      {actionLoading[bid._id] === "accept" ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                      )}
                      <span className="transition-all duration-300 group-hover:scale-105">
                        {actionLoading[bid._id] === "accept"
                          ? "Accepting..."
                          : "Accept Bid"}
                      </span>
                    </Button>
                    <Button
                      className="w-full group"
                      variant="destructive"
                      onClick={() =>
                        handleRejectBid(bid.freelancerId._id, bid._id)
                      }
                      disabled={
                        actionLoading[bid._id] === "accept" ||
                        actionLoading[bid._id] === "reject"
                      }
                    >
                      {actionLoading[bid._id] === "reject" ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <XCircle className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                      )}
                      <span className="transition-all duration-300 group-hover:scale-105">
                        {actionLoading[bid._id] === "reject"
                          ? "Rejecting..."
                          : "Reject Bid"}
                      </span>
                    </Button>
                  </div>
                )}

                {bid.status === "accepted" && (
                  <div className="pt-2">
                    <Button className="w-full" variant="default">
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Accepted
                    </Button>
                  </div>
                )}

                {bid.status === "rejected" && (
                  <div className="pt-2">
                    <Button className="w-full" variant="outline" disabled>
                      <XCircle className="mr-2 h-4 w-4" />
                      Rejected
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectBids;
