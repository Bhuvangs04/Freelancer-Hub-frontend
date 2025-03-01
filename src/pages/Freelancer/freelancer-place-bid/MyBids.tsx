import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { XCircleIcon } from "@heroicons/react/solid";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeftIcon } from "@heroicons/react/solid";
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
      case "cancelled":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-800 border-red-200"
          >
            Project Removed by Owner
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <>
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">My Bids</h1>
          <Button
            variant="ghost"
            className="flex items-center gap-2 hover:bg-green-400"
            onClick={() =>
              navigate(
                `/freelancer/home/in-en/?id=${getRandomString(
                  100
                )}&pr=1&user=1&name=1&role=freelancer&final=${getRandomString(
                  50
                )}`
              )
            }
          >
            <ArrowLeftIcon width={24} />
            Back
          </Button>
        </div>
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
            <Button
              className="mt-4"
              onClick={() =>
                navigate(
                  `/freelancer/home/in-en/?id=${getRandomString(
                    100
                  )}&pr=1&user=1&name=1&role=freelancer&final=${getRandomString(
                    50
                  )}`
                )
              }
            >
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
                    {bid.projectId.status === "cancelled"
                      ? getStatusBadge(bid.projectId.status)
                      : getStatusBadge(bid.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {bid.projectId.description}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {bid.projectId.skillsRequired.map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="text-xs"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground underline">
                        Your Bid
                      </span>
                      <span className="font-medium">
                        ₹{bid.amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground underline">
                        Project Budget
                      </span>
                      <span>₹{bid.projectId.budget.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground underline">
                        Deadline
                      </span>
                      <span>{formatDate(bid.projectId.deadline)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground underline">
                        Bid Date
                      </span>
                      <span>{formatDate(bid.createdAt)}</span>
                    </div>
                  </div>
                  {bid.projectId.status === "cancelled" ? (
                    <>
                      <div className="pt-2">
                        <h4 className="text-sm font-medium mb-2">
                          Project Status
                        </h4>
                        <p className="mt-2 text-sm text-muted-foreground text-red-500">
                          Project has been removed by the owner.
                        </p>
                      </div>
                      <span className="text-sm text-muted-foreground text-red-400 flex items-center space-x-1">
                        <XCircleIcon className="h-4 w-4 text-red-500" />
                        <span>Bid Cancelled</span>
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="pt-2">
                        <h4 className="text-sm font-medium mb-2  text-blue-500">
                          Your Proposal
                        </h4>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {bid.message}
                        </p>
                      </div>
                      <span className="text-sm text-muted-foreground flex items-center space-x-1">
                        Status: {bid.status}
                      </span>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default MyBids;
