import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ComplaintButton } from "@/components/complaint-dialog";
import {
  OrganizationAvatar,
  ServiceCard,
} from "@/components/organization-card";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { getOrganization, getOrganizationServices } from "@/lib/api";
import { accessiblePrimary } from "@/lib/theme";
import type { Organization, Service } from "@/lib/types";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const organization = await getOrganization(slug);
    return {
      title: `${organization.name} · Live demo`,
      description:
        organization.description ??
        `Live template demo of a company knowledge site for ${organization.name}.`,
    };
  } catch {
    return { title: "Live demo" };
  }
}

export default async function OrganizationPage({ params }: PageProps) {
  const { slug } = await params;
  let organization: Organization;
  let services: Service[];
  try {
    [organization, services] = await Promise.all([
      getOrganization(slug),
      getOrganizationServices(slug),
    ]);
  } catch {
    notFound();
  }

  const themeStyle = {
    "--brand": accessiblePrimary(organization.theme.primary),
  } as CSSProperties;
  const terminology = organization.terminology;

  return (
    <div style={themeStyle}>
      <SiteHeader />
      <main>
        <div className="demo-banner">
          <div className="container demo-banner-inner">
            <span>
              Template demo — example of a company site after subscribe +
              customize. Customers would use this site, not Agafari.
            </span>
            <Link href="/templates">See templates</Link>
          </div>
        </div>
        <section className="organization-hero">
          <div className="container org-hero-grid">
            <div className="org-identity">
              <OrganizationAvatar organization={organization} size="large" />
              <div>
                <span className="sector-badge">{organization.sector}</span>
                <h1>{organization.name}</h1>
                <p>
                  {organization.description ??
                    "Explore this company-site demo: services, public AI, and feedback."}
                </p>
              </div>
            </div>
            <div className="org-contact" aria-label="Organization contacts">
              {organization.contact.website && (
                <a
                  href={organization.contact.website}
                  target="_blank"
                  rel="noreferrer"
                >
                  Website ↗
                </a>
              )}
              {organization.contact.email && (
                <a href={`mailto:${organization.contact.email}`}>Email</a>
              )}
              {organization.contact.phone && (
                <a href={`tel:${organization.contact.phone}`}>Call</a>
              )}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="section-head">
              <div>
                <span className="eyebrow">Verified public information</span>
                <h2>{terminology.service_plural}</h2>
              </div>
              <p>
                Choose a {terminology.service_singular.toLowerCase()} to review
                its information and ask a question grounded in approved
                sources.
              </p>
            </div>

            {services.length ? (
              <div className="service-grid">
                {services.map((service) => (
                  <ServiceCard
                    service={service}
                    organizationSlug={organization.slug}
                    label={terminology.service_singular}
                    key={service.id}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-panel">
                <h2>No public {terminology.service_plural.toLowerCase()} yet</h2>
                <p>
                  This demo has not published {terminology.service_plural.toLowerCase()}{" "}
                  yet.
                </p>
              </div>
            )}

            {organization.features.complaints && (
              <div className="complaint-banner">
                <div>
                  <h3>Something unclear or not working?</h3>
                  <p>
                    Share structured feedback directly with {organization.name}.
                  </p>
                </div>
                <ComplaintButton
                  organization={organization}
                  services={services}
                  label="Share feedback"
                  className="button button-primary"
                />
              </div>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
