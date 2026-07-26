import Link from "next/link";
import type { CSSProperties } from "react";
import {
  formatUpdateDate,
  updateKindLabel,
} from "@/components/clarity/updates-timeline";
import type { OrganizationUpdate } from "@/lib/types";

export function UpdatesHighlights({
  updates,
  updatesHref,
}: {
  updates: OrganizationUpdate[];
  updatesHref: string;
}) {
  if (updates.length === 0) return null;

  return (
    <section className="c-section-tight" aria-labelledby="latest-updates">
      <div className="c-container">
        <div className="c-section-head">
          <div>
            <span className="c-eyebrow">Latest</span>
            <h2
              className="c-title-md"
              id="latest-updates"
              style={{ marginTop: "0.5rem" }}
            >
              Recent changes
            </h2>
          </div>
          <p>
            Policy, rule, fee, and procedure changes are announced here as soon
            as they take effect.
          </p>
        </div>

        <div className="c-update-strip">
          {updates.map((update, index) => {
            const published = formatUpdateDate(update.published_at);
            return (
              <Link
                key={update.id}
                className="c-card c-rise"
                href={updatesHref}
                style={{ "--i": index } as CSSProperties}
              >
                <div className="c-card-top">
                  <span
                    className={
                      update.origin === "AI_DETECTED"
                        ? "c-badge c-badge-brand"
                        : "c-badge"
                    }
                  >
                    {updateKindLabel(update.origin)}
                  </span>
                  {published && (
                    <span className="c-small c-muted">{published}</span>
                  )}
                </div>
                <h3>{update.title}</h3>
                <p>{update.summary}</p>
                <div className="c-card-foot">
                  <span>{update.service_title ?? "Site-wide"}</span>
                  <span className="c-card-cta">
                    Read <span aria-hidden="true">→</span>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
