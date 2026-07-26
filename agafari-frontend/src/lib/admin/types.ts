export type ServiceRequirement = {
  id: string;
  title: string;
  description: string | null;
  is_mandatory: boolean;
  order_index: number;
};

export type AdminService = {
  id: string;
  title: string;
  slug: string;
  category: string;
  summary: string;
  processing_time: string;
  fee_etb: number;
  is_published: boolean;
  verification_status: string;
  last_verified_at: string | null;
  procedure_steps: string[] | null;
  requirements: ServiceRequirement[];
  document_count: number;
};

export type RequirementInput = {
  title: string;
  description?: string | null;
  is_mandatory?: boolean;
};

export type ServiceInput = {
  title: string;
  category: string;
  summary: string;
  processing_time: string;
  fee_etb?: number;
  is_published?: boolean;
  procedure_steps?: string[] | null;
  requirements?: RequirementInput[];
};

export type ChangeLogStatus = "PENDING" | "APPROVED" | "REJECTED" | "PUBLISHED";

export type ChangeLogRecord = {
  id: string;
  service_id: string | null;
  service_title: string | null;
  source_title: string;
  title: string;
  ai_change_summary: string;
  public_notice: string | null;
  status: ChangeLogStatus;
  origin: "AI_DETECTED" | "MANUAL";
  detected_at: string;
  published_at: string | null;
  effective_date: string | null;
  old_data_snapshot?: Record<string, unknown>;
  new_data_snapshot?: Record<string, unknown>;
};

export type AnnouncementInput = {
  title: string;
  public_notice: string;
  service_id?: string | null;
  effective_date?: string | null;
  publish?: boolean;
};

export type OrganizationSettingsInput = {
  name?: string;
  description?: string | null;
  logo_url?: string | null;
  primary_color?: string;
  accent_color?: string;
  terminology?: { service_singular: string; service_plural: string };
  features?: {
    public_chat: boolean;
    complaints: boolean;
    employee_assistant: boolean;
    insights: boolean;
  };
  contact?: { email?: string; phone?: string; website?: string };
};

export type ServiceSummaryResult = {
  summary: string;
  procedure_steps: string[];
  generated_by: "llm" | "extractive";
};
