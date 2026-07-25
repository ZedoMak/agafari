/**
 * Mock Agafari API — development only.
 *
 * The real API is the FastAPI service in `agafari-backend`, which needs
 * PostgreSQL + pgvector and AI provider keys. This script serves the same
 * endpoint contract with synthetic in-memory data so the Clarity template can
 * be built, reviewed, and demoed without that infrastructure.
 *
 * Retrieval here is a keyword match, not a real RAG pipeline, but it enforces
 * the same visibility rule: PUBLIC scope only ever sees approved public
 * documents.
 *
 *   node scripts/mock-api.mjs        # listens on http://127.0.0.1:8000
 */

import { createServer } from "node:http";
import { randomUUID } from "node:crypto";

const PORT = Number(process.env.MOCK_API_PORT ?? 8000);
const ACCESS_CODE = "ngo-demo";

const organization = {
  id: randomUUID(),
  slug: "hope-aid",
  name: "Hope Aid Ethiopia",
  short_code: "HOPE",
  sector: "NGO",
  logo_url: null,
  description:
    "A fictional NGO supporting community livelihoods, youth learning, and emergency assistance across Ethiopia.",
  theme: { primary: "#175CD3", accent: "#12B76A" },
  terminology: { service_singular: "Program", service_plural: "Programs" },
  features: {
    public_chat: true,
    complaints: true,
    employee_assistant: true,
    insights: true,
  },
  contact: {
    email: "info@hope-aid.example",
    phone: "+251 11 000 0000",
    website: "https://hope-aid.example",
  },
};

const services = [
  {
    id: randomUUID(),
    title: "Community Livelihood Grant",
    slug: "community-livelihood-grant",
    category: "Livelihoods",
    organization_code: "HOPE",
    summary:
      "Small grants and training for eligible community groups starting or expanding sustainable livelihood projects.",
    processing_time: "Applications are reviewed within 20 working days",
    verification_status: "VERIFIED",
    last_verified_at: "2026-06-02T09:00:00",
  },
  {
    id: randomUUID(),
    title: "Youth Learning Bursary",
    slug: "youth-learning-bursary",
    category: "Education",
    organization_code: "HOPE",
    summary:
      "Termly support for school materials, transport, and exam fees for students aged 12 to 19 in partner districts.",
    processing_time: "Decisions are shared before each term begins",
    verification_status: "VERIFIED",
    last_verified_at: "2026-05-18T09:00:00",
  },
  {
    id: randomUUID(),
    title: "Emergency Household Support",
    slug: "emergency-household-support",
    category: "Emergency response",
    organization_code: "HOPE",
    summary:
      "Short-term cash and essential items for households affected by flooding, displacement, or crop failure.",
    processing_time: "Assessed within 5 working days of referral",
    verification_status: "NEEDS_REVIEW",
    last_verified_at: "2026-07-01T09:00:00",
  },
];

