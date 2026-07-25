"use client";

import { useRef, useState, type FormEvent } from "react";
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
import { getOrganizationServices } from "@/lib/api";
import {
  approveDocument,
  listDocuments,
  rejectDocument,
  submitTextDocument,
  uploadDocument,
} from "@/lib/clarity/client";
import type { DocumentVisibility, KnowledgeDocument } from "@/lib/clarity/types";
import { useAsync } from "@/lib/clarity/use-async";

type Filter = "ALL" | "PENDING" | "PUBLIC" | "INTERNAL";

function humanizeType(sourceType: string) {
  const words = sourceType.replace(/_/g, " ").toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1).replace(/\bsop\b/i, "SOP");
}

const FILTERS: [Filter, string][] = [
  ["ALL", "All"],
  ["PENDING", "Awaiting approval"],
  ["PUBLIC", "Public"],
  ["INTERNAL", "Internal"],
];

export default function DocumentsPage() {
  const { token } = useWorkspace();
  const { organization, terminology } = useSite();
  const documents = useAsync(() => listDocuments(token), [token]);
  const services = useAsync(
    () => getOrganizationServices(organization.slug),
    [organization.slug],
  );

  const [filter, setFilter] = useState<Filter>("ALL");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  async function runAction(
    document: KnowledgeDocument,
    action: "approve" | "reject",
  ) {
    setBusyId(document.id);
    setActionError("");
    try {
      if (action === "approve") await approveDocument(token, document.id);
      else await rejectDocument(token, document.id);
      documents.reload();
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "That action did not complete.",
      );
    } finally {
      setBusyId(null);
    }
  }

  const all = documents.data ?? [];
  const visible = all.filter((document) => {
    if (filter === "PENDING") return document.approval_status === "PENDING";
    if (filter === "PUBLIC") return document.visibility === "PUBLIC";
    if (filter === "INTERNAL") return document.visibility === "INTERNAL";
    return true;
  });
  const pendingCount = all.filter((item) => item.approval_status === "PENDING").length;

  return (
    <>
      <PageIntro
        title="Documents"
        description="Everything the assistant is allowed to quote. Public documents answer questions on your website; internal documents stay inside this workspace. Nothing is indexed until it is approved."
      />

      <UploadPanel
        token={token}
        services={(services.data ?? []).map((service) => ({
          id: service.id,
          title: service.title,
        }))}
        serviceLabel={terminology.singular}
        onUploaded={documents.reload}
      />

      <div className="c-panel">
        <div className="c-panel-head">
          <h3>
            Library{" "}
            {pendingCount > 0 && (
              <span className="c-badge c-badge-caution" style={{ marginLeft: "0.4rem" }}>
                {pendingCount} awaiting approval
              </span>
            )}
          </h3>
          <div className="c-tabs" role="tablist" aria-label="Document filter">
            {FILTERS.map(([value, label]) => (
              <button
                key={value}
                role="tab"
                aria-selected={filter === value}
                onClick={() => setFilter(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {actionError && (
          <div className="c-panel-body" style={{ paddingBottom: 0 }}>
            <div className="c-form-error" role="alert">
              {actionError}
            </div>
          </div>
        )}

        {documents.loading && !documents.data ? (
          <div className="c-panel-body">
            <LoadingRows count={4} />
          </div>
        ) : documents.error ? (
          <div className="c-panel-body">
            <ErrorPanel message={documents.error} onRetry={documents.reload} />
          </div>
        ) : visible.length === 0 ? (
          <div className="c-panel-body">
            <EmptyPanel
              title={all.length ? "Nothing in this view" : "No documents yet"}
              body={
                all.length
                  ? "Try another filter to see the rest of the library."
                  : "Upload a policy, guide, or FAQ above. Approve it and the assistant can start citing it."
              }
            />
          </div>
        ) : (
          <div className="c-table-wrap">
            <table className="c-table">
              <thead>
                <tr>
                  <th>Document</th>
                  <th>Visibility</th>
                  <th>Approval</th>
                  <th>Index</th>
                  <th>Added</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {visible.map((document) => (
                  <tr key={document.id}>
                    <td>
                      <strong style={{ fontWeight: 600 }}>{document.title}</strong>
                      <div className="c-small c-muted">
                        {humanizeType(document.source_type)}
                        {document.department ? ` · ${document.department}` : ""}
                        {document.version > 1 ? ` · v${document.version}` : ""}
                      </div>
                    </td>
                    <td>
                      <StatusBadge value={document.visibility} />
                    </td>
                    <td>
                      <StatusBadge value={document.approval_status} />
                    </td>
                    <td>
                      <StatusBadge value={document.processing_status} />
                    </td>
                    <td className="c-muted">{relativeTime(document.created_at)}</td>
                    <td>
                      <div className="c-list-actions">
                        {document.approval_status !== "APPROVED" && (
                          <button
                            className="c-button c-button-primary c-button-sm"
                            disabled={busyId === document.id}
                            onClick={() => void runAction(document, "approve")}
                          >
                            {busyId === document.id ? "Indexing…" : "Approve"}
                          </button>
                        )}
                        {document.approval_status !== "REJECTED" && (
                          <button
                            className="c-button c-button-danger c-button-sm"
                            disabled={busyId === document.id}
                            onClick={() => void runAction(document, "reject")}
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

function UploadPanel({
  token,
  services,
  serviceLabel,
  onUploaded,
}: {
  token: string;
  services: { id: string; title: string }[];
  serviceLabel: string;
  onUploaded: () => void;
}) {
  const [mode, setMode] = useState<"file" | "text">("file");
  const [title, setTitle] = useState("");
  const [visibility, setVisibility] = useState<DocumentVisibility>("PUBLIC");
  const [department, setDepartment] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function reset() {
    setTitle("");
    setText("");
    setFile(null);
    setDepartment("");
    setServiceId("");
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setDone("");
    if (!title.trim()) {
      setError("Give the document a title staff will recognise.");
      return;
    }
    if (mode === "file" && !file) {
      setError("Choose a PDF, TXT, Markdown, CSV, or JSON file.");
      return;
    }
    if (mode === "text" && text.trim().length < 20) {
      setError("Paste at least a short paragraph of content.");
      return;
    }
    setSubmitting(true);
    try {
      const created =
        mode === "file"
          ? await uploadDocument(token, {
              title: title.trim(),
              visibility,
              file: file!,
              serviceId: serviceId || undefined,
              department: department || undefined,
            })
          : await submitTextDocument(token, {
              title: title.trim(),
              visibility,
              raw_text_content: text.trim(),
              service_id: serviceId || null,
              department: department || null,
            });
      setDone(
        `“${created.title}” is uploaded as ${created.visibility.toLowerCase()} and waiting for approval.`,
      );
      reset();
      onUploaded();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "The document could not be uploaded.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="c-panel" onSubmit={handleSubmit}>
      <div className="c-panel-head">
        <h3>Add knowledge</h3>
        <div className="c-tabs" role="tablist" aria-label="Upload method">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "file"}
            onClick={() => setMode("file")}
          >
            Upload file
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "text"}
            onClick={() => setMode("text")}
          >
            Paste text
          </button>
        </div>
      </div>

      <div className="c-panel-body" style={{ display: "grid", gap: "1rem" }}>
        {mode === "file" ? (
          <label
            className="c-dropzone"
            data-dragging={dragging}
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              const dropped = event.dataTransfer.files?.[0];
              if (dropped) {
                setFile(dropped);
                if (!title) setTitle(dropped.name.replace(/\.[^.]+$/, ""));
              }
            }}
          >
            <strong>{file ? file.name : "Drop a file or browse"}</strong>
            <span>PDF, TXT, Markdown, CSV, or JSON — up to 10 MB</span>
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.txt,.md,.csv,.json"
              style={{ display: "none" }}
              onChange={(event) => {
                const chosen = event.target.files?.[0] ?? null;
                setFile(chosen);
                if (chosen && !title) setTitle(chosen.name.replace(/\.[^.]+$/, ""));
              }}
            />
          </label>
        ) : (
          <label className="c-field">
            <span>Content</span>
            <textarea
              className="c-textarea"
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Paste the policy, guidance, or FAQ text…"
            />
          </label>
        )}

        <div className="c-form-grid">
          <label className="c-field">
            <span>Title</span>
            <input
              className="c-input"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Community grant public guide"
              maxLength={255}
              required
            />
          </label>
          <label className="c-field">
            <span>Related {serviceLabel.toLowerCase()} (optional)</span>
            <select
              className="c-select"
              value={serviceId}
              onChange={(event) => setServiceId(event.target.value)}
            >
              <option value="">Organization-wide</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.title}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="c-field">
          <span className="c-label">Who can this answer questions for?</span>
          <div className="c-radio-cards">
            <label className="c-radio-card">
              <input
                type="radio"
                name="visibility"
                checked={visibility === "PUBLIC"}
                onChange={() => setVisibility("PUBLIC")}
              />
              <span className="c-radio-card-text">
                <strong>Public</strong>
                <span>Anyone on your website, plus staff.</span>
              </span>
            </label>
            <label className="c-radio-card">
              <input
                type="radio"
                name="visibility"
                checked={visibility === "INTERNAL"}
                onChange={() => setVisibility("INTERNAL")}
              />
              <span className="c-radio-card-text">
                <strong>Internal</strong>
                <span>Staff only. Never used by the public assistant.</span>
              </span>
            </label>
          </div>
        </div>

        {visibility === "INTERNAL" && (
          <label className="c-field" style={{ maxWidth: "320px" }}>
            <span>Owning team (optional)</span>
            <input
              className="c-input"
              value={department}
              onChange={(event) => setDepartment(event.target.value)}
              placeholder="Operations"
              maxLength={100}
            />
          </label>
        )}

        {error && (
          <div className="c-form-error" role="alert">
            {error}
          </div>
        )}
        {done && (
          <div className="c-alert" role="status">
            <div>{done}</div>
          </div>
        )}

        <div className="c-form-actions">
          <button className="c-button c-button-primary" type="submit" disabled={submitting}>
            {submitting ? "Uploading…" : "Upload for approval"}
          </button>
        </div>
      </div>
    </form>
  );
}
