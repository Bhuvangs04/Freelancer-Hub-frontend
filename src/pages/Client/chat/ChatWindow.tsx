import { useState, useRef, useEffect } from "react";
import { SendHorizontal } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
}

interface ChatWindowProps {
  selectedUser: ChatUser | null;
  messages: Message[];
  onSendMessage: (message: string) => void;
}
const userId = localStorage.getItem("Chatting_id");

export const ChatWindow = ({
  selectedUser,
  messages,
  onSendMessage,
}: ChatWindowProps) => {
  const [newMessage, setNewMessage] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const currentUserId = userId; // Replace with actual user ID

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current;
      scrollArea.scrollTop = scrollArea.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage("");
    }
  };

  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 bg-gray-50">
        <div className="text-center text-gray-500">
          <h3 className="text-lg font-medium">Welcome to Messages</h3>
          <p className="mt-1">Select a conversation to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <img
              src={selectedUser.profilePictureUrl}
              alt={selectedUser.username}
              className="w-10 h-10 rounded-full object-cover"
            />
            <span
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                selectedUser.status === "online"
                  ? "bg-green-500"
                  : "bg-gray-400"
              }`}
            />
          </div>
          <div>
            <h2 className="font-semibold">{selectedUser.username}</h2>
            <p className="text-sm text-gray-500">{selectedUser.status}</p>
          </div>
        </div>
      </div>

      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => {
            const isCurrentUser = message.sender === currentUserId;
            return (
              <div
                key={message._id}
                className={`flex ${
                  isCurrentUser ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[70%] px-4 py-2 rounded-xl ${
                    isCurrentUser
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <p className="break-words">{message.message}</p>
                  <span
                    className={`text-xs mt-1 block ${
                      isCurrentUser ? "text-blue-100" : "text-gray-500"
                    }`}
                  >
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      <form onSubmit={handleSend} className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button type="submit" size="icon">
            <SendHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};
