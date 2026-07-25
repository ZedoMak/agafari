import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicAssistant } from "@/components/clarity/public-assistant";
import { joinPath } from "@/lib/clarity/href";
import { getOrganization, getOrganizationServices } from "@/lib/api";
import { resolveBasePath } from "@/lib/clarity/base-path";
import { terminologyOf } from "@/lib/clarity/brand";
import type { Service } from "@/lib/types";

export const metadata: Metadata = { title: "Ask the assistant" };

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string; service?: string }>;
};

export default async function AskPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { q, service } = await searchParams;
  const organization = await getOrganization(slug).catch(() => null);
  if (!organization) notFound();

  const services: Service[] = await getOrganizationServices(slug).catch(() => []);
  const basePath = await resolveBasePath(slug);
  const words = terminologyOf(organization);

  return (
    <section className="c-section">
      <div className="c-container-narrow">
        <div style={{ marginBottom: "1.75rem" }}>
          <span className="c-eyebrow">Public assistant</span>
          <h1 className="c-title-md" style={{ margin: "0.6rem 0 0.6rem" }}>
            Ask {organization.name}
          </h1>
          <p className="c-lede">
            Answers are grounded in approved public documents and always show
            their sources. Nothing internal to {organization.name} is used here.
          </p>
        </div>

        {!organization.features.public_chat ? (
          <div className="c-empty">
            <h3>The assistant is turned off</h3>
            <p>
              {organization.name} has not enabled the public assistant. You can
              still browse {words.pluralLower} or contact the team directly.
            </p>
            <Link
              className="c-button c-button-secondary c-button-sm"
              href={joinPath(basePath, "/services")}
            >
              Browse {words.pluralLower}
            </Link>
          </div>
        ) : services.length === 0 ? (
          <div className="c-empty">
            <h3>Nothing to ask about yet</h3>
            <p>
              The assistant answers questions about published {words.pluralLower}.
              None have been published on this site yet.
            </p>
          </div>
        ) : (
          <PublicAssistant
            services={services}
            initialServiceId={service}
            initialQuestion={q}
          />
        )}
      </div>
    </section>
  );
}
