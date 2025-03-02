import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OTPInput } from "@/components/OTPInput";
import { PasswordStrengthIndicator } from "@/components/PasswordStrengthIndicator";
import { Mail } from "lucide-react";

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
  });
  const nav = useNavigate();

  const [showOTPInput, setShowOTPInput] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const [isSendingOTP, setIsSendingOTP] = useState(false);

  const isPasswordValid = (password: string) => {
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[!@#$%^&*(),.?":{}|<>]/.test(password)
    );
  };

  const isFormValid = () => {
    return (
      formData.name &&
      formData.email &&
      isEmailVerified &&
      formData.role &&
      isPasswordValid(formData.password) &&
      formData.password === formData.confirmPassword
    );
  };

  const handleSendOTP = async () => {
    if (!formData.email) {
      toast.error("Please enter your email first");
      return;
    }

    setIsSendingOTP(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("OTP sent to your email!");
        setShowOTPInput(true);
      } else {
        toast.error(data.message || "Failed to send OTP");
      }
    } catch (error) {
      toast.error("Failed to send OTP. Please try again.");
    } finally {
      setIsSendingOTP(false);
    }
  };

  const handleVerifyOTP = async (otp: string) => {
    setIsVerifyingOTP(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/verify-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: formData.email, otp }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("Email verified successfully!");
        setIsEmailVerified(true);
        setShowOTPInput(false);
      } else {
        toast.error(data.message || "Invalid OTP");
      }
    } catch (error) {
      toast.error("Failed to verify OTP. Please try again.");
    } finally {
      setIsVerifyingOTP(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid()) {
      toast.error("Please complete all requirements before signing up.");
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.name,
          password: formData.password,
          email: formData.email,
          role: formData.role,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Signup successful!");
        setFormData({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          role: "",
        });
        setIsEmailVerified(false);
        nav("/sign-in");
      } else {
        toast.error(data.message || "Signup failed.");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again later.");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleRoleChange = (value: string) => {
    setFormData({
      ...formData,
      role: value,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-24 pb-12">
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-sm">
          <h2 className="text-2xl font-bold text-center mb-6">
            Create Your Account
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="flex gap-2">
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={isEmailVerified}
                />
                <Button
                  type="button"
                  variant={isEmailVerified ? "outline" : "default"}
                  className="whitespace-nowrap"
                  onClick={handleSendOTP}
                  disabled={isEmailVerified || !formData.email || isSendingOTP}
                >
                  {isEmailVerified ? (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Verified
                    </>
                  ) : (
                    "Verify Email"
                  )}
                </Button>
              </div>
            </div>

            {showOTPInput && !isEmailVerified && (
              <div className="space-y-2">
                <Label>Enter OTP</Label>
                <OTPInput onComplete={handleVerifyOTP} />
                <p className="text-sm text-muted-foreground text-center mt-2">
                  Enter the 6-digit code sent to your email
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="role">I want to join as</Label>
              <Select onValueChange={handleRoleChange} value={formData.role}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="freelancer">Freelancer</SelectItem>
                  <SelectItem value="client">Client</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <PasswordStrengthIndicator password={formData.password} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              {formData.confirmPassword &&
                formData.password !== formData.confirmPassword && (
                  <p className="text-sm text-red-500">Passwords do not match</p>
                )}
            </div>

            <Button type="submit" className="w-full" disabled={!isFormValid()}>
              Sign Up
            </Button>
          </form>

          <p className="text-center mt-4 text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/sign-in" className="text-primary hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
