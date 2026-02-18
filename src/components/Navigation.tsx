import { Button } from "@/components/ui/button";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Wallet,
  UserRound,
  History,
  Sparkles,
  LayoutDashboard,
  FolderOpen,
  FileSignature,
  Briefcase,
  PlusCircle,
  LogOut,
  Settings,
  ShieldAlert,
  Menu,
  X,
} from "lucide-react";
import { TransactionHistoryModal } from "./modals/TransactionHistoryModal";
import { WithdrawModal } from "./modals/WithdrawModal";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { motion, AnimatePresence } from "framer-motion";

const generateSecureRandomString = () => {
  const array = new Uint8Array(72); // 64 bits (8 bytes)
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
    ""
  );
};

const User_log = generateSecureRandomString();

const client_id = localStorage.getItem("Chatting_id");
const client_name = localStorage.getItem("username");
const client_email = localStorage.getItem("email");

const fetchWalletData = (
  client_id,
  setCurrentBalance,
  setCurrentRefund,
  setTotalDeposits,
  setTotalWithdrawals,
  setTransactions
) => {
  axios
    .get(`${import.meta.env.VITE_API_URL}/client/get/wallet/${client_id}`, {
      withCredentials: true,
    })
    .then((response) => {
      setCurrentBalance(response.data.total_balance || 0);
      setCurrentRefund(response.data.refunded_balance || 0);
      setTotalDeposits(response.data.total_deposited || 0);
      setTotalWithdrawals(response.data.total_withdrawn || 0);
      setTransactions(
        response.data.transaction_history.map((tx) => ({
          ...tx,
          date: new Date(tx.timestamp),
          id: tx.timestamp,
        }))
      );
    })
    .catch((error) => console.error("Error fetching wallet data:", error));
};

