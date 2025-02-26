import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, DollarSign, Send, User, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { mockProjects } from "@/lib/mock-data";
import { useState } from "react";

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const project = mockProjects.find(p => p.id === id);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Mock freelancer data (in a real app, this would come from auth)
  const freelancer = {
    name: "John Doe"
  };

  const handleBidSubmit = (e) => {
    e.preventDefault();
    // Handle bid submission logic here
    setIsModalOpen(false);
  };

  const handleResumeUpload = () => {
    // In a real app, this would trigger a file upload or show a stored resume
    console.log("Resume button clicked");
  };

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">Project not found</h1>
          <Button onClick={() => navigate("/")}>Back to Projects</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 animate-in">
      <div className="max-w-3xl mx-auto">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Projects
        </Button>

        <Card>
          <CardContent className="pt-6 space-y-6">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">{project.name}</h1>
              <p className="mt-4 text-muted-foreground">{project.description}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {project.skills.map((skill) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-secondary rounded-lg">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Clock className="h-4 w-4" />
                  Duration
                </div>
                <p className="mt-1 text-2xl font-semibold">{project.duration}</p>
              </div>

              <div className="p-4 bg-secondary rounded-lg">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <DollarSign className="h-4 w-4" />
                  Budget
                </div>
                <p className="mt-1 text-2xl font-semibold">${project.budget.toLocaleString()}</p>
              </div>

              <div className="p-4 bg-secondary rounded-lg">
                <div className="flex items-center gap-2 text-sm font-medium">
                  Experience Level
                </div>
                <p className="mt-1 text-2xl font-semibold">{project.experienceLevel}</p>
              </div>
            </div>

            <div className="flex justify-center pt-6">
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="w-full md:w-auto">
                    Place Bid
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Submit Your Bid</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleBidSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="freelancer-name">Freelancer Name</Label>
                      <div className="flex items-center space-x-2 p-2 bg-muted rounded-md">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{freelancer.name}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bid-amount">Bid Amount ($)</Label>
                      <Input
                        id="bid-amount"
                        type="number"
                        placeholder="Enter your bid amount"
                        min="1"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="delivery-time">Delivery Time (days)</Label>
                      <Input
                        id="delivery-time"
                        type="number"
                        placeholder="Enter delivery time in days"
                        min="1"
                        required
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button type="submit" className="flex-1">
                        <Send className="h-4 w-4 mr-2" />
                        Send Proposal
                      </Button>
                      <Button 
                        type="button" 
                        variant="secondary"
                        onClick={handleResumeUpload}
                        className="flex-1"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Send Resume
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}