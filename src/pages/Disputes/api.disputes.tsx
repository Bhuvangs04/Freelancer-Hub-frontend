import { toast } from "sonner";

const API_URL = import.meta.env.VITE_DISTPUTES_URL; // Replace with your actual API URL

export interface Project {
  _id: string;
  title: string;
  timestamps: {
    created: string;
    updated: string;
  };
  status: string;
  clientId?: {
    _id: string;
    username: string;
  };
  freelancerId?: {
    _id: string;
    username: string;
  };
}

export interface Client {
  _id: string;
  username: string;
}

// interface User {
//   userId: string;
//   role: "client" | "freelancer";
// }


const getToken = (): string | null => {
  return localStorage.getItem("Chatting_id");
};

const handleError = (error): never => {
  console.error("API Error:", error);

  let message = "An unexpected error occurred";

  if (error.response) {
    // Server responded with a status code outside of 2xx range
    message = error.response.data.message || `Error: ${error.response.status}`;
  } else if (error.request) {
    // Request was made but no response received
    message = "No response from server. Please check your internet connection.";
  } else {
    // Something happened in setting up the request
    message = error.message || message;
  }

  toast.error(message);
  throw error;
};

const api = {
  /**
   * Fetch projects for a client
   */
  getClientProjects: async (): Promise<Project[]> => {
    try {


      const token = getToken();
      if (!token) {
        toast.error("Authentication token missing");
        return [];
      }

      const response = await fetch(
        `${API_URL}/admin/get/reports/client/${token}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        handleError(errorData);
        toast.error(errorData.message || "Failed to load projects");
        return [];
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching client projects:", error);
      toast.error("Failed to load projects. Please try again later.");
      return [];
    }
  },

  /**
   * Fetch projects for a freelancer
   */
  getFreelancerProjects: async (): Promise<Project[]> => {
    try {
 

      const token = getToken();
      if (!token) {
        toast.error("Authentication token missing");
        return [];
      }

      const response = await fetch(
        `${API_URL}/admin/get/reports/freelancer/${token}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        handleError(errorData);
        toast.error(errorData.message || "Failed to load projects");
        return [];
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching freelancer projects:", error);
      toast.error("Failed to load projects. Please try again later.");
      return [];
    }
  },

  /**
   * Submit a dispute
   */
  submitDispute: async (formData: FormData): Promise<boolean> => {
    try {

      const token = getToken();
      if (!token) {
        toast.error("Authentication token missing");
        return false;
      }

      const response = await fetch(`${API_URL}/admin/disputes/raised`, {
        method: "POST",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to submit dispute");
        return false;
      }

      toast.success("Dispute submitted successfully");
      return true;
    } catch (error) {
      console.error("Error submitting dispute:", error);
      toast.error("Failed to submit dispute. Please try again later.");
      return false;
    }
  },
};

export default api;
