"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { terminologyOf, type Terminology } from "@/lib/clarity/brand";
import { joinPath } from "@/lib/clarity/href";
import type { Organization } from "@/lib/types";

type SiteContextValue = {
  organization: Organization;
  basePath: string;
  terminology: Terminology;
  href: (path: string) => string;
};

const SiteContext = createContext<SiteContextValue | null>(null);

export function SiteProvider({
  organization,
  basePath,
  children,
}: {
  organization: Organization;
  basePath: string;
  children: ReactNode;
}) {
  const value = useMemo<SiteContextValue>(
    () => ({
      organization,
      basePath,
      terminology: terminologyOf(organization),
      href: (path: string) => joinPath(basePath, path),
    }),
    [organization, basePath],
  );
  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export function useSite() {
  const value = useContext(SiteContext);
  if (!value) throw new Error("useSite must be used inside a tenant site layout");
  return value;
}