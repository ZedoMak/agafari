import type { AccessSession } from "@/lib/clarity/types";

export type StoredSession = {
  slug: string;
  token: string;
  expiresAt: string;
  organizationId: string;
};

const SESSION_EVENT = "clarity:session";
export const UNAUTHORIZED_EVENT = "clarity:unauthorized";

function storageKey(slug: string) {
  return `agafari.clarity.session.${slug}`;
}

/**
 * `useSyncExternalStore` requires a referentially stable snapshot, so parsed
 * sessions are cached until something writes to storage.
 */
const cache = new Map<string, StoredSession | null>();

function parse(slug: string): StoredSession | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(storageKey(slug));
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as StoredSession;
    if (!value?.token || !value?.expiresAt) return null;
    if (isExpired(value)) {
      window.sessionStorage.removeItem(storageKey(slug));
      return null;
    }
    return value;
  } catch {
    return null;
  }
}

export function isExpired(session: StoredSession) {
  const expiry = Date.parse(
    session.expiresAt.endsWith("Z") ? session.expiresAt : `${session.expiresAt}Z`,
  );
  return Number.isFinite(expiry) ? expiry <= Date.now() : false;
}

export function readSession(slug: string): StoredSession | null {
  if (!cache.has(slug)) cache.set(slug, parse(slug));
  return cache.get(slug) ?? null;
}

export function saveSession(slug: string, response: AccessSession): StoredSession {
  const session: StoredSession = {
    slug,
    token: response.access_token,
    expiresAt: response.expires_at,
    organizationId: response.organization_id,
  };
  window.sessionStorage.setItem(storageKey(slug), JSON.stringify(session));
  cache.set(slug, session);
  window.dispatchEvent(new CustomEvent(SESSION_EVENT, { detail: slug }));
  return session;
}

export function clearSession(slug: string) {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(storageKey(slug));
  cache.set(slug, null);
  window.dispatchEvent(new CustomEvent(SESSION_EVENT, { detail: slug }));
}

export function subscribeToSession(slug: string, listener: () => void) {
  const handle = (event: Event) => {
    if (event instanceof CustomEvent && event.detail !== slug) return;
    cache.delete(slug);
    listener();
  };
  window.addEventListener(SESSION_EVENT, handle);
  window.addEventListener("storage", handle);
  return () => {
    window.removeEventListener(SESSION_EVENT, handle);
    window.removeEventListener("storage", handle);
  };
}
