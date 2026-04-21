import { useState, useRef, useEffect } from "react";
import { SendHorizontal, User, Info, FolderKanban, ShieldAlert, AlertTriangle } from "lucide-react";
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
  flagged?: boolean;
}

interface ProjectChat {
  projectId: string;
  projectTitle: string;
  chatPartner: {
    _id: string;
    username: string;
    profilePictureUrl: string;
  };
}

interface ChatWindowProps {
  selectedProject: ProjectChat | null;
  messages: Message[];
  onSendMessage: (message: string) => void;
  chatBlocked: string | null;
}

export const ChatWindow = ({
  selectedProject,
  messages,
  onSendMessage,
  chatBlocked,
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
    if (newMessage.trim() && !chatBlocked) {
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

  if (!selectedProject) {
    return (
      <div className="flex-1 flex items-center justify-center bg-transparent h-full">
        <div className="text-center p-8 bg-white/40 backdrop-blur-md rounded-3xl border border-white/40 max-w-sm shadow-xl">
          <div className="mx-auto w-20 h-20 bg-blue-100/50 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
            <Info className="h-10 w-10 text-blue-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Project Messages
          </h3>
          <p className="text-gray-500">
            Select a project conversation from the sidebar to start messaging
            your team member.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-transparent relative">
      {/* Header */}
      <div className="p-4 border-b-2 border-white/50 flex items-center justify-between bg-white/40 backdrop-blur-md z-10">
        <div className="flex items-center space-x-3">
          {selectedProject.chatPartner.profilePictureUrl ? (
            <img
              src={selectedProject.chatPartner.profilePictureUrl}
              alt={selectedProject.chatPartner.username}
              className="h-10 w-10 rounded-full object-cover border border-white shadow-sm"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center border border-white shadow-sm">
              <User className="h-5 w-5 text-gray-500" />
            </div>
          )}

          <div>
            <h3 className="font-semibold text-gray-900">
              {selectedProject.chatPartner.username}
            </h3>
            <div className="flex items-center text-xs text-indigo-500/80 font-medium">
              <FolderKanban className="h-3 w-3 mr-1" />
              {selectedProject.projectTitle}
            </div>
          </div>
        </div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-500 hover:text-gray-900 hover:bg-white/40 rounded-xl"
              >
                <Info className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>View Project Details</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Chat blocked banner */}
      {chatBlocked && (
        <div className="px-4 py-3 bg-red-50/80 border-b border-red-100 flex items-center gap-2 text-red-700 text-sm">
          <ShieldAlert className="h-4 w-4 flex-shrink-0" />
          <span>{chatBlocked}</span>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 styled-scrollbar">
        {Object.keys(groupedMessages).length > 0 ? (
          Object.entries(groupedMessages).map(([date, dateMessages]) => (
            <div key={date}>
              <div className="flex justify-center my-6">
                <div className="bg-white/60 backdrop-blur-md text-xs text-gray-500 px-4 py-1.5 rounded-full border border-white/40 font-medium shadow-sm">
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
                      "flex mb-4 group",
                      isCurrentUser ? "justify-end" : "justify-start"
                    )}
                  >
                    {!isCurrentUser && showAvatar && (
                      <div className="flex-shrink-0 mr-3 self-end mb-1">
                        {selectedProject.chatPartner.profilePictureUrl ? (
                          <img
                            src={selectedProject.chatPartner.profilePictureUrl}
                            alt={selectedProject.chatPartner.username}
                            className="h-8 w-8 rounded-full object-cover border border-white shadow-sm"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center border border-white">
                            <User className="h-4 w-4 text-gray-500" />
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
                          "px-5 py-3 text-sm shadow-md backdrop-blur-sm",
                          isCurrentUser
                            ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl rounded-tr-sm"
                            : "bg-white/80 text-gray-800 border border-white/60 rounded-2xl rounded-tl-sm",
                          message.flagged && isCurrentUser && "ring-2 ring-amber-400/50"
                        )}
                      >
                        <p className="mb-1 leading-relaxed">{message.message}</p>
                        <div
                          className={cn(
                            "text-[10px] flex justify-end items-center gap-1 opacity-70",
                            isCurrentUser ? "text-blue-100" : "text-gray-500"
                          )}
                        >
                          {message.flagged && (
                            <AlertTriangle className="h-3 w-3 text-amber-400" />
                          )}
                          {formatMessageTime(message.timestamp)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        ) : (
          <div className="h-full flex items-center justify-center flex-col gap-4">
            <div className="w-24 h-24 rounded-full bg-blue-100/30 flex items-center justify-center animate-pulse">
              <SendHorizontal className="w-10 h-10 text-blue-400" />
            </div>
            <div className="text-center p-8">
              <p className="text-gray-400 text-lg font-medium">
                No messages yet. Say hello! 👋
              </p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white/40 backdrop-blur-md border-t-2 border-white/50">
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-3 bg-white/60 rounded-2xl p-2 border border-white/50 focus-within:border-blue-500/30 focus-within:ring-2 focus-within:ring-blue-100 transition-all duration-300 shadow-sm"
        >
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={chatBlocked ? "Chat is restricted" : "Type a message..."}
            disabled={!!chatBlocked}
            className="flex-1 bg-transparent border-0 focus-visible:ring-0 text-gray-800 placeholder:text-gray-400 h-10 disabled:opacity-50"
          />

          <Button
            type="submit"
            size="icon"
            className={cn(
              "h-10 w-10 rounded-xl transition-all duration-300",
              newMessage.trim() && !chatBlocked
                ? "bg-gradient-to-tr from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20 hover:scale-105"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            )}
            disabled={!newMessage.trim() || !!chatBlocked}
          >
            <SendHorizontal className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  );
};
