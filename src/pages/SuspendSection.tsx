import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import StatusBadge from "./StatusBadge";
import StatusMessage from "./StatusMessage";
import {
  CalendarClock,
  Hourglass,
  Shield,
} from "lucide-react";

interface SuspendSectionProps {
  userName: string;
  suspensionDate: string;
  reviewDate: string;
  suspensionReason: string;
}

export function SuspendSection({
  userName,
  suspensionDate,
  reviewDate,
  suspensionReason,
}: SuspendSectionProps) {
  return (
    <div className="w-full mt-4 max-w-2xl mx-auto px-4 md:px-0 space-y-8 animate-fade-in">
      <div className="space-y-3 text-center">
        <StatusBadge status="suspended" className="animate-fade-up" />
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight animate-fade-up-delay-1">
          Account Temporarily Suspended
        </h1>
        <p className="text-muted-foreground max-w-md mx-auto animate-fade-up-delay-2">
          Hello {userName}, your freelancer account has been temporarily
          suspended.
        </p>
      </div>

      <Card className="overflow-hidden border animate-fade-up-delay-3">
        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x">
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-3">
                <CalendarClock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                Suspension Date
              </h3>
              <p className="font-medium">{new Date(suspensionDate).toDateString()}</p>
            </div>

            <div className="flex flex-col items-center justify-center p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-3">
                <Hourglass className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                Review Date
              </h3>
              <p className="font-medium">{new Date(reviewDate).toDateString()}</p>
            </div>

            <div className="flex flex-col items-center justify-center p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-3">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                Status
              </h3>
              <p className="font-medium">Under Review</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">
          Suspension Details
        </h2>
        <StatusMessage
          title="Reason for Suspension"
          message={suspensionReason}
          type="warning"
        />

        <StatusMessage
          title="Next Steps"
          message="Our team will review your account. You can expect to hear from us within 3-5 business days. Once the review is complete, we will notify you of the decision via email."
          type="info"
        />
      </div>

      <Separator />

      <div className="space-y-4 mb-2">
        <h2 className="text-xl font-semibold tracking-tight">
          Need Assistance?
        </h2>
        <p className="text-muted-foreground">
          If you believe this suspension is in error or would like to provide
          additional information, please contact our support team.
        </p>
      </div>
            <footer className="py-8 border-t backdrop-blur-sm bg-background/80">
             <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} FreelanceHub. All rights reserved.
            </p>
            </div>
            </footer>
    </div>
  );
}

export default SuspendSection;
