"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useAdmin } from "@/components/admin/admin-shell";
import { useSite } from "@/components/clarity/site-context";
import { PageIntro } from "@/components/clarity/workspace-ui";
import { buildBrandPalette } from "@/lib/clarity/brand";
import { updateOrganizationSettings } from "@/lib/clarity/client";
import type { OrganizationSettingsInput } from "@/lib/admin/types";
import type { Organization } from "@/lib/types";

const RAMP = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];

const FEATURES: {
  key: keyof Organization["features"];
  label: string;
  description: string;
}[] = [
  {
    key: "public_chat",
    label: "Public assistant",
    description: "Visitors can ask questions on your public site.",
  },
  {
    key: "complaints",
    label: "Feedback & complaints",
    description: "Visitors can report a problem or send feedback.",
  },
  {
    key: "employee_assistant",
    label: "Staff assistant",
    description: "Your team can search internal policies from this panel.",
  },
  {
    key: "insights",
    label: "Insights",
    description: "Recurring questions and complaints are grouped for you.",
  },
];

const HEX = /^#[0-9a-f]{6}$/i;

type Draft = {
  name: string;
  description: string;
  logo_url: string;
  primary_color: string;
  accent_color: string;
  service_singular: string;
  service_plural: string;
  email: string;
  phone: string;
  website: string;
  features: Organization["features"];
};

function draftFrom(organization: Organization): Draft {
  return {
    name: organization.name,
    description: organization.description ?? "",
    logo_url: organization.logo_url ?? "",
    primary_color: organization.theme.primary,
    accent_color: organization.theme.accent,
    service_singular: organization.terminology?.service_singular ?? "Service",
    service_plural: organization.terminology?.service_plural ?? "Services",
    email: organization.contact.email ?? "",
    phone: organization.contact.phone ?? "",
    website: organization.contact.website ?? "",
    features: { ...organization.features },
  };
}

