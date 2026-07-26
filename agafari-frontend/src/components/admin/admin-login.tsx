"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { getOrganizations } from "@/lib/api";
import { createAccessSession } from "@/lib/clarity/client";
import { readAdminSession, saveAdminSession } from "@/lib/admin/session";
import type { Organization } from "@/lib/types";

export function AdminLogin() {
  const router = useRouter();
  const params = useSearchParams();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [slug, setSlug] = useState(params.get("org") ?? "");
  const [accessCode, setAccessCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (readAdminSession()) router.replace("/admin");
  }, [router]);

  useEffect(() => {
    let active = true;
    getOrganizations()
      .then((list) => {
        if (!active) return;
        setOrganizations(list);
        setSlug((current) => current || list[0]?.slug || "");
      })
      .catch(() => {
        // Falls back to typing the address by hand.
      });
    return () => {
      active = false;
    };
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!slug.trim() || !accessCode.trim()) {
      setError("Enter your organization and access code.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const session = await createAccessSession(slug.trim(), accessCode.trim());
      const name =
        organizations.find((item) => item.slug === slug.trim())?.name ?? slug.trim();
      saveAdminSession(slug.trim(), name, session);
      router.replace("/admin");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "We could not sign you in. Check your access code.",
      );
      setSubmitting(false);
    }
  }

  return (
    <div className="admin-login">
      <section className="admin-login-form">
        <div className="admin-login-brand">
          <span className="admin-wordmark">አጋፋሪ</span>
          <span className="admin-brand-sub">Admin panel</span>
        </div>

        <h1 className="c-title-md">Sign in to manage your site</h1>
        <p className="c-muted">
          Your public site serves your visitors. This panel is where your team
          runs it — services, documents, announcements, and everything the
          assistant is allowed to say.
        </p>

        <form className="c-form-grid" onSubmit={onSubmit}>
          <label className="c-field">
            <span>Organization</span>
            {organizations.length > 0 ? (
              <select
                className="c-select"
                value={slug}
                onChange={(event) => setSlug(event.target.value)}
              >
                {organizations.map((item) => (
                  <option key={item.slug} value={item.slug}>
                    {item.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                className="c-input"
                value={slug}
                onChange={(event) => setSlug(event.target.value)}
                placeholder="your-organization"
                autoComplete="organization"
              />
            )}
          </label>

          <label className="c-field">
            <span>Access code</span>
            <input
              className="c-input"
              type="password"
              value={accessCode}
              onChange={(event) => setAccessCode(event.target.value)}
              placeholder="Your team access code"
              autoComplete="current-password"
            />
          </label>

          {error && (
            <p className="c-form-error" role="alert">
              {error}
            </p>
          )}

          <button
            className="c-button c-button-primary c-button-lg"
            type="submit"
            disabled={submitting}
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="c-small c-muted">
          Lost your access code? The colleague who set up your site can issue a
          new one.
        </p>
      </section>

      <aside className="admin-login-aside">
        <h2>One place to run your organization&apos;s site</h2>
        <ul>
          <li>
            <b>Publish services</b>
            <span>Describe what you offer, the steps, documents, and fees.</span>
          </li>
          <li>
            <b>Control the knowledge</b>
            <span>
              Approve what the public assistant may use, and keep staff-only
              documents private.
            </span>
          </li>
          <li>
            <b>Announce changes</b>
            <span>
              When a policy or rule changes, publish a notice to your visitors in
              one click.
            </span>
          </li>
          <li>
            <b>See what people ask</b>
            <span>
              Read every conversation, complaint, and unanswered question.
            </span>
          </li>
        </ul>
      </aside>
    </div>
  );
}
