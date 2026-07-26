/**
 * Published demo tenants shown on the Agafari marketing site.
 *
 * Every entry is a synthetic organization running the Clarity template with its
 * own branding, wording, and content — seeded by
 * `agafari-backend/seed_saas_demo.py` and `seed_demo_sites.py`.
 */
export type DemoSite = {
  /** Template product id on Agafari */
  templateId: string;
  templateName: string;
  category: string;
  description: string;
  /** Organization slug / site path segment */
  slug: string;
  /** Full path to the isolated company site */
  siteHref: string;
  /** Label shown in the browser chrome */
  hostLabel: string;
  orgName: string;
  /** Admin panel access code for the demo */
  accessCode: string;
  /** Always true for current demos — marketing must say so */
  mockData: true;
};

function demoSite(
  site: Omit<DemoSite, "siteHref" | "hostLabel" | "mockData" | "templateName"> & {
    templateName?: string;
  },
): DemoSite {
  return {
    ...site,
    templateName: site.templateName ?? "Clarity",
    siteHref: `/sites/${site.slug}`,
    hostLabel: `${site.slug}.agafari.com`,
    mockData: true,
  };
}

export const HOPE_AID_DEMO = demoSite({
  templateId: "clarity",
  category: "NGO · Public programs",
  description:
    "Clarity in its default green: community programmes, a public assistant, policy updates, and feedback.",
  slug: "hope-aid",
  orgName: "Hope Aid Ethiopia",
  accessCode: "ngo-demo",
});

export const METRO_HEALTH_DEMO = demoSite({
  templateId: "vitals",
  category: "Healthcare · Clinic",
  description:
    "The same template in clinical teal, with visit preparation and laboratory guidance.",
  slug: "metro-health",
  orgName: "Metro Health Clinic",
  accessCode: "care-demo",
});

export const LUMEN_CITY_DEMO = demoSite({
  templateId: "civic",
  category: "Municipality · Permits",
  description:
    "Municipal navy, with permits and collection schedules and the wording changed to “City services”.",
  slug: "lumen-city",
  orgName: "Lumen City Services",
  accessCode: "civic-demo",
});

export const NORTHBRIDGE_DEMO = demoSite({
  templateId: "aurora",
  category: "Education · University",
  description:
    "Academic indigo, with admissions and fees content and every “service” renamed “programme”.",
  slug: "northbridge",
  orgName: "Northbridge University",
  accessCode: "campus-demo",
});

/** Demos currently available to embed / open from marketing. */
export const PUBLISHED_DEMOS: DemoSite[] = [
  HOPE_AID_DEMO,
  METRO_HEALTH_DEMO,
  LUMEN_CITY_DEMO,
  NORTHBRIDGE_DEMO,
];
