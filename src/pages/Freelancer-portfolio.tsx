import { useState, useEffect, useRef } from "react";
import {
  Github,
  Linkedin,
  Instagram,
  Mail,
  Calendar,
  Briefcase,
  ExternalLink,
  Code,
  User,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useParams } from "react-router-dom";

interface Experience {
  _id: string;
  company: string;
  role: string;
  period: string;
  description: string;
}

interface Skill {
  _id: string;
  name: string;
  proficiency: string;
}

interface Project {
  _id: string;
  title: string;
  description: string;
  link: string;
}

interface FreelancerData {
  _id: string;
  username: string;
  email: string;
  profilePictureUrl: string;
  experiences: Experience[];
  skills: Skill[];
  oldProjects: Project[];
}

const Portfolio = () => {

  const [freelancerData, setFreelancerData] = useState<FreelancerData | null>(
    null
  );
  const username = useParams().username;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleCopyEmail = async () => {
    const email = freelancerData?.email;
    if (email) {
      try {
        await navigator.clipboard.writeText(email);
        alert("Email copied");
      } catch (error) {
        alert("Failed to copy email");
      }
    } else {
      alert("No email found");
    }
  };

   


   useEffect(() => {
     // Smooth scroll behavior
     const smoothScroll = (e: MouseEvent) => {
       const target = e.target as HTMLElement;
       if (target.matches('a[href^="#"]')) {
         e.preventDefault();
         const href = target.getAttribute("href");
         const element = document.querySelector(href || "");
         element?.scrollIntoView({ behavior: "smooth" });
       }
     };

     document.addEventListener("click", smoothScroll);
     return () => document.removeEventListener("click", smoothScroll);
   }, []);



  useEffect(() => {
    const fetchFreelancerData = async () => {
      try {
        console.log("Fetching freelancer data...");
        const response = await fetch(
          `${
            import.meta.env.VITE_API_URL
          }/freelancer/freelancer/portfolio/${username}/freelancer/view`
        );
        if (!response.ok) {
          console.error(
            "Response not OK:",
            response.status,
            response.statusText
          );
          throw new Error(
            `${response.status}.\nPlease contact support at "https://freelancerhub-five.vercel.app" for more information about the portfolio website.Maintained by FreelancerHub Team.`
          );


        }
        const data = await response.json();
        setFreelancerData(data.freelancer);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchFreelancerData();
  }, []);

  // Animation on scroll observer
  const animatedElements = useRef<HTMLElement[]>([]);

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: "0px",
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-in");
          observer.unobserve(entry.target);
        }
      });
    }, options);

    const elements = document.querySelectorAll(".animate-on-scroll");
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, [freelancerData]); // Adding freelancerData as dependency to ensure animations work after data loads

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

 

  if (error || !freelancerData) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <div className="text-red-600 text-smxl font-semibold">
          Error: {error || "Failed to load data"}
        </div>
        <Button
          onClick={() => window.location.reload()}
          className="bg-purple-600 hover:bg-purple-800"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#4c1d95] text-white">
      {/* Hero Section with Particle Effect */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/20 to-[#0f172a]/80" />
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full mix-blend-screen filter blur-xl opacity-70 animate-blob"
              style={{
                backgroundColor: `rgba(${Math.random() * 255}, ${
                  Math.random() * 255
                }, ${Math.random() * 255}, 0.5)`,
                width: `${Math.random() * 400 + 100}px`,
                height: `${Math.random() * 400 + 100}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 10}s`,
                animationDuration: `${Math.random() * 20 + 10}s`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 text-center px-4">
          <Avatar className="w-40 h-40 mx-auto mb-8 border-4 border-purple-400/50 shadow-2xl ring-4 ring-purple-500/20">
            <AvatarImage
              src={freelancerData?.profilePictureUrl}
              alt={freelancerData?.username}
              className="object-cover"
            />
            <AvatarFallback className="bg-gradient-to-br from-purple-600 to-indigo-700">
              <User className="w-16 h-16" />
            </AvatarFallback>
          </Avatar>

          <h1 className="text-6xl md:text-7xl font-bold mb-4 animate-in">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-300 to-indigo-400">
              {freelancerData?.username || "Loading..."}
            </span>
          </h1>
          <p className="text-2xl text-purple-200 mb-8 animate-in opacity-0 delay-200">
            Full Stack Developer & Digital Craftsman
          </p>

          <a
            href="#contact"
            className="inline-flex items-center px-6 py-3 text-lg font-medium text-white bg-purple-600 rounded-full hover:bg-purple-700 transition-all duration-300 transform hover:scale-105 animate-in opacity-0 delay-300"
          >
            <Mail className="mr-2 h-5 w-5" />
            Get In Touch
          </a>
        </div>
      </div>

      {/* Skills Section with Glass Effect */}
      <section className="relative py-20 px-4" id="skills">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
            Technical Arsenal
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {freelancerData?.skills.map((skill) => (
              <div
                key={skill._id}
                className="group relative backdrop-blur-lg bg-white/10 rounded-xl p-6 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <h3 className="text-xl font-semibold mb-2 capitalize">
                    {skill.name}
                  </h3>
                  <div className="inline-block px-3 py-1 bg-purple-500/20 rounded-full text-sm">
                    {skill.proficiency}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Experience Timeline with 3D Effect */}
      <section
        className="relative py-20 px-4 bg-gradient-to-b from-[#0f172a] via-[#1e1b4b] to-[#4c1d95]"
        id="experience"
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
            Professional Journey
          </h2>

          <div className="relative">
            <div className="absolute left-1/2 h-full w-px bg-gradient-to-b from-purple-500 to-pink-500 transform -translate-x-1/2" />

            {freelancerData?.experiences.map((exp, index) => (
              <div
                key={exp._id}
                className={`relative mb-12 ${
                  index % 2 === 0
                    ? "lg:ml-auto lg:pl-24"
                    : "lg:mr-auto lg:pr-24"
                } lg:w-1/2 animate-in opacity-0`}
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className="absolute top-0 left-1/2 w-4 h-4 bg-purple-500 rounded-full transform -translate-x-1/2 lg:left-0 lg:translate-x-0" />

                <Card className="relative backdrop-blur-lg bg-white/10 border-purple-500/20 overflow-hidden group hover:border-purple-500/40 transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <CardContent className="relative z-10 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-purple-300">
                        {exp.company}
                      </h3>
                      <span className="text-sm text-purple-400 flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {exp.period}
                      </span>
                    </div>
                    <p className="text-purple-200 mb-2 flex items-center">
                      <Briefcase className="w-4 h-4 mr-2" />
                      {exp.role}
                    </p>
                    <p className="text-gray-300">{exp.description}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Grid with Hover Effects */}
      <section className="relative py-20 px-4" id="projects">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
            Featured Work
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {freelancerData?.oldProjects.map((project, index) => (
              <div
                key={project._id}
                className="group relative animate-in opacity-0"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <Card className="relative backdrop-blur-lg bg-white/10 border-purple-500/20 overflow-hidden group-hover:border-purple-500/40 transition-all duration-300 transform group-hover:-translate-y-2">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <CardContent className="relative z-10 p-8">
                    <h3 className="text-2xl font-bold mb-4 text-purple-300">
                      {project.title}
                    </h3>
                    <p className="text-gray-300 mb-6 whitespace-pre-line">
                      {project.description}
                    </p>

                    {project.link && (
                      <a
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-purple-300 border border-purple-500/40 rounded-lg hover:bg-purple-500/20 transition-all duration-300"
                      >
                        View Project
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    )}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section with Gradient Border */}
      <section className="relative py-20 px-4" id="contact">
        <div className="max-w-3xl mx-auto">
          <Card className="relative p-1 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 opacity-30 blur-xl" />
            <CardContent className="relative bg-[#0f172a] p-8 rounded-lg">
              <h2 className="text-3xl font-bold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                Let's Create Something Amazing
              </h2>
              <p className="text-purple-200 text-center mb-8">
                Ready to bring your vision to life? Let's collaborate and build
                something extraordinary together.
              </p>
              <div className="flex justify-center">
                <Button
                  onClick={handleCopyEmail}
                  className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full hover:opacity-90 transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                >
                  <Mail className="mr-2 h-5 w-5" />
                  Get In Touch
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Portfolio;
