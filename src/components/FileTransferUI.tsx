import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FileIcon, Paperclip, Upload, Download, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileTransferUIProps {
  file: File | null;
  progress: number;
  isTransferring: boolean;
  receivedFile: {
    name: string;
    url: string;
    size: number;
  } | null;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  startConnection: () => void;
  sendFile: () => void;
  onClose: () => void;
  isWaitingForAcceptance?: boolean;
  connectionRequests?: Array<{
    sender: string;
    senderName?: string;
    receiver: string;
  }>;
  onAcceptRequest?: (sender: string) => void;
  isRtcConnected?: boolean;
}

export const FileTransferUI = ({
  file,
  progress,
  isTransferring,
  receivedFile,
  handleFileSelect,
  startConnection,
  sendFile,
  onClose,
  isWaitingForAcceptance = false,
  connectionRequests = [],
  onAcceptRequest,
  isRtcConnected = false,
}: FileTransferUIProps) => {
  return (
    <div className="border rounded-lg p-4 bg-gray-50 mt-4">
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-medium">File Transfer</h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0"
        >
          <X size={16} />
        </Button>
      </div>

      <div className="space-y-3">
        {connectionRequests.length > 0 && (
          <div className="text-xs text-amber-600 bg-amber-50 p-3 rounded border border-amber-200">
            <p className="font-medium mb-2">Connection Requests:</p>
            {connectionRequests.map((request, index) => (
              <div
                key={index}
                className="flex items-center justify-between mb-1 last:mb-0"
              >
                <span>
                  {request.senderName || request.sender} wants to share files
                </span>
                {onAcceptRequest && (
                  <Button
                    onClick={() => onAcceptRequest(request.sender)}
                    size="sm"
                    variant="outline"
                    className="text-xs h-7"
                  >
                    Accept
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2">
          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={handleFileSelect}
            disabled={isTransferring || isWaitingForAcceptance}
          />
          <label
            htmlFor="file-upload"
            className={cn(
              "cursor-pointer flex items-center gap-2 text-sm px-3 py-2 rounded-md border",
              isTransferring || isWaitingForAcceptance
                ? "bg-gray-100 cursor-not-allowed"
                : "bg-white hover:bg-gray-50"
            )}
          >
            <Paperclip size={16} />
            {file ? "Change file" : "Select file"}
          </label>

          <Button
            onClick={startConnection}
            disabled={
              isTransferring || isWaitingForAcceptance || isRtcConnected
            }
            size="sm"
            variant="outline"
            className="text-xs"
          >
            {isWaitingForAcceptance
              ? "Waiting..."
              : isRtcConnected
              ? "Connected"
              : "Connect"}
          </Button>

          <Button
            onClick={sendFile}
            disabled={
              !file ||
              isTransferring ||
              isWaitingForAcceptance ||
              !isRtcConnected
            }
            size="sm"
            className="text-xs gap-1"
          >
            <Upload size={14} /> Send
          </Button>
        </div>

        {isWaitingForAcceptance && (
          <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
            Waiting for the recipient to accept your connection request...
          </div>
        )}

        {file && (
          <div className="flex items-center gap-2 text-sm p-2 border rounded bg-white">
            <FileIcon className="h-4 w-4" />
            <span className="truncate flex-1">
              {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
            </span>
          </div>
        )}

        {isTransferring && (
          <div className="space-y-1">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-center text-gray-500">{progress}%</p>
          </div>
        )}

        {receivedFile && (
          <div className="p-3 border rounded-md bg-white">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 truncate">
                <FileIcon className="h-4 w-4" />
                <span className="font-medium text-sm truncate">
                  {receivedFile.name}
                </span>
              </div>
              <a
                href={receivedFile.url}
                download={receivedFile.name}
                className="flex items-center gap-1 text-sm text-primary hover:underline"
              >
                <Download className="h-4 w-4" /> Download
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
