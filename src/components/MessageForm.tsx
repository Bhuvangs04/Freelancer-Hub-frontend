import { useState, useRef, useEffect } from "react";
import { Send, User, SmilePlus, Paperclip } from "lucide-react";
import { Project, Message } from "@/types";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import EmojiPicker from "emoji-picker-react";
import FileSharingModal from "@/components/FileSharingModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface MessageFormProps {
  project: Project;
  onProjectUpdate: (updatedProject: Project) => void;
}

export default function MessageForm({
  project,
}: MessageFormProps) {
  const [messageContent, setMessageContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [messages, setMessages] = useState<Message[]>(project?.messages || []);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const userId = localStorage.getItem("Chatting_id"); // Assuming this is the sender ID
  const freelancerId = project?.clientId; // Assuming this exists in project
  const secretKey = import.meta.env.VITE_ENCRYPTION_KEY;

  // Auto-scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // WebSocket and initial setup
  useEffect(() => {
    if (userId && freelancerId) {
      initializeWebSocket();
      fetchMessages();
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [userId, freelancerId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const containsSensitiveInfo = (message: string): boolean => {
    const phoneRegex = /\b\d{10,15}\b/;
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    return phoneRegex.test(message) || emailRegex.test(message);
  };

  async function importEncryptionKey(hexKey: string): Promise<CryptoKey> {
    const keyBuffer = new Uint8Array(
      hexKey.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
    );
    return crypto.subtle.importKey(
      "raw",
      keyBuffer,
      { name: "AES-GCM" },
      false,
      ["encrypt", "decrypt"]
    );
  }

  const handleEmojiClick = (emojiObject) => {
    setMessageContent((prev) => prev + emojiObject.emoji);
  };

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

  const initializeWebSocket = () => {
    if (!userId) return;

    const wsUrl = `${
      import.meta.env.VITE_WS_URL || "ws://localhost:9000"
    }/chat/${userId}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("WebSocket connected");
      setIsConnected(true);
      toast.success("Chat connection established");
    };

    ws.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        const decryptedMessage = await decryptMessage(data.message, secretKey);
        data.message = decryptedMessage;

        if (!data.timestamp) {
          data.timestamp = new Date().toISOString();
        }

        if (containsSensitiveInfo(decryptedMessage)) {
          console.warn("Received message with sensitive info, ignoring");
          return;
        }

        if (
          (data.sender === freelancerId && data.receiver === userId) ||
          (data.sender === userId && data.receiver === freelancerId)
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
            if (!messageExists) {
              return [...prev, data];
            }
            return prev;
          });
        }
      } catch (error) {
        console.error("Error handling WebSocket message:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setIsConnected(false);
      toast.error("Failed to connect to chat server");
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
      setIsConnected(false);
    };

    wsRef.current = ws;
  };

  const fetchMessages = async () => {
    if (!userId || !freelancerId) return;

    try {
      const apiUrl = `${
        import.meta.env.VITE_API_URL || "http://localhost:8000"
      }/chat/messages`;
      const response = await fetch(
        `${apiUrl}?sender=${userId}&receiver=${freelancerId}`,
        { credentials: "include" }
      );

      if (!response.ok) throw new Error("Failed to fetch messages");

      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load chat history");
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!messageContent.trim()) {
      toast.error("Message cannot be empty");
      return;
    }

    if (containsSensitiveInfo(messageContent)) {
      toast.error("Message contains sensitive information and cannot be sent");
      return;
    }

    setIsSending(true);

    const tempMessage: Message = {
      _id: `${userId}-${new Date().getTime()}`,
      sender: userId!,
      senderName: "You",
      receiver: freelancerId!,
      message: messageContent.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMessage]);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/chat/send`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            sender: userId,
            receiver: freelancerId,
            message: tempMessage.message,
            projectId: project._id,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to send message");

      await response.json();
      setMessageContent("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
      setMessages((prev) => prev.filter((msg) => msg !== tempMessage));
    } finally {
      setIsSending(false);
    }
  };

  const formatMessageDate = (dateString: string) => {
    const messageDate = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return `Today at ${format(messageDate, "h:mm a")}`;
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${format(messageDate, "h:mm a")}`;
    } else {
      return format(messageDate, "MMM d, yyyy h:mm a");
    }
  };

  if (!project || !project._id) {
    return (
      <div className="bg-white rounded-xl shadow-sm border animate-in fade-in">
        <div className="p-6 text-center">
          <p className="text-gray-500">
            No project selected or project data is invalid
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border flex flex-col h-[1000px] animate-in fade-in">
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold text-gray-900">Messages</h3>
        <p className="text-sm text-gray-500 mt-1">
          Communicate with {project.clientName} about the project
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 h-96">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Send size={24} className="text-primary" />
            </div>
            <h4 className="text-lg font-medium text-gray-900">
              No messages yet
            </h4>
            <p className="text-sm text-gray-500 mt-2">
              Send a message to start communicating with the client
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.timestamp + message.message} // Using timestamp + message as a unique key
              message={message}
              isFreelancer={message.sender === userId}
              formatMessageDate={formatMessageDate}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t bg-gray-50">
        <form onSubmit={handleSendMessage} className="flex items-end gap-2">
          <div className="relative flex-1">
            <textarea
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              placeholder="Type your message..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              disabled={isSending || !isConnected}
            />
            <div className="absolute bottom-3 right-3 flex space-x-2">
              <Dialog>
                <DialogTrigger asChild>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-600"
                    title="Send file"
                  >
                    <Paperclip size={20} />
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Send File</DialogTitle>
                  </DialogHeader>
                  {userId && freelancerId && (
                    <FileSharingModal
                      senderId={userId}
                      recipientId={freelancerId}
                      recipientName="You"
                      className="text-gray-400 hover:text-gray-600"
                    />
                  )}
                </DialogContent>
              </Dialog>

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
            </div>
          </div>
          <button
            type="submit"
            className={cn(
              "bg-primary text-white px-5 py-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center",
              (isSending || !isConnected) && "opacity-70 pointer-events-none"
            )}
            disabled={isSending || !isConnected}
          >
            <Send size={18} className="mr-2" />
            {isSending ? "Sending..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}

interface MessageBubbleProps {
  message: Message;
  isFreelancer: boolean;
  formatMessageDate: (dateString: string) => string;
}

const MessageBubble = ({
  message,
  isFreelancer,
  formatMessageDate,
}: MessageBubbleProps) => {
  return (
    <div className={cn("flex", isFreelancer ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[80%]",
          isFreelancer
            ? "bg-primary text-white rounded-tl-xl rounded-tr-none rounded-bl-xl rounded-br-xl"
            : "bg-gray-100 text-gray-800 rounded-tl-none rounded-tr-xl rounded-bl-xl rounded-br-xl"
        )}
      >
        <div className="p-4">
          <div className="flex items-center mb-1">
            {!isFreelancer && (
              <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center mr-2">
                <User size={12} className="text-gray-600" />
              </div>
            )}
            <span
              className={cn(
                "text-xs font-medium",
                isFreelancer ? "text-white/90" : "text-gray-600"
              )}
            >
              {message.senderName || (isFreelancer ? "You" : "Client")}
            </span>
          </div>
          <p className="text-sm whitespace-pre-wrap">{message.message}</p>
        </div>
        <div
          className={cn(
            "px-4 pb-2 text-xs",
            isFreelancer ? "text-white/70" : "text-gray-500"
          )}
        >
          {formatMessageDate(message.timestamp)}
        </div>
      </div>
    </div>
  );
};
