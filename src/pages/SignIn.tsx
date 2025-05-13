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
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
        <div className="min-h-screen bg-gradient-to-b from-background to-background/90">
          <Navbar />
          <div className="container mx-auto pt-28 pb-12 px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-md mx-auto"
            >
              <Card className="border-gradient overflow-hidden">
                <CardHeader className="space-y-1 pb-3">
                  <CardTitle className="text-2xl font-bold text-center">
                    <span className="text-gradient">Welcome Back</span>
                  </CardTitle>
                  <CardDescription className="text-center text-muted-foreground">
                    Enter your credentials to access your account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="role" className="font-medium">
                        <span className="flex items-center gap-2">
                          <UserCog className="h-4 w-4" />
                          Select Account Type
                        </span>
                      </Label>
                      <div className="relative">
                        <select
                          id="role"
                          value={role}
                          onChange={(e) => setRole(e.target.value)}
                          className="w-full h-10 px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 appearance-none"
                          disabled={isLoading}
                        >
                          <option value="Manager">Admin Access Only</option>
                          <option value="Client">
                            User (Freelancer/Client)
                          </option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-muted-foreground">
                          <svg
                            className="h-4 w-4 fill-current"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
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

                    <div className="space-y-2">
                      <Label htmlFor="email" className="font-medium">
                        <span className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email Address
                        </span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="email"
                          type="email"
                          placeholder="enter@your.email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="pl-3 focus:ring-2 focus:ring-primary/30"
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="font-medium">
                        <span className="flex items-center gap-2">
                          <LockKeyhole className="h-4 w-4" />
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
                        className="focus:ring-2 focus:ring-primary/30"
                        disabled={isLoading}
                      />
                    </div>

                    {role === "Manager" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2"
                      >
                        <Label htmlFor="secretCode" className="font-medium">
                          <span className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
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
                          className="focus:ring-2 focus:ring-primary/30"
                          disabled={isLoading}
                        />
                      </motion.div>
                    )}

                    <Button
                      type="submit"
                      className="w-full group relative overflow-hidden font-medium"
                      disabled={isLoading}
                    >
                      <span className="flex items-center justify-center gap-2">
                        {isLoading ? (
                          <>
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Signing In...
                          </>
                        ) : (
                          <>
                            Sign In
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                          </>
                        )}
                      </span>
                    </Button>
                  </form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-2 pt-0">
                  <div className="text-center text-sm">
                    <span className="text-muted-foreground">
                      Don't have an account?{" "}
                    </span>
                    <Link
                      to="/sign-up"
                      className="font-medium text-primary hover:underline transition-colors duration-200"
                    >
                      Sign Up
                    </Link>
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          </div>
        </div>
      )}
    </>
  );
};

export default SignIn;
