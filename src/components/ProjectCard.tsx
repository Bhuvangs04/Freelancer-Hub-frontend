import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CalendarIcon,
  BadgeIndianRupee,
  X,
  IndianRupee,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Project {
  id?: string;
  _id?: string;
  projectId: string;
  title: string;
  freelancer?: string;
  freelancerId?: string;
  status: string;
  progress: number;
  dueDate: string;
  budget: number;
  clientId: string;
  description: string;
}

interface ProjectCardProps {
  project: Project;
  onViewDetails: () => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onViewDetails,
}) => {
  const [loading, setLoading] = useState(false);
  const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [reasonError, setReasonError] = useState(false);

  // Rating state
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [commentError, setCommentError] = useState(false);

  const statusColorMap = {
    "in-progress": "bg-blue-100 text-blue-800",
    "on-hold": "bg-yellow-100 text-yellow-800",
    completed: "bg-green-100 text-green-800",
  };

  const statusText = {
    "in-progress": "In Progress",
    "on-hold": "On Hold",
    completed: "Completed",
  };

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const openRatingModal = () => {
    setIsRatingModalOpen(true);
    setRating(5);
    setComment("");
    setCommentError(false);
  };

  const handleApprovePayment = async () => {
    // Open rating modal instead of immediately processing payment
    openRatingModal();
  };

  // Submit payment with rating
  const submitRatingAndApprovePayment = async () => {
    if (!comment.trim()) {
      setCommentError(true);
      return;
    }

    setLoading(true);
    try {
      // First, send the rating to the ratings API
      const ratingResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/freelancer/client-rating/${
          project.projectId
        }`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            projectId: project.projectId,
            rating: rating,
            comments: comment.trim(),
          }),
        }
      );

      if (!ratingResponse.ok) {
        const ratingData = await ratingResponse.json();
        throw new Error(ratingData.message || "Failed to submit rating");
      }

      // Then process the payment
      const paymentResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/payments/release-payment`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            project_id: project.projectId,
            client_id: project.clientId,
            freelancer_id: project.freelancerId,
          }),
        }
      );

      const paymentData = await paymentResponse.json();
      if (paymentResponse.ok) {
        toast.success("Payment approved and rating submitted successfully!");
        setIsRatingModalOpen(false);
      } else {
        toast.error(paymentData.message || "Failed to approve payment.");
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Error processing payment and rating."
      );
    }
    setLoading(false);
  };

  // Open rejection modal
  const openRejectionModal = () => {
    setIsRejectionModalOpen(true);
    setRejectionReason("");
    setReasonError(false);
  };

  // Submit rejection with reason
  const submitRejection = async () => {
    if (!rejectionReason.trim()) {
      setReasonError(true);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/payments/reject-project/${
          project.projectId
        }`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            Action_Id: project.clientId,
            clientFeedback: rejectionReason.trim(),
          }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        toast.success("Project rejected successfully.");
        setIsRejectionModalOpen(false);
      } else {
        toast.error(data.message || "Failed to reject project.");
      }
    } catch (error) {
      console.error("Error rejecting project:", error);
      toast.error("Error rejecting project.");
    }
    setLoading(false);
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        {project.status === "completed" && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-100">
            <h3 className="text-lg font-medium text-green-800 mb-3">
              Project Completed
            </h3>
            <p className="text-sm text-green-700 mb-4">
              This project has been marked as completed. You can now approve or
              reject the payment.
            </p>
            <div className="flex space-x-3">
              <Button
                onClick={handleApprovePayment}
                className="bg-green-600 hover:bg-green-700 text-white flex items-center"
                disabled={loading}
              >
                <BadgeIndianRupee className="mr-2 h-4 w-4" />
                {loading ? "Processing..." : "Approve Payment"}
              </Button>
              <Button
                variant="outline"
                onClick={openRejectionModal}
                className="border-red-300 text-red-600 hover:bg-red-50 flex items-center"
                disabled={loading}
              >
                <X className="mr-2 h-4 w-4" />
                {loading ? "Processing..." : "Reject Payment"}
              </Button>
            </div>
          </div>
        )}

        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg line-clamp-1">
              {project.title}
            </CardTitle>
            <Badge className={statusColorMap[project.status]}>
              {statusText[project.status]}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {project.freelancer || "Unassigned"}
          </p>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Progress</span>
                <span>{project.progress}%</span>
              </div>
              <Progress value={project.progress} className="h-2" />
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-1 text-muted-foreground">
                <CalendarIcon className="h-3.5 w-3.5" />
                <span>{formatDate(project.dueDate)}</span>
              </div>
              <div className="flex items-center  text-muted-foreground">
                <IndianRupee className="h-3.5 w-3.5  " />
                <span>{project.budget.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full" onClick={onViewDetails}>
            View Details
          </Button>
        </CardFooter>
      </Card>

      {/* Rating Modal */}
      <Dialog open={isRatingModalOpen} onOpenChange={setIsRatingModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rate Freelancer</DialogTitle>
            <DialogDescription>
              Please rate the freelancer and provide feedback before approving
              the payment.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <Label>Rating</Label>
              <div className="flex justify-center items-center">
                <RatingSelector rating={rating} onChange={setRating} />
              </div>
              <div className="text-center text-sm text-muted-foreground">
                {rating} out of 5 stars
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rating-comment" className="text-right">
                Feedback <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="rating-comment"
                placeholder="Please provide feedback about the freelancer's work..."
                value={comment}
                onChange={(e) => {
                  setComment(e.target.value);
                  if (e.target.value.trim()) setCommentError(false);
                }}
                className={commentError ? "border-red-500" : ""}
              />
              {commentError && (
                <p className="text-sm text-red-500">
                  Please provide feedback for the freelancer
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsRatingModalOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={submitRatingAndApprovePayment}
              className="bg-green-600 hover:bg-green-700"
              disabled={loading}
            >
              {loading ? "Processing..." : "Submit & Approve Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejection Reason Modal */}
      <Dialog
        open={isRejectionModalOpen}
        onOpenChange={setIsRejectionModalOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Project</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this project. Your feedback
              will be sent to the freelancer.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rejection-reason" className="text-right">
                Reason for rejection <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="rejection-reason"
                placeholder="Please explain why you're rejecting this project..."
                value={rejectionReason}
                onChange={(e) => {
                  setRejectionReason(e.target.value);
                  if (e.target.value.trim()) setReasonError(false);
                }}
                className={reasonError ? "border-red-500" : ""}
              />
              {reasonError && (
                <p className="text-sm text-red-500">
                  Please provide a reason for rejection
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsRejectionModalOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={submitRejection}
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Star rating selector component
const RatingSelector: React.FC<{
  rating: number;
  onChange: (rating: number) => void;
}> = ({ rating, onChange }) => {
  return (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="focus:outline-none transition-transform hover:scale-110"
        >
          <Star
            className={`h-8 w-8 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        </button>
      ))}
    </div>
  );
};
