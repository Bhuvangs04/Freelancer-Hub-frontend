import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
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
import { Wallet, UserRound, History } from "lucide-react";
import { TransactionHistoryModal } from "./modals/TransactionHistoryModal";
import { WithdrawModal } from "./modals/WithdrawModal";


const generateSecureRandomString = () => {
  const array = new Uint8Array(8); // 64 bits (8 bytes)
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
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
const [currentBalance, setCurrentBalance] = useState<number>(0);
const [currentRefund, setCurrentRefund] = useState<number>(0);
const [TotalDeposits, setTotalDeposits] = useState<number>(0);
const [TotalWithdrawals, setTotalWithdrawals] = useState<number>(0);
  const [transactions, setTransactions] = useState([]);
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

    // Set interval to fetch data every 5 seconds
    const interval = setInterval(() => {
      fetchWalletData(
        client_id,
        setCurrentBalance,
        setCurrentRefund,
        setTotalDeposits,
        setTotalWithdrawals,
        setTransactions
      );
    }, 100000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [client_id]);

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
    axios.get(`${import.meta.env.VITE_API_URL}/logout`, { withCredentials
    : true });
    navigate("/sign-in");
  }

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <span className="text-xl font-bold text-primary">FreelanceHub</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => navigate("/clients/projects/bids")}
            >
              See bids
            </Button>
            <Button variant="outline" onClick={() => navigate("/ongoing")}>
              Ongoing
            </Button>
            <Button variant="outline" onClick={() => navigate("/my-projects")}>
              My Projects
            </Button>
            <Button
              onClick={() => navigate(`/add-project/${client_id}/direct`)}
            >
              Add Project
            </Button>
            {/* Wallet Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-gray-100"
                >
                  <Wallet className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>Wallet</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  Cur Balance: ₹
                  {currentBalance ? currentBalance.toFixed(2) : "0.00"}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  RA: (-)₹
                  {currentRefund ? currentRefund.toFixed(2) : "0.00"}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Total DP: (+)₹
                  {TotalDeposits ? TotalDeposits.toFixed(2) : "0.00"}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Total WA:(-) ₹
                  {TotalWithdrawals ? TotalWithdrawals.toFixed(2) : "0.00"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsWithdrawModalOpen(true)}>
                  Withdraw
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {/* Transaction History Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-gray-100"
                >
                  <History className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>Transaction History</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsHistoryModalOpen(true)}>
                  View History
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-gray-100"
                >
                  <UserRound className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => navigate("/Client-profile/?id=" + User_log)}
                >
                  My Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    navigate(
                      `/create/client-page/?name=${client_name}&email=${client_email}`
                    )
                  }
                >
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigate("/freelancer-Hub/policy")}
                >
                  Company Policies
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleLogout()}
                  className="text-red-600"
                >
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

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
