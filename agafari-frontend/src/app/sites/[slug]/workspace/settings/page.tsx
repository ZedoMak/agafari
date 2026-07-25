"use client";

import { useSite } from "@/components/clarity/site-context";
import { ApiGapNotice, PageIntro } from "@/components/clarity/workspace-ui";

const RAMP = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];

const FEATURES: Record<string, { label: string; description: string }> = {
  public_chat: {
    label: "Public assistant",
    description: "Visitors can ask questions on your public site",
  },
  complaints: {
    label: "Feedback & complaints",
    description: "Visitors can submit feedback and complaints",
  },
  employee_assistant: {
    label: "Internal assistant",
    description: "Staff can use the internal assistant in this workspace",
  },
  insights: {
    label: "Insights",
    description: "Recurring issues are grouped into insights",
  },
};

export default function SettingsPage() {
  const { organization, terminology, basePath } = useSite();
  const origin = typeof window === "undefined" ? "" : window.location.origin;

  return (
    <>
      <PageIntro
        title="Settings"
        description="How this template is configured for your organization. Everything here comes from your bootstrap record and drives the whole site."
      />

      <ApiGapNotice endpoint="PATCH /api/v1/organizations/{slug}">
        Settings are read-only in the product today: the API has no update
        endpoint yet, so this screen previews the live configuration rather than
        pretending to save it.
      </ApiGapNotice>

      <section className="c-panel">
        <div className="c-panel-head">
          <h3>Identity</h3>
        </div>
        <div className="c-panel-body">
          <div className="c-form-grid">
            <label className="c-field">
              <span>Organization name</span>
              <input className="c-input" value={organization.name} readOnly disabled />
            </label>
            <label className="c-field">
              <span>Short code</span>
              <input className="c-input" value={organization.short_code} readOnly disabled />
            </label>
            <label className="c-field">
              <span>Sector</span>
              <input className="c-input" value={organization.sector} readOnly disabled />
            </label>
            <label className="c-field">
              <span>Site address</span>
              <input
                className="c-input"
                value={`${origin}${basePath || "/"}`}
                readOnly
                disabled
              />
            </label>
          </div>
          <label className="c-field" style={{ marginTop: "1rem" }}>
            <span>Description</span>
            <textarea
              className="c-textarea"
              style={{ minHeight: 80 }}
              value={organization.description ?? ""}
              readOnly
              disabled
            />
          </label>
        </div>
      </section>

      <div className="c-two-col">
        <section className="c-panel">
          <div className="c-panel-head">
            <h3>Brand</h3>
          </div>
          <div className="c-panel-body" style={{ display: "grid", gap: "1rem" }}>
            <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
              <div>
                <span className="c-label">Primary</span>
                <div
                  style={{
                    marginTop: "0.4rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <span
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      background: organization.theme.primary,
                      border: "1px solid var(--c-line)",
                    }}
                  />
                  <code className="c-mono">{organization.theme.primary}</code>
                </div>
              </div>
              <div>
                <span className="c-label">Accent</span>
                <div
                  style={{
                    marginTop: "0.4rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <span
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      background: organization.theme.accent,
                      border: "1px solid var(--c-line)",
                    }}
                  />
                  <code className="c-mono">{organization.theme.accent}</code>
                </div>
              </div>
            </div>

            <div>
              <span className="c-label">Palette generated for this template</span>
              <div style={{ display: "flex", marginTop: "0.4rem", borderRadius: 8, overflow: "hidden" }}>
                {RAMP.map((step) => (
                  <span
                    key={step}
                    title={`--c-brand-${step}`}
                    style={{
                      flex: 1,
                      height: 32,
                      background: `var(--c-brand-${step})`,
                    }}
                  />
                ))}
              </div>
              <p className="c-small c-muted" style={{ marginTop: "0.5rem" }}>
                Text, surfaces, and states are derived from your primary colour and
                adjusted until they meet contrast requirements.
              </p>
            </div>
          </div>
        </section>

        <section className="c-panel">
          <div className="c-panel-head">
            <h3>Wording</h3>
          </div>
          <div className="c-panel-body">
            <div className="c-form-grid">
              <label className="c-field">
                <span>Singular</span>
                <input className="c-input" value={terminology.singular} readOnly disabled />
              </label>
              <label className="c-field">
                <span>Plural</span>
                <input className="c-input" value={terminology.plural} readOnly disabled />
              </label>
            </div>
            <p className="c-small c-muted" style={{ marginTop: "0.75rem" }}>
              Used everywhere in navigation, headings, and the assistant instead of
              the word “service”.
            </p>
          </div>
        </section>
      </div>

      <div className="c-two-col">
        <section className="c-panel">
          <div className="c-panel-head">
            <h3>Features</h3>
          </div>
          <div className="c-list">
            {Object.entries(organization.features).map(([key, enabled]) => (
              <div className="c-list-item" key={key}>
                <div className="c-list-item-main">
                  <strong>{FEATURES[key]?.label ?? key.replace(/_/g, " ")}</strong>
                  <p>
                    {FEATURES[key]?.description ??
                      "Feature flag from your bootstrap record."}
                  </p>
                </div>
                <div className="c-list-actions">
                  <span className={`c-badge ${enabled ? "c-badge-positive" : ""} c-badge-dot`}>
                    {enabled ? "on" : "off"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="c-panel">
          <div className="c-panel-head">
            <h3>Contact details</h3>
          </div>
          <div className="c-panel-body">
            <div className="c-form-grid">
              <label className="c-field">
                <span>Email</span>
                <input
                  className="c-input"
                  value={organization.contact.email ?? "—"}
                  readOnly
                  disabled
                />
              </label>
              <label className="c-field">
                <span>Phone</span>
                <input
                  className="c-input"
                  value={organization.contact.phone ?? "—"}
                  readOnly
                  disabled
                />
              </label>
              <label className="c-field">
                <span>Website</span>
                <input
                  className="c-input"
                  value={organization.contact.website ?? "—"}
                  readOnly
                  disabled
                />
              </label>
            </div>
            <p className="c-small c-muted" style={{ marginTop: "0.75rem" }}>
              Shown in the site footer and on the contact page.
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