const documents = [
  {
    id: randomUUID(),
    title: "Community Grant Public Guide",
    source_type: "PUBLIC_GUIDE",
    source_url: "https://hope-aid.example/programs/community-grant",
    raw_text_content:
      "Eligible applicants for the Community Livelihood Grant are registered community groups of five or more members based in a partner district. Required documents are a group recognition letter, a short project plan, and a simple budget. Applications are free. A decision takes up to 20 working days from the date documents are received, and shortlisted groups are contacted by phone or email.",
    visibility: "PUBLIC",
    approval_status: "APPROVED",
    processing_status: "READY",
    department: null,
    version: 1,
    created_at: "2026-05-02T10:12:00",
    updated_at: "2026-05-02T10:12:00",
  },
  {
    id: randomUUID(),
    title: "Youth Bursary Eligibility Notice",
    source_type: "PUBLIC_GUIDE",
    source_url: "https://hope-aid.example/programs/youth-bursary",
    raw_text_content:
      "Students aged 12 to 19 enrolled in partner district schools are eligible for the Youth Learning Bursary. The documents required are a school letter and proof of residence. Bursaries cover exam fees, transport, and learning materials. There is no application fee and a decision is shared before each term begins.",
    visibility: "PUBLIC",
    approval_status: "APPROVED",
    processing_status: "READY",
    department: null,
    version: 1,
    created_at: "2026-05-11T08:30:00",
    updated_at: "2026-05-11T08:30:00",
  },
  {
    id: randomUUID(),
    title: "Emergency Support Referral Notice",
    source_type: "PUBLIC_GUIDE",
    source_url: "https://hope-aid.example/programs/emergency-support",
    raw_text_content:
      "Households affected by flooding, displacement, or crop failure are eligible for Emergency Household Support through a referral from a kebele office or partner organisation. No documents are required at referral; identity is confirmed during the assessment visit, which takes place within five working days.",
    visibility: "PUBLIC",
    approval_status: "APPROVED",
    processing_status: "READY",
    department: null,
    version: 1,
    created_at: "2026-06-08T11:00:00",
    updated_at: "2026-06-08T11:00:00",
  },
  {
    id: randomUUID(),
    title: "Field Travel Approval SOP",
    source_type: "INTERNAL_SOP",
    source_url: null,
    raw_text_content:
      "Employees submit a travel request to their line manager at least five working days before departure. The Operations Manager confirms the security and vehicle plan. Finance approves the budget only after both approvals are recorded. Emergency travel requires Country Director approval and written justification.",
    visibility: "INTERNAL",
    approval_status: "APPROVED",
    processing_status: "READY",
    department: "Operations",
    version: 1,
    created_at: "2026-04-20T14:02:00",
    updated_at: "2026-04-20T14:02:00",
  },
  {
    id: randomUUID(),
    title: "Grant Panel Scoring Rubric (draft)",
    source_type: "INTERNAL_SOP",
    source_url: null,
    raw_text_content:
      "Panels score applications out of 40: relevance 10, feasibility 10, community contribution 10, safeguarding 10. Any application scoring below 24 is declined without further review.",
    visibility: "INTERNAL",
    approval_status: "PENDING",
    processing_status: "PENDING_APPROVAL",
    department: "Programs",
    version: 1,
    created_at: "2026-07-19T16:45:00",
    updated_at: "2026-07-19T16:45:00",
  },
];

const complaints = [
  {
    id: randomUUID(),
    service_id: services[0].id,
    category: "BENEFICIARY_COMMUNICATION",
    severity: "MEDIUM",
    description:
      "I submitted the grant form but did not receive a status update after three weeks.",
    contact: { email: "abeba@example.com", phone: null },
    consent_to_contact: true,
    status: "NEW",
    resolution_note: null,
    created_at: "2026-07-20T11:20:00",
    updated_at: "2026-07-20T11:20:00",
  },
  {
    id: randomUUID(),
    service_id: services[0].id,
    category: "APPLICATION_PROCESS",
    severity: "LOW",
    description:
      "Our group applied last week and cannot find where to track the application.",
    contact: null,
    consent_to_contact: false,
    status: "REVIEWING",
    resolution_note: null,
    created_at: "2026-07-18T09:05:00",
    updated_at: "2026-07-21T09:05:00",
  },
];

const insights = [
  {
    id: randomUUID(),
    cluster_id: randomUUID(),
    title: "People cannot track an application after submitting",
    summary:
      "Six public questions and two complaints in the last month asked how to check the status of a grant application.",
    recommendation:
      "Publish a short status-tracking section in the Community Grant Public Guide, including who to contact and expected timing.",
    confidence: 82,
    status: "NEW",
    owner: null,
    resolution_note: null,
    created_at: "2026-07-21T07:00:00",
    updated_at: "2026-07-21T07:00:00",
  },
  {
    id: randomUUID(),
    cluster_id: randomUUID(),
    title: "Bursary age limits are being misread",
    summary:
      "Several parents asked whether 11-year-olds qualify, suggesting the age range is not prominent enough.",
    recommendation:
      "Move the age range to the first line of the bursary notice and repeat it on the program page summary.",
    confidence: 64,
    status: "REVIEWING",
    owner: "Meron",
    resolution_note: null,
    created_at: "2026-07-14T07:00:00",
    updated_at: "2026-07-16T07:00:00",
  },
];

