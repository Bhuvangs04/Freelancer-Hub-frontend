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

export interface ConnectionRequest {
  sender: string;
  receiver: string;
  senderName?: string;
}

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

/**
 * Get file icon based on file type
 */
export const getFileTypeIcon = (fileName: string): string => {
  const extension = fileName.split(".").pop()?.toLowerCase() || "";

  // Document types
  if (["pdf", "doc", "docx", "txt", "rtf"].includes(extension)) {
    return "file-text";
  }

  // Image types
  if (["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(extension)) {
    return "image";
  }

  // Video types
  if (["mp4", "mov", "avi", "webm", "mkv"].includes(extension)) {
    return "video";
  }

  // Audio types
  if (["mp3", "wav", "ogg", "flac", "m4a"].includes(extension)) {
    return "audio";
  }

  // Archive types
  if (["zip", "rar", "7z", "tar", "gz"].includes(extension)) {
    return "archive";
  }

  // Code types
  if (
    [
      "js",
      "ts",
      "jsx",
      "tsx",
      "html",
      "css",
      "json",
      "py",
      "rb",
      "php",
      "java",
      "c",
      "cpp",
    ].includes(extension)
  ) {
    return "code";
  }

  // Default
  return "file";
};

/**
 * Generate a unique user ID
 */
export const generateUserId = (): string => {
  return Math.random().toString(36).substring(2, 10);
};

export interface FileTransferState {
  file: File | null;
  progress: number;
  isTransferring: boolean;
  receivedFile: {
    name: string;
    url: string;
    size: number;
  } | null;
  isWaitingForAcceptance?: boolean;
  connectionRequests?: Array<{ sender: string; receiver: string }>;
  isRtcConnected: boolean;
}

export interface WebSocketMessage {
  type: string;
  sender: string;
  receiver: string;
  offer?: RTCSessionDescriptionInit;
  answer?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
  senderName?: string;
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
