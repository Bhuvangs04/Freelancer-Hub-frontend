import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MessageCircle, Paperclip, Send } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChatModalProps {
  freelancerName: string;
}

export const ChatModal = ({ freelancerName }: ChatModalProps) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2">
          <MessageCircle className="h-4 w-4" />
          Chat with {freelancerName}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] flex flex-col">
        <SheetHeader>
          <SheetTitle>Chat with {freelancerName}</SheetTitle>
        </SheetHeader>
        
        <ScrollArea className="flex-1 p-4 my-4 border rounded-md">
          <div className="space-y-4">
            <div className="bg-muted p-3 rounded-lg max-w-[80%]">
              <p className="text-sm">Hello! How can I help you today?</p>
              <span className="text-xs text-muted-foreground">10:30 AM</span>
            </div>
          </div>
        </ScrollArea>

        <div className="flex gap-2 mt-auto">
          <Button variant="outline" size="icon" className="shrink-0">
            <Paperclip className="h-4 w-4" />
          </Button>
          <Input placeholder="Type your message..." className="flex-1" />
          <Button size="icon" className="shrink-0">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};