const conversations = [];
const messages = new Map();

const issueClusters = [
  {
    id: randomUUID(),
    title: "Application status tracking",
    source_kind: "COMPLAINT",
    category: "BENEFICIARY_COMMUNICATION",
    item_count: 8,
    last_seen_at: "2026-07-21T11:20:00",
  },
  {
    id: randomUUID(),
    title: "Bursary eligibility age",
    source_kind: "KNOWLEDGE_GAP",
    category: "PUBLIC_UNANSWERED",
    item_count: 5,
    last_seen_at: "2026-07-19T15:02:00",
  },
];

const sessions = new Map();

/* ------------------------------------------------------------- helpers -- */

function json(response, status, body) {
  const payload = body === undefined ? "" : JSON.stringify(body);
  response.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
  });
  response.end(payload);
}

function readBody(request) {
  return new Promise((resolve) => {
    const chunks = [];
    request.on("data", (chunk) => chunks.push(chunk));
    request.on("end", () => resolve(Buffer.concat(chunks)));
  });
}

function authorize(request) {
  const header = request.headers.authorization ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  return token && sessions.has(token) ? token : null;
}

function parseMultipart(buffer, contentType) {
  const boundaryMatch = /boundary=(?:"([^"]+)"|([^;]+))/i.exec(contentType ?? "");
  if (!boundaryMatch) return {};
  const boundary = `--${boundaryMatch[1] ?? boundaryMatch[2]}`;
  const fields = {};
  for (const part of buffer.toString("latin1").split(boundary)) {
    const nameMatch = /name="([^"]+)"/.exec(part);
    if (!nameMatch) continue;
    const separator = part.indexOf("\r\n\r\n");
    if (separator === -1) continue;
    const value = part.slice(separator + 4).replace(/\r\n$/, "");
    const filename = /filename="([^"]*)"/.exec(part)?.[1];
    fields[nameMatch[1]] = filename ? { filename, content: value } : value;
  }
  return fields;
}

