import { API_BASE_URL, ApiError } from "@/lib/api";
import { UNAUTHORIZED_EVENT } from "@/lib/clarity/session";
import type { ChatResponse, Organization } from "@/lib/types";
import type {
  AdminService,
  AnnouncementInput,
  ChangeLogRecord,
  ChangeLogStatus,
  OrganizationSettingsInput,
  ServiceInput,
  ServiceSummaryResult,
} from "@/lib/admin/types";
import type {
  AccessSession,
  ComplaintRecord,
  ConversationRecord,
  DashboardRange,
  DashboardSummary,
  DocumentTextSubmission,
  DocumentUpload,
  Insight,
  KnowledgeDocument,
  WorkItemStatus,
} from "@/lib/clarity/types";

export type RequestOptions = {
  method?: string;
  body?: BodyInit | null;
  json?: unknown;
  token?: string;
  timeoutMs?: number;
  parse?: "json" | "void";
};

export async function clarityRequest<T>(
  path: string,
  { method = "GET", body, json, token, timeoutMs = 30_000, parse = "json" }: RequestOptions = {},
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (json !== undefined) headers["Content-Type"] = "application/json";

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: json !== undefined ? JSON.stringify(json) : body,
      signal: controller.signal,
      cache: "no-store",
    });

    if (response.status === 401 && typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT));
    }

    if (!response.ok) {
      let message = "Something went wrong. Please try again.";
      try {
        const data = (await response.json()) as { detail?: string | { msg?: string }[] };
        if (typeof data.detail === "string") message = data.detail;
        else if (Array.isArray(data.detail) && data.detail[0]?.msg)
          message = data.detail[0].msg as string;
      } catch {
        // Keep the safe default error.
      }
      throw new ApiError(message, response.status);
    }

    if (parse === "void") return undefined as T;
    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError("The request timed out. Please try again.", 408);
    }
    throw new ApiError("The workspace API is unreachable.", 503);
  } finally {
    clearTimeout(timeout);
  }
}

/* ---------------------------------------------------------------- access -- */

export function createAccessSession(
  organizationSlug: string,
  accessCode: string,
): Promise<AccessSession> {
  return clarityRequest<AccessSession>("/api/v1/access/session", {
    method: "POST",
    json: { organization_slug: organizationSlug, access_code: accessCode },
  });
}

export function endAccessSession(token: string): Promise<void> {
  return clarityRequest<void>("/api/v1/access/session", {
    method: "DELETE",
    token,
    parse: "void",
  });
}

/* -------------------------------------------------------- internal chat -- */

export function askInternalAssistant(
  token: string,
  payload: {
    message: string;
    conversationId?: string | null;
    serviceId?: string | null;
    department?: string | null;
  },
): Promise<ChatResponse> {
  return clarityRequest<ChatResponse>("/api/v1/internal/chat", {
    method: "POST",
    token,
    timeoutMs: 90_000,
    json: {
      message: payload.message,
      conversation_id: payload.conversationId ?? null,
      service_id: payload.serviceId ?? null,
      department: payload.department ?? null,
    },
  });
}

/* ------------------------------------------------------------ documents -- */

export function listDocuments(token: string): Promise<KnowledgeDocument[]> {
  return clarityRequest<KnowledgeDocument[]>("/api/v1/admin/documents", { token });
}

export function uploadDocument(
  token: string,
  upload: DocumentUpload,
): Promise<KnowledgeDocument> {
  const form = new FormData();
  form.set("title", upload.title);
  form.set("visibility", upload.visibility);
  form.set("file", upload.file);
  if (upload.serviceId) form.set("service_id", upload.serviceId);
  if (upload.department) form.set("department", upload.department);
  return clarityRequest<KnowledgeDocument>("/api/v1/admin/documents/upload", {
    method: "POST",
    token,
    body: form,
    timeoutMs: 60_000,
  });
}

export function submitTextDocument(
  token: string,
  payload: DocumentTextSubmission,
): Promise<KnowledgeDocument> {
  return clarityRequest<KnowledgeDocument>("/api/v1/admin/documents", {
    method: "POST",
    token,
    json: { source_type: "TEXT", ...payload },
  });
}

export function approveDocument(token: string, documentId: string) {
  return clarityRequest<{
    id: string;
    approval_status: string;
    processing_status: string;
    chunk_count: number;
  }>(`/api/v1/admin/documents/${encodeURIComponent(documentId)}/approve`, {
    method: "POST",
    token,
    timeoutMs: 120_000,
  });
}

export function rejectDocument(token: string, documentId: string) {
  return clarityRequest<{ id: string; approval_status: string }>(
    `/api/v1/admin/documents/${encodeURIComponent(documentId)}/reject`,
    { method: "POST", token },
  );
}

/* ------------------------------------------------------------- insights -- */

export function getDashboardSummary(
  token: string,
  range: DashboardRange = "30d",
): Promise<DashboardSummary> {
  return clarityRequest<DashboardSummary>(
    `/api/v1/admin/dashboard/summary?range=${range}`,
    { token },
  );
}

