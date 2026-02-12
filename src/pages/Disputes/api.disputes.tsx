import { toast } from "sonner";
import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}`;

export interface Project {
  _id: string;
  title: string;
  budget?: number;
  status: string;
  clientId?: { _id: string; username: string };
  freelancerId?: { _id: string; username: string };
}

export interface Evidence {
  _id?: string;
  type: string;
  title: string;
  description?: string;
  url: string;
}

export interface ChatMessage {
  message: string;
  sender: string;
  senderRole: string;
  timestamp: string;
}

export interface DisputeItem {
  _id: string;
  disputeNumber: string;
  projectId: { _id: string; title: string; budget?: number };
  clientId: { _id: string; username: string; email?: string };
  freelancerId: { _id: string; username: string; email?: string };
  filedBy: { _id: string; username: string } | string;
  filedAgainst: { _id: string; username: string } | string;
  filerRole: string;
  category: string;
  reason: string;
  amountInDispute: number;
  status: string;
  priority: string;
  arbitrationFee: number;
  arbitrationFeePaid: boolean;
  arbitrationPaymentLink?: string;
  evidence: Evidence[];
  chatLogs: ChatMessage[];
  respondentResponse?: { response: string; submittedAt: string; evidence: Evidence[] };
  resolution?: {
    decision: string;
    awardedAmount: number;
    refundAmount: number;
    reasoning: string;
    resolvedAt: string;
  };
  responseDeadline?: string;
  resolutionDeadline?: string;
  createdAt: string;
}

const api = {
  /** Get signed-in user's disputes */
  getMyDisputes: async (status?: string): Promise<DisputeItem[]> => {
    try {
      const params: any = {};
      if (status) params.status = status;
      const { data } = await axios.get(`${API_URL}/dispute/my`, {
        params,
        withCredentials: true,
      });
      return data.disputes || [];
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load disputes");
      return [];
    }
  },

  /** Get single dispute detail */
  getDispute: async (id: string): Promise<DisputeItem | null> => {
    try {
      const { data } = await axios.get(`${API_URL}/dispute/${id}`, { withCredentials: true });
      return data.dispute;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load dispute");
      return null;
    }
  },

  /** File a new dispute */
  fileDispute: async (payload: {
    projectId: string;
    category: string;
    reason: string;
    amountInDispute: number;
    milestoneId?: string;
    evidence?: Evidence[];
  }): Promise<{ disputeId?: string; paymentLink?: string; success: boolean }> => {
    try {
      const { data } = await axios.post(`${API_URL}/dispute/file`, payload, { withCredentials: true });
      return { disputeId: data.dispute?._id, paymentLink: data.paymentLink, success: true };
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to file dispute");
      return { success: false };
    }
  },

  /** Confirm arbitration fee payment */
  confirmPayment: async (id: string, paymentId: string) => {
    try {
      await axios.post(`${API_URL}/dispute/${id}/confirm-payment`, { payment_id: paymentId }, { withCredentials: true });
      toast.success("Payment confirmed — dispute is now active");
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Payment confirmation failed");
      return false;
    }
  },

  /** Submit respondent response */
  submitResponse: async (id: string, response: string, evidence?: Evidence[]) => {
    try {
      await axios.post(`${API_URL}/dispute/${id}/respond`, { response, evidence: evidence || [] }, { withCredentials: true });
      toast.success("Response submitted");
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to submit response");
      return false;
    }
  },

  /** Withdraw dispute */
  withdraw: async (id: string) => {
    try {
      await axios.post(`${API_URL}/dispute/${id}/withdraw`, {}, { withCredentials: true });
      toast.success("Dispute withdrawn");
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to withdraw");
      return false;
    }
  },

  /** Add evidence */
  addEvidence: async (id: string, evidence: { type: string; title: string; description?: string; url: string }) => {
    try {
      await axios.post(`${API_URL}/dispute/${id}/evidence`, evidence, { withCredentials: true });
      toast.success("Evidence added");
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add evidence");
      return false;
    }
  },

  /** Send chat message */
  sendMessage: async (id: string, message: string): Promise<ChatMessage[] | null> => {
    try {
      const { data } = await axios.post(`${API_URL}/dispute/${id}/message`, { message }, { withCredentials: true });
      return data.chatLogs;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send message");
      return null;
    }
  },

  /** Fetch user's projects for dispute filing (client or freelancer) */
  getMyProjects: async (role: "client" | "freelancer"): Promise<Project[]> => {
    try {
      const url = role === "client" ? `${API_URL}/client/clients/projects` : `${API_URL}/freelancer/projects/approved/work`;
      const { data } = await axios.get(url, { withCredentials: true });
      return data.projects || data || [];
    } catch {
      return [];
    }
  },
};

export default api;
