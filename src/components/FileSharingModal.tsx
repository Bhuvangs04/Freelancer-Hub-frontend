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
    const existingUserId =
      senderId || localStorage.getItem("Chatting_id");
    setUserId(existingUserId);
  }, [senderId]);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FileUp className="h-4 w-4" />
          Share Files
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] flex flex-col h-full">
        <SheetHeader>
          <SheetTitle>Share Files with {recipientName}</SheetTitle>
        </SheetHeader>

        {userId && (
          <div className="flex-1 overflow-auto py-6">
            <FileTransfer
              userId={userId}
              userName={localStorage.getItem("username") || "You"}
              className="max-w-full"
              initialPeerId={recipientId}
            />

            <div className="mt-4 p-4 bg-muted rounded-md">
              <h3 className="text-sm font-medium mb-2">How to share files:</h3>
              <ol className="text-xs text-muted-foreground space-y-2 list-decimal pl-4">
                <li>
                  Enter <strong>{recipientId}</strong> as the peer ID.
                </li>
                <li>Click Connect to establish a secure connection.</li>
                <li>Once connected, select a file to send.</li>
                <li>
                  The recipient will receive a connection request to accept.
                </li>
                <li>Files are transferred securely peer-to-peer.</li>
                <li>Please download the file after receiving it. For security purposes, we don't store these files in our database.</li>
              </ol>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default FileSharingModal;
