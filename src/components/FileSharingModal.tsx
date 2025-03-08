import React, { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { FileUp } from "lucide-react";
import FileTransfer from "./FileTransfer.chat";
import { cn } from "@/lib/utils";

interface FileSharingModalProps {
  recipientId: string;
  recipientName: string;
  senderId?: string;
  className?: string;
}

const FileSharingModal: React.FC<FileSharingModalProps> = ({
  recipientId,
  recipientName,
  senderId,
  className,
}) => {
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    // Use provided senderId or generate a new one from localStorage or randomly
    const existingUserId = senderId || localStorage.getItem("Chatting_id");
    setUserId(existingUserId);
  }, [senderId]);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "gap-2 px-4 py-2 transition-all duration-300 hover:bg-primary hover:text-primary-foreground rounded-lg border-2",
            className
          )}
        >
          <FileUp className="h-5 w-5" />
          <span className="font-medium">Share Files</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        className="w-[90vw] max-w-[800px] sm:max-w-[800px] flex flex-col h-full border-l-2 shadow-xl"
        style={{
          backdropFilter: "blur(10px)",
          backgroundColor: "rgba(255, 255, 255, 0.97)",
        }}
      >
        <SheetHeader className="pb-6 border-b">
          <SheetTitle className="text-2xl font-medium tracking-tight">
            Share Files with{" "}
            <span className="text-primary font-semibold">{recipientName}</span>
          </SheetTitle>
        </SheetHeader>

        {userId && (
          <div className="flex-1 overflow-auto py-8 px-2">
            <FileTransfer
              userId={userId}
              userName={localStorage.getItem("username") || "You"}
              className="max-w-full"
              initialPeerId={recipientId}
            />

            <div className="mt-8 p-6 bg-muted/50 rounded-xl border border-border/40 shadow-sm">
              <h3 className="text-base font-medium mb-4 flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M12 16v-4"></path>
                  <path d="M12 8h.01"></path>
                </svg>
                How to share files:
              </h3>
              <ol className="text-sm text-muted-foreground space-y-3 list-decimal pl-5">
                <li className="pb-1">
                  Enter{" "}
                  <strong className="text-foreground">{recipientId}</strong> as
                  the peer ID.
                </li>
                <li className="pb-1">
                  Click <strong className="text-foreground">Connect</strong> to
                  establish a secure connection.
                </li>
                <li className="pb-1">Once connected, select a file to send.</li>
                <li className="pb-1">
                  The recipient will receive a connection request to accept.
                </li>
                <li className="pb-1">
                  Files are transferred securely peer-to-peer.
                </li>
                <li>
                  Please download the file after receiving it.
                  <span className="block mt-1 text-xs italic">
                    For security purposes, we don't store these files in our
                    database.
                  </span>
                </li>
              </ol>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default FileSharingModal;
