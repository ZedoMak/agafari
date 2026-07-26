"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useAdmin } from "@/components/admin/admin-shell";
import { useSite } from "@/components/clarity/site-context";
import {
  EmptyPanel,
  ErrorPanel,
  LoadingRows,
  PageIntro,
  StatusBadge,
  relativeTime,
} from "@/components/clarity/workspace-ui";
import {
  getDashboardSummary,
  listChangeLogs,
  listConversations,
} from "@/lib/clarity/client";
import type { DashboardRange } from "@/lib/clarity/types";
import { useAsync } from "@/lib/clarity/use-async";

const RANGES: DashboardRange[] = ["7d", "30d", "90d"];
const RANGE_DAYS: Record<DashboardRange, number> = { "7d": 7, "30d": 30, "90d": 90 };

function startOfDay(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime();
}

/** Daily question counts derived from conversation timestamps. */
function useActivity(timestamps: string[], range: DashboardRange) {
  return useMemo(() => {
    const days = RANGE_DAYS[range];
    const today = startOfDay(new Date());
    const buckets = new Array<number>(days).fill(0);

    for (const stamp of timestamps) {
      const parsed = Date.parse(stamp.endsWith("Z") ? stamp : `${stamp}Z`);
      if (!Number.isFinite(parsed)) continue;
      const offset = Math.round((today - startOfDay(new Date(parsed))) / 86_400_000);
      if (offset >= 0 && offset < days) buckets[days - 1 - offset] += 1;
    }

    return { buckets, peak: Math.max(1, ...buckets), total: buckets.reduce((a, b) => a + b, 0) };
  }, [timestamps, range]);
}

