import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { User, UserPlus, Wallet, Grid, Settings } from "lucide-react";

const Index = () => {
  // Get user authentication state from Redux
  const user = useSelector((state: any) => state.user);
  const isLoggedIn = user.isAuthenticated;

  return (
    <div className=" bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 backdrop-blur-md bg-white/75 border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600">
                FreelancerHub
              </span>
            </div>

            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-10 w-10 rounded-full hover:bg-gray-100 transition-colors duration-200"
                  >
                    <User className="h-5 w-5 text-gray-700" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 mt-2 p-2 bg-white rounded-lg shadow-lg border border-gray-200 animate-in fade-in-80 slide-in-from-top-1">
                  {isLoggedIn ? (
                    <>
                      <DropdownMenuItem asChild>
                        <Link
                          to="/view"
                          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                        >
                          <User className="h-4 w-4" />
                          Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          to="/Profile/update"
                          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                        >
                          <Settings className="h-4 w-4" />
                          Update Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          to="/wallet"
                          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                        >
                          <Wallet className="h-4 w-4" />
                          Wallet
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          to="/projects"
                          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                        >
                          <Grid className="h-4 w-4" />
                          Projects
                        </Link>
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <DropdownMenuItem asChild>
                      <Link
                        to="/sign-in"
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                      >
                        <UserPlus className="h-4 w-4" />
                        Sign In
                      </Link>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Index;
