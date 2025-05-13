import { useState, useRef } from "react";
import {
  Upload,
  FileText,
  AlertCircle,
  Clock,
  Trash2,
  Eye,
} from "lucide-react";
import { api } from "@/lib/api";
import { Project, FileDetails } from "@/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";
import FilePreviewModal from "./FilePreviewModal";

interface FileUploadProps {
  project: Project;
  onProjectUpdate: (updatedProject: Project) => void;
}

export default function FileUpload({
  project,
  onProjectUpdate,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // const formatFileSize = (bytes: number): string => {
  //   if (bytes < 1024) return `${bytes} B`;
  //   if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  //   return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  // };

  // const getFileIcon = (fileName: string) => {
  //   const extension = fileName.split(".").pop()?.toLowerCase();

  //   switch (extension) {
  //     case "pdf":
  //       return <FileText size={20} className="text-red-500" />;
  //     case "doc":
  //     case "docx":
  //       return <FileText size={20} className="text-blue-500" />;
  //     case "xls":
  //     case "xlsx":
  //       return <FileText size={20} className="text-green-500" />;
  //     case "jpg":
  //     case "jpeg":
  //     case "png":
  //     case "gif":
  //       return <FileText size={20} className="text-purple-500" />;
  //     default:
  //       return <FileText size={20} className="text-gray-500" />;
  //   }
  // };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Clear any previous errors
    setError(null);

    // Validate file size (10MB limit for demo)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size exceeds 10MB limit");
      return;
    }

    setIsUploading(true);
    try {
      const response = await api.uploadFile(project._id, file);

      if (response.status === "success" && response.data) {
        onProjectUpdate(response.data);
        toast.success(`File "${file.name}" uploaded successfully`);
      } else {
        setError(response.message || "Failed to upload file");
        toast.error(response.message || "Failed to upload file");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setError("Failed to upload file. Please try again.");
      toast.error("Failed to upload file");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    setIsDeleting(fileId);
    setError(null);

    try {
      const response = await api.deleteFile(project._id, fileId);

      if (response.status === "success" && response.data) {
        onProjectUpdate(response.data);
        toast.success("File deleted successfully");
      } else {
        setError(response.message || "Failed to delete file");
        toast.error(response.message || "Failed to delete file");
      }
    } catch (error) {
      console.error("Delete error:", error);
      setError("Failed to delete file. Please try again.");
      toast.error("Failed to delete file");
    } finally {
      setIsDeleting(null);
    }
  };

  // Check if files array exists and has items
  const files = project?.files || [];
  const hasFiles = files.length > 0;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border animate-in fade-in">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Files & Documents
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600 flex items-start">
          <AlertCircle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* File Upload Area */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-gray-200 hover:border-primary/50",
          isUploading && "opacity-70 pointer-events-none"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Upload size={20} className="text-primary" />
        </div>

        <p className="text-sm text-gray-600 text-center mb-2">
          {isDragging
            ? "Drop file here"
            : isUploading
            ? "Uploading..."
            : "Drag & drop a file here, or click to browse"}
        </p>

        <p className="text-xs text-gray-500 text-center">
          Supported formats: PDF, DOC, JPG, PNG, etc. (Max 10MB)
        </p>

        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading}
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className={cn(
            "mt-4 py-2 px-4 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors",
            isUploading && "opacity-70 cursor-not-allowed"
          )}
        >
          {isUploading ? "Uploading..." : "Select File"}
        </button>
      </div>

      {/* File List */}
      {hasFiles ? (
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            Uploaded Files ({files.length})
          </h4>
          <ul className="space-y-2">
            {files.map((file) => (
              <FileItem
                key={file._id}
                file={file}
                onDelete={() => handleDeleteFile(file._id)}
                isDeleting={isDeleting === file._id}
              />
            ))}
          </ul>
        </div>
      ) : (
        <div className="mt-6 text-center py-6 border border-gray-100 rounded-lg bg-gray-50">
          <p className="text-sm text-gray-500">No files uploaded yet</p>
        </div>
      )}
    </div>
  );
}

// File Item Component
interface FileItemProps {
  file: FileDetails;
  onDelete: () => void;
  isDeleting: boolean;
}

const FileItem = ({ file, onDelete, isDeleting }: FileItemProps) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  const fileIcon = (() => {
    const extension = file.name.split(".").pop()?.toLowerCase();

    switch (extension) {
      case "pdf":
        return <FileText size={20} className="text-red-500" />;
      case "doc":
      case "docx":
        return <FileText size={20} className="text-blue-500" />;
      case "xls":
      case "xlsx":
        return <FileText size={20} className="text-green-500" />;
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return <FileText size={20} className="text-purple-500" />;
      default:
        return <FileText size={20} className="text-gray-500" />;
    }
  })();

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <li
      className={cn(
        "group flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50 hover:bg-white transition-colors",
        isDeleting && "opacity-70"
      )}
    >
      <div className="flex items-center min-w-0">
        <div className="p-2 bg-white rounded-md border border-gray-100 mr-3">
          {fileIcon}
        </div>

        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {file.name}
          </p>
          <div className="flex items-center text-xs text-gray-500">
            <span className="truncate">{formatFileSize(file.size)}</span>
            <span className="mx-1.5">•</span>
            <div className="flex items-center">
              <Clock size={12} className="mr-1" />
              <span>{format(new Date(file.uploadedAt), "MMM d, yyyy")}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 ml-4">
        {isDeleting ? (
          <span className="text-xs text-gray-500">Deleting...</span>
        ) : showConfirmDelete ? (
          <>
            <button
              onClick={() => {
                onDelete();
                setShowConfirmDelete(false);
              }}
              className="text-white bg-red-500 hover:bg-red-600 rounded px-2 py-1 text-xs"
            >
              Confirm
            </button>
            <button
              onClick={() => setShowConfirmDelete(false)}
              className="text-gray-600 hover:text-gray-800 rounded px-2 py-1 text-xs"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setPreviewModalOpen(true)}
              className="text-gray-400 hover:text-primary p-1 rounded-full hover:bg-gray-100"
              title="Preview"
            >
              <Eye size={16} />
            </button>
            <button
              onClick={() => setShowConfirmDelete(true)}
              className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-gray-100"
              title="Delete"
              disabled={isDeleting}
            >
              <Trash2 size={16} />
            </button>
          </>
        )}
      </div>

      {/* File Preview Modal */}
      <FilePreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        fileUrl={file.url}
        fileName={file.name}
      />
    </li>
  );
};
