import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Profile from "./pages/Freelancer/ViewProfile";
import ProfileUpdate from "./pages/Freelancer/ProfileUpdate";
import SignIn from "./pages/SignIn";
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
import Dashboard from "./pages/Freelancer/MainPage";
import FreelancerProfile from "./pages/Freelancer/Freelancer.profile";
import Forbidden from "./pages/ForbiddenPage";
import DisputeForm from "./pages/Disputes/Disputes";
import ProtectedRoute from "@/components/Security/PorperCheck";
import Freelancer_portfolio from "./pages/Freelancer-portfolio";
import { Analytics } from "@vercel/analytics/react";

// import SecurityLayer from "./components/Security/SecurityLayer";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Analytics />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route
            path="/freelancer/portfolio/:username/view"
            element={<Freelancer_portfolio />}
          />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/forbidden" element={<Forbidden />} />

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
            path="/freelancer/disputes"
            element={
              <FreelancerAuth>
                <ProtectedRoute role="freelancer">
                  <DisputeForm />
                </ProtectedRoute>
              </FreelancerAuth>
            }
          />
          <Route
            path="/client/dispute"
            element={
              <FreelancerAuth>
                <ProtectedRoute role="client">
                  <DisputeForm />
                </ProtectedRoute>
              </FreelancerAuth>
            }
          />
          <Route
            path="/freelancer/profile"
            element={
              <FreelancerAuth>
                <ProtectedRoute role="freelancer">
                  <FreelancerProfile />
                </ProtectedRoute>
              </FreelancerAuth>
            }
          />
          <Route
            path="/dashboard"
            element={
              <FreelancerAuth>
                <ProtectedRoute role="freelancer">
                  <Dashboard />
                </ProtectedRoute>
              </FreelancerAuth>
            }
          />
          <Route
            path="/clients/projects/bids"
            element={
              <FreelancerAuth>
                <ProtectedRoute role="client">
                  <ClientProjectsBids />
                </ProtectedRoute>
              </FreelancerAuth>
            }
          />
          <Route
            path="/project-bids/:projectId"
            element={
              <FreelancerAuth>
                <ProtectedRoute role="client">
                  <ClinetBids />
                </ProtectedRoute>
              </FreelancerAuth>
            }
          />
          <Route
            path="/chat"
            element={
              <FreelancerAuth>
                <ProtectedRoute role="client">
                  <Chat_client />
                </ProtectedRoute>
              </FreelancerAuth>
            }
          />
          <Route
            path="/chat/freelancer"
            element={
              <FreelancerAuth>
                <ProtectedRoute role="freelancer">
                  <Chat_client />
                </ProtectedRoute>
              </FreelancerAuth>
            }
          />
          <Route
            path="/my-bids"
            element={
              <FreelancerAuth>
                <ProtectedRoute role="freelancer">
                  <MyBids />
                </ProtectedRoute>
              </FreelancerAuth>
            }
          />
          <Route
            path="/Client-profile"
            element={
              <FreelancerAuth>
                <ProtectedRoute role="client">
                  <Client_profile />
                </ProtectedRoute>
              </FreelancerAuth>
            }
          />
          <Route
            path="/my-projects"
            element={
              <FreelancerAuth>
                <ProtectedRoute role="client">
                  <ClientProjects />
                </ProtectedRoute>
              </FreelancerAuth>
            }
          />
          <Route
            path="/Profile/update"
            element={
              <FreelancerAuth>
                <ProtectedRoute role="freelancer">
                  <ProfileUpdate />
                </ProtectedRoute>
              </FreelancerAuth>
            }
          />
          <Route
            path="/view"
            element={
              <FreelancerAuth>
                <ProtectedRoute role="freelancer">
                  <Profile />
                </ProtectedRoute>
              </FreelancerAuth>
            }
          />
          <Route
            path="/find/freelancers"
            element={
              <FreelancerAuth>
                <ProtectedRoute role="client">
                  <ClientFreelancerFinder />
                </ProtectedRoute>
              </FreelancerAuth>
            }
          />
          <Route
            path="/add-project/:clientId/direct"
            element={
              <ProtectedRoute role="client">
                <ClientAddProject />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create/client-page"
            element={
              <FreelancerAuth>
                <ProtectedRoute role="client">
                  <ClientAddProject3 />
                </ProtectedRoute>
              </FreelancerAuth>
            }
          />
          <Route
            path="/freelancer/home/in-en"
            element={
              <FreelancerAuth>
                <ProtectedRoute role="freelancer">
                  <Freelancer_Card_projects />
                </ProtectedRoute>
              </FreelancerAuth>
            }
          />

          <Route
            path="/client/ongoing/projects/details/routing/v1/s1"
            element={
              <FreelancerAuth>
                <ProtectedRoute role="client">
                  <ClientOngoingProject />
                </ProtectedRoute>
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
