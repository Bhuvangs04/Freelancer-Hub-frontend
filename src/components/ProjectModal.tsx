import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ChatModal } from "@/components/ChatModal1";
import { Button } from "./ui/button";

interface Task {
  title: string;
  completed: boolean;
}

interface File {
  name: string;
  size: string;
  url: string;
}

interface Message {
  sender: string;
  message: string;
  timestamp: string;
}

interface Project {
  id?: string;
  _id?: string;
  title: string;
  freelancer?: string;
  freelancerId?: string;
  clientId?: string;
  status: string;
  progress: number;
  dueDate: string;
  budget: number;
  description: string;
  tasks?: Task[];
  files?: File[];
  messages?: Message[];
}

interface ProjectModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

const __id = localStorage.getItem("Chatting_id");

async function importEncryptionKey(hexKey: string): Promise<CryptoKey> {
  const keyBuffer = new Uint8Array(
    hexKey.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
  );

  return crypto.subtle.importKey("raw", keyBuffer, { name: "AES-GCM" }, false, [
    "encrypt",
    "decrypt",
  ]);
}

async function decryptMessage(encryptedMessage: string, hexKey: string) {
  try {
    const key = await importEncryptionKey(hexKey);

    const [ivHex, encryptedText, authTagHex] = encryptedMessage.split(":");
    if (!ivHex || !encryptedText || !authTagHex) {
      throw new Error("Invalid encrypted message format");
    }

    const hexToUint8Array = (hex: string) =>
      new Uint8Array(hex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)));

    const iv = hexToUint8Array(ivHex);
    const encrypted = hexToUint8Array(encryptedText);
    const authTag = hexToUint8Array(authTagHex);

    // Combine encrypted text and authTag for decryption
    const encryptedWithAuthTag = new Uint8Array([...encrypted, ...authTag]);

    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      encryptedWithAuthTag
    );

    return new TextDecoder().decode(decrypted);
  } catch (error) {
    console.error("Decryption failed:", error.message);
    return "Decryption error";
  }
}

const secretKey = import.meta.env.VITE_ENCRYPTION_KEY;

const DecryptedMessage: React.FC<{ encryptedMessage: string }> = ({
  encryptedMessage,
}) => {
  const [decryptedMessage, setDecryptedMessage] = useState<string>("");

  useEffect(() => {
    const decrypt = async () => {
      const message = await decryptMessage(encryptedMessage, secretKey);
      setDecryptedMessage(message);
    };
    decrypt();
  }, [encryptedMessage]);

  return <>{decryptedMessage}</>;
};

export const ProjectModal: React.FC<ProjectModalProps> = ({
  project,
  isOpen,
  onClose,
}) => {
  if (!project) return null;

  const statusColorMap = {
    "in-progress": "bg-blue-100 text-blue-800",
    "on-hold": "bg-yellow-100 text-yellow-800",
    completed: "bg-green-100 text-green-800",
  };

  const statusText = {
    "in-progress": "In Progress",
    "on-hold": "On Hold",
    completed: "Completed",
  };

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <div>
              <DialogTitle className="text-xl">{project.title}</DialogTitle>
              <DialogDescription>
                {project.freelancer && `Freelancer: ${project.freelancer}`}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={statusColorMap[project.status]}>
                {statusText[project.status]}
              </Badge>
              {project.freelancerId && (
                <ChatModal
                  freelancerName={project.freelancer || "Freelancer"}
                  projectId={project.id || project._id}
                  freelancerId={project.freelancerId}
                  clientId={project.clientId}
                />
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Progress</span>
            <span>{project.progress}%</span>
          </div>
          <Progress value={project.progress} className="h-3" />
        </div>

        <Tabs defaultValue="details" className="mt-6">
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 mt-4">
            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-muted-foreground">{project.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Due Date</h4>
                <p className="text-muted-foreground">
                  {formatDate(project.dueDate)}
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Budget</h4>
                <p className="text-muted-foreground">
                  ₹{project.budget.toLocaleString()}
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="mt-4">
            <ul className="space-y-2">
              {project.tasks && project.tasks.length > 0 ? (
                project.tasks.map((task, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      readOnly
                      className="h-4 w-4"
                    />
                    <span
                      className={
                        task.completed
                          ? "line-through text-muted-foreground"
                          : ""
                      }
                    >
                      {task.title}
                    </span>
                  </li>
                ))
              ) : (
                <p className="text-muted-foreground">No tasks available</p>
              )}
            </ul>
          </TabsContent>

          <TabsContent value="files" className="mt-4">
            <ul className="space-y-2">
              {project.files && project.files.length > 0 ? (
                project.files.map((file, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between border p-2 rounded"
                  >
                    <div>
                      <span className="font-medium">{file.name}</span>
                      <span className="text-sm text-muted-foreground ml-2">
                        {file.size}KB
                      </span>
                    </div>
                    <Button
                      onClick={() => window.open(file.url, "_blank")}
                      rel="noopener noreferrer"
                      className="bg-primary text-white px-3 py-1.5 rounded-lg text-sm hover:bg-primary/90 transition"
                    >
                      Download
                    </Button>
                  </li>
                ))
              ) : (
                <p className="text-muted-foreground">No files available</p>
              )}
            </ul>
          </TabsContent>

          <TabsContent value="messages" className="mt-4">
            <div className="space-y-4">
              {project.messages && project.messages.length > 0 ? (
                project.messages.map((msg, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between">
                      {msg.sender === __id ? (
                        <span className="font-medium">Sended</span>
                      ) : (
                        <span className="font-medium">
                          Recieved by {project.freelancer}
                        </span>
                      )}

                      <span className="text-sm text-muted-foreground">
                        {new Date(msg.timestamp).toUTCString()}
                      </span>
                    </div>
                    <p className="text-muted-foreground">
                      <DecryptedMessage encryptedMessage={msg.message} />
                    </p>
                    {index < project.messages!.length - 1 && (
                      <Separator className="mt-2" />
                    )}
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No messages available</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
