export interface Project {
  _id: string;
  title: string;
  description: string;
  clientId: string;
  clientName: string;
  freelancerId: string;
  status: string;
  tasks: Task[];
  files: FileDetails[];
  messages: Message[];
  dueDate?: string;
  budget?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ConnectionRequest {
  sender: string;
  receiver: string;
  senderName?: string;
}

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

/**
 * Get file icon based on file type
 */
export const getFileTypeIcon = (fileName: string): string => {
  const extension = fileName.split(".").pop()?.toLowerCase() || "";

  // Document types
  if (["pdf", "doc", "docx", "txt", "rtf"].includes(extension)) {
    return "file-text";
  }

  // Image types
  if (["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(extension)) {
    return "image";
  }

  // Video types
  if (["mp4", "mov", "avi", "webm", "mkv"].includes(extension)) {
    return "video";
  }

  // Audio types
  if (["mp3", "wav", "ogg", "flac", "m4a"].includes(extension)) {
    return "audio";
  }

  // Archive types
  if (["zip", "rar", "7z", "tar", "gz"].includes(extension)) {
    return "archive";
  }

  // Code types
  if (
    [
      "js",
      "ts",
      "jsx",
      "tsx",
      "html",
      "css",
      "json",
      "py",
      "rb",
      "php",
      "java",
      "c",
      "cpp",
    ].includes(extension)
  ) {
    return "code";
  }

  // Default
  return "file";
};

/**
 * Generate a unique user ID
 */
export const generateUserId = (): string => {
  return Math.random().toString(36).substring(2, 10);
};

export interface FileTransferState {
  file: File | null;
  progress: number;
  isTransferring: boolean;
  receivedFile: {
    name: string;
    url: string;
    size: number;
  } | null;
  isWaitingForAcceptance?: boolean;
  connectionRequests?: Array<{ sender: string; receiver: string }>;
  isRtcConnected: boolean;
}

export interface WebSocketMessage {
  type: string;
  sender: string;
  receiver: string;
  offer?: RTCSessionDescriptionInit;
  answer?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
  senderName?: string;
}

export type ProjectStatus = "in-progress" | "on-hold" | "completed";

export interface Task {
  _id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

export interface FileDetails {
  _id: string;
  name: string;
  size: number;
  url: string;
  uploadedAt: string;
}

export interface Message {
  _id: string;
  message: string;
  sender: string;
  senderName: string;
  timestamp: string;
  encrypted?: boolean;
  receiver?: string;
}

export interface ApiResponse<T> {
  status: "success" | "error";
  data?: T;
  message?: string;
}

export interface TaskFormData {
  title: string;
}

export interface MessageFormData {
  content: string;
}

export interface FileUploadResponse {
  message: string;
  fileUrl: string;
}

// ============================================================================
// AGREEMENT TYPES
// ============================================================================

export interface AgreementSignature {
  signed: boolean;
  signedAt?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface Agreement {
  _id: string;
  agreementNumber: string;
  projectId: string | Project;
  bidId: string;
  clientId: string | User;
  freelancerId: string | User;
  projectTitle: string;
  projectDescription: string;
  agreedAmount: number;
  platformFee: number;
  totalAmount: number;
  deadline: string;
  deliverables: string;
  terms: string;
  status: 'draft' | 'pending_freelancer' | 'pending_client' | 'active' | 'completed' | 'cancelled' | 'disputed' | 'amended';
  clientSignature: AgreementSignature;
  freelancerSignature: AgreementSignature;
  version: number;
  previousVersion?: string;
  amendmentReason?: string;
  contentHash: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// USER TYPES
// ============================================================================

export interface User {
  _id: string;
  username: string;
  email: string;
  role: 'client' | 'freelancer' | 'admin';
  companyName?: string;
  bio?: string;
  skills?: string[];
  profilePicture?: string;
  isBanned?: boolean;
  status?: 'active' | 'suspended';
}

// ============================================================================
// PAYMENT TYPES
// ============================================================================

export interface PaymentOrder {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt?: string;
  status: string;
  notes: {
    project_id: string;
    client_id: string;
  };
}

export interface Escrow {
  _id: string;
  projectId: string;
  clientId: string;
  freelancerId?: string;
  amount: number;
  status: 'funded' | 'released' | 'refunded' | 'disputed';
  createdAt: string;
}

export interface Transaction {
  _id: string;
  escrowId: string;
  type: 'deposit' | 'release' | 'refund' | 'withdrawal';
  amount: number;
  status: 'pending' | 'on_hold' | 'completed' | 'failed';
  description: string;
  createdAt: string;
}

// ============================================================================
// MILESTONE TYPES
// ============================================================================

export interface MilestoneDeliverable {
  name: string;
  url: string;
  type?: string;
  uploadedAt: string;
}

export interface MilestoneRevision {
  note: string;
  requestedBy: string;
  requestedAt: string;
}

export interface Milestone {
  _id: string;
  agreementId: string;
  projectId: string;
  clientId: string | User;
  freelancerId: string | User;
  milestoneNumber: number;
  title: string;
  description: string;
  amount: number;
  dueDate: string;
  slaDeadline: string;
  status: 'pending' | 'in_progress' | 'submitted' | 'confirmed' | 'revision_requested' | 'released' | 'disputed';
  startedAt?: string;
  submittedAt?: string;
  confirmedAt?: string;
  releasedAt?: string;
  deliverables: MilestoneDeliverable[];
  revisionCount: number;
  maxRevisions: number;
  revisionHistory: MilestoneRevision[];
  bonusPercent: number;
  penaltyPercent: number;
  daysEarly: number;
  daysLate: number;
  bonusAmount: number;
  penaltyAmount: number;
  finalAmount: number;
  autoReleaseScheduledAt?: string;
  createdAt: string;
}

export interface MilestoneInput {
  title: string;
  description: string;
  amount: number;
  dueDate: string;
  slaDeadline?: string;
  penaltyPercent?: number;
  bonusPercent?: number;
}

export interface MilestoneSummary {
  totalMilestones: number;
  completedMilestones: number;
  totalAmount: number;
  releasedAmount: number;
  pendingAmount: number;
}

// ============================================================================
// DISPUTE TYPES
// ============================================================================

export interface DisputeEvidence {
  type: 'screenshot' | 'document' | 'communication' | 'contract' | 'other';
  title: string;
  description?: string;
  url: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface Dispute {
  _id: string;
  disputeNumber: string;
  projectId: string;
  milestoneId?: string;
  clientId: string | User;
  freelancerId: string | User;
  filerId: string;
  filerRole: 'client' | 'freelancer';
  category: 'quality' | 'payment' | 'deadline' | 'communication' | 'scope' | 'other';
  reason: string;
  amountInDispute: number;
  evidence: DisputeEvidence[];
  status: 'pending_payment' | 'pending_response' | 'under_review' | 'resolved' | 'withdrawn';
  arbitrationFee: number;
  arbitrationFeePaid: boolean;
  responseDeadline?: string;
  adminDecision?: {
    decision: 'favor_client' | 'favor_freelancer' | 'split';
    splitAmount?: number;
    adminNotes: string;
    decidedAt: string;
  };
  createdAt: string;
}

// ============================================================================
// REVIEW TYPES
// ============================================================================

export interface ReviewRatings {
  qualityRating: number;
  communicationRating: number;
  timelinessRating: number;
  professionalismRating: number;
  overallRating: number;
  comment?: string;
}

export interface Review {
  _id: string;
  agreementId: string;
  projectId: string;
  reviewerId: string | User;
  revieweeId: string | User;
  type: 'client_to_freelancer' | 'freelancer_to_client';
  qualityRating: number;
  communicationRating: number;
  timelinessRating: number;
  professionalismRating: number;
  overallRating: number;
  weightedRating: number;
  comment: string;
  response?: {
    comment: string;
    respondedAt: string;
  };
  contextBadges: {
    wasEarlyDelivery: boolean;
    wasDisputed: boolean;
    hadPenalty: boolean;
  };
  createdAt: string;
}

export interface Reputation {
  userId: string;
  contractReliabilityScore: number;
  totalReviews: number;
  averageRating: number;
  completedContracts: number;
  disputeRate: number;
  earlyDeliveryRate: number;
  repeatClientRate: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
}

// ============================================================================
// FINANCE TYPES
// ============================================================================

export interface FinanceDashboard {
  totalEarnings: number;
  pendingPayments: number;
  availableBalance: number;
  completedProjects: number;
  activeProjects: number;
  avgPerProject: number;
  topClients: { name: string; totalPaid: number }[];
  monthlyBreakdown: { month: string; amount: number }[];
  recentPayments: { amount: number; projectTitle: string; date: string }[];
}

export interface TaxSummary {
  taxYear: number;
  freelancer: { name: string; email: string };
  earnings: {
    gross: number;
    estimatedPlatformFee: number;
    net: number;
  };
  quarterlyBreakdown: { quarter: string; earnings: number; projectCount: number }[];
  clientBreakdown: { name: string; email: string; totalPaid: number; projectCount: number }[];
  totalProjects: number;
  paymentCount: number;
  disclaimer: string;
}

export interface BankDetails {
  accountNumber: string;
  ifscCode: string;
  accountHolderName: string;
  bankName?: string;
}

export interface Withdrawal {
  _id: string;
  freelancerId: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  bankDetails: BankDetails;
  description?: string;
  createdAt: string;
}

// ============================================================================
// SKILL VERIFICATION TYPES
// ============================================================================

export interface SkillVerification {
  _id: string;
  userId: string;
  skillName: string;
  status: 'pending' | 'verified' | 'expired' | 'rejected';
  verificationMethod: 'github' | 'challenge' | 'manual_review' | 'portfolio';
  verificationScore: number;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  evidence?: {
    type: string;
    url: string;
    projectName?: string;
    description?: string;
  };
  verifiedAt?: string;
  expiresAt?: string;
  lastUpdatedAt: string;
}

export interface GitHubProfile {
  username: string;
  repos: number;
  followers: number;
  topLanguages: string[];
}

export interface PortfolioDetails {
  projectName: string;
  description: string;
  screenshotUrl?: string;
}

// ============================================================================
// BID TYPES
// ============================================================================

export interface Bid {
  _id: string;
  projectId: string;
  freelancerId: string | User;
  amount: number;
  proposal: string;
  deliveryDays: number;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}
