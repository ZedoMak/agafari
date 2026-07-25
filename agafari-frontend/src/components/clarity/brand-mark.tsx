import { organizationInitials } from "@/lib/clarity/brand";
import type { Organization } from "@/lib/types";

export function BrandMark({
  organization,
  size = "md",
}: {
  organization: Organization;
  size?: "md" | "lg";
}) {
  return (
    <span
      className={`c-brand-mark${size === "lg" ? " c-brand-mark-lg" : ""}`}
      aria-hidden="true"
    >
      {organization.logo_url ? (
        // eslint-disable-next-line @next/next/no-img-element -- tenant logos are arbitrary remote URLs
        <img src={organization.logo_url} alt="" />
      ) : (
        organizationInitials(organization.name)
      )}
    </span>
  );
}
