import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatButtonProps {
  onClick: () => void;
}

const ChatButton = ({ onClick }: ChatButtonProps) => {
  return (
    <Button
      onClick={onClick}
      className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-primary hover:bg-primary/90"
    >
      <MessageCircle className="h-6 w-6 text-white" />
      
    </Button>
  );
};

export default ChatButton;
