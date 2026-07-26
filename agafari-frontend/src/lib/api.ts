import type {
  ChatResponse,
  ComplaintPayload,
  ComplaintResponse,
  Organization,
  OrganizationUpdate,
  Service,
} from "@/lib/types";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

async function request<T>(
  path: string,
  init?: RequestInit,
  timeoutMs = 30_000,
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init?.headers,
      },
      signal: controller.signal,
      cache: init?.method && init.method !== "GET" ? "no-store" : "no-store",
    });

    if (!response.ok) {
      let message = "Something went wrong. Please try again.";
      try {
        const data = (await response.json()) as { detail?: string };
        message = data.detail ?? message;
      } catch {
        // Keep the safe default error.
      }
      throw new ApiError(message, response.status);
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError("The request timed out. Please try again.", 408);
    }
    throw new ApiError("This service is temporarily unavailable.", 503);
  } finally {
    clearTimeout(timeout);
  }
}

export function getOrganizations(): Promise<Organization[]> {
  return request<Organization[]>("/api/v1/organizations");
}

export function getOrganization(slug: string): Promise<Organization> {
  return request<Organization>(
    `/api/v1/organizations/${encodeURIComponent(slug)}/bootstrap`,
  );
}

export function getOrganizationServices(slug: string): Promise<Service[]> {
  return request<Service[]>(
    `/api/v1/organizations/${encodeURIComponent(slug)}/services`,
  );
}

/**
 * The updates feed is optional per deployment, so a missing or failing endpoint
 * resolves to an empty list instead of taking a visitor page down with it.
 */
export async function getOrganizationUpdates(
  slug: string,
  limit?: number,
): Promise<OrganizationUpdate[]> {
  const query = limit ? `?limit=${encodeURIComponent(limit)}` : "";
  try {
    const updates = await request<OrganizationUpdate[]>(
      `/api/v1/organizations/${encodeURIComponent(slug)}/updates${query}`,
    );
    return Array.isArray(updates) ? updates : [];
  } catch {
    return [];
  }
}

export function askPublicAssistant(
  serviceId: string,
  message: string,
  conversationId: string | null,
): Promise<ChatResponse> {
  return request<ChatResponse>(
    `/api/v1/public/services/${encodeURIComponent(serviceId)}/chat`,
    {
      method: "POST",
      body: JSON.stringify({
        message,
        conversation_id: conversationId,
      }),
    },
    90_000,
  );
}

export function sendAnswerFeedback(
  messageId: string,
  feedback: "HELPFUL" | "NOT_HELPFUL",
): Promise<{ id: string; feedback: string }> {
  return request(`/api/v1/public/messages/${messageId}/feedback`, {
    method: "PATCH",
    body: JSON.stringify({ feedback }),
  });
}

export function submitComplaint(
  payload: ComplaintPayload,
): Promise<ComplaintResponse> {
  return request<ComplaintResponse>("/api/v1/public/complaints", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
