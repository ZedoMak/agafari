import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { UpdatesTimeline } from "@/components/clarity/updates-timeline";
import { getOrganization, getOrganizationUpdates } from "@/lib/api";
import { resolveBasePath } from "@/lib/clarity/base-path";
import { terminologyOf } from "@/lib/clarity/brand";
import { joinPath } from "@/lib/clarity/href";
import type { OrganizationUpdate } from "@/lib/types";

export const metadata: Metadata = { title: "Updates" };

type PageProps = { params: Promise<{ slug: string }> };

export default async function UpdatesPage({ params }: PageProps) {
  const { slug } = await params;
  const organization = await getOrganization(slug).catch(() => null);
  if (!organization) notFound();

  const updates: OrganizationUpdate[] = await getOrganizationUpdates(slug).catch(
    () => [],
  );
  const basePath = await resolveBasePath(slug);
  const href = (path: string) => joinPath(basePath, path);
  const words = terminologyOf(organization);

  return (
    <section className="c-section">
      <div className="c-container">
        <div className="c-section-head">
          <div>
            <span className="c-eyebrow">{organization.name}</span>
            <h1 className="c-title-lg" style={{ marginTop: "0.6rem" }}>
              Updates
            </h1>
          </div>
          <p>
            Changes to policies, rules, fees, and procedures are announced here,
            newest first, so you always see what applies today.
          </p>
        </div>

        {updates.length > 0 ? (
          <div className="c-updates-wrap">
            <UpdatesTimeline
              updates={updates}
              serviceHref={(serviceSlug) => href(`/services/${serviceSlug}`)}
            />
          </div>
        ) : (
          <div className="c-empty">
            <h3>No changes have been announced yet.</h3>
            <p>
              When {organization.name} changes a policy, rule, fee, or procedure,
              it will be published on this page.
            </p>
            <Link
              className="c-button c-button-secondary c-button-sm"
              href={href("/services")}
            >
              Browse {words.pluralLower}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
