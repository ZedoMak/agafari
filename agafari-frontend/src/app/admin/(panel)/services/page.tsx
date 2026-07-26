"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useAdmin } from "@/components/admin/admin-shell";
import { useSite } from "@/components/clarity/site-context";
import {
  EmptyPanel,
  ErrorPanel,
  LoadingRows,
  PageIntro,
  StatusBadge,
} from "@/components/clarity/workspace-ui";
import {
  createService,
  deleteService,
  listAdminServices,
  summarizeService,
  updateService,
} from "@/lib/clarity/client";
import type {
  AdminService,
  RequirementInput,
  ServiceInput,
} from "@/lib/admin/types";
import { useAsync } from "@/lib/clarity/use-async";

type DraftState = ServiceInput & {
  procedure_steps: string[];
  requirements: RequirementInput[];
};

function draftFrom(service: AdminService | null): DraftState {
  return {
    title: service?.title ?? "",
    category: service?.category ?? "",
    summary: service?.summary ?? "",
    processing_time: service?.processing_time ?? "",
    fee_etb: service?.fee_etb ?? 0,
    is_published: service?.is_published ?? true,
    procedure_steps: service?.procedure_steps ?? [],
    requirements:
      service?.requirements.map((item) => ({
        title: item.title,
        description: item.description ?? "",
        is_mandatory: item.is_mandatory,
      })) ?? [],
  };
}

