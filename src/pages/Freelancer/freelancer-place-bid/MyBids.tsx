import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

// Define the bid type structure
interface Bid {
  _id: string;
  projectId: {
    _id: string;
    title: string;
    description: string;
    budget: number;
    deadline: string;
    skillsRequired: string[];
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

  // Fetch bids from the API
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
          setBids(data.bids);
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
      <h1 className="text-3xl font-bold mb-6">My Bids</h1>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
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
          <p className="text-lg">You haven't placed any bids yet.</p>
          <Button className="mt-4" onClick={() => navigate("/")}>
            Browse Projects
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {bids.map((bid) => (
            <Card key={bid._id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">
                    {bid.projectId.title}
                  </CardTitle>
                  {getStatusBadge(bid.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {bid.projectId.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  {bid.projectId.skillsRequired.map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Your Bid</span>
                    <span className="font-medium">
                      ₹{bid.amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Project Budget
                    </span>
                    <span>₹{bid.projectId.budget.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Deadline</span>
                    <span>{formatDate(bid.projectId.deadline)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Bid Date</span>
                    <span>{formatDate(bid.createdAt)}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <h4 className="text-sm font-medium mb-2">Your Proposal</h4>
                  <p className="text-sm text-muted-foreground">{bid.message}</p>
                </div>
                <span className="text-sm text-muted-foreground">
                    Status: {bid.status}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBids;
