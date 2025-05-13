import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { FileTransferState } from "@/types";

interface WebRTCConnectionProps {
  userId: string;
  peerId: string;
  webSocket: WebSocket | null;
}

export function useWebRTCConnection({
  userId,
  peerId,
  webSocket,
}: WebRTCConnectionProps) {
  const [fileTransferState, setFileTransferState] = useState<FileTransferState>(
    {
      file: null,
      progress: 0,
      isTransferring: false,
      receivedFile: null,
      isWaitingForAcceptance: false,
      connectionRequests: [],
      isRtcConnected: false,
    }
  );

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const fileChunksRef = useRef<ArrayBuffer[]>([]);
  const fileInfoRef = useRef<{ name: string; type: string; size: number } | null>(null);
  const pendingCandidates = useRef<RTCIceCandidateInit[]>([]);

  useEffect(() => {
    return () => cleanupRTCConnection();
  }, []);

  useEffect(() => {
    if (!webSocket) return;

    const handleMessage = async (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (!data.type || !data.sender || !data.receiver) {
          console.warn("Invalid WebSocket message:", data);
          return;
        }

        if (["offer", "answer", "candidate"].includes(data.type)) {
          await processWebRTCSignal(data);
        } else if (data.type === "connection-request" && data.receiver === userId) {
          addConnectionRequest(data);
          toast.info(`${data.senderName || "Someone"} wants to connect`, {
            action: { label: "Accept", onClick: () => acceptConnectionRequest(data.sender) },
            duration: 10000,
          });
        } else if (data.type === "connection-accepted" && data.receiver === userId) {
          setFileTransferState((prev) => ({ ...prev, isWaitingForAcceptance: false }));
          toast.success("Connection request accepted");
        } else if (data.type === "connection-rejected" && data.receiver === userId) {
          setFileTransferState((prev) => ({ ...prev, isWaitingForAcceptance: false }));
          toast.error("Connection request rejected");
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
        toast.error("WebSocket error occurred");
      }
    };

    webSocket.addEventListener("message", handleMessage);
    return () => webSocket.removeEventListener("message", handleMessage);
  }, [webSocket, userId, peerId]);

  const cleanupRTCConnection = () => {
    if (dataChannelRef.current) {
      dataChannelRef.current.close();
      dataChannelRef.current = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (fileTransferState.receivedFile?.url) {
      URL.revokeObjectURL(fileTransferState.receivedFile.url);
    }
    setFileTransferState((prev) => ({
      ...prev,
      isRtcConnected: false,
      isTransferring: false,
      progress: 0,
      file: null,
      receivedFile: null,
    }));
    fileChunksRef.current = [];
    fileInfoRef.current = null;
    pendingCandidates.current = [];
  };

  const setupWebRTC = () => {
    if (peerConnectionRef.current) return;

    peerConnectionRef.current = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        // Add a TURN server for production use (example credentials)
        {
          urls: "turn:turn.example.com:3478",
          username: "username",
          credential: "password",
        },
      ],
      iceTransportPolicy: "all",
      bundlePolicy: "balanced",
      rtcpMuxPolicy: "require",
    });

    peerConnectionRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        webSocket?.send(
          JSON.stringify({
            type: "candidate",
            candidate: event.candidate,
            sender: userId,
            receiver: peerId,
          })
        );
      }
    };

    peerConnectionRef.current.oniceconnectionstatechange = () => {
      const state = peerConnectionRef.current?.iceConnectionState;
      console.log("ICE Connection State:", state);
      if (state === "connected" || state === "completed") {
        setFileTransferState((prev) => ({ ...prev, isRtcConnected: true }));
      } else if (state === "disconnected" || state === "failed" || state === "closed") {
        console.warn("ICE connection failed or closed:", state);
        setFileTransferState((prev) => ({ ...prev, isRtcConnected: false }));
        cleanupRTCConnection();
      }
    };

    peerConnectionRef.current.ondatachannel = (event) => {
      dataChannelRef.current = event.channel;
      setupDataChannel(event.channel);
    };
  };

  const createOffer = async () => {
    setupWebRTC();
    dataChannelRef.current = peerConnectionRef.current!.createDataChannel("fileTransfer", {
      negotiated: false,
      maxRetransmits: 0, // Prioritize speed over reliability for file transfer
    });
    setupDataChannel(dataChannelRef.current);

    try {
      const offer = await peerConnectionRef.current!.createOffer();
      await peerConnectionRef.current!.setLocalDescription(offer);
      webSocket?.send(
        JSON.stringify({
          type: "offer",
          offer,
          sender: userId,
          receiver: peerId,
        })
      );
    } catch (error) {
      console.error("Error creating offer:", error);
      toast.error("Failed to initiate connection");
      cleanupRTCConnection();
    }
  };

  const setupDataChannel = (channel: RTCDataChannel) => {
    channel.binaryType = "arraybuffer";
    channel.onopen = () => {
      console.log("Data channel opened");
      setFileTransferState((prev) => ({ ...prev, isRtcConnected: true }));
    };
    channel.onclose = () => {
      console.log("Data channel closed");
      setFileTransferState((prev) => ({ ...prev, isRtcConnected: false }));
    };
    channel.onerror = (error) => {
      console.error("DataChannel error:", error);
      toast.error("Data channel error");
    };
    channel.onmessage = handleDataChannelMessage;
  };

  const handleDataChannelMessage = (event: MessageEvent) => {
    const data = event.data;
    const startTime = performance.now();

    if (typeof data === "string") {
      try {
        const metadata = JSON.parse(data);
        if (metadata.type === "file-info") {
          fileChunksRef.current = [];
          fileInfoRef.current = metadata.fileInfo;
          setFileTransferState((prev) => ({
            ...prev,
            progress: 0,
            isTransferring: true,
          }));
          toast.info(`Receiving file: ${metadata.fileInfo.name}`);
        } else if (metadata.type === "file-complete") {
          finalizeFileReceive();
        } else if (metadata.type === "transfer-cancelled") {
          setFileTransferState((prev) => ({
            ...prev,
            isTransferring: false,
            progress: 0,
          }));
          toast.info("File transfer cancelled");
        }
      } catch (error) {
        console.error("Error parsing metadata:", error);
      }
    } else if (data instanceof ArrayBuffer) {
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
        setFileTransferState((prev) => ({ ...prev, progress: percentage }));
      }
    }
    console.log(`Chunk processed in ${performance.now() - startTime}ms`);
  };

  const finalizeFileReceive = () => {
    if (!fileInfoRef.current) return;

    try {
      const fileBlob = new Blob(fileChunksRef.current, { type: fileInfoRef.current.type });
      const url = URL.createObjectURL(fileBlob);
      setFileTransferState((prev) => ({
        ...prev,
        receivedFile: { name: fileInfoRef.current!.name, url, size: fileInfoRef.current!.size },
        isTransferring: false,
        progress: 100,
      }));
      toast.success(`File received: ${fileInfoRef.current.name}`);
      fileChunksRef.current = [];
    } catch (error) {
      console.error("Error finalizing file:", error);
      toast.error("Failed to process file");
      setFileTransferState((prev) => ({ ...prev, isTransferring: false }));
    }
  };

  const processWebRTCSignal = async (data) => {
    if (!peerConnectionRef.current) {
      console.warn("No peer connection, setting up new one");
      setupWebRTC();
    }

    const pc = peerConnectionRef.current!;
    const currentState = pc.signalingState;
    console.log(`Processing ${data.type} in state: ${currentState}`);

    try {
      if (data.type === "offer") {
        if (currentState !== "stable") {
          console.warn("Cannot process offer, not in stable state");
          return;
        }
        await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        webSocket?.send(
          JSON.stringify({
            type: "answer",
            answer,
            sender: userId,
            receiver: data.sender,
          })
        );
      } else if (data.type === "answer") {
        if (currentState !== "have-local-offer") {
          console.warn("Cannot process answer, not in have-local-offer state");
          return;
        }
        await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
        while (pendingCandidates.current.length > 0) {
          const candidate = pendingCandidates.current.shift();
          if (candidate) await pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } else if (data.type === "candidate") {
        if (pc.remoteDescription) {
          await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        } else {
          pendingCandidates.current.push(data.candidate);
        }
      }
    } catch (error) {
      console.error("Error processing WebRTC signal:", error);
      toast.error("Failed to process WebRTC signal");
    }
  };

  const sendConnectionRequest = () => {
    if (!webSocket || webSocket.readyState !== WebSocket.OPEN) {
      toast.error("No WebSocket connection");
      return;
    }
    webSocket.send(
      JSON.stringify({
        type: "connection-request",
        sender: userId,
        senderName: "You",
        receiver: peerId,
      })
    );
    setFileTransferState((prev) => ({ ...prev, isWaitingForAcceptance: true }));
    toast.info("Connection request sent...");
    createOffer();
  };

  const acceptConnectionRequest = async (sender: string) => {
    if (!webSocket || webSocket.readyState !== WebSocket.OPEN) {
      toast.error("No WebSocket connection");
      return;
    }
    webSocket.send(
      JSON.stringify({
        type: "connection-accepted",
        sender: userId,
        receiver: sender,
      })
    );
    setFileTransferState((prev) => ({
      ...prev,
      connectionRequests: prev.connectionRequests.filter((req) => req.sender !== sender),
    }));
  };

  const rejectConnectionRequest = (sender: string) => {
    if (!webSocket || webSocket.readyState !== WebSocket.OPEN) return;
    webSocket.send(
      JSON.stringify({
        type: "connection-rejected",
        sender: userId,
        receiver: sender,
      })
    );
    setFileTransferState((prev) => ({
      ...prev,
      connectionRequests: prev.connectionRequests.filter((req) => req.sender !== sender),
    }));
  };

  const initiateConnection = () => {
    if (!webSocket || webSocket.readyState !== WebSocket.OPEN || !peerId.trim()) {
      toast.error("Cannot connect - check WebSocket or peer ID");
      return;
    }
    sendConnectionRequest();
  };

  const addConnectionRequest = (request: { sender: string; senderName?: string; receiver: string }) => {
    setFileTransferState((prev) => ({
      ...prev,
      connectionRequests: [...prev.connectionRequests, request],
    }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4000 * 1024 * 1024) {
      toast.error("File size exceeds 400MB limit");
      return;
    }
    setFileTransferState((prev) => ({ ...prev, file }));
    toast.success(`Selected file: ${file.name}`);
  };

  const sendFile = async () => {
    if (
      !fileTransferState.file ||
      !dataChannelRef.current ||
      dataChannelRef.current.readyState !== "open"
    ) {
      toast.error("Connection not established");
      return;
    }

    setFileTransferState((prev) => ({
      ...prev,
      isTransferring: true,
      progress: 0,
    }));

    const chunkSize = 16384; // 16KB for better throughput and lower latency
    const fileReader = new FileReader();
    let offset = 0;
    let lastProgressUpdate = 0;

    dataChannelRef.current.send(
      JSON.stringify({
        type: "file-info",
        fileInfo: {
          name: fileTransferState.file.name,
          type: fileTransferState.file.type,
          size: fileTransferState.file.size,
        },
      })
    );

    const waitForBuffer = (threshold: number) =>
      new Promise<void>((resolve) => {
        if (dataChannelRef.current && dataChannelRef.current.bufferedAmount <= threshold) {
          resolve();
        } else {
          console.log("Waiting for buffer... Buffered amount:", dataChannelRef.current?.bufferedAmount);
          const checkBuffer = () => {
            if (
              dataChannelRef.current &&
              dataChannelRef.current.bufferedAmount <= threshold
            ) {
              dataChannelRef.current.removeEventListener("bufferedamountlow", checkBuffer);
              resolve();
            }
          };
          dataChannelRef.current?.addEventListener("bufferedamountlow", checkBuffer);
        }
      });

    const sendNextChunk = async () => {
      if (!dataChannelRef.current || dataChannelRef.current.readyState !== "open") {
        toast.error("Data channel closed during transfer");
        return;
      }

      const maxBufferedAmount = 16 * 1024 * 1024; // 16MB
      const bufferThreshold = 12 * 1024 * 1024; // Resume at 12MB

      while (
        offset < fileTransferState.file!.size &&
        dataChannelRef.current.bufferedAmount < maxBufferedAmount
      ) {
        const slice = fileTransferState.file!.slice(offset, offset + chunkSize);
        fileReader.readAsArrayBuffer(slice);

        await new Promise<void>((resolve) => {
          fileReader.onload = (e) => {
            if (
              dataChannelRef.current?.readyState === "open" &&
              e.target?.result instanceof ArrayBuffer
            ) {
              dataChannelRef.current.send(e.target.result);
              offset += e.target.result.byteLength;

              const percent = Math.round((offset / fileTransferState.file!.size) * 100);
              if (percent >= lastProgressUpdate + 1) {
                setFileTransferState((prev) => ({ ...prev, progress: percent }));
                lastProgressUpdate = percent;
              }
            }
            resolve();
          };

          fileReader.onerror = () => {
            console.error("FileReader error");
            toast.error("Failed to read file");
            setFileTransferState((prev) => ({ ...prev, isTransferring: false }));
            resolve();
          };
        });
      }

      if (offset < fileTransferState.file!.size) {
        console.log("Buffer near full, pausing... Buffered amount:", dataChannelRef.current.bufferedAmount);
        await waitForBuffer(bufferThreshold);
        console.log("Buffer cleared, resuming... Buffered amount:", dataChannelRef.current.bufferedAmount);
        await sendNextChunk();
      } else {
        dataChannelRef.current.send(JSON.stringify({ type: "file-complete" }));
        setFileTransferState((prev) => ({
          ...prev,
          isTransferring: false,
          progress: 100,
          file: null, // Reset file after successful send
        }));
        toast.success(`File sent: ${fileTransferState.file!.name}`);
      }
    };

    dataChannelRef.current.bufferedAmountLowThreshold = 12 * 1024 * 1024; // 12MB
    await sendNextChunk();
  };

  const cancelFileTransfer = () => {
    if (dataChannelRef.current?.readyState === "open") {
      dataChannelRef.current.send(JSON.stringify({ type: "transfer-cancelled" }));
    }
    setFileTransferState((prev) => ({
      ...prev,
      isTransferring: false,
      progress: 0,
      file: null,
    }));
    fileChunksRef.current = [];
    fileInfoRef.current = null;
  };

  const isConnected = useCallback(() => {
    return (
      fileTransferState.isRtcConnected &&
      dataChannelRef.current?.readyState === "open"
    );
  }, [fileTransferState.isRtcConnected]);

  return {
    fileTransferState,
    handleFileSelect,
    initiateConnection,
    acceptConnectionRequest,
    rejectConnectionRequest,
    sendFile,
    cancelFileTransfer,
    processWebRTCSignal,
    isConnected,
  };
}