"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { BrandMark } from "@/components/clarity/brand-mark";
import { useSite } from "@/components/clarity/site-context";
import { createAccessSession } from "@/lib/clarity/client";
import { readSession, saveSession } from "@/lib/clarity/session";

export function AccessForm() {
  const { organization, href } = useSite();
  const router = useRouter();
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (readSession(organization.slug)) router.replace(href("/workspace"));
  }, [organization.slug, href, router]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (code.trim().length < 4) {
      setError("Enter the access code your organization gave you.");
      return;
    }
    setSubmitting(true);
    try {
      const session = await createAccessSession(organization.slug, code.trim());
      saveSession(organization.slug, session);
      router.replace(href("/workspace"));
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "That code was not accepted.",
      );
      setSubmitting(false);
    }
  }

  return (
    <div className="c-access">
      <div className="c-access-form">
        <Link className="c-brand" href={href("/")} style={{ marginRight: "auto" }}>
          <BrandMark organization={organization} />
          <span className="c-brand-text">
            <span className="c-brand-name">{organization.name}</span>
            <span className="c-brand-sub">Staff workspace</span>
          </span>
        </Link>

        <div style={{ marginTop: "3rem", maxWidth: "420px" }}>
          <h1 className="c-title-md">Sign in with your access code</h1>
          <p className="c-muted" style={{ marginTop: "0.6rem", fontSize: "0.9375rem" }}>
            The workspace is for {organization.name} staff. Your session lasts for
            the working day and stays in this browser tab only.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="c-field">
            <span>Access code</span>
            <input
              className="c-input"
              type="password"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="••••••••"
              autoComplete="one-time-code"
              autoFocus
              required
            />
          </label>

          {error && (
            <div className="c-form-error" role="alert">
              {error}
            </div>
          )}

          <button
            className="c-button c-button-primary c-button-lg"
            type="submit"
            disabled={submitting}
          >
            {submitting ? "Checking…" : "Enter workspace"}
          </button>

          <Link className="c-small c-muted" href={href("/")}>
            ← Back to the public site
          </Link>
        </form>
      </div>

      <aside className="c-access-aside">
        <h2>Everything your team publishes, in one place</h2>
        <p>
          The workspace is where {organization.name} manages knowledge, reviews
          what people are asking, and answers internal questions.
        </p>
        <ul className="c-access-points">
          <li>Ask the internal assistant across public and internal documents</li>
          <li>Upload, review, and approve knowledge before it goes live</li>
          <li>Track complaints, recurring issues, and unanswered questions</li>
        </ul>
      </aside>
    </div>
  );
}
