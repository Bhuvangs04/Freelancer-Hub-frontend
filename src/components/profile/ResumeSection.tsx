import { FileText } from "lucide-react";
import { Card } from "@/components/ui/card";

const ResumeSection = ({
  onResumeUpload,
}: {
  onResumeUpload: (file: File) => void;
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onResumeUpload(file); // Pass the file to the parent function
    }
  };

  return (
    <Card className="p-6 space-y-4 shadow-md hover:shadow-lg transition-shadow">
      <div className="flex items-center space-x-2 mb-4">
        <FileText className="w-5 h-5 text-neutral-600" />
        <h2 className="text-lg font-medium text-neutral-800">Resume</h2>
      </div>
      <div className="flex items-center justify-center border-2 border-dashed border-neutral-200 rounded-lg p-6">
        <label className="flex flex-col items-center cursor-pointer">
          <FileText className="w-8 h-8 text-neutral-400 mb-2" />
          <span className="text-sm text-neutral-600">
            Upload your resume (PDF)
          </span>
          <input
            type="file"
            className="hidden"
            accept=".pdf"
            onChange={handleFileChange}
          />
        </label>
      </div>
    </Card>
  );
};

export default ResumeSection;