export function listInsights(token: string, status?: WorkItemStatus): Promise<Insight[]> {
  const query = status ? `?status=${status}` : "";
  return clarityRequest<Insight[]>(`/api/v1/admin/insights${query}`, { token });
}

export function updateInsight(
  token: string,
  insightId: string,
  payload: { status: WorkItemStatus; owner?: string | null; resolution_note?: string | null },
) {
  return clarityRequest<{ id: string; status: string; owner: string | null }>(
    `/api/v1/admin/insights/${encodeURIComponent(insightId)}`,
    { method: "PATCH", token, json: payload },
  );
}

/* ----------------------------------------------------------- complaints -- */

export function listComplaints(
  token: string,
  filters: { status?: string; severity?: string } = {},
): Promise<ComplaintRecord[]> {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.severity) params.set("severity", filters.severity);
  const query = params.toString();
  return clarityRequest<ComplaintRecord[]>(
    `/api/v1/admin/complaints${query ? `?${query}` : ""}`,
    { token },
  );
}

export function updateComplaint(
  token: string,
  complaintId: string,
  payload: { status: WorkItemStatus; resolution_note?: string | null },
) {
  return clarityRequest<{ id: string; status: string }>(
    `/api/v1/admin/complaints/${encodeURIComponent(complaintId)}`,
    { method: "PATCH", token, json: payload },
  );
}

/* -------------------------------------------------------- conversations -- */

export function listConversations(
  token: string,
  scope?: "PUBLIC" | "INTERNAL",
): Promise<ConversationRecord[]> {
  const query = scope ? `?scope=${scope}` : "";
  return clarityRequest<ConversationRecord[]>(`/api/v1/admin/conversations${query}`, {
    token,
  });
}

/* --------------------------------------------------------------- services -- */

export function listAdminServices(token: string): Promise<AdminService[]> {
  return clarityRequest<AdminService[]>("/api/v1/admin/services", { token });
}

export function createService(
  token: string,
  input: ServiceInput,
): Promise<AdminService> {
  return clarityRequest<AdminService>("/api/v1/admin/services", {
    method: "POST",
    token,
    json: input,
  });
}

export function updateService(
  token: string,
  serviceId: string,
  input: Partial<ServiceInput>,
): Promise<AdminService> {
  return clarityRequest<AdminService>(
    `/api/v1/admin/services/${encodeURIComponent(serviceId)}`,
    { method: "PATCH", token, json: input },
  );
}

export function deleteService(token: string, serviceId: string): Promise<void> {
  return clarityRequest<void>(
    `/api/v1/admin/services/${encodeURIComponent(serviceId)}`,
    { method: "DELETE", token, parse: "void" },
  );
}

export function summarizeService(
  token: string,
  serviceId: string,
): Promise<ServiceSummaryResult> {
  return clarityRequest<ServiceSummaryResult>(
    `/api/v1/admin/services/${encodeURIComponent(serviceId)}/summarize`,
    { method: "POST", token, timeoutMs: 120_000 },
  );
}

/* ------------------------------------------------------- updates & notices -- */

export function listChangeLogs(
  token: string,
  status: ChangeLogStatus | "ALL" = "ALL",
): Promise<ChangeLogRecord[]> {
  return clarityRequest<ChangeLogRecord[]>(
    `/api/v1/admin/change-logs?status=${status}`,
    { token },
  );
}

export function publishChangeLog(
  token: string,
  logId: string,
  payload: { title?: string; public_notice?: string; effective_date?: string | null },
): Promise<ChangeLogRecord> {
  return clarityRequest<ChangeLogRecord>(
    `/api/v1/admin/change-logs/${encodeURIComponent(logId)}/publish`,
    { method: "POST", token, json: payload },
  );
}

export function unpublishChangeLog(token: string, logId: string) {
  return clarityRequest<ChangeLogRecord>(
    `/api/v1/admin/change-logs/${encodeURIComponent(logId)}/unpublish`,
    { method: "POST", token },
  );
}

export function approveChangeLog(token: string, logId: string) {
  return clarityRequest<{ message: string }>(
    `/api/v1/admin/change-logs/${encodeURIComponent(logId)}/approve`,
    { method: "POST", token },
  );
}

export function rejectChangeLog(token: string, logId: string) {
  return clarityRequest<{ message: string }>(
    `/api/v1/admin/change-logs/${encodeURIComponent(logId)}/reject`,
    { method: "POST", token },
  );
}

export function createAnnouncement(
  token: string,
  input: AnnouncementInput,
): Promise<ChangeLogRecord> {
  return clarityRequest<ChangeLogRecord>("/api/v1/admin/announcements", {
    method: "POST",
    token,
    json: input,
  });
}

/* ---------------------------------------------------------------- settings -- */

export function updateOrganizationSettings(
  token: string,
  slug: string,
  payload: OrganizationSettingsInput,
): Promise<Organization> {
  return clarityRequest<Organization>(
    `/api/v1/organizations/${encodeURIComponent(slug)}`,
    { method: "PATCH", token, json: payload },
  );
}
