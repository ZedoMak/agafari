import Link from "next/link";
import type { DemoSite } from "@/lib/demo-sites";

type SiteEmbedProps = {
  site: DemoSite;
  /** Taller frame for the templates gallery */
  size?: "default" | "large";
  className?: string;
};

/**
 * Embeds an isolated company site inside marketing chrome.
 * Interaction opens the real site route — the company experience is not
 * re-implemented on Agafari’s marketing pages.
 */
export function SiteEmbed({
  site,
  size = "default",
  className = "",
}: SiteEmbedProps) {
  return (
    <div
      className={`site-embed ${size === "large" ? "site-embed-large" : ""} ${className}`.trim()}
    >
      <div className="site-embed-chrome">
        <div className="site-embed-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <span className="site-embed-url">{site.hostLabel}</span>
        <span className="site-embed-mock">Mock demo data</span>
      </div>

      <div className="site-embed-stage">
        <iframe
          title={`${site.orgName} — ${site.templateName} demo (mock data)`}
          src={site.siteHref}
          className="site-embed-frame"
          loading="lazy"
          referrerPolicy="same-origin"
        />
        <Link
          href={site.siteHref}
          className="site-embed-hit"
          aria-label={`Open ${site.orgName} site demo at ${site.siteHref}`}
        >
          <span className="site-embed-hit-chip">Mock site · click to open</span>
          <span className="site-embed-hit-label">
            Open full site <span aria-hidden="true">→</span>
          </span>
        </Link>
      </div>

      <p className="site-embed-footnote">
        This is a <strong>mock organization</strong> on the {site.templateName}{" "}
        template—synthetic data for product demo only. Click the preview to open{" "}
        <Link href={site.siteHref}>{site.siteHref}</Link>.
      </p>
    </div>
  );
}
