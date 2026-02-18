import { MessageSquare } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface ChatUser {
  _id: string;
  username: string;
  profilePictureUrl: string;
  status: string;
  lastMessage?: string;
  unreadCount?: number;
}

interface ChatListProps {
  users: ChatUser[];
  selectedUser: ChatUser | null;
  onSelectUser: (user: ChatUser) => void;
  isLoading: boolean;
}

export const ChatList = ({
  users,
  selectedUser,
  onSelectUser,
  isLoading,
}: ChatListProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="w-80 border-r border-gray-200 p-4 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="w-12 h-12 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="w-80 border-r border-gray-200 flex flex-col items-center justify-center p-4 text-gray-500">
        <MessageSquare className="w-12 h-12 mb-2" />
        <p className="text-center">No conversations yet</p>
      </div>
    );
  }

  return (
    <div className="w-80 border-r-2 border-white/50 flex flex-col h-full bg-white/30 backdrop-blur-md">
      <div className="p-5 border-b-2 border-white/50 flex-shrink-0">
        <h2 className="text-xl font-bold mb-4 text-gray-800 tracking-tight">Messages</h2>
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white/50 border-white/50 text-gray-800 placeholder:text-gray-500 focus-visible:ring-blue-500/20 rounded-xl"
        />
      </div>

      <div className="flex-grow relative">
        <ScrollArea className="h-full">
          <div className="space-y-1 p-2">
            {filteredUsers.map((user) => (
              <button
                key={user._id}
                onClick={() => onSelectUser(user)}
                className={`w-full p-4 text-left transition-all duration-200 rounded-xl flex items-center gap-3 group relative overflow-hidden ${selectedUser?._id === user._id
                  ? "bg-white/60 shadow-inner border border-white/40"
                  : "hover:bg-white/40"
                }`}
              >
                {selectedUser?._id === user._id && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-full" />
                )}

                <div className="relative flex-shrink-0">
                  <img
                    src={user.profilePictureUrl || "https://github.com/shadcn.png"}
                    alt={user.username}
                    className="w-12 h-12 rounded-full object-cover border border-white shadow-sm"
                  />
                  <span
                    className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${user.status === "online"
                      ? "bg-emerald-500 shadow-sm"
                      : "bg-gray-400"
                      }`}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <h3 className={`font-semibold truncate text-sm ${selectedUser?._id === user._id ? "text-gray-900" : "text-gray-700 group-hover:text-gray-900"
                      }`}>
                      {user.username}
                    </h3>
                    {user.unreadCount ? (
                      <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded-full shadow-lg shadow-blue-500/30">
                        {user.unreadCount}
                      </span>
                    ) : null}
                  </div>
                  {user.lastMessage && (
                    <p className={`text-xs truncate ${selectedUser?._id === user._id ? "text-blue-700/80" : "text-gray-500 group-hover:text-gray-700"
                      }`}>
                      {user.lastMessage}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
