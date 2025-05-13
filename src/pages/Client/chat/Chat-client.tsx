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
    <>
      <div className="absolute top-4 left-4">
        <Button
          variant="ghost"
          className="flex gap-2 hover:bg-green-400"
          onClick={() => navigate(-1)}
        >
          <ArrowLeftIcon width={24} />
          Back
        </Button>
      </div>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="container mx-auto px-4 py-8 flex-grow mt-8">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden h-[calc(100vh-4rem)]">
            <div className="flex h-full">
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
          </div>
        </div>
        <div className="flex justify-center mb-4">
          <LockIcon width={24} className="mr-2 text-red-500" />
          <span className="text-lg text-blue-500">Secure and Private</span>
        </div>
      </div>
    </>
  );
};

export default Chat_client;
