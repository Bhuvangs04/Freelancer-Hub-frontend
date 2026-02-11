import { Navigate } from "react-router-dom";
import useCheckPermission from "./Pages.access";
import ProfileSetupGuard from "./ProfileSetupGuard";

interface ProtectedRouteProps {
  children: React.ReactNode;
  role: "freelancer" | "client";
}

const ProtectedRoute = ({ children, role }: ProtectedRouteProps) => {
  const isAllowed = useCheckPermission(role);

  if (isAllowed === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-800"></div>
      </div>
    );
  }

  if (!isAllowed) {
    return <Navigate to="/forbidden" />;
  }

  return <ProfileSetupGuard role={role}>{children}</ProfileSetupGuard>;
};

export default ProtectedRoute;
