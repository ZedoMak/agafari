"use client";

import { useState, type FormEvent } from "react";
import { useSite } from "@/components/clarity/site-context";
import { submitComplaint } from "@/lib/api";
import type { Service } from "@/lib/types";

const CATEGORIES: [string, string][] = [
  ["BENEFICIARY_COMMUNICATION", "Communication or updates"],
  ["APPLICATION_PROCESS", "Application or process"],
  ["ELIGIBILITY", "Eligibility or requirements"],
  ["PAYMENT_OR_DELIVERY", "Payment or delivery"],
  ["STAFF_OR_FIELD_OPERATIONS", "Staff or field operations"],
  ["SAFEGUARDING", "Safeguarding concern"],
  ["OTHER", "Something else"],
];

const SEVERITIES: [string, string][] = [
  ["LOW", "Low — general feedback"],
  ["MEDIUM", "Medium — needs attention"],
  ["HIGH", "High — causing real difficulty"],
  ["CRITICAL", "Critical — safety or harm"],
];

export function FeedbackForm({
  services,
  defaultServiceId,
}: {
  services: Service[];
  defaultServiceId?: string;
}) {
  const { organization, terminology } = useSite();
  const [serviceId, setServiceId] = useState(defaultServiceId ?? "");
  const [category, setCategory] = useState(CATEGORIES[0][0]);
  const [severity, setSeverity] = useState("MEDIUM");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (description.trim().length < 10) {
      setError("Please describe what happened in at least 10 characters.");
      return;
    }
    setSubmitting(true);
    try {
      const response = await submitComplaint({
        organization_id: organization.id,
        service_id: serviceId || null,
        category,
        severity: severity as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
        description: description.trim(),
        contact:
          email || phone ? { email: email || null, phone: phone || null } : null,
        consent_to_contact: consent,
      });
      setReference(response.id);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Your feedback could not be submitted.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (reference) {
    return (
      <div className="c-panel">
        <div className="c-panel-body" style={{ display: "grid", gap: "0.75rem" }}>
          <span className="c-badge c-badge-positive c-badge-dot">Received</span>
          <h2 className="c-title-md">Thank you for telling us</h2>
          <p className="c-muted">
            Your submission went straight to {organization.name}. It stays private
            and is never added to the public assistant&apos;s knowledge.
          </p>
          <p className="c-mono">Reference {reference}</p>
          <div>
            <button
              type="button"
              className="c-button c-button-secondary"
              onClick={() => {
                setReference("");
                setDescription("");
                setConsent(false);
              }}
            >
              Submit another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form className="c-panel" onSubmit={handleSubmit}>
      <div className="c-panel-body" style={{ display: "grid", gap: "1rem" }}>
        <div className="c-form-grid">
          <label className="c-field">
            <span>{terminology.singular} (optional)</span>
            <select
              className="c-select"
              value={serviceId}
              onChange={(event) => setServiceId(event.target.value)}
            >
              <option value="">General feedback</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.title}
                </option>
              ))}
            </select>
          </label>
          <label className="c-field">
            <span>What is this about?</span>
            <select
              className="c-select"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              {CATEGORIES.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="c-field">
          <span>How urgent is it?</span>
          <select
            className="c-select"
            value={severity}
            onChange={(event) => setSeverity(event.target.value)}
          >
            {SEVERITIES.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label className="c-field">
          <span>What happened?</span>
          <textarea
            className="c-textarea"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Describe the issue, what you expected, and anything that would help us understand."
            maxLength={10_000}
            required
          />
          <small className="c-field-help">
            Please do not include passwords, PINs, or identity document numbers.
          </small>
        </label>

        <div className="c-form-grid">
          <label className="c-field">
            <span>Email (optional)</span>
            <input
              className="c-input"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
            />
          </label>
          <label className="c-field">
            <span>Phone (optional)</span>
            <input
              className="c-input"
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="+251…"
            />
          </label>
        </div>

        <label className="c-checkbox">
          <input
            type="checkbox"
            checked={consent}
            onChange={(event) => setConsent(event.target.checked)}
          />
          <span>
            {organization.name} may use the contact details above to follow up
            with me about this submission.
          </span>
        </label>

        {error && (
          <div className="c-form-error" role="alert">
            {error}
          </div>
        )}

        <div className="c-form-actions">
          <button className="c-button c-button-primary" type="submit" disabled={submitting}>
            {submitting ? "Sending…" : "Send privately"}
          </button>
        </div>
      </div>
    </form>
  );
}
