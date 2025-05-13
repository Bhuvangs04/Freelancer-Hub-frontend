import React, { useState, useEffect } from "react";
import * as Icons from "lucide-react";

import {
  Menu,
  X,
  Sun,
  Moon,
  Mail,
  MapPin,
  ArrowDownCircle,
  Send,

  Github,
  ExternalLink,
  Briefcase,
  ChevronUp,
} from "lucide-react";
import { useParams } from "react-router-dom";

// Types
interface ApiFreelancer {
  _id: string;
  username: string;
  email: string;
  profilePictureUrl: string;
  experiences: ApiExperience[];
  skills: ApiSkill[];
  oldProjects: ApiProject[];
  bio: string;
  location: string;
  title: string;
}

interface ApiResponse {
  freelancer: ApiFreelancer;
}

interface ApiExperience {
  _id: string;
  company: string;
  role: string;
  period: string;
  description: string;
}

interface ApiSkill {
  _id: string;
  name: string;
  proficiency: string;
}

interface ApiProject {
  _id: string;
  title: string;
  description: string;
  link: string;
}

interface Skill {
  name: string;
  level: number;
  icon: string;
}

interface Experience {
  title: string;
  company: string;
  period: string;
  description: string;
  technologies: string[];
}

interface Project {
  title: string;
  description: string;
  imageUrl: string;
  technologies: string[];
  link?: string;
}

interface SocialLink {
  name: string;
  url: string;
  icon: string;
}

interface PersonalInfo {
  name: string;
  title: string;
  email: string;
  location: string;
  bio: string;
  profileImage: string;
}

interface AppData {
  personalInfo: PersonalInfo;
  skills: Skill[];
  experiences: Experience[];
  projects: Project[];
  socialLinks: SocialLink[];
  isLoading: boolean;
  error: string | null;
}

const fetchFreelancerData = async (username): Promise<ApiResponse> => {
  try {
    const response = await fetch(
      `${
        import.meta.env.VITE_API_URL
      }/freelancer/freelancer/portfolio/${username}/freelancer/view`
    );

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching freelancer data:", error);
    throw error;
  }
};

// Data Transformation Functions
const getProficiencyLevel = (proficiency: string): number => {
  switch (proficiency.toLowerCase()) {
    case "expert":
      return 95;
    case "advanced":
      return 85;
    case "intermediate":
      return 70;
    case "beginner":
    default:
      return 25;
  }
};

const getSkillIcon = (name: string): string => {
  const lowerName = name.toLowerCase().replace(/\.js/g, "").trim();

  if (lowerName.includes("html") || lowerName.includes("css")) return "Code";
  if (lowerName.includes("sass") || lowerName.includes("scss"))
    return "Paintbrush";
  if (lowerName.includes("javascript") || lowerName.includes("typescript"))
    return "FileCode";

  if (
    lowerName.includes("react") ||
    lowerName.includes("next") ||
    lowerName.includes("vite")
  )
    return "LayoutGrid";
  if (
    lowerName.includes("redux") ||
    lowerName.includes("zustand") ||
    lowerName.includes("recoil")
  )
    return "Boxes";
  if (
    lowerName.includes("tailwind") ||
    lowerName.includes("bootstrap") ||
    lowerName.includes("material")
  )
    return "PaintBucket";

  if (lowerName.includes("node") || lowerName.includes("express"))
    return "ServerCog";
  if (lowerName.includes("nestjs") || lowerName.includes("fastify"))
    return "Server";

  if (
    lowerName.includes("mongo") ||
    lowerName.includes("sql") ||
    lowerName.includes("postgres") ||
    lowerName.includes("mysql")
  )
    return "Database";

  if (
    lowerName.includes("api") ||
    lowerName.includes("rest") ||
    lowerName.includes("graphql")
  )
    return "GitBranch";

  if (
    lowerName.includes("git") ||
    lowerName.includes("github") ||
    lowerName.includes("gitlab")
  )
    return "GitBranch";
  if (lowerName.includes("docker") || lowerName.includes("kubernetes"))
    return "Ship";

  if (lowerName.includes("firebase")) return "Flame";
  if (
    lowerName.includes("auth") ||
    lowerName.includes("jwt") ||
    lowerName.includes("oauth")
  )
    return "ShieldCheck";

  if (
    lowerName.includes("figma") ||
    lowerName.includes("adobe") ||
    lowerName.includes("xd")
  )
    return "Palette";

  if (lowerName.includes("linux") || lowerName.includes("ubuntu"))
    return "Terminal";
  if (
    lowerName.includes("python") ||
    lowerName.includes("java") ||
    lowerName.includes("go") ||
    lowerName.includes("c++") ||
    lowerName.includes("c#")
  )
    return "FileCode";

  return "Code";
};

