import Link from "next/link";
import type { CSSProperties } from "react";
import type { OrganizationUpdate } from "@/lib/types";

/**
 * Dates arrive either as naive UTC timestamps or as plain calendar dates, so
 * they are normalised before formatting and rendered in UTC to stop a calendar
 * date from slipping to the previous day on the server's local clock.
 */
function toDate(value: string) {
  const hasTime = value.includes("T");
  const hasZone = /([zZ]|[+-]\d{2}:?\d{2})$/.test(value);
  return new Date(hasTime && !hasZone ? `${value}Z` : value);
}

export function formatUpdateDate(value: string | null) {
  if (!value) return null;
  const date = toDate(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function updateKindLabel(origin: OrganizationUpdate["origin"]) {
  return origin === "AI_DETECTED" ? "Policy change" : "Announcement";
}

export function UpdatesTimeline({
  updates,
  serviceHref,
}: {
  updates: OrganizationUpdate[];
  serviceHref: (serviceSlug: string) => string;
}) {
  return (
    <ol className="c-updates">
      {updates.map((update, index) => {
        const published = formatUpdateDate(update.published_at);
        const effective = formatUpdateDate(update.effective_date);
        return (
          <li
            key={update.id}
            className="c-update c-rise"
            style={{ "--i": index } as CSSProperties}
            data-origin={update.origin}
          >
            <div className="c-update-body">
              <div className="c-update-top">
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
                  <time className="c-update-date" dateTime={update.published_at}>
                    {published}
                  </time>
                )}
              </div>

              <h2 className="c-update-title">{update.title}</h2>
              <p className="c-update-summary">{update.summary}</p>

              {effective && (
                <p className="c-update-effective">
                  <span aria-hidden="true" />
                  Effective from {effective}
                </p>
              )}

              {update.service_slug && (
                <Link
                  className="c-card-cta c-update-link"
                  href={serviceHref(update.service_slug)}
                >
                  {update.service_title ?? "See the related page"}{" "}
                  <span aria-hidden="true">→</span>
                </Link>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
