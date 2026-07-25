import Link from "next/link";
import type { Organization, Service } from "@/lib/types";

export function OrganizationAvatar({
  organization,
  size = "medium",
}: {
  organization: Organization;
  size?: "small" | "medium" | "large";
}) {
  if (organization.logo_url) {
    // Organization logos can be hosted on arbitrary approved domains.
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        className={`org-avatar org-avatar-${size}`}
        src={organization.logo_url}
        alt={`${organization.name} logo`}
      />
    );
  }
  return (
    <span
      className={`org-avatar org-avatar-${size} org-avatar-fallback`}
      aria-hidden="true"
    >
      {organization.short_code.slice(0, 2)}
    </span>
  );
}

export function OrganizationCard({
  organization,
}: {
  organization: Organization;
}) {
  return (
    <article className="organization-card">
      <div className="organization-card-top">
        <OrganizationAvatar organization={organization} />
        <span className="sector-badge">{organization.sector}</span>
      </div>
      <div>
        <h2>{organization.name}</h2>
        <p>
          {organization.description ??
            "Live template demo — preview a company knowledge site."}
        </p>
      </div>
      <Link
        href={`/organizations/${organization.slug}`}
        className="card-link"
        aria-label={`Open ${organization.name} live demo`}
      >
        Open live demo
        <span aria-hidden="true">→</span>
      </Link>
    </article>
  );
}

export function ServiceCard({
  service,
  organizationSlug,
  label = "Service",
}: {
  service: Service;
  organizationSlug: string;
  label?: string;
}) {
  return (
    <article className="service-card">
      <div className="service-card-meta">
        <span>{service.category}</span>
        <span className="verified-dot">
          <i aria-hidden="true" />
          {service.verification_status === "VERIFIED" ? "Verified" : "Reviewing"}
        </span>
      </div>
      <h3>{service.title}</h3>
      <p>{service.summary}</p>
      <div className="service-card-footer">
        <span>{service.processing_time}</span>
        <Link
          href={`/organizations/${organizationSlug}/services/${service.slug}`}
          aria-label={`Open ${service.title} ${label.toLowerCase()}`}
        >
          Ask about this {label.toLowerCase()} <b aria-hidden="true">→</b>
        </Link>
      </div>
    </article>
  );
}
