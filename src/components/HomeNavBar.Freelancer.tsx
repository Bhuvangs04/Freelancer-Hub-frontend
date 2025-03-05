import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Menu,
  X,
  User,
  LayoutDashboard,
  ClipboardList,
  LogOut,
  Building2Icon,
  WalletCards,
  MessageCircle,
  UserCheck,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  // Freelancer-specific links
  const freelancerLinks = [
    {
      name: "Messages",
      href: "/chat/freelancer",
      icon: <MessageCircle className="h-4 w-4 mr-2" />,
    },
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-4 w-4 mr-2" />,
    },
    {
      name: "See Bids",
      href: "/my-bids",
      icon: <ClipboardList className="h-4 w-4 mr-2" />,
    },
    {
      name: "My works & Payments",
      href: "/freelancer/profile",
      icon: <WalletCards className="h-4 w-4 mr-2" />,
    },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/80 backdrop-blur-md border-b border-border/50 shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="py-3 container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          <Link
            to="/freelancer/home/in-en"
            className="text-xl font-semibold tracking-tight transition-colors flex items-center gap-1.5"
          >
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            <span>FreelancerHub</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-6">
              {/* Freelancer specific links */}
              {freelancerLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`text-sm font-medium transition-colors hover:text-primary flex items-center ${
                    location.pathname === link.href
                      ? "text-primary"
                      : "text-foreground/80"
                  }`}
                >
                  {link.icon}
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link
                      to="/view"
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <User className="h-4 w-4" />
                      View Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      to="/freelancer-Hub/policy"
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Building2Icon className="h-4 w-4" />
                      Company Policies
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      to="/Profile/update"
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <UserCheck className="h-4 w-4" />
                      Update Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      to="/sign-in"
                      className="flex items-center gap-2 text-red-500 cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </nav>

          {/* Mobile Navigation Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 -mr-2 md:hidden"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg py-4 px-4 h-[calc(100vh-4rem)] flex flex-col animate-fade-in">
          <div className="space-y-4">


            {/* Freelancer specific links for mobile */}
            {freelancerLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`flex items-center py-2 text-base font-medium transition-colors hover:text-primary ${
                  location.pathname === link.href
                    ? "text-primary"
                    : "text-foreground/80"
                }`}
              >
                {link.icon}
                {link.name}
              </Link>
            ))}
          </div>

          <div className="mt-6 space-y-3">
            <Link to="/view" className="flex items-center gap-2 cursor-pointer">
              <User className="h-4 w-4" />
              View Profile
            </Link>
            <Link
              to="/freelancer-Hub/policy"
              className="flex items-center gap-2 cursor-pointer"
            >
              <Building2Icon className="h-4 w-4" />
              Company Policies
            </Link>
            <Link
              to="/Profile/update"
              className="flex items-center gap-2 cursor-pointer"
            >
              <UserCheck className="h-4 w-4" />
              Update Profile
            </Link>
            <Button asChild variant="destructive" className="w-full">
              <Link
                to="/sign-in"
                className="flex items-center gap-2 text-red-500 cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
