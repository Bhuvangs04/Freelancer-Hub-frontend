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
import FreelancerAuth from "./components/Security/Freelancer.Auth";
import PolicyPage from "./pages/Company/PolicyPage";
import ClientProjects from "./pages/Client/Project-update/ProjectUpdate";
import Client_profile from "./pages/Client/client-main-page-add-project/Client-profile";
import Chat_client from "./pages/Client/chat/Chat-client";
import MyBids from "./pages/Freelancer/freelancer-place-bid/MyBids";
import ClientProjectsBids from "./pages/Client/Project-update/ClientProjects.bid";
import ClinetBids from "./pages/Client/Project-update/ProjectBids.bid";
import ClientAddProject from "./pages/Client/client-main-page-add-project/AddProject";
import ClientAddProject3 from "./pages/Client/client-main-page-add-project/Index";
import ClientOngoingProject from "./pages/Client/client-ongoing-projects/Index";
import ClientFreelancerFinder from "./pages/Client/freelance-finder/FreelancerList";
import Freelancer_Card_projects from "./pages/Freelancer/freelancer-place-bid/Freelancer_Card_projects";
import FreelancerEntryPage from "./pages/Freelancer/freelancer.enrty";
import Dashboard from "./pages/Freelancer/MainPage";

// import SecurityLayer from "./components/Security/SecurityLayer";

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
            path="/freelancer"
            element={
              <FreelancerAuth>
                <FreelancerEntryPage />
              </FreelancerAuth>
            }
          />
          <Route
            path="/dashboard"
            element={
              <FreelancerAuth>
                <Dashboard />
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

          <Route
            path="/client/ongoing/projects/details/routing/v1/s1"
            element={
              <FreelancerAuth>
                <ClientOngoingProject />
              </FreelancerAuth>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
