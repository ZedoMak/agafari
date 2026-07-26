/**
 * Admin panel session.
 *
 * Management lives on Agafari's own domain, so unlike the tenant site there is
 * a single active organization per browser tab: whichever one the operator
 * signed into.
 */

import type { AccessSession } from "@/lib/clarity/types";

export type AdminSession = {
  slug: string;
  token: string;
  expiresAt: string;
  organizationId: string;
  organizationName: string;
};

const STORAGE_KEY = "agafari.admin.session";
const SESSION_EVENT = "agafari:admin-session";

let cache: AdminSession | null | undefined;

function isExpired(session: AdminSession) {
  const raw = session.expiresAt.endsWith("Z")
    ? session.expiresAt
    : `${session.expiresAt}Z`;
  const expiry = Date.parse(raw);
  return Number.isFinite(expiry) ? expiry <= Date.now() : false;
}

function parse(): AdminSession | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as AdminSession;
    if (!value?.token || !value?.slug || !value?.expiresAt) return null;
    if (isExpired(value)) {
      window.sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return value;
  } catch {
    return null;
  }
}

/** `useSyncExternalStore` needs a stable snapshot, so parses are cached. */
export function readAdminSession(): AdminSession | null {
  if (cache === undefined) cache = parse();
  return cache;
}

export function saveAdminSession(
  slug: string,
  organizationName: string,
  response: AccessSession,
): AdminSession {
  const session: AdminSession = {
    slug,
    token: response.access_token,
    expiresAt: response.expires_at,
    organizationId: response.organization_id,
    organizationName,
  };
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  cache = session;
  window.dispatchEvent(new CustomEvent(SESSION_EVENT));
  return session;
}

export function clearAdminSession() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(STORAGE_KEY);
  cache = null;
  window.dispatchEvent(new CustomEvent(SESSION_EVENT));
}

export function subscribeToAdminSession(listener: () => void) {
  const handle = () => {
    cache = undefined;
    listener();
  };
  window.addEventListener(SESSION_EVENT, handle);
  window.addEventListener("storage", handle);
  return () => {
    window.removeEventListener(SESSION_EVENT, handle);
    window.removeEventListener("storage", handle);
  };
}
