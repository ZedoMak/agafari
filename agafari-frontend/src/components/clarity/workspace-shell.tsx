"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { BrandMark } from "@/components/clarity/brand-mark";
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
import { useSite } from "@/components/clarity/site-context";
import { endAccessSession } from "@/lib/clarity/client";
import {
  clearSession,
  readSession,
  subscribeToSession,
  UNAUTHORIZED_EVENT,
  type StoredSession,
} from "@/lib/clarity/session";

type WorkspaceContextValue = { token: string; session: StoredSession };

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function useWorkspace() {
  const value = useContext(WorkspaceContext);
  if (!value) throw new Error("useWorkspace must be used inside the workspace shell");
  return value;
}

function formatExpiry(expiresAt: string) {
  const date = new Date(expiresAt.endsWith("Z") ? expiresAt : `${expiresAt}Z`);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export function WorkspaceShell({ children }: { children: ReactNode }) {
  const { organization, terminology, href } = useSite();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const session = useSyncExternalStore(
    useCallback(
      (onChange: () => void) => subscribeToSession(organization.slug, onChange),
      [organization.slug],
    ),
    useCallback(() => readSession(organization.slug), [organization.slug]),
    () => null,
  );

  // The session lives in sessionStorage, so the server render never has it.
  // Waiting for the client snapshot avoids bouncing a signed-in staff member
  // back to the access screen during hydration.
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  useEffect(() => {
    if (hydrated && !session) router.replace(href("/access"));
  }, [hydrated, session, router, href]);

  useEffect(() => {
    const onUnauthorized = () => clearSession(organization.slug);
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, [organization.slug]);

  const nav = [
    { label: "Overview", path: "/workspace", icon: <OverviewIcon /> },
    { label: "Assistant", path: "/workspace/assistant", icon: <AssistantIcon /> },
    { label: "Documents", path: "/workspace/documents", icon: <DocumentsIcon /> },
    { label: terminology.plural, path: "/workspace/services", icon: <ServicesIcon /> },
  ];
  const listen = [
    { label: "Insights", path: "/workspace/insights", icon: <InsightsIcon /> },
    { label: "Complaints", path: "/workspace/complaints", icon: <ComplaintsIcon /> },
    {
      label: "Conversations",
      path: "/workspace/conversations",
      icon: <ConversationsIcon />,
    },
    { label: "Settings", path: "/workspace/settings", icon: <SettingsIcon /> },
  ];
  const everyLink = [...nav, ...listen];
  const current =
    everyLink
      .filter((item) => pathname === href(item.path))
      .at(0) ??
    everyLink.filter((item) => pathname.startsWith(href(item.path))).at(-1);

  async function signOut() {
    if (!session) return;
    setSigningOut(true);
    try {
      await endAccessSession(session.token);
    } catch {
      // The local session is cleared either way.
    }
    clearSession(organization.slug);
    router.replace(href("/access"));
  }

  if (!hydrated || !session) {
    return (
      <div
        style={{
          minHeight: "100dvh",
          display: "grid",
          placeItems: "center",
          padding: "2rem",
        }}
      >
        <p className="c-muted c-small">Checking your access…</p>
      </div>
    );
  }

  const expiry = formatExpiry(session.expiresAt);

  const renderLink = (item: { label: string; path: string; icon: ReactNode }) => (
    <Link
      key={item.path}
      className="c-sidebar-link"
      href={href(item.path)}
      aria-current={current?.path === item.path ? "page" : undefined}
      onClick={() => setMenuOpen(false)}
    >
      {item.icon}
      {item.label}
    </Link>
  );

  return (
    <WorkspaceContext.Provider value={{ token: session.token, session }}>
      <div className="c-workspace">
        {menuOpen && (
          <div
            className="c-scrim"
            role="presentation"
            onClick={() => setMenuOpen(false)}
          />
        )}

        <aside className="c-sidebar" data-open={menuOpen}>
          <div className="c-sidebar-brand">
            <BrandMark organization={organization} />
            <span className="c-brand-text">
              <span className="c-brand-name">{organization.name}</span>
              <span className="c-brand-sub">Workspace</span>
            </span>
          </div>

          {nav.map(renderLink)}
          <div className="c-sidebar-group">Listen &amp; improve</div>
          {listen.map(renderLink)}

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
              <strong>{current?.label ?? "Workspace"}</strong>
              <span>{organization.name}</span>
            </div>
            <div className="c-topbar-actions">
              <Link
                className="c-button c-button-ghost c-button-sm"
                href={href("/")}
                target="_blank"
                rel="noreferrer"
              >
                <span style={{ width: 14, height: 14, display: "inline-flex" }}>
                  <ExternalIcon />
                </span>
                Public site
              </Link>
            </div>
          </header>

          <div className="c-work-content">{children}</div>
        </div>
      </div>
    </WorkspaceContext.Provider>
  );
}
