export interface User {
  username: string;
  email: string;
  profilePictureUrl: string;
}

export interface Company {
  companyName: string;
  Industry: string;
  Position: string;
  type: "individual" | "company";
  userId: User;
}

export interface Project {
  _id: string;
  title: string;
  description: string;
  budget: number;
  deadline: string;
  skillsRequired: string[];
  status: string;
  freelancerId: string;
  createdAt: string;
}

export interface LogActivity {
  _id: string;
  action: string;
  timestamp: string;
}

export interface ProfileResponse {
  user: Company;
  projects: Project[];
  total_balance: number;
  LogActivity: LogActivity[];
}
