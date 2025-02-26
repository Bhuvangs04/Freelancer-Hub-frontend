import React, { ReactNode, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../redux/store";

interface FreelancerAuthProps {
  children: ReactNode;
}

const FreelancerAuth: React.FC<FreelancerAuthProps> = ({ children }) => {
  const navigate = useNavigate();
  const isAuthenticated = useSelector(
    (state: RootState) => state.user.isAuthenticated
  );

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/sign-in", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null; // Prevents rendering protected content

  return <>{children}</>;
};

export default FreelancerAuth;
