import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Wallet,
  BriefcaseIcon,
  AtSign,
  ClipboardCheck,
  Clock,
  Eye,
  Activity,
  FileText,
  ArrowLeftIcon,
  Info,
} from "lucide-react";
import { ProjectList } from "./Client-profile-project-list";
import { ProfileResponse } from "@/types/profile";
import { useNavigate } from "react-router-dom";

export const ClientProfile = () => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<ProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/client/client/profile`,
          {
            credentials: "include",
          }
        );
        if (!response.ok) throw new Error("Failed to fetch profile");
        const data = await response.json();
        setProfileData(data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xl font-medium text-gray-600"
        >
          Loading profile...
        </motion.div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xl text-red-500 font-medium"
        >
          Failed to load profile
        </motion.div>
      </div>
    );
  }

  const { user, projects = [], total_balance = 0, LogActivity = [] } = profileData;

  const activeProjects = projects.filter((p) => p.status === "open");
  const completedProjects = projects.filter((p) => p.status === "completed");
  const cancelledProjects = projects.filter((p) => p.status === "cancelled");
  const ongoing = projects.filter((p) => p.status === "in_progress");

  const getActivityIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case "viewed profile":
        return <Eye className="w-5 h-5 text-blue-500" />;
      case "added a new project":
        return <FileText className="w-5 h-5 text-green-500" />;
      case "updated profile":
        return <Activity className="w-5 h-5 text-purple-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen hero-gradient-mesh overflow-x-hidden text-gray-900">
      {/* Decorative background elements - Made subtler for light mode */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-purple-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-[150px]" />
      </div>

      <div className="relative z-10">
        <Button
          variant="ghost"
          className="ml-4 py-6 mt-4 flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-white/50 rounded-xl transition-all"
          onClick={() => navigate(-1)}
        >
          <ArrowLeftIcon width={24} />
          Back
        </Button>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto p-4 md:p-8 space-y-8"
        >
          {/* Header Section */}
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="relative group"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
              <img
                src={
                  user?.userId?.profilePictureUrl ||
                  "https://github.com/shadcn.png"
                }
                alt={user?.userId?.username || "Profile"}
                className="relative w-36 h-36 rounded-full object-cover border-4 border-white shadow-xl"
              />
              <div className="absolute bottom-1 right-1 bg-green-500 w-7 h-7 rounded-full border-4 border-white shadow-md" />
            </motion.div>

            <div className="flex-1 text-center md:text-left pt-2">
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl font-bold text-gray-900 tracking-tight"
              >
                {user?.userId?.username || "User"}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-gray-500 flex items-center justify-center md:justify-start gap-2 mt-2 font-medium"
              >
                <AtSign className="w-4 h-4" />
                {user?.userId?.email || "No email"}
              </motion.p>
              {user?.type === "company" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mt-6 flex flex-wrap items-center justify-center md:justify-start gap-4"
                >
                  <div className="flex items-center gap-2 bg-white/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/40 shadow-sm hover:shadow-md transition-all">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <span className="text-gray-700">{user?.companyName}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/40 shadow-sm hover:shadow-md transition-all">
                    <BriefcaseIcon className="w-4 h-4 text-purple-600" />
                    <span className="text-gray-700">{user?.Position}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/40 shadow-sm hover:shadow-md transition-all">
                    <Building2 className="w-4 h-4 text-emerald-600" />
                    <span className="text-gray-700">{user?.Industry}</span>
                  </div>
                </motion.div>
              )}
            </div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-6 bg-white/60 backdrop-blur-xl border-white/40 shadow-xl hover:shadow-2xl hover:bg-white/70 transition-all duration-300 min-w-[200px]">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto bg-emerald-100 rounded-2xl flex items-center justify-center mb-3">
                    <Wallet className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                    Wallet Balance
                  </h3>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    ₹{total_balance.toLocaleString()}
                  </p>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-8">
              <Card className="p-6 bg-white/60 backdrop-blur-xl border-white/40 shadow-xl overflow-hidden rounded-3xl">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-gray-800">
                  <div className="p-2 rounded-lg bg-orange-100">
                    <Activity className="w-5 h-5 text-orange-600" />
                  </div>
                  Recent Activity
                </h2>
                <div className="space-y-4 max-h-[300px] overflow-y-auto styled-scrollbar pr-4">
                  <AnimatePresence>
                    {LogActivity.length > 0 ? (
                      LogActivity.slice(0, 35).map((activity, index) => (
                        <motion.div
                          key={activity._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start gap-4 p-4 rounded-2xl bg-white/40 hover:bg-white/60 border border-white/20 transition-all duration-300"
                        >
                          <div className="p-2.5 rounded-xl bg-white border border-gray-100 shadow-sm">
                            {getActivityIcon(activity.action)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">
                              {activity.action}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(activity.timestamp).toLocaleString(
                                "en-US",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true,
                                }
                              )}
                            </p>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-gray-400 text-center py-12 bg-white/40 rounded-2xl border border-gray-100 border-dashed"
                      >
                        No recent activity
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <p className="text-gray-400 text-xs mt-4 text-center">
                  Showing last 30 activities
                </p>
              </Card>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="p-6 bg-white/60 backdrop-blur-xl border-white/40 shadow-xl rounded-3xl">
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-gray-800">
                    <div className="p-2 rounded-lg bg-red-100">
                      <Clock className="w-5 h-5 text-red-600" />
                    </div>
                    Cancelled Projects
                  </h2>
                  <ProjectList
                    projects={cancelledProjects}
                    emptyMessage="No cancelled projects"
                  />
                  <p className="text-red-500/80 text-xs mt-4 flex items-center gap-2">
                    <Info className="w-3 h-3" />
                    For refunds contact support
                  </p>
                </Card>
              </motion.div>
            </div>

            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="p-6 bg-white/60 backdrop-blur-xl border-white/40 shadow-xl rounded-3xl">
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-gray-800">
                    <div className="p-2 rounded-lg bg-emerald-100">
                      <ClipboardCheck className="w-5 h-5 text-emerald-600" />
                    </div>
                    Active Projects
                  </h2>
                  <ProjectList
                    projects={activeProjects}
                    emptyMessage="No active projects"
                  />
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="p-6 bg-white/60 backdrop-blur-xl border-white/40 shadow-xl rounded-3xl">
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-gray-800">
                    <div className="p-2 rounded-lg bg-blue-100">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    Ongoing Projects
                  </h2>
                  <ProjectList
                    projects={ongoing}
                    emptyMessage="No ongoing projects"
                  />
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="p-6 bg-white/60 backdrop-blur-xl border-white/40 shadow-xl rounded-3xl">
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-gray-800">
                    <div className="p-2 rounded-lg bg-purple-100">
                      <FileText className="w-5 h-5 text-purple-600" />
                    </div>
                    Completed Projects
                  </h2>
                  <ProjectList
                    projects={completedProjects}
                    emptyMessage="No completed projects"
                  />
                </Card>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ClientProfile;
