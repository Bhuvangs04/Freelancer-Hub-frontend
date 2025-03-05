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
    <div className="w-80 border-r border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <h2 className="text-xl font-semibold mb-4">Messages</h2>
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />
      </div>

      <div className="flex-grow relative">
        <ScrollArea className="h-[calc(100vh-180px)]">
          <div className="space-y-1 p-2">
            {filteredUsers.map((user) => (
              <button
                key={user._id}
                onClick={() => onSelectUser(user)}
                className={`w-full p-4 text-left transition-colors hover:bg-gray-50 rounded-md ${
                  selectedUser?._id === user._id ? "bg-gray-50" : ""
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className="relative">
                    <img
                      src={user.profilePictureUrl}
                      alt={user.username}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <span
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                        user.status === "online"
                          ? "bg-green-500"
                          : "bg-gray-400"
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium truncate">{user.username}</h3>
                      {user.unreadCount ? (
                        <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                          {user.unreadCount}
                        </span>
                      ) : null}
                    </div>
                    {user.lastMessage && (
                      <p className="text-sm text-gray-500 truncate">
                        {user.lastMessage}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
