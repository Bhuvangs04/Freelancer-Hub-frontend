import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Star, ArrowLeft } from "lucide-react";

const FREELANCERS = [
  {
    id: "1",
    name: "Sarah Johnson",
    expertise: "Frontend Development",
    skills: ["React", "UI/UX", "React Native"],
    budget: 75,
    rating: 4.8,
    image: "/placeholder.svg",
    description: "Experienced frontend developer with a passion for creating beautiful and functional user interfaces. Specialized in React and modern web technologies.",
    experience: "8 years",
    location: "San Francisco, CA",
    languages: ["English", "Spanish"],
    completedProjects: 156
  },
  {
    id: "2",
    name: "Michael Chen",
    expertise: "Full Stack Development",
    skills: ["React", "Node.js", "AWS"],
    budget: 95,
    rating: 4.9,
    image: "/placeholder.svg",
    description: "Full stack developer with extensive experience in building scalable web applications. Strong focus on clean code and best practices.",
    experience: "10 years",
    location: "New York, NY",
    languages: ["English", "Mandarin"],
    completedProjects: 203
  },
  {
    id: "3",
    name: "Emma Davis",
    expertise: "UI/UX Design",
    skills: ["UI/UX", "Graphic Design", "Content Creation"],
    budget: 65,
    rating: 4.7,
    image: "/placeholder.svg",
    description: "Creative UI/UX designer with a keen eye for detail and user-centered design approach. Specialized in creating intuitive and engaging user experiences.",
    experience: "6 years",
    location: "London, UK",
    languages: ["English", "French"],
    completedProjects: 128
  }
];

const FreelancerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const freelancer = FREELANCERS.find(f => f.id === id);

  if (!freelancer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Freelancer not found</h1>
          <Button onClick={() => navigate("/")}>Back to List</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to List
        </Button>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/3">
              <img
                src={freelancer.image}
                alt={freelancer.name}
                className="w-full aspect-square rounded-lg object-cover mb-4"
              />
              <div className="flex items-center space-x-2 mb-4">
                <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                <span className="text-xl font-semibold">{freelancer.rating}</span>
              </div>
              <div className="text-2xl font-bold mb-1">${freelancer.budget}/hr</div>
              <Button className="w-full">Contact Freelancer</Button>
            </div>

            <div className="w-full md:w-2/3">
              <h1 className="text-3xl font-bold mb-2">{freelancer.name}</h1>
              <p className="text-xl text-gray-600 mb-6">{freelancer.expertise}</p>

              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-3">About</h2>
                  <p className="text-gray-600">{freelancer.description}</p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-3">Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {freelancer.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-600">Experience</h3>
                    <p>{freelancer.experience}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-600">Location</h3>
                    <p>{freelancer.location}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-600">Languages</h3>
                    <p>{freelancer.languages.join(", ")}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-600">Completed Projects</h3>
                    <p>{freelancer.completedProjects}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreelancerProfile;