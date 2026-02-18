import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";
import { useDispatch } from "react-redux";
import { setUser } from "@/redux/userSlice";
import { motion } from "framer-motion";
import SuspendSection from "./SuspendSection";
import {
  LockKeyhole,
  Mail,
  UserCog,
  ArrowRight,
  AlertTriangle,
  Sparkles,
  Shield,
  Zap,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [suspensionData, setSuspensionData] = useState(null);
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Manager");
  const [secretCode, setSecretCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toast } = useToast();

  function xorEncrypt(data, key) {
    const encoded = new TextEncoder().encode(data);
    return btoa(
      String.fromCharCode(
        ...encoded.map((byte, i) => byte ^ key.charCodeAt(i % key.length))
      )
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        email: xorEncrypt(email, import.meta.env.VITE_API_xorKey),
        password: xorEncrypt(password, import.meta.env.VITE_API_xorKey),
      };

      if (role === "Manager") {
        payload["secretCode"] = secretCode;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/${role}/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();
      console.log(data);

      if (
        data.message
          ?.toLowerCase()
          .includes("account is banned due to unusual activity")
      ) {
        setSuspensionData({
          userName: data.user.username,
          suspensionDate: data.user.banDate,
          reviewDate: data.user.reviewDate,
          suspensionReason: data.reason,
        });
      }

      if (response.ok) {
        toast({
          title: "Success",
          description: "Login successful!",
          variant: "default",
        });

        localStorage.setItem("Chatting_id", data.chat_id);
        localStorage.setItem("username", data.username);
        localStorage.setItem("email", data.email);
        localStorage.setItem("profileComplete", data.profileComplete ? "true" : "false");

        dispatch(
          setUser({
            username: data.username,
            email: data.email,
            role: data.role,
          })
        );

        setEmail("");
        setPassword("");
        if (role === "Manager") {
          setSecretCode("");
        }
        function getRandomString(length) {
          const characters =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
          let result = "";
          const charactersLength = characters.length;
          for (let i = 0; i < length; i++) {
            result += characters.charAt(
              Math.floor(Math.random() * charactersLength)
            );
          }
          return result;
        }

        const randomString = getRandomString(53);

        if (data.role === "admin") {
          window.location.href = `${import.meta.env.VITE_ADMIN_URL}`;
        } else if (data.role === "freelancer") {
          navigate(
            `/freelancer/home/in-en/?pr=${randomString}&user=${data.chat_id}&id=${data.email}&name=${data.username}`
          );
        } else {
          navigate(`/find/freelancers`);
        }
      } else {
        let errorMessage = "";
        if (data.message?.toLowerCase().includes("email")) {
          errorMessage = "Email not found. Please check your email address.";
        } else if (data.message?.toLowerCase().includes("password")) {
          errorMessage = "Incorrect password. Please try again.";
        } else if (data.message?.toLowerCase().includes("secret")) {
          errorMessage = "Invalid secret code. Please try again.";
        }

        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        console.error("Login error:", data.message);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again later.",
        variant: "destructive",
      });
      console.error("An error occurred:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {suspensionData ? (
        <SuspendSection {...suspensionData} />
      ) : (
          <div className="min-h-screen bg-white">
          <Navbar />

            <div className="min-h-screen flex">
              {/* ─── Left Brand Panel ─────────────────────── */}
              <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden hero-gradient items-center justify-center">
                {/* Decorative blobs */}
                <div className="absolute top-20 left-10 w-72 h-72 bg-primary/15 rounded-full blur-3xl animate-blob" />
                <div className="absolute bottom-20 right-10 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl animate-blob animation-delay-2000" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-500/8 rounded-full blur-3xl animate-blob animation-delay-4000" />

                <div className="relative z-10 max-w-md px-12 text-center">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl shadow-black/10 mb-8">
                      <Sparkles className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-white mb-4">
                      Welcome back to{" "}
                      <span className="text-white drop-shadow-md">FreelanceHub</span>
                    </h2>
                    <p className="text-blue-100/90 leading-relaxed mb-8">
                      Sign in to manage your projects, connect with talent, and
                      grow your business.
                    </p>

                    {/* Feature pills */}
                    <div className="space-y-3">
                      {[
                        { icon: Shield, text: "Secure escrow payments" },
                        { icon: Zap, text: "Real-time collaboration" },
                        { icon: UserCog, text: "Smart talent matching" },
                      ].map((item, i) => (
                        <motion.div
                          key={item.text}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 + i * 0.1 }}
                          className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-xl px-4 py-3 border border-white/20 shadow-sm"
                        >
                          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                            <item.icon className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-sm font-medium text-white/90">
                            {item.text}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* ─── Right Form Panel ─────────────────────── */}
              <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-20 lg:py-0">
                <motion.div
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  custom={0}
                  className="w-full max-w-md"
                >
                  <div className="mb-8">
                    <h1 className="text-2xl font-bold tracking-tight mb-2">
                      Sign in to your account
                    </h1>
                    <p className="text-muted-foreground">
                      Enter your credentials to access your dashboard
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Role Select */}
                    <div className="space-y-2">
                      <Label htmlFor="role" className="text-sm font-medium">
                        <span className="flex items-center gap-2">
                          <UserCog className="h-4 w-4 text-muted-foreground" />
                          Account Type
                        </span>
                      </Label>
                      <div className="relative">
                        <select
                          id="role"
                          value={role}
                          onChange={(e) => setRole(e.target.value)}
                          className="w-full h-11 px-4 py-2 bg-white border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 appearance-none"
                          disabled={isLoading}
                        >
                          <option value="Manager">Admin Access Only</option>
                          <option value="Client">
                            User (Freelancer/Client)
                          </option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
                          <svg
                            className="h-4 w-4"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">
                        <span className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          Email Address
                        </span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-11 rounded-xl border-border focus:ring-2 focus:ring-primary/30"
                        disabled={isLoading}
                      />
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium">
                        <span className="flex items-center gap-2">
                          <LockKeyhole className="h-4 w-4 text-muted-foreground" />
                          Password
                        </span>
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="h-11 rounded-xl border-border focus:ring-2 focus:ring-primary/30"
                        disabled={isLoading}
                      />
                    </div>

                    {/* Secret Code (Admin only) */}
                    {role === "Manager" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2"
                      >
                        <Label
                          htmlFor="secretCode"
                          className="text-sm font-medium"
                        >
                          <span className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                            Secret Code
                          </span>
                        </Label>
                        <Input
                          id="secretCode"
                          type="text"
                          placeholder="Enter admin access code"
                          value={secretCode}
                          onChange={(e) => setSecretCode(e.target.value)}
                          required
                          className="h-11 rounded-xl border-border focus:ring-2 focus:ring-primary/30"
                          disabled={isLoading}
                        />
                      </motion.div>
                    )}

                    {/* Submit */}
                    <Button
                      type="submit"
                      className="w-full h-11 rounded-xl btn-premium text-white border-0 group text-sm font-semibold"
                      disabled={isLoading}
                    >
                      <span className="flex items-center justify-center gap-2">
                        {isLoading ? (
                          <>
                            <svg
                              className="animate-spin h-4 w-4 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                            Signing In...
                          </>
                        ) : (
                          <>
                            Sign In
                              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                          </>
                        )}
                      </span>
                    </Button>
                  </form>

                  <p className="text-center mt-6 text-sm text-muted-foreground">
                    Don't have an account?{" "}
                    <Link
                      to="/sign-up"
                      className="font-semibold text-primary hover:underline"
                    >
                      Sign Up
                    </Link>
                  </p>
                </motion.div>
              </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SignIn;
