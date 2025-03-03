export interface Project {
  _id: string;
  title: string;
  description: string;
  clientId: string;
  clientName: string;
  freelancerId: string;
  status: string;
  tasks: Task[];
  files: FileDetails[];
  messages: Message[];
  dueDate?: string;
  budget?: number;
  createdAt: string;
  updatedAt: string;
}

export type ProjectStatus = "in-progress" | "on-hold" | "completed";

export interface Task {
  _id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

export interface FileDetails {
  _id: string;
  name: string;
  size: number;
  url: string;
  uploadedAt: string;
}

export interface Message {
  _id: string;
  message: string;
  sender: string;
  senderName: string;
  timestamp: string;
  encrypted?: boolean;
  receiver?: string;
}

export interface ApiResponse<T> {
  status: "success" | "error";
  data?: T;
  message?: string;
}

export interface TaskFormData {
  title: string;
}

export interface MessageFormData {
  content: string;
}

export interface FileUploadResponse {
  message: string;
  fileUrl: string;
}