const extractTechnologies = (description: string): string[] => {
  const techKeywords = [
    "React",
    "Node.js",
    "JavaScript",
    "TypeScript",
    "HTML",
    "CSS",
    "MongoDB",
    "SQL",
    "Express",
    "Next.js",
    "Firebase",
    "AWS",
    "GraphQL",
    "REST",
    "API",
    "Git",
    "GitHub",
    "Redux",
  ];

  const technologies = techKeywords.filter((tech) =>
    description.toLowerCase().includes(tech.toLowerCase())
  );

  return technologies.length > 0 ? technologies : ["Web Development"];
};

const getProjectImage = (index: number): string => {
  const defaultImages = [
    "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    "https://images.pexels.com/photos/3182773/pexels-photo-3182773.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    "https://images.pexels.com/photos/1118873/pexels-photo-1118873.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    "https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  ];

  return defaultImages[index % defaultImages.length];
};

const getDefaultSocialLinks = (): SocialLink[] => {
  return [
    { name: "GitHub", url: "https://github.com", icon: "Github" },
    { name: "LinkedIn", url: "https://linkedin.com", icon: "Linkedin" },
    { name: "Twitter", url: "https://twitter.com", icon: "Twitter" },
    { name: "Dribbble", url: "https://dribbble.com", icon: "Dribbble" },
  ];
};

const transformApiData = (apiResponse: ApiResponse): AppData => {
  const { freelancer } = apiResponse;

  const personalInfo: PersonalInfo = {
    name: freelancer.username,
    title: freelancer.title || "Loading title...",
    email: freelancer.email,
    location: freelancer.location || "Loading location...",
    bio: freelancer.bio || "Loading profile information...",
    profileImage:
      freelancer.profilePictureUrl ||
      "https://static.vecteezy.com/system/resources/previews/036/594/092/non_2x/man-empty-avatar-photo-placeholder-for-social-networks-resumes-forums-and-dating-sites-male-and-female-no-photo-images-for-unfilled-user-profile-free-vector.jpg 980w, https://static.vecteezy.com/system/resources/previews/036/594/092/large_2x/man-empty-avatar-photo-placeholder-for-social-networks-resumes-forums-and-dating-sites-male-and-female-no-photo-images-for-unfilled-user-profile-free-vector.jpg 1960w",
  };

  const skills: Skill[] = freelancer.skills.map((skill) => ({
    name: skill.name.split("/")[0].trim(),
    level: getProficiencyLevel(skill.proficiency),
    icon: getSkillIcon(skill.name),
  }));

  const experiences: Experience[] = freelancer.experiences.map((exp) => ({
    title: exp.role,
    company: exp.company,
    period: exp.period,
    description: exp.description,
    technologies: extractTechnologies(exp.description),
  }));

  const projects: Project[] = freelancer.oldProjects.map((project, index) => ({
    title: project.title,
    description: project.description,
    imageUrl: getProjectImage(index),
    technologies: extractTechnologies(project.description),
    link: project.link || "https://github.com",
  }));

  return {
    personalInfo,
    skills,
    experiences,
    projects,
    socialLinks: getDefaultSocialLinks(),
    isLoading: false,
    error: null,
  };
};

const getDefaultData = (): AppData => {
  return {
    personalInfo: {
      name: "Loading...",
      title: "Developer",
      email: "loading@example.com",
      location: "Loading...",
      bio: "Loading profile information...",
      profileImage:
        "https://static.vecteezy.com/system/resources/previews/036/594/092/non_2x/man-empty-avatar-photo-placeholder-for-social-networks-resumes-forums-and-dating-sites-male-and-female-no-photo-images-for-unfilled-user-profile-free-vector.jpg 980w, https://static.vecteezy.com/system/resources/previews/036/594/092/large_2x/man-empty-avatar-photo-placeholder-for-social-networks-resumes-forums-and-dating-sites-male-and-female-no-photo-images-for-unfilled-user-profile-free-vector.jpg 1960w",
    },
    skills: [
      { name: "Loading...", level: 50, icon: "Code" },
      { name: "Loading...", level: 75, icon: "LayoutGrid" },
      { name: "Loading...", level: 85, icon: "FileType" },
    ],
    experiences: [
      {
        title: "Loading...",
        company: "Loading...",
        period: "Present",
        description: "Loading experience information...",
        technologies: ["Loading..."],
      },
    ],
    projects: [
      {
        title: "Loading...",
        description: "Loading project information...",
        imageUrl:
          "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        technologies: ["Loading..."],
      },
    ],
    socialLinks: getDefaultSocialLinks(),
    isLoading: true,
    error: null,
  };
};

// Hook
function useDarkMode() {
  const savedTheme = localStorage.getItem("theme");
  const prefersDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (savedTheme) {
      return savedTheme === "dark";
    }
    return prefersDark;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return { isDarkMode, toggleDarkMode };
}

// Components
const Header: React.FC<{
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  name: string;
}> = ({ isDarkMode, toggleDarkMode, name }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-md py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            {initials}
            <span className="text-indigo-600 dark:text-indigo-400">.</span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <nav>
              <ul className="flex space-x-6">
                {["Home", "Skills", "Experience", "Projects", "Contact"].map(
                  (item) => (
                    <li key={item}>
                      <a
                        href={`#${item.toLowerCase()}`}
                        className="text-gray-700 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400 transition-colors"
                      >
                        {item}
                      </a>
                    </li>
                  )
                )}
              </ul>
            </nav>

            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 transition-colors"
              aria-label={
                isDarkMode ? "Switch to light mode" : "Switch to dark mode"
              }
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>

          <div className="md:hidden flex items-center space-x-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 transition-colors"
              aria-label={
                isDarkMode ? "Switch to light mode" : "Switch to dark mode"
              }
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-700 dark:text-gray-300"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`
        fixed inset-0 bg-white dark:bg-gray-900 z-50 transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"}
        md:hidden
      `}
      >
        <div className="p-4">
          <div className="flex justify-between items-center mb-8">
            <div className="text-xl font-bold text-gray-900 dark:text-white">
              {initials}
              <span className="text-indigo-600 dark:text-indigo-400">.</span>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 text-gray-700 dark:text-gray-300"
              aria-label="Close mobile menu"
            >
              <X size={24} />
            </button>
          </div>

          <nav>
            <ul className="space-y-6">
              {["Home", "Skills", "Experience", "Projects", "Contact"].map(
                (item) => (
                  <li key={item}>
                    <a
                      href={`#${item.toLowerCase()}`}
                      className="block text-xl font-medium text-gray-700 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item}
                    </a>
                  </li>
                )
              )}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

