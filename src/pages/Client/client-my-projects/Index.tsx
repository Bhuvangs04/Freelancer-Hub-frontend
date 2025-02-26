import { useState } from "react";
import SearchBar from "@/components/SearchBar";
import ProjectGrid from "@/components/ProjectGrid";
import { Project } from "@/lib/types";

// Sample data - in a real app, this would come from an API
const SAMPLE_PROJECTS: Project[] = [
  {
    id: "1",
    title: "E-commerce Website Development",
    description: "Looking for an experienced developer to build a modern e-commerce platform using React and Node.js. The platform should include features like product management, shopping cart, and payment integration.",
    budget: 5000,
    category: "web",
    skills: ["React", "Node.js", "MongoDB", "Payment Integration"],
    deadline: "2024-04-15",
    clientRating: 4.8,
    clientFeedback: "Great communication and reliable delivery on previous projects."
  },
  {
    id: "2",
    title: "Mobile App UI/UX Design",
    description: "Need a talented designer to create a modern and intuitive user interface for a fitness tracking mobile app. The design should be clean, engaging, and follow the latest design trends.",
    budget: 3000,
    category: "design",
    skills: ["UI/UX", "Figma", "Mobile Design", "Prototyping"],
    deadline: "2024-03-30",
    clientRating: 4.5,
    clientFeedback: "Consistently delivers high-quality designs."
  },
  {
    id: "3",
    title: "Content Writing for Tech Blog",
    description: "Seeking an experienced tech writer to create engaging blog posts about emerging technologies, software development, and tech industry trends. Must have strong research skills.",
    budget: 1500,
    category: "writing",
    skills: ["Technical Writing", "SEO", "Research", "Editing"],
    deadline: "2024-03-20",
    clientRating: 4.9,
    clientFeedback: "Excellent writer with deep technical knowledge."
  }
];

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredProjects = SAMPLE_PROJECTS.filter((project) => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || project.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-4">Freelance Projects</h1>
        <p className="text-muted-foreground text-center mb-8">
          Discover exciting opportunities and connect with clients
        </p>
        
        <SearchBar
          onSearchChange={setSearchTerm}
          onCategoryChange={setSelectedCategory}
        />
        
        <ProjectGrid projects={filteredProjects} />
      </div>
    </div>
  );
};

export default Index;