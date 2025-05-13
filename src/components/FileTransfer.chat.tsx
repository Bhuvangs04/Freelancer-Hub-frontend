import React, { useEffect, useState, useRef } from "react";
import { useWebRTCConnection } from "@/components/WebRTCConnectionManager";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Loader,
  Send,
  Download,
  X,
  File as FileIcon,
  Share2,
  CheckCircle,
  Upload,
  Lock,
} from "lucide-react";
import ProgressBar from "@/components/ProgressBar";
import ConnectionRequest from "@/components/ConnectionRequest";
import { cn } from "@/lib/utils";
import { formatFileSize } from "@/types";

interface FileTransferProps {
  userId: string;
  userName?: string;
  className?: string;
  initialPeerId?: string;
}

const FileTransfer: React.FC<FileTransferProps> = ({
  userId,
  className,
  initialPeerId,
}) => {
  const [webSocket, setWebSocket] = useState<WebSocket | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [peerId, setPeerId] = useState<string>(initialPeerId || "");
  const [connectingToWs, setConnectingToWs] = useState(false);
  const fileNameRef = useRef<string>("");

  const {
    fileTransferState,
    handleFileSelect,
    initiateConnection,
    acceptConnectionRequest,
    rejectConnectionRequest,
    sendFile,
    cancelFileTransfer,
    isConnected,
  } = useWebRTCConnection({
    userId,
    peerId,
    webSocket,
  });

  useEffect(() => {
    if (initialPeerId && initialPeerId !== peerId) {
      setPeerId(initialPeerId);
    }
  }, [initialPeerId]);

  useEffect(() => {
    const connectWebSocket = () => {
      setConnectingToWs(true);
      const wsUrl = `${
        import.meta.env.VITE_WS_URL || "ws://localhost:9000"
      }/chat/${userId}`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("WebSocket connected for file transfer");
        setWsConnected(true);
        setConnectingToWs(false);
      };

      ws.onmessage = (event) => {
        console.log("📩 WebSocket message received:", event.data);
      };

      ws.onclose = () => {
        console.log("WebSocket disconnected");
        setWsConnected(false);
        setConnectingToWs(false);
        setTimeout(connectWebSocket, 3000);
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setWsConnected(false);
        setConnectingToWs(false);
      };

      setWebSocket(ws);
    };

    connectWebSocket();

    return () => {
      if (webSocket) {
        webSocket.close();
      }
    };
  }, [userId]);

  const handleConnect = () => {
    if (
      !webSocket ||
      webSocket.readyState !== WebSocket.OPEN ||
      !peerId.trim()
    ) {
      console.error("Cannot connect: WebSocket not open or peer ID empty");
      return;
    }
    console.log(`Initiating connection to peer: ${peerId}`);
    initiateConnection();
  };

  const handleDownloadFile = () => {
    if (!fileTransferState.receivedFile) return;

    const link = document.createElement("a");
    link.href = fileTransferState.receivedFile.url;
    link.download = fileTransferState.receivedFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className={cn(
        "w-full max-w-md mx-auto h-full flex items-center justify-center p-4",
        className
      )}
    >
      <Card className="w-full overflow-hidden glass animate-blur-in border-0 shadow-2xl">
        <div className="relative bg-gradient-to-b from-primary/10 to-transparent py-8 px-6">
          <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,#fff)]"></div>

          <div className="relative flex items-center justify-between mb-6">
            <div className="flex flex-col">
              <span className="text-xs tracking-wider uppercase text-muted-foreground mb-1">
                Airdrop
              </span>
              <h1 className="text-2xl font-medium tracking-tight">
                Secure Transfer
              </h1>
            </div>

            <div className="flex items-center space-x-2">
              <div
                className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center",
                  wsConnected ? "bg-green-500/10" : "bg-red-500/10"
                )}
              >
                <div
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors duration-500",
                    wsConnected
                      ? "bg-green-500 animate-pulse-subtle"
                      : "bg-red-500"
                  )}
                />
              </div>
              <span className="text-xs font-medium">
                {connectingToWs
                  ? "Connecting..."
                  : wsConnected
                  ? "Online"
                  : "Offline"}
              </span>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>
              Your ID:{" "}
              <span className="font-medium text-foreground">{userId}</span>
            </p>
          </div>
        </div>

        <CardContent className="p-6 space-y-6">
          {/* Connection Requests */}
          {fileTransferState.connectionRequests.length > 0 && (
            <div className="space-y-3 animate-slide-up">
              <div className="flex items-center">
                <div className="h-5 w-1 bg-primary rounded-full mr-2"></div>
                <h3 className="text-sm font-medium">Connection Requests</h3>
              </div>

              <div className="space-y-2">
                {fileTransferState.connectionRequests.map((request) => (
                  <ConnectionRequest
                    key={request.sender}
                    request={request}
                    onAccept={() => acceptConnectionRequest(request.sender)}
                    onReject={() => rejectConnectionRequest(request.sender)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Peer Connection Input */}
          {!isConnected() &&
            !fileTransferState.isWaitingForAcceptance &&
            fileTransferState.connectionRequests.length === 0 && (
              <div className="space-y-4 animate-slide-up">
                <div className="flex items-center">
                  <div className="h-5 w-1 bg-primary rounded-full mr-2"></div>
                  <h3 className="text-sm font-medium">Connect to a peer</h3>
                </div>

                <div className="relative">
                  <Input
                    placeholder="Enter recipient's ID"
                    value={peerId}
                    onChange={(e) => setPeerId(e.target.value)}
                    disabled={!wsConnected}
                    className="pr-24 h-12 transition-all duration-300 bg-secondary/50 focus:bg-white border-0 focus:ring-2 focus:ring-primary/20"
                  />
                  <Button
                    onClick={handleConnect}
                    disabled={!wsConnected || !peerId.trim()}
                    className="absolute right-1 top-1 h-10 px-4 transition-all duration-300"
                    size="sm"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Connect
                  </Button>
                </div>
              </div>
            )}

          {/* Waiting for Acceptance */}
          {fileTransferState.isWaitingForAcceptance && (
            <div className="flex flex-col items-center justify-center py-10 animate-fade-in">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Loader className="animate-spin h-8 w-8 text-primary" />
              </div>
              <p className="text-lg font-medium mb-1">Connecting</p>
              <p className="text-sm text-center text-muted-foreground">
                Waiting for recipient to accept
              </p>
            </div>
          )}

          {/* File Transfer Section */}
          {isConnected() && (
            <div className="space-y-5 animate-slide-up">
              <div className="flex items-center">
                <div className="h-5 w-1 bg-green-500 rounded-full mr-2"></div>
                <h3 className="text-sm font-medium flex items-center">
                  Connected
                  <CheckCircle className="h-3.5 w-3.5 text-green-500 ml-2" />
                </h3>
              </div>

              {/* File Selection */}
              {!fileTransferState.isTransferring &&
                !fileTransferState.receivedFile &&
                !fileTransferState.file && (
                  <div className="file-drop-zone bg-secondary/30 rounded-xl">
                    <label className="flex flex-col items-center justify-center cursor-pointer py-10 px-4">
                      <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <Upload className="h-8 w-8 text-primary" />
                      </div>
                      <span className="text-lg font-medium mb-1">
                        Select a file to send
                      </span>
                      <span className="text-sm text-muted-foreground mb-4 text-center max-w-xs">
                        Drag and drop or click to browse
                      </span>
                      <Input
                        type="file"
                        className="hidden"
                        onChange={handleFileSelect}
                        disabled={!isConnected()}
                      />
                      <Button
                        variant="outline"
                        className="rounded-full h-10 px-5"
                      >
                        Browse Files
                      </Button>
                    </label>
                  </div>
                )}

              {/* Selected File */}
              {fileTransferState.file && !fileTransferState.isTransferring && (
                <div className="bg-secondary/50 rounded-xl p-5 animate-scale-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mr-4">
                        <FileIcon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium truncate max-w-[180px]">
                          {fileTransferState.file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(fileTransferState.file.size)}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={sendFile}
                      className="rounded-full transition-all duration-300 h-10 px-5"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send
                    </Button>
                  </div>
                </div>
              )}

              {/* Transferring File */}
              {fileTransferState.isTransferring && (
                <div className="bg-secondary/50 rounded-xl p-5 animate-scale-in">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mr-4">
                        <FileIcon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium truncate max-w-[180px]">
                          {fileTransferState.file?.name || fileNameRef.current}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {fileTransferState.file
                            ? `Sending: ${formatFileSize(
                                fileTransferState.file.size
                              )}`
                            : "Receiving file..."}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={cancelFileTransfer}
                      variant="outline"
                      className="h-8 w-8 p-0 rounded-full"
                      size="sm"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <ProgressBar
                      progress={fileTransferState.progress}
                      color={
                        fileTransferState.progress >= 100
                          ? "success"
                          : "default"
                      }
                    />
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">
                        {fileTransferState.progress.toFixed(0)}%
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {fileTransferState.progress >= 100
                          ? "Complete"
                          : "Transferring..."}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Received File */}
              {fileTransferState.receivedFile && (
                <div className="bg-secondary/50 rounded-xl p-5 animate-scale-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center mr-4">
                        <FileIcon className="h-6 w-6 text-green-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium truncate max-w-[180px]">
                          {fileTransferState.receivedFile.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(fileTransferState.receivedFile.size)}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={handleDownloadFile}
                      className="rounded-full transition-all duration-300 h-10 px-5"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="px-6 py-4 border-t border-border/50 flex items-center justify-center">
          <div className="flex items-center text-xs text-muted-foreground">
            <Lock className="h-3 w-3 mr-1.5" />
            End-to-end encrypted secure transfer
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default FileTransfer;
