import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string;
  fileName: string;
}

export default function FilePreviewModal({
  isOpen,
  onClose,
  fileUrl,
  fileName,
}: FilePreviewModalProps) {
  const [mounted, setMounted] = useState(false);

  // Handle ESC key press to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEscape);
    setMounted(true);

    // Prevent body scrolling when modal is open
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getPreviewContent = () => {
    const extension = fileName.split(".").pop()?.toLowerCase();

    // Handle images
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension || "")) {
      return (
        <div className="flex items-center justify-center h-full max-h-[80vh]">
          <img
            src={fileUrl}
            alt={fileName}
            className="max-w-full max-h-full object-contain rounded-md shadow-lg"
            loading="lazy"
          />
        </div>
      );
    }

    // Handle PDFs
    if (extension === "pdf") {
      return (
        <iframe
          src={`${fileUrl}#view=FitH`}
          title={fileName}
          className="w-full h-[80vh] border-0 rounded-md"
        />
      );
    }

    // For other file types, show a preview not available message
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="bg-gray-100 p-8 rounded-xl mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mx-auto text-gray-500 mb-4"
          >
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">{fileName}</h3>
        <p className="text-gray-500 mb-6">
          Preview not available for this file type
        </p>
        <Button
          onClick={() => window.open(fileUrl, "_blank")}
          rel="noopener noreferrer"
          className="bg-primary text-white px-4 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors"
        >
          Download to view
        </Button>
      </div>
    );
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4",
        mounted ? "animate-in fade-in duration-300" : ""
      )}
      onClick={onClose}
    >
      <div
        className={cn(
          "bg-white rounded-xl shadow-xl w-full max-w-4xl relative overflow-hidden",
          mounted ? "animate-in zoom-in-95 duration-300" : ""
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-medium truncate pr-2">{fileName}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4">{getPreviewContent()}</div>
      </div>
    </div>
  );
}
