"use client";

import Link from "next/link";
import { useState } from "react";
import { useSite } from "@/components/clarity/site-context";
import { useWorkspace } from "@/components/clarity/workspace-shell";
import {
  EmptyPanel,
  ErrorPanel,
  LoadingRows,
  PageIntro,
  StatusBadge,
  relativeTime,
} from "@/components/clarity/workspace-ui";
import { getDashboardSummary } from "@/lib/clarity/client";
import type { DashboardRange } from "@/lib/clarity/types";
import { useAsync } from "@/lib/clarity/use-async";

const RANGES: DashboardRange[] = ["7d", "30d", "90d"];

export default function OverviewPage() {
  const { token } = useWorkspace();
  const { href, organization } = useSite();
  const [range, setRange] = useState<DashboardRange>("30d");
  const summary = useAsync(() => getDashboardSummary(token, range), [token, range]);

  return (
    <>
      <PageIntro
        title="Overview"
        description={`How people are using ${organization.name}'s assistant, what they cannot get answered, and what needs attention.`}
        actions={
          <div className="c-tabs" role="tablist" aria-label="Date range">
            {RANGES.map((value) => (
              <button
                key={value}
                role="tab"
                aria-selected={range === value}
                onClick={() => setRange(value)}
              >
                {value === "7d" ? "7 days" : value === "30d" ? "30 days" : "90 days"}
              </button>
            ))}
          </div>
        }
      />

      {summary.loading && !summary.data ? (
        <LoadingRows count={3} />
      ) : summary.error ? (
        <ErrorPanel message={summary.error} onRetry={summary.reload} />
      ) : summary.data ? (
        <>
          <div className="c-stat-grid">
            <div className="c-stat">
              <dt>Answers given</dt>
              <dd>{summary.data.interactions.total}</dd>
              <span className="c-stat-foot">
                {summary.data.interactions.by_scope.public ?? 0} public ·{" "}
                {summary.data.interactions.by_scope.internal ?? 0} internal
              </span>
            </div>
            <div className="c-stat">
              <dt>Grounded answer rate</dt>
              <dd>{summary.data.interactions.answer_rate}%</dd>
              <div className="c-bar">
                <i style={{ width: `${summary.data.interactions.answer_rate}%` }} />
              </div>
              <span className="c-stat-foot">
                {summary.data.interactions.answered} of{" "}
                {summary.data.interactions.total} had approved sources
              </span>
            </div>
            <div className="c-stat">
              <dt>Open complaints</dt>
              <dd>{summary.data.open_complaints.total}</dd>
              <span className="c-stat-foot">
                {Object.entries(summary.data.open_complaints.by_severity)
                  .map(([severity, count]) => `${count} ${severity}`)
                  .join(" · ") || "Nothing outstanding"}
              </span>
            </div>
            <div className="c-stat">
              <dt>Knowledge indexed</dt>
              <dd>{summary.data.documents.ready ?? 0}</dd>
              <span className="c-stat-foot">
                {(summary.data.documents.pending_approval ?? 0) +
                  (summary.data.documents.pending ?? 0)}{" "}
                awaiting approval
              </span>
            </div>
          </div>

          <div className="c-two-col">
            <section className="c-panel">
              <div className="c-panel-head">
                <h3>What people keep raising</h3>
                <Link className="c-button c-button-ghost c-button-sm" href={href("/workspace/insights")}>
                  Insights
                </Link>
              </div>
              {summary.data.top_issue_clusters.length ? (
                <div className="c-list">
                  {summary.data.top_issue_clusters.map((cluster) => (
                    <div className="c-list-item" key={cluster.id}>
                      <div className="c-list-item-main">
                        <strong>{cluster.title}</strong>
                        <p>
                          {cluster.category.replace(/_/g, " ").toLowerCase()} ·{" "}
                          {cluster.source_kind.replace(/_/g, " ").toLowerCase()}
                        </p>
                      </div>
                      <div className="c-list-actions">
                        <span className="c-badge">{cluster.item_count} reports</span>
                        <span className="c-small c-muted">
                          {relativeTime(cluster.last_seen_at)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="c-panel-body">
                  <EmptyPanel
                    title="No patterns yet"
                    body="Once people ask questions or submit complaints, repeated themes are grouped here."
                  />
                </div>
              )}
            </section>

            <section className="c-panel">
              <div className="c-panel-head">
                <h3>Suggested actions</h3>
              </div>
              {summary.data.emerging_insights.length ? (
                <div className="c-list">
                  {summary.data.emerging_insights.map((insight) => (
                    <div className="c-list-item" key={insight.id}>
                      <div className="c-list-item-main">
                        <strong>{insight.title}</strong>
                        <p>{insight.summary}</p>
                      </div>
                      <div className="c-list-actions">
                        <StatusBadge value={insight.status} />
                        <span className="c-small c-muted">
                          {insight.confidence}% confidence
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="c-panel-body">
                  <EmptyPanel
                    title="Nothing to action"
                    body="Suggested actions appear when the assistant repeatedly cannot answer something, or complaints cluster."
                  />
                </div>
              )}
            </section>
          </div>
        </>
      ) : null}
    </>
  );
}
