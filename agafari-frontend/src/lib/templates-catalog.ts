export type TemplateCatalogItem = {
  id: string;
  name: string;
  category: string;
  description: string;
  accent: string;
  accentSoft: string;
  previewHref: string;
  useHref: string;
  live?: boolean;
};

/** Marketing catalog — Clarity/Pulse have live demos; others invite subscribe. */
export const TEMPLATE_CATALOG: TemplateCatalogItem[] = [
  {
    id: "clarity",
    name: "Clarity",
    category: "NGO",
    description:
      "Calm, trust-first layout for programs, eligibility, and public guidance.",
    accent: "#126b50",
    accentSoft: "#dff1e9",
    previewHref: "/organizations/hope-aid",
    useHref: "/partner?template=clarity",
    live: true,
  },
  {
    id: "pulse",
    name: "Pulse",
    category: "Business",
    description:
      "Dense support-forward site for high-volume questions and service status.",
    accent: "#195ca8",
    accentSoft: "#eaf2fb",
    previewHref: "/organizations",
    useHref: "/partner?template=pulse",
    live: true,
  },
  {
    id: "campus",
    name: "Campus",
    category: "Education",
    description:
      "Admissions, fees, and student services with clear guided answers.",
    accent: "#0f6a62",
    accentSoft: "#e4f5f2",
    previewHref: "/templates#campus",
    useHref: "/partner?template=campus",
  },
  {
    id: "care",
    name: "Care",
    category: "Healthcare",
    description:
      "Appointments, preparation steps, and clinic information patients can trust.",
    accent: "#0d6e8a",
    accentSoft: "#e5f4f8",
    previewHref: "/templates#care",
    useHref: "/partner?template=care",
  },
  {
    id: "civic",
    name: "Civic",
    category: "Government",
    description:
      "Procedures, requirements, and office guidance for residents.",
    accent: "#1f4d7a",
    accentSoft: "#e8eef6",
    previewHref: "/templates#civic",
    useHref: "/partner?template=civic",
  },
  {
    id: "atlas",
    name: "Atlas",
    category: "University",
    description:
      "Departments, registration, and campus policies in one polished portal.",
    accent: "#4a3f8c",
    accentSoft: "#eeebf8",
    previewHref: "/templates#atlas",
    useHref: "/partner?template=atlas",
  },
  {
    id: "borough",
    name: "Borough",
    category: "Municipality",
    description:
      "Local services, permits, and community updates for city websites.",
    accent: "#2f6b3a",
    accentSoft: "#e8f3ea",
    previewHref: "/templates#borough",
    useHref: "/partner?template=borough",
  },
  {
    id: "counsel",
    name: "Counsel",
    category: "Legal",
    description:
      "Practice areas, intake guidance, and document-backed client answers.",
    accent: "#5c4630",
    accentSoft: "#f4efe5",
    previewHref: "/templates#counsel",
    useHref: "/partner?template=counsel",
  },
];
