import type { ReactNode } from "react";
import { SiteFooter } from "@/components/clarity/site-footer";
import { SiteHeader } from "@/components/clarity/site-header";

export default function PublicSiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="c-main" id="main">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
