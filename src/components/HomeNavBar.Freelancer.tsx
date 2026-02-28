import { useState, useEffect } from "react";
import axios from "axios";
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
  File,
  ChevronDown,
  Sparkles,
  Shield,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSiteSettings } from "@/context/SiteSettingsContext";

const generateSecureRandomString = () => {
  const array = new Uint8Array(95);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
    ""
  );
};

const User_log = generateSecureRandomString();

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { siteName } = useSiteSettings();

  const freelancerLinks = [
    {
      name: "Messages",
      href: `/chat/freelancer?userid=${User_log}&${User_log}-${User_log}`,
      icon: <MessageCircle className="h-4 w-4" />,
    },
    {
      name: "Agreements",
      href: `/agreements?userid=${User_log}&${User_log}-${User_log}`,
      icon: <File className="h-4 w-4" />,
    },
    {
      name: "Dashboard",
      href: `/dashboard?userid=${User_log}+${User_log}&${User_log}-${User_log}`,
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      name: "See Bids",
      href: `/my-bids?userid=${User_log}+${User_log}&${User_log}-${User_log}`,
      icon: <ClipboardList className="h-4 w-4" />,
    },
    {
      name: "My Works & Payments",
      href: `/freelancer/profile?userid=${User_log}+${User_log}&${User_log}-${User_log}`,
      icon: <WalletCards className="h-4 w-4" />,
    },
    {
      name: "Skills",
      href: `/freelancer/skills`,
      icon: <Shield className="h-4 w-4" />,
    },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleLogout = () => {
    localStorage.clear();
    axios.get(`${import.meta.env.VITE_API_URL}/logout`, {
      withCredentials: true,
    });
  };

  const isActive = (href: string) => location.pathname === href.split("?")[0];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
          ? "bg-slate-900/85 backdrop-blur-xl border-b border-white/[0.06] shadow-[0_4px_30px_rgba(0,0,0,0.3)]"
          : "bg-slate-900/60 backdrop-blur-md"
          }`}
      >
        <div className="py-3 container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link
              to="/freelancer/home/in-en"
              className="flex items-center gap-2.5 group"
            >
              <div className="relative h-9 w-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/25 group-hover:shadow-violet-500/40 transition-all duration-300 group-hover:scale-105">
                <Sparkles className="h-4 w-4 text-white" />
                <div className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                {siteName}
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {freelancerLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-300 group ${isActive(link.href)
                    ? "text-white bg-white/[0.1]"
                    : "text-slate-300 hover:text-white hover:bg-white/[0.06]"
                  }`}
                >
                  <span className={`transition-colors ${isActive(link.href) ? "text-violet-400" : "text-slate-400 group-hover:text-violet-400"}`}>
                    {link.icon}
                  </span>
                  {link.name}
                  {isActive(link.href) && (
                    <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-gradient-to-r from-violet-400 to-indigo-400 rounded-full" />
                  )}
                </Link>
              ))}

              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2 flex items-center gap-2 text-slate-300 hover:text-white hover:bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-2 h-auto transition-all duration-300"
                  >
                    <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                      F
                    </div>
                    <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-60 bg-slate-900/95 backdrop-blur-xl border-white/[0.08] shadow-2xl shadow-black/40 rounded-xl p-1.5"
                >
                  <DropdownMenuItem asChild>
                    <Link
                      to={`/view?namehash=${User_log}+passwordhash=${User_log}&${User_log}-${User_log}`}
                      className="flex items-center gap-3 cursor-pointer px-3 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/[0.06] transition-all"
                    >
                      <User className="h-4 w-4 text-slate-400" />
                      <span className="text-sm font-medium">View Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      to={`/freelancer-Hub/policy?namehash=${User_log}+passwordhash=${User_log}&${User_log}-${User_log}`}
                      className="flex items-center gap-3 cursor-pointer px-3 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/[0.06] transition-all"
                    >
                      <Building2Icon className="h-4 w-4 text-slate-400" />
                      <span className="text-sm font-medium">Company Policies</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      to={`/Profile/update?id=${User_log}+name-hash=${User_log}&password-hash=${User_log}-loginid=${User_log}`}
                      className="flex items-center gap-3 cursor-pointer px-3 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/[0.06] transition-all"
                    >
                      <UserCheck className="h-4 w-4 text-slate-400" />
                      <span className="text-sm font-medium">Update Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      to={`/freelancer/disputes?id=${User_log}+name-hash=${User_log}&password-hash=${User_log}-loginid=${User_log}`}
                      className="flex items-center gap-3 cursor-pointer px-3 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/[0.06] transition-all"
                    >
                      <UserCheck className="h-4 w-4 text-slate-400" />
                      <span className="text-sm font-medium">Disputes</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/[0.06] my-1" />
                  <DropdownMenuItem asChild>
                    <Link
                      to="/sign-in"
                      className="flex items-center gap-3 cursor-pointer px-3 py-2.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all"
                      onClick={() => handleLogout()}
                    >
                      <LogOut className="h-4 w-4" />
                      <span className="text-sm font-medium">Logout</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>

            {/* Mobile Toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 -mr-2 lg:hidden rounded-lg text-white hover:bg-white/[0.06] transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-all duration-300 ${isOpen ? "visible" : "invisible"
          }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"
            }`}
          onClick={() => setIsOpen(false)}
        />

        {/* Slide Panel */}
        <div
          className={`absolute top-0 right-0 w-80 max-w-[85vw] h-full bg-slate-900/98 backdrop-blur-xl border-l border-white/[0.06] shadow-2xl transform transition-transform duration-300 ease-out ${isOpen ? "translate-x-0" : "translate-x-full"
            }`}
        >
          <div className="flex flex-col h-full pt-20 px-4 pb-6">
            {/* Nav Links */}
            <div className="space-y-1 flex-1">
              {freelancerLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-medium transition-all ${isActive(link.href)
                    ? "text-white bg-violet-500/15 border border-violet-500/20"
                    : "text-slate-300 hover:text-white hover:bg-white/[0.05]"
                    }`}
                >
                  <span className={isActive(link.href) ? "text-violet-400" : "text-slate-500"}>
                    {link.icon}
                  </span>
                  {link.name}
                </Link>
              ))}

              <div className="h-px bg-white/[0.06] my-4" />

              <Link
                to={`/view?namehash=${User_log}+passwordhash=${User_log}&${User_log}-${User_log}`}
                className="flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/[0.05] transition-all"
              >
                <User className="h-4 w-4 text-slate-500" />
                View Profile
              </Link>
              <Link
                to={`/freelancer-Hub/policy?namehash=${User_log}+passwordhash=${User_log}&${User_log}-${User_log}`}
                className="flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/[0.05] transition-all"
              >
                <Building2Icon className="h-4 w-4 text-slate-500" />
                Company Policies
              </Link>
              <Link
                to={`/Profile/update?id=${User_log}+name-hash=${User_log}&password-hash=${User_log}-loginid=${User_log}`}
                className="flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/[0.05] transition-all"
              >
                <UserCheck className="h-4 w-4 text-slate-500" />
                Update Profile
              </Link>
            </div>

            {/* Logout Button */}
            <Link
              to="/sign-in"
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-medium text-rose-400 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/15 transition-all"
              onClick={() => handleLogout()}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
