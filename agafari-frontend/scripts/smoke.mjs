/**
 * Demo-script smoke test for the Clarity template.
 *
 * Walks the acceptance flow against a running frontend + API:
 *   node scripts/smoke.mjs
 *
 * Assumes the app is on http://127.0.0.1:3000 and the API on http://127.0.0.1:8000.
 */

import { request as httpRequest } from "node:http";

const APP = process.env.APP_URL ?? "http://127.0.0.1:3000";
const API = process.env.API_URL ?? "http://127.0.0.1:8000";
const SLUG = process.env.ORG_SLUG ?? "hope-aid";
const CODE = process.env.ACCESS_CODE ?? "ngo-demo";

let failures = 0;

function check(label, passed, detail = "") {
  const mark = passed ? "PASS" : "FAIL";
  if (!passed) failures += 1;
  console.log(`${mark}  ${label}${detail ? ` — ${detail}` : ""}`);
}

/** Uses node:http because `fetch` refuses to send a custom Host header. */
function html(path, host) {
  const target = new URL(`${APP}${path}`);
  return new Promise((resolve, reject) => {
    const call = httpRequest(
      {
        hostname: target.hostname,
        port: target.port,
        path: target.pathname + target.search,
        method: "GET",
        headers: host ? { Host: host } : {},
      },
      (response) => {
        let body = "";
        response.setEncoding("utf8");
        response.on("data", (chunk) => (body += chunk));
        response.on("end", () => resolve({ status: response.statusCode, body }));
      },
    );
    call.on("error", reject);
    call.end();
  });
}

async function api(path, options = {}) {
  const response = await fetch(`${API}${path}`, options);
  const text = await response.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    /* non-JSON response */
  }
  return { status: response.status, json };
}

const run = async () => {
  console.log(`\nClarity demo script — app ${APP}, api ${API}\n`);

  // 1. Isolated site with no Agafari marketing chrome
  const home = await html(`/sites/${SLUG}`);
  check("1. Company site loads", home.status === 200, `status ${home.status}`);
  check("1. Shows the organization brand", home.body.includes("Hope Aid"));
  check(
    "1. No Agafari marketing nav",
    !home.body.includes(">Templates<") && !home.body.includes(">Pricing<"),
  );
  const subdomain = await html("/", `${SLUG}.localhost`);
  check(
    "1. Subdomain host serves the same site with clean links",
    subdomain.status === 200 && subdomain.body.includes('href="/services"'),
  );

  // 2. Services and public chat grounded in public documents only
  const services = await api(`/api/v1/organizations/${SLUG}/services`);
  const service = services.json?.[0];
  check("2. Services published", Boolean(service), `${services.json?.length ?? 0} found`);
  const detail = await html(`/sites/${SLUG}/services/${service.slug}`);
  check("2. Service detail renders", detail.status === 200 && detail.body.includes(service.title));

  const publicAnswer = await api(`/api/v1/public/services/${service.id}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "Who is eligible for the grant and what documents are required?" }),
  });
  const publicCitations = publicAnswer.json?.citations ?? [];
  check("2. Public chat answers", publicAnswer.status === 200, publicAnswer.json?.answer_status);
  check("2. Public answer is cited", publicCitations.length > 0,
    publicCitations.map((c) => c.title).join(", "));
  check(
    "2. Public answer cites no internal document",
    !publicCitations.some((c) => /SOP|Rubric|Internal/i.test(c.title)),
  );

  // 3. Feedback and complaint
  if (publicAnswer.json?.message_id) {
    const feedback = await api(`/api/v1/public/messages/${publicAnswer.json.message_id}/feedback`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ feedback: "HELPFUL" }),
    });
    check("3. Answer feedback recorded", feedback.status === 200);
  }
  const org = await api(`/api/v1/organizations/${SLUG}/bootstrap`);
  const complaint = await api("/api/v1/public/complaints", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      organization_id: org.json.id,
      service_id: service.id,
      category: "APPLICATION_PROCESS",
      severity: "MEDIUM",
      description: "Smoke test submission from scripts/smoke.mjs — safe to dismiss.",
      consent_to_contact: false,
    }),
  });
  check("3. Complaint submitted", complaint.status === 201, complaint.json?.id);

  // 4. Access session and internal assistant
  const session = await api("/api/v1/access/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ organization_slug: SLUG, access_code: CODE }),
  });
  check("4. Access code accepted", session.status === 200);
  const token = session.json?.access_token;
  const auth = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const internalAnswer = await api("/api/v1/internal/chat", {
    method: "POST",
    headers: auth,
    body: JSON.stringify({ message: "What is the field travel approval process before departure?" }),
  });
  const internalCitations = internalAnswer.json?.citations ?? [];
  check("4. Internal assistant answers", internalAnswer.status === 200,
    internalAnswer.json?.answer_status);
  check("4. Internal answer cites an internal document", internalCitations.length > 0,
    internalCitations.map((c) => c.title).join(", "));

  // 5. Upload an internal document, approve it, confirm public chat cannot use it
  const marker = `Clarity smoke marker ${Date.now()}`;
  const created = await api("/api/v1/admin/documents", {
    method: "POST",
    headers: auth,
    body: JSON.stringify({
      title: "Smoke Test Internal Note",
      source_type: "TEXT",
      visibility: "INTERNAL",
      department: "Operations",
      raw_text_content: `${marker}. Confidential internal escalation procedure for smoke testing.`,
    }),
  });
  check("5. Internal document uploaded", created.status === 201, created.json?.processing_status);
  const approved = await api(`/api/v1/admin/documents/${created.json.id}/approve`, {
    method: "POST",
    headers: auth,
  });
  check("5. Document approved and indexed", approved.status === 200,
    approved.json?.processing_status);

  const leakCheck = await api(`/api/v1/public/services/${service.id}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "Describe the confidential internal escalation procedure" }),
  });
  const leaked = (leakCheck.json?.citations ?? []).some(
    (citation) => citation.source_id === created.json.id,
  );
  check("5. Public chat cannot cite the internal document", !leaked);

  // 6-7. Admin surfaces and logout
  for (const [label, path] of [
    ["dashboard summary", "/api/v1/admin/dashboard/summary?range=30d"],
    ["insights", "/api/v1/admin/insights"],
    ["complaints", "/api/v1/admin/complaints"],
    ["conversations", "/api/v1/admin/conversations"],
    ["documents", "/api/v1/admin/documents"],
  ]) {
    const result = await api(path, { headers: auth });
    check(`6. Workspace ${label} loads`, result.status === 200, `status ${result.status}`);
  }

  const revoked = await api("/api/v1/access/session", { method: "DELETE", headers: auth });
  check("7. Sign out revokes the session", revoked.status === 204);
  const afterLogout = await api("/api/v1/admin/documents", { headers: auth });
  check("7. Revoked token is rejected", afterLogout.status === 401,
    `status ${afterLogout.status}`);

  console.log(`\n${failures === 0 ? "All checks passed" : `${failures} check(s) failed`}\n`);
  process.exit(failures === 0 ? 0 : 1);
};

run().catch((error) => {
  console.error("Smoke run crashed:", error);
  process.exit(1);
});
