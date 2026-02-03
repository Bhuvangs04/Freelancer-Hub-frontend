import {
  ApiResponse,
  Project,
  TaskFormData,
  MessageFormData,
  ProjectStatus,
  Agreement,
  PaymentOrder,
  Escrow,
  Milestone,
  MilestoneInput,
  MilestoneSummary,
  MilestoneDeliverable,
  Dispute,
  DisputeEvidence,
  Review,
  ReviewRatings,
  Reputation,
  FinanceDashboard,
  TaxSummary,
  BankDetails,
  Withdrawal,
  SkillVerification,
  GitHubProfile,
  PortfolioDetails,
} from "@/types";
import { toast } from "sonner";
import axios from "axios";

// Base API URL - replace with your actual backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL;

// Set up axios instance with common headers
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Add auth token to requests if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Generate unique idempotency key
const generateIdempotencyKey = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 18)}`;
};

// Helper to handle API errors
const handleApiError = (
  error: any,
  customMessage: string
): ApiResponse<any> => {
  console.error(`${customMessage}:`, error);
  const errorMessage = error.response?.data?.message || "An error occurred";
  toast.error(errorMessage);
  return { status: "error", message: errorMessage };
};

// API Functions
export const api = {
  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  init: () => {
    // Nothing to initialize for real API
  },

  // ============================================================================
  // PROJECT APIs
  // ============================================================================

  getProjects: async (): Promise<ApiResponse<Project[]>> => {
    try {
      const response = await apiClient.get(`/worksubmission/ongoing/projects/V1`);
      return { status: "success", data: response.data };
    } catch (error) {
      return handleApiError(error, "Error fetching projects");
    }
  },

  getProject: async (projectId: string): Promise<ApiResponse<Project>> => {
    try {
      const response = await apiClient.get(`/worksubmission/projects/${projectId}`);
      return { status: "success", data: response.data };
    } catch (error) {
      return handleApiError(error, "Error fetching project details");
    }
  },

  addTask: async (
    projectId: string,
    taskData: TaskFormData
  ): Promise<ApiResponse<Project>> => {
    try {
      await apiClient.post(`/worksubmission/tasks`, {
        projectId,
        title: taskData.title,
      });
      const updatedProject = await api.getProject(projectId);
      if (updatedProject.status === "success") {
        toast.success("Task added successfully");
      }
      return updatedProject;
    } catch (error) {
      return handleApiError(error, "Error adding task");
    }
  },

  deleteTask: async (
    projectId: string,
    taskId: string
  ): Promise<ApiResponse<Project>> => {
    try {
      const response = await apiClient.delete(`/worksubmission/tasks/${taskId}/${projectId}`);
      const updatedProject = await api.getProject(projectId);
      if (updatedProject.status === "success" && response.status === 200) {
        toast.success("Task deleted successfully");
      }
      return updatedProject;
    } catch (error) {
      return handleApiError(error, "Error deleting task");
    }
  },

  updateTaskStatus: async (
    projectId: string,
    taskId: string,
    completed: boolean
  ): Promise<ApiResponse<Project>> => {
    try {
      await apiClient.patch(`/worksubmission/tasks/${taskId}`, {
        projectId,
        completed,
      });
      const updatedProject = await api.getProject(projectId);
      if (updatedProject.status === "success") {
        toast.success(completed ? "Task marked as completed" : "Task marked as incomplete");
      }
      return updatedProject;
    } catch (error) {
      return handleApiError(error, "Error updating task status");
    }
  },

  updateTaskStatusType: async (
    projectId: string,
    status: ProjectStatus
  ): Promise<ApiResponse<Project>> => {
    try {
      const response = await apiClient.patch(`/freelancer/projects/${projectId}/${status}`);
      if (response) {
        toast.success(response.data.message);
      }
      return await api.getProject(projectId);
    } catch (error) {
      return handleApiError(error, "Error updating task status");
    }
  },

  sendMessage: async (
    projectId: string,
    messageData: MessageFormData
  ): Promise<ApiResponse<Project>> => {
    try {
      await apiClient.post(`/messages`, {
        projectId,
        content: messageData.content,
      });
      const updatedProject = await api.getProject(projectId);
      if (updatedProject.status === "success") {
        toast.success("Message sent successfully");
      }
      return updatedProject;
    } catch (error) {
      return handleApiError(error, "Error sending message");
    }
  },

  uploadFile: async (
    projectId: string,
    file: File
  ): Promise<ApiResponse<Project>> => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("projectId", projectId);
      formData.append("fileName", file.name);

      await axios.post(`${API_BASE_URL}/worksubmission/upload-file`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      const updatedProject = await api.getProject(projectId);
      if (updatedProject.status === "success") {
        toast.success("File uploaded successfully");
      }
      return updatedProject;
    } catch (error) {
      return handleApiError(error, "Error uploading file");
    }
  },

  deleteFile: async (
    projectId: string,
    fileId: string
  ): Promise<ApiResponse<Project>> => {
    try {
      await apiClient.delete(`/worksubmission/projects/${projectId}/files/${fileId}`);
      const updatedProject = await api.getProject(projectId);
      if (updatedProject.status === "success") {
        toast.success("File deleted successfully");
      }
      return updatedProject;
    } catch (error) {
      return handleApiError(error, "Error deleting file");
    }
  },

  // ============================================================================
  // AGREEMENT APIs
  // ============================================================================

  createAgreement: async (
    projectId: string,
    bidId: string
  ): Promise<ApiResponse<Agreement>> => {
    try {
      const response = await apiClient.post("/agreement/create", { projectId, bidId });
      toast.success("Agreement created successfully");
      return { status: "success", data: response.data.agreement };
    } catch (error) {
      return handleApiError(error, "Error creating agreement");
    }
  },

  getAgreements: async (status?: string): Promise<ApiResponse<{ agreements: Agreement[]; userRole: string }>> => {
    try {
      const params = status ? { status } : {};
      const response = await apiClient.get("/agreement/my/list", { params });
      return { status: "success", data: { agreements: response.data.agreements, userRole: response.data.userRole } };
    } catch (error) {
      return handleApiError(error, "Error fetching agreements");
    }
  },

  getAgreement: async (id: string): Promise<ApiResponse<{ agreement: Agreement; userRole: string }>> => {
    try {
      const response = await apiClient.get(`/agreement/${id}`);
      return { status: "success", data: { agreement: response.data.agreement, userRole: response.data.userRole } };
    } catch (error) {
      return handleApiError(error, "Error fetching agreement");
    }
  },

  getAgreementByProject: async (projectId: string): Promise<ApiResponse<Agreement>> => {
    try {
      const response = await apiClient.get(`/agreement/project/${projectId}`);
      return { status: "success", data: response.data.agreement };
    } catch (error) {
      return handleApiError(error, "Error fetching project agreement");
    }
  },

  editAgreement: async (
    id: string,
    updates: {
      deliverables?: string;
      deadline?: string;
      agreedAmount?: number;
      projectDescription?: string;
    }
  ): Promise<ApiResponse<Agreement>> => {
    try {
      const response = await apiClient.put(`/agreement/${id}/edit`, updates);
      toast.success("Agreement updated successfully");
      return { status: "success", data: response.data.agreement };
    } catch (error) {
      return handleApiError(error, "Error updating agreement");
    }
  },

  sendAgreementForSigning: async (id: string): Promise<ApiResponse<Agreement>> => {
    try {
      const response = await apiClient.post(`/agreement/${id}/send-for-signing`);
      toast.success("Agreement sent to freelancer for signing");
      return { status: "success", data: response.data.agreement };
    } catch (error) {
      return handleApiError(error, "Error sending agreement for signing");
    }
  },

  signAgreementAsClient: async (id: string): Promise<ApiResponse<Agreement>> => {
    try {
      const response = await apiClient.post(`/agreement/${id}/sign/client`);
      toast.success("Agreement signed! Project is now active.");
      return { status: "success", data: response.data.agreement };
    } catch (error) {
      return handleApiError(error, "Error signing agreement");
    }
  },

  signAgreementAsFreelancer: async (id: string): Promise<ApiResponse<Agreement>> => {
    try {
      const response = await apiClient.post(`/agreement/${id}/sign/freelancer`);
      toast.success("Agreement signed! Awaiting client signature.");
      return { status: "success", data: response.data.agreement };
    } catch (error) {
      return handleApiError(error, "Error signing agreement");
    }
  },

  cancelAgreement: async (id: string, reason: string): Promise<ApiResponse<void>> => {
    try {
      await apiClient.post(`/agreement/${id}/cancel`, { reason });
      toast.success("Agreement cancelled");
      return { status: "success" };
    } catch (error) {
      return handleApiError(error, "Error cancelling agreement");
    }
  },

  amendAgreement: async (
    id: string,
    newAmount: number,
    reason: string
  ): Promise<ApiResponse<Agreement>> => {
    try {
      const response = await apiClient.post(`/agreement/${id}/amend`, { newAmount, reason });
      toast.success("Amendment created. Both parties must re-sign.");
      return { status: "success", data: response.data.newAgreement };
    } catch (error) {
      return handleApiError(error, "Error creating amendment");
    }
  },

  verifyAgreement: async (id: string): Promise<ApiResponse<any>> => {
    try {
      const response = await apiClient.get(`/agreement/${id}/verify`);
      return { status: "success", data: response.data };
    } catch (error) {
      return handleApiError(error, "Error verifying agreement");
    }
  },

  // ============================================================================
  // PAYMENT APIs
  // ============================================================================

  createPaymentOrder: async (
    amount: number,
    projectId: string
  ): Promise<ApiResponse<PaymentOrder>> => {
    try {
      const idempotencyKey = generateIdempotencyKey();
      const response = await apiClient.post(
        "/payments/create-order",
        { amount, currency: "INR", project_id: projectId },
        { headers: { "X-Idempotency-Key": idempotencyKey } }
      );
      return { status: "success", data: response.data };
    } catch (error) {
      return handleApiError(error, "Error creating payment order");
    }
  },

  verifyPayment: async (
    razorpay_order_id: string,
    razorpay_payment_id: string,
    razorpay_signature: string,
    project_id: string
  ): Promise<ApiResponse<Escrow>> => {
    try {
      const response = await apiClient.post("/payments/verify-payment", {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        project_id,
      });
      toast.success("Payment verified successfully");
      return { status: "success", data: response.data };
    } catch (error) {
      return handleApiError(error, "Error verifying payment");
    }
  },

  releasePayment: async (
    projectId: string,
    freelancerId: string
  ): Promise<ApiResponse<void>> => {
    try {
      await apiClient.post("/payments/release-payment", {
        project_id: projectId,
        freelancer_id: freelancerId,
      });
      toast.success("Payment released to freelancer");
      return { status: "success" };
    } catch (error) {
      return handleApiError(error, "Error releasing payment");
    }
  },

  assignFreelancer: async (
    projectId: string,
    freelancerId: string
  ): Promise<ApiResponse<void>> => {
    try {
      await apiClient.post("/payments/assign-freelancer", {
        project_id: projectId,
        freelancer_id: freelancerId,
      });
      toast.success("Freelancer assigned successfully");
      return { status: "success" };
    } catch (error) {
      return handleApiError(error, "Error assigning freelancer");
    }
  },

  cancelProject: async (projectId: string): Promise<ApiResponse<any>> => {
    try {
      const response = await apiClient.delete(`/payments/delete-project/${projectId}`);
      toast.success("Project cancelled and refund processed");
      return { status: "success", data: response.data };
    } catch (error) {
      return handleApiError(error, "Error cancelling project");
    }
  },

  // ============================================================================
  // MILESTONE APIs
  // ============================================================================

  createMilestones: async (
    agreementId: string,
    milestones: MilestoneInput[]
  ): Promise<ApiResponse<Milestone[]>> => {
    try {
      const response = await apiClient.post("/milestone/create", { agreementId, milestones });
      toast.success(`${response.data.milestones.length} milestones created`);
      return { status: "success", data: response.data.milestones };
    } catch (error) {
      return handleApiError(error, "Error creating milestones");
    }
  },

  getMilestones: async (
    projectId: string
  ): Promise<ApiResponse<{ milestones: Milestone[]; summary: MilestoneSummary }>> => {
    try {
      const response = await apiClient.get(`/milestone/project/${projectId}`);
      return { status: "success", data: response.data };
    } catch (error) {
      return handleApiError(error, "Error fetching milestones");
    }
  },

  getMilestone: async (id: string): Promise<ApiResponse<Milestone>> => {
    try {
      const response = await apiClient.get(`/milestone/${id}`);
      return { status: "success", data: response.data.milestone };
    } catch (error) {
      return handleApiError(error, "Error fetching milestone");
    }
  },

  submitMilestone: async (
    id: string,
    deliverables: MilestoneDeliverable[]
  ): Promise<ApiResponse<Milestone>> => {
    try {
      const response = await apiClient.post(`/milestone/${id}/submit`, { deliverables });
      toast.success("Milestone submitted for review");
      return { status: "success", data: response.data.milestone };
    } catch (error) {
      return handleApiError(error, "Error submitting milestone");
    }
  },

  confirmMilestone: async (id: string): Promise<ApiResponse<Milestone>> => {
    try {
      const response = await apiClient.post(`/milestone/${id}/confirm`);
      toast.success("Milestone confirmed and payment released");
      return { status: "success", data: response.data.milestone };
    } catch (error) {
      return handleApiError(error, "Error confirming milestone");
    }
  },

  requestMilestoneRevision: async (
    id: string,
    note: string
  ): Promise<ApiResponse<Milestone>> => {
    try {
      const response = await apiClient.post(`/milestone/${id}/revision`, { note });
      toast.success("Revision requested");
      return { status: "success", data: response.data.milestone };
    } catch (error) {
      return handleApiError(error, "Error requesting revision");
    }
  },

  disputeMilestone: async (
    id: string,
    reason: string
  ): Promise<ApiResponse<Milestone>> => {
    try {
      const response = await apiClient.post(`/milestone/${id}/dispute`, { reason });
      toast.success("Dispute filed. Admin will review within 48 hours.");
      return { status: "success", data: response.data.milestone };
    } catch (error) {
      return handleApiError(error, "Error filing dispute");
    }
  },

  // ============================================================================
  // DISPUTE APIs
  // ============================================================================

  fileDispute: async (
    projectId: string,
    category: string,
    reason: string,
    amountInDispute: number,
    evidence?: DisputeEvidence[]
  ): Promise<ApiResponse<{ dispute: Dispute; paymentLink: string }>> => {
    try {
      const response = await apiClient.post("/dispute/file", {
        projectId,
        category,
        reason,
        amountInDispute,
        evidence,
      });
      return { status: "success", data: response.data };
    } catch (error) {
      return handleApiError(error, "Error filing dispute");
    }
  },

  confirmDisputePayment: async (
    id: string,
    paymentId: string
  ): Promise<ApiResponse<Dispute>> => {
    try {
      const response = await apiClient.post(`/dispute/${id}/confirm-payment`, {
        payment_id: paymentId,
      });
      toast.success("Dispute payment confirmed");
      return { status: "success", data: response.data.dispute };
    } catch (error) {
      return handleApiError(error, "Error confirming dispute payment");
    }
  },

  addDisputeEvidence: async (
    id: string,
    evidence: Omit<DisputeEvidence, "uploadedBy" | "uploadedAt">
  ): Promise<ApiResponse<void>> => {
    try {
      await apiClient.post(`/dispute/${id}/evidence`, evidence);
      toast.success("Evidence added successfully");
      return { status: "success" };
    } catch (error) {
      return handleApiError(error, "Error adding evidence");
    }
  },

  respondToDispute: async (
    id: string,
    response: string,
    evidence?: DisputeEvidence[]
  ): Promise<ApiResponse<Dispute>> => {
    try {
      const res = await apiClient.post(`/dispute/${id}/respond`, { response, evidence });
      toast.success("Response submitted");
      return { status: "success", data: res.data.dispute };
    } catch (error) {
      return handleApiError(error, "Error submitting response");
    }
  },

  withdrawDispute: async (id: string): Promise<ApiResponse<void>> => {
    try {
      await apiClient.post(`/dispute/${id}/withdraw`);
      toast.success("Dispute withdrawn");
      return { status: "success" };
    } catch (error) {
      return handleApiError(error, "Error withdrawing dispute");
    }
  },

  getMyDisputes: async (): Promise<ApiResponse<Dispute[]>> => {
    try {
      const response = await apiClient.get("/dispute/my/list");
      return { status: "success", data: response.data.disputes };
    } catch (error) {
      return handleApiError(error, "Error fetching disputes");
    }
  },

  // ============================================================================
  // REVIEW APIs
  // ============================================================================

  createReview: async (
    agreementId: string,
    ratings: ReviewRatings
  ): Promise<ApiResponse<Review>> => {
    try {
      const response = await apiClient.post("/review/create", {
        agreementId,
        ...ratings,
      });
      toast.success("Review submitted successfully");
      return { status: "success", data: response.data.review };
    } catch (error) {
      return handleApiError(error, "Error creating review");
    }
  },

  getReviews: async (
    userId: string,
    type?: "client_to_freelancer" | "freelancer_to_client"
  ): Promise<ApiResponse<Review[]>> => {
    try {
      const params = type ? { type } : {};
      const response = await apiClient.get(`/review/user/${userId}`, { params });
      return { status: "success", data: response.data.reviews };
    } catch (error) {
      return handleApiError(error, "Error fetching reviews");
    }
  },

  getReputation: async (userId: string): Promise<ApiResponse<Reputation>> => {
    try {
      const response = await apiClient.get(`/review/reputation/${userId}`);
      return { status: "success", data: response.data };
    } catch (error) {
      return handleApiError(error, "Error fetching reputation");
    }
  },

  getPendingReviews: async (): Promise<ApiResponse<Agreement[]>> => {
    try {
      const response = await apiClient.get("/review/pending");
      return { status: "success", data: response.data.pendingReviews };
    } catch (error) {
      return handleApiError(error, "Error fetching pending reviews");
    }
  },

  respondToReview: async (
    reviewId: string,
    comment: string
  ): Promise<ApiResponse<Review>> => {
    try {
      const response = await apiClient.post(`/review/${reviewId}/respond`, { comment });
      toast.success("Response submitted");
      return { status: "success", data: response.data.review };
    } catch (error) {
      return handleApiError(error, "Error responding to review");
    }
  },

  // ============================================================================
  // FINANCE APIs
  // ============================================================================

  getFinanceDashboard: async (): Promise<ApiResponse<FinanceDashboard>> => {
    try {
      const response = await apiClient.get("/finance/dashboard");
      return { status: "success", data: response.data };
    } catch (error) {
      return handleApiError(error, "Error fetching finance dashboard");
    }
  },

  getTaxSummary: async (year: number): Promise<ApiResponse<TaxSummary>> => {
    try {
      const response = await apiClient.get(`/finance/tax-summary/${year}`);
      return { status: "success", data: response.data };
    } catch (error) {
      return handleApiError(error, "Error fetching tax summary");
    }
  },

  generateInvoice: async (paymentId: string): Promise<ApiResponse<any>> => {
    try {
      const response = await apiClient.post("/finance/invoice/generate", { paymentId });
      return { status: "success", data: response.data };
    } catch (error) {
      return handleApiError(error, "Error generating invoice");
    }
  },

  requestWithdrawal: async (
    amount: number,
    bankDetails: BankDetails
  ): Promise<ApiResponse<Withdrawal>> => {
    try {
      const response = await apiClient.post("/finance/withdraw/request", {
        amount,
        bankDetails,
      });
      toast.success("Withdrawal request submitted");
      return { status: "success", data: response.data.withdrawal };
    } catch (error) {
      return handleApiError(error, "Error requesting withdrawal");
    }
  },

  getWithdrawalHistory: async (): Promise<ApiResponse<Withdrawal[]>> => {
    try {
      const response = await apiClient.get("/finance/withdraw/history");
      return { status: "success", data: response.data.withdrawals };
    } catch (error) {
      return handleApiError(error, "Error fetching withdrawal history");
    }
  },

  // ============================================================================
  // SKILL VERIFICATION APIs
  // ============================================================================

  verifyGitHub: async (
    githubUsername: string
  ): Promise<ApiResponse<{ githubProfile: GitHubProfile; verifiedSkills: SkillVerification[] }>> => {
    try {
      const response = await apiClient.post("/skills/verify/github", { githubUsername });
      toast.success(`Verified ${response.data.verifiedSkills.length} skills from GitHub`);
      return { status: "success", data: response.data };
    } catch (error) {
      return handleApiError(error, "Error verifying GitHub");
    }
  },

  submitPortfolio: async (
    skillName: string,
    portfolioUrl: string,
    details: PortfolioDetails
  ): Promise<ApiResponse<SkillVerification>> => {
    try {
      const response = await apiClient.post("/skills/verify/portfolio", {
        skillName,
        portfolioUrl,
        ...details,
      });
      toast.success("Portfolio submitted for verification");
      return { status: "success", data: response.data.verification };
    } catch (error) {
      return handleApiError(error, "Error submitting portfolio");
    }
  },

  submitChallengeResult: async (
    skillName: string,
    challengeId: string,
    challengeTitle: string,
    difficulty: string,
    score: number,
    timeTaken: number
  ): Promise<ApiResponse<SkillVerification>> => {
    try {
      const response = await apiClient.post("/skills/verify/challenge", {
        skillName,
        challengeId,
        challengeTitle,
        difficulty,
        score,
        timeTaken,
      });
      return { status: "success", data: response.data.verification };
    } catch (error) {
      return handleApiError(error, "Error submitting challenge result");
    }
  },

  getMySkills: async (): Promise<ApiResponse<SkillVerification[]>> => {
    try {
      const response = await apiClient.get("/skills/my");
      return { status: "success", data: response.data.skills };
    } catch (error) {
      return handleApiError(error, "Error fetching skills");
    }
  },

  getPublicSkills: async (userId: string): Promise<ApiResponse<SkillVerification[]>> => {
    try {
      const response = await apiClient.get(`/skills/user/${userId}/public`);
      return { status: "success", data: response.data.skills };
    } catch (error) {
      return handleApiError(error, "Error fetching skills");
    }
  },
};
