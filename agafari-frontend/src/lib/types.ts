export type OrganizationTheme = {
  primary: string;
  accent: string;
};

export type OrganizationFeatures = {
  public_chat: boolean;
  complaints: boolean;
  employee_assistant: boolean;
  insights: boolean;
};

export type Organization = {
  id: string;
  slug: string;
  name: string;
  short_code: string;
  sector: string;
  logo_url: string | null;
  description: string | null;
  theme: OrganizationTheme;
  terminology: {
    service_singular: string;
    service_plural: string;
  };
  features: OrganizationFeatures;
  contact: {
    email?: string | null;
    phone?: string | null;
    website?: string | null;
  };
};

export type Service = {
  id: string;
  title: string;
  slug: string;
  category: string;
  organization_code: string;
  summary: string;
  processing_time: string;
  verification_status: string;
  last_verified_at: string;
};

export type Citation = {
  source_id: string | null;
  title: string;
  url: string | null;
  section: string | null;
};

export type AnswerStatus =
  | "ANSWERED"
  | "LOW_CONFIDENCE"
  | "UNANSWERED"
  | "ERROR";

export type ChatResponse = {
  conversation_id: string;
  message_id: string;
  reply: string;
  answer_status: AnswerStatus;
  citations: Citation[];
};

export type ChatTurn = {
  id: string;
  role: "user" | "assistant";
  content: string;
  status?: AnswerStatus;
  citations?: Citation[];
  messageId?: string;
};

export type ComplaintPayload = {
  organization_id: string;
  service_id?: string | null;
  category: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  description: string;
  contact?: {
    email?: string | null;
    phone?: string | null;
  } | null;
  consent_to_contact: boolean;
};

export type ComplaintResponse = {
  id: string;
  status: string;
  created_at: string;
};
