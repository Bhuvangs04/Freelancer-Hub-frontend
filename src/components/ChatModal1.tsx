import React, { useState, useEffect, useRef } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MessageCircle, SmilePlus, Send, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import EmojiPicker from "emoji-picker-react";
import FileSharingModal from "./FileSharingModal";

interface Message {
  _id?: string;
  sender: string;
  receiver: string;
  message: string;
  timestamp: string;
}

interface ChatModalProps {
  freelancerName: string;
  freelancerId: string;
  clientId?: string;
  projectId?: string;
}

async function importEncryptionKey(hexKey: string): Promise<CryptoKey> {
  const keyBuffer = new Uint8Array(
    hexKey.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
  );

  return crypto.subtle.importKey("raw", keyBuffer, { name: "AES-GCM" }, false, [
    "encrypt",
    "decrypt",
  ]);
}

async function decryptMessage(encryptedMessage: string, hexKey: string) {
  try {
    const key = await importEncryptionKey(hexKey);

    const [ivHex, encryptedText, authTagHex] = encryptedMessage.split(":");
    if (!ivHex || !encryptedText || !authTagHex) {
      throw new Error("Invalid encrypted message format");
    }

    const hexToUint8Array = (hex: string) =>
      new Uint8Array(hex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)));

    const iv = hexToUint8Array(ivHex);
    const encrypted = hexToUint8Array(encryptedText);
    const authTag = hexToUint8Array(authTagHex);

    // Combine encrypted text and authTag for decryption
    const encryptedWithAuthTag = new Uint8Array([...encrypted, ...authTag]);

    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      encryptedWithAuthTag
    );

    return new TextDecoder().decode(decrypted);
  } catch (error) {
    console.error("Decryption failed:", error.message);
    return "Decryption error";
  }
}

const secretKey = import.meta.env.VITE_ENCRYPTION_KEY;

export const ChatModal = ({
  freelancerName,
  freelancerId,
  clientId,
  projectId,
}: ChatModalProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const userId = localStorage.getItem("Chatting_id") || clientId;
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const containsSensitiveInfo = (message: string): boolean => {
    const phoneRegex = /\b\d{10,15}\b/; // Matches 10-15 digit numbers (adjust as needed)
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/; // Basic email regex
    return phoneRegex.test(message) || emailRegex.test(message);
  };

  const handleEmojiClick = (emojiObject) => {
    setNewMessage((prev) => prev + emojiObject.emoji);
  };

  // Make sure we have valid IDs for sender and receiver
  const sender = userId;
  const receiver = freelancerId;

  useEffect(() => {
    // Fetch previous messages when the component mounts
    if (sender && receiver) {
      fetchMessages();
    }

    // Initialize WebSocket connection
    initializeWebSocket();

    return () => {
      // Close WebSocket connection when component unmounts
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [sender, receiver]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const initializeWebSocket = async () => {
    if (!sender) return;

    const wsUrl = `${
      import.meta.env.VITE_WS_URL || "ws://localhost:9000"
    }/chat/${sender}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("WebSocket connected");
      setIsConnected(true);
      toast({
        title: "Connected",
        description: "Chat connection established",
      });
    };

    ws.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);

        const decryptedMessage = await decryptMessage(data.message, secretKey);

        data.message = decryptedMessage;

        if (!data.timestamp) {
          data.timestamp = new Date().toISOString(); // Assign timestamp if missing
        }

        if (containsSensitiveInfo(decryptedMessage)) {
          console.warn("Received a message with sensitive info, ignoring it.");
          return;
        }

        if (
          (data.sender === receiver && data.receiver === sender) ||
          (data.sender === sender && data.receiver === receiver)
        ) {
          setMessages((prev) => {
            const messageExists = prev.some(
              (m) =>
                m.message === data.message &&
                m.sender === data.sender &&
                m.receiver === data.receiver &&
                (!m.timestamp ||
                  !data.timestamp ||
                  m.timestamp === data.timestamp)
            );
            if (messageExists) {
              console.warn("Duplicate message detected, skipping");
              return prev;
            }
            const updatedMessages = [...prev, data];
            return updatedMessages;
          });
        } else {
          console.warn("Message does not match sender/receiver criteria");
        }
      } catch (error) {
        console.error("Error handling WebSocket message:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setIsConnected(false);
      toast({
        title: "Connection Error",
        description: "Failed to connect to chat server",
        variant: "destructive",
      });
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
      setIsConnected(false);
    };

    wsRef.current = ws;
  };

  const fetchMessages = async () => {
    if (!sender || !receiver) return;

    setLoading(true);
    try {
      const apiUrl = `${
        import.meta.env.VITE_API_URL || "http://localhost:8000"
      }/chat/messages`;
      const response = await fetch(
        `${apiUrl}?sender=${sender}&receiver=${receiver}`,
        { credentials: "include" }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }

      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast({
        title: "Error",
        description: "Failed to load chat history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !sender || !receiver) return;

    if (containsSensitiveInfo(newMessage)) {
      console.warn("Cannot send message: Contains sensitive info.");
      toast({
        title: "Warning",
        description:
          "Your message contains sensitive information and was not sent.",
        variant: "destructive",
      });
      return;
    }

    // Temporary message optimistically shown in UI
    const tempMessage: Message = {
      sender,
      receiver,
      message: newMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    // Optimistically update UI
    setMessages((prev) => [...prev, tempMessage]);
    setNewMessage("");

    try {
      const apiUrl = `${
        import.meta.env.VITE_API_URL || "http://localhost:8000"
      }/chat/send`;
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          sender,
          receiver,
          message: tempMessage.message,
          projectId, // Include project ID if available
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });

      // Remove the temporary message if it failed to send
      setMessages((prev) => prev.filter((msg) => msg !== tempMessage));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      console.error("Error formatting time:", e);
      return "";
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2">
          <MessageCircle className="h-4 w-4" />
          Chat with {freelancerName}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] flex flex-col h-full">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            Chat with {freelancerName}
            {!isConnected && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
            <FileSharingModal
              recipientId={freelancerId}
              recipientName={freelancerName}
              senderId={sender}
              className="text-gray-400 hover:text-gray-600"
            />
          </SheetTitle>
        </SheetHeader>

        <ScrollArea
          className="flex-1 p-4 my-4 border rounded-md"
          ref={scrollAreaRef}
        >
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div
                    key={msg._id || index}
                    className={`flex ${
                      msg.sender === sender ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`p-3 rounded-lg max-w-[80%] ${
                        msg.sender === sender
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm break-words">{msg.message}</p>
                      <span
                        className={`text-xs ${
                          msg.sender === sender
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground"
                        }`}
                      >
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </ScrollArea>

        <div className="flex gap-2 mt-auto">
          <Input
            placeholder="Type your message..."
            className="flex-1"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!isConnected}
          />
          <button
            type="button"
            className="text-gray-400 hover:text-gray-600"
            title="Add emoji"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <SmilePlus size={20} />
          </button>

          {/* Emoji Picker Dropdown */}
          {showEmojiPicker && (
            <div className="absolute bottom-12 right-0">
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </div>
          )}
          <Button
            size="icon"
            className="shrink-0"
            onClick={sendMessage}
            disabled={!newMessage.trim() || !isConnected}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
