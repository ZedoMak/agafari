"use client";

import { useState } from "react";
import { useAdmin } from "@/components/admin/admin-shell";
import {
  EmptyPanel,
  ErrorPanel,
  LoadingRows,
  PageIntro,
  StatusBadge,
  relativeTime,
} from "@/components/clarity/workspace-ui";
import { listInsights, updateInsight } from "@/lib/clarity/client";
import type { Insight, WorkItemStatus } from "@/lib/clarity/types";
import { useAsync } from "@/lib/clarity/use-async";

const STATUSES: WorkItemStatus[] = [
  "NEW",
  "REVIEWING",
  "ACTIONED",
  "RESOLVED",
  "DISMISSED",
];

export default function InsightsPage() {
  const { token } = useAdmin();
  const [filter, setFilter] = useState<WorkItemStatus | "ALL">("ALL");
  const insights = useAsync(
    () => listInsights(token, filter === "ALL" ? undefined : filter),
    [token, filter],
  );

  return (
    <>
      <PageIntro
        title="Insights"
        description="Patterns the system found across unanswered questions and complaints, with a suggested next step for each."
        actions={
          <div className="c-tabs" role="tablist" aria-label="Insight status">
            {(["ALL", ...STATUSES] as const).map((value) => (
              <button
                key={value}
                role="tab"
                aria-selected={filter === value}
                onClick={() => setFilter(value)}
              >
                {value === "ALL" ? "All" : value.toLowerCase()}
              </button>
            ))}
          </div>
        }
      />

      {insights.loading && !insights.data ? (
        <LoadingRows count={3} />
      ) : insights.error ? (
        <ErrorPanel message={insights.error} onRetry={insights.reload} />
      ) : (insights.data ?? []).length === 0 ? (
        <EmptyPanel
          title="Nothing here yet"
          body="Insights appear when the same gap or complaint shows up repeatedly. Keep the assistant running and check back."
        />
      ) : (
        <div style={{ display: "grid", gap: "0.75rem" }}>
          {(insights.data ?? []).map((insight) => (
            <InsightCard
              key={insight.id}
              insight={insight}
              token={token}
              onSaved={insights.reload}
            />
          ))}
        </div>
      )}
    </>
  );
}

function InsightCard({
  insight,
  token,
  onSaved,
}: {
  insight: Insight;
  token: string;
  onSaved: () => void;
}) {
  const [status, setStatus] = useState<WorkItemStatus>(insight.status);
  const [owner, setOwner] = useState(insight.owner ?? "");
  const [note, setNote] = useState(insight.resolution_note ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const dirty =
    status !== insight.status ||
    owner !== (insight.owner ?? "") ||
    note !== (insight.resolution_note ?? "");

  async function save() {
    setSaving(true);
    setError("");
    try {
      await updateInsight(token, insight.id, {
        status,
        owner: owner || null,
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
    <details className="c-panel">
      <summary
        style={{
          display: "flex",
          gap: "1rem",
          alignItems: "flex-start",
          padding: "1rem 1.25rem",
          cursor: "pointer",
        }}
      >
        <span className="c-list-item-main">
          <strong>{insight.title}</strong>
          <p>{insight.summary}</p>
        </span>
        <span className="c-list-actions">
          <StatusBadge value={insight.status} />
          <span className="c-small c-muted">{insight.confidence}%</span>
        </span>
      </summary>

      <div
        className="c-panel-body"
        style={{ borderTop: "1px solid var(--c-line)", display: "grid", gap: "1rem" }}
      >
        <div>
          <span className="c-label">Recommended action</span>
          <p className="c-small" style={{ marginTop: "0.3rem" }}>
            {insight.recommendation}
          </p>
        </div>

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
            <span>Owner</span>
            <input
              className="c-input"
              value={owner}
              onChange={(event) => setOwner(event.target.value)}
              placeholder="Who is picking this up?"
              maxLength={120}
            />
          </label>
        </div>

        <label className="c-field">
          <span>Note</span>
          <textarea
            className="c-textarea"
            style={{ minHeight: 80 }}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="What was decided or changed."
          />
        </label>

        {error && (
          <div className="c-form-error" role="alert">
            {error}
          </div>
        )}

        <div className="c-form-actions">
          <span className="c-small c-muted" style={{ marginRight: "auto" }}>
            Raised {relativeTime(insight.created_at)}
          </span>
          <button
            className="c-button c-button-primary c-button-sm"
            onClick={() => void save()}
            disabled={!dirty || saving}
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </details>
  );
}