const Hero: React.FC<{ personalInfo: PersonalInfo }> = ({ personalInfo }) => {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center pt-20 pb-16 px-4 md:px-0"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-white dark:from-gray-900 dark:to-gray-800 -z-10" />

      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <div className="space-y-4">
              <div className="inline-block px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-sm font-medium mb-2">
                {personalInfo.title}
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                Hello, I'm{" "}
                <span className="text-indigo-600 dark:text-indigo-400">
                  {personalInfo.name}
                </span>
              </h1>

              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl leading-relaxed">
                {personalInfo.bio}
              </p>

              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-6 text-gray-600 dark:text-gray-400 pt-2">
                <div className="flex items-center">
                  <Mail
                    size={18}
                    className="mr-2 text-indigo-500 dark:text-indigo-400"
                  />
                  <span>{personalInfo.email}</span>
                </div>

                <div className="flex items-center">
                  <MapPin
                    size={18}
                    className="mr-2 text-indigo-500 dark:text-indigo-400"
                  />
                  <span>{personalInfo.location}</span>
                </div>
              </div>

              <div className="pt-6 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <a
                  href="#contact"
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors duration-300 text-center shadow-lg shadow-indigo-600/20"
                >
                  Get in touch
                </a>

                <a
                  href="#projects"
                  className="px-6 py-3 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 font-medium rounded-lg transition-colors duration-300 text-center"
                >
                  View my work
                </a>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
            <div className="relative">
              {/* Circular profile image container */}
              <div className="w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-8 border-white dark:border-gray-800 shadow-xl relative">
                {/* Profile image */}
                <img
                  src={personalInfo.profileImage}
                  alt={personalInfo.name}
                  className="w-full h-full object-cover"
                  loading="eager"
                  decoding="async"
                  style={{ imageRendering: "auto" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <a
          href="#skills"
          className="text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          aria-label="Scroll down"
        >
          <ArrowDownCircle size={28} />
        </a>
      </div>
    </section>
  );
};

const Skills: React.FC<{ skills: Skill[] }> = ({ skills }) => {
  const getIcon = (iconName: string) => {
    const Icon = (Icons)[iconName];
    return Icon ? <Icon size={24} /> : null;
  };

  return (
    <section id="skills" className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            My{" "}
            <span className="text-indigo-600 dark:text-indigo-400">Skills</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Here are the technologies and skills I've mastered throughout my
            professional journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {skills.map((skill, index) => (
            <div
              key={index}
              className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    {getIcon(skill.icon)}
                  </div>
                  <h3 className="ml-4 text-xl font-semibold text-gray-900 dark:text-white">
                    {skill.name}
                  </h3>
                </div>

                <div className="mt-auto">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Proficiency
                    </span>
                    <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                      {skill.level}%
                    </span>
                  </div>

                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div
                      className="bg-indigo-600 dark:bg-indigo-500 h-2.5 rounded-full"
                      style={{ width: `${skill.level}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Experience: React.FC<{ experiences: Experience[] }> = ({
  experiences,
}) => {
  return (
    <section id="experience" className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Work{" "}
            <span className="text-indigo-600 dark:text-indigo-400">
              Experience
            </span>
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            A chronological journey through my professional career and
            achievements.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <div className="absolute left-0 md:left-1/2 transform md:-translate-x-1/2 h-full w-0.5 bg-indigo-200 dark:bg-indigo-900 z-0"></div>

            <div className="space-y-12">
              {experiences.map((experience, index) => (
                <div
                  key={index}
                  className={`relative z-10 flex flex-col md:flex-row ${
                    index % 2 === 0 ? "md:flex-row-reverse" : ""
                  }`}
                >
                  <div className="hidden md:block w-1/2"></div>

                  <div className="absolute top-0 left-0 md:left-1/2 transform -translate-y-1/2 md:-translate-x-1/2 z-10">
                    <div className="w-10 h-10 bg-indigo-600 dark:bg-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                      <Briefcase size={20} className="text-white" />
                    </div>
                  </div>

                  <div
                    className={`pl-12 md:pl-0 md:w-1/2 ${
                      index % 2 === 0 ? "md:pr-16" : "md:pl-16"
                    }`}
                  >
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                      <div className="inline-block px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-sm font-medium mb-4">
                        {experience.period}
                      </div>

                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                        {experience.title}
                      </h3>

                      <p className="text-indigo-600 dark:text-indigo-400 font-medium mb-4">
                        {experience.company}
                      </p>

                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        {experience.description}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {experience.technologies.map((tech, techIndex) => (
                          <span
                            key={techIndex}
                            className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-full text-xs"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Projects: React.FC<{ projects: Project[] }> = ({ projects }) => {
  const [activeProject, setActiveProject] = useState<number | null>(null);

  return (
    <section id="projects" className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Featured{" "}
            <span className="text-indigo-600 dark:text-indigo-400">
              Projects
            </span>
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Take a look at some of the projects I've worked on throughout my
            career.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((project, index) => (
            <div
              key={index}
              className="group rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 bg-gray-50 dark:bg-gray-800"
              onMouseEnter={() => setActiveProject(index)}
              onMouseLeave={() => setActiveProject(null)}
            >
              <div className="relative h-60 overflow-hidden">
                <img
                  src={project.imageUrl}
                  alt={project.title}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                />

                <div
                  className={`absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end`}
                >
                  <div className="p-6 w-full">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-bold text-white">
                        {project.title}
                      </h3>

                      {project.link && (
                        <div className="flex space-x-3">
                          <a
                            href={project.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors text-white"
                            aria-label={`View ${project.title} on GitHub`}
                          >
                            <Github size={20} />
                          </a>
                          <a
                            href={project.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors text-white"
                            aria-label={`Visit ${project.title} website`}
                          >
                            <ExternalLink size={20} />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech, techIndex) => (
                    <span
                      key={techIndex}
                      className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-xs"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Contact: React.FC<{
  socialLinks: SocialLink[];
  personalInfo: PersonalInfo;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  formData: FormData;
  loading: boolean;
}> = ({ socialLinks, personalInfo, handleSubmit, handleChange, formData, loading }) => {
  const getIcon = (iconName: string) => {
    const Icon = (Icons)[iconName];
    return Icon ? <Icon size={20} /> : null;
  };

  return (
    <section id="contact" className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Get In{" "}
            <span className="text-indigo-600 dark:text-indigo-400">Touch</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Have a project in mind or just want to say hello? Feel free to reach
            out!
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Contact Information
              </h3>

              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400 mr-4">
                    <Mail size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Email
                    </h4>
                    <a
                      href={`mailto:${personalInfo.email}`}
                      className="text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                      {personalInfo.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400 mr-4">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Location
                    </h4>
                    <p className="text-gray-900 dark:text-white">
                      {personalInfo.location}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-10">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Connect with me
                </h4>
                <div className="flex space-x-4">
                  {socialLinks.map((social) => (
                    <a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-gray-100 dark:bg-gray-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-full flex items-center justify-center transition-colors"
                      aria-label={social.name}
                    >
                      {getIcon(social.icon)}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-3 bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Send Me a Message
              </h3>
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Name
                    </label>
                    <input
                      name="name"
                      type="text"
                      id="name"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Email
                    </label>
                    <input
                      name="email"
                      type="email"
                      id="email"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
                      placeholder="Your email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Subject
                  </label>
                  <input
                    name="subject"
                    type="text"
                    id="subject"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
                    placeholder="Subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Message
                  </label>
                  <textarea
                    name="message"
                    id="message"
                    rows={5}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors resize-none"
                    placeholder="Your message"
                    value={formData.message}
                    onChange={handleChange}
                  ></textarea>
                </div>

                <button
                  disabled={loading}
                  type="submit"
                  className="inline-flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors duration-300 shadow-lg shadow-indigo-600/20"
                >
                  {loading ? (
                    "Sending..."
                  ) : (
                    <>
                      <Send size={18} className="mr-2" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Footer: React.FC<{ socialLinks: SocialLink[]; name: string }> = ({
  socialLinks,
  name,
}) => {
  const getIcon = (iconName: string) => {
    const Icon = (Icons)[iconName];
    return Icon ? <Icon size={18} /> : null;
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center">
          <button
            onClick={scrollToTop}
            className="p-3 bg-indigo-600 rounded-full mb-8 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20"
            aria-label="Scroll to top"
          >
            <ChevronUp size={24} />
          </button>

          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-2">
              {name.split(" ")[0]}
              <span className="text-indigo-400">{name.split(" ")[1]}</span>
              <span className="text-blue-400"> Freelaner@FreelancerHub</span>
            </h3>
            <p className="text-gray-400">
              Creating digital excellence through innovative solutions. Visit
              our platform FreelancerHub for more amazing freelancers.
            </p>
          </div>

          <div className="flex space-x-4 mb-8">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-800 hover:bg-indigo-600 rounded-full transition-colors"
                aria-label={social.name}
              >
                {getIcon(social.icon)}
              </a>
            ))}
          </div>

          <div className="w-full border-t border-gray-800 pt-8 mt-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm mb-4 md:mb-0">
                © {currentYear} {name}. All rights reserved to FreelancerHub.
              </p>

              <div className="flex space-x-6">
                <a
                  href="https://freelancerhub-five.vercel.app/freelancer-Hub/policy"
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Privacy Policy
                </a>
                <a
                  href="https://freelancerhub-five.vercel.app/freelancer-Hub/policy"
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Terms of Service
                </a>
                <a
                  href="https://freelancerhub-five.vercel.app/freelancer-Hub/policy"
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Cookies
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

function App() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState<AppData>(getDefaultData());
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const username = useParams().username;


  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  

  const handleSubmit = async (e) => {
    e.preventDefault();

if (loading) return;
  setLoading(true);

try {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/freelancer/contact/send-email`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...formData,
        freelanceremail: data.personalInfo.email,
      }),
    }
  );

  const result = await response.json();

  if (result.success) {
    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
    });
    alert("Message sent successfully!");
  } else {
    alert("Failed to send message");
  }
} catch (error) {
  console.error("Error sending message:", error);
  alert("Something went wrong");
} finally {
  setLoading(false);
}
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetchFreelancerData(username);
        const transformedData = transformApiData(response);
        setData(transformedData);
        console.log("Fetched data:", transformedData);
      } catch (error) {
        console.error("Failed to fetch portfolio data:", error);
        setData((prev) => ({
          ...prev,
          isLoading: false,
          error: "Failed to load portfolio data. Please try again later.",
        }));
      }
    };

    loadData();
  }, []);

  if (data.error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Oops! Something went wrong
          </h1>
          <p className="text-gray-600 dark:text-gray-400">{data.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300 ${
        isDarkMode ? "dark" : ""
      }`}
    >
      <Header
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        name={data.personalInfo.name}
      />
      <main>
        <Hero personalInfo={data.personalInfo} />
        <Skills skills={data.skills} />
        <Experience experiences={data.experiences} />
        <Contact
          socialLinks={data.socialLinks}
          personalInfo={data.personalInfo}
          handleSubmit={handleSubmit}
          handleChange={handleChange}
          formData={formData}
          loading={loading}
        />
      </main>
      <Footer socialLinks={data.socialLinks} name={data.personalInfo.name} />
    </div>
  );
}

export default App;