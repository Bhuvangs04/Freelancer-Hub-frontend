import { MessageSquare, FolderKanban } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface ProjectChat {
  projectId: string;
  projectTitle: string;
  chatPartner: {
    _id: string;
    username: string;
    profilePictureUrl: string;
  };
  lastMessage: string;
  lastMessageAt: string | null;
  unreadCount: number;
}

interface ChatListProps {
  projects: ProjectChat[];
  selectedProject: ProjectChat | null;
  onSelectProject: (project: ProjectChat) => void;
  isLoading: boolean;
}

export const ChatList = ({
  projects,
  selectedProject,
  onSelectProject,
  isLoading,
}: ChatListProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProjects = projects.filter(
    (p) =>
      p.projectTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.chatPartner.username.toLowerCase().includes(searchQuery.toLowerCase())
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

  if (projects.length === 0) {
    return (
      <div className="w-80 border-r border-gray-200 flex flex-col items-center justify-center p-4 text-gray-500">
        <FolderKanban className="w-12 h-12 mb-2" />
        <p className="text-center font-medium">No active projects</p>
        <p className="text-center text-sm text-gray-400 mt-1">
          Chat is available once a project is assigned
        </p>
      </div>
    );
  }

  return (
    <div className="w-80 border-r-2 border-white/50 flex flex-col h-full bg-white/30 backdrop-blur-md">
      <div className="p-5 border-b-2 border-white/50 flex-shrink-0">
        <h2 className="text-xl font-bold mb-4 text-gray-800 tracking-tight">
          Project Chats
        </h2>
        <Input
          placeholder="Search projects or users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white/50 border-white/50 text-gray-800 placeholder:text-gray-500 focus-visible:ring-blue-500/20 rounded-xl"
        />
      </div>

      <div className="flex-grow relative">
        <ScrollArea className="h-full">
          <div className="space-y-1 p-2">
            {filteredProjects.map((project) => (
              <button
                key={project.projectId}
                onClick={() => onSelectProject(project)}
                className={`w-full p-4 text-left transition-all duration-200 rounded-xl flex items-center gap-3 group relative overflow-hidden ${
                  selectedProject?.projectId === project.projectId
                    ? "bg-white/60 shadow-inner border border-white/40"
                    : "hover:bg-white/40"
                }`}
              >
                {selectedProject?.projectId === project.projectId && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-full" />
                )}

                <div className="relative flex-shrink-0">
                  <img
                    src={
                      project.chatPartner.profilePictureUrl ||
                      "https://github.com/shadcn.png"
                    }
                    alt={project.chatPartner.username}
                    className="w-12 h-12 rounded-full object-cover border border-white shadow-sm"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <h3
                      className={`font-semibold truncate text-sm ${
                        selectedProject?.projectId === project.projectId
                          ? "text-gray-900"
                          : "text-gray-700 group-hover:text-gray-900"
                      }`}
                    >
                      {project.chatPartner.username}
                    </h3>
                    {project.unreadCount > 0 && (
                      <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded-full shadow-lg shadow-blue-500/30">
                        {project.unreadCount}
                      </span>
                    )}
                  </div>
                  <p
                    className={`text-[11px] truncate font-medium ${
                      selectedProject?.projectId === project.projectId
                        ? "text-blue-600/80"
                        : "text-indigo-500/70"
                    }`}
                  >
                    <FolderKanban className="w-3 h-3 inline mr-1" />
                    {project.projectTitle}
                  </p>
                  {project.lastMessage && (
                    <p
                      className={`text-xs truncate mt-0.5 ${
                        selectedProject?.projectId === project.projectId
                          ? "text-blue-700/80"
                          : "text-gray-500 group-hover:text-gray-700"
                      }`}
                    >
                      {project.lastMessage}
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
