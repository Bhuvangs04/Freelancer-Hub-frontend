import { useState, useRef } from "react";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { v4 as uuidv4 } from "uuid";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Loader2,
  Upload,
  PlusCircle,
  X,
  Calendar,
  Tag,
  IndianRupee,
  Clock,
  FileText,
  ArrowLeftIcon,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";

// Define form schema with Zod
const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  budget: z.string().min(1, "Budget is required"),
  duration: z.string().min(1, "Duration is required"),
  category: z.string().min(1, "Category is required"),
  deadline: z.string().min(1, "Deadline is required"),
});

type FormValues = z.infer<typeof formSchema>;

const API_URL = import.meta.env.VITE_API_URL;
const RAZORPAY_KEY = "rzp_test_Rllu5UrIWbb27c";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const EnhancedSkillsInput = ({ skills, setSkills }) => {
  const [input, setInput] = useState("");

  const addSkill = () => {
    if (input.trim() && !skills.includes(input.trim())) {
      setSkills([...skills, input.trim()]);
      setInput("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter a skill and press Enter"
          className="flex-grow h-11 rounded-xl border-border focus:ring-2 focus:ring-primary/20"
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={addSkill}
          className="h-11 px-4 rounded-xl border-border hover:bg-primary/5 hover:text-primary transition-colors"
        >
          <PlusCircle className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 min-h-[30px]">
        {skills.map((skill, index) => (
          <Badge
            key={index}
            className="flex items-center gap-1 py-1.5 pl-3 pr-2 bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 transition-all rounded-lg"
          >
            {skill}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeSkill(skill)}
              className="h-5 w-5 p-0 ml-1 hover:bg-primary/30 rounded-full"
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
        {skills.length === 0 && (
          <div className="text-sm text-muted-foreground italic flex items-center gap-2">
            <Sparkles className="h-3 w-3" />
            Add skills to help freelancers find your project
          </div>
        )}
      </div>
    </div>
  );
};

const ProjectForm = () => {
  const navigate = useNavigate();
  const { platformCommissionPercent } = useSiteSettings();
  const commissionRate = platformCommissionPercent / 100;
  const [isLoading, setIsLoading] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [userData, setUserData] = useState({
    email: "",
    username: "",
    projectId: "",
    clientId: "",
  });
  const getFromLocal = localStorage.getItem("Chatting_id");
  const projectKey = useRef<string>(uuidv4());
  const orderKey = useRef<string>(uuidv4());
  const verifyKey = useRef<string>(uuidv4());

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      budget: "",
      duration: "",
      category: "",
      deadline: "",
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setAttachment(e.target.files[0]);
    }
  };

  const calculateCommission = (amount: number): string =>
    (amount * commissionRate).toFixed(2);

  const addProject = async (values: FormValues) => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", values.title);
      formDataToSend.append("description", values.description);
      formDataToSend.append("budget", values.budget);
      formDataToSend.append("duration", values.duration);
      formDataToSend.append("category", values.category);
      formDataToSend.append("deadline", values.deadline);
      formDataToSend.append("skills", JSON.stringify(skills));
      formDataToSend.append("Form_id", getFromLocal || "");
      if (attachment) {
        formDataToSend.append("attachment", attachment);
      }

      const response = await fetch(`${API_URL}/client/clients/add-project`, {
        method: "POST",
        credentials: "include",
        headers: {
          "x-idempotency-key": projectKey.current,
        },
        body: formDataToSend,
      });

      const data = await response.json();
      if (!data.projectId) throw new Error("Failed to add project");

      setUserData({
        email: data.email,
        username: data.username,
        projectId: data.projectId,
        clientId: data.clientId,
      });

      return data.projectId;
    } catch (error) {
      console.error("Error adding project:", error);
      toast.error("Failed to add project");
      return null;
    }
  };

  const loadRazorpayScript = () => {
    return new Promise<boolean>((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (isLoading) return;
    setIsLoading(true);
    const values = form.getValues();

    if (parseFloat(values.budget) < 0) {
      toast.error("Budget cannot be negative");
      return;
    }
    if (!values.budget) {
      toast.error("Please enter a budget amount");
      setIsLoading(false);
      return;
    }

    // Validate form first
    const isValid = await form.trigger();
    if (!isValid) {
      toast.error("Please fill in all required fields");
      setIsLoading(false);
      return;
    }

    const projectId = await addProject(values);
    if (!projectId) {
      setIsLoading(false);
      return;
    }

    const amount = parseFloat(values.budget);
    const commission = parseFloat(calculateCommission(amount));
    const totalAmount = amount + commission;

    try {
      const isRazorpayLoaded = await loadRazorpayScript();
      if (!isRazorpayLoaded) {
        throw new Error("Failed to load Razorpay SDK");
      }

      const response = await fetch(`${API_URL}/payments/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-idempotency-key": orderKey.current,
        },
        credentials: "include",
        body: JSON.stringify({
          amount: totalAmount * 100,
          client_id: getFromLocal,
          currency: "INR",
          project_id: projectId,
        }),
      });

      const order = await response.json();
      if (!order.id) throw new Error("Failed to create order");

      const options = {
        key: RAZORPAY_KEY,
        amount: totalAmount * 100,
        currency: "INR",
        name: "FreelanceHub",
        description: `Payment for ${values.title}`,
        order_id: order.id,
        handler: async (response) => {
          await verifyPayment(response, projectId);
        },
        prefill: { email: userData.email, name: userData.username },
        theme: { color: "#6366f1" },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    } catch (error) {
      console.log(error);
      toast.error("Payment failed, please try again");
      setIsLoading(false);
    }
  };

  const verifyPayment = async (paymentData, projectId: string) => {
    try {
      const response = await fetch(`${API_URL}/payments/verify-payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-idempotency-key": verifyKey.current,
        },
        credentials: "include",
        body: JSON.stringify({
          ...paymentData,
          client_id: getFromLocal,
          project_id: projectId,
        }),
      });

      await response.json();

      if (response.ok) {
        toast.success("Project added successfully!");
        projectKey.current = uuidv4();
        orderKey.current = uuidv4();
        verifyKey.current = uuidv4();
        navigate("/find/freelancers");
      }

      if (!response.ok) throw new Error("Payment verification failed");
    } catch (error) {
      console.log(error);
      toast.error("Payment verification failed");
      setIsLoading(false);
    }
  };

  const budget = form.watch("budget");
  const totalAmount = budget
    ? parseFloat(budget) + parseFloat(calculateCommission(parseFloat(budget)))
    : 0;

  return (
    <div className="min-h-screen bg-white hero-gradient-mesh py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          className="mb-6 flex items-center gap-2 hover:bg-white/50 text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => navigate(-1)}
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Dashboard
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="glass-card shadow-xl border-border/50 overflow-hidden">
            <CardHeader className="pb-8 space-y-4 border-b border-border/40 bg-white/40">
              <div className="space-y-2">
                <CardTitle className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-violet-600">
                  Post a New Project
                </CardTitle>
                <CardDescription className="text-base text-muted-foreground">
                  Provide details about your project to connect with top-tier
                  freelancers.
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="p-8 space-y-8">
              <Form {...form}>
                {/* 1. Project Basics */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    Project Basics
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem className="col-span-1 md:col-span-2">
                          <FormLabel className="font-medium text-foreground/80">Project Title</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="e.g. Full Stack E-commerce Application"
                              className="h-11 rounded-xl border-border focus:ring-2 focus:ring-primary/20"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium text-foreground/80">Category</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-11 rounded-xl border-border focus:ring-2 focus:ring-primary/20">
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-xl">
                              <SelectItem value="web">Web Development</SelectItem>
                              <SelectItem value="mobile">Mobile Development</SelectItem>
                              <SelectItem value="design">Design & Creative</SelectItem>
                              <SelectItem value="writing">Writing & Translation</SelectItem>
                              <SelectItem value="marketing">Digital Marketing</SelectItem>
                              <SelectItem value="data">Data Science</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="deadline"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium text-foreground/80">Deadline</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="date"
                              className="h-11 rounded-xl border-border focus:ring-2 focus:ring-primary/20"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium text-foreground/80">Description</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Describe your project goals, deliverables, and any specific requirements..."
                            className="min-h-[140px] rounded-xl border-border focus:ring-2 focus:ring-primary/20 resize-y"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* 2. Skills & Files */}
                <div className="space-y-6 pt-4 border-t border-border/40">
                  <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
                    <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <Tag className="h-4 w-4 text-emerald-600" />
                    </div>
                    Skills & Assets
                  </h3>

                  <div className="space-y-3">
                    <FormLabel className="font-medium text-foreground/80">Required Skills</FormLabel>
                    <EnhancedSkillsInput skills={skills} setSkills={setSkills} />
                  </div>

                  <div className="space-y-3">
                    <FormLabel className="font-medium text-foreground/80">Project Files (Optional)</FormLabel>
                    <div className="border-2 border-dashed border-border hover:border-primary/40 rounded-xl p-6 transition-colors bg-muted/20 text-center cursor-pointer relative group">
                      <Input
                        id="attachment"
                        name="attachment"
                        type="file"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                        <div className="text-sm font-medium text-muted-foreground group-hover:text-foreground">
                          {attachment ? (
                            <span className="text-primary font-semibold">{attachment.name}</span>
                          ) : (
                            "Click to upload specs or design files"
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Budget & Duration */}
                <div className="space-y-6 pt-4 border-t border-border/40">
                  <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
                    <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                      <IndianRupee className="h-4 w-4 text-amber-600" />
                    </div>
                    Budget & Timeline
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="budget"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium text-foreground/80">Budget (₹)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-3 top-2.5 text-muted-foreground">₹</span>
                              <Input
                                {...field}
                                type="number"
                                placeholder="5000"
                                className="pl-7 h-11 rounded-xl border-border focus:ring-2 focus:ring-primary/20"
                                onChange={(e) => {
                                  // Validation logic preserved
                                  const value = parseFloat(e.target.value);
                                  if (value + parseFloat(calculateCommission(value)) <= 50000) {
                                    field.onChange(e);
                                  } else {
                                    toast.error(
                                      "Total amount including service fee should not exceed ₹50000"
                                    );
                                  }
                                }}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                          {field.value && (
                            <div className="mt-2 text-xs flex justify-between bg-muted/40 p-2 rounded-lg">
                              <span className="text-muted-foreground">Service Fee ({platformCommissionPercent}%)</span>
                              <span className="font-medium">₹{calculateCommission(parseFloat(field.value))}</span>
                            </div>
                          )}
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium text-foreground/80">Duration (Weeks)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                {...field}
                                type="number"
                                placeholder="2"
                                className="pl-9 h-11 rounded-xl border-border focus:ring-2 focus:ring-primary/20"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </Form>
            </CardContent>

            <CardFooter className="flex flex-col bg-muted/30 p-8 border-t border-border/40">
              {budget && (
                <div className="w-full mb-6 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-primary/10 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-2">
                  <div className="text-sm">
                    <span className="font-semibold text-foreground">Total Payable</span>
                    <span className="text-muted-foreground ml-1">
                      (Includes service fee)
                    </span>
                  </div>
                  <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-violet-600">
                    ₹{totalAmount.toFixed(2)}
                  </div>
                </div>
              )}

              <Button
                onClick={handlePayment}
                disabled={isLoading}
                className={cn(
                  "w-full h-14 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 btn-premium text-white border-0",
                  isLoading && "opacity-80 cursor-not-allowed"
                )}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing Secure Payment...
                  </>
                ) : (
                  `Proceed to Payment`
                )}
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-4">
                Payments are secured by Razorpay and held in escrow until you approve the work.
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default ProjectForm;
