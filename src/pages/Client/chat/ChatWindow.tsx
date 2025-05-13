import { useState, useRef, useEffect } from "react";
import { SendHorizontal, User, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

export const ChatWindow = ({
  selectedUser,
  messages,
  onSendMessage,
}: ChatWindowProps) => {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const userId = localStorage.getItem("Chatting_id");

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage("");
    }
  };

  const formatMessageTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatMessageDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString([], {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  // Group messages by date
  const groupedMessages: { [key: string]: Message[] } = {};
  messages.forEach((message) => {
    const date = new Date(message.timestamp).toLocaleDateString();
    if (!groupedMessages[date]) {
      groupedMessages[date] = [];
    }
    groupedMessages[date].push(message);
  });

  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
            <Info className="h-8 w-8 text-indigo-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Your Messages
          </h3>
          <p className="text-gray-500 max-w-sm">
            Select a conversation or start a new one to begin messaging
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 h-300 flex flex-col">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {selectedUser.profilePictureUrl ? (
            <img
              src={selectedUser.profilePictureUrl}
              alt={selectedUser.username}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
              <User className="h-5 w-5 text-indigo-600" />
            </div>
          )}

          <div>
            <h3 className="font-medium text-gray-900">
              {selectedUser.username}
            </h3>
            <div className="flex items-center">
              <span
                className={cn(
                  "h-2 w-2 rounded-full mr-2",
                  selectedUser.status === "online"
                    ? "bg-green-500"
                    : selectedUser.status === "away"
                    ? "bg-yellow-500"
                    : "bg-gray-400"
                )}
              />
              <span className="text-sm text-gray-500 capitalize">
                {selectedUser.status}
              </span>
            </div>
          </div>
        </div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon">
                <Info className="h-5 w-5 text-gray-500" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>View Profile</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="flex-1 overflow-y-auto p-2 bg-indigo-50/30">
        {Object.keys(groupedMessages).length > 0 ? (
          Object.entries(groupedMessages).map(([date, dateMessages]) => (
            <div key={date}>
              <div className="flex justify-center my-4">
                <div className="bg-white text-xs text-gray-500 px-3 py-1 rounded-full shadow-sm">
                  {formatMessageDate(dateMessages[0].timestamp)}
                </div>
              </div>

              {dateMessages.map((message, index) => {
                const isCurrentUser = message.sender === userId;
                const showAvatar =
                  index === 0 ||
                  dateMessages[index - 1].sender !== message.sender;

                return (
                  <div
                    key={message._id}
                    className={cn(
                      "flex mb-4",
                      isCurrentUser ? "justify-end" : "justify-start"
                    )}
                  >
                    {!isCurrentUser && showAvatar && (
                      <div className="flex-shrink-0 mr-3">
                        {selectedUser.profilePictureUrl ? (
                          <img
                            src={selectedUser.profilePictureUrl}
                            alt={selectedUser.username}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                            <User className="h-4 w-4 text-indigo-600" />
                          </div>
                        )}
                      </div>
                    )}

                    <div
                      className={cn(
                        "max-w-[70%]",
                        !isCurrentUser && !showAvatar && "ml-11"
                      )}
                    >
                      <div
                        className={cn(
                          "px-4 py-2 rounded-2xl inline-block",
                          isCurrentUser
                            ? "bg-indigo-600 text-white rounded-tr-none"
                            : "bg-white text-gray-800 rounded-tl-none shadow-sm"
                        )}
                      >
                        <p className="mb-1">{message.message}</p>
                        <div
                          className={cn(
                            "text-xs flex justify-end",
                            isCurrentUser ? "text-indigo-200" : "text-gray-500"
                          )}
                        >
                          {formatMessageTime(message.timestamp)}
                        </div>
                      </div>
                    </div>

                    {isCurrentUser && showAvatar && (
                      <div className="flex-shrink-0 ml-3">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                          <User className="h-4 w-4 text-indigo-600" />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center p-8">
              <p className="text-gray-500">No messages yet. Say hello! 👋</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-5 border-t border-gray-200">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="pr-15 bg-gray-50 focus-visible:ring-indigo-500 h-10 text-sm py-1"
            />
          </div>

          <Button
            type="submit"
            variant="default"
            className="bg-indigo-600 hover:bg-indigo-700 h-8 w-8 p-0"
            disabled={!newMessage.trim()}
          >
            <SendHorizontal className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};
