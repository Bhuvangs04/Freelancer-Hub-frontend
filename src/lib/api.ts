import {
  ApiResponse,
  Project,
  TaskFormData,
  MessageFormData,
  ProjectStatus,
} from "@/types";
import { toast } from "sonner";
import axios from "axios";

// Base API URL - replace with your actual backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL;

// Set up axios instance with common headers
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // ✅ Ensures cookies are included in requests
});

// Add auth token to requests if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper to handle API errors
const handleApiError = (
  error,
  customMessage: string
): ApiResponse<any> => {
  console.error(`${customMessage}:`, error);
  const errorMessage = error.response?.data?.message || "An error occurred";
  toast.error(errorMessage);
  return { status: "error", message: errorMessage };
};

// API Functions
export const api = {
  // Initialize the API (no-op for real API)
  init: () => {
    // Nothing to initialize for real API
  },

  // Get all projects
  getProjects: async (): Promise<ApiResponse<Project[]>> => {
    try {
      const response = await apiClient.get(
        `/worksubmission/ongoing/projects/V1`
      );
      return { status: "success", data: response.data };
    } catch (error) {
      return handleApiError(error, "Error fetching projects");
    }
  },

  // Get a single project
  getProject: async (projectId: string): Promise<ApiResponse<Project>> => {
    try {
      const response = await apiClient.get(
        `/worksubmission/projects/${projectId}`
      );
      return { status: "success", data: response.data };
    } catch (error) {
      return handleApiError(error, "Error fetching project details");
    }
  },

  // Add a new task
  addTask: async (
    projectId: string,
    taskData: TaskFormData
  ): Promise<ApiResponse<Project>> => {
    try {
      await apiClient.post(`/worksubmission/tasks`, {
        projectId,
        title: taskData.title,
      });

      // Get updated project after adding task
      const updatedProject = await api.getProject(projectId);
      if (updatedProject.status === "success") {
        toast.success("Task added successfully");
      }
      return updatedProject;
    } catch (error) {
      return handleApiError(error, "Error adding task");
    }
  },

  deleteTask: async (
    projectId: string,
    taskId: string
  ): Promise<ApiResponse<Project>> => {
    try {
      const response = await apiClient.delete(
        `/worksubmission/tasks/${taskId}/${projectId}`
      );

      const updatedProject = await api.getProject(projectId);
      if (updatedProject.status === "success" && response.status === 200) {
        toast.success("Task Deleted successfully");
      }
      return updatedProject;
    } catch (error) {
      return handleApiError(error, "Error Deleted task");
    }
  },

  // Update task status
  updateTaskStatus: async (
    projectId: string,
    taskId: string,
    completed: boolean
  ): Promise<ApiResponse<Project>> => {
    try {
      await apiClient.patch(
        `/worksubmission/tasks/${taskId}`,
        {
          projectId,
          completed,
        }
      );

      // Get updated project after updating task
      const updatedProject = await api.getProject(projectId);
      if (updatedProject.status === "success") {
        toast.success(
          completed ? "Task marked as completed" : "Task marked as incomplete"
        );
      }
      return updatedProject;
    } catch (error) {
      return handleApiError(error, "Error updating task status");
    }
  },

  updateTaskStatusType: async (
    projectId: string,
    status: ProjectStatus
  ): Promise<ApiResponse<Project>> => {
    try {
      // Implement the API call to update task status
      const response = await apiClient.patch(
        `/freelancer/projects/${projectId}/${status}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log(response);

      if (response) {
        toast.success(response.data.messsage);
      }

      const data = await api.getProject(projectId);
      return data;
    } catch (error) {
      console.error("Error updating task status:", error);
      return {
        status: "error",
        message: "Failed to update task status",
      };
    }
  },

  // Add a message
  sendMessage: async (
    projectId: string,
    messageData: MessageFormData
  ): Promise<ApiResponse<Project>> => {
    try {
      await apiClient.post(`/messages`, {
        projectId,
        content: messageData.content,
      });

      // Get updated project after sending message
      const updatedProject = await api.getProject(projectId);
      if (updatedProject.status === "success") {
        toast.success("Message sent successfully");
      }
      return updatedProject;
    } catch (error) {
      return handleApiError(error, "Error sending message");
    }
  },

  // Upload a file
  uploadFile: async (
    projectId: string,
    file: File
  ): Promise<ApiResponse<Project>> => {
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("projectId", projectId);
      formData.append("fileName", file.name);

      // Use axios directly with different Content-Type
      await axios.post(
        `${API_BASE_URL}/worksubmission/upload-file`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true, // ✅ Ensures cookies are sent
        }
      );

      // Get updated project after uploading file
      const updatedProject = await api.getProject(projectId);
      if (updatedProject.status === "success") {
        toast.success("File uploaded successfully");
      }
      return updatedProject;
    } catch (error) {
      return handleApiError(error, "Error uploading file");
    }
  },

  // Delete a file
  deleteFile: async (
    projectId: string,
    fileId: string
  ): Promise<ApiResponse<Project>> => {
    try {
      await apiClient.delete(
        `${API_BASE_URL}/worksubmission/projects/${projectId}/files/${fileId}`
      );

      // Get updated project after deleting file
      const updatedProject = await api.getProject(projectId);
      if (updatedProject.status === "success") {
        toast.success("File deleted successfully");
      }
      return updatedProject;
    } catch (error) {
      return handleApiError(error, "Error deleting file");
    }
  },
};
