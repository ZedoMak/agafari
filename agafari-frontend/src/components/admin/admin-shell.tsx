"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { SiteProvider } from "@/components/clarity/site-context";
import { UpdatesIcon } from "@/components/admin/admin-icons";
import {
  AssistantIcon,
  ComplaintsIcon,
  ConversationsIcon,
  DocumentsIcon,
  ExternalIcon,
  InsightsIcon,
  OverviewIcon,
  ServicesIcon,
  SettingsIcon,
} from "@/components/clarity/icons";
import { getOrganization } from "@/lib/api";
import { endAccessSession } from "@/lib/clarity/client";
import { UNAUTHORIZED_EVENT } from "@/lib/clarity/session";
import { terminologyOf } from "@/lib/clarity/brand";
import { useAsync } from "@/lib/clarity/use-async";
import {
  clearAdminSession,
  readAdminSession,
  subscribeToAdminSession,
  type AdminSession,
} from "@/lib/admin/session";
import type { Organization } from "@/lib/types";

type AdminContextValue = {
  token: string;
  session: AdminSession;
  organization: Organization;
  reloadOrganization: () => void;
};

const AdminContext = createContext<AdminContextValue | null>(null);

export function useAdmin() {
  const value = useContext(AdminContext);
  if (!value) throw new Error("useAdmin must be used inside the admin shell");
  return value;
}

function formatExpiry(expiresAt: string) {
  const date = new Date(expiresAt.endsWith("Z") ? expiresAt : `${expiresAt}Z`);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export function AdminShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const session = useSyncExternalStore(
    subscribeToAdminSession,
    readAdminSession,
    () => null,
  );

  // The session lives in sessionStorage, so the server render never sees it.
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const slug = session?.slug ?? "";
  const organizationState = useAsync(
    () =>
      slug
        ? getOrganization(slug)
        : Promise.reject(new Error("No organization in session")),
    [slug],
  );
  const organization = organizationState.data;

  useEffect(() => {
    // Carries ?org= through, so a "staff sign in" link from a tenant site lands
    // on the right organization.
    if (hydrated && !session) router.replace(`/admin/login${window.location.search}`);
  }, [hydrated, session, router]);

  useEffect(() => {
    const onUnauthorized = () => clearAdminSession();
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, []);

  if (!hydrated || !session) {
    return (
      <div className="admin-boot">
        <p className="c-muted c-small">Checking your access…</p>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="admin-boot">
        {organizationState.error ? (
          <div className="c-empty">
            <h3>Organization unavailable</h3>
            <p>We could not load {session.organizationName}. Check the API and retry.</p>
            <button
              className="c-button c-button-secondary c-button-sm"
              onClick={organizationState.reload}
            >
              Try again
            </button>
          </div>
        ) : (
          <p className="c-muted c-small">Loading {session.organizationName}…</p>
        )}
      </div>
    );
  }

  const words = terminologyOf(organization);
  const siteHref = `/sites/${organization.slug}`;

  const manage = [
    { label: "Overview", path: "/admin", icon: <OverviewIcon /> },
    { label: words.plural, path: "/admin/services", icon: <ServicesIcon /> },
    { label: "Knowledge", path: "/admin/documents", icon: <DocumentsIcon /> },
    { label: "Updates", path: "/admin/updates", icon: <UpdatesIcon /> },
  ];
  const operate = [
    { label: "Staff assistant", path: "/admin/assistant", icon: <AssistantIcon /> },
    { label: "Conversations", path: "/admin/conversations", icon: <ConversationsIcon /> },
    { label: "Complaints", path: "/admin/complaints", icon: <ComplaintsIcon /> },
    { label: "Insights", path: "/admin/insights", icon: <InsightsIcon /> },
    { label: "Site settings", path: "/admin/settings", icon: <SettingsIcon /> },
  ];
  const everyLink = [...manage, ...operate];
  const current =
    everyLink.find((item) => pathname === item.path) ??
    everyLink.filter((item) => pathname.startsWith(item.path)).at(-1);

  async function signOut() {
    if (!session) return;
    setSigningOut(true);
    try {
      await endAccessSession(session.token);
    } catch {
      // The local session is cleared either way.
    }
    clearAdminSession();
    router.replace("/admin/login");
  }

  const expiry = formatExpiry(session.expiresAt);

  const renderLink = (item: { label: string; path: string; icon: ReactNode }) => (
    <Link
      key={item.path}
      className="c-sidebar-link"
      href={item.path}
      aria-current={current?.path === item.path ? "page" : undefined}
      onClick={() => setMenuOpen(false)}
    >
      {item.icon}
      {item.label}
    </Link>
  );

  return (
    <AdminContext.Provider
      value={{
        token: session.token,
        session,
        organization,
        reloadOrganization: organizationState.reload,
      }}
    >
      <SiteProvider organization={organization} basePath={siteHref}>
        <div className="c-workspace admin-workspace">
          {menuOpen && (
            <div
              className="c-scrim"
              role="presentation"
              onClick={() => setMenuOpen(false)}
            />
          )}

          <aside className="c-sidebar" data-open={menuOpen}>
            <div className="admin-brand">
              <span className="admin-wordmark">አጋፋሪ</span>
              <span className="admin-brand-sub">Admin panel</span>
            </div>

            <div className="admin-org">
              <span
                className="admin-org-dot"
                style={{ background: organization.theme?.primary ?? "#126b50" }}
                aria-hidden="true"
              />
              <span className="admin-org-text">
                <b>{organization.name}</b>
                <span>{organization.slug}.agafari.com</span>
              </span>
            </div>

            {manage.map(renderLink)}
            <div className="c-sidebar-group">Operate</div>
            {operate.map(renderLink)}

            <div className="c-sidebar-foot">
              <div className="c-session-chip">
                <span>
                  Session ends <b>{expiry ?? "today"}</b>
                </span>
              </div>
              <button
                className="c-button c-button-secondary c-button-sm"
                onClick={() => void signOut()}
                disabled={signingOut}
              >
                {signingOut ? "Signing out…" : "Sign out"}
              </button>
            </div>
          </aside>

          <div className="c-work-main">
            <header className="c-topbar">
              <button
                className="c-menu-toggle"
                aria-expanded={menuOpen}
                aria-label={menuOpen ? "Close navigation" : "Open navigation"}
                onClick={() => setMenuOpen((value) => !value)}
              >
                <span />
              </button>
              <div className="c-topbar-title">
                <strong>{current?.label ?? "Overview"}</strong>
                <span>Managing {organization.name}</span>
              </div>
              <div className="c-topbar-actions">
                <Link
                  className="c-button c-button-ghost c-button-sm"
                  href={siteHref}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span style={{ width: 14, height: 14, display: "inline-flex" }}>
                    <ExternalIcon />
                  </span>
                  View live site
                </Link>
              </div>
            </header>

            <div className="c-work-content">{children}</div>
          </div>
        </div>
      </SiteProvider>
    </AdminContext.Provider>
  );
}
