import type { AnswerStatus, Citation } from "@/lib/types";

export type AccessSession = {
  access_token: string;
  expires_at: string;
  organization_id: string;
};

export type DocumentVisibility = "PUBLIC" | "INTERNAL";

export type DocumentApproval = "PENDING" | "APPROVED" | "REJECTED";

export type DocumentProcessing =
  | "PENDING"
  | "PENDING_APPROVAL"
  | "INDEXING"
  | "READY"
  | "FAILED"
  | "REJECTED";

export type KnowledgeDocument = {
  id: string;
  title: string;
  source_type: string;
  source_url: string | null;
  visibility: DocumentVisibility;
  approval_status: DocumentApproval;
  processing_status: DocumentProcessing;
  department: string | null;
  version: number;
  created_at: string;
  updated_at: string;
};

export type DocumentUpload = {
  title: string;
  visibility: DocumentVisibility;
  serviceId?: string;
  department?: string;
  file: File;
};

export type DocumentTextSubmission = {
  title: string;
  visibility: DocumentVisibility;
  raw_text_content: string;
  service_id?: string | null;
  department?: string | null;
  source_url?: string | null;
  source_type?: string;
};

export type DashboardRange = "7d" | "30d" | "90d";

export type DashboardSummary = {
  range: DashboardRange;
  interactions: {
    total: number;
    answered: number;
    answer_rate: number;
    by_scope: Partial<Record<"public" | "internal", number>>;
  };
  open_complaints: {
    total: number;
    by_severity: Record<string, number>;
  };
  documents: Record<string, number>;
  top_issue_clusters: {
    id: string;
    title: string;
    source_kind: string;
    category: string;
    item_count: number;
    last_seen_at: string;
  }[];
  emerging_insights: {
    id: string;
    title: string;
    summary: string;
    confidence: number;
    status: WorkItemStatus;
  }[];
};

export type WorkItemStatus =
  | "NEW"
  | "REVIEWING"
  | "ACTIONED"
  | "RESOLVED"
  | "DISMISSED";

export type Insight = {
  id: string;
  cluster_id: string | null;
  title: string;
  summary: string;
  recommendation: string;
  confidence: number;
  status: WorkItemStatus;
  owner: string | null;
  resolution_note: string | null;
  created_at: string;
  updated_at: string;
};

export type ComplaintRecord = {
  id: string;
  service_id: string | null;
  category: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  description: string;
  contact: { email?: string | null; phone?: string | null } | null;
  consent_to_contact: boolean;
  status: WorkItemStatus;
  resolution_note: string | null;
  created_at: string;
  updated_at: string;
};

export type ConversationMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  answer_status: AnswerStatus | null;
  citations: Citation[];
  feedback: "HELPFUL" | "NOT_HELPFUL" | null;
  created_at: string;
};

export type ConversationRecord = {
  id: string;
  scope: "PUBLIC" | "INTERNAL";
  service_id: string | null;
  department: string | null;
  updated_at: string;
  messages: ConversationMessage[];
};