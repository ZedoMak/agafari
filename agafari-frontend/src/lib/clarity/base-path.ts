import { headers } from "next/headers";

/**
 * Tenant links are relative to whichever shell served the request: an empty
 * prefix when the site is on its own host, `/sites/{slug}` for the local
 * path shell. The middleware sets `x-clarity-base` in the host case.
 */
export async function resolveBasePath(slug: string) {
  const requestHeaders = await headers();
  const base = requestHeaders.get("x-clarity-base");
  return base === null ? `/sites/${encodeURIComponent(slug)}` : base;
}
