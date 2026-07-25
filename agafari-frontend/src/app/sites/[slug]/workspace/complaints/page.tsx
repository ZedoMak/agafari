"use client";

import { useState } from "react";
import { useWorkspace } from "@/components/clarity/workspace-shell";
import {
  EmptyPanel,
  ErrorPanel,
  LoadingRows,
  PageIntro,
  StatusBadge,
  relativeTime,
} from "@/components/clarity/workspace-ui";
import { listComplaints, updateComplaint } from "@/lib/clarity/client";
import type { ComplaintRecord, WorkItemStatus } from "@/lib/clarity/types";
import { useAsync } from "@/lib/clarity/use-async";

const STATUSES: WorkItemStatus[] = [
  "NEW",
  "REVIEWING",
  "ACTIONED",
  "RESOLVED",
  "DISMISSED",
];
const SEVERITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;

export default function ComplaintsPage() {
  const { token } = useWorkspace();
  const [status, setStatus] = useState<WorkItemStatus | "ALL">("ALL");
  const [severity, setSeverity] = useState<string>("ALL");
  const complaints = useAsync(
    () =>
      listComplaints(token, {
        status: status === "ALL" ? undefined : status,
        severity: severity === "ALL" ? undefined : severity,
      }),
    [token, status, severity],
  );

  return (
    <>
      <PageIntro
        title="Complaints"
        description="Private submissions from your website. They are never added to the assistant's knowledge, and only this workspace can read them."
        actions={
          <div className="c-tabs" role="tablist" aria-label="Complaint status">
            {(["ALL", ...STATUSES] as const).map((value) => (
              <button
                key={value}
                role="tab"
                aria-selected={status === value}
                onClick={() => setStatus(value)}
              >
                {value === "ALL" ? "All" : value.toLowerCase()}
              </button>
            ))}
          </div>
        }
      />

      <div className="c-filter-bar">
        {(["ALL", ...SEVERITIES] as const).map((value) => (
          <button
            key={value}
            className="c-chip"
            data-active={severity === value}
            aria-pressed={severity === value}
            onClick={() => setSeverity(value)}
          >
            {value === "ALL" ? "Any severity" : value.toLowerCase()}
          </button>
        ))}
      </div>

      {complaints.loading && !complaints.data ? (
        <LoadingRows count={3} />
      ) : complaints.error ? (
        <ErrorPanel message={complaints.error} onRetry={complaints.reload} />
      ) : (complaints.data ?? []).length === 0 ? (
        <EmptyPanel
          title="No complaints in this view"
          body="Nothing matches these filters. Submissions from the public site show up here immediately."
        />
      ) : (
        <div style={{ display: "grid", gap: "0.75rem" }}>
          {(complaints.data ?? []).map((complaint) => (
            <ComplaintCard
              key={complaint.id}
              complaint={complaint}
              token={token}
              onSaved={complaints.reload}
            />
          ))}
        </div>
      )}
    </>
  );
}

function ComplaintCard({
  complaint,
  token,
  onSaved,
}: {
  complaint: ComplaintRecord;
  token: string;
  onSaved: () => void;
}) {
  const [status, setStatus] = useState<WorkItemStatus>(complaint.status);
  const [note, setNote] = useState(complaint.resolution_note ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const dirty =
    status !== complaint.status || note !== (complaint.resolution_note ?? "");

  async function save() {
    setSaving(true);
    setError("");
    try {
      await updateComplaint(token, complaint.id, {
        status,
        resolution_note: note || null,
      });
      onSaved();
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Could not save.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <article className="c-panel">
      <div className="c-panel-head">
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
          <StatusBadge value={complaint.severity} />
          <span className="c-badge">
            {complaint.category.replace(/_/g, " ").toLowerCase()}
          </span>
          <StatusBadge value={complaint.status} />
        </div>
        <span className="c-small c-muted">{relativeTime(complaint.created_at)}</span>
      </div>

      <div className="c-panel-body" style={{ display: "grid", gap: "1rem" }}>
        <p style={{ fontSize: "0.9375rem" }}>{complaint.description}</p>

        {complaint.contact && (complaint.contact.email || complaint.contact.phone) && (
          <div className="c-small c-muted">
            {complaint.consent_to_contact
              ? "Consented to follow-up: "
              : "No consent to contact — do not reach out: "}
            {[complaint.contact.email, complaint.contact.phone]
              .filter(Boolean)
              .join(" · ")}
          </div>
        )}

        <div className="c-form-grid">
          <label className="c-field">
            <span>Status</span>
            <select
              className="c-select"
              value={status}
              onChange={(event) => setStatus(event.target.value as WorkItemStatus)}
            >
              {STATUSES.map((value) => (
                <option key={value} value={value}>
                  {value.toLowerCase()}
                </option>
              ))}
            </select>
          </label>
          <label className="c-field">
            <span>Resolution note</span>
            <input
              className="c-input"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="What was done about it"
              maxLength={5000}
            />
          </label>
        </div>

        {error && (
          <div className="c-form-error" role="alert">
            {error}
          </div>
        )}

        <div className="c-form-actions">
          <button
            className="c-button c-button-primary c-button-sm"
            onClick={() => void save()}
            disabled={!dirty || saving}
          >
            {saving ? "Saving…" : "Update"}
          </button>
        </div>
      </div>
    </article>
  );
}
