import React, { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { File, Mail, Loader2, X, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker?url";

interface ResumeViewerProps {
  profileImage: string | null;
  resumeUrl: string | null;
  hasPermission: boolean;
  title?: string;
}

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const ResumeViewer: React.FC<ResumeViewerProps> = ({
  profileImage,
  resumeUrl,
  hasPermission,
  title = "Resume",
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleOpen = () => {
    if (hasPermission) {
      setLoading(true);
      setOpen(true);
    }
  };

  useEffect(() => {
    if (hasPermission && resumeUrl && open) {
      const loadingTask = pdfjsLib.getDocument(resumeUrl);
      loadingTask.promise
        .then((pdf) => {
          return pdf.getPage(1).then((page) => {
            const scale = 1.1;
            const viewport = page.getViewport({ scale });
            const canvas = canvasRef.current;
            if (canvas) {
              const context = canvas.getContext("2d");
              canvas.height = viewport.height;
              canvas.width = viewport.width;
              const renderContext = {
                canvasContext: context!,
                viewport: viewport,
              };
              return page.render(renderContext).promise;
            }
          });
        })
        .then(() => setLoading(false))
        .catch((err) => {
          console.error("Error loading PDF:", err);
          setLoading(false);
        });
    }
  }, [resumeUrl, open, hasPermission]);

  return (
    <>
      <Button
        variant="secondary"
        className="w-full group relative overflow-hidden transition-all duration-300 hover:shadow-md bg-white border border-gray-200 hover:bg-gray-50"
        onClick={handleOpen}
      >
        <span className="absolute inset-0 bg-gradient-to-r from-gray-50 to-transparent opacity-50"></span>
        {hasPermission ? (
          <>
            <File className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:scale-110 text-gray-600 group-hover:text-gray-800" />
            <span className="transition-all duration-300 font-medium">
              View Resume
            </span>
          </>
        ) : (
          <>
            <Mail className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:scale-110 text-gray-600 group-hover:text-gray-800" />
            <span className="transition-all duration-300 font-medium">
              Request Resume
            </span>
          </>
        )}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-5xl max-h-[90vh] p-0 overflow-hidden bg-white rounded-2xl shadow-2xl border border-gray-100 animate-scale-in">
          <DialogHeader className="p-4 border-b sticky top-0 bg-white/90 backdrop-blur-md z-10 flex flex-row items-center justify-between">
            <DialogTitle className="text-xl font-medium flex items-center">
              <img
                src={profileImage ?? ""}
                alt={title}
                className="w-12 h-12 rounded-full object-cover"
              />
              <File className="ml-2 h-5 w-5 text-gray-600" />
              {title}
            </DialogTitle>
            <div className="flex items-center gap-2">
              {hasPermission && resumeUrl && (
                <Button
                  disabled
                  variant="outline"
                  size="sm"
                  className="rounded-full h-8 px-3 text-sm font-medium border-gray-100 hover:bg-gray-50 cursor-not-allowed"
                  onClick={() => window.open(resumeUrl, "_blank")}
                >
                  <ArrowDown className="h-3.5 w-3.5 mr-1 text-blue-600" />
                  Membership to Download
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
                className="rounded-full h-8 w-8 transition-all duration-300 hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          <div className="relative flex-1 w-full h-[80vh] overflow-auto bg-gray-50 flex justify-center items-start">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-20">
                <div className="flex flex-col items-center">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">
                    Loading document...
                  </span>
                </div>
              </div>
            )}
            <canvas
              ref={canvasRef}
              className={cn(
                "transition-opacity duration-500",
                loading ? "opacity-0" : "opacity-100"
              )}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ResumeViewer;
