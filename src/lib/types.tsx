export interface Project {
    id: string;
    title: string;
    description: string;
    budget: number;
    category: string;
    skills: string[];
    deadline: string;
    clientRating: number;
    clientFeedback?: string;
  }
  
  export interface FreelancerProfile {
    id: string;
    name: string;
    avatar: string;
    hourlyRate: number;
    skills: string[];
    rating: number;
    completedProjects: number;
    bidAmount: number;
    proposalText: string;
  }