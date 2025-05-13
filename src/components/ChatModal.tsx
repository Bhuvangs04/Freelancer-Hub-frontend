import { X, Send } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Message {
  id: number;
  text: string;
  sender: "client" | "freelancer";
  timestamp: Date;
}

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  senderId: string;
  receiverId: string;
}

const ChatModal = ({
  isOpen,
  onClose,
  senderId,
  receiverId,
}: ChatModalProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isBlocked, setIsBlocked] = useState(false); // Track user ban status
  const [newMessage, setNewMessage] = useState("");
  const ws = useRef<WebSocket | null>(null);

  // Function to mask sensitive information (only 10-digit numbers)
  const maskSensitiveInfo = (text: string) => {
    let maskedText = text.replace(
      /\b\d{10}\b/g,
      "{Message is against our policy}"
    );

    // Mask email addresses
    maskedText = maskedText.replace(
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
      "{Message is against our policy}"
    );

    return maskedText;
  };

  useEffect(() => {
    if (!isOpen) return;

    // Fetch previous messages
    fetch(
      `${
        import.meta.env.VITE_API_URL
      }/chat/messages?sender=${senderId}&receiver=${receiverId}`,
      {
        credentials: "include",
      }
    )
      .then((res) => res.json())
      .then((data) => {
        setMessages(
          data.map((msg) => ({
            id: msg._id,
            text: maskSensitiveInfo(msg.message),
            sender: msg.sender === senderId ? "client" : "freelancer",
            timestamp: new Date(msg.timestamp),
          }))
        );
      });

    // WebSocket connection
    ws.current = new WebSocket(`ws: ${import.meta.env.VITE_WS_URL }/${senderId}`);

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          text: maskSensitiveInfo(data.message),
          sender: data.sender === senderId ? "client" : "freelancer",
          timestamp: new Date(),
        },
      ]);
    };

    return () => {
      ws.current?.close();
    };
  }, [isOpen, senderId, receiverId]);

  const handleSend = async () => {
    if (!newMessage.trim() || isBlocked) return;

    const maskedMessage = maskSensitiveInfo(newMessage);
    const msgData = {
      sender: senderId,
      receiver: receiverId,
      message: maskedMessage,
    };

    // Send masked message via REST API to store in DB
    const response = await fetch(`${import.meta.env.VITE_API_URL}/chat/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(msgData),
      credentials: "include",
    });

    if (response.status === 403) {
      setIsBlocked(true); // Disable input if user is blocked
      return;
    }

    // Send masked message via WebSocket for real-time update
    ws.current?.send(JSON.stringify(msgData));

    setMessages([
      ...messages,
      {
        id: messages.length + 1,
        text: maskedMessage,
        sender: "client",
        timestamp: new Date(),
      },
    ]);
    setNewMessage("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 fade-in">
      <div className="chat-modal fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Chat with Freelancer</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-secondary rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message-bubble ${
                message.sender === "client" ? "sent" : "received"
              }`}
              style={{
                alignSelf:
                  message.sender === "client" ? "flex-end" : "flex-start",
                maxWidth: "80%",
              }}
            >
              {message.text}
            </div>
          ))}
        </div>

        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={
                isBlocked
                  ? "You are blocked from sending messages."
                  : "Type your message..."
              }
              className="flex-1"
              disabled={isBlocked}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
            />
            <Button
              onClick={handleSend}
              disabled={isBlocked}
              className="bg-primary hover:bg-primary/90"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;