/** Keyword retrieval that honours the same visibility rule as the real API. */
function retrieve(question, scope, serviceId) {
  const words = question
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 3);
  const pool = documents.filter(
    (document) =>
      document.approval_status === "APPROVED" &&
      (scope === "INTERNAL"
        ? true
        : document.visibility === "PUBLIC"),
  );
  const scored = pool
    .map((document) => {
      const haystack = `${document.title} ${document.raw_text_content}`.toLowerCase();
      const score = words.reduce(
        (total, word) => total + (haystack.includes(word) ? 1 : 0),
        0,
      );
      return { document, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);
  void serviceId;
  return scored.slice(0, 2);
}

function answer(question, scope, serviceId) {
  const hits = retrieve(question, scope, serviceId);
  if (hits.length === 0) {
    return {
      reply:
        "I could not find that in the approved documents. Please contact the team directly so they can help and add the answer to the knowledge base.",
      answer_status: "UNANSWERED",
      citations: [],
    };
  }
  const sentences = hits
    .flatMap((hit) => hit.document.raw_text_content.split(/(?<=\.)\s+/))
    .filter((sentence) =>
      question
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter((word) => word.length > 3)
        .some((word) => sentence.toLowerCase().includes(word)),
    )
    .slice(0, 3);
  return {
    reply:
      (sentences.length ? sentences.join(" ") : hits[0].document.raw_text_content) +
      "\n\n(Mock answer generated by scripts/mock-api.mjs — the real reply comes from Addis AI over pgvector retrieval.)",
    answer_status: hits[0].score > 1 ? "ANSWERED" : "LOW_CONFIDENCE",
    citations: hits.map((hit) => ({
      source_id: hit.document.id,
      title: hit.document.title,
      url: hit.document.source_url,
      section: null,
    })),
  };
}

function logChat(scope, serviceId, department, question, result) {
  let conversation = conversations.at(-1);
  conversation = {
    id: randomUUID(),
    scope,
    service_id: serviceId ?? null,
    department: department ?? null,
    updated_at: new Date().toISOString().replace("Z", ""),
    messages: [],
  };
  conversations.unshift(conversation);
  const userMessage = {
    id: randomUUID(),
    role: "user",
    content: question,
    answer_status: null,
    citations: [],
    feedback: null,
    created_at: conversation.updated_at,
  };
  const assistantMessage = {
    id: randomUUID(),
    role: "assistant",
    content: result.reply,
    answer_status: result.answer_status,
    citations: result.citations,
    feedback: null,
    created_at: conversation.updated_at,
  };
  conversation.messages.push(userMessage, assistantMessage);
  messages.set(assistantMessage.id, assistantMessage);
  return { conversationId: conversation.id, messageId: assistantMessage.id };
}

/* -------------------------------------------------------------- routing -- */

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", `http://${request.headers.host}`);
  const path = url.pathname;
  const method = request.method ?? "GET";

  if (method === "OPTIONS") return json(response, 204, undefined);

  const raw = ["POST", "PATCH", "PUT"].includes(method)
    ? await readBody(request)
    : Buffer.alloc(0);
  const contentType = request.headers["content-type"] ?? "";
  const body =
    raw.length && contentType.includes("application/json")
      ? JSON.parse(raw.toString("utf8"))
      : {};

  const requireAuth = () => {
    const token = authorize(request);
    if (!token) json(response, 401, { detail: "Not authenticated" });
    return token;
  };

  // Public organization data
  if (method === "GET" && path === "/api/v1/organizations") {
    return json(response, 200, [organization]);
  }
  if (method === "GET" && /^\/api\/v1\/organizations\/[^/]+\/bootstrap$/.test(path)) {
    const slug = path.split("/")[4];
    if (slug !== organization.slug && slug !== organization.short_code) {
      return json(response, 404, { detail: "Organization not found" });
    }
    return json(response, 200, organization);
  }
  if (method === "GET" && /^\/api\/v1\/organizations\/[^/]+\/services$/.test(path)) {
    return json(response, 200, services);
  }

  // Access sessions
  if (method === "POST" && path === "/api/v1/access/session") {
    if (body.access_code !== ACCESS_CODE) {
      return json(response, 401, { detail: "Invalid organization or access code" });
    }
    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 8 * 3600_000)
      .toISOString()
      .replace("Z", "");
    sessions.set(token, expiresAt);
    return json(response, 200, {
      access_token: token,
      expires_at: expiresAt,
      organization_id: organization.id,
    });
  }
  if (method === "DELETE" && path === "/api/v1/access/session") {
    const token = requireAuth();
    if (!token) return;
    sessions.delete(token);
    return json(response, 204, undefined);
  }

  // Public chat + feedback
  if (method === "POST" && /^\/api\/v1\/public\/services\/[^/]+\/chat$/.test(path)) {
    const serviceId = path.split("/")[5];
    const result = answer(body.message ?? "", "PUBLIC", serviceId);
    const { conversationId, messageId } = logChat(
      "PUBLIC",
      serviceId,
      null,
      body.message ?? "",
      result,
    );
    return json(response, 200, {
      conversation_id: body.conversation_id ?? conversationId,
      message_id: messageId,
      reply: result.reply,
      answer_status: result.answer_status,
      citations: result.citations,
    });
  }
  if (method === "PATCH" && /^\/api\/v1\/public\/messages\/[^/]+\/feedback$/.test(path)) {
    const messageId = path.split("/")[5];
    const message = messages.get(messageId);
    if (!message) return json(response, 404, { detail: "Answer not found" });
    message.feedback = body.feedback;
    return json(response, 200, { id: messageId, feedback: body.feedback });
  }

  // Complaints
  if (method === "POST" && path === "/api/v1/public/complaints") {
    const complaint = {
      id: randomUUID(),
      service_id: body.service_id ?? null,
      category: body.category,
      severity: body.severity,
      description: body.description,
      contact: body.contact ?? null,
      consent_to_contact: Boolean(body.consent_to_contact),
      status: "NEW",
      resolution_note: null,
      created_at: new Date().toISOString().replace("Z", ""),
      updated_at: new Date().toISOString().replace("Z", ""),
    };
    complaints.unshift(complaint);
    return json(response, 201, {
      id: complaint.id,
      status: complaint.status,
      created_at: complaint.created_at,
    });
  }

  // Internal chat
  if (method === "POST" && path === "/api/v1/internal/chat") {
    if (!requireAuth()) return;
    const result = answer(body.message ?? "", "INTERNAL", body.service_id);
    const { conversationId, messageId } = logChat(
      "INTERNAL",
      body.service_id,
      body.department,
      body.message ?? "",
      result,
    );
    return json(response, 200, {
      conversation_id: body.conversation_id ?? conversationId,
      message_id: messageId,
      reply: result.reply,
      answer_status: result.answer_status,
      citations: result.citations,
    });
  }

  // Admin documents
  if (path === "/api/v1/admin/documents" && method === "GET") {
    if (!requireAuth()) return;
    return json(
      response,
      200,
      documents.map((document) => {
        const listed = { ...document };
        delete listed.raw_text_content;
        return listed;
      }),
    );
  }
  if (path === "/api/v1/admin/documents" && method === "POST") {
    if (!requireAuth()) return;
    const document = {
      id: randomUUID(),
      title: body.title,
      source_type: body.source_type ?? "TEXT",
      source_url: body.source_url ?? null,
      raw_text_content: body.raw_text_content,
      visibility: body.visibility,
      approval_status: "PENDING",
      processing_status: "PENDING_APPROVAL",
      department: body.department ?? null,
      version: 1,
      created_at: new Date().toISOString().replace("Z", ""),
      updated_at: new Date().toISOString().replace("Z", ""),
    };
    documents.unshift(document);
    return json(response, 201, document);
  }
  if (path === "/api/v1/admin/documents/upload" && method === "POST") {
    if (!requireAuth()) return;
    const fields = parseMultipart(raw, contentType);
    const file = fields.file;
    const document = {
      id: randomUUID(),
      title: String(fields.title ?? file?.filename ?? "Untitled"),
      source_type: String(file?.filename ?? "").toLowerCase().endsWith(".pdf")
        ? "PDF"
        : "FILE",
      source_url: null,
      raw_text_content: file?.content ?? "",
      visibility: String(fields.visibility ?? "PUBLIC").toUpperCase(),
      approval_status: "PENDING",
      processing_status: "PENDING_APPROVAL",
      department: fields.department ? String(fields.department) : null,
      version: 1,
      created_at: new Date().toISOString().replace("Z", ""),
      updated_at: new Date().toISOString().replace("Z", ""),
    };
    documents.unshift(document);
    return json(response, 201, document);
  }
  if (method === "POST" && /^\/api\/v1\/admin\/documents\/[^/]+\/(approve|reject)$/.test(path)) {
    if (!requireAuth()) return;
    const [, , , , , id, action] = path.split("/");
    const document = documents.find((item) => item.id === id);
    if (!document) return json(response, 404, { detail: "Document not found" });
    if (action === "approve") {
      document.approval_status = "APPROVED";
      document.processing_status = "READY";
      return json(response, 200, {
        id,
        approval_status: "APPROVED",
        processing_status: "READY",
        chunk_count: Math.max(1, Math.ceil(document.raw_text_content.length / 500)),
      });
    }
    document.approval_status = "REJECTED";
    document.processing_status = "REJECTED";
    return json(response, 200, { id, approval_status: "REJECTED" });
  }

  // Admin intelligence
  if (method === "GET" && path === "/api/v1/admin/dashboard/summary") {
    if (!requireAuth()) return;
    const assistantMessages = conversations.flatMap((conversation) =>
      conversation.messages.filter((message) => message.role === "assistant"),
    );
    const answered = assistantMessages.filter(
      (message) => message.answer_status === "ANSWERED",
    ).length;
    const byScope = { public: 0, internal: 0 };
    for (const conversation of conversations) {
      const count = conversation.messages.filter((m) => m.role === "assistant").length;
      byScope[conversation.scope.toLowerCase()] += count;
    }
    const bySeverity = {};
    for (const complaint of complaints) {
      if (["RESOLVED", "DISMISSED"].includes(complaint.status)) continue;
      bySeverity[complaint.severity.toLowerCase()] =
        (bySeverity[complaint.severity.toLowerCase()] ?? 0) + 1;
    }
    const byStatus = {};
    for (const document of documents) {
      const key = document.processing_status.toLowerCase();
      byStatus[key] = (byStatus[key] ?? 0) + 1;
    }
    return json(response, 200, {
      range: url.searchParams.get("range") ?? "30d",
      interactions: {
        total: assistantMessages.length,
        answered,
        answer_rate: assistantMessages.length
          ? Math.round((answered / assistantMessages.length) * 1000) / 10
          : 0,
        by_scope: byScope,
      },
      open_complaints: {
        total: Object.values(bySeverity).reduce((sum, value) => sum + value, 0),
        by_severity: bySeverity,
      },
      documents: byStatus,
      top_issue_clusters: issueClusters,
      emerging_insights: insights
        .filter((insight) => !["RESOLVED", "DISMISSED"].includes(insight.status))
        .map(({ id, title, summary, confidence, status }) => ({
          id,
          title,
          summary,
          confidence,
          status,
        })),
    });
  }
  if (method === "GET" && path === "/api/v1/admin/insights") {
    if (!requireAuth()) return;
    const status = url.searchParams.get("status");
    return json(
      response,
      200,
      status ? insights.filter((item) => item.status === status.toUpperCase()) : insights,
    );
  }
  if (method === "PATCH" && /^\/api\/v1\/admin\/insights\/[^/]+$/.test(path)) {
    if (!requireAuth()) return;
    const insight = insights.find((item) => item.id === path.split("/")[5]);
    if (!insight) return json(response, 404, { detail: "Insight not found" });
    Object.assign(insight, {
      status: body.status,
      owner: body.owner ?? null,
      resolution_note: body.resolution_note ?? null,
    });
    return json(response, 200, {
      id: insight.id,
      status: insight.status,
      owner: insight.owner,
    });
  }
  if (method === "GET" && path === "/api/v1/admin/complaints") {
    if (!requireAuth()) return;
    const status = url.searchParams.get("status");
    const severity = url.searchParams.get("severity");
    return json(
      response,
      200,
      complaints.filter(
        (complaint) =>
          (!status || complaint.status === status.toUpperCase()) &&
          (!severity || complaint.severity === severity.toUpperCase()),
      ),
    );
  }
  if (method === "PATCH" && /^\/api\/v1\/admin\/complaints\/[^/]+$/.test(path)) {
    if (!requireAuth()) return;
    const complaint = complaints.find((item) => item.id === path.split("/")[5]);
    if (!complaint) return json(response, 404, { detail: "Complaint not found" });
    complaint.status = body.status;
    complaint.resolution_note = body.resolution_note ?? null;
    return json(response, 200, { id: complaint.id, status: complaint.status });
  }
  if (method === "GET" && path === "/api/v1/admin/conversations") {
    if (!requireAuth()) return;
    const scope = url.searchParams.get("scope");
    return json(
      response,
      200,
      scope
        ? conversations.filter((item) => item.scope === scope.toUpperCase())
        : conversations,
    );
  }

  if (path === "/") return json(response, 200, { status: "online", app: "mock" });
  return json(response, 404, { detail: "Not found" });
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Mock Agafari API on http://127.0.0.1:${PORT}`);
  console.log(`Organization: ${organization.slug} · access code: ${ACCESS_CODE}`);
});