export default function SettingsPage() {
  const { token, organization, reloadOrganization } = useAdmin();
  const { basePath } = useSite();
  const [draft, setDraft] = useState<Draft>(() => draftFrom(organization));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const origin = typeof window === "undefined" ? "" : window.location.origin;

  const preview = useMemo(
    () =>
      buildBrandPalette({
        theme: {
          primary: HEX.test(draft.primary_color)
            ? draft.primary_color
            : organization.theme.primary,
          accent: HEX.test(draft.accent_color)
            ? draft.accent_color
            : organization.theme.accent,
        },
      }),
    [draft.primary_color, draft.accent_color, organization.theme],
  );

  function update<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!HEX.test(draft.primary_color) || !HEX.test(draft.accent_color)) {
      setError("Colours must be six-digit hex values, for example #126b50.");
      return;
    }
    setSaving(true);
    setError(null);
    setMessage(null);

    const payload: OrganizationSettingsInput = {
      name: draft.name.trim(),
      description: draft.description.trim() || null,
      logo_url: draft.logo_url.trim() || null,
      primary_color: draft.primary_color,
      accent_color: draft.accent_color,
      terminology: {
        service_singular: draft.service_singular.trim() || "Service",
        service_plural: draft.service_plural.trim() || "Services",
      },
      features: draft.features,
      contact: {
        email: draft.email.trim(),
        phone: draft.phone.trim(),
        website: draft.website.trim(),
      },
    };

    try {
      const updated = await updateOrganizationSettings(token, organization.slug, payload);
      setDraft(draftFrom(updated));
      reloadOrganization();
      setMessage("Saved. Your public site is already using these settings.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "We could not save that.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <PageIntro
        title="Site settings"
        description="Everything here shapes your public site: its name, colours, the word you use for what you offer, and which features visitors get."
        actions={
          <button className="c-button c-button-primary" type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </button>
        }
      />

      {message && (
        <div className="c-alert" role="status">
          <div>{message}</div>
        </div>
      )}
      {error && (
        <div className="c-alert" role="alert">
          <div>{error}</div>
        </div>
      )}

      <section className="c-panel">
        <div className="c-panel-head">
          <h3>Identity</h3>
        </div>
        <div className="c-panel-body">
          <div className="c-form-grid">
            <label className="c-field">
              <span>Organization name</span>
              <input
                className="c-input"
                value={draft.name}
                onChange={(event) => update("name", event.target.value)}
                required
              />
            </label>
            <label className="c-field">
              <span>Logo URL</span>
              <input
                className="c-input"
                value={draft.logo_url}
                onChange={(event) => update("logo_url", event.target.value)}
                placeholder="https://…"
              />
            </label>
            <label className="c-field">
              <span>Short code</span>
              <input className="c-input" value={organization.short_code} readOnly disabled />
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
              value={draft.description}
              onChange={(event) => update("description", event.target.value)}
              placeholder="One or two sentences describing what your organization does."
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
            <div className="c-form-grid">
              <label className="c-field">
                <span>Primary colour</span>
                <input
                  className="c-input"
                  value={draft.primary_color}
                  onChange={(event) => update("primary_color", event.target.value)}
                  placeholder="#126b50"
                />
              </label>
              <label className="c-field">
                <span>Accent colour</span>
                <input
                  className="c-input"
                  value={draft.accent_color}
                  onChange={(event) => update("accent_color", event.target.value)}
                  placeholder="#0ea5a4"
                />
              </label>
            </div>

            <div>
              <span className="c-label">Palette your site will use</span>
              <div
                style={{
                  display: "flex",
                  marginTop: "0.4rem",
                  borderRadius: 8,
                  overflow: "hidden",
                }}
              >
                {RAMP.map((step) => (
                  <span
                    key={step}
                    title={`--c-brand-${step}`}
                    style={{
                      flex: 1,
                      height: 32,
                      background: (preview.variables as Record<string, string>)[
                        `--c-brand-${step}`
                      ],
                    }}
                  />
                ))}
              </div>
              <p className="c-small c-muted" style={{ marginTop: "0.5rem" }}>
                Surfaces and text are derived from your primary colour and darkened
                until they meet contrast requirements, so the site stays readable.
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
                <input
                  className="c-input"
                  value={draft.service_singular}
                  onChange={(event) => update("service_singular", event.target.value)}
                  placeholder="Programme"
                />
              </label>
              <label className="c-field">
                <span>Plural</span>
                <input
                  className="c-input"
                  value={draft.service_plural}
                  onChange={(event) => update("service_plural", event.target.value)}
                  placeholder="Programmes"
                />
              </label>
            </div>
            <p className="c-small c-muted" style={{ marginTop: "0.75rem" }}>
              Used in navigation, headings, and the assistant instead of the word
              “service”.
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
            {FEATURES.map((feature) => (
              <div className="c-list-item" key={feature.key}>
                <div className="c-list-item-main">
                  <strong>{feature.label}</strong>
                  <p>{feature.description}</p>
                </div>
                <div className="c-list-actions">
                  <label className="c-checkbox">
                    <input
                      type="checkbox"
                      checked={draft.features[feature.key]}
                      onChange={(event) =>
                        update("features", {
                          ...draft.features,
                          [feature.key]: event.target.checked,
                        })
                      }
                    />
                    <span>{draft.features[feature.key] ? "On" : "Off"}</span>
                  </label>
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
                  type="email"
                  value={draft.email}
                  onChange={(event) => update("email", event.target.value)}
                />
              </label>
              <label className="c-field">
                <span>Phone</span>
                <input
                  className="c-input"
                  value={draft.phone}
                  onChange={(event) => update("phone", event.target.value)}
                />
              </label>
              <label className="c-field">
                <span>Website</span>
                <input
                  className="c-input"
                  value={draft.website}
                  onChange={(event) => update("website", event.target.value)}
                />
              </label>
            </div>
            <p className="c-small c-muted" style={{ marginTop: "0.75rem" }}>
              Shown in your site footer and on the contact page.
            </p>
          </div>
        </section>
      </div>
    </form>
  );
}
