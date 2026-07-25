import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ComplaintButton } from "@/components/complaint-dialog";
import { OrganizationAvatar } from "@/components/organization-card";
import { PublicChat } from "@/components/public-chat";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { getOrganization, getOrganizationServices } from "@/lib/api";
import { accessiblePrimary } from "@/lib/theme";
import type { Organization, Service } from "@/lib/types";

type PageProps = {
  params: Promise<{ slug: string; serviceSlug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  try {
    const { slug, serviceSlug } = await params;
    const [organization, services] = await Promise.all([
      getOrganization(slug),
      getOrganizationServices(slug),
    ]);
    const service = services.find((item) => item.slug === serviceSlug);
    if (!service) return { title: "Service" };
    return {
      title: `${service.title} — ${organization.name}`,
      description: service.summary,
    };
  } catch {
    return { title: "Service" };
  }
}

export default async function ServicePage({ params }: PageProps) {
  const { slug, serviceSlug } = await params;
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
  const service = services.find((item) => item.slug === serviceSlug);
  if (!service) notFound();

  const themeStyle = {
    "--brand": accessiblePrimary(organization.theme.primary),
  } as CSSProperties;
  const lastVerified = new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(new Date(service.last_verified_at));

  return (
    <div style={themeStyle}>
      <SiteHeader />
      <main className="section">
        <div className="container">
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            <Link href="/organizations">Organizations</Link>
            <span>/</span>
            <Link href={`/organizations/${organization.slug}`}>
              {organization.name}
            </Link>
            <span>/</span>
            <span aria-current="page">{service.title}</span>
          </nav>

          <div className="service-layout">
            <section className="service-info">
              <Link
                href={`/organizations/${organization.slug}`}
                className="service-org-line"
              >
                <OrganizationAvatar
                  organization={organization}
                  size="small"
                />
                {organization.name}
              </Link>
              <h1>{service.title}</h1>
              <p className="service-summary">{service.summary}</p>

              <dl className="service-facts">
                <div className="service-fact">
                  <dt>Category</dt>
                  <dd>{service.category}</dd>
                </div>
                <div className="service-fact">
                  <dt>Expected timing</dt>
                  <dd>{service.processing_time}</dd>
                </div>
                <div className="service-fact">
                  <dt>Information status</dt>
                  <dd>
                    {service.verification_status === "VERIFIED"
                      ? "Verified by the organization"
                      : "Currently under review"}
                  </dd>
                </div>
                <div className="service-fact">
                  <dt>Last verified</dt>
                  <dd>{lastVerified}</dd>
                </div>
              </dl>

              <div className="service-info-actions">
                {organization.contact.website && (
                  <a
                    className="button button-primary"
                    href={organization.contact.website}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Official website ↗
                  </a>
                )}
                {organization.features.complaints && (
                  <ComplaintButton
                    organization={organization}
                    services={services}
                    defaultServiceId={service.id}
                    label="Report an issue"
                  />
                )}
              </div>
            </section>

            {organization.features.public_chat ? (
              <PublicChat
                serviceId={service.id}
                serviceTitle={service.title}
                organizationName={organization.name}
              />
            ) : (
              <div className="empty-panel">
                <h2>Public assistant is not enabled</h2>
                <p>
                  Contact {organization.name} directly for more information
                  about this service.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
