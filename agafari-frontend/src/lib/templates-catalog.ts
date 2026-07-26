import {
  HOPE_AID_DEMO,
  LUMEN_CITY_DEMO,
  METRO_HEALTH_DEMO,
  NORTHBRIDGE_DEMO,
  type DemoSite,
} from "@/lib/demo-sites";

/** Layout personality used by the gallery mockups. */
export type TemplateVariant =
  | "centered"
  | "editorial"
  | "booking"
  | "portal"
  | "columns"
  | "support";

export type TemplateStatus = "live" | "design";

export type TemplateCatalogItem = {
  id: string;
  name: string;
  category: string;
  tagline: string;
  description: string;
  features: string[];
  variant: TemplateVariant;
  surface: "light" | "tint" | "sand" | "dark";
  accent: string;
  accentSoft: string;
  /**
   * `live` = a real site you can open and use (Clarity → Hope Aid).
   * `design` = visual design only; no working site behind it yet.
   */
  status: TemplateStatus;
  useHref: string;
  demo?: DemoSite;
};

export const TEMPLATE_CATALOG: TemplateCatalogItem[] = [
  {
    id: "clarity",
    name: "Clarity",
    category: "NGO & public programs",
    tagline: "Calm, trust-first layout with a guided assistant",
    description:
      "Spacious programme catalogue, an ask box in the hero, and citations kept visible. Built for organizations whose visitors need reassurance as much as answers.",
    features: [
      "Ask box in the hero",
      "Spacious programme cards",
      "Citation-forward answers",
      "Feedback and complaint intake",
    ],
    variant: "centered",
    surface: "tint",
    accent: "#126b50",
    accentSoft: "#dff1e9",
    status: "live",
    useHref: "/partner?template=clarity",
    demo: HOPE_AID_DEMO,
  },
  {
    id: "aurora",
    name: "Aurora",
    category: "Education & universities",
    tagline: "Editorial split hero for admissions and student services",
    description:
      "Large typographic hero with a study-path rail. Suits schools and universities that publish many programmes and deadlines side by side.",
    features: [
      "Editorial split hero",
      "Programme rail with deadlines",
      "Student vs staff entry points",
      "Deadline and intake highlights",
    ],
    variant: "editorial",
    surface: "light",
    accent: "#4c3fa8",
    accentSoft: "#ebe9fb",
    status: "live",
    useHref: "/partner?template=aurora",
    demo: NORTHBRIDGE_DEMO,
  },
  {
    id: "vitals",
    name: "Vitals",
    category: "Healthcare & clinics",
    tagline: "Appointment-first layout with preparation guidance",
    description:
      "Booking panel beside plain-language preparation steps, so patients can act and ask in the same view.",
    features: [
      "Appointment panel above the fold",
      "Preparation checklists",
      "Department directory",
      "Visit-scoped assistant",
    ],
    variant: "booking",
    surface: "tint",
    accent: "#0d7490",
    accentSoft: "#e2f3f8",
    status: "live",
    useHref: "/partner?template=vitals",
    demo: METRO_HEALTH_DEMO,
  },
  {
    id: "civic",
    name: "Civic",
    category: "Government & municipal",
    tagline: "Formal service portal with notices and dense directory",
    description:
      "Utility bar, notice strip, and a compact service grid — the shape residents already expect from an official site.",
    features: [
      "Utility bar and notices",
      "Dense service directory",
      "Office and hours blocks",
      "Procedure-scoped answers",
    ],
    variant: "portal",
    surface: "light",
    accent: "#1f4d7a",
    accentSoft: "#e7eef7",
    status: "live",
    useHref: "/partner?template=civic",
    demo: LUMEN_CITY_DEMO,
  },
  {
    id: "ledger",
    name: "Ledger",
    category: "Finance & legal",
    tagline: "Document-forward layout with a quiet, serious tone",
    description:
      "Two-column document list next to an expandable question set. For teams whose answers must sit next to the paperwork.",
    features: [
      "Document-forward columns",
      "Expandable question set",
      "Fee and eligibility tables",
      "Source-linked responses",
    ],
    variant: "columns",
    surface: "sand",
    accent: "#7a5a12",
    accentSoft: "#f6efdf",
    status: "design",
    useHref: "/partner?template=ledger",
  },
  {
    id: "pulse",
    name: "Pulse",
    category: "Telecom & support ops",
    tagline: "Dark, status-led layout where chat does the work",
    description:
      "Service status rows with a dominant assistant panel. Suits high-volume support where deflection matters more than browsing.",
    features: [
      "Service status rows",
      "Assistant dominant on entry",
      "Ticket and complaint intake",
      "Dark interface by default",
    ],
    variant: "support",
    surface: "dark",
    accent: "#4f9fe8",
    accentSoft: "#12233a",
    status: "design",
    useHref: "/partner?template=pulse",
  },
];

export function getTemplate(id: string): TemplateCatalogItem | undefined {
  return TEMPLATE_CATALOG.find((item) => item.id === id);
}

export const DESIGN_TEMPLATES = TEMPLATE_CATALOG.filter(
  (item) => item.status === "design",
);

export const LIVE_TEMPLATES = TEMPLATE_CATALOG.filter(
  (item) => item.status === "live",
);
