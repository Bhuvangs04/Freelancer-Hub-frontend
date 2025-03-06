import { useRef, useState } from "react";
import { Upload, X, CheckCircle, AlertCircle, Image } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ImageUploaderProps {
  onImageChange: (file: File | null) => void;
}

const ImageUploader = ({ onImageChange }: ImageUploaderProps) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      setUploadError("No file selected");
      return;
    }

    // Check if file is an image
    if (!file.type.match("image.*")) {
      setUploadError("Please upload an image file");
      return;
    }

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image size must be less than 5MB");
      return;
    }

    setIsLoading(true);
    setUploadError(null);
    setUploadedImage(file);
    onImageChange(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
      setIsLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setUploadedImage(null);
    setImagePreview(null);
    onImageChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2 animate-fade-in">
      <Label className="flex items-center gap-2 text-brand-800">
        <Image className="h-4 w-4" />
        Upload Evidence (Image Required)
      </Label>

      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center 
          transition-all duration-300 ease-in-out
          ${
            imagePreview
              ? "border-brand-200 bg-brand-50/30"
              : "border-brand-100 hover:border-brand-200 hover:bg-brand-50/50 cursor-pointer"
          }`}
        onClick={() => !imagePreview && fileInputRef.current?.click()}
      >
        {isLoading ? (
          <div className="flex flex-col items-center py-8">
            <div className="w-10 h-10 border-2 border-brand-400 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-brand-700 font-medium">Processing image...</p>
          </div>
        ) : !imagePreview ? (
          <div className="flex flex-col items-center py-6">
            <Upload className="h-10 w-10 text-brand-400 mb-3" />
            <p className="text-brand-700 font-medium mb-1">
              Click to upload an image
            </p>
            <p className="text-gray-500 text-sm">PNG, JPG or GIF (max 5MB)</p>
          </div>
        ) : (
          <div className="relative group">
            <div className="overflow-hidden rounded-md">
              <img
                src={imagePreview}
                alt="Preview"
                className="max-h-64 mx-auto rounded-md transition-transform duration-500 ease-in-out group-hover:scale-[1.02]"
              />
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeImage();
              }}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 shadow-md hover:bg-red-600 transition-colors"
              aria-label="Remove image"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mt-3 flex items-center justify-center gap-2 text-brand-600">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">{uploadedImage?.name}</span>
            </div>
          </div>
        )}

        <Input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleImageUpload}
          aria-label="Upload image"
        />
      </div>

      {uploadError && (
        <div className="text-red-500 text-sm flex items-center gap-1 mt-1 animate-fade-in">
          <AlertCircle className="h-4 w-4" />
          {uploadError}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
