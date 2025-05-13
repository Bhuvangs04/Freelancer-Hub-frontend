import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {

  ChevronLeft,
  ChevronRight,
  Loader2,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Navigation } from "@/components/Navigation";
import { Skeleton } from "@/components/ui/skeleton";

interface Skill {
  name: string;
  proficiency: "beginner" | "intermediate" | "expert";
}

interface Project {
  title: string;
  description: string;
  frameworks: string[];
  link: string;
}

interface Freelancer {
  _id: string;
  username: string;
  status: string;
  profilePictureUrl: string;
  bio: string;
  oldProjects: Project[];
  skills: Skill[][];
}

interface APIResponse {
  freelancers: Freelancer[];
}

const ITEMS_PER_PAGE = 12;

const FreelancerList = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFreelancer, setSelectedFreelancer] =
    useState<Freelancer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFreelancers();
  }, []);

  const fetchFreelancers = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/client/all/freelancers`,
        {
          credentials: "include",
        }
      );
      const data: APIResponse = await response.json();
      setFreelancers(data.freelancers);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching freelancers:", error);
      setIsLoading(false);
    }
  };

  // const displayedSkills = showAllSkills
  //   ? [...SKILL, ...ADDITIONAL_SKILLS]
  //   : SKILL;

  const filteredFreelancers = freelancers.filter((freelancer) => {
    const matchesSearch =
      freelancer.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      freelancer.skills[0].some((skill) =>
        skill.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesSkills =
      selectedSkills.length === 0 ||
      selectedSkills.some((skill) =>
        freelancer.skills[0].some(
          (s) => s.name.toLowerCase() === skill.toLowerCase()
        )
      );

    const matchesLevels =
      selectedLevels.length === 0 ||
      selectedLevels.some((level) =>
        freelancer.skills[0].some((s) => s.proficiency === level.toLowerCase())
      );

    return matchesSearch && matchesSkills && matchesLevels;
  });

  const totalPages = Math.ceil(filteredFreelancers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedFreelancers = filteredFreelancers.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const handleStartChat = (freelancer: Freelancer) => {
    setSelectedFreelancer(null);
    navigate(`/chat?user=${freelancer._id}`);
  };

  const ImageWithLoading = ({
    src,
    alt,
    className,
  }: {
    src: string;
    alt: string;
    className: string;
  }) => {
    const [isImageLoading, setIsImageLoading] = useState(true);
    const [error, setError] = useState(false);
    return (
      <div className={`relative ${className} bg-gray-100 overflow-hidden`}>
        {isImageLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        )}
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <span className="text-sm text-gray-500">Error</span>
          </div>
        ) : (
          <img
            src={src}
            alt={alt}
            className={`w-full h-full object-cover ${
              isImageLoading ? "opacity-0" : "opacity-100"
            } transition-opacity duration-200`}
            onLoad={() => setIsImageLoading(false)}
            onError={() => {
              setIsImageLoading(false);
              setError(true);
            }}
          />
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-1">
      <Navigation />
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mt-4 text-gray-900 mb-8">
          Find Freelancers
        </h1>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Section */}
          <div className="w-full md:w-1/3 space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <Input
                type="text"
                placeholder="Search by name or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mb-6"
              />

              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Experience Level</h3>
                <div className="grid grid-cols-1 gap-2">
                  {["Beginner", "Intermediate", "Expert"].map((level) => (
                    <div key={level} className="flex items-center space-x-2">
                      <Checkbox
                        id={level}
                        checked={selectedLevels.includes(level)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedLevels([...selectedLevels, level]);
                          } else {
                            setSelectedLevels(
                              selectedLevels.filter((l) => l !== level)
                            );
                          }
                        }}
                      />
                      <label
                        htmlFor={level}
                        className="text-sm font-medium leading-none"
                      >
                        {level}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Freelancers List Section */}
          <div className="w-full md:w-2/3">
            {isLoading ? (
              <div className="grid grid-cols-1 gap-6">
                {[...Array(3)].map((_, index) => (
                  <Card key={index} className="p-6">
                    <div className="flex items-start space-x-4">
                      <Skeleton className="w-16 h-16 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-6 w-1/3" />
                        <Skeleton className="h-4 w-1/4" />
                        <div className="flex gap-2">
                          <Skeleton className="h-6 w-20" />
                          <Skeleton className="h-6 w-20" />
                          <Skeleton className="h-6 w-20" />
                        </div>
                        <Skeleton className="h-20 w-full" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-6">
                  {paginatedFreelancers.map((freelancer) => (
                    <Card
                      key={freelancer._id}
                      className="p-6 cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setSelectedFreelancer(freelancer)}
                    >
                      <div className="flex items-start space-x-4">
                        <ImageWithLoading
                          src={freelancer.profilePictureUrl}
                          alt={freelancer.username}
                          className="w-16 h-16 rounded-full"
                        />
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold">
                            {freelancer.username}
                          </h3>
                          <h3 className="mt-2 flex flex-wrap gap-2 px-2 py-1 text-blue-800 text-sm">
                            {freelancer.status}
                          </h3>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {freelancer.skills?.[0]
                              ?.slice(0, 3)
                              ?.map((skill) => (
                                <span
                                  key={skill.name}
                                  className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                                >
                                  {skill.name} ({skill.proficiency})
                                </span>
                              ))}
                            {freelancer.skills[0]?.length > 3 && (
                              <span className="text-gray-500 text-sm">
                                +{freelancer.skills[0]?.length - 3} more
                              </span>
                            )}
                          </div>
                          <p className="mt-2 text-gray-600 line-clamp-4">
                            {freelancer.bio}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-4 mt-8">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      {/* Freelancer Details Dialog */}
      <Dialog
        open={!!selectedFreelancer}
        onOpenChange={() => setSelectedFreelancer(null)}
      >
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          {selectedFreelancer && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-4">
                  <img
                    src={selectedFreelancer.profilePictureUrl}
                    alt={selectedFreelancer.username}
                    className="w-16 h-16  rounded-full object-cover"
                  />
                  <div>
                    <h2 className="text-2xl font-bold text-blue-500">
                      {selectedFreelancer.username}
                    </h2>

                    <Button
                      onClick={() => handleStartChat(selectedFreelancer)}
                      className=" mt-4 bg-red-500 hover:bg-green-600"
                    >
                      <MessageCircle className="w-6 h-6" />
                      Start Chat
                    </Button>
                  </div>
                </DialogTitle>
              </DialogHeader>
              <div className="mt-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Bio</h3>
                  <p className="whitespace-pre-wrap">
                    {selectedFreelancer.bio}
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedFreelancer.skills[0].map((skill) => (
                      <span
                        key={skill.name}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {skill.name} ({skill.proficiency})
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Previous Projects
                  </h3>
                  <div className="space-y-4">
                    {selectedFreelancer.oldProjects.map((project, index) => (
                      <Card key={index} className="p-4">
                        <h4 className="font-semibold">{project.title}</h4>
                        <p className="text-gray-600 mt-2">
                          {project.description}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {project.frameworks.map((framework, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 bg-gray-100 text-gray-800 text-sm rounded-full"
                            >
                              {framework}
                            </span>
                          ))}
                        </div>
                        {project.link && (
                          <a
                            href={project.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 mt-2 inline-block"
                          >
                            View Project
                          </a>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FreelancerList;
