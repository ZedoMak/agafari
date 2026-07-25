"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { submitComplaint } from "@/lib/api";
import type { Organization, Service } from "@/lib/types";

const categories = [
  ["BENEFICIARY_COMMUNICATION", "Communication or updates"],
  ["APPLICATION_PROCESS", "Application or process"],
  ["ELIGIBILITY", "Eligibility or requirements"],
  ["PAYMENT_OR_DELIVERY", "Payment or service delivery"],
  ["STAFF_OR_FIELD_OPERATIONS", "Staff or field operations"],
  ["SAFEGUARDING", "Safeguarding concern"],
  ["OTHER", "Other"],
];

export function ComplaintButton({
  organization,
  services,
  defaultServiceId,
  label = "Submit feedback or a complaint",
  className = "button button-secondary",
}: {
  organization: Organization;
  services: Service[];
  defaultServiceId?: string;
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className={className} onClick={() => setOpen(true)}>
        {label}
      </button>
      {open && (
        <ComplaintDialog
          organization={organization}
          services={services}
          defaultServiceId={defaultServiceId}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

function ComplaintDialog({
  organization,
  services,
  defaultServiceId,
  onClose,
}: {
  organization: Organization;
  services: Service[];
  defaultServiceId?: string;
  onClose: () => void;
}) {
  const [serviceId, setServiceId] = useState(defaultServiceId ?? "");
  const [category, setCategory] = useState(categories[0][0]);
  const [severity, setSeverity] = useState("MEDIUM");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");
  const closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButton.current?.focus();
    const priorOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = priorOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (description.trim().length < 10) {
      setError("Please provide at least 10 characters of detail.");
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
          email || phone
            ? { email: email || null, phone: phone || null }
            : null,
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

  return (
    <div
      className="dialog-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="complaint-title"
      >
        {reference ? (
          <div className="success-state">
            <span className="success-icon" aria-hidden="true">
              ✓
            </span>
            <h3>Thank you for speaking up</h3>
            <p>
              Your submission has been sent to {organization.name}. It stays
              private and will not be added to the public AI knowledge base.
            </p>
            <span className="reference">Reference: {reference}</span>
            <br />
            <button className="button button-primary" onClick={onClose}>
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="dialog-header">
              <div>
                <h2 id="complaint-title">Share feedback with {organization.name}</h2>
                <p>
                  Help the organization understand what happened and what needs
                  attention.
                </p>
              </div>
              <button
                ref={closeButton}
                className="dialog-close"
                onClick={onClose}
                aria-label="Close feedback form"
              >
                ×
              </button>
            </div>
            <form className="form-body" onSubmit={handleSubmit}>
              <div className="form-row">
                <label className="field">
                  <span>{organization.terminology.service_singular}</span>
                  <select
                    value={serviceId}
                    onChange={(event) => setServiceId(event.target.value)}
                  >
                    <option value="">General organization feedback</option>
                    {services.map((service) => (
                      <option value={service.id} key={service.id}>
                        {service.title}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>Category</span>
                  <select
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                  >
                    {categories.map(([value, text]) => (
                      <option value={value} key={value}>
                        {text}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="field">
                <span>How urgent is this?</span>
                <select
                  value={severity}
                  onChange={(event) => setSeverity(event.target.value)}
                >
                  <option value="LOW">Low — general feedback</option>
                  <option value="MEDIUM">Medium — needs attention</option>
                  <option value="HIGH">High — causing significant difficulty</option>
                  <option value="CRITICAL">Critical — immediate safety or harm concern</option>
                </select>
              </label>

              <label className="field">
                <span>What happened?</span>
                <textarea
                  aria-label="What happened?"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Describe the issue, what you expected, and any helpful context."
                  maxLength={10_000}
                  required
                />
                <small className="field-help">
                  Avoid sharing passwords, banking PINs, or sensitive identity
                  documents.
                </small>
              </label>

              <div className="form-row">
                <label className="field">
                  <span>Email (optional)</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                  />
                </label>
                <label className="field">
                  <span>Phone (optional)</span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="+251…"
                  />
                </label>
              </div>

              <label className="checkbox-field">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(event) => setConsent(event.target.checked)}
                />
                <span>
                  I allow {organization.name} to use the contact information
                  above to follow up about this submission.
                </span>
              </label>

              {error && (
                <div className="form-error" role="alert">
                  {error}
                </div>
              )}

              <div className="form-actions">
                <button
                  type="button"
                  className="button button-ghost"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="button button-brand"
                  disabled={submitting}
                >
                  {submitting ? "Submitting…" : "Submit privately"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
