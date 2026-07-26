"use client";

import { useState } from "react";
import Link from "next/link";
import type { CSSProperties } from "react";
import { SiteEmbed } from "@/components/landing/site-embed";
import { PUBLISHED_DEMOS } from "@/lib/demo-sites";
import { TEMPLATE_CATALOG } from "@/lib/templates-catalog";

function accentFor(templateId: string) {
  return (
    TEMPLATE_CATALOG.find((item) => item.id === templateId)?.accent ??
    "var(--brand)"
  );
}

export function LiveSiteSwitcher({
  size = "large",
}: {
  size?: "default" | "large";
}) {
  const [index, setIndex] = useState(0);
  const active = PUBLISHED_DEMOS[index];

  return (
    <div className="site-switcher">
      <div
        className="site-switcher-tabs"
        role="tablist"
        aria-label="Live demo sites"
      >
        {PUBLISHED_DEMOS.map((demo, position) => (
          <button
            key={demo.slug}
            type="button"
            role="tab"
            aria-selected={position === index}
            className={position === index ? "is-active" : undefined}
            onClick={() => setIndex(position)}
            style={{ "--dot": accentFor(demo.templateId) } as CSSProperties}
          >
            <span className="site-switcher-dot" aria-hidden="true" />
            {demo.orgName}
          </button>
        ))}
      </div>

      <p className="site-switcher-caption">{active.description}</p>

      <SiteEmbed site={active} size={size} key={active.slug} />

      <div className="site-switcher-actions">
        <Link href={active.siteHref} className="button button-primary">
          Open {active.orgName}
        </Link>
        <Link
          href={`${active.siteHref}/ask`}
          className="button button-secondary"
        >
          Try the assistant
        </Link>
        <Link
          href={`/admin/login?org=${active.slug}`}
          className="button button-ghost"
        >
          Manage it in the admin panel (code: {active.accessCode})
        </Link>
      </div>
    </div>
  );
}
