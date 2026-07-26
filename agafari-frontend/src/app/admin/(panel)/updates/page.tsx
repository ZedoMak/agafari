"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useAdmin } from "@/components/admin/admin-shell";
import { useSite } from "@/components/clarity/site-context";
import {
  EmptyPanel,
  ErrorPanel,
  LoadingRows,
  PageIntro,
} from "@/components/clarity/workspace-ui";
import {
  createAnnouncement,
  listAdminServices,
  listChangeLogs,
  publishChangeLog,
  rejectChangeLog,
  unpublishChangeLog,
} from "@/lib/clarity/client";
import type { ChangeLogRecord } from "@/lib/admin/types";
import { useAsync } from "@/lib/clarity/use-async";

function formatDate(value: string | null) {
  if (!value) return null;
  const date = new Date(value.endsWith("Z") ? value : `${value}Z`);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function UpdatesPage() {
  const { token } = useAdmin();
  const { organization, href } = useSite();
  const logs = useAsync(() => listChangeLogs(token, "ALL"), [token]);
  const services = useAsync(() => listAdminServices(token).catch(() => []), [token]);
  const [composing, setComposing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const all = logs.data ?? [];
  const pending = all.filter((log) => !log.published_at && log.status !== "REJECTED");
  const published = all.filter((log) => log.published_at);
  const dismissed = all.filter((log) => log.status === "REJECTED");

  return (
    <>
      <PageIntro
        title="Updates"
        description={`When a rule, fee, or procedure changes, publish a notice here and every visitor to ${organization.name} sees it. Changes spotted in newly approved documents show up for review automatically.`}
        actions={
          <div className="admin-actions">
            <Link
              className="c-button c-button-ghost"
              href={href("/updates")}
              target="_blank"
              rel="noreferrer"
            >
              View public page
            </Link>
            <button
              className="c-button c-button-primary"
              onClick={() => setComposing(true)}
            >
              Write an announcement
            </button>
          </div>
        }
      />

      {notice && (
        <div className="c-alert" role="status">
          <div>{notice}</div>
        </div>
      )}

      {logs.loading && !logs.data ? (
        <LoadingRows count={3} />
      ) : logs.error ? (
        <ErrorPanel message={logs.error} onRetry={logs.reload} />
      ) : (
        <>
          <section className="c-panel">
            <div className="c-panel-head">
              <h3>Waiting for you</h3>
              <span className="c-small c-muted">{pending.length}</span>
            </div>
            <div className="c-panel-body">
              {pending.length === 0 ? (
                <EmptyPanel
                  title="Nothing waiting"
                  body="When you approve a document that contradicts what is published, the difference appears here before anyone sees it."
                />
              ) : (
                <div className="admin-timeline">
                  {pending.map((log) => (
                    <PendingUpdate
                      key={log.id}
                      log={log}
                      onPublish={async (payload) => {
                        await publishChangeLog(token, log.id, payload);
                        await logs.reload();
                        setNotice("Notice published to your public site.");
                      }}
                      onDismiss={async () => {
                        await rejectChangeLog(token, log.id);
                        await logs.reload();
                        setNotice("Dismissed. Nothing was published.");
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="c-panel">
            <div className="c-panel-head">
              <h3>Published</h3>
              <span className="c-small c-muted">{published.length}</span>
            </div>
            <div className="c-panel-body">
              {published.length === 0 ? (
                <EmptyPanel
                  title="Nothing published yet"
                  body="Published notices appear on your public updates page, newest first."
                />
              ) : (
                <div className="admin-timeline">
                  {published.map((log) => (
                    <article className="admin-update" data-status="PUBLISHED" key={log.id}>
                      <div className="admin-update-head">
                        <h3>{log.title || log.source_title}</h3>
                        <span className="c-badge">
                          {log.origin === "MANUAL" ? "Announcement" : "Policy change"}
                        </span>
                        <span className="c-small c-muted">
                          {formatDate(log.published_at)}
                        </span>
                      </div>
                      <p className="admin-update-body">
                        {log.public_notice || log.ai_change_summary}
                      </p>
                      <div className="admin-service-meta">
                        {log.service_title && <span>{log.service_title}</span>}
                        {log.effective_date && (
                          <span>Effective {formatDate(log.effective_date)}</span>
                        )}
                      </div>
                      <div className="admin-service-actions">
                        <button
                          className="c-button c-button-ghost c-button-sm"
                          onClick={async () => {
                            await unpublishChangeLog(token, log.id);
                            await logs.reload();
                            setNotice("Removed from the public updates page.");
                          }}
                        >
                          Unpublish
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>

          {dismissed.length > 0 && (
            <details className="c-panel">
              <summary className="c-panel-head" style={{ cursor: "pointer" }}>
                <h3>Dismissed ({dismissed.length})</h3>
              </summary>
              <div className="c-panel-body admin-timeline">
                {dismissed.map((log) => (
                  <article className="admin-update" key={log.id}>
                    <div className="admin-update-head">
                      <h3>{log.title || log.source_title}</h3>
                      <span className="c-small c-muted">{formatDate(log.detected_at)}</span>
                    </div>
                    <p className="admin-update-body">{log.ai_change_summary}</p>
                  </article>
                ))}
              </div>
            </details>
          )}
        </>
      )}

      {composing && (
        <AnnouncementDialog
          services={(services.data ?? []).map((item) => ({
            id: item.id,
            title: item.title,
          }))}
          onClose={() => setComposing(false)}
          onSubmit={async (payload) => {
            await createAnnouncement(token, payload);
            await logs.reload();
            setComposing(false);
            setNotice("Announcement published.");
          }}
        />
      )}
    </>
  );
}

function PendingUpdate({
  log,
  onPublish,
  onDismiss,
}: {
  log: ChangeLogRecord;
  onPublish: (payload: {
    title: string;
    public_notice: string;
    effective_date: string | null;
  }) => Promise<void>;
  onDismiss: () => Promise<void>;
}) {
  const [title, setTitle] = useState(log.title || `Update to ${log.service_title ?? "our information"}`);
  const [publicNotice, setPublicNotice] = useState(
    log.public_notice || log.ai_change_summary,
  );
  const [effectiveDate, setEffectiveDate] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function act(action: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "That did not work.");
      setBusy(false);
    }
  }

  const before = log.old_data_snapshot;
  const after = log.new_data_snapshot;

  return (
    <article className="admin-update" data-status="PENDING">
      <div className="admin-update-head">
        <h3>{log.source_title}</h3>
        <span className="c-badge">
          {log.origin === "MANUAL" ? "Draft announcement" : "Detected in a document"}
        </span>
        {log.service_title && <span className="c-badge">{log.service_title}</span>}
      </div>

      <p className="admin-update-body">{log.ai_change_summary}</p>

      {before && after && Object.keys(before).length > 0 && (
        <div className="admin-diff">
          <div>
            <b>Currently published</b>
            {Object.entries(before).map(([key, value]) => (
              <div key={key}>
                {key.replace(/_/g, " ")}: {String(value)}
              </div>
            ))}
          </div>
          <div>
            <b>In the new document</b>
            {Object.entries(after).map(([key, value]) => (
              <div key={key}>
                {key.replace(/_/g, " ")}: {String(value)}
              </div>
            ))}
          </div>
        </div>
      )}

      <label className="c-field">
        <span>Notice title</span>
        <input
          className="c-input"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </label>

      <label className="c-field">
        <span>What visitors will read</span>
        <textarea
          className="c-textarea"
          value={publicNotice}
          onChange={(event) => setPublicNotice(event.target.value)}
        />
        <small className="c-field-help">
          Write it for someone who has never read the document. Nothing is
          published until you press publish.
        </small>
      </label>

      <label className="c-field">
        <span>Effective from (optional)</span>
        <input
          className="c-input"
          type="date"
          value={effectiveDate}
          onChange={(event) => setEffectiveDate(event.target.value)}
        />
      </label>

      {error && (
        <div className="c-alert" role="alert">
          <div>{error}</div>
        </div>
      )}

      <div className="admin-service-actions">
        <button
          className="c-button c-button-ghost c-button-sm"
          disabled={busy}
          onClick={() => void act(onDismiss)}
        >
          Dismiss
        </button>
        <button
          className="c-button c-button-primary c-button-sm"
          disabled={busy || !publicNotice.trim()}
          onClick={() =>
            void act(() =>
              onPublish({
                title: title.trim(),
                public_notice: publicNotice.trim(),
                effective_date: effectiveDate || null,
              }),
            )
          }
        >
          {busy ? "Publishing…" : "Publish notice"}
        </button>
      </div>
    </article>
  );
}

function AnnouncementDialog({
  services,
  onClose,
  onSubmit,
}: {
  services: { id: string; title: string }[];
  onClose: () => void;
  onSubmit: (payload: {
    title: string;
    public_notice: string;
    service_id: string | null;
    effective_date: string | null;
    publish: boolean;
  }) => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [publicNotice, setPublicNotice] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await onSubmit({
        title: title.trim(),
        public_notice: publicNotice.trim(),
        service_id: serviceId || null,
        effective_date: effectiveDate || null,
        publish: true,
      });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "We could not publish that.");
      setBusy(false);
    }
  }

  return (
    <div
      className="c-dialog-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <form
        className="c-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="announcement-title"
        onSubmit={handleSubmit}
      >
        <div className="c-dialog-head">
          <div>
            <h2 id="announcement-title">Write an announcement</h2>
            <p>This appears on your public updates page as soon as you publish.</p>
          </div>
          <button
            type="button"
            className="c-dialog-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="c-dialog-body">
          <label className="c-field">
            <span>Title</span>
            <input
              className="c-input"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Registration now closes at 15:00"
              required
            />
          </label>

          <label className="c-field">
            <span>Notice</span>
            <textarea
              className="c-textarea"
              value={publicNotice}
              onChange={(event) => setPublicNotice(event.target.value)}
              placeholder="From 1 April, same-day registration closes at 15:00 instead of 16:30."
              required
            />
          </label>

          <div className="c-form-grid">
            <label className="c-field">
              <span>Related service (optional)</span>
              <select
                className="c-select"
                value={serviceId}
                onChange={(event) => setServiceId(event.target.value)}
              >
                <option value="">Not specific to one</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="c-field">
              <span>Effective from (optional)</span>
              <input
                className="c-input"
                type="date"
                value={effectiveDate}
                onChange={(event) => setEffectiveDate(event.target.value)}
              />
            </label>
          </div>

          {error && (
            <div className="c-alert" role="alert">
              <div>{error}</div>
            </div>
          )}

          <div className="c-form-actions">
            <button type="button" className="c-button c-button-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="c-button c-button-primary" disabled={busy}>
              {busy ? "Publishing…" : "Publish"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