export default function OverviewPage() {
  const { token } = useAdmin();
  const { organization, terminology } = useSite();
  const [range, setRange] = useState<DashboardRange>("30d");

  const summary = useAsync(() => getDashboardSummary(token, range), [token, range]);
  const conversations = useAsync(() => listConversations(token), [token]);
  const changeLogs = useAsync(() => listChangeLogs(token, "ALL").catch(() => []), [token]);

  const activity = useActivity(
    useMemo(
      () => (conversations.data ?? []).map((item) => item.updated_at),
      [conversations.data],
    ),
    range,
  );

  const pendingUpdates = (changeLogs.data ?? []).filter(
    (log) => log.status === "PENDING",
  ).length;
  const publishedUpdates = (changeLogs.data ?? []).filter(
    (log) => log.published_at,
  ).length;

  const documents = summary.data?.documents;
  // Text-only documents are searchable without embeddings, so they still answer.
  const ready = (documents?.ready ?? 0) + (documents?.ready_text_only ?? 0);
  const waiting = (documents?.pending_approval ?? 0) + (documents?.pending ?? 0);
  const failed = documents?.failed ?? 0;
  const totalDocuments = Math.max(1, ready + waiting + failed);
  const readyShare = Math.round((ready / totalDocuments) * 100);

  return (
    <>
      <PageIntro
        title={`Managing ${organization.name}`}
        description={`Everything your visitors can be told, and everything they asked for that you could not answer.`}
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

      <div className="admin-quick">
        <Link href="/admin/services">
          <b>Publish a {terminology.singularLower}</b>
          <span>Describe the steps, documents, and fees.</span>
        </Link>
        <Link href="/admin/documents">
          <b>Add knowledge</b>
          <span>Upload a document and approve what the assistant may use.</span>
        </Link>
        <Link href="/admin/updates">
          <b>Announce a change</b>
          <span>
            {pendingUpdates > 0
              ? `${pendingUpdates} detected change${pendingUpdates === 1 ? "" : "s"} to review`
              : "Tell visitors about a new rule or policy."}
          </span>
        </Link>
        <Link href="/admin/assistant">
          <b>Ask the staff assistant</b>
          <span>Search internal policies and SOPs.</span>
        </Link>
      </div>

      {summary.loading && !summary.data ? (
        <LoadingRows count={3} />
      ) : summary.error ? (
        <ErrorPanel message={summary.error} onRetry={summary.reload} />
      ) : summary.data ? (
        <>
          <div className="c-stat-grid">
            <div className="c-stat">
              <dt>Questions answered</dt>
              <dd>{summary.data.interactions.total}</dd>
              <span className="c-stat-foot">
                {summary.data.interactions.by_scope.public ?? 0} from visitors ·{" "}
                {summary.data.interactions.by_scope.internal ?? 0} from staff
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
                {summary.data.interactions.total} answers cited an approved document
              </span>
            </div>
            <div className="c-stat">
              <dt>Open complaints</dt>
              <dd>{summary.data.open_complaints.total}</dd>
              <span className="c-stat-foot">
                {Object.entries(summary.data.open_complaints.by_severity)
                  .map(([severity, count]) => `${count} ${severity.toLowerCase()}`)
                  .join(" · ") || "Nothing outstanding"}
              </span>
            </div>
            <div className="c-stat">
              <dt>Published updates</dt>
              <dd>{publishedUpdates}</dd>
              <span className="c-stat-foot">
                {pendingUpdates > 0
                  ? `${pendingUpdates} waiting for your review`
                  : "No changes waiting"}
              </span>
            </div>
          </div>

          <div className="c-two-col">
            <section className="c-panel">
              <div className="c-panel-head">
                <h3>Questions per day</h3>
                <span className="c-small c-muted">{activity.total} in this period</span>
              </div>
              <div className="c-panel-body">
                {conversations.loading && !conversations.data ? (
                  <LoadingRows count={1} />
                ) : activity.total === 0 ? (
                  <EmptyPanel
                    title="No questions yet"
                    body="Once visitors start using the assistant, the daily volume appears here."
                  />
                ) : (
                  <>
                    <div className="admin-trend" role="img" aria-label="Questions per day">
                      {activity.buckets.map((count, index) => (
                        <span
                          key={index}
                          data-strong={count > 0}
                          style={{
                            height: `${Math.max(3, (count / activity.peak) * 100)}%`,
                          }}
                          title={`${count} on day ${index + 1}`}
                        />
                      ))}
                    </div>
                    <div className="admin-trend-axis">
                      <span>{RANGE_DAYS[range]} days ago</span>
                      <span>Today</span>
                    </div>
                  </>
                )}
              </div>
            </section>

            <section className="c-panel">
              <div className="c-panel-head">
                <h3>Knowledge health</h3>
                <Link className="c-button c-button-ghost c-button-sm" href="/admin/documents">
                  Manage
                </Link>
              </div>
              <div className="c-panel-body">
                <div className="admin-donut">
                  <div
                    className="admin-donut-ring"
                    style={{
                      background: `conic-gradient(var(--c-brand-500) ${readyShare}%, var(--c-surface-inset) 0)`,
                    }}
                  >
                    <i>{readyShare}%</i>
                  </div>
                  <div className="admin-legend">
                    <span>
                      <i style={{ background: "var(--c-brand-500)" }} />
                      {ready} answerable
                    </span>
                    <span>
                      <i style={{ background: "var(--c-surface-inset)" }} />
                      {waiting} waiting for approval
                    </span>
                    {failed > 0 && (
                      <span>
                        <i style={{ background: "#dc2626" }} />
                        {failed} failed to index
                      </span>
                    )}
                  </div>
                </div>
                {waiting > 0 && (
                  <p className="admin-note" style={{ marginTop: "0.9rem" }}>
                    Documents only reach the assistant once you approve them. Nothing
                    unapproved is ever used in an answer.
                  </p>
                )}
              </div>
            </section>
          </div>

          <div className="c-two-col">
            <section className="c-panel">
              <div className="c-panel-head">
                <h3>What people keep raising</h3>
                <Link className="c-button c-button-ghost c-button-sm" href="/admin/insights">
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
