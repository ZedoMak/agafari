"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandMark } from "@/components/clarity/brand-mark";
import { useSite } from "@/components/clarity/site-context";

export function SiteHeader() {
  const { organization, terminology, href } = useSite();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 4);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { label: "Home", path: "/" },
    { label: terminology.plural, path: "/services" },
    { label: "Updates", path: "/updates" },
    { label: "About", path: "/about" },
    ...(organization.features.public_chat
      ? [{ label: "Ask AI", path: "/ask" }]
      : []),
    ...(organization.features.complaints
      ? [{ label: "Contact & feedback", path: "/support" }]
      : []),
  ];

  const isCurrent = (path: string) => {
    const target = href(path);
    return path === "/" ? pathname === target : pathname.startsWith(target);
  };

  return (
    <header className="c-header" data-stuck={stuck}>
      <div className="c-container">
        <div className="c-header-inner">
          <Link className="c-brand" href={href("/")}>
            <BrandMark organization={organization} />
            <span className="c-brand-text">
              <span className="c-brand-name">{organization.name}</span>
              <span className="c-brand-sub">{organization.sector}</span>
            </span>
          </Link>

          <nav className="c-nav" aria-label="Primary">
            {links.map((link) => (
              <Link
                key={link.path}
                href={href(link.path)}
                aria-current={isCurrent(link.path) ? "page" : undefined}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="c-header-actions">
            {organization.features.public_chat ? (
              <Link className="c-button c-button-primary" href={href("/ask")}>
                Ask a question
              </Link>
            ) : organization.contact.email ? (
              <a
                className="c-button c-button-secondary"
                href={`mailto:${organization.contact.email}`}
              >
                Contact us
              </a>
            ) : null}
            <button
              className="c-menu-toggle"
              aria-expanded={open}
              aria-controls="c-mobile-nav"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((value) => !value)}
            >
              <span />
            </button>
          </div>
        </div>

        <nav
          className="c-mobile-nav"
          id="c-mobile-nav"
          data-open={open}
          aria-label="Primary mobile"
        >
          {links.map((link) => (
            <Link
              key={link.path}
              href={href(link.path)}
              aria-current={isCurrent(link.path) ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
