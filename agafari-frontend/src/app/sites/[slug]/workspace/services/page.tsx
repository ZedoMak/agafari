"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useSite } from "@/components/clarity/site-context";
import {
  ApiGapNotice,
  EmptyPanel,
  ErrorPanel,
  LoadingRows,
  PageIntro,
  StatusBadge,
} from "@/components/clarity/workspace-ui";
import { getOrganizationServices } from "@/lib/api";
import { SERVICE_WRITE_API, saveService } from "@/lib/clarity/client";
import type { ServiceDraft } from "@/lib/clarity/types";
import { useAsync } from "@/lib/clarity/use-async";
import type { Service } from "@/lib/types";

const EMPTY_DRAFT: ServiceDraft = {
  title: "",
  category: "",
  summary: "",
  processing_time: "",
  published: true,
};

export default function ServicesBuilderPage() {
  const { organization, terminology, href } = useSite();
  const services = useAsync(
    () => getOrganizationServices(organization.slug),
    [organization.slug],
  );
  const [editing, setEditing] = useState<Service | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <>
      <PageIntro
        title={terminology.plural}
        description={`What ${organization.name} publishes on the public site. Each ${terminology.singularLower} gets its own page and its own grounded assistant.`}
        actions={
          <button
            className="c-button c-button-primary"
            onClick={() => {
              setEditing(null);
              setCreating(true);
            }}
          >
            New {terminology.singularLower}
          </button>
        }
      />

      {!SERVICE_WRITE_API && (
        <ApiGapNotice endpoint="POST /api/v1/admin/services · PATCH /api/v1/admin/services/{id}">
          The builder below is complete and typed, but the API has no write
          endpoint for {terminology.pluralLower} yet, so saving is disabled. You
          can still draft and copy the payload.
        </ApiGapNotice>
      )}

      {services.loading && !services.data ? (
        <LoadingRows count={3} />
      ) : services.error ? (
        <ErrorPanel message={services.error} onRetry={services.reload} />
      ) : (services.data ?? []).length === 0 ? (
        <EmptyPanel
          title={`No published ${terminology.pluralLower}`}
          body={`Once ${terminology.pluralLower} exist they appear here and on the public site, each with its own assistant.`}
        />
      ) : (
        <div className="c-panel">
          <div className="c-list">
            {(services.data ?? []).map((service) => (
              <div className="c-list-item" key={service.id}>
                <div className="c-list-item-main">
                  <strong>{service.title}</strong>
                  <p>{service.summary}</p>
                  <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                    <span className="c-badge c-badge-brand">{service.category}</span>
                    <StatusBadge value={service.verification_status} />
                    <span className="c-badge">{service.processing_time}</span>
                  </div>
                </div>
                <div className="c-list-actions">
                  <a
                    className="c-button c-button-ghost c-button-sm"
                    href={href(`/services/${service.slug}`)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View live
                  </a>
                  <button
                    className="c-button c-button-secondary c-button-sm"
                    onClick={() => {
                      setCreating(false);
                      setEditing(service);
                    }}
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(creating || editing) && (
        <ServiceDialog
          label={terminology.singular}
          service={editing}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
        />
      )}
    </>
  );
}

function ServiceDialog({
  label,
  service,
  onClose,
}: {
  label: string;
  service: Service | null;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<ServiceDraft>(
    service
      ? {
          title: service.title,
          category: service.category,
          summary: service.summary,
          processing_time: service.processing_time,
          published: true,
        }
      : EMPTY_DRAFT,
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [onClose]);

  function update<K extends keyof ServiceDraft>(key: K, value: ServiceDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    try {
      await saveService("", draft, service?.id);
      onClose();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Saving is not available yet.",
      );
    }
  }

  async function copyDraft() {
    try {
      await navigator.clipboard.writeText(JSON.stringify(draft, null, 2));
      setMessage("Draft copied to your clipboard as JSON.");
    } catch {
      setMessage("Your browser blocked clipboard access.");
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
        aria-labelledby="service-dialog-title"
        onSubmit={handleSubmit}
      >
        <div className="c-dialog-head">
          <div>
            <h2 id="service-dialog-title">
              {service ? `Edit ${label.toLowerCase()}` : `New ${label.toLowerCase()}`}
            </h2>
            <p>
              This is what people see first, and what the assistant uses to frame
              its answers.
            </p>
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
              value={draft.title}
              onChange={(event) => update("title", event.target.value)}
              placeholder="Community livelihood grant"
              required
            />
          </label>

          <div className="c-form-grid">
            <label className="c-field">
              <span>Category</span>
              <input
                className="c-input"
                value={draft.category}
                onChange={(event) => update("category", event.target.value)}
                placeholder="Livelihoods"
                required
              />
            </label>
            <label className="c-field">
              <span>Timeline</span>
              <input
                className="c-input"
                value={draft.processing_time}
                onChange={(event) => update("processing_time", event.target.value)}
                placeholder="Reviewed within 20 working days"
                required
              />
            </label>
          </div>

          <label className="c-field">
            <span>Summary</span>
            <textarea
              className="c-textarea"
              value={draft.summary}
              onChange={(event) => update("summary", event.target.value)}
              placeholder="Who it is for, what it provides, and how to start."
              required
            />
            <small className="c-field-help">
              Two or three plain sentences work best. Detail belongs in documents.
            </small>
          </label>

          <label className="c-checkbox">
            <input
              type="checkbox"
              checked={draft.published}
              onChange={(event) => update("published", event.target.checked)}
            />
            <span>Publish on the public site as soon as it is saved</span>
          </label>

          {!SERVICE_WRITE_API && (
            <ApiGapNotice endpoint="POST /api/v1/admin/services">
              Saving is disabled until the API exposes a write endpoint. Copy the
              draft to keep it.
            </ApiGapNotice>
          )}

          {message && (
            <div className="c-alert" role="status">
              <div>{message}</div>
            </div>
          )}

          <div className="c-form-actions">
            <button type="button" className="c-button c-button-ghost" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="c-button c-button-secondary"
              onClick={() => void copyDraft()}
            >
              Copy draft
            </button>
            <button
              type="submit"
              className="c-button c-button-primary"
              disabled={!SERVICE_WRITE_API}
              title={
                SERVICE_WRITE_API ? undefined : "The service write API is not available yet"
              }
            >
              Save
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
