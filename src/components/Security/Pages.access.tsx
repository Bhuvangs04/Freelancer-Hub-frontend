import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const useCheckPermission = (role) => {
  const [isAllowed, setIsAllowed] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkPermission = async () => {
      try {
        const response = await axios.post(
          `${
            import.meta.env.VITE_API_URL
          }/security/checkAuth/permission/${role}`,
          {},
          {
            withCredentials: true,
          }
        );

        if (response.data.message) {
          setIsAllowed(true);
        } else {
          setIsAllowed(false);
          navigate("/forbidden");
        }
      } catch (error) {
        console.error("Error checking permission:", error);
        setIsAllowed(false);
        navigate("/forbidden");
      }
    };

    checkPermission();
  }, [role, navigate]);

  return isAllowed;
};

export default useCheckPermission;
