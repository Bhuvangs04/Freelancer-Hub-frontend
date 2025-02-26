import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

// Sample data - in a real app, this would come from an API
const SAMPLE_FREELANCERS = {
  "1": [
    {
      id: "f1",
      name: "John Smith",
      avatar: "/placeholder.svg",
      hourlyRate: 45,
      skills: ["React", "Node.js", "MongoDB"],
      rating: 4.8,
      completedProjects: 32,
      bidAmount: 4500,
      proposalText: "I have extensive experience building e-commerce platforms with React and Node.js."
    },
    {
      id: "f2",
      name: "Sarah Johnson",
      avatar: "/placeholder.svg",
      hourlyRate: 55,
      skills: ["React", "TypeScript", "AWS"],
      rating: 4.9,
      completedProjects: 45,
      bidAmount: 4800,
      proposalText: "I specialize in building scalable e-commerce solutions with a focus on performance."
    }
  ],
  "2": [
    {
      id: "f3",
      name: "Mike Wilson",
      avatar: "/placeholder.svg",
      hourlyRate: 60,
      skills: ["UI/UX", "Figma", "Adobe XD"],
      rating: 4.7,
      completedProjects: 28,
      bidAmount: 2800,
      proposalText: "I can create an intuitive and modern design for your fitness app."
    }
  ],
  "3": [
    {
      id: "f4",
      name: "Emily Chen",
      avatar: "/placeholder.svg",
      hourlyRate: 40,
      skills: ["Technical Writing", "SEO", "Content Strategy"],
      rating: 4.9,
      completedProjects: 56,
      bidAmount: 1400,
      proposalText: "I have a strong background in technical writing and SEO optimization."
    }
  ]
};

const FreelancerProfilesPage = () => {
  const { projectId } = useParams();
  const freelancers = projectId ? SAMPLE_FREELANCERS[projectId] || [] : [];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Freelancer Proposals</h1>
        <div className="space-y-6">
          {freelancers.map((freelancer) => (
            <Card key={freelancer.id} className="w-full hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <img
                      src={freelancer.avatar}
                      alt={freelancer.name}
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <CardTitle className="text-xl">{freelancer.name}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        <span>{freelancer.rating}</span>
                        <span>•</span>
                        <span>{freelancer.completedProjects} projects completed</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">${freelancer.hourlyRate}/hr</div>
                    <div className="text-sm text-muted-foreground">Bid: ${freelancer.bidAmount}</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{freelancer.proposalText}</p>
                <div className="flex flex-wrap gap-2">
                  {freelancer.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FreelancerProfilesPage;