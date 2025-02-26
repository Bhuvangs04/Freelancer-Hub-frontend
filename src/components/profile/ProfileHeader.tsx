import { useState } from "react";
import { User, Image } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";

interface ProfileHeaderProps {
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;

}

const userName = localStorage.getItem("username");
const userEmail = localStorage.getItem("email");

const ProfileHeader = ({ onImageUpload }: ProfileHeaderProps) => {
  // 🔹 Get user data from Redux Persist
  const user = useSelector((state: RootState) => state.user);

  // 🔹 Handle image preview
  const [preview, setPreview] = useState<string | null>(
    user?.profileImage || null
  );

  // 🔹 Handle file selection and set preview
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onloadend = () => {
        setPreview(reader.result as string);
      };

      reader.readAsDataURL(file);
      onImageUpload(e);
    }
  };

  return (
    <Card className="p-6 space-y-4 shadow-md hover:shadow-lg transition-shadow">
      <div className="flex items-center space-x-4">
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-2 border-neutral-200 overflow-hidden bg-neutral-100 flex items-center justify-center">
            {preview ? (
              <img
                src={preview}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-12 h-12 text-neutral-400" />
            )}
          </div>
          <label
            htmlFor="profile-image"
            className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-lg cursor-pointer hover:bg-neutral-50 transition-colors"
          >
            <Image className="w-4 h-4 text-neutral-600" />
            <input
              type="file"
              id="profile-image"
              className="hidden"
              accept="image/*"
              onChange={handleImageChange}
            />
          </label>
        </div>
        <div>
          <h2 className="text-lg font-medium text-neutral-800">
            {userName || "Guest"}
          </h2>
          <p className="text-neutral-500 text-sm">
            {userEmail || "No email provided"}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default ProfileHeader;
