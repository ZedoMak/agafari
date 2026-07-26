"use client";

import Link from "next/link";
import { BrandMark } from "@/components/clarity/brand-mark";
import { useSite } from "@/components/clarity/site-context";

export function SiteFooter() {
  const { organization, terminology, href } = useSite();
  const { contact } = organization;
  const year = new Date().getFullYear();

  return (
    <footer className="c-footer">
      <div className="c-container">
        <div className="c-footer-grid">
          <div>
            <Link className="c-brand" href={href("/")}>
              <BrandMark organization={organization} />
              <span className="c-brand-text">
                <span className="c-brand-name">{organization.name}</span>
                <span className="c-brand-sub">{organization.sector}</span>
              </span>
            </Link>
            {organization.description && (
              <p
                className="c-small c-muted"
                style={{ marginTop: "0.9rem", maxWidth: "38ch" }}
              >
                {organization.description}
              </p>
            )}
          </div>

          <div>
            <h4>Explore</h4>
            <div className="c-footer-links">
              <Link href={href("/services")}>{terminology.plural}</Link>
              <Link href={href("/updates")}>Updates</Link>
              <Link href={href("/about")}>About us</Link>
              {organization.features.public_chat && (
                <Link href={href("/ask")}>Ask the assistant</Link>
              )}
              {organization.features.complaints && (
                <Link href={href("/support")}>Feedback & complaints</Link>
              )}
            </div>
          </div>

          <div>
            <h4>Contact</h4>
            <div className="c-footer-links">
              {contact.email && (
                <a href={`mailto:${contact.email}`}>{contact.email}</a>
              )}
              {contact.phone && <a href={`tel:${contact.phone}`}>{contact.phone}</a>}
              {contact.website && (
                <a href={contact.website} target="_blank" rel="noreferrer">
                  {contact.website.replace(/^https?:\/\//, "")}
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="c-footer-note">
          <span>
            © {year} {organization.name}. Answers are generated from approved
            public documents and may not cover every situation.
          </span>
          {/* Staff management runs on a separate admin host, so this stays an absolute path. */}
          <a
            className="c-footer-staff"
            href={`/admin?org=${encodeURIComponent(organization.slug)}`}
          >
            Staff sign in
          </a>
        </div>
      </div>
    </footer>
  );
}
