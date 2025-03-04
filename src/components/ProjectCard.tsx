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
import { CalendarIcon, BadgeIndianRupee, X, IndianRupee } from "lucide-react";
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

  const handleApprovePayment = async () => {
    setLoading(true);
    try {
      const response = await fetch(
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

      const data = await response.json();
      if (response.ok) {
        toast.success("Payment approved successfully!");
      } else {
        toast.error(data.message || "Failed to approve payment.");
      }
    } catch (error) {
      toast.error("Error approving payment.");
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
