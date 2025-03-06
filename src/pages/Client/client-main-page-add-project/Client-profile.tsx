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

  const { user, projects, total_balance, LogActivity } = profileData;

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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 overflow-x-hidden">
      <Button
        variant="ghost"
        className="ml-4 py-6 mt-4 flex items-center gap-2 hover:bg-green-400"
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
            className="relative"
          >
            <img
              src={user.userId.profilePictureUrl}
              alt={user.userId.username}
              className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl transition-transform duration-300 hover:scale-105"
            />
            <div className="absolute -bottom-2 right-0 bg-green-500 w-6 h-6 rounded-full border-4 border-white" />
          </motion.div>

          <div className="flex-1 text-center md:text-left">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold text-gray-900"
            >
              {user.userId.username}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-gray-600 flex items-center justify-center md:justify-start gap-2 mt-2"
            >
              <AtSign className="w-4 h-4" />
              {user.userId.email}
            </motion.p>
            {user.type === "company" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mt-6 flex flex-wrap items-center justify-center md:justify-start gap-4"
              >
                <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-all duration-300">
                  <Building2 className="w-4 h-4 text-gray-600" />
                  <span className="text-gray-700">{user.companyName}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-all duration-300">
                  <BriefcaseIcon className="w-4 h-4 text-gray-600" />
                  <span className="text-gray-700">{user.Position}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-all duration-300">
                  <Building2 className="w-4 h-4 text-gray-600" />
                  <span className="text-gray-700">{user.Industry}</span>
                </div>
              </motion.div>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6 bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="text-center">
                <Wallet className="w-8 h-8 mx-auto text-emerald-600" />
                <h3 className="text-lg font-semibold mt-2 text-gray-800">
                  Wallet Balance
                </h3>
                <p className="text-2xl font-bold text-emerald-600 mt-1">
                  ₹{total_balance.toLocaleString()}
                </p>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-8">
            <Card className="p-6 bg-white/90 backdrop-blur-sm overflow-hidden">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Activity className="w-5 h-5" />
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
                        className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50/80 transition-all duration-300"
                      >
                        <div className="p-2 rounded-full bg-gray-50">
                          {getActivityIcon(activity.action)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">
                            {activity.action}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
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
                      className="text-gray-500 text-center py-12 bg-gray-50/50 rounded-xl"
                    >
                      No recent activity
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <p className="text-red-500 text-sm">
                Last 30 activities can be seen.
              </p>
            </Card>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="p-6 bg-white/90 backdrop-blur-sm">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-red-500" />
                  Cancelled Projects
                </h2>
                <ProjectList
                  projects={cancelledProjects}
                  emptyMessage="No cancelled projects"
                />
                <p className="text-red-500 text-sm">
                  Any refund related queries contact{" "}
                  <b>support@freelancer_hub</b> <i>24/7</i> available.
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
              <Card className="p-6 bg-white/90 backdrop-blur-sm">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <ClipboardCheck className="w-5 h-5 text-emerald-500" />
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
              <Card className="p-6 bg-white/90 backdrop-blur-sm">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-500" />
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
              <Card className="p-6 bg-white/90 backdrop-blur-sm">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-500" />
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
  );
};

export default ClientProfile;
