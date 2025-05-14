import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate, useParams } from "react-router-dom";

// Define form schema with Zod
const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  budget: z.string().min(1, "Budget is required"),
  duration: z.string().min(1, "Duration is required"),
  category: z.string().min(1, "Category is required"),
  deadline: z.string().min(1, "Deadline is required"),
  // Skills and attachment are handled separately
});

type FormValues = z.infer<typeof formSchema>;


// interface SkillsInputProps {
//   skills: string[];
//   setSkills: (skills: string[]) => void;
// }

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
          className="flex-grow input-focus-ring"
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={addSkill}
          className="flex items-center gap-1 group transition-all duration-200"
        >
          <PlusCircle className="h-4 w-4 group-hover:scale-110 transition-transform" />
          <span>Add</span>
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 animate-fade-in">
        {skills.map((skill, index) => (
          <Badge
            key={index}
            className="flex items-center gap-1 py-1.5 pl-3 pr-2 bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 transition-all duration-200"
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
          <div className="text-sm text-muted-foreground italic">
            No skills added yet
          </div>
        )}
      </div>
    </div>
  );
};

const ProjectForm = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [userData, setUserData] = useState({
    email: "",
    username: "",
    projectId: "",
    clientId: "",
  });
  const params = useParams<{ clientId: string }>();
  const getFromLocal = localStorage.getItem("Chatting_id");

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

  // // Check if user is authenticated
  // if (chattingIdFromUrl !== getFromLocal) {
  //   navigate("/sign-in");
  // }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setAttachment(e.target.files[0]);
    }
  };

  const calculateCommission = (amount: number): string =>
    (amount * 0.1).toFixed(2);

  const addProject = async (values: FormValues) => {
    try {
      setIsLoading(true);
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
      setIsLoading(false);
      return null;
    } finally {
      setIsLoading(false);
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
    const values = form.getValues();

    if (parseFloat(values.budget) < 0) {
      toast.error("Budget cannot be negative");
      return;
    }
    if (!values.budget) {
      toast.error("Please enter a budget amount");
      return;
    }

    // Validate form first
    const isValid = await form.trigger();
    if (!isValid) {
      toast.error("Please fill in all required fields");
      return;
    }

    const projectId = await addProject(values);
    if (!projectId) return;

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
        headers: { "Content-Type": "application/json" },
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
        name: "Freelance Platform",
        description: `Payment for ${values.title}`,
        order_id: order.id,
        handler: async (response) => {
          await verifyPayment(response, projectId);
        },
        prefill: { email: userData.email, name: userData.username },
        theme: { color: "#0077ED" },
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
        headers: { "Content-Type": "application/json" },
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
    <div className="w-full animate-fade-in">
      <Button
        variant="ghost"
        className="ml-3 mt-5 flex items-center gap-2 hover:bg-green-400"
        onClick={() => navigate(-1)}
      >
        <ArrowLeftIcon width={24} />
        Back
      </Button>
      <Card className="glass-card shadow-md transition-all duration-300 overflow-hidden">
        <CardHeader className="pb-6 space-y-4">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-semibold tracking-tight">
              Add New Project
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Create a project and find the perfect freelancer for your needs
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <Form {...form}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem
                    className="space-y-2 animate-slide-in"
                    style={{ animationDelay: "50ms" }}
                  >
                    <FormLabel className="flex items-center gap-2 font-medium">
                      <FileText className="h-4 w-4 text-primary" />
                      Project Title
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g. E-commerce Website Development"
                        className="input-focus-ring"
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
                  <FormItem
                    className="space-y-2 animate-slide-in"
                    style={{ animationDelay: "100ms" }}
                  >
                    <FormLabel className="flex items-center gap-2 font-medium">
                      <Tag className="h-4 w-4 text-primary" />
                      Project Category
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="input-focus-ring">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-background/95 backdrop-blur-sm">
                        <SelectItem value="web">Web Development</SelectItem>
                        <SelectItem value="mobile">
                          Mobile Development
                        </SelectItem>
                        <SelectItem value="design">Design</SelectItem>
                        <SelectItem value="writing">Content Writing</SelectItem>
                        <SelectItem value="marketing">
                          Digital Marketing
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem
                  className="space-y-2 animate-slide-in"
                  style={{ animationDelay: "150ms" }}
                >
                  <FormLabel className="flex items-center gap-2 font-medium">
                    <FileText className="h-4 w-4 text-primary" />
                    Project Description
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Describe your project requirements in detail..."
                      className="min-h-[120px] input-focus-ring"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div
              className="space-y-2 animate-slide-in"
              style={{ animationDelay: "200ms" }}
            >
              <FormLabel className="flex items-center gap-2 font-medium">
                <Tag className="h-4 w-4 text-primary" />
                Required Skills
              </FormLabel>
              <EnhancedSkillsInput skills={skills} setSkills={setSkills} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem
                    className="space-y-2 animate-slide-in"
                    style={{ animationDelay: "250ms" }}
                  >
                    <FormLabel className="flex items-center gap-2 font-medium">
                      <IndianRupee className="h-4 w-4 text-primary" />
                      Budget (₹)
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder="Enter your budget"
                        className="input-focus-ring"
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          if (
                            value + parseFloat(calculateCommission(value)) <=
                            50000
                          ) {
                            field.onChange(e);
                          } else {
                            toast.error(
                              "Total amount including service fee should not exceed ₹50000"
                            );
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                    {field.value && (
                      <div className="mt-2 p-2 bg-primary/5 rounded-md border border-primary/10 flex items-center justify-between text-sm">
                        <span>Service Fee (10%):</span>
                        <span className="font-medium">
                          ₹{calculateCommission(parseFloat(field.value))}
                        </span>
                      </div>
                    )}
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem
                    className="space-y-2 animate-slide-in"
                    style={{ animationDelay: "300ms" }}
                  >
                    <FormLabel className="flex items-center gap-2 font-medium">
                      <Clock className="h-4 w-4 text-primary" />
                      Duration (in weeks)
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder="e.g. 4"
                        className="input-focus-ring"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem
                    className="space-y-2 animate-slide-in"
                    style={{ animationDelay: "350ms" }}
                  >
                    <FormLabel className="flex items-center gap-2 font-medium">
                      <Calendar className="h-4 w-4 text-primary" />
                      Project Deadline
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="date"
                        className="input-focus-ring"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div
                className="space-y-2 animate-slide-in"
                style={{ animationDelay: "400ms" }}
              >
                <FormLabel
                  htmlFor="attachment"
                  className="flex items-center gap-2 font-medium"
                >
                  <Upload className="h-4 w-4 text-primary" />
                  Attachment (Optional)
                </FormLabel>
                <div className="relative">
                  <Input
                    id="attachment"
                    name="attachment"
                    type="file"
                    onChange={handleFileChange}
                    className="input-focus-ring file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                  />
                  {attachment && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      File: {attachment.name}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Form>
        </CardContent>

        <CardFooter className="flex flex-col border-t bg-secondary/30 pt-6">
          {budget && (
            <div className="w-full mb-4 p-3 bg-white rounded-md border flex flex-col sm:flex-row items-center justify-between gap-2 animate-fade-in">
              <div className="text-sm">
                <span className="font-medium">Total Amount:</span>
                <span className="text-muted-foreground">
                  {" "}
                  (Including 10% service fee)
                </span>
              </div>
              <div className="text-lg font-semibold text-primary">
                ₹{totalAmount.toFixed(2)}
              </div>
            </div>
          )}

          <Button
            onClick={handlePayment}
            disabled={isLoading}
            className={cn(
              "w-full py-6 text-base font-medium transition-all duration-300 relative overflow-hidden group",
              "bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary",
              "shadow-lg hover:shadow-primary/25 btn-shine"
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processing Payment...
              </>
            ) : (
              `Proceed to Payment (₹${totalAmount.toFixed(2)})`
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ProjectForm;
