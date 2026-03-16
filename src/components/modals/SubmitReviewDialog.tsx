import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, Loader2, MessageSquareHeart } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface SubmitReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agreementId: string;
  projectTitle: string;
  revieweeName: string;
  onSuccess: () => void;
}

export default function SubmitReviewDialog({
  open,
  onOpenChange,
  agreementId,
  projectTitle,
  revieweeName,
  onSuccess,
}: SubmitReviewDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [ratings, setRatings] = useState({
    qualityRating: 0,
    communicationRating: 0,
    timelinessRating: 0,
    professionalismRating: 0,
    overallRating: 0,
  });
  const [comment, setComment] = useState("");

  const handleStarClick = (category: keyof typeof ratings, value: number) => {
    setRatings((prev) => ({ ...prev, [category]: value }));
  };

  const handleSubmit = async () => {
    // Validate
    const missingRatings = Object.entries(ratings).filter(([_, val]) => val === 0);
    if (missingRatings.length > 0) {
      toast.error("Please provide all 5 star ratings.");
      return;
    }
    if (comment.trim().length < 10) {
      toast.error("Please provide a written review (minimum 10 characters).");
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.createReview(agreementId, {
        ...ratings,
        comment,
      });

      if (response.status === "success") {
        toast.success("Review submitted successfully");
        onSuccess();
        onOpenChange(false);
        // Reset form
        setRatings({
          qualityRating: 0,
          communicationRating: 0,
          timelinessRating: 0,
          professionalismRating: 0,
          overallRating: 0,
        });
        setComment("");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStarRating = (label: string, category: keyof typeof ratings, description: string) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-border/40 last:border-0 gap-2">
      <div className="flex-1">
        <Label className="text-sm font-medium">{label}</Label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => handleStarClick(category, value)}
            className="focus:outline-none transition-transform hover:scale-110"
          >
            <Star
              className={`h-6 w-6 ${
                value <= ratings[category]
                  ? "fill-amber-400 text-amber-400"
                  : "text-slate-200 dark:text-slate-700"
              } transition-colors`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquareHeart className="h-5 w-5 text-primary" />
            Review {revieweeName}
          </DialogTitle>
          <DialogDescription>
            Your feedback for the project "{projectTitle}" helps maintain trust in the community.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 space-y-1">
          {renderStarRating("Quality of Work", "qualityRating", "How good was the final deliverable?")}
          {renderStarRating("Communication", "communicationRating", "How responsive and clear were they?")}
          {renderStarRating("Timeliness", "timelinessRating", "Were deadlines met?")}
          {renderStarRating("Professionalism", "professionalismRating", "How professional was their conduct?")}
          {renderStarRating("Overall Experience", "overallRating", "Your overall satisfaction with this contract")}

          <div className="pt-4 space-y-2">
            <Label htmlFor="review-comment">Written Feedback</Label>
            <Textarea
              id="review-comment"
              placeholder="Describe your experience working with them..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="resize-none h-24"
            />
            <p className="text-xs text-muted-foreground text-right">
              {comment.length} / 2000 characters
            </p>
          </div>
        </div>

        <DialogFooter className="mt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting} className="btn-premium">
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Review"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
