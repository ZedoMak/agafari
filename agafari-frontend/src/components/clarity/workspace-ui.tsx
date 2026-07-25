"use client";

import type { ReactNode } from "react";

export function PageIntro({
  title,
  description,
  actions,
}: {
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <div className="c-section-head" style={{ marginBottom: 0 }}>
      <div>
        <h1 className="c-title-md">{title}</h1>
        <p className="c-muted c-small" style={{ marginTop: "0.4rem", maxWidth: "62ch" }}>
          {description}
        </p>
      </div>
      {actions && (
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>{actions}</div>
      )}
    </div>
  );
}

export function LoadingRows({ count = 4 }: { count?: number }) {
  return (
    <div className="c-panel" aria-busy="true" aria-label="Loading">
      <div className="c-panel-body" style={{ display: "grid", gap: "0.75rem" }}>
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className="c-skeleton"
            style={{ height: 18, width: `${100 - index * 9}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function ErrorPanel({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="c-empty" role="alert">
      <h3>That did not load</h3>
      <p>{message}</p>
      {onRetry && (
        <button className="c-button c-button-secondary c-button-sm" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyPanel({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="c-empty">
      <h3>{title}</h3>
      <p>{body}</p>
      {action}
    </div>
  );
}

const STATUS_TONE: Record<string, string> = {
  APPROVED: "c-badge-positive",
  READY: "c-badge-positive",
  RESOLVED: "c-badge-positive",
  ACTIONED: "c-badge-positive",
  PENDING: "c-badge-caution",
  PENDING_APPROVAL: "c-badge-caution",
  INDEXING: "c-badge-caution",
  REVIEWING: "c-badge-caution",
  NEW: "c-badge-brand",
  REJECTED: "c-badge-critical",
  FAILED: "c-badge-critical",
  CRITICAL: "c-badge-critical",
  HIGH: "c-badge-critical",
  MEDIUM: "c-badge-caution",
  LOW: "c-badge",
  DISMISSED: "c-badge",
  INTERNAL: "c-badge-caution",
  PUBLIC: "c-badge-brand",
};

export function StatusBadge({ value }: { value: string }) {
  const tone = STATUS_TONE[value] ?? "c-badge";
  return (
    <span className={`c-badge ${tone} c-badge-dot`}>
      {value.replace(/_/g, " ").toLowerCase()}
    </span>
  );
}

export function relativeTime(value: string) {
  const date = new Date(value.endsWith("Z") ? value : `${value}Z`);
  if (Number.isNaN(date.getTime())) return "";
  const diff = Date.now() - date.getTime();
  const minutes = Math.round(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function ApiGapNotice({
  endpoint,
  children,
}: {
  endpoint: string;
  children: ReactNode;
}) {
  return (
    <div className="c-alert c-alert-caution">
      <div>
        <strong>Not wired up yet</strong>
        <div style={{ marginTop: "0.25rem" }}>{children}</div>
        <code className="c-mono" style={{ display: "block", marginTop: "0.4rem" }}>
          {endpoint}
        </code>
      </div>
    </div>
  );
}
