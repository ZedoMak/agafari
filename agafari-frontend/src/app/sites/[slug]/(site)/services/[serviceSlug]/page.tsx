import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ClarityChat } from "@/components/clarity/clarity-chat";
import { joinPath } from "@/lib/clarity/href";
import { getOrganization, getOrganizationServices } from "@/lib/api";
import { resolveBasePath } from "@/lib/clarity/base-path";
import { terminologyOf } from "@/lib/clarity/brand";
import type { Organization, Service } from "@/lib/types";

type PageProps = {
  params: Promise<{ slug: string; serviceSlug: string }>;
};

async function loadService(slug: string, serviceSlug: string) {
  const [organization, services] = await Promise.all([
    getOrganization(slug).catch(() => null),
    getOrganizationServices(slug).catch(() => [] as Service[]),
  ]);
  if (!organization) return null;
  const service = services.find((item) => item.slug === serviceSlug);
  return service ? { organization, service } : null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, serviceSlug } = await params;
  const data = await loadService(slug, serviceSlug);
  if (!data) return { title: "Not found" };
  return { title: data.service.title, description: data.service.summary };
}

function formatDate(value: string) {
  const date = new Date(value.endsWith("Z") ? value : `${value}Z`);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function ServiceDetailPage({ params }: PageProps) {
  const { slug, serviceSlug } = await params;
  const data = await loadService(slug, serviceSlug);
  if (!data) notFound();

  const { organization, service }: { organization: Organization; service: Service } = data;
  const basePath = await resolveBasePath(slug);
  const href = (path: string) => joinPath(basePath, path);
  const words = terminologyOf(organization);
  const verifiedOn = formatDate(service.last_verified_at);
  const steps = (service.procedure_steps ?? []).filter(
    (step) => typeof step === "string" && step.trim().length > 0,
  );

  return (
    <section className="c-section">
      <div className="c-container">
        <nav className="c-breadcrumb" aria-label="Breadcrumb">
          <Link href={href("/")}>Home</Link>
          <span aria-hidden="true">/</span>
          <Link href={href("/services")}>{words.plural}</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{service.title}</span>
        </nav>

        <div className="c-detail">
          <div>
            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
              <span className="c-badge c-badge-brand">{service.category}</span>
              {service.verification_status === "VERIFIED" && (
                <span className="c-badge c-badge-positive c-badge-dot">
                  Verified information
                </span>
              )}
            </div>

            <h1 className="c-title-lg" style={{ margin: "0.9rem 0 1rem" }}>
              {service.title}
            </h1>
            <div className="c-prose">
              <p>{service.summary}</p>
            </div>

            {steps.length > 0 && (
              <div className="c-steps-block">
                <h2 className="c-title-md">How it works</h2>
                <ol className="c-steps">
                  {steps.map((step, index) => (
                    <li key={`${index}-${step}`}>
                      <span className="c-step-index" aria-hidden="true">
                        {index + 1}
                      </span>
                      <span className="c-step-text">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <dl className="c-meta-list">
              <div>
                <dt>Timeline</dt>
                <dd>{service.processing_time}</dd>
              </div>
              <div>
                <dt>Category</dt>
                <dd>{service.category}</dd>
              </div>
              <div>
                <dt>Offered by</dt>
                <dd>{organization.name}</dd>
              </div>
              {verifiedOn && (
                <div>
                  <dt>Last reviewed</dt>
                  <dd>{verifiedOn}</dd>
                </div>
              )}
            </dl>

            {organization.features.complaints && (
              <div className="c-alert" style={{ marginTop: "1.5rem" }}>
                <div>
                  <strong>Something wrong with this {words.singularLower}?</strong>
                  <div style={{ marginTop: "0.35rem" }}>
                    <Link
                      className="c-card-cta"
                      href={href(`/support?service=${encodeURIComponent(service.id)}`)}
                    >
                      Report a problem <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          <aside className="c-detail-aside">
            {organization.features.public_chat ? (
              <ClarityChat
                mode={{ kind: "public", serviceId: service.id }}
                title={`${organization.name} assistant`}
                subtitle={service.title}
                scopeLabel="Public sources"
                placeholder={`Ask about ${service.title}…`}
                welcomeTitle="What would you like to know?"
                welcomeBody={`Ask about eligibility, required documents, or timelines. Answers come only from ${organization.name}'s approved public documents.`}
                suggestions={[
                  "Who is eligible?",
                  "What documents are required?",
                  "How long does it take?",
                ]}
                organizationName={organization.name}
              />
            ) : (
              <div className="c-empty">
                <h3>The assistant is turned off</h3>
                <p>
                  {organization.name} has not enabled the public assistant for
                  this site. Use the contact details in the footer to reach the
                  team.
                </p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}
