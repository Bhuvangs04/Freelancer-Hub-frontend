import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Navbar } from "@/components/Navbar";
import { useToast } from "@/components/ui/use-toast";
import { useDispatch } from "react-redux";
import { setUser } from "@/redux/userSlice";
import { ReloadIcon } from "@radix-ui/react-icons";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Manager");
  const [secretCode, setSecretCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toast } = useToast();

  function xorEncrypt(data, key) {
    let encoded = new TextEncoder().encode(data);
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

        if (data.role === "admin") {
          navigate("/admin-dashboard");
        } else if (data.role === "freelancer") {
          navigate(`/freelancer/home/in-en/${data.chat_id}`);
        } else {
          navigate(`/find/freelancers`);
        }
      } else {
        let errorMessage = "Invalid email or password";
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Navbar />
      <div className="pt-24 pb-12">
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
            Welcome Back
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role" className="text-gray-700">
                Role
              </Label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full border rounded-lg p-2 bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                disabled={isLoading}
              >
                <option value="Manager">Admin Access Only</option>
                <option value="Client">User (Freelancer/Client)</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="focus:ring-2 focus:ring-primary/20"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="focus:ring-2 focus:ring-primary/20"
                disabled={isLoading}
              />
            </div>
            {role === "Manager" && (
              <div className="space-y-2">
                <Label htmlFor="secretCode" className="text-gray-700">
                  Secret Code
                </Label>
                <Input
                  id="secretCode"
                  type="text"
                  placeholder="Enter the secret code"
                  value={secretCode}
                  onChange={(e) => setSecretCode(e.target.value)}
                  required
                  className="focus:ring-2 focus:ring-primary/20"
                  disabled={isLoading}
                />
              </div>
            )}
            <Button
              type="submit"
              className="w-full transition-all duration-200 hover:shadow-md"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <ReloadIcon className="h-4 w-4 animate-spin" />
                  Signing in...
                </div>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
          <p className="text-center mt-6 text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/sign-up"
              className="text-primary hover:underline transition-colors duration-200"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
