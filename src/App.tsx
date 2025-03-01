import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Profile from "./pages/Freelancer/ViewProfile";
import ProfileUpdate from "./pages/Freelancer/ProfileUpdate";
import SignIn from "./pages/SignIn";
import Chat from "./pages/chat";
import SignUp from "./pages/SignUp";
import NotFound from "./pages/NotFound";
import FreelancerAuth from "./components/Security/Freelancer.Auth"; // Import authentication wrapper
import PolicyPage from "./pages/Company/PolicyPage";
import ClientProjects from "./pages/Client/Project-update/ProjectUpdate";
import Client_profile from "./pages/Client/client-main-page-add-project/Client-profile";
import Chat_client from "./pages/Client/chat/Chat-client";
import MyBids from "./pages/Freelancer/freelancer-place-bid/MyBids";
import ClientProjectsBids from "./pages/Client/Project-update/ClientProjects.bid";
import ClinetBids from "./pages/Client/Project-update/ProjectBids.bid";
// import SecurityLayer from "./components/Security/SecurityLayer";

import ClientAddProject from "./pages/Client/client-main-page-add-project/AddProject";
import ClientAddProject1 from "./pages/Client/client-main-page-add-project/Bids";
import ClientAddProject2 from "./pages/Client/client-main-page-add-project/Dashboard";
import ClientAddProject3 from "./pages/Client/client-main-page-add-project/Index";
import ClientAddProject4 from "./pages/Client/client-main-page-add-project/UpdateProfile";

import ClientMyProject from "./pages/Client/client-my-projects/FreelancerProfilesPage";
import ClientMyProject1 from "./pages/Client/client-my-projects/Index";

import ClientOngoingProject from "./pages/Client/client-ongoing-projects/Index";

import ClientFreelancerFinder from "./pages/Client/freelance-finder/FreelancerList";
import ClientFreelancerFinder2 from "./pages/Client/freelance-finder/FreelancerProfile";

import FreelancerProfile from "./pages/Freelancer/freelance-profilecreation-place-bid/Index";

import FreelancerSubmitProj from "./pages/Freelancer/freelance-submit-project/Index";

import Freelancer_Card_projects from "./pages/Freelancer/freelancer-place-bid/Freelancer_Card_projects";
import FreelancerPlaceBid1 from "./pages/Freelancer/freelancer-place-bid/ProjectDetails";

import FreelancerUodateProj from "./pages/Freelancer/freelancer-update-project-progress/Index";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/sign-up" element={<SignUp />} />
          {/* Routes that require authentication */}
          <Route
            path="/freelancer-Hub/policy"
            element={
              <FreelancerAuth>
                <PolicyPage />
              </FreelancerAuth>
            }
          />
          <Route
            path="/clients/projects/bids"
            element={
              <FreelancerAuth>
                <ClientProjectsBids />
              </FreelancerAuth>
            }
          />
          <Route
            path="/project-bids/:projectId"
            element={
              <FreelancerAuth>
                <ClinetBids />
              </FreelancerAuth>
            }
          />
          <Route
            path="/chat"
            element={
              <FreelancerAuth>
                <Chat_client />
              </FreelancerAuth>
            }
          />
          <Route
            path="/my-bids"
            element={
              <FreelancerAuth>
                <MyBids />
              </FreelancerAuth>
            }
          />
          <Route
            path="/Client-profile"
            element={
              <FreelancerAuth>
                <Client_profile />
              </FreelancerAuth>
            }
          />
          <Route
            path="/my-projects"
            element={
              <FreelancerAuth>
                <ClientProjects />
              </FreelancerAuth>
            }
          />
          <Route
            path="/chat/:chattingId/chatting"
            element={
              <FreelancerAuth>
                <Chat />
              </FreelancerAuth>
            }
          />
          <Route
            path="/Profile/update"
            element={
              <FreelancerAuth>
                <ProfileUpdate />
              </FreelancerAuth>
            }
          />
          <Route
            path="/view"
            element={
              <FreelancerAuth>
                <Profile />
              </FreelancerAuth>
            }
          />
          <Route
            path="/find/freelancers"
            element={
              <FreelancerAuth>
                <ClientFreelancerFinder />
              </FreelancerAuth>
            }
          />
          <Route
            path="/add-project/:clientId/direct"
            element={
              <FreelancerAuth>
                <ClientAddProject />
              </FreelancerAuth>
            }
          />
          <Route
            path="/create/client-page"
            element={
              <FreelancerAuth>
                <ClientAddProject3 />
              </FreelancerAuth>
            }
          />
          <Route
            path="/freelancer/home/in-en"
            element={
              <FreelancerAuth>
                <Freelancer_Card_projects />
              </FreelancerAuth>
            }
          />

          <Route path="*" element={<NotFound />} />

          {/* <Route path="/1" element={<ClientAddProject1 />} /> //dummy page no
          need */}
          {/* <Route path="/2" element={<ClientAddProject2 />} />
          //dummy need to remove */}

          {/* <Route path="/4" element={<ClientAddProject4 />} />
          //dummy page need to remove */}
          {/* <Route path="/5" element={<ClientMyProject />} />
          //bid page show all bids */}
          <Route path="/6" element={<ClientMyProject1 />} />
          {/* <Route path="/7" element={<ClientOngoingProject />} />
          //client ongoing project thing */}
          {/* <Route path="/9" element={<ClientFreelancerFinder2 />} />//dummy page */}
          {/* <Route path="/11" element={<FreelancerProfile />} />//need remove */}
          {/* <Route path="/12" element={<FreelancerSubmitProj />} />//need to review */}
          {/* <Route path="/14" element={<FreelancerPlaceBid1 />} />//need to remove */}
          {/* <Route path="/15" element={<FreelancerUodateProj />} />//Freelancer page */}
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
