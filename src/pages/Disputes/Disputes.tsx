import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { DollarSign, Briefcase, MessageSquare, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProjectSelector from "./Project.Disputes";
import ImageUploader from "./Image.Disputes";
import api from "./api.disputes";

const DisputeForm = () => {
  const [userType, setUserType] = useState<"client" | "freelancer">("client");
  const [disputeType, setDisputeType] = useState<string>("");
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  // Check authentication on load
  useEffect(() => {
    const user = localStorage.getItem("Chatting_id");
    if (!user) {
      toast.error("You must be logged in to file a dispute");
      navigate("/sign-in", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!disputeType) {
      toast.error("Please select a dispute type");
      return;
    }

    if (!selectedProject) {
      toast.error("Please select a project");
      return;
    }

    if (!description) {
      toast.error("Please provide a description");
      return;
    }

    if (!uploadedImage) {
      toast.error("Please upload an image as evidence");
      return;
    }

    setIsSubmitting(true);

    // Prepare form data for submission
    const formData = new FormData();
    formData.append("disputeType", disputeType);
    formData.append("projectId", selectedProject);
    formData.append("description", description);
    formData.append("userType", userType);
    formData.append("evidence", uploadedImage);

    try {
      const success = await api.submitDispute(formData);

      if (success) {
        toast.success("Your dispute has been submitted successfully");

        // Reset form or navigate
        setTimeout(() => {
          navigate(-1);
        }, 2000);
      }
    } catch (error) {
      console.error("Error submitting dispute:", error);
      toast.error("Failed to submit dispute. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-3xl">
      <Card className="shadow-card overflow-hidden animate-fade-in">
        <CardHeader className="bg-gradient-to-r from-brand-50 to-blue-50 border-b">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center">
              <UserCircle className="h-7 w-7 text-blue-500" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center font-display text-brand-900">
            File a Dispute
          </CardTitle>
          <CardDescription className="text-center text-brand-700 max-w-md mx-auto">
            We're here to help resolve any issues you encounter with your
            projects or payments
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <Tabs
            value={userType}
            onValueChange={(value) =>
              setUserType(value as "client" | "freelancer")
            }
            className="w-full"
          >
            <div className="px-6 pt-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger
                  value="client"
                  className="data-[state=active]:bg-blue-500 data-[state=active]:text-white transition-all"
                >
                  I am a Client
                </TabsTrigger>
                <TabsTrigger
                  value="freelancer"
                  className="data-[state=active]:bg-blue-500 data-[state=active]:text-white transition-all"
                >
                  I am a Freelancer
                </TabsTrigger>
              </TabsList>
            </div>

            <CardContent className="space-y-6 pt-6">
              <TabsContent value="client" className="mt-0">
                {/* Dispute Type Selection - Client */}
                <div className="space-y-2 animate-fade-in">
                  <Label
                    htmlFor="dispute-type-client"
                    className="flex items-center gap-2"
                  >
                    <DollarSign className="h-4 w-4" />
                    Dispute Type
                  </Label>
                  <Select value={disputeType} onValueChange={setDisputeType}>
                    <SelectTrigger id="dispute-type-client">
                      <SelectValue placeholder="Select dispute type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="payment">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          <span>Payment Related</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="project">
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4" />
                          <span>Project Related</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="freelancer" className="mt-0">
                {/* Dispute Type Selection - Freelancer */}
                <div className="space-y-2 animate-fade-in">
                  <Label
                    htmlFor="dispute-type-freelancer"
                    className="flex items-center gap-2"
                  >
                    <DollarSign className="h-4 w-4" />
                    Dispute Type
                  </Label>
                  <Select value={disputeType} onValueChange={setDisputeType}>
                    <SelectTrigger id="dispute-type-freelancer">
                      <SelectValue placeholder="Select dispute type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="payment">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          <span>Payment Related</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="project">
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4" />
                          <span>Project Related</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="withdraw">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          <span>Withdrawal Issue</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              {/* Project Selection - Shown for both tabs if dispute type is selected */}
              {disputeType && (
                <ProjectSelector
                  userType={userType}
                  value={selectedProject}
                  onChange={setSelectedProject}
                />
              )}

              {/* Description - Common for both user types */}
              <div className="space-y-2 animate-fade-in">
                <Label
                  htmlFor="description"
                  className="flex items-center gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  Describe your issue
                </Label>
                <Textarea
                  id="description"
                  placeholder="Please provide details about your dispute..."
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="resize-none border-brand-200 focus:border-brand-400"
                />
                <p className="text-xs text-muted-foreground">
                  Please be specific and include all relevant details to help us
                  resolve your issue quickly.
                </p>
              </div>

              {/* Image Upload - Common for both user types */}
              <ImageUploader onImageChange={setUploadedImage} />
            </CardContent>
          </Tabs>

          <CardFooter className="flex justify-end space-x-4 border-t px-6 py-4 bg-gray-50">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              className="border-brand-200 text-brand-700 hover:bg-brand-50"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 transition-colors"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="mr-2">Submitting...</span>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </>
              ) : (
                "Submit Dispute"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default DisputeForm;
