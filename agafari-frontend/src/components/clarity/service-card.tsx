import Link from "next/link";
import type { Service } from "@/lib/types";

export function ServiceCard({
  service,
  href,
  index = 0,
}: {
  service: Service;
  href: string;
  index?: number;
}) {
  return (
    <Link
      className="c-card c-rise"
      href={href}
      style={{ "--i": index } as React.CSSProperties}
    >
      <div className="c-card-top">
        <span className="c-badge c-badge-brand">{service.category}</span>
        {service.verification_status === "VERIFIED" && (
          <span className="c-badge c-badge-positive c-badge-dot">Verified</span>
        )}
      </div>
      <h3>{service.title}</h3>
      <p>{service.summary}</p>
      <div className="c-card-foot">
        <span>{service.processing_time}</span>
        <span className="c-card-cta">
          Details <span aria-hidden="true">→</span>
        </span>
      </div>
    </Link>
  );
}
