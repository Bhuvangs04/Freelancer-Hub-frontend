import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ChatList } from "./ChatList";
import { ChatWindow } from "./ChatWindow";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon, LockIcon } from "lucide-react";

interface Message {
  _id: string;
  sender: string;
  receiver: string;
  message: string;
  timestamp: string;
}

interface ChatUser {
  _id: string;
  username: string;
  profilePictureUrl: string;
  status: string;
  lastMessage?: string;
  unreadCount?: number;
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

const Chat_client = () => {
  const navigate = useNavigate();
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatUsers, setChatUsers] = useState<ChatUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);
  const { toast } = useToast();

  const userId = localStorage.getItem("Chatting_id");

  const containsSensitiveInfo = (message: string): boolean => {
    const phoneRegex = /\b\d{10,15}\b/; // Matches 10-15 digit numbers (adjust as needed)
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/; // Basic email regex
    return phoneRegex.test(message) || emailRegex.test(message);
  };

  useEffect(() => {
    fetchChatUsers();
    initializeWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Add effect to fetch messages when selected user changes
  useEffect(() => {
    if (selectedUser && userId) {
      fetchMessages(userId);
    } else {
      setMessages([]); // Clear messages when no user is selected
    }
  }, [selectedUser, userId]);

  const initializeWebSocket = async () => {
    const ws = new WebSocket(`${import.meta.env.VITE_WS_URL}/chat/${userId}`);

    ws.onopen = () => {
      console.log("WebSocket connected");
    };

    ws.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      if (!data.alreadyStored) {
        try {
          const decryptedMessage = await decryptMessage(
            data.message,
            secretKey
          );
          data.message = decryptedMessage;
          if (!data.timestamp) {
            data.timestamp = new Date().toISOString(); // Assign current time if missing
          }

          if (containsSensitiveInfo(decryptedMessage)) {
            console.warn(
              "Received a message with sensitive info, ignoring it."
            );
            return; // Ignore the message for the receiver
          }
          handleNewMessage(data);
        } catch (error) {
          console.error("Error decrypting message:", error);
        }
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      toast({
        title: "Connection Error",
        description: "Failed to connect to chat server",
        variant: "destructive",
      });
    };

    wsRef.current = ws;
  };

  const fetchChatUsers = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/chat/users`,
        {
          credentials: "include",
        }
      );
      const data = await response.json();
      setChatUsers(data.users);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching chat users:", error);
      setIsLoading(false);
    }
  };

  const fetchMessages = async (userId: string) => {
    if (!selectedUser) return;

    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/chat/messages?sender=${userId}&receiver=${selectedUser._id}`,
        {
          credentials: "include",
        }
      );
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    }
  };

  const handleNewMessage = (message: Message) => {
    setMessages((prev) => [...prev, message]);
    updateChatUserLastMessage(message);
  };

  const updateChatUserLastMessage = (message: Message) => {
    setChatUsers((prev) =>
      prev.map((user) => {
        if (user._id === message.sender) {
          // Only update unread count for the receiver
          return {
            ...user,
            lastMessage: message.message,
            unreadCount: (user.unreadCount || 0) + 1,
          };
        }
        if (user._id === message.receiver) {
          // Update last message but don't increment unread count for sender
          return {
            ...user,
            lastMessage: message.message,
          };
        }
        return user;
      })
    );
  };

  const handleSendMessage = async (message: string) => {
    if (!selectedUser || !message.trim() || !userId) return;

    if (containsSensitiveInfo(message)) {
      console.warn("Cannot send message: Contains sensitive info.");
      toast({
        title: "Warning",
        description:
          "Your message contains sensitive information and was not sent.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/chat/send`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            sender: userId,
            receiver: selectedUser._id,
            message: message.trim(),
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to send message");

      const newMessage = {
        _id: Date.now().toString(),
        sender: userId,
        receiver: selectedUser._id,
        message: message.trim(),
        timestamp: new Date().toISOString(),
      };

      handleNewMessage(newMessage);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const handleSelectUser = (user: ChatUser) => {
    setSelectedUser(user);
  };

  return (
    <div className="min-h-screen hero-gradient-mesh flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[5%] w-[400px] h-[400px] rounded-full bg-purple-500/10 blur-[100px]" />
        <div className="absolute bottom-[10%] right-[10%] w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[120px]" />
      </div>

      <div className="absolute top-4 left-4 z-20">
        <Button
          variant="ghost"
          className="flex gap-2 text-gray-600 hover:text-gray-900 hover:bg-white/50 transition-all rounded-xl"
          onClick={() => navigate(-1)}
        >
          <ArrowLeftIcon width={24} />
          Back
        </Button>
      </div>

      <div className="w-full max-w-7xl h-[85vh] bg-white/60 backdrop-blur-xl border-2 border-white/60 rounded-3xl shadow-2xl overflow-hidden flex relative z-10 glass-card ring-1 ring-gray-900/5">
        <ChatList
          users={chatUsers}
          selectedUser={selectedUser}
          onSelectUser={handleSelectUser}
          isLoading={isLoading}
        />
        <ChatWindow
          selectedUser={selectedUser}
          messages={messages}
          onSendMessage={handleSendMessage}
        />
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 text-gray-400 text-sm z-10">
        <LockIcon className="w-4 h-4" />
        <span>End-to-end encrypted</span>
      </div>
    </div>
  );
};

export default Chat_client;
