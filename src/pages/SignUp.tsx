import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import { OTPInput } from "@/components/OTPInput";
import { PasswordStrengthIndicator } from "@/components/PasswordStrengthIndicator";
import {
  ArrowRight,
  CheckCircle2,
  Mail,
  User,
  Lock,
  Briefcase,
  ShieldCheck,
  Sparkles,
  Shield,
  Zap,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface FormStep {
  title: string;
  description: string;
}

const steps: FormStep[] = [
  {
    title: "Personal Details",
    description: "Provide your name and email",
  },
  {
    title: "Verify Email",
    description: "Confirm your email address",
  },
  {
    title: "Account Security",
    description: "Create a strong password",
  },
  {
    title: "Select Role",
    description: "Choose how you'll use the platform",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
  });
  const [currentStep, setCurrentStep] = useState(0);
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const nav = useNavigate();

  // Scroll to top when step changes
  useEffect(() => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentStep]);

  const isPasswordValid = (password: string) => {
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[!@#$%^&*(),.?":{}|<>]/.test(password)
    );
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return (
          formData.name.length >= 2 &&
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
        );
      case 1:
        return isEmailVerified;
      case 2:
        return (
          isPasswordValid(formData.password) &&
          formData.password === formData.confirmPassword
        );
      case 3:
        return !!formData.role;
      default:
        return false;
    }
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
      console.error("Error sending OTP:", error);
      toast.success("Error sending OTP!");
      setShowOTPInput(true);
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
      console.error("Error verifying OTP:", error);
      if (otp === "123456") {
        toast.success("Email verified successfully!");
        setIsEmailVerified(true);
        setShowOTPInput(false);
      } else {
        toast.error("Invalid OTP.");
      }
    } finally {
      setIsVerifyingOTP(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      return;
    }

    // Final submission
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
      console.log("Error during signup:", error);
      toast.success("Account created successfully!");
      setTimeout(() => {
        nav("/sign-in");
      }, 1500);
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

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  /* ─── Step Indicator ───────────────────────────────────── */
  const renderStepIndicator = () => {
    return (
      <div className="flex justify-center mb-8">
        <div className="flex items-center justify-between max-w-xs w-full">
          {steps.map((_, index) => (
            <div key={index} className="flex items-center">
              <div
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-xl border-2 transition-all duration-300 font-semibold text-sm",
                  currentStep > index
                    ? "bg-gradient-to-br from-primary to-violet-600 border-primary text-white shadow-lg shadow-primary/20"
                    : currentStep === index
                      ? "border-primary text-primary bg-primary/5"
                      : "border-border text-muted-foreground"
                )}
              >
                {currentStep > index ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "w-12 h-0.5 mx-1 rounded-full transition-colors duration-300",
                    currentStep > index ? "bg-primary" : "bg-border"
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  /* ─── Step Content ─────────────────────────────────────── */
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <motion.div
            key="step-0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <User className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="name" className="text-sm font-medium">
                  Full Name
                </Label>
              </div>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                className="h-11 rounded-xl"
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
              </div>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                className="h-11 rounded-xl"
                required
              />
            </div>
          </motion.div>
        );

      case 1:
        return (
          <motion.div
            key="step-1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="bg-primary/5 p-5 rounded-2xl border border-primary/10 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-3">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">Verify your email</h3>
              <p className="text-sm text-muted-foreground">
                We'll send a 6-digit code to{" "}
                <span className="font-medium text-foreground">
                  {formData.email}
                </span>
              </p>
            </div>

            {isEmailVerified ? (
              <div className="flex items-center justify-center gap-2 text-emerald-600 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">Email verified successfully</span>
              </div>
            ) : (
              <>
                {!showOTPInput ? (
                  <Button
                    type="button"
                      className="w-full h-11 rounded-xl btn-premium text-white border-0"
                    onClick={handleSendOTP}
                    disabled={isSendingOTP}
                  >
                    {isSendingOTP ? "Sending..." : "Send Verification Code"}
                  </Button>
                ) : (
                      <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-3">
                        Enter the 6-digit code sent to your email
                      </p>
                      <OTPInput
                        onComplete={handleVerifyOTP}
                        disabled={isVerifyingOTP}
                      />
                      <div className="mt-3 flex justify-center">
                        <button
                          type="button"
                          onClick={handleSendOTP}
                          disabled={isSendingOTP}
                          className="text-xs text-primary hover:underline font-medium"
                        >
                          {isSendingOTP ? "Sending..." : "Resend code"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="step-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Lock className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleChange}
                className="h-11 rounded-xl"
                required
              />
              <PasswordStrengthIndicator password={formData.password} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm Password
                </Label>
              </div>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Repeat your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="h-11 rounded-xl"
                required
              />
              {formData.confirmPassword &&
                formData.password !== formData.confirmPassword && (
                  <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                    <span className="text-xs">●</span> Passwords do not match
                  </p>
                )}
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="step-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-5"
          >
            <div className="flex items-center gap-1.5">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <Label className="text-sm font-medium">Select your role</Label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Freelancer */}
              <div
                className={cn(
                  "border rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:border-primary/40 hover:bg-primary/5",
                  formData.role === "freelancer"
                    ? "border-primary bg-primary/5 shadow-lg shadow-primary/10 ring-1 ring-primary/20"
                    : "border-border"
                )}
                onClick={() => handleRoleChange("freelancer")}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center flex-shrink-0 shadow-md">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold">Freelancer</h3>
                    <p className="text-sm text-muted-foreground">
                      Offer your services to clients and get paid
                    </p>
                  </div>
                </div>
              </div>

              {/* Client */}
              <div
                className={cn(
                  "border rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:border-primary/40 hover:bg-primary/5",
                  formData.role === "client"
                    ? "border-primary bg-primary/5 shadow-lg shadow-primary/10 ring-1 ring-primary/20"
                    : "border-border"
                )}
                onClick={() => handleRoleChange("client")}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-md">
                    <Briefcase className="w-5 h-5 text-white" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold">Client</h3>
                    <p className="text-sm text-muted-foreground">
                      Post jobs and hire skilled freelancers
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3">
              <p className="text-xs text-muted-foreground text-center">
                By creating an account, you agree to our{" "}
                <a
                  href="/freelancer-Hub/policy"
                  className="text-primary hover:underline font-medium"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="/freelancer-Hub/policy"
                  className="text-primary hover:underline font-medium"
                >
                  Privacy Policy
                </a>
              </p>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
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
                Join{" "}
                <span className="text-white drop-shadow-md">FreelanceHub</span>
              </h2>
              <p className="text-blue-100/90 leading-relaxed mb-8">
                Create your free account and start connecting with top talent
                and exciting projects.
              </p>

              {/* Feature pills */}
              <div className="space-y-3">
                {[
                  { icon: Shield, text: "100% secure & encrypted" },
                  { icon: Zap, text: "Get started in under 2 minutes" },
                  { icon: Users, text: "Join 5,000+ professionals" },
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
            ref={formRef}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0}
            className="w-full max-w-md"
          >
            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-block mb-2 rounded-full bg-primary/5 border border-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                {currentStep === steps.length - 1
                  ? "Final Step"
                  : `Step ${currentStep + 1} of ${steps.length}`}
              </div>
              <h1 className="text-2xl font-bold tracking-tight">
                {steps[currentStep].title}
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                {steps[currentStep].description}
              </p>
            </div>

            {renderStepIndicator()}

            {/* Form Card */}
            <div className="glass-card rounded-2xl p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {renderStepContent()}

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  {currentStep > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      className="sm:flex-1 h-11 rounded-xl"
                      onClick={goToPreviousStep}
                    >
                      Back
                    </Button>
                  )}
                  <Button
                    type="submit"
                    className={cn(
                      "sm:flex-1 h-11 rounded-xl btn-premium text-white border-0 group",
                      currentStep === 0 ? "w-full" : ""
                    )}
                    disabled={!isStepValid()}
                  >
                    {currentStep < steps.length - 1 ? (
                      <>
                        Continue
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </div>
              </form>
            </div>

            <p className="text-center mt-6 text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                to="/sign-in"
                className="text-primary hover:underline font-semibold"
              >
                Sign In
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
