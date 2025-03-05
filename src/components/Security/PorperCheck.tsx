import { Navigate } from "react-router-dom";
import useCheckPermission from "./Pages.access";

const ProtectedRoute = ({ children, role }) => {
  const isAllowed = useCheckPermission(role);

  if (isAllowed === null) return <p>Loading...</p>;
  return isAllowed ? children : <Navigate to="/forbidden" />;
};

export default ProtectedRoute;
