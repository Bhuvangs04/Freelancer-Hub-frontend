import { useState, useEffect, ReactNode } from "react";
import FreelancerProfileSetupModal from "@/components/profile/FreelancerProfileSetupModal";
import ClientProfileSetupModal from "@/components/profile/ClientProfileSetupModal";

interface ProfileSetupGuardProps {
  children: ReactNode;
  role: "freelancer" | "client";
}

const ProfileSetupGuard = ({ children, role }: ProfileSetupGuardProps) => {
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profileComplete, setProfileComplete] = useState(false);

  useEffect(() => {
    checkProfileStatus();
  }, []);

  const checkProfileStatus = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/security/checkAuth/profile-status`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        setProfileComplete(data.profileComplete);
        setShowSetupModal(!data.profileComplete);
      } else {
        // If profile status check fails, show the modal to be safe
        setShowSetupModal(true);
      }
    } catch (error) {
      console.error("Error checking profile status:", error);
      // On error, check localStorage fallback
      const storedComplete = localStorage.getItem("profileComplete");
      if (storedComplete === "true") {
        setProfileComplete(true);
        setShowSetupModal(false);
      } else {
        setShowSetupModal(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileComplete = () => {
    setProfileComplete(true);
    setShowSetupModal(false);
    localStorage.setItem("profileComplete", "true");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-800"></div>
      </div>
    );
  }

  return (
    <>
      {showSetupModal && role === "freelancer" && (
        <FreelancerProfileSetupModal onComplete={handleProfileComplete} />
      )}
      {showSetupModal && role === "client" && (
        <ClientProfileSetupModal onComplete={handleProfileComplete} />
      )}
      {!showSetupModal && children}
    </>
  );
};

export default ProfileSetupGuard;
