import React from "react";
import { Button } from "@/components/ui/button";
import { User, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";


interface ConnectionRequestProps {
  request: {
    sender: string;
    senderName?: string;
    receiver: string;
  };
  onAccept: () => void;
  onReject: () => void;
  className?: string;
}

const ConnectionRequest: React.FC<ConnectionRequestProps> = ({
  request,
  onAccept,
  onReject,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex items-center justify-between p-3 bg-secondary rounded-lg animate-scale-in",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center">
            <User className="h-4 w-4 text-amber-700" />
          </div>
          <div>
            <p className="font-medium">
              {request.senderName || request.sender}
            </p>
            <p className="text-xs text-amber-700">
              Wants to connect for file sharing
            </p>
          </div>
        </div>
        <div className="flex space-x-2 ml-4">
          <Button
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0 rounded-full"
            onClick={onReject}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Reject</span>
          </Button>
          <Button
            size="sm"
            className="h-8 w-8 p-0 rounded-full"
            onClick={onAccept}
          >
            <Check className="h-4 w-4" />
            <span className="sr-only">Accept</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConnectionRequest;
