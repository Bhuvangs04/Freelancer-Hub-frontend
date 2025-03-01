import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SkillsInput from "./SkillsInput";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;
const RAZORPAY_KEY = "rzp_test_Rllu5UrIWbb27c";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const AddProject = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    budget: "",
    duration: "",
    category: "",
    skills: [],
    deadline: "",
    attachment: null,
  });
  const [userData, setUserData] = useState({ email: "", username: "", projectId: "",clientId:"" });
  const params = useParams<{ clientId: string }>();
  const chattingIdFromUrl = params.clientId;
  const getFromLocal = localStorage.getItem("Chatting_id");
  if (chattingIdFromUrl != getFromLocal)
  {
    navigate("/sign-in")
  }
    const handleChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    };

const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  if (e.target.files && e.target.files.length > 0) {
    setFormData((prev) => ({ ...prev, attachment: e.target.files[0] }));
  }
};



  const calculateCommission = (amount: number): string => (amount * 0.1).toFixed(2);

  const addProject = async () => {
    try {
      setIsLoading(true);
            const formDataToSend = new FormData();
            formDataToSend.append("title", formData.title);
            formDataToSend.append("description", formData.description);
            formDataToSend.append("budget", formData.budget);
            formDataToSend.append("duration", formData.duration);
            formDataToSend.append("category", formData.category);
            formDataToSend.append("deadline", formData.deadline);
            formDataToSend.append("skills", JSON.stringify(formData.skills));
            formDataToSend.append("Form_id", chattingIdFromUrl);
            if (formData.attachment) {
              formDataToSend.append("attachment", formData.attachment);
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
        clientId:data.clientId,
      });
      return data.projectId;
    } catch (error) {
      toast.error("Failed to add project");
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
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
  if (!formData.budget) {
    toast.error("Please enter a budget amount");
    return;
  }

  const projectId = await addProject();
  if (!projectId) return;

  const amount = parseFloat(formData.budget);
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
        client_id: chattingIdFromUrl,
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
      description: `Payment for ${formData.title}`,
      order_id: order.id,
      handler: async (response) => {
        await verifyPayment(response, projectId);
      },
      prefill: { email: userData.email, name: userData.username },
      theme: { color: "#2563eb" },
    };

    const razorpayInstance = new window.Razorpay(options);
    razorpayInstance.open();
  } catch (error) {
    console.log(error);
    toast.error("Payment failed, please try again");
    setIsLoading(false);
  }
};


  const verifyPayment = async (paymentData,projectId) => {
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
      if(response.ok)
      {
         toast.success("Project added successfully!");
         navigate("/find/freelancers");
      }
      if (!response.ok) throw new Error("Payment verification failed");
    } catch (error) {
      console.log(error)
      toast.error("Payment verification failed");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Add New Project
        </h1>
        <Card className="p-6">
          <form className="space-y-6" onSubmit={addProject}>
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700"
              >
                Project Title
              </label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="mt-1"
              />
            </div>

            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700"
              >
                Project Category
              </label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="web">Web Development</SelectItem>
                  <SelectItem value="mobile">Mobile Development</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="writing">Content Writing</SelectItem>
                  <SelectItem value="marketing">Digital Marketing</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Project Description
              </label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                className="mt-1"
                rows={6}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Required Skills
              </label>
              <SkillsInput
                skills={formData.skills}
                setSkills={(skills) =>
                  setFormData((prev) => ({ ...prev, skills }))
                }
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="budget"
                  className="block text-sm font-medium text-gray-700"
                >
                  Budget (₹)
                </label>
                <Input
                  id="budget"
                  name="budget"
                  type="number"
                  value={formData.budget}
                  onChange={handleChange}
                  required
                  className="mt-1"
                />
                {formData.budget && (
                  <p className="text-sm text-gray-500 mt-1">
                    Commission (10%): ₹
                    {calculateCommission(parseFloat(formData.budget))}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="duration"
                  className="block text-sm font-medium text-gray-700"
                >
                  Duration (in weeks)
                </label>
                <Input
                  id="duration"
                  name="duration"
                  type="number"
                  value={formData.duration}
                  onChange={handleChange}
                  required
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="deadline"
                className="block text-sm font-medium text-gray-700"
              >
                Project Deadline
              </label>
              <Input
                id="deadline"
                name="deadline"
                type="date"
                value={formData.deadline}
                onChange={handleChange}
                required
                className="mt-1"
              />
            </div>

            <div>
              <label
                htmlFor="attachment"
                className="block text-sm font-medium text-gray-700"
              >
                Attachment (Optional)
              </label>
              <Input
                id="attachment"
                name="attachment"
                type="file"
                onChange={handleFileChange}
              />
            </div>

            <Button
              type="button"
              onClick={handlePayment}
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Proceed to Payment (₹${
                  formData.budget
                    ? parseFloat(formData.budget) +
                      parseFloat(
                        calculateCommission(parseFloat(formData.budget))
                      )
                    : "0"
                })`
              )}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default AddProject;