export const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { siteName } = useSiteSettings();
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [currentBalance, setCurrentBalance] = useState<number>(0);
  const [currentRefund, setCurrentRefund] = useState<number>(0);
  const [TotalDeposits, setTotalDeposits] = useState<number>(0);
  const [TotalWithdrawals, setTotalWithdrawals] = useState<number>(0);
  const [transactions, setTransactions] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Fetch data immediately
    fetchWalletData(
      client_id,
      setCurrentBalance,
      setCurrentRefund,
      setTotalDeposits,
      setTotalWithdrawals,
      setTransactions
    );

    // Set interval to fetch data every 60 seconds
    const interval = setInterval(() => {
      fetchWalletData(
        client_id,
        setCurrentBalance,
        setCurrentRefund,
        setTotalDeposits,
        setTotalWithdrawals,
        setTransactions
      );
    }, 60000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);

  const handleWithdraw = (amount: number) => {
    axios
      .post(`${import.meta.env.VITE_API_URL}/client/wallet/withdraw`, {
        client_id,
        amount,
        withCredentials: true,
      })
      .then(() => {
        setCurrentBalance((prev) => prev - amount);
      })
      .catch((error) => console.error("Withdrawal error:", error));
  };

  const handleLogout = () => {
    localStorage.clear();
    axios.get(`${import.meta.env.VITE_API_URL}/logout`, {
      withCredentials: true,
    });
    navigate("/sign-in");
  };

  const navLinks = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      path: "/find/freelancers",
    },
    {
      name: "Messages",
      icon: Briefcase,
      onClick: () =>
        navigate(
          `/chat?bidsid=${User_log}&y_id=${User_log}-${User_log}&xyy=${User_log}`
        ),
    },
    {
      name: "Bids",
      icon: FileSignature,
      onClick: () =>
        navigate(
          `/clients/projects/bids?id=${User_log}&y_id=${User_log}-${User_log}&xyy=${User_log}`
        ),
    },
    {
      name: "Agreements",
      icon: FileSignature,
      onClick: () =>
        navigate(
          `/agreements?id=${User_log}&y_id=${User_log}-${User_log}&xyy=${User_log}`
        ),
    },
    {
      name: "Ongoing",
      icon: FolderOpen,
      onClick: () =>
        navigate(
          `/client/ongoing/projects/details/routing/v1/s1?id=${User_log}&y_id=${User_log}-${User_log}&xyy=${User_log}`
        ),
    },
    {
      name: "My Projects",
      icon: FolderOpen,
      onClick: () =>
        navigate(
          `/my-projects?id=${User_log}&y_id=${User_log}-${User_log}&xyy=${User_log}`
        ),
    },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Link to="/find/freelancers" className="flex items-center gap-2 group">
              <div className="relative h-8 w-8 rounded-lg hero-gradient flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/30 transition-shadow duration-300">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight">
                <span className="text-gradient">{siteName || "FreelanceHub"}</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Button
                key={link.name}
                variant="ghost"
                size="sm"
                className={`flex items-center gap-2 h-9 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${link.path && isActive(link.path)
                    ? "bg-primary/10 text-primary hover:bg-primary/15"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                onClick={link.onClick}
                asChild={!!link.path}
              >
                {link.path ? (
                  <Link to={link.path}>
                    <link.icon className="h-4 w-4" />
                    {link.name}
                  </Link>
                ) : (
                  <span className="cursor-pointer">
                    <link.icon className="h-4 w-4" />
                    {link.name}
                  </span>
                )}
              </Button>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Add Project Button */}
            <Button
              size="sm"
              className="hidden sm:flex btn-premium text-white border-0 shadow-md shadow-primary/20 hover:shadow-primary/30"
              onClick={() =>
                navigate(
                  `/add-project/${client_id}/direct?id=${User_log}&y_id=${User_log}-${User_log}&xyy=${User_log}`
                )
              }
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Post Project
            </Button>

            <div className="h-8 w-px bg-border/60 mx-1 hidden sm:block" />

            {/* Wallet Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-muted/60 relative"
                >
                  <Wallet className="h-5 w-5 text-muted-foreground" />
                  {currentBalance > 0 && (
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-500 border border-white" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 p-2" align="end">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Wallet Balance</p>
                    <p className="text-2xl font-bold text-primary">
                      ₹{currentBalance ? currentBalance.toFixed(2) : "0.00"}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="p-2 grid grid-cols-2 gap-2 text-xs text-muted-foreground bg-muted/30 rounded-md mb-2">
                  <div>
                    <span className="block opacity-70">Refunds</span>
                    <span className="font-medium text-foreground">
                      ₹{currentRefund ? currentRefund.toFixed(2) : "0.00"}
                    </span>
                  </div>
                  <div>
                    <span className="block opacity-70">Deposited</span>
                    <span className="font-medium text-foreground">
                      ₹{TotalDeposits ? TotalDeposits.toFixed(2) : "0.00"}
                    </span>
                  </div>
                </div>
                <DropdownMenuItem
                  className="cursor-pointer flex items-center gap-2 text-primary focus:text-primary focus:bg-primary/5"
                  onClick={() => setIsWithdrawModalOpen(true)}
                >
                  <Wallet className="h-4 w-4" />
                  Withdraw Funds
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* History Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted/60">
                  <History className="h-5 w-5 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>Activity</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => setIsHistoryModalOpen(true)}
                >
                  View Transaction History
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted/60">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-violet-500/20 flex items-center justify-center border border-primary/10">
                    <UserRound className="h-4 w-4 text-primary" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{client_name || "Client"}</p>
                    <p className="text-xs leading-none text-muted-foreground truncate">
                      {client_email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() =>
                    navigate(
                      `/Client-profile/?id=${User_log}&y_id=${User_log}-${User_log}&xyy=${User_log}`
                    )
                  }
                >
                  <UserRound className="mr-2 h-4 w-4" />
                  My Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() =>
                    navigate(
                      `/create/client-page/?name=${client_name}&email=${client_email}?id=${User_log}&y_id=${User_log}-${User_log}&xyy=${User_log}`
                    )
                  }
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() =>
                    navigate(
                      `/client/dispute?id=${User_log}&y_id=${User_log}-${User_log}&xyy=${User_log}`
                    )
                  }
                >
                  <ShieldAlert className="mr-2 h-4 w-4" />
                  Disputes
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t bg-white/95 backdrop-blur-xl"
          >
            <div className="p-4 space-y-2">
              {navLinks.map((link) => (
                <Button
                  key={link.name}
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    link.onClick ? link.onClick() : navigate(link.path);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <link.icon className="mr-2 h-4 w-4" />
                  {link.name}
                </Button>
              ))}
              <Button
                className="w-full btn-premium text-white mt-4"
                onClick={() => {
                  navigate(
                    `/add-project/${client_id}/direct?id=${User_log}&y_id=${User_log}-${User_log}&xyy=${User_log}`
                  );
                  setIsMobileMenuOpen(false);
                }}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Post Project
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <TransactionHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        transactions={transactions}
      />
      <WithdrawModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        currentBalance={currentBalance}
        onWithdraw={handleWithdraw}
        userRole="client"
      />
    </nav>
  );
};
