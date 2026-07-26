import type { Metadata } from "next";
import { Source_Serif_4 } from "next/font/google";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { SiteProvider } from "@/components/clarity/site-context";
import { getOrganization } from "@/lib/api";
import { resolveBasePath } from "@/lib/clarity/base-path";
import { buildBrandPalette } from "@/lib/clarity/brand";
import "../clarity.css";

const display = Source_Serif_4({
  variable: "--font-clarity-display",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const dynamic = "force-dynamic";

type LayoutProps = {
  children: ReactNode;
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const organization = await getOrganization(slug);
    return {
      title: {
        absolute: organization.name,
        template: `%s · ${organization.name}`,
      },
      description:
        organization.description ??
        `Information, programs, and support from ${organization.name}.`,
      openGraph: {
        title: organization.name,
        description: organization.description ?? undefined,
        type: "website",
      },
    };
  } catch {
    return { title: "Site unavailable" };
  }
}

export default async function TenantLayout({ children, params }: LayoutProps) {
  const { slug } = await params;
  const [organization, basePath] = await Promise.all([
    getOrganization(slug).catch(() => null),
    resolveBasePath(slug),
  ]);
  if (!organization) notFound();

  const palette = buildBrandPalette(organization);

  return (
    <div className={`clarity ${display.variable}`} style={palette.variables}>
      <SiteProvider organization={organization} basePath={basePath}>
        {children}
      </SiteProvider>
    </div>
  );
}
