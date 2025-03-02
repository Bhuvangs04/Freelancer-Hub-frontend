import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Bell, User, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  // Toggle mobile menu
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // Apply background when scrolled
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed w-full top-0 z-50 transition-all duration-300",
        isScrolled ? "bg-white/80 backdrop-blur shadow-sm" : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link
            to="/"
            className="text-2xl font-semibold text-primary flex items-center gap-2"
          >
            TaskBridge
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8 items-center">
            <NavLink to="/" active={location.pathname === "/"}>
              Home
            </NavLink>
            <NavLink
              to="/dashboard"
              active={location.pathname === "/dashboard"}
            >
              Dashboard
            </NavLink>

            {/* Notifications */}
            <button
              className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Notifications"
            >
              <Bell size={20} className="text-gray-600" />
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
            </button>

            {/* User Dropdown */}
            <div className="relative group">
              <button className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-900 group">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User size={16} className="text-primary" />
                </div>
                <span>Alex Johnson</span>
                <ChevronDown
                  size={16}
                  className="text-gray-500 group-hover:text-gray-700 transition-transform group-hover:rotate-180"
                />
              </button>

              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right scale-95 group-hover:scale-100">
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Profile
                </Link>
                <Link
                  to="/settings"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Settings
                </Link>
                <div className="border-t border-gray-100 my-1"></div>
                <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Sign out
                </button>
              </div>
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
            onClick={toggleMenu}
          >
            <span className="sr-only">Open menu</span>
            {isMenuOpen ? (
              <X size={24} aria-hidden="true" />
            ) : (
              <Menu size={24} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "md:hidden absolute top-full left-0 right-0 bg-white shadow-md transition-[max-height,opacity] duration-300 ease-in-out overflow-hidden",
          isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="px-2 pt-2 pb-3 space-y-1">
          <MobileNavLink to="/" active={location.pathname === "/"}>
            Home
          </MobileNavLink>
          <MobileNavLink
            to="/dashboard"
            active={location.pathname === "/dashboard"}
          >
            Dashboard
          </MobileNavLink>
          <MobileNavLink
            to="/profile"
            active={location.pathname === "/profile"}
          >
            Profile
          </MobileNavLink>
          <MobileNavLink
            to="/settings"
            active={location.pathname === "/settings"}
          >
            Settings
          </MobileNavLink>
          <button className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-md">
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}

// NavLink component
interface NavLinkProps {
  to: string;
  active?: boolean;
  children: React.ReactNode;
}

const NavLink = ({ to, active, children }: NavLinkProps) => (
  <Link
    to={to}
    className={cn(
      "text-sm font-medium transition-colors hover:text-primary",
      active ? "text-primary" : "text-gray-600"
    )}
  >
    {children}
  </Link>
);

// Mobile NavLink component
const MobileNavLink = ({ to, active, children }: NavLinkProps) => (
  <Link
    to={to}
    className={cn(
      "block px-4 py-2 text-base font-medium rounded-md",
      active
        ? "text-primary bg-primary/5"
        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
    )}
  >
    {children}
  </Link>
);
