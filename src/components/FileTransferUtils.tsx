import { useState, useRef } from "react";
import { toast } from "sonner";

export function useFileTransfer(
  userId: string | null,
  peerId: string | null,
  wsRef: React.MutableRefObject<WebSocket | null>
) {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [isTransferring, setIsTransferring] = useState(false);
  const [receivedFile, setReceivedFile] = useState<{
    name: string;
    url: string;
    size: number;
  } | null>(null);
  const [isWaitingForAcceptance, setIsWaitingForAcceptance] = useState(false);
  const [connectionRequests, setConnectionRequests] = useState<
    Array<{ sender: string; senderName?: string; receiver: string }>
  >([]);
  const [isRtcConnected, setIsRtcConnected] = useState(false);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const fileChunksRef = useRef<ArrayBuffer[]>([]);
  const fileInfoRef = useRef<{
    name: string;
    type: string;
    size: number;
  } | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      toast.success(`Selected file: ${e.target.files[0].name}`);
    }
  };

  const setupWebRTC = () => {
    if (!userId || !peerId) {
      console.error("Missing user IDs for WebRTC setup");
      return;
    }

    try {
      peerConnectionRef.current = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
      });

      peerConnectionRef.current.onicecandidate = (event) => {
        if (event.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(
            JSON.stringify({
              type: "candidate",
              candidate: event.candidate,
              sender: userId,
              receiver: peerId,
            })
          );
        }
      };

      peerConnectionRef.current.ondatachannel = (event) => {
        dataChannelRef.current = event.channel;
        setupDataChannel(dataChannelRef.current);
      };

      peerConnectionRef.current.onconnectionstatechange = () => {
        if (peerConnectionRef.current?.connectionState === "connected") {
          setIsRtcConnected(true);
          toast.success("File transfer connection established");
        } else if (
          peerConnectionRef.current?.connectionState === "disconnected" ||
          peerConnectionRef.current?.connectionState === "failed"
        ) {
          setIsRtcConnected(false);
          setIsTransferring(false);
          toast.error("File transfer connection lost");
        }
      };
    } catch (error) {
      console.error("Error setting up WebRTC:", error);
      toast.error("Failed to setup WebRTC connection");
    }
  };

  const startConnection = async () => {
    if (!userId || !peerId) {
      toast.error("Missing user IDs for connection");
      return;
    }

    try {
      setupWebRTC();

      // Setup data channel for the peer who initiates the connection
      dataChannelRef.current = peerConnectionRef.current!.createDataChannel(
        "fileTransfer",
        {
          ordered: true,
        }
      );
      setupDataChannel(dataChannelRef.current);

      // Create and send offer
      const offer = await peerConnectionRef.current!.createOffer();
      await peerConnectionRef.current!.setLocalDescription(offer);

      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: "offer",
            offer: offer,
            sender: userId,
            receiver: peerId,
          })
        );
      } else {
        toast.error("WebSocket not connected");
      }
    } catch (error) {
      console.error("Error starting WebRTC connection:", error);
      toast.error("Failed to setup connection");
    }
  };

  const setupDataChannel = (channel: RTCDataChannel) => {
    channel.binaryType = "arraybuffer";

    channel.onopen = () => {
      setIsRtcConnected(true);
      toast.success("Data channel opened");
    };

    channel.onclose = () => {
      setIsRtcConnected(false);
      console.log("Data channel closed");
    };

    channel.onerror = (error) => {
      console.error("Data channel error:", error);
      toast.error("Connection error");
    };

    channel.onmessage = handleDataChannelMessage;
  };

  const handleDataChannelMessage = (event: MessageEvent) => {
    const data = event.data;

    if (typeof data === "string") {
      // Handle metadata messages
      try {
        const metadata = JSON.parse(data);

        if (metadata.type === "file-info") {
          // Reset file chunks and prepare for new file
          fileChunksRef.current = [];
          fileInfoRef.current = metadata.fileInfo;
          setProgress(0);
          setIsTransferring(true);
          toast.info(`Receiving file: ${metadata.fileInfo.name}`);
        } else if (metadata.type === "file-complete") {
          // File transfer complete
          finalizeFileReceive();
        }
      } catch (e) {
        console.error("Error parsing metadata:", e);
      }
    } else if (data instanceof ArrayBuffer) {
      // Handle file chunk
      fileChunksRef.current.push(data);

      if (fileInfoRef.current) {
        const currentSize = fileChunksRef.current.reduce(
          (total, chunk) => total + chunk.byteLength,
          0
        );
        const percentage = Math.min(
          Math.round((currentSize / fileInfoRef.current.size) * 100),
          100
        );
        setProgress(percentage);
      }
    }
  };

  const finalizeFileReceive = () => {
    if (!fileInfoRef.current) return;

    const fileBlob = new Blob(fileChunksRef.current, {
      type: fileInfoRef.current.type,
    });
    const url = URL.createObjectURL(fileBlob);

    setReceivedFile({
      name: fileInfoRef.current.name,
      url: url,
      size: fileInfoRef.current.size,
    });

    setIsTransferring(false);
    toast.success(`File received: ${fileInfoRef.current.name}`);
  };

  const sendFile = async () => {
    if (
      !file ||
      !dataChannelRef.current ||
      dataChannelRef.current.readyState !== "open"
    ) {
      toast.error("Unable to send file - connection not established");
      return;
    }

    try {
      setIsTransferring(true);
      setProgress(0);

      // Send file metadata
      dataChannelRef.current.send(
        JSON.stringify({
          type: "file-info",
          fileInfo: {
            name: file.name,
            type: file.type,
            size: file.size,
          },
        })
      );

      // Read and send file in chunks
      const chunkSize = 16384; // 16 KB chunks
      const fileReader = new FileReader();
      let offset = 0;

      fileReader.onload = (e) => {
        if (
          dataChannelRef.current?.readyState === "open" &&
          e.target?.result instanceof ArrayBuffer
        ) {
          dataChannelRef.current.send(e.target.result);
          offset += e.target.result.byteLength;

          const percentComplete = Math.min(
            Math.round((offset / file.size) * 100),
            100
          );
          setProgress(percentComplete);

          if (offset < file.size) {
            readSlice(offset);
          } else {
            // All chunks sent
            dataChannelRef.current.send(
              JSON.stringify({ type: "file-complete" })
            );
            setIsTransferring(false);
            toast.success(`File sent: ${file.name}`);
          }
        }
      };

      const readSlice = (o: number) => {
        const slice = file.slice(o, o + chunkSize);
        fileReader.readAsArrayBuffer(slice);
      };

      readSlice(0);
    } catch (error) {
      console.error("Error sending file:", error);
      toast.error("Failed to send file");
      setIsTransferring(false);
    }
  };

  const sendConnectionRequest = () => {
    if (wsRef.current?.readyState !== WebSocket.OPEN || !userId || !peerId) {
      toast.error("Cannot send connection request - no WebSocket connection");
      return;
    }

    try {
      wsRef.current.send(
        JSON.stringify({
          type: "connection-request",
          sender: userId,
          senderName: "You",
          receiver: peerId,
        })
      );

      setIsWaitingForAcceptance(true);
      toast.info("Connection request sent. Waiting for acceptance...");
    } catch (error) {
      console.error("Error sending connection request:", error);
      toast.error("Failed to send connection request");
    }
  };

  const acceptConnectionRequest = (sender: string) => {
    if (wsRef.current?.readyState !== WebSocket.OPEN || !userId) {
      toast.error("Cannot accept connection - no WebSocket connection");
      return;
    }

    try {
      wsRef.current.send(
        JSON.stringify({
          type: "connection-accepted",
          sender: userId,
          receiver: sender,
        })
      );

      setConnectionRequests((prev) =>
        prev.filter((req) => req.sender !== sender)
      );
      setupWebRTC();
    } catch (error) {
      console.error("Error accepting connection request:", error);
      toast.error("Failed to accept connection request");
    }
  };

  const processWebRTCSignal = async (signal) => {
    if (!peerConnectionRef.current) {
      setupWebRTC();
    }

    try {
      if (signal.type === "offer") {
        await peerConnectionRef.current!.setRemoteDescription(
          new RTCSessionDescription(signal.offer)
        );
        const answer = await peerConnectionRef.current!.createAnswer();
        await peerConnectionRef.current!.setLocalDescription(answer);

        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(
            JSON.stringify({
              type: "answer",
              answer: answer,
              sender: userId,
              receiver: signal.sender,
            })
          );
        }
      } else if (signal.type === "answer") {
        await peerConnectionRef.current!.setRemoteDescription(
          new RTCSessionDescription(signal.answer)
        );
      } else if (signal.type === "candidate" && signal.candidate) {
        await peerConnectionRef.current!.addIceCandidate(
          new RTCIceCandidate(signal.candidate)
        );
      }
    } catch (error) {
      console.error("Error processing WebRTC signal:", error);
    }
  };

  const addConnectionRequest = (request: {
    sender: string;
    senderName?: string;
    receiver: string;
  }) => {
    setConnectionRequests((prev) => {
      // Check if this request already exists
      const exists = prev.some(
        (req) =>
          req.sender === request.sender && req.receiver === request.receiver
      );
      if (!exists) {
        return [...prev, request];
      }
      return prev;
    });
  };

  return {
    file,
    progress,
    isTransferring,
    receivedFile,
    isWaitingForAcceptance,
    connectionRequests,
    isRtcConnected,
    handleFileSelect,
    startConnection,
    sendFile,
    processWebRTCSignal,
    sendConnectionRequest,
    acceptConnectionRequest,
    addConnectionRequest,
    setupWebRTC,
  };
}
