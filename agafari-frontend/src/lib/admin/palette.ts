import { buildBrandPalette } from "@/lib/clarity/brand";

/**
 * The admin panel is Agafari's own surface, so it keeps Agafari's palette while
 * the tenant's colours appear only where their organization is represented.
 */
export const ADMIN_PALETTE = buildBrandPalette({
  theme: { primary: "#126b50", accent: "#0ea5a4" },
}).variables;
