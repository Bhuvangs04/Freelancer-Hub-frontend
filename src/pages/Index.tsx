import { useEffect } from "react";
import { ArrowRight, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { cn } from "@/lib/utils";
import { TestimonialCard } from "@/components/TestimonialCard";

export default function FreelancerEntryPage() {
  // Features list
  const features = [
    {
      title: "Project Management",
      description:
        "Track projects, deadlines, and status updates all in one place.",
    },
    {
      title: "Task Tracking",
      description:
        "Create, assign, and update tasks to keep your workflow organized.",
    },
    {
      title: "Client Communication",
      description:
        "Seamless messaging system to communicate with clients directly.",
    },
    {
      title: "File Management",
      description: "Upload, download, and manage project files efficiently.",
    },
    {
      title: "Progress Insights",
      description:
        "Get visual insights into project progress and completion rates.",
    },
    {
      title: "Collaboration Tools",
      description: "Work together with clients and team members effortlessly.",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Web Developer",
      content: "Found amazing clients and doubled my income within 6 months!",
      rating: 5,
      image:
        "https://freelancersdetails.s3.eu-north-1.amazonaws.com/profile-pictures/67b0871b5bafb5f82e3be48e-profile.jpg",
    },
    {
      name: "Harish P C",
      role: "UI/UX Designer",
      content:
        "Great community and excellent support for freelancers.Now my salary is 7 digit.",
      rating: 5,
      image:
        "https://freelancersdetails.s3.eu-north-1.amazonaws.com/profile-pictures/67b2f5836b2b8b84ff68e707-profile.jpg",
    },
    {
      name: "Manjunath Lakkundi",
      role: "Content Writer",
      content: "Great community and excellent support for freelancers.",
      rating: 4,
      image:
        "https://freelancersdetails.s3.eu-north-1.amazonaws.com/profile-pictures/67bc02e8aab3488265e705e6-profile.jpg",
    },
  ];

  // Show welcome toast on first load
  useEffect(() => {
    toast("Welcome to TaskBridge", {
      description:
        "A modern platform for freelancers to manage their projects.",
      position: "bottom-right",
    });
  }, []);

  return (
    <div className="min-h-screen bg-white animate-in fade-in">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-40 pb-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-white"></div>
          <div className="absolute top-1/4 -right-64 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 -left-64 w-96 h-96 bg-blue-100 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-8 animate-in slide-up">
              <span className="mr-2">✨</span>
              The ultimate platform for freelancers
            </div>

            <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6 tracking-tight leading-tight animate-in slide-up animate-delay-100">
              Simplify Your Freelance Project Management
            </h1>

            <p className="text-xl text-gray-600 mb-10 animate-in slide-up animate-delay-200">
              Seamlessly track tasks, communicate with clients, and manage
              files. TaskBridge helps you stay organized and deliver outstanding
              work.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 animate-in slide-up animate-delay-300">
              <Link
                to="/freelancer-Hub/policy"
                className="px-8 py-3 bg-white text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50 hover:-translate-y-0.5 transition-all"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600">
              Our platform offers all the tools freelancers need to manage
              projects efficiently.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                title={feature.title}
                description={feature.description}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto bg-gradient-to-r from-primary to-blue-500 rounded-2xl shadow-xl overflow-hidden">
            <div className="flex flex-col md:flex-row items-center">
              <div className="p-12 md:w-1/2 text-white">
                <h2 className="text-3xl font-bold mb-4 leading-tight">
                  Ready to Streamline Your Freelance Business?
                </h2>
                <p className="text-white/80 mb-8">
                  Join thousands of freelancers who are already managing their
                  projects more efficiently with TaskBridge.
                </p>
                <Link
                  to="/sign-up"
                  className="inline-flex items-center px-6 py-3 bg-white text-primary font-medium rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Get Started <ArrowRight size={16} className="ml-2" />
                </Link>
              </div>
              <div className="md:w-1/2 p-12 bg-white/10 backdrop-blur-sm hidden md:block">
                <div className="bg-white/80 backdrop-blur rounded-lg p-6 shadow-lg">
                  <div className="flex items-center mb-4">
                    <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>

                  <div className="space-y-4">
                    <div className="h-4 bg-gray-200 rounded-full w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded-full"></div>
                    <div className="h-4 bg-gray-200 rounded-full w-5/6"></div>
                    <div className="h-4 bg-gray-200 rounded-full w-1/2"></div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <div className="flex items-center">
                      <div className="w-4 h-4 mr-3 bg-primary/20 rounded-full flex items-center justify-center">
                        <CheckCircle size={12} className="text-primary" />
                      </div>
                      <div className="h-4 bg-gray-200 rounded-full w-2/3"></div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 mr-3 bg-primary/20 rounded-full flex items-center justify-center">
                        <CheckCircle size={12} className="text-primary" />
                      </div>
                      <div className="h-4 bg-gray-200 rounded-full w-1/2"></div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 mr-3 bg-primary/20 rounded-full flex items-center justify-center">
                        <CheckCircle size={12} className="text-primary" />
                      </div>
                      <div className="h-4 bg-gray-200 rounded-full w-3/4"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            What Freelancers Say
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={index} {...testimonial} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <div className="text-xl font-semibold text-primary">
                FreelancerHub
              </div>
              <p className="text-gray-500 mt-2">
                © 2023 FreelancerHub. All rights reserved.
              </p>
            </div>

            <div className="flex space-x-6">
              <a
                href="/freelancer-Hub/policy"
                className="text-gray-500 hover:text-gray-700"
              >
                Terms
              </a>
              <a
                href="/freelancer-Hub/policy"
                className="text-gray-500 hover:text-gray-700"
              >
                Privacy
              </a>
              <a
                href="/freelancer-Hub/policy"
                className="text-gray-500 hover:text-gray-700"
              >
                Cookies
              </a>
              <a
                href="/freelancer-Hub/policy"
                className="text-gray-500 hover:text-gray-700"
              >
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Feature Card Component
interface FeatureCardProps {
  title: string;
  description: string;
  index: number;
}

const FeatureCard = ({ title, description, index }: FeatureCardProps) => (
  <div
    className={cn(
      "bg-white rounded-xl p-8 shadow-sm border hover:shadow-md transition-all group animate-in",
      index % 3 === 0
        ? "slide-in-left"
        : index % 3 === 1
        ? "slide-up"
        : "slide-in-right",
      `animate-delay-${(index % 5) * 100 + 100}`
    )}
  >
    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
      <CheckCircle size={20} className="text-primary" />
    </div>
    <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);