export default function ServicesPage() {
  const { token } = useAdmin();
  const { organization, terminology, href } = useSite();
  const services = useAsync(() => listAdminServices(token), [token]);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<AdminService | null>(null);
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const visible = useMemo(() => {
    const list = services.data ?? [];
    const needle = query.trim().toLowerCase();
    if (!needle) return list;
    return list.filter((service) =>
      [service.title, service.category, service.summary]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }, [services.data, query]);

  async function run(id: string, action: () => Promise<unknown>, message: string) {
    setBusyId(id);
    setNotice(null);
    try {
      await action();
      await services.reload();
      setNotice(message);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "That did not work.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <PageIntro
        title={terminology.plural}
        description={`Everything ${organization.name} offers. Each one gets a public page with its steps, requirements, and an assistant that answers from your approved documents.`}
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

      {notice && (
        <div className="c-alert" role="status">
          <div>{notice}</div>
        </div>
      )}

      <div className="admin-toolbar">
        <input
          className="c-input"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={`Search ${terminology.pluralLower}`}
          aria-label={`Search ${terminology.pluralLower}`}
        />
        <span className="c-small c-muted">
          {visible.length} of {(services.data ?? []).length}
        </span>
      </div>

      {services.loading && !services.data ? (
        <LoadingRows count={3} />
      ) : services.error ? (
        <ErrorPanel message={services.error} onRetry={services.reload} />
      ) : visible.length === 0 ? (
        <EmptyPanel
          title={`No ${terminology.pluralLower} yet`}
          body={`Add the first one and it appears on your public site straight away, with its own page and assistant.`}
        />
      ) : (
        <div>
          {visible.map((service) => (
            <article className="admin-service" key={service.id}>
              <div className="admin-service-main">
                <div className="admin-service-title">
                  <h3>{service.title}</h3>
                  <span className="c-badge c-badge-brand">{service.category}</span>
                  <StatusBadge value={service.verification_status} />
                  {!service.is_published && <span className="c-badge">Hidden</span>}
                </div>
                <p className="c-small" style={{ color: "var(--c-ink-soft)" }}>
                  {service.summary}
                </p>
                {service.procedure_steps && service.procedure_steps.length > 0 && (
                  <ol className="admin-steps">
                    {service.procedure_steps.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ol>
                )}
                <div className="admin-service-meta">
                  <span>{service.processing_time}</span>
                  <span>
                    {service.fee_etb > 0 ? `${service.fee_etb} ETB` : "Free of charge"}
                  </span>
                  <span>{service.requirements.length} requirements</span>
                  <span>{service.document_count} linked documents</span>
                </div>
              </div>

              <div className="admin-service-actions">
                <a
                  className="c-button c-button-ghost c-button-sm"
                  href={href(`/services/${service.slug}`)}
                  target="_blank"
                  rel="noreferrer"
                >
                  View live
                </a>
                <button
                  className="c-button c-button-ghost c-button-sm"
                  disabled={busyId === service.id}
                  onClick={() =>
                    void run(
                      service.id,
                      () => summarizeService(token, service.id),
                      "Summary and steps regenerated from your approved documents.",
                    )
                  }
                >
                  {busyId === service.id ? "Working…" : "Regenerate steps"}
                </button>
                <button
                  className="c-button c-button-secondary c-button-sm"
                  onClick={() => {
                    setCreating(false);
                    setEditing(service);
                  }}
                >
                  Edit
                </button>
                <button
                  className="c-button c-button-ghost c-button-sm"
                  disabled={busyId === service.id}
                  onClick={() =>
                    void run(
                      service.id,
                      () =>
                        updateService(token, service.id, {
                          is_published: !service.is_published,
                        }),
                      service.is_published
                        ? "Hidden from the public site."
                        : "Published to the public site.",
                    )
                  }
                >
                  {service.is_published ? "Unpublish" : "Publish"}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {(creating || editing) && (
        <ServiceDialog
          label={terminology.singular}
          token={token}
          service={editing}
          onDeleted={async () => {
            setCreating(false);
            setEditing(null);
            await services.reload();
            setNotice(`${terminology.singular} deleted.`);
          }}
          onSaved={async () => {
            setCreating(false);
            setEditing(null);
            await services.reload();
            setNotice("Saved. Your public site is already showing it.");
          }}
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
  token,
  service,
  onClose,
  onSaved,
  onDeleted,
}: {
  label: string;
  token: string;
  service: AdminService | null;
  onClose: () => void;
  onSaved: () => Promise<void>;
  onDeleted: () => Promise<void>;
}) {
  const [draft, setDraft] = useState<DraftState>(() => draftFrom(service));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [onClose]);

  function update<K extends keyof DraftState>(key: K, value: DraftState[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    const payload: ServiceInput = {
      ...draft,
      procedure_steps: draft.procedure_steps.filter((step) => step.trim()),
      requirements: draft.requirements.filter((item) => item.title.trim()),
    };
    try {
      if (service) await updateService(token, service.id, payload);
      else await createService(token, payload);
      await onSaved();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "We could not save that.");
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!service) return;
    setSaving(true);
    try {
      await deleteService(token, service.id);
      await onDeleted();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "We could not delete that.");
      setSaving(false);
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
              This is what visitors see first, and what the assistant uses to frame
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
              Two or three plain sentences. Detail belongs in documents.
            </small>
          </label>

          <label className="c-field">
            <span>Fee (ETB)</span>
            <input
              className="c-input"
              type="number"
              min={0}
              step="0.01"
              value={draft.fee_etb ?? 0}
              onChange={(event) => update("fee_etb", Number(event.target.value))}
            />
            <small className="c-field-help">Leave at 0 when there is no charge.</small>
          </label>

          <Repeater
            legend="Steps to follow"
            help="The ordered steps a person takes. These appear on the public page and guide the assistant."
            values={draft.procedure_steps}
            placeholder="Bring your registration letter to the front desk"
            onChange={(values) => update("procedure_steps", values)}
          />

          <fieldset className="c-field">
            <span>What people must bring</span>
            <div className="admin-repeater">
              {draft.requirements.map((requirement, index) => (
                <div className="admin-repeater-row" key={index}>
                  <div className="c-form-grid">
                    <input
                      className="c-input"
                      value={requirement.title}
                      placeholder="Photo identification"
                      onChange={(event) => {
                        const next = [...draft.requirements];
                        next[index] = { ...requirement, title: event.target.value };
                        update("requirements", next);
                      }}
                    />
                    <input
                      className="c-input"
                      value={requirement.description ?? ""}
                      placeholder="Any government-issued ID"
                      onChange={(event) => {
                        const next = [...draft.requirements];
                        next[index] = {
                          ...requirement,
                          description: event.target.value,
                        };
                        update("requirements", next);
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    className="c-button c-button-ghost c-button-sm"
                    onClick={() =>
                      update(
                        "requirements",
                        draft.requirements.filter((_, position) => position !== index),
                      )
                    }
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="c-button c-button-secondary c-button-sm"
                onClick={() =>
                  update("requirements", [
                    ...draft.requirements,
                    { title: "", description: "", is_mandatory: true },
                  ])
                }
              >
                Add requirement
              </button>
            </div>
          </fieldset>

          <label className="c-checkbox">
            <input
              type="checkbox"
              checked={draft.is_published ?? true}
              onChange={(event) => update("is_published", event.target.checked)}
            />
            <span>Show on the public site</span>
          </label>

          {error && (
            <div className="c-alert" role="alert">
              <div>{error}</div>
            </div>
          )}

          <div className="c-form-actions">
            {service && (
              <button
                type="button"
                className="c-button c-button-ghost"
                onClick={() =>
                  confirmDelete ? void handleDelete() : setConfirmDelete(true)
                }
                disabled={saving}
              >
                {confirmDelete ? "Tap again to confirm" : "Delete"}
              </button>
            )}
            <button type="button" className="c-button c-button-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="c-button c-button-primary" disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function Repeater({
  legend,
  help,
  values,
  placeholder,
  onChange,
}: {
  legend: string;
  help: string;
  values: string[];
  placeholder: string;
  onChange: (values: string[]) => void;
}) {
  return (
    <fieldset className="c-field">
      <span>{legend}</span>
      <div className="admin-repeater">
        {values.map((value, index) => (
          <div className="admin-repeater-row" key={index}>
            <input
              className="c-input"
              value={value}
              placeholder={placeholder}
              onChange={(event) => {
                const next = [...values];
                next[index] = event.target.value;
                onChange(next);
              }}
            />
            <button
              type="button"
              className="c-button c-button-ghost c-button-sm"
              onClick={() => onChange(values.filter((_, position) => position !== index))}
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          className="c-button c-button-secondary c-button-sm"
          onClick={() => onChange([...values, ""])}
        >
          Add step
        </button>
      </div>
      <small className="c-field-help">{help}</small>
    </fieldset>
  );
}
