import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ChatList } from "./ChatList";
import { ChatWindow } from "./ChatWindow";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon, LockIcon, ShieldAlert } from "lucide-react";

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
  lastMessage: string;
  lastMessageAt: string | null;
  unreadCount: number;
}

const Chat_client = () => {
  const navigate = useNavigate();
  const [selectedProject, setSelectedProject] = useState<ProjectChat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [projectChats, setProjectChats] = useState<ProjectChat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [chatBlocked, setChatBlocked] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const { toast } = useToast();

  const userId = localStorage.getItem("Chatting_id");

  useEffect(() => {
    fetchProjectChats();
    initializeWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (selectedProject && userId) {
      fetchMessages();
    } else {
      setMessages([]);
    }
  }, [selectedProject, userId]);

  const initializeWebSocket = () => {
    const ws = new WebSocket(`${import.meta.env.VITE_WS_URL}/chat/${userId}`);

    ws.onopen = () => {
      console.log("WebSocket connected");
    };

    ws.onmessage = async (event) => {
      const data = JSON.parse(event.data);

      // Handle error messages
      if (data.type === "error") {
        toast({
          title: "Chat Restricted",
          description: data.message,
          variant: "destructive",
        });
        setChatBlocked(data.message);
        return;
      }

      // Handle violation warnings
      if (data.type === "violation_warning") {
        toast({
          title: "⚠️ Policy Warning",
          description: data.message,
          variant: "destructive",
        });
        return;
      }

      // Handle account restriction
      if (data.type === "account_restricted") {
        setChatBlocked(data.message);
        toast({
          title: "Account Restricted",
          description: data.message,
          variant: "destructive",
        });
        return;
      }

      // Handle typing indicator
      if (data.type === "typing") {
        return;
      }

      // Handle chat messages
      if (data.sender && data.message && !data.alreadyStored) {
        if (data.projectId === selectedProject?.projectId) {
          const newMsg: Message = {
            _id: Date.now().toString(),
            sender: data.sender,
            receiver: data.receiver,
            message: data.message,
            timestamp: new Date().toISOString(),
            flagged: data.flagged,
          };
          setMessages((prev) => [...prev, newMsg]);
        }
        // Update unread counts
        fetchProjectChats();
      }
    };

    ws.onerror = () => {
      toast({
        title: "Connection Error",
        description: "Failed to connect to chat server",
        variant: "destructive",
      });
    };

    wsRef.current = ws;
  };

  const fetchProjectChats = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/chat/projects`,
        { credentials: "include" }
      );

      if (response.status === 403) {
        const data = await response.json();
        setChatBlocked(data.message);
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      setProjectChats(data.projects || []);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching project chats:", error);
      setIsLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!selectedProject) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/chat/messages?projectId=${selectedProject.projectId}`,
        { credentials: "include" }
      );

      if (response.status === 403) {
        const data = await response.json();
        setChatBlocked(data.message);
        return;
      }

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

  const handleSendMessage = async (message: string) => {
    if (!selectedProject || !message.trim() || !userId) return;

    if (chatBlocked) {
      toast({
        title: "Chat Blocked",
        description: chatBlocked,
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/chat/send`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            receiver: selectedProject.chatPartner._id,
            message: message.trim(),
            projectId: selectedProject.projectId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
          setChatBlocked(data.message);
        }
        toast({
          title: "Error",
          description: data.message || "Failed to send message",
          variant: "destructive",
        });
        return;
      }

      // Show violation warning if flagged
      if (data.flagged && data.violationWarning) {
        toast({
          title: "⚠️ Policy Warning",
          description: data.violationWarning,
          variant: "destructive",
        });
      }

      const newMessage: Message = {
        _id: Date.now().toString(),
        sender: userId,
        receiver: selectedProject.chatPartner._id,
        message: message.trim(),
        timestamp: new Date().toISOString(),
        flagged: data.flagged,
      };

      setMessages((prev) => [...prev, newMessage]);

      // Update last message in project list
      setProjectChats((prev) =>
        prev.map((pc) =>
          pc.projectId === selectedProject.projectId
            ? { ...pc, lastMessage: message.trim(), lastMessageAt: new Date().toISOString() }
            : pc
        )
      );
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const handleSelectProject = (project: ProjectChat) => {
    setSelectedProject(project);
    setChatBlocked(null);
    // Clear unread count
    setProjectChats((prev) =>
      prev.map((pc) =>
        pc.projectId === project.projectId ? { ...pc, unreadCount: 0 } : pc
      )
    );
  };

  // Blocked state
  if (chatBlocked && !selectedProject) {
    return (
      <div className="min-h-screen hero-gradient-mesh flex items-center justify-center p-4 md:p-8">
        <div className="text-center p-8 bg-white/60 backdrop-blur-xl rounded-3xl border-2 border-white/60 shadow-2xl max-w-md">
          <div className="mx-auto w-20 h-20 bg-red-100/50 rounded-2xl flex items-center justify-center mb-6">
            <ShieldAlert className="h-10 w-10 text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Chat Access Restricted</h3>
          <p className="text-gray-500 mb-6">{chatBlocked}</p>
          <Button onClick={() => navigate(-1)} variant="outline" className="rounded-xl">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

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
          projects={projectChats}
          selectedProject={selectedProject}
          onSelectProject={handleSelectProject}
          isLoading={isLoading}
        />
        <ChatWindow
          selectedProject={selectedProject}
          messages={messages}
          onSendMessage={handleSendMessage}
          chatBlocked={chatBlocked}
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
