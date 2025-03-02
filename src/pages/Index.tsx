import { ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TestimonialCard } from "@/components/TestimonialCard";
import Navbar from "@/components/Navbar";
import { Link } from "react-router-dom";

const features = [
  "Access to top global clients",
  "Secure payment protection",
  "Professional growth opportunities",
  "Flexible working hours",
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

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 hero-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 animate-fadeIn">
              Launch Your Freelance Career Today
            </h1>
            <p className="text-xl text-gray-600 mb-8 animate-fadeIn" style={{ animationDelay: "0.2s" }}>
              Connect with clients worldwide and grow your freelance business
            </p>
            <Link to="/sign-up">
              <Button size="lg" className="animate-fadeIn" style={{ animationDelay: "0.4s" }}>
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Us</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 p-4 rounded-lg bg-gray-50"
              >
                <CheckCircle className="h-6 w-6 text-primary" />
                <span className="font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
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

      {/* CTA Section */}
      <section className="py-16 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-primary-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of successful freelancers who have taken control of
            their careers
          </p>
          <Link to="/sign-up">
            <Button
              size="lg"
              variant="secondary"
              className="font-semibold"
            >
              Sign Up Now <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Index;