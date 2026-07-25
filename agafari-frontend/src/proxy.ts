import { NextResponse, type NextRequest } from "next/server";

/**
 * Tenant sites are isolated from the Agafari marketing site. They can be
 * reached two ways:
 *
 *   A. their own host — `hope-aid.agafari.com` (or `hope-aid.localhost:3000`),
 *      which is rewritten onto the tenant route tree while keeping clean URLs
 *   B. the path shell — `/sites/hope-aid`, used for local demos
 *
 * `x-clarity-base` tells the tenant layout which link prefix to render.
 */
const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "agafari.com";
const RESERVED_SUBDOMAINS = new Set(["www", "app", "api", "admin", "staging"]);

function tenantFromHost(host: string | null) {
  if (!host) return null;
  const hostname = host.split(":")[0].toLowerCase();
  const roots = [ROOT_DOMAIN, "localhost", "127.0.0.1"];
  for (const root of roots) {
    if (hostname === root || !hostname.endsWith(`.${root}`)) continue;
    const label = hostname.slice(0, -1 * (root.length + 1));
    if (!label || label.includes(".") || RESERVED_SUBDOMAINS.has(label)) return null;
    return label;
  }
  return null;
}

export default function proxy(request: NextRequest) {
  const tenant = tenantFromHost(request.headers.get("host"));
  if (!tenant) return NextResponse.next();

  const { pathname, search } = request.nextUrl;
  if (pathname.startsWith("/sites/")) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = `/sites/${tenant}${pathname === "/" ? "" : pathname}`;
  url.search = search;

  const headers = new Headers(request.headers);
  headers.set("x-clarity-base", "");
  headers.set("x-clarity-tenant", tenant);
  return NextResponse.rewrite(url, { request: { headers } });
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